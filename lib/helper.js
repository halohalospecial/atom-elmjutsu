'use babel';

const Range = require('atom').Range;
import path from 'path';
import fs from 'fs';
const _ = require('underscore-plus');

export default {

  getToken(editor) {
    const scopeDescriptor = editor.scopeDescriptorForBufferPosition(editor.getCursorBufferPosition());
    if (this.isTokenAString(scopeDescriptor) || this.isTokenAComment(scopeDescriptor)) {
      return '';
    }
    return editor.getWordUnderCursor({wordRegex: this.tokenRegex()}).trim();
  },

  // If the token is "A.B.C.foo", return true if the cursor is after the last period.
  isCursorAtLastPartOfToken(editor) {
    const scopeDescriptor = editor.scopeDescriptorForBufferPosition(editor.getCursorBufferPosition());
    if (this.isTokenAString(scopeDescriptor) || this.isTokenAComment(scopeDescriptor)) {
      return null;
    }
    const cursor = editor.getLastCursor();
    const startPoint = cursor.getBeginningOfCurrentWordBufferPosition({wordRegex: this.tokenRegex(), allowPrevious: false});
    if (!startPoint) {
      return null;
    }
    const column = editor.getCursorBufferPosition().column - startPoint.column;
    const token = this.getToken(editor);
    const lastIndex = token.lastIndexOf('.');
    if (lastIndex < 0 || column > lastIndex) {
      return true;
    }
    return false;
  },

  tokenRegex() {
    return /[a-zA-Z0-9_\'\|!%\$\+:\-\.=<>\/]+|\(,+\)/;
  },

  isTokenAString({scopes}) {
    return _.isEqual(scopes, ['source.elm', 'string.quoted.double.elm']);
  },

  isTokenAComment({scopes}) {
    return _.contains(scopes, 'comment.block.elm') || _.contains(scopes, 'comment.line.double-dash.elm');
  },

  scanForSymbolDefinitionRange(editor, symbol, func) {
    const nameParts = symbol.fullName.split('.');
    const lastName = nameParts[nameParts.length - 1];
    const docCommentStartRegex = '(?!{-[\\s\\S]*)';
    const tipeCaseRegex = symbol.caseTipe ? '^(?:type\\s+' + _.escapeRegExp(symbol.caseTipe) + '(?:.|\\n)*?(?:(?:=|\\|)\\s+))(' + _.escapeRegExp(lastName) + ')(?:\\s|$)|' : '';
    const prefixedRegex = '^(?:(?:import|type alias|type|port)\\s+)(' + _.escapeRegExp(lastName) + ')(?:\\s|$)|';
    const moduleRegex = '^(?:(?:port module|module)\\s+)(' + _.escapeRegExp(symbol.fullName) + ')(?:\\s|$)|';
    const functionRegex = '^(\\(?' + _.escapeRegExp(lastName) + '\\)?)(?:\\s(?!:.*))';
    const docCommentEndRegex = '(?![\\s\\S]*-})';
    // Should not be inside a commented block.
    const symbolDefinitionRegex = new RegExp(docCommentStartRegex + tipeCaseRegex + prefixedRegex + moduleRegex + functionRegex + docCommentEndRegex, 'm');
    editor.scanInBufferRange(symbolDefinitionRegex, [[0, 0], editor.getEofBufferPosition()], ({match, range, stop}) => {
      console.log('match', match); // // //
      const symbolMatch = match[1] || match[2] || match[3];
      const matchLines = match[0].replace(/\n$/, '').split('\n');
      const matchEndsInNewline = match[0].endsWith('\n');
      const lastMatchLine = matchLines[matchLines.length-1];
      const rowOffset = matchLines.length - 1 + (lastMatchLine.length === 0 ? -1 : 0);
      const columnOffset = lastMatchLine.length > 0 ? lastMatchLine.length - symbolMatch.length - 1 + (matchEndsInNewline ? 1 : 0) : 0;
      stop();
      const symbolRange = new Range(range.start.translate([rowOffset, columnOffset]), range.start.translate([rowOffset, columnOffset + symbolMatch.length]));
      func(symbolRange);
    });
  },

  // Copied from `linter-elm-make`.
  getProjectDirectory(directory) {
    if (fs.existsSync(path.join(directory, 'elm-package.json'))) {
      return directory;
    } else {
      const parentDirectory = path.join(directory, '..');
      if (parentDirectory === directory) {
        atom.notifications.addError('Could not find `elm-package.json`.', {
          dismissable: true
        });
        return null;
      } else {
        return this.getProjectDirectory(parentDirectory);
      }
    }
  },

  isElmEditor(editor) {
    return editor && editor.getPath && editor.getPath() && path.extname(editor.getPath()) === '.elm';
  },

  toggleConfig(key) {
    const oldValue = atom.config.get(key);
    const newValue = !oldValue;
    atom.config.set(key, newValue);
    return newValue;
  },

  getEditorForSourcePath(sourcePath) {
    const pane = atom.workspace.paneForURI(sourcePath);
    if (pane) {
      const item = pane.itemForURI(sourcePath);
      if (item) {
        return item;
      }
    }
    return null;
  },

  log(msg) {
    if (atom.inDevMode()) {
      console.log('[elmjutsu] ' + msg);
    }
  }

};
