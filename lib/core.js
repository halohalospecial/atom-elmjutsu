'use babel';

const CompositeDisposable = require('atom').CompositeDisposable;
import path from 'path';
import fs from 'fs';
const _ = require('underscore-plus');
const chokidar = require('chokidar');
import helper from './helper';
import indexing from './indexing';
import Elm from '../elm/indexer';

export default class Core {

  constructor() {
    this.subscriptions = new CompositeDisposable();
    this.jumpPoints = {};
    this.watchers = {};
    const indexer = Elm.Indexer.worker();
    this.indexer = indexer;
    indexer.ports.docsLoadedCmd.subscribe(() => {
      const editor = atom.workspace.getActiveTextEditor();
      if (helper.isElmEditor(editor)) {
        indexing.sendActiveFile(indexer, editor);
      }
    });
    indexer.ports.goToDefinitionCmd.subscribe((symbol) => {
      if (!fs.existsSync(symbol.sourcePath)) {
        return;
      }
      atom.workspace.open(symbol.sourcePath, {searchAllPanes: true, split: 'left'})
        .then((editor) => {
          helper.scanForSymbolDefinitionRange(editor, symbol, (range) => {
            editor.setCursorBufferPosition(range.start);
            editor.scrollToCursorPosition({center: true});
          });
        });
    });
    this.sendTokenDebouncer = null;
    this.subscriptions.add(atom.workspace.observeTextEditors((editor) => {
      if (helper.isElmEditor(editor)) {
        this.watchProject(indexer, editor);
        editor.onDidChangeCursorPosition((e) => {
          if (this.sendTokenDebouncer) {
            clearTimeout(this.sendTokenDebouncer);
          }
          this.sendTokenDebouncer =
            setTimeout(() => {
              indexing.sendActiveToken(indexer, editor);
            }, 150);
        });
        editor.onDidStopChanging(() => {
          indexing.sendActiveTextAndToken(indexer, editor);
        });
      }
    }));
    this.subscriptions.add(atom.workspace.observeActivePaneItem((item) => {
      if (item && helper.isElmEditor(item)) {
        const editor = item;
        indexing.sendActiveFile(indexer, editor);
      }
    }));
  }

  destroy() {
    if (this.sendTokenDebouncer) {
      clearTimeout(this.sendTokenDebouncer);
      this.sendTokenDebouncer = null;
    }
    this.subscriptions.dispose();
    _.values(this.watchers).forEach((watcher) => {
      watcher.close();
    });
    this.watchers = {};
  }

  getIndexer() {
    return this.indexer;
  }

  goToDefinition() {
    const editor = atom.workspace.getActiveTextEditor();
    if (helper.isElmEditor(editor)) {
      this.storeJumpPoint();
      this.indexer.ports.goToDefinitionSub.send(helper.getToken(editor));
    }
  }

  goToSymbol() {
    const editor = atom.workspace.getActiveTextEditor();
    if (helper.isElmEditor(editor)) {
      this.storeJumpPoint();
      this.indexer.ports.goToSymbolSub.send([helper.getProjectDirectory(editor.getPath()), helper.getToken(editor)]);
    }
  }

  goBack() {
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
    const projectDirectory = helper.getProjectDirectory(path.dirname(filePath));
    if (projectDirectory === null) {
      return;
    }

    setTimeout(() => {
      indexing.sendNewPackages(indexer, projectDirectory);
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
    // TODO Check if "source-directories" is an array of strings.
    if (elmPackageJson) {
      sourceDirectories = elmPackageJson['source-directories'];
    }

    helper.log('Parsing source files of `' + projectDirectory + '`...');
    sourceDirectories.forEach((sourceDirectory) => {
      // indexing.parseDirectoryFiles(path.resolve(projectDirectory, sourceDirectory), filePath, indexer);
      indexing.parseDirectoryFiles(path.resolve(projectDirectory, sourceDirectory), indexer);
    });
    helper.log('Parsed source files of `' + projectDirectory + '`');

    let watcher = chokidar.watch(['elm-package.json', '**/*.elm'], {
      cwd: projectDirectory,
      // usePolling: true, interval: 100, useFsEvents: true,
      usePolling: false,
      interval: 1000,
      persistent: true,
      ignored: ['elm-stuff/**'], ignoreInitial: true,
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
      if (filename === 'elm-package.json') {
        indexing.sendNewPackages(indexer, projectDirectory);
      } else {
        // We still need this even if we're already parsing on the editor level
        // since the files can be changed outside Atom:
        indexing.sendFileContentsChanged(indexer, filePath);
      }
    });
    watcher.on('add', (filename) => {
      const filePath = path.join(projectDirectory, filename);
      helper.log('`add` detected - ' + filePath);
      if (filename === 'elm-package.json') {
        indexing.sendNewPackages(indexer, projectDirectory);
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
        indexer.ports.fileContentsRemovedSub.send(filePath);
      }
    });
  }
}
