'use babel';

import { CompositeDisposable, Emitter } from 'atom';
import path from 'path';
import os from 'os';
import fs from 'fs-extra';
import _ from 'underscore-plus';
import chokidar from 'chokidar';
import tmp from 'tmp';
import cmp from 'semver-compare';
import helper from './helper';
import indexing from './indexing';

export default class Core {
  constructor() {
    this.subscriptions = new CompositeDisposable();
    this.watchers = {};
    this.useWorker = false;
    if (!this.useWorker) {
      const IndexerWorker = require('./indexer-worker');
      this.indexer = new IndexerWorker();
      this.indexer.start(getConfig());
    } else {
      const child_process = require('child_process');
      this.emitter = new Emitter();
      // this.indexer = new Worker(path.join(__dirname, 'indexer-worker.js'));
      this.indexer = child_process.fork(
        path.join(__dirname, 'indexer-node-worker.js'),
        [],
        {
          silent: true,
        }
      );
      helper.getIndexerCmds().forEach(message => {
        this.indexer[
          'on' + message.charAt(0).toUpperCase() + message.slice(1)
        ] = callback => {
          return this.emitter.on(message, callback);
        };
      });
      helper.getIndexerSubs().forEach(message => {
        this.indexer[message] = data => {
          this.indexer.send({ type: message, data });
        };
      });
      this.indexer.on('message', ({ type, data }) => {
        this.emitter.emit(type, data);
      });
      this.indexer.on('exit', code => {
        helper.debugLog('Indexer process exited: ' + code);
      });
      this.indexer.on('uncaughtException', err => {
        helper.debugLog('Indexer process uncaught exception: ' + err);
      });
      this.indexer.on('warning', warning => {
        helper.debugLog('Indexer process warning: ' + warning);
      });
      this.indexer.send({
        type: 'start',
        data: { cmds: helper.getIndexerCmds(), config: getConfig() },
      });
    }

    this.indexer.onDocsDownloaded(dependenciesAndJson => {
      const editor = atom.workspace.getActiveTextEditor();
      if (helper.isElmEditor(editor)) {
        indexing.sendActiveFile(this.indexer, editor);
      }
      const configCacheDirectory = atom.config
        .get('elmjutsu.cacheDirectory')
        .trim();
      let cacheDirectory;
      if (configCacheDirectory === '') {
        cacheDirectory = tmp.dirSync({ prefix: 'elmjutsu' }).name;
        atom.config.set('elmjutsu.cacheDirectory', cacheDirectory);
      } else {
        cacheDirectory = configCacheDirectory;
      }
      dependenciesAndJson.forEach(([[packageName, version], jsonString]) => {
        const docsFilePath = getElmjutsuDocsFilePath(
          cacheDirectory,
          packageName,
          version
        );
        // No need to use the `-Sync` functions here.
        fs.ensureFile(docsFilePath, err => {
          if (err) {
            return helper.debugLog(
              'Failed to write ' + docsFilePath + '(' + err + ')',
              'red'
            );
          }
          fs.writeFile(docsFilePath, jsonString, err => {
            if (err) {
              return helper.debugLog(
                'Failed to write ' + docsFilePath + '(' + err + ')',
                'red'
              );
            }
            helper.debugLog('Wrote ' + docsFilePath, 'green');
          });
        });
      });
    });

    this.indexer.onDownloadDocsFailed(data => {
      helper.debugLog('Failed to download package docs:\n' + data);
    });

    this.indexer.onDependenciesNotFound(
      ([projectDirectories, notFoundDependencies]) => {
        // If there are package dependencies not found in the official repository, parse the associated directories in `elm-stuff/packages`.
        projectDirectories.forEach(projectDirectory => {
          notFoundDependencies.forEach(([packageName, version]) => {
            const packageDirectory = path.resolve(
              projectDirectory,
              'elm-stuff',
              'packages',
              packageName,
              version
            );
            const elmPackageJsonFilePath = path.resolve(
              packageDirectory,
              'elm-package.json'
            );
            if (fs.existsSync(elmPackageJsonFilePath)) {
              const sourceDirectories = getSourceDirectories(
                elmPackageJsonFilePath
              );
              helper.debugLog(
                'Parsing elm-stuff package directory ' +
                  packageDirectory +
                  '...'
              );
              sourceDirectories.forEach(sourceDirectory => {
                const directory = path.resolve(
                  packageDirectory,
                  sourceDirectory
                );
                indexing.parseDirectoryFiles(
                  this.indexer,
                  projectDirectory,
                  directory
                );
              });
              helper.debugLog(
                'Parsed elm-stuff package directory ' + packageDirectory,
                'green'
              );
            }
          });
        });
      }
    );

    this.indexer.onReadPackageDocs(([missingDependencies, elmVersion]) => {
      let readDependencyJsonStrings = [];

      if (cmp(elmVersion, '0.19.0') >= 0) {
        missingDependencies.forEach(dependency => {
          const [packageName, version] = dependency;
          const docsFilePath = getElmDocsFilePath(
            packageName,
            version,
            elmVersion
          );
          helper.debugLog('Reading ' + docsFilePath + '...');
          let jsonString = null;
          try {
            jsonString = fs.readFileSync(docsFilePath).toString();
          } catch (exception) {}
          if (jsonString) {
            helper.debugLog('Read ' + docsFilePath, 'green');
            const convertedJsonString = convertDocsJsonStringToElm0_18_0(
              jsonString
            );
            readDependencyJsonStrings.push([dependency, convertedJsonString]);
          }
        });
      } else {
        // For Elm version <= 0.18.0:
        const elmjutsuCacheDirectory = atom.config
          .get('elmjutsu.cacheDirectory')
          .trim();
        const unreadDependencies = missingDependencies.filter(dependency => {
          const [packageName, version] = dependency;
          const docsFilePath = getElmjutsuDocsFilePath(
            elmjutsuCacheDirectory,
            packageName,
            version
          );
          helper.debugLog('Reading ' + docsFilePath + '...');
          let jsonString = null;
          try {
            jsonString = fs.readFileSync(docsFilePath).toString();
          } catch (exception) {}
          if (jsonString) {
            helper.debugLog('Read ' + docsFilePath, 'green');
            const convertedJsonString = convertDocsJsonStringToElm0_18_0(
              jsonString
            );
            readDependencyJsonStrings.push([dependency, convertedJsonString]);
            return false;
          }
          return true;
        });

        if (unreadDependencies.length > 0) {
          // Download `docs.json` files from https://package.elm-lang.org.
          const unreadDependenciesString = unreadDependencies
            .map(([packageName, version]) => {
              return packageName + '/' + version;
            })
            .join(', ');
          helper.debugLog(
            'Downloading missing package docs (' +
              unreadDependenciesString +
              ')...'
          );
          this.indexer.downloadMissingPackageDocs(unreadDependencies);
        }
      }

      this.indexer.docsRead([readDependencyJsonStrings, elmVersion]);
    });

    this.autocompleteActive = {};
    this.sendTokenDebouncer = null;
    // Not using `atom.workspace.observeTextEditors` here to also observe the text editor created for `Pipe Selections`.
    this.subscriptions.add(
      atom.textEditors.observe(editor => {
        if (helper.isElmEditor(editor)) {
          // this.ensureWatchProject(this.indexer, editor);
          let editorSubscriptions = new CompositeDisposable();
          editorSubscriptions.add(
            editor.onDidChangeCursorPosition(({ cursor }) => {
              if (cursor !== editor.getLastCursor()) {
                return;
              }
              if (this.sendTokenDebouncer) {
                clearTimeout(this.sendTokenDebouncer);
              }
              this.sendTokenDebouncer = setTimeout(() => {
                if (!this.autocompleteActive[editor.id]) {
                  // Only send active token or inference if nothing is selected.
                  let selectedRange = editor.getSelectedBufferRange();
                  if (selectedRange.isEmpty()) {
                    const inference = this.inferTypes.getInferenceAtPosition(
                      editor
                    );
                    if (inference) {
                      indexing.sendEnteredInference(this.indexer, inference);
                    } else {
                      helper.unsetActiveTopLevel(editor);
                      indexing.sendActiveToken(this.indexer, editor);
                    }
                  }
                }
              }, 300);
            })
          );
          editorSubscriptions.add(
            editor.onDidStopChanging(() => {
              if (editor.isPipeSelectionsEditor) {
                indexing.sendActiveToken(this.indexer, editor);
              } else if (!this.autocompleteActive[editor.id]) {
                this.inferTypes.clearCursorInference();
                // TODO: helper.unsetActiveTopLevel(editor);
                indexing.sendActiveTextAndToken(this.indexer, editor);
              }
            })
          );
          editorSubscriptions.add(
            editor.onDidDestroy(() => {
              editorSubscriptions.dispose();
              // Revert to the text saved in file, if it still exists.
              if (fs.existsSync(editor.getPath())) {
                indexing.sendFileContentsChanged(
                  this.indexer,
                  editor.getPath()
                );
              }
              helper.unsetProjectDirectory(editor);
              helper.unsetActiveTopLevel(editor);
            })
          );
          this.subscriptions.add(editorSubscriptions);
        }
      })
    );
    this.subscriptions.add(
      atom.workspace.observeActivePaneItem(item => {
        if (item && helper.isElmEditor(item)) {
          const editor = item;
          this.ensureWatchProject(this.indexer, editor);
          indexing.sendActiveFile(this.indexer, editor);
        }
      })
    );
    // Update right away on package activate.
    setTimeout(() => {
      const editor = atom.workspace.getActiveTextEditor();
      if (editor && helper.isElmEditor(editor)) {
        indexing.sendActiveFile(this.indexer, editor);
      }
    }, 0);
    [
      'elmjutsu.showAliasesOfTypesInSidekick',
      'elmjutsu.showAliasesOfTypesInTooltip',
    ].forEach(configKey => {
      this.subscriptions.add(
        atom.config.observe(configKey, () => {
          this.indexer.configChanged(getConfig());
        })
      );
    });
  }

  setInferTypes(inferTypes) {
    this.inferTypes = inferTypes;
  }

  setElmMakeRunner(elmMakeRunner) {
    this.elmMakeRunner = elmMakeRunner;
  }

  setAutocompleteActive(editor, isActive) {
    this.autocompleteActive[editor.id] = isActive;
  }

  destroy() {
    if (this.useWorker && this.indexer) {
      this.indexer.send({ type: 'exit', data: {} });
    }
    this.autocompleteActive = null;
    if (this.sendTokenDebouncer) {
      clearTimeout(this.sendTokenDebouncer);
      this.sendTokenDebouncer = null;
    }
    this.subscriptions.dispose();
    this.subscriptions = null;
    _.values(this.watchers).forEach(watcher => {
      watcher.close();
    });
    this.watchers = null;
  }

  getIndexer() {
    return this.indexer;
  }

  ensureWatchProject(indexer, editor) {
    const filePath = editor.getPath();
    if (!filePath) {
      return;
    }

    const projectDirectory = helper.getProjectDirectory(filePath);
    if (!projectDirectory) {
      return;
    }

    if (this.watchers[projectDirectory]) {
      // Watcher already exists.
      return;
    }

    setTimeout(() => {
      indexing.sendProjectDependencies(
        indexer,
        projectDirectory,
        this.getWorkDirectory(filePath) || projectDirectory
      );
    }, 0);

    const sourceDirectories = getSourceDirectories(
      path.join(projectDirectory, 'elm.json')
    ) ||
      getSourceDirectories(path.join(projectDirectory, 'elm-package.json')) || [
        '.',
      ];
    helper.debugLog('Parsing project directory ' + projectDirectory + '...');
    sourceDirectories.forEach(sourceDirectory => {
      const directory = path.resolve(projectDirectory, sourceDirectory);
      indexing.parseDirectoryFiles(indexer, projectDirectory, directory);
    });
    helper.debugLog('Parsed project directory ' + projectDirectory, 'green');

    // Chokidar takes care of converting from `/` to `\` for Windows.
    let watcher = chokidar.watch(
      [
        'elm-stuff/exact-dependencies.json',
        'elm.json',
        'elm-package.json',
        '**/*.elm',
      ],
      {
        cwd: projectDirectory,
        // usePolling: true, interval: 100, useFsEvents: true,
        usePolling: false,
        interval: 1000,
        persistent: true,
        ignored: [
          'elm-stuff/packages/**',
          'elm-stuff/build-artifacts/**',
          'node_modules/**/*',
        ],
        ignoreInitial: true,
        followSymlinks: false,
        alwaysStat: false,
        depth: undefined,
        // awaitWriteFinish: {stabilityThreshold: 500, pollInterval: 100},
        ignorePermissionErrors: false,
        atomic: false,
      }
    );
    this.watchers[projectDirectory] = watcher;
    watcher.on('change', filename => {
      const filePath = path.join(projectDirectory, filename);
      helper.debugLog('`change` detected - ' + filePath);
      if (
        filename === 'elm-stuff' + path.sep + 'exact-dependencies.json' ||
        filename === 'elm.json' ||
        filename === 'elm-package.json'
      ) {
        indexing.sendProjectDependencies(
          indexer,
          projectDirectory,
          this.getWorkDirectory(filePath) || projectDirectory
        );
      } else {
        // We still need this even if we're already parsing on the editor level
        // since the files can be changed outside Atom:
        indexing.sendFileContentsChanged(indexer, filePath);
      }
    });
    watcher.on('add', filename => {
      const filePath = path.join(projectDirectory, filename);
      helper.debugLog('`add` detected - ' + filePath);
      if (
        filename === 'elm-stuff' + path.sep + 'exact-dependencies.json' ||
        filename === 'elm.json' ||
        filename === 'elm-package.json'
      ) {
        indexing.sendProjectDependencies(
          indexer,
          projectDirectory,
          this.getWorkDirectory(filePath) || projectDirectory
        );
      } else {
        indexing.sendFileContentsChanged(indexer, filePath);
      }
    });
    watcher.on('unlink', filename => {
      const filePath = path.join(projectDirectory, filename);
      helper.debugLog('`unlink` detected - ' + filePath);
      if (filename === 'elm.json' || filename === 'elm-package.json') {
        this.watchers[projectDirectory].close();
        delete this.watchers[projectDirectory];
      } else {
        indexing.sendFileContentsRemoved(indexer, filePath, projectDirectory);
      }
    });
  }

  getWorkDirectory(filePath) {
    if (
      atom.packages.isPackageActive('linter-elm-make') &&
      this.getWorkDirectoryFunction
    ) {
      return this.getWorkDirectoryFunction(filePath);
    }
    return null;
  }

  setGetWorkDirectoryFunction(getWorkDirectoryFunction) {
    this.getWorkDirectoryFunction = getWorkDirectoryFunction;
  }
}

function getElmjutsuDocsFilePath(elmjutsuCacheDirectory, packageName, version) {
  return path.resolve(
    elmjutsuCacheDirectory,
    'docs',
    packageName,
    version,
    'docs.json'
  );
}

function getElmDocsFilePath(packageName, packageVersion, elmVersion) {
  const cacheRootDirectory =
    process.platform === 'win32'
      ? path.join(process.env.APPDATA, 'elm')
      : path.join(os.homedir(), '.elm');
  return path.resolve(
    cacheRootDirectory,
    elmVersion,
    'package',
    packageName,
    packageVersion,
    'docs.json'
  );
}

function getConfig() {
  return {
    showAliasesOfType:
      atom.config.get('elmjutsu.showAliasesOfTypesInSidekick') ||
      atom.config.get('elmjutsu.showAliasesOfTypesInTooltip') ||
      false,
  };
}

function getSourceDirectories(jsonFilePath) {
  let json = null;
  try {
    json = JSON.parse(fs.readFileSync(jsonFilePath).toString());
  } catch (e) {}

  // TODO: Check if "source-directories" is an array of strings.
  if (json) {
    return json['source-directories'];
  }
  return null;
}

function convertDocsJsonStringToElm0_18_0(jsonString) {
  const json = JSON.parse(jsonString);
  return JSON.stringify(
    json.map(module => {
      return {
        name: module.name,
        comment: module.comment,
        aliases: module.aliases,
        values: module.values.concat(module.binops),
        types: module.unions,
      };
    })
  );
}
