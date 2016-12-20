'use babel';

const CompositeDisposable = require('atom').CompositeDisposable;
import path from 'path';
import fs from 'fs-extra';
const _ = require('underscore-plus');
const chokidar = require('chokidar');
const tmp = require('tmp');
import helper from './helper';
import indexing from './indexing';
import Elm from '../elm/indexer';

export default class Core {

  constructor() {
    this.subscriptions = new CompositeDisposable();
    this.jumpPoints = {};
    this.watchers = {};
    this.indexer = Elm.Indexer.worker();
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
        fs.ensureFile(docsFilePath, function (err) {
          if (err) {
            return helper.log('Failed to write ' + docsFilePath + '(' + err + ')', 'red');
          }
          // No need to use the `writeFileSync` here.
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
        this.indexer.ports.downloadMissingPackageDocsSub.send(unreadDependencies);
      }
    });
    this.indexer.ports.goToDefinitionCmd.subscribe(([activeFile, symbol]) => {
      let filePath;
      const prefix = helper.getPackageDocsPrefix();
      if (activeFile && symbol.sourcePath.startsWith(prefix)) {
        const parts = symbol.sourcePath.replace(prefix, '').replace(/#.*$/, '').split('/');
        if (parts.length === 4) {
          const [namespace, packageName, version, moduleName] = parts;
          filePath = path.join(activeFile.projectDirectory, 'elm-stuff', 'packages', namespace, packageName, version, 'src', moduleName.replace('-', path.sep)) + '.elm';
        }
      } else {
        filePath = symbol.sourcePath;
      }
      if (!fs.existsSync(filePath)) {
        atom.notifications.addError('Error opening file `' + filePath + '`', {dismissable: true});
        return;
      }
      atom.workspace.open(filePath, {searchAllPanes: true, split: 'left'})
        .then((editor) => {
          helper.scanForSymbolDefinitionRange(editor, symbol, (range) => {
            editor.setCursorBufferPosition(range.start);
            editor.scrollToCursorPosition({center: true});
          });
        });
    });
    this.sendTokenDebouncer = null;
    // Not using `atom.workspace.observeTextEditors` here to also observe the text editor created for `Pipe Selections`.
    this.subscriptions.add(atom.textEditors.observe((editor) => {
      if (helper.isElmEditor(editor)) {
        this.watchProject(this.indexer, editor);
        this.subscriptions.add(editor.onDidChangeCursorPosition((e) => {
          if (this.sendTokenDebouncer) {
            clearTimeout(this.sendTokenDebouncer);
          }
          this.sendTokenDebouncer =
            setTimeout(() => {
              indexing.sendActiveToken(this.indexer, editor);
            }, 150);
        }));
        this.subscriptions.add(editor.onDidStopChanging(() => {
          indexing.sendActiveTextAndToken(this.indexer, editor);
        }));
        this.subscriptions.add(editor.onDidDestroy(() => {
          // Revert to the text saved in file.
          indexing.sendFileContentsChanged(this.indexer, editor.getPath());
        }));
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
  }

  destroy() {
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

  goToDefinitionCommand() {
    const editor = atom.workspace.getActiveTextEditor();
    if (helper.isElmEditor(editor)) {
      this.storeJumpPoint();
      this.indexer.ports.goToDefinitionSub.send(helper.getToken(editor));
    }
  }

  goBackCommand() {
    const editor = atom.workspace.getActiveTextEditor();
    const projectDirectory = helper.getProjectDirectory(editor.getPath());
    var jumpPoints = this.jumpPoints[projectDirectory] ? this.jumpPoints[projectDirectory] : null;
    if (jumpPoints) {
      const jumpPoint = jumpPoints.pop();
      this.jumpPoints[projectDirectory] = jumpPoints;
      if (jumpPoint) {
        atom.workspace.open(jumpPoint.uri, {searchAllPanes: true, split: 'left'})
          .then((editor) => {
            editor.setCursorBufferPosition(jumpPoint.position);
            editor.scrollToCursorPosition({center: true});
          });
      }
    }
  }

  storeJumpPoint() {
    const editor = atom.workspace.getActiveTextEditor();
    const projectDirectory = helper.getProjectDirectory(editor.getPath());
    var jumpPoints = this.jumpPoints[projectDirectory] ? this.jumpPoints[projectDirectory] : [];
    jumpPoints.push({
      uri: editor.getURI(),
      position: editor.getCursorBufferPosition()
    });
    this.jumpPoints[projectDirectory] = jumpPoints;
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
