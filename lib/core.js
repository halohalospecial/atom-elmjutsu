'use babel';

const CompositeDisposable = require('atom').CompositeDisposable;
import path from 'path';
import fs from 'fs';
const _ = require('underscore-plus');
const chokidar = require('chokidar');
import helper from './helper';
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
        sendActiveFile(indexer, editor);
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
              sendActiveToken(indexer, editor);
            }, 150);
        });
        editor.onDidStopChanging(() => {
          sendActiveTextAndToken(indexer, editor);
        });
      }
    }));
    this.subscriptions.add(atom.workspace.observeActivePaneItem((item) => {
      if (item && helper.isElmEditor(item)) {
        const editor = item;
        sendActiveFile(indexer, editor);
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
      sendNewPackages(projectDirectory, indexer);
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

    devLog('Parsing source files of `' + projectDirectory + '`...');
    sourceDirectories.forEach((sourceDirectory) => {
      // parseDirectoryFiles(path.resolve(projectDirectory, sourceDirectory), filePath, indexer);
      parseDirectoryFiles(path.resolve(projectDirectory, sourceDirectory), indexer);
    });
    devLog('Parsed source files of `' + projectDirectory + '`');

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
      devLog('`change` detected - ' + filePath);
      if (filename !== 'elm-package.json') {
        sendNewPackages(projectDirectory, indexer);
      } else {
        // We still need this even if we're already parsing on the editor level
        // since the files can be changed outside Atom:
        sendFileContentsChanged(filePath, indexer);
      }
    });
    watcher.on('add', (filename) => {
      const filePath = path.join(projectDirectory, filename);
      devLog('`add` detected - ' + filePath);
      if (filename === 'elm-package.json') {
        sendNewPackages(projectDirectory, indexer);
      } else {
        sendFileContentsChanged(filePath, indexer);
      }
    });
    watcher.on('unlink', (filename) => {
      const filePath = path.join(projectDirectory, filename);
      devLog('`unlink` detected - ' + filePath);
      if (filename === 'elm-package.json') {
        this.watchers[projectDirectory].close();
        delete this.watchers[projectDirectory];
      } else {
        indexer.ports.fileContentsRemovedSub.send(filePath);
      }
    });
  }
}

function sendFileContentsChanged(filePath, indexer) {
  const text = fs.readFileSync(filePath).toString();
  indexer.ports.fileContentsChangedSub.send([filePath, parseModuleDocs(text, filePath), parseImports(text)]);
}

function sendActiveFile(indexer, editor) {
  const text = editor.getText();
  const filePath = editor.getPath();
  const projectDirectory = helper.getProjectDirectory(path.dirname(filePath));
  indexer.ports.fileContentsChangedSub.send([filePath, parseModuleDocs(text, filePath), parseImports(text)]);
  indexer.ports.activeFileChangedSub.send({filePath, projectDirectory});
  indexer.ports.activeTokenChangedSub.send(helper.getToken(editor));
}

function sendActiveTextAndToken(indexer, editor) {
  const text = editor.getText();
  const filePath = editor.getPath();
  indexer.ports.fileContentsChangedSub.send([filePath, parseModuleDocs(text, filePath), parseImports(text)]);
  indexer.ports.activeTokenChangedSub.send(helper.getToken(editor));
}

function sendActiveToken(indexer, editor) {
  indexer.ports.activeTokenChangedSub.send(helper.getToken(editor));
}

function sendNewPackages(projectDirectory, indexer) {
  let json = null;
  try {
    json = JSON.parse(fs.readFileSync(path.join(projectDirectory, 'elm-package.json')).toString());
  } catch(e) {
  }
  if (!json || !json.dependencies || !(json.dependencies instanceof Object)) {
    return;
  }
  const packages = _.keys(json.dependencies);
  indexer.ports.newPackagesNeededSub.send(packages);
}

// TODO Only parse source directories.
// function parseDirectoryFiles(directory, exceptForFilePath, indexer) {
function parseDirectoryFiles(directory, indexer) {
  const filenames = fs.readdirSync(directory);
  const nextDirectories = [];
  filenames.forEach((filename) => {
    const filePath = path.join(directory, filename);
    // if (filePath !== exceptForFilePath) {
      const stats = fs.statSync(filePath);
      if (stats.isDirectory() && filename !== 'elm-stuff') {
        nextDirectories.push(filePath);
      } else if (stats.isFile() && path.extname(filename) === '.elm') {
        devLog('Parsing ' + filePath);
        const text = fs.readFileSync(filePath).toString();
        setTimeout(() => {
          indexer.ports.fileContentsChangedSub.send([filePath, parseModuleDocs(text, filePath), parseImports(text)]);
        });
      }
    // }
  });
  nextDirectories.forEach((directory) => {
    // parseDirectoryFiles(directory, exceptForFilePath, indexer);
    parseDirectoryFiles(directory, indexer);
  });
}

function parseModuleDocs(text, filePath) {
  const moduleNameRegex = /(?:^|\n)((effect|port)\s+)?(module)\s+(\S+)(\s|$)/;
  var match = moduleNameRegex.exec(text);
  if (match && match.length > 4 && match[4]) {
    const moduleName = match[4];
    const {aliases, tipes, values} = parseModuleValues(text);
    return {
      sourcePath: filePath,
      name: moduleName,
      values: {
        aliases: aliases,
        tipes: tipes,
        values: values
      },
      comment: '' // TODO
    };
  }
  return {
    sourcePath: '',
    name: '',
    values: {
      aliases: [],
      tipes: [],
      values: []
    },
    comment: ''
  };
}

function formatSymbolName(valueName) {
  // Strip parentheses in value name (such as in infix operators).
  return valueName.trim().replace(/\(|\)/g, '');
}

function formatTipe(tipe) {
  return tipe.trim()
    // Replace whitespaces and newlines with single spaces.
    .replace(/( |\n)+/g, ' ')
    // Remove comments.
    .replace(/--.*$|{-[\s\S]*-}/gm, '');
}

// TODO Handle something like: (width, height) = (100, 200)
// TODO Handle something like: {width, height} = {width = 100, height = 200}
function parseModuleValues(text) {
  var aliases = [];
  var tipes = [];
  var values = [];
  var valueEntries = {};
  // Remove commented lines and blocks.
  const strippedText = text.replace(/--.*$|{-[\s\S]*-}/gm, '');
  const blockRegex = /^(?!-|{)(\S+)\s(\s*(.|\n)*?(?=\n^\S|$(?![\r\n])))/gm;
  var match = blockRegex.exec(strippedText);
  while (match) {
    const block = match[0];
    if (/^(port module|module|import)\s/.test(block)) {
      // Ignore.

    } else if (/^type alias\s/.test(block)) {
      const parts = block.replace(/^type alias\s+/, '').split('=');
      const aliasName = formatSymbolName(parts.shift().split(/\s/)[0]);
      const tipe = formatTipe(parts.join('='));
      values.push({
        name: aliasName,
        comment: '', // TODO
        tipe: tipe,
        args: []
      });

    } else if (/^type\s/.test(block)) {
      const parts = block.replace(/^type\s+/, '').split('=');
      const tipeName = formatSymbolName(parts.shift().split(/\s/)[0]);
      const tipe = formatTipe(parts.join('='));
      const cases = tipe.split('|').map((rawCase) => {
        return rawCase.trim().split(' ', 1)[0];
      });
      tipes.push({
        name: tipeName,
        comment: '', // TODO
        tipe: tipeName,
        cases: cases,
        args: []
      });

    } else if (/^port\s/.test(block)) {
      const parts = block.replace(/^port\s+/, '').split(':');
      const valueName = formatSymbolName(parts.shift());
      const tipe = formatTipe(parts.join(':'));
      values.push({
        name: valueName,
        comment: '', // TODO
        tipe: tipe,
        args: []
      });

    } else {
      const valueName = formatSymbolName(match[1]);
      const rest = match[2].trim();
      if (rest.startsWith(':')) {
        // Type annotation.
        const tipe = formatTipe(rest.replace(':', ''));
        valueEntries[valueName] = {
          name: valueName,
          comment: '', // TODO
          tipe: tipe,
          args: []
        };

      } else {
        // Arguments.
        const args = formatTipe(rest.split('=', 1)[0]);
        let valueEntry = valueEntries[valueName] ? _.clone(valueEntries[valueName]) : {
          name: valueName,
          comment: '', // TODO
          tipe: args === '' ? '' : '*' + args + '*'
        };
        valueEntry.args = args === '' ? [] : args.split(' ');
        valueEntries[valueName] = valueEntry;
      }
    }
    match = blockRegex.exec(strippedText);
  }
  values = values.concat(_.values(valueEntries));
  return {aliases, tipes, values};
}

function parseImports(text) {
	const regex = /(?:^|\n)import\s([\w\.]+)(?:\sas\s(\w+))?(?:\sexposing\s*\(((?:\s*(?:\w+|\(.+\))\s*,)*)\s*((?:\.\.|\w+|\(.+\)))\s*\))?/g;
	var imports = [];
  var match = regex.exec(text);
	while (match) {
		const exposedString = match[3] + match[4];
		let exposed = null;
		if (exposedString) {
			exposed = exposedString.split(',').map(function(variable) {
				const trimmed = variable.trim();
				return trimmed[0] === '(' ? trimmed.slice(1,-1).trim() : trimmed;
			});
		}
		imports.push({
			name: match[1],
			alias: match[2] || null,
			exposed: exposed
		});
    match = regex.exec(text);
	}
	return imports;
}

function devLog(msg) {
  if (atom.inDevMode()) {
    console.log('[elmjutsu] ' + msg);
  }
}
