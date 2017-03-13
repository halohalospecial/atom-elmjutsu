'use babel';

import {CompositeDisposable} from 'atom';
import path from 'path';
import fs from 'fs-extra';
import _ from 'underscore-plus';
import chokidar from 'chokidar';
import tmp from 'tmp';
import helper from './helper';
import indexing from './indexing';
import Elm from '../elm/indexer';

export default class Core {

  constructor() {
    this.subscriptions = new CompositeDisposable();
    this.watchers = {};
    this.indexer = Elm.Indexer.worker();
    this.indexer.ports.configChangedSub.send(getConfig());
    this.indexer.ports.docsDownloadedCmd.subscribe((dependenciesAndJson) => {
      const editor = atom.workspace.getActiveTextEditor();
      if (helper.isElmEditor(editor)) {
        indexing.sendActiveFile(this.indexer, editor);
      }
      const configCacheDirectory = atom.config.get('elmjutsu.cacheDirectory').trim();
      let cacheDirectory;
      if (configCacheDirectory === '') {
        cacheDirectory = tmp.dirSync({prefix: 'elmjutsu'}).name;
        atom.config.set('elmjutsu.cacheDirectory', cacheDirectory);
      } else {
        cacheDirectory = configCacheDirectory;
      }
      dependenciesAndJson.forEach(([[packageName, version], jsonString]) => {
        const docsFilePath = getDocsFilePath(cacheDirectory, packageName, version);
        // No need to use the `-Sync` functions here.
        fs.ensureFile(docsFilePath, function (err) {
          if (err) {
            return helper.log('Failed to write ' + docsFilePath + '(' + err + ')', 'red');
          }
          fs.writeFile(docsFilePath, jsonString, (err) => {
            if (err) {
              return helper.log('Failed to write ' + docsFilePath + '(' + err + ')', 'red');
            }
            helper.log('Wrote ' + docsFilePath, 'green');
          });
        });
      });
    });
    this.indexer.ports.readPackageDocsCmd.subscribe((missingDependencies) => {
      const cacheDirectory = atom.config.get('elmjutsu.cacheDirectory').trim();
      let readDependencyJsonStrings = [];
      const unreadDependencies = missingDependencies.filter((dependency) => {
        const [packageName, version] = dependency;
        const docsFilePath = getDocsFilePath(cacheDirectory, packageName, version);
        helper.log('Reading ' + docsFilePath + '...');
        let jsonString = null;
        try {
          jsonString = fs.readFileSync(docsFilePath).toString();
        } catch (exception) {
        }
        if (jsonString) {
          helper.log('Read ' + docsFilePath, 'green');
          readDependencyJsonStrings.push([dependency, jsonString]);
          return false;
        }
        return true;
      });
      this.indexer.ports.docsReadSub.send(readDependencyJsonStrings);
      if (unreadDependencies.length > 0) {
        const unreadDependenciesString = unreadDependencies.map(([packageName, version]) => {
          return packageName + '/' + version;
        }).join(', ');
        helper.log('Downloading missing package docs (' + unreadDependenciesString + ')...');
        this.indexer.ports.downloadMissingPackageDocsSub.send(unreadDependencies);
      }
    });
    this.autocompleteActive = {};
    this.sendTokenDebouncer = null;
    // Not using `atom.workspace.observeTextEditors` here to also observe the text editor created for `Pipe Selections`.
    this.subscriptions.add(atom.textEditors.observe((editor) => {
      if (helper.isElmEditor(editor)) {
        this.watchProject(this.indexer, editor);
        let editorSubscriptions = new CompositeDisposable();
        editorSubscriptions.add(editor.onDidChangeCursorPosition(({cursor}) => {
          if (cursor !== editor.getLastCursor()) {
            return;
          }
          if (this.sendTokenDebouncer) {
            clearTimeout(this.sendTokenDebouncer);
          }
          this.sendTokenDebouncer =
            setTimeout(() => {
              if (!this.autocompleteActive[editor.id]) {
                // Only send active token or inference if nothing is selected.
                let selectedRange = editor.getSelectedBufferRange();
                if (selectedRange.isEmpty()) {
                  const inference = this.inferTypes.getInferenceAtPosition(editor);
                  if (inference) {
                    indexing.sendEnteredInference(this.indexer, inference);
                  } else {
                    indexing.sendActiveToken(this.indexer, editor);
                  }
                }
              }
            }, 300);
        }));
        editorSubscriptions.add(editor.onDidStopChanging(() => {
          if (editor.isPipeSelectionsEditor) {
            indexing.sendActiveToken(this.indexer, editor);
          } else if (!this.autocompleteActive[editor.id]) {
            indexing.sendActiveTextAndToken(this.indexer, editor);
            indexing.sendClearHintsCache(this.indexer);
          }
        }));
        editorSubscriptions.add(editor.onDidDestroy(() => {
          editorSubscriptions.dispose();
          // Revert to the text saved in file.
          indexing.sendFileContentsChanged(this.indexer, editor.getPath());
        }));
        this.subscriptions.add(editorSubscriptions);
      }
    }));
    this.subscriptions.add(atom.workspace.observeActivePaneItem((item) => {
      if (item && helper.isElmEditor(item)) {
        const editor = item;
        indexing.sendActiveFile(this.indexer, editor);
      }
    }));
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
    ].forEach((configKey) => {
        this.subscriptions.add(atom.config.observe(configKey, () => {
          this.indexer.ports.configChangedSub.send(getConfig());
        }));
      });
  }

  setInferTypes(inferTypes) {
    this.inferTypes = inferTypes;
  }

  setAutocompleteActive(editor, isActive) {
    this.autocompleteActive[editor.id] = isActive;
  }

  destroy() {
    this.autocompleteActive = null;
    if (this.sendTokenDebouncer) {
      clearTimeout(this.sendTokenDebouncer);
      this.sendTokenDebouncer = null;
    }
    this.subscriptions.dispose();
    this.subscriptions = null;
    _.values(this.watchers).forEach((watcher) => {
      watcher.close();
    });
    this.watchers = null;
  }

  getIndexer() {
    return this.indexer;
  }

  watchProject(indexer, editor) {
    const filePath = editor.getPath();
    if (!filePath) {
      return;
    }
    const projectDirectory = helper.getProjectDirectory(filePath);
    if (!projectDirectory) {
      return;
    }

    setTimeout(() => {
      indexing.sendProjectDependencies(indexer, projectDirectory, this.getWorkDirectory(filePath) || projectDirectory);
    }, 0);

    if (this.watchers[projectDirectory]) {
      // Watcher already exists.
      return;
    }

    let elmPackageJson = null;
    try {
      elmPackageJson = JSON.parse(fs.readFileSync(path.join(projectDirectory, 'elm-package.json')).toString());
    } catch(e) {
    }
    let sourceDirectories = ['.'];
    // TODO: Check if "source-directories" is an array of strings.
    if (elmPackageJson) {
      sourceDirectories = elmPackageJson['source-directories'];
    }

    helper.log('Parsing project directory ' + projectDirectory + '...');
    sourceDirectories.forEach((sourceDirectory) => {
      indexing.parseDirectoryFiles(indexer, projectDirectory, path.resolve(projectDirectory, sourceDirectory));
    });
    helper.log('Parsed project directory ' + projectDirectory, 'green');

    // Chokidar takes care of converting from `/` to `\` for Windows.
    let watcher = chokidar.watch(['elm-stuff/exact-dependencies.json', 'elm-package.json', '**/*.elm'], {
      cwd: projectDirectory,
      // usePolling: true, interval: 100, useFsEvents: true,
      usePolling: false,
      interval: 1000,
      persistent: true,
      ignored: ['elm-stuff/packages/**', 'elm-stuff/build-artifacts/**'], ignoreInitial: true,
      followSymlinks: false,
      alwaysStat: false,
      depth: undefined,
      // awaitWriteFinish: {stabilityThreshold: 500, pollInterval: 100},
      ignorePermissionErrors: false, atomic: false
    });
    this.watchers[projectDirectory] = watcher;
    watcher.on('change', (filename) => {
      const filePath = path.join(projectDirectory, filename);
      helper.log('`change` detected - ' + filePath);
      if (filename === 'elm-stuff' + path.sep + 'exact-dependencies.json' || filename === 'elm-package.json') {
        indexing.sendProjectDependencies(indexer, projectDirectory, this.getWorkDirectory(filePath) || projectDirectory);
      } else {
        // We still need this even if we're already parsing on the editor level
        // since the files can be changed outside Atom:
        indexing.sendFileContentsChanged(indexer, filePath);
      }
    });
    watcher.on('add', (filename) => {
      const filePath = path.join(projectDirectory, filename);
      helper.log('`add` detected - ' + filePath);
      if (filename === 'elm-stuff' + path.sep + 'exact-dependencies.json' || filename === 'elm-package.json') {
        indexing.sendProjectDependencies(indexer, projectDirectory, this.getWorkDirectory(filePath) || projectDirectory);
      } else {
        indexing.sendFileContentsChanged(indexer, filePath);
      }
    });
    watcher.on('unlink', (filename) => {
      const filePath = path.join(projectDirectory, filename);
      helper.log('`unlink` detected - ' + filePath);
      if (filename === 'elm-package.json') {
        this.watchers[projectDirectory].close();
        delete this.watchers[projectDirectory];
      } else {
        indexer.ports.fileContentsRemovedSub.send([filePath, projectDirectory]);
      }
    });
  }

  getWorkDirectory(filePath) {
    if (atom.packages.isPackageActive('linter-elm-make') && this.getWorkDirectoryFunction) {
      return this.getWorkDirectoryFunction(filePath);
    }
    return null;
  }

  setGetWorkDirectoryFunction(getWorkDirectoryFunction) {
    this.getWorkDirectoryFunction = getWorkDirectoryFunction;
  }
}

function getDocsFilePath(cacheDirectory, packageName, version) {
  return path.resolve(cacheDirectory, 'docs', packageName, version, 'documentation.json');
}

function getConfig() {
  return {
    showAliasesOfType: atom.config.get('elmjutsu.showAliasesOfTypesInSidekick') || atom.config.get('elmjutsu.showAliasesOfTypesInTooltip') || false,
  };
}
