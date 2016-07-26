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
    this.watchers = {};
    this.subscriptions = new CompositeDisposable();
    const indexer = Elm.Indexer.worker();
    this.indexer = indexer;
    indexer.ports.docsLoadedCmd.subscribe(() => {
      const editor = atom.workspace.getActiveTextEditor();
      if (helper.isElmEditor(editor)) {
        sendActiveFile(indexer, editor);
      }
    });
    indexer.ports.goToDefinitionCmd.subscribe((uri) => {
      const parts = uri.split('#');
      const filePath = parts[0].replace('file://', '');
      const valueName = parts[1];
      if (!fs.existsSync(filePath)) {
        return;
      }
      atom.workspace.open(filePath, {searchAllPanes: true, split: 'left'})
        .then((editor) => {
          const regex = new RegExp('^(?!(--|type))\\(?(' + _.escapeRegExp(valueName) +  ')\\)?\\s+((?!(:|^))(\\s|\\S|\\n))*=', 'm');
          editor.scanInBufferRange(regex, [[0, 0], editor.getEofBufferPosition()], ({match, range, stop}) => {
            const diff = match[2].length - match[0].length;
            const definitionRange = range.translate([0, 0], [0, diff]);
            editor.setCursorBufferPosition(definitionRange.start);
            editor.scrollToCursorPosition({center: true});
            stop();
          });
        });
    });
    var sendTokenTimer = null;
    this.subscriptions.add(atom.workspace.observeTextEditors((editor) => {
      if (helper.isElmEditor(editor)) {
        this.watchProject(indexer, editor);
        editor.onDidChangeCursorPosition((e) => {
          if (sendTokenTimer) {
            clearTimeout(sendTokenTimer);
          }
          sendTokenTimer =
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

    let watcher = chokidar.watch(['elm-package.json'], {
      cwd: projectDirectory,
      usePolling: true, useFsEvents: true, persistent: true,
      ignored: [], ignoreInitial: true,
      followSymlinks: false, interval: 100, alwaysStat: false, depth: undefined,
      awaitWriteFinish: { stabilityThreshold: 500, pollInterval: 100 },
      ignorePermissionErrors: false, atomic: false
    });
    this.watchers[projectDirectory] = watcher;
    watcher.on('unlink', (filename) => {
      if (filename === 'elm-package.json') {
        this.watchers[projectDirectory].close();
        delete this.watchers[projectDirectory];
      } else {
        // TODO Clear docs for filename
      }
    });
    watcher.on('add', (filename) => {
      if (filename === 'elm-package.json') {
        sendNewPackages(projectDirectory, indexer);
      }
    });
    watcher.on('change', (filename) => {
      if (filename !== 'elm-package.json') {
        sendNewPackages(projectDirectory, indexer);
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

const emptyModuleDocs = {
  packageUri: '',
  name: '',
  values: {
    aliases: [],
    types: [],
    values: []
  }
};

function parseModuleDocs(text, filePath) {
  const moduleRegex = /(?:^|\n)((effect|port)\s+)?(module)\s+(\S+)(\s|$)/;
  var match = moduleRegex.exec(text);
  if (match && match.length > 4 && match[4]) {
    const moduleName = match[4];
    const values = parseModuleValues(text);
    return {
      packageUri: 'file://' + filePath,
      name: moduleName,
      values: {
        aliases: [], // TODO
        types: [], // TODO
        values: values
      }
    };
  }
  return emptyModuleDocs;
}

// TODO Detect port, effect, type, type alias, etc.
function parseModuleValues(text) {
  const emptyEntry = {
    name: '',
    comment: '',
    tipe: ''
  };
  var values = {};

  const annotationRegex = /^\(?(\S+)\)?\s+:(.|\n)+^\1\s/gm;
  var match = annotationRegex.exec(text);
  while (match) {
    let value = match[0].trim().split('\n');
    value.pop();
    value = value.join('\n');
    let tipe = value.split(':');
    tipe.shift();
    tipe = tipe.join(':').trim();
    // Strip whitespaces and parentheses.
    const valueName = value.split(':')[0].replace(/\s|\(|\)/g, '');
    values[valueName] = {
      name: valueName,
      comment: '', // TODO
      tipe: tipe
    };
    match = annotationRegex.exec(text);
  }

  const definitionRegex = /^(?!(--|type))\(?(\S+)\)?\s+((?!(:|^))(\s|\S|\n))*=/gm;
  match = definitionRegex.exec(text);
  while (match) {
    let value = match[0].trim().split(/\s|\n/gm);
    const rawValueName = value[0];
    // Strip whitespaces and parentheses.
    const valueName = rawValueName.replace(/\s|\(|\)/g, '');
    // Remove value name.
    value.shift();
    // Remove `=`.
    value.pop();
    // Get function arguments.
    const args = value.join(' ').trim();
    // Use arguments if type annotation does not exist.
    if (!values[valueName]) {
      values[valueName] = {
        name: valueName,
        comment: '', // TODO
        tipe: args === '' ? '' : '*' + args + '*'
      };
    }
    match = definitionRegex.exec(text);
  }

  return _.values(values);
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
