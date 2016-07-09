'use babel';
// Based on https://github.com/elm-lang/elm-lang.org/tree/master/src/editor

import path from 'path';
import Elm from '../elm/hinter';

export default class Hinter {

  constructor() {
    this.element = document.createElement('div');
    this.element.classList.add('inline-block');
    const hinter = Elm.Hinter.embed(this.element);
    // TODO refresh imports after make/lint (linter-elm-make)
    const self = this;
    atom.workspace.observeActivePaneItem((item) => {
      if (item && isElmEditor(item)) {
        const editor = item;
        refreshImports(hinter, editor);
        // editor.onDidChangeCursorPosition(({newBufferPosition}) => {
        editor.onDidChangeSelectionRange(({newBufferRange}) => { // // //
          // const token = editor.getWordUnderCursor();
          const token = editor.getTextInBufferRange(newBufferRange); // // //
          console.log('token', token); // // //
          hinter.ports.tokens.send(token);
        });
        editor.onDidDestroy(() => {
          hinter.ports.rawImports.send([]);
          hinter.ports.tokens.send(null);
        });
      }
    });
  }

  destroy() {
    // TODO Remove this from status bar
  }

  getElement() {
    return this.element;
  }

}

function isElmEditor(editor) {
  return editor && editor.getPath && editor.getPath() && path.extname(editor.getPath()) === '.elm';
}

function refreshImports(hinter, editor) {
  console.log('refreshImports', parseImports(editor)); // // //
  hinter.ports.rawImports.send(parseImports(editor));
}

// function getToken() {
// 	var position = editor.getCursor();
// 	var line = position.line;
//
// 	// get the nearest token
// 	var token = editor.getTokenAt(position);
// 	if (!token.type)
// 	{
// 		token = editor.getTokenAt({ line: line, ch: position.ch + 1 });
// 	}
//
// 	// detect if token is a qualified variable and format it for Elm
// 	if (token.type === 'variable')
// 	{
// 		return expandLeft(line, token.start, token.string);
// 	}
// 	if (token.string === '.' || token.type === 'variable-2')
// 	{
// 		return expandRight(line, token.end, expandLeft(line, token.start, token.string));
// 	}
// 	if (token.type === 'builtin')
// 	{
// 		return token.string;
// 	}
// 	return null;
// }
//
//
// function expandLeft(line, start, string)
// {
// 	var token = editor.getTokenAt({ line: line, ch: start });
// 	if (start === token.start)
// 	{
// 		return string;
// 	}
// 	if (token.string === '.' || token.type === 'variable-2')
// 	{
// 		return expandLeft(line, token.start - 1, token.string + string);
// 	}
// 	return string;
// }
//
//
// function expandRight(line, end, string)
// {
// 	var token = editor.getTokenAt({ line: line, ch: end + 1 });
// 	if (end === token.end)
// 	{
// 		return string;
// 	}
// 	if (token.string === '.' || token.type === 'variable-2')
// 	{
// 		return expandRight(line, token.end, string + token.string);
// 	}
// 	if (token.type === 'variable')
// 	{
// 		return string + token.string;
// 	}
// 	return string;
// }


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
