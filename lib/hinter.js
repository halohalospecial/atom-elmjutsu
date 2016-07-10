'use babel';
// Based on https://github.com/elm-lang/elm-lang.org/tree/master/src/editor

import path from 'path';
const _ = require('underscore-plus');
import Elm from '../elm/hinter';

export default class Hinter {

  constructor() {
    this.element = document.createElement('div');
    this.element.classList.add('inline-block');
    const hinter = Elm.Hinter.embed(this.element);
    var setTokenTimer = null;
    atom.workspace.observeTextEditors((editor) => {
      if (isElmEditor(editor)) {
        setImports(hinter, editor);
        setToken(hinter, editor);
        setEnabled(hinter, true);
        editor.onDidChangeCursorPosition((e) => {
          if (setTokenTimer) {
            clearTimeout(setTokenTimer);
          }
          setTokenTimer =
            setTimeout(() => {
              setToken(hinter, editor);
            }, 300);
        });
        editor.onDidStopChanging(() => {
          setImports(hinter, editor);
        });
        editor.onDidDestroy(() => {
          if (editor === atom.workspace.getActiveTextEditor()) {
            clearHinter(hinter);
          }
        });
      }
    });
    atom.workspace.observeActivePaneItem((item) => {
      if (item && isElmEditor(item)) {
        const editor = item;
        setImports(hinter, editor);
        setToken(hinter, editor);
        setEnabled(hinter, true);
      } else {
        setEnabled(hinter, false);
      }
    });
  }

  destroy() {
  }

  getElement() {
    return this.element;
  }

}

function isElmEditor(editor) {
  return editor && editor.getPath && editor.getPath() && path.extname(editor.getPath()) === '.elm';
}

function setToken(hinter, editor) {
  hinter.ports.tokens.send(getToken(editor));
  hinter.ports.enabled.send(true);
}

function setImports(hinter, editor) {
  hinter.ports.rawImports.send(parseImports(editor));
  hinter.ports.enabled.send(true);
}

function clearHinter(hinter) {
  hinter.ports.rawImports.send([]);
  hinter.ports.tokens.send('');
}

function setEnabled(hinter, enabled) {
  hinter.ports.enabled.send(enabled);
}

function getToken(editor) {
  const scopeDescriptor = editor.scopeDescriptorForBufferPosition(editor.getCursorBufferPosition());
  if (tokenIsString(scopeDescriptor) || tokenIsComment(scopeDescriptor)) {
    return '';
  }
  return editor.getWordUnderCursor({wordRegex: /[a-zA-Z0-9_\'\|!%\$\+:\-\.=<\/]+|\(,+\)/}).trim();
}

function tokenIsString({scopes}) {
  return _.isEqual(scopes, ['source.elm', 'string.quoted.double.elm']);
}

function tokenIsComment({scopes}) {
  return _.contains(scopes, 'comment.block.elm') || _.contains(scopes, 'comment.line.double-dash.elm');
}

// function tokenIsVariable({scopes}) {
//   return _.isEqual(scopes, ['source.elm']) ||
//     _.isEqual(scopes, ['source.elm', 'variable.parameter', 'support.function.elm']);
// }
//
// function tokenIsVariable2({scopes}) {
//   return _.isEqual(scopes, ['source.elm', 'constant.other.elm']) ||
//     _.isEqual(scopes, ['source.elm', 'meta.function.type-declaration.elm', 'storage.type.elm']);
// }
//
// function tokenIsBuiltin({scopes}) {
//   return _.isEqual(scopes, ['source.elm', 'keyword.operator.elm']);
// }

// Example scopes:
// "List.map":
//   "List." = ['source.elm', 'variable.parameter', 'variable.parameter']
//   "map" = ['source.elm', 'variable.parameter', 'support.function.elm']
// "Html msg":
//   "Html" = ['source.elm', 'meta.function.type-declaration.elm', 'storage.type.elm']
//   "msg" = ['source.elm', 'meta.function.type-declaration.elm', 'variable.other.generic-type.elm']
// "Sub Msg":
//   "Sub" = ['source.elm', 'meta.function.type-declaration.elm', 'storage.type.elm']
//   "Msg" = ['source.elm', 'meta.function.type-declaration.elm', 'storage.type.elm']
// "Dict.Dict":
//   "Dict" = ['source.elm', 'constant.other.elm']
//   "." = ['source.elm', 'keyword.operator.elm']
//   "Dict" = ['source.elm', 'constant.other.elm']
// ":=":
//   ":=" = ['source.elm', 'keyword.operator.elm']

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
