'use babel';

import {Range} from 'atom';
import path from 'path';
import fs from 'fs-extra';
import _ from 'underscore-plus';
import unicodeHelper from './unicode-helper';

export default {

  getToken(editor) {
    const scopeDescriptor = editor.scopeDescriptorForBufferPosition(editor.getCursorBufferPosition());
    // if (this.isScopeAString(scopeDescriptor) || this.isScopeAComment(scopeDescriptor)) {
    if (this.isScopeAString(scopeDescriptor)) {
      return null;
    }
    const cursor = editor.getLastCursor();
    const startPoint = cursor.getBeginningOfCurrentWordBufferPosition({wordRegex: this.tokenRegex(), allowPrevious: false});
    if (!startPoint) {
      return null;
    }
    const column = editor.getCursorBufferPosition().column - startPoint.column;
    const token = editor.getWordUnderCursor({wordRegex: this.tokenRegex()}).trim();
    return this.getTokenPartAtColumn(token, column);
  },

  getTokenPartAtColumn(token, column) {
    if (token.length > 0) {
      const lastIndex = token.lastIndexOf('.', column - 1);
      const firstIndex = token.indexOf('.', lastIndex + 1);
      let index = -1;
      if (lastIndex > -1) {
        if (firstIndex <= -1) {
          index = token.length;
        } else {
          index = firstIndex;
        }
      } else {
        index = firstIndex;
      }
      if (index > -1) {
        return token.slice(0, index);
      }
      return token;
    }
    return null;
  },

  // If the token is "A.B.C.foo", return true if the cursor is after the last period.
  isCursorAtLastPartOfToken(editor) {
    const token = this.getToken(editor);
    if (token) {
      const word = editor.getWordUnderCursor({wordRegex: this.tokenRegex()}).trim();
      return !isCapitalized(token) || token === word;
    }
    return null;
  },

  tokenRegex() {
    return new RegExp('[\\d' + unicodeHelper.letters() + '~`!@#\\$%\\^&\\*_\\-\\+=:;\\|\\\\<>\\.\\?\\/]+|\\(,+\\)');
  },

  blockRegex() {
    return /(^{-\|([\s\S]*?)-}\s*|)(^(?!-|{)([^:=\s]+)\s*(:|)(\s*(?:.|\r|\n)*?(?=\n^\S|$(?![\r\n]))))/gm;
  },

  moduleOrImportBlockRegex() {
    return /^(port module|module|import)\s/;
  },

  infixRegex() {
    return /^(infix(?:l|r|))\s+(\d)\s+(.+)/;
  },

  typeAliasBlockRegex() {
    return /^type alias\s/;
  },

  typeBlockRegex() {
    return /^type\s/;
  },

  portBlockRegex() {
    return /^port\s/;
  },

  moduleNameRegex() {
    return /(?:^|\n)((effect|port)\s+)?module\s+([\w\.]+)(?:\s+exposing\s*\(((?:\s*(?:\w+|\(.+\))\s*,)*)\s*((?:\.\.|\w+|\(.+\)))\s*\))?(\s*^{-\|([\s\S]*?)-}|)/m;
  },

  importRegex() {
    return /(?:^|\n)import\s([\w\.]+)(?:\s+as\s+(\w+))?(?:\s+exposing\s*\(((?:\s*(?:\w+|\(.+\)|\w+\(.+\))\s*,)*)\s*((?:\.\.|\w+|\(.+\)|\w+\(.+\)))\s*\))?/g;
  },

  allImportsRegex() {
    // TODO: Make this work even if there are comments.
    return /((?:^|\n+)import\s([\w\.]+)(?:\s+as\s+(\w+))?(?:\s+exposing\s*\(((?:\s*(?:\w+|\(.+\)|\w+\(.+\))\s*,)*)\s*((?:\.\.|\w+|\(.+\)|\w+\(.+\)))\s*\))?)+/m;
  },

  isScopeAString({scopes}) {
    return _.contains(scopes, 'string.quoted.double.elm');
  },

  isScopeAComment({scopes}) {
    return _.contains(scopes, 'comment.block.elm') || _.contains(scopes, 'comment.line.double-dash.elm');
  },

  isInfix(token) {
    if (!token) {
      return false;
    }
    // Backtick (`), underscore (_), and semicolon (;) are not allowed in infixes.
    return new RegExp(/^[~!@#\$%\^&\*\-\+=:\|\\<>\.\?\/]+$/).test(token);
  },

  commentsRegex() {
    return /--.*$|{-[\s\S]*-}/gm;
  },

  removeComments(code) {
    return code.replace(this.commentsRegex(), '');
  },

  formatSymbolName(valueName) {
    // Strip parentheses in value name (such as in infixes).
    return valueName.trim().replace(/\(|\)/g, '');
  },

  formatTipe(tipe) {
    // Replace whitespaces with single spaces, then remove comments.
    return this.removeComments(tipe.trim().replace(/( |\n)+/g, ' '));
  },

  getActiveTopLevel(editor, position) {
    position = position || editor.getCursorBufferPosition();
    let activeTopLevel = null;
    editor.backwardsScanInBufferRange(this.blockRegex(), [[0, 0], position], ({match, stop}) => {
      stop();
      const block = match[3];
      if (!this.moduleOrImportBlockRegex().test(block) &&
          !this.typeAliasBlockRegex().test(block) &&
          !this.typeBlockRegex().test(block) &&
          !this.portBlockRegex().test(block)) {
            activeTopLevel = this.formatSymbolName(match[4]);
      }
    });
    return activeTopLevel;
  },

  getTypeAnnotationAbove(editor) {
    let typeAnnotation = null;
    editor.backwardsScanInBufferRange(this.blockRegex(), [[0, 0], [editor.getCursorBufferPosition().row, 0]], ({match, range, stop}) => {
      stop();
      const block = match[3];
      if (!this.moduleOrImportBlockRegex().test(block) &&
          !this.typeAliasBlockRegex().test(block) &&
          !this.typeBlockRegex().test(block) &&
          !this.portBlockRegex().test(block)) {
            const text = block.replace(/\n/g, ' ');
            if (/^\S+\s*:/.test(text)) {
              typeAnnotation = text;
            }
      }
    });
    return typeAnnotation;
  },

  scanForSymbolDefinitionRange(editor, symbol, func) {
    let symbolDefinitionRegex;
    const sourcePathParts = symbol.sourcePath.split(this.filePathSeparator());
    const topLevel = sourcePathParts.length > 1 ? sourcePathParts[1] : null;
    const nameParts = symbol.fullName.split('.');
    const symbolName = nameParts[nameParts.length - 1];
    if (topLevel) {
      sourcePathParts.pop();
      sourcePathParts.pop();
      const numRecordLevels = sourcePathParts.length;
      // TODO: This will not work if there are nested records with the same field names.
      let recordLevelsRegex = '';
      for (let i = 0; i <= numRecordLevels; ++i) {
        recordLevelsRegex += '{(?:.|\\n)*?';
      }
      const recordRegex = '^(?:(?:type alias)\\s+)(?:' + _.escapeRegExp(topLevel) + ')(?:\\s+(?:.|\\n)*?' + recordLevelsRegex + ')(?:\\s*|,|{)(' + _.escapeRegExp(symbolName) + ')(?:\\s|:)|';
      const prefixedRegex = '^(?:(?:import|type alias|type|port)\\s+)(' + _.escapeRegExp(symbolName) + ')(?:\\s|$)|';
      const functionArgRegex = '^(?:\\(?' + _.escapeRegExp(topLevel) + '\\)?)(?:\\s(?!:).*)(' + _.escapeRegExp(symbolName) + ')';
      symbolDefinitionRegex = new RegExp(recordRegex + prefixedRegex + functionArgRegex, 'mg');
    } else {
      const tipeCaseRegex = symbol.caseTipe ? '^(?:type\\s+' + _.escapeRegExp(symbol.caseTipe) + '(?:.|\\n)*?(?:(?:=|\\|)\\s+))(' + _.escapeRegExp(symbolName) + ')(?:\\s|$)|' : '';
      const prefixedRegex = '^(?:(?:import|type alias|type|port)\\s+)(' + _.escapeRegExp(symbolName) + ')(?:\\s|$)|';
      const moduleRegex = '^(?:(?:port module|module)\\s+)(' + _.escapeRegExp(symbolName) + ')(?:\\s|$)|';
      const functionRegex = '^(\\(?' + _.escapeRegExp(symbolName) + '\\)?)(?:\\s(?!:.*))';
      symbolDefinitionRegex = new RegExp(tipeCaseRegex + prefixedRegex + moduleRegex + functionRegex, 'mg');
    }
    editor.scanInBufferRange(symbolDefinitionRegex, [[0, 0], editor.getEofBufferPosition()], ({match, range, stop}) => {
      const scopeDescriptor = editor.scopeDescriptorForBufferPosition(range.start);
      if (!this.isScopeAString(scopeDescriptor) && !this.isScopeAComment(scopeDescriptor)) {
        stop();
        const symbolMatch = match[1] || match[2] || match[3];
        const matchLines = match[0].replace(/\n$/, '').split('\n');
        const matchEndsInNewline = match[0].endsWith('\n');
        const lastMatchLine = matchLines[matchLines.length-1];
        const rowOffset = matchLines.length - 1 + (lastMatchLine.length === 0 ? -1 : 0);
        const columnOffset = lastMatchLine.length > 0 ? lastMatchLine.length - symbolMatch.length - 1 + (matchEndsInNewline ? 1 : 0) + (topLevel && match[3] ? 1 : 0) : 0;
        const symbolRange = new Range(range.start.translate([rowOffset, columnOffset]), range.start.translate([rowOffset, columnOffset + symbolMatch.length]));
        func(symbolRange);
      }
    });
  },

  flashRange(editor, range, klass) {
    if (editor.elmjutsuFlashMarker) {
      editor.elmjutsuFlashMarker.destroy();
    }
    editor.elmjutsuFlashMarker = editor.markBufferRange(range, {invalidate: 'touch', persistent: false});
    editor.decorateMarker(editor.elmjutsuFlashMarker, {type: 'highlight', class: klass});
    setTimeout(() => {
      if (editor && editor.elmjutsuFlashMarker) {
        editor.elmjutsuFlashMarker.destroy();
        editor.elmjutsuFlashMarker = null;
      }
    }, 300);
  },

  getTipeParts(sig) {
    if (!sig || sig.length === 0) {
      return [];
    }
    let parts = [];
    let i = 0;
    let openParens = {'()' : 0, '{}' : 0};
    let acc = '';
    const n = sig.length;
    while (i < n) {
      const ch = sig[i];
      if (openParens['()'] === 0 && openParens['{}'] === 0 &&
          ch === '-' && (i + 1 < n) && sig[i + 1] === '>') {
        parts.push(acc.trim());
        acc = '';
        i += 2;
      } else {
        switch (ch) {
          case '(': openParens['()']++; break;
          case ')': openParens['()']--; break;
          case '{': openParens['{}']++; break;
          case '}': openParens['{}']--; break;
        }
        acc += ch;
        i++;
        if (i === n) {
          parts.push(acc.trim());
        }
      }
    }
    return parts;
  },

  getArgsParts(argsString) {
    if (!argsString || argsString.length === 0) {
      return [];
    }
    let parts = [];
    let i = 0;
    let openParens = {'()' : 0, '{}' : 0};
    let acc = '';
    const n = argsString.length;
    while (i < n) {
      const ch = argsString[i];
      if (openParens['()'] === 0 && openParens['{}'] === 0 && ch === ' ') {
        parts.push(acc.trim());
        acc = '';
        i ++;
      } else {
        switch (ch) {
          case '(': openParens['()']++; break;
          case ')': openParens['()']--; break;
          case '{': openParens['{}']++; break;
          case '}': openParens['{}']--; break;
        }
        acc += ch;
        i++;
        if (i === n) {
          parts.push(acc.trim());
        }
      }
    }
    return parts;
  },

  defaultImports() {
    return [
      'import Basics exposing (..)',
      // 'import List exposing ( List, (::) )',
      'import List exposing ( (::) )',
      'import Maybe exposing ( Maybe( Just, Nothing ) )',
      'import Result exposing ( Result( Ok, Err ) )',
      // 'import String',
      // 'import Tuple',
      'import Debug',
      'import Platform exposing ( Program )',
      'import Platform.Cmd exposing ( Cmd, (!) )',
      'import Platform.Sub exposing ( Sub )'
    ].join('\n');
  },

  // Remove type annotation (e.g. return `"abc"` from `"abc" : String`).
  // TODO: Handle `<function:xxx>` (currently returns `<function`).
  removeTypeAnnotation(str) {
    if (!/^[\[\(\{]/.test(str)) {
      const doubleQuoted = str.match(/\"(\\.|[^\"])*\"/);
      if (doubleQuoted) {
        return doubleQuoted[0];
      }
      const singleQuoted = str.match(/\'(\\.|[^\'])*\'/);
      if (singleQuoted) {
        return singleQuoted[0];
      }
      return str.split(':')[0].trim();
    }
    // Based on http://stackoverflow.com/questions/15717436/js-regex-to-match-everything-inside-braces-including-nested-braces-i-want/27088184#27088184
    let currPos = 0;
    let openParens = {'[]': 0, '()': 0, '{}': 0};
    let stillSearching = true;
    let waitForChar = false;
    while (stillSearching && currPos <= str.length) {
      let currChar = str.charAt(currPos);
      if (!waitForChar) {
        switch (currChar) {
          case '[': openParens['[]']++; break;
          case ']': openParens['[]']--; break;
          case '(': openParens['()']++; break;
          case ')': openParens['()']--; break;
          case '{': openParens['{}']++; break;
          case '}': openParens['{}']--; break;
          case '"':
          case "'":
            waitForChar = currChar;
            break;
          case '/':
            let nextChar = str.charAt(currPos + 1);
            if (nextChar === '/') {
              waitForChar = '\n';
            } else if (nextChar === '*') {
              waitForChar = '*/';
            }
        }
      } else {
        if (currChar === waitForChar) {
          if (waitForChar === '"' || waitForChar === "'") {
            if (str.charAt(currPos - 1) !== '\\') {
              waitForChar = false;
            }
          } else {
            waitForChar = false;
          }
        } else if (currChar === '*') {
          if (str.charAt(currPos + 1) === '/') {
            waitForChar = false;
          }
        }
      }
      currPos++;
      if (openParens['[]'] === 0 &&
          openParens['()'] === 0 &&
          openParens['{}'] === 0) {
        stillSearching = false;
      }
    }
    return str.slice(0, currPos);
  },

  getProjectDirectory(filePath) {
    return this.getProjectDirectoryRecur(path.dirname(filePath));
  },

  // Copied from `linter-elm-make`.
  getProjectDirectoryRecur(directory) {
    if (this.fileExists(path.join(directory, 'elm-package.json'))) {
      return directory;
    } else {
      const parentDirectory = path.join(directory, '..');
      if (parentDirectory === directory) {
        atom.notifications.addError('Could not find `elm-package.json`.', {
          dismissable: true
        });
        return null;
      } else {
        return this.getProjectDirectoryRecur(parentDirectory);
      }
    }
  },

  fileExists(filePath) {
    try {
      if (fs.statSync(filePath)) {
        return true;
      }
    } catch (e) {
    }
    return false;
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

  log(msg, color) {
    if (atom.inDevMode()) {
      if (color) {
        console.log('[elmjutsu] %c' + msg, 'color:' + color + ';');
      } else {
        console.log('[elmjutsu] ' + msg);
      }
    }
  },

  markRange(editor, range, klass) {
    const marker = editor.markBufferRange(range, {invalidate: 'never', persistent: false});
    const decor = editor.decorateMarker(marker, {type: 'highlight', class: klass});
    return marker;
  },

  getPackageDocsPrefix() {
    return 'http://package.elm-lang.org/packages/';
  },

  readJson(filePath) {
    try {
      return fs.readJsonSync(filePath);
    } catch(e) {
      this.log('Error reading ' + filePath + ': ' + e, 'red');
      return null;
    }
  },

  writeJson(filePath, json) {
    try {
      fs.writeJsonSync(filePath, json, {spaces: 4});
      return true;
    } catch(e) {
      this.log('Error writing to ' + filePath + ': ' + e, 'red');
    }
    return false;
  },

  getLeadingSpaces(text) {
    const numLeadingSpaces = text.search(/\S|$/) + 1;
    return new Array(numLeadingSpaces).join(' ');
  },

  usagesViewURI() {
    return 'elmjutsu-usages-view://';
  },

  holeToken() {
    return '?';
  },

  tabSpaces() {
    return '    ';
  },

  filePathSeparator() {
    return ' > ';
  }

};

function isCapitalized(token) {
  return token[0] === token[0].toUpperCase();
}
