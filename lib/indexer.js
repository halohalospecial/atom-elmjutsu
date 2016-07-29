'use babel';

const CompositeDisposable = require('atom').CompositeDisposable;
import path from 'path';
import fs from 'fs';
const _ = require('underscore-plus');
const chokidar = require('chokidar');
import helper from './helper';
import Elm from '../elm/indexer';

export default class Indexer {

  constructor() {
    this.subscriptions = new CompositeDisposable();
    this.watchers = {};
    this.jumpPoint = null;
    const indexer = Elm.Indexer.worker();
    this.indexer = indexer;
    indexer.ports.docsLoadedCmd.subscribe(() => {
      const editor = atom.workspace.getActiveTextEditor();
      if (helper.isElmEditor(editor)) {
        sendActiveFile(indexer, editor);
      }
    });
    indexer.ports.goToDefinitionCmd.subscribe(({sourcePath, name, caseTipe}) => {
      if (!fs.existsSync(sourcePath)) {
        return;
      }
      const activeEditor = atom.workspace.getActiveTextEditor();
      this.jumpPoint = {
        uri: activeEditor.getURI(),
        position: activeEditor.getCursorBufferPosition()
      };
      atom.workspace.open(sourcePath, {searchAllPanes: true, split: 'left'})
        .then((editor) => {
          helper.scanForSymbolDefinitionRange(editor, name, caseTipe, (range) => {
            editor.setCursorBufferPosition(range.start);
            editor.scrollToCursorPosition({center: true});
          });
        });
    });
    var sendTokenDebouncer = null;
    this.subscriptions.add(atom.workspace.observeTextEditors((editor) => {
      if (helper.isElmEditor(editor)) {
        this.watchProject(indexer, editor);
        editor.onDidChangeCursorPosition((e) => {
          if (sendTokenDebouncer) {
            clearTimeout(sendTokenDebouncer);
          }
          sendTokenDebouncer =
            setTimeout(() => {
              sendActiveToken(indexer, editor);
            }, 300);
        });
        editor.onDidStopChanging(() => {
          sendActiveFile(indexer, editor);
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
      this.indexer.ports.goToDefinitionSub.send(getToken(editor));
    }
  }

  returnFromDefinition() {
    if (this.jumpPoint) {
      atom.workspace.open(this.jumpPoint.uri, {searchAllPanes: true, split: 'left'})
        .then((editor) => {
          editor.setCursorBufferPosition(this.jumpPoint.position);
          editor.scrollToCursorPosition({center: true});
          this.jumpPoint = null;
        });
    }
  }

  goToSymbol() {
    const editor = atom.workspace.getActiveTextEditor();
    if (helper.isElmEditor(editor)) {
      this.indexer.ports.goToSymbolSub.send([helper.getProjectDirectory(editor.getPath()), getToken(editor)]);
    }
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
    });

    if (this.watchers[projectDirectory]) {
      // Watcher already exists.
      return;
    }

    parseDirectoryFiles(projectDirectory, filePath, indexer);

    let watcher = chokidar.watch(['elm-package.json', '**/*.elm'], {
      cwd: projectDirectory,
      usePolling: true, useFsEvents: true, persistent: true,
      ignored: [], ignoreInitial: true,
      followSymlinks: false, interval: 100, alwaysStat: false, depth: undefined,
      awaitWriteFinish: { stabilityThreshold: 500, pollInterval: 100 },
      ignorePermissionErrors: false, atomic: false
    });
    this.watchers[projectDirectory] = watcher;
    watcher.on('change', (filename) => {
      if (filename !== 'elm-package.json') {
        sendNewPackages(projectDirectory, indexer);
      }
      // Changes in `.elm` files are handled on the buffer level somewhere else.
    });
    watcher.on('add', (filename) => {
      if (filename === 'elm-package.json') {
        sendNewPackages(projectDirectory, indexer);
      } else {
        const filePath = path.join(projectDirectory, filename);
        const text = fs.readFileSync(filePath, {encoding: 'utf8'});
        indexer.ports.sourceFileChangedSub.send([filePath, parseModuleDocs(text, filePath), parseImports(text)]);
      }
    });
    watcher.on('unlink', (filename) => {
      if (filename === 'elm-package.json') {
        this.watchers[projectDirectory].close();
        delete this.watchers[projectDirectory];
      } else {
        const filePath = path.join(projectDirectory, filename);
        indexer.ports.sourceFileRemovedSub.send(filePath);
      }
    });
  }
}

function sendActiveFile(indexer, editor) {
  const text = editor.getText();
  const filePath = editor.getPath();
  indexer.ports.sourceFileChangedSub.send([filePath, parseModuleDocs(text, filePath), parseImports(text)]);
  indexer.ports.activeFilePathChangedSub.send(filePath);
  indexer.ports.activeTokenChangedSub.send(getToken(editor));
}

function sendActiveToken(indexer, editor) {
  indexer.ports.activeTokenChangedSub.send(getToken(editor));
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

function getToken(editor) {
  const scopeDescriptor = editor.scopeDescriptorForBufferPosition(editor.getCursorBufferPosition());
  if (tokenIsString(scopeDescriptor) || tokenIsComment(scopeDescriptor)) {
    return '';
  }
  return editor.getWordUnderCursor({wordRegex: /[a-zA-Z0-9_\'\|!%\$\+:\-\.=<>\/]+|\(,+\)/}).trim();
}

function tokenIsString({scopes}) {
  return _.isEqual(scopes, ['source.elm', 'string.quoted.double.elm']);
}

function tokenIsComment({scopes}) {
  return _.contains(scopes, 'comment.block.elm') || _.contains(scopes, 'comment.line.double-dash.elm');
}

// TODO Only parse source directories.
function parseDirectoryFiles(directory, exceptForFilePath, indexer) {
  const filenames = fs.readdirSync(directory);
  const nextDirectories = [];
  filenames.forEach((filename) => {
    const filePath = path.join(directory, filename);
    if (filePath !== exceptForFilePath) {
      const stats = fs.statSync(filePath);
      if (stats.isDirectory() && filename !== 'elm-stuff') {
        nextDirectories.push(filePath);
      } else if (stats.isFile() && path.extname(filename) === '.elm') {
        if (atom.inDevMode()) {
          console.log('[elm-fu] Parsing file ' + filePath);
        }
        const text = fs.readFileSync(filePath, {encoding: 'utf8'});
        setTimeout(() => {
          indexer.ports.sourceFileChangedSub.send([filePath, parseModuleDocs(text, filePath), parseImports(text)]);
        });
      }
    }
  });
  nextDirectories.forEach((directory) => {
    parseDirectoryFiles(directory, exceptForFilePath, indexer);
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
      }
    };
  }
  return emptyModuleDocs;
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
  // TODO Should not be inside a commented line or block.
  const blockRegex = /^(?!-|{)(\S+)\s(\s*(.|\n)*?(?=\n^\S|$(?![\r\n])))/gm;
  var match = blockRegex.exec(text);
  while (match) {
    const block = match[0];
    if (/^(port module|module|import)\s/.test(block)) {
      // Ignore.

    } else if (/^type alias\s/.test(block)) {
      const parts = block.replace(/^type alias\s+/, '').split('=');
      const aliasName = formatSymbolName(parts.shift());
      const tipe = formatTipe(parts.join('='));
      values.push({
        name: aliasName,
        comment: '', // TODO
        tipe: tipe
      });

    } else if (/^type\s/.test(block)) {
      const parts = block.replace(/^type\s+/, '').split('=');
      const tipeName = formatSymbolName(parts.shift());
      const tipe = formatTipe(parts.join('='));
      const cases = tipe.split('|').map((rawCase) => {
        return rawCase.trim().split(' ', 1)[0];
      });
      tipes.push({
        name: tipeName,
        comment: '', // TODO
        tipe: tipeName,
        cases: cases
      });

    } else if (/^port\s/.test(block)) {
      const parts = block.replace(/^port\s+/, '').split(':');
      const valueName = formatSymbolName(parts.shift());
      const tipe = formatTipe(parts.join(':'));
      values.push({
        name: valueName,
        comment: '', // TODO
        tipe: tipe
      });

    } else {
      const valueName = formatSymbolName(match[1]);
      const rest = match[2].trim();
      if (rest.startsWith(':')) {
        // It's a type annotation.
        const tipe = formatTipe(rest.replace(':', ''));
        valueEntries[valueName] = {
          name: valueName,
          comment: '', // TODO
          tipe: tipe
        };

      } else {
        // Treat the args as the type.
        const args = formatTipe(rest.split('=', 1)[0]);
        if (!valueEntries[valueName]) {
          valueEntries[valueName] = {
            name: valueName,
            comment: '', // TODO
            tipe: args === '' ? '' : '*' + args + '*'
          };
        }
      }
    }
    match = blockRegex.exec(text);
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

const emptyModuleDocs = {
  packageUri: '',
  name: '',
  values: {
    aliases: [],
    tipes: [],
    values: []
  }
};
