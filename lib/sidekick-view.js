'use babel';

const CompositeDisposable = require('atom').CompositeDisposable;
const ScrollView = require('atom-space-pen-views').ScrollView;
import path from 'path';
import fs from 'fs';
const _ = require('underscore-plus');
const chokidar = require('chokidar');
import helper from './helper';
import Elm from '../elm/sidekick';

export default class SidekickView extends ScrollView {

  constructor() {
    super();
    this.subscriptions = new CompositeDisposable();
  }

  static content() {
    return this.div({tabindex: -1});
  }

  attached() {
    this.watchers = {};
    const elmDiv = document.createElement('div');
    elmDiv.classList.add('elm-fu', 'sidekick');
    this.html(elmDiv);

    const sidekick = Elm.Sidekick.embed(elmDiv);
    sidekick.ports.docsLoaded.subscribe(() => {
      const editor = atom.workspace.getActiveTextEditor();
      if (isElmEditor(editor)) {
        setImports(sidekick, editor);
        setToken(sidekick, editor);
      }
    });
    var setTokenTimer = null;
    this.subscriptions.add(atom.workspace.observeTextEditors((editor) => {
      if (isElmEditor(editor)) {
        setImports(sidekick, editor);
        setToken(sidekick, editor);
        this.sendProjectPkgs(sidekick, editor);
        editor.onDidChangeCursorPosition((e) => {
          if (setTokenTimer) {
            clearTimeout(setTokenTimer);
          }
          setTokenTimer =
            setTimeout(() => {
              setToken(sidekick, editor);
            }, 300);
        });
        editor.onDidStopChanging(() => {
          setImports(sidekick, editor);
        });
        editor.onDidDestroy(() => {
          if (editor === atom.workspace.getActiveTextEditor()) {
            clearSidekick(sidekick);
          }
        });
      }
    }));
    this.subscriptions.add(atom.workspace.observeActivePaneItem((item) => {
      if (item && isElmEditor(item)) {
        const editor = item;
        setImports(sidekick, editor);
        setToken(sidekick, editor);
      }
    }));
    // Resize pane to 1/4.
    this.parents('.pane')[0].style['flex-grow'] = 0.5;
  }

  detached() {
    this.subscriptions.dispose();
    _.values(this.watchers).forEach((watcher) => {
      watcher.close();
    });
    this.watchers = {};
  }

  sendProjectPkgs(sidekick, editor) {
    const sendNewPkgs = () => {
      let json = null;
      try {
        json = JSON.parse(fs.readFileSync(path.join(projectDirectory, 'elm-package.json')).toString());
      } catch(e) {
      }
      if (!json || !json.dependencies || !(json.dependencies instanceof Object)) {
        return;
      }
      const pkgs = _.keys(json.dependencies);
      sidekick.ports.newPkgs.send(pkgs);
    };
    const editorFilePath = editor.getPath();
    if (!editorFilePath) {
      return;
    }
    const projectDirectory = helper.getProjectDirectory(path.dirname(editorFilePath));
    if (projectDirectory === null) {
      return;
    }
    sendNewPkgs();
    if (this.watchers[projectDirectory]) {
      // Watcher already exists.
      return;
    }
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
      }
    });
    watcher.on('add', (filename) => {
      if (filename === 'elm-package.json') {
        sendNewPkgs();
      }
    });
    watcher.on('change', (filename) => {
      if (filename !== 'elm-package.json') {
        sendNewPkgs();
      }
    });
  }

  getURI() {
    return 'elm-fu-sidekick-view://';
  }

  getTitle() {
    return 'Elm-Fu Sidekick';
  }

}

function isElmEditor(editor) {
  return editor && editor.getPath && editor.getPath() && path.extname(editor.getPath()) === '.elm';
}

function setToken(sidekick, editor) {
  sidekick.ports.tokens.send(getToken(editor));
}

function setImports(sidekick, editor) {
  sidekick.ports.rawImports.send(parseImports(editor));
}

function clearSidekick(sidekick) {
  sidekick.ports.rawImports.send([]);
  sidekick.ports.tokens.send('');
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

function parseImports(editor) {
	const text = editor.getText();
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
