'use babel';

const Range = require('atom').Range;
import path from 'path';
import fs from 'fs-extra';
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

  blockRegex() {
    return /(^{-\|([\s\S]*?)-}\s*|)(^(?!-|{)(\S+)\s(\s*(.|\n)*?(?=\n^\S|$(?![\r\n]))))/gm;
  },

  moduleOrImportBlockRegex() {
    return /^(port module|module|import)\s/;
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
    return /((?:^|\n)import\s([\w\.]+)(?:\s+as\s+(\w+))?(?:\s+exposing\s*\(((?:\s*(?:\w+|\(.+\)|\w+\(.+\))\s*,)*)\s*((?:\.\.|\w+|\(.+\)|\w+\(.+\)))\s*\))?)+/m;
  },

  isTokenAString({scopes}) {
    return _.contains(scopes, 'string.quoted.double.elm');
  },

  isTokenAComment({scopes}) {
    return _.contains(scopes, 'comment.block.elm') || _.contains(scopes, 'comment.line.double-dash.elm');
  },

  isInfix(token) {
    return new RegExp('^[~!@#$%^&*\\-+=:|<>.?/]+$').test(token);
  },

  formatSymbolName(valueName) {
    // Strip parentheses in value name (such as in infixes).
    return valueName.trim().replace(/\(|\)/g, '');
  },

  getActiveTopLevel(editor) {
    let activeTopLevel = null;
    editor.backwardsScanInBufferRange(this.blockRegex(), [[0, 0], editor.getCursorBufferPosition()], ({match, stop}) => {
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

  scanForSymbolDefinitionRange(editor, symbol, func) {
    const nameParts = symbol.fullName.split('.');
    const lastName = nameParts[nameParts.length - 1];
    const tipeCaseRegex = symbol.caseTipe ? '^(?:type\\s+' + _.escapeRegExp(symbol.caseTipe) + '(?:.|\\n)*?(?:(?:=|\\|)\\s+))(' + _.escapeRegExp(lastName) + ')(?:\\s|$)|' : '';
    const prefixedRegex = '^(?:(?:import|type alias|type|port)\\s+)(' + _.escapeRegExp(lastName) + ')(?:\\s|$)|';
    const moduleRegex = '^(?:(?:port module|module)\\s+)(' + _.escapeRegExp(symbol.fullName) + ')(?:\\s|$)|';
    const functionRegex = '^(\\(?' + _.escapeRegExp(lastName) + '\\)?)(?:\\s(?!:.*))';
    const symbolDefinitionRegex = new RegExp(tipeCaseRegex + prefixedRegex + moduleRegex + functionRegex, 'm');
    editor.scanInBufferRange(symbolDefinitionRegex, [[0, 0], editor.getEofBufferPosition()], ({match, range, stop}) => {
      const scopeDescriptor = editor.scopeDescriptorForBufferPosition(range.start);
      if (!this.isTokenAString(scopeDescriptor) && !this.isTokenAComment(scopeDescriptor)) {
        const symbolMatch = match[1] || match[2] || match[3];
        const matchLines = match[0].replace(/\n$/, '').split('\n');
        const matchEndsInNewline = match[0].endsWith('\n');
        const lastMatchLine = matchLines[matchLines.length-1];
        const rowOffset = matchLines.length - 1 + (lastMatchLine.length === 0 ? -1 : 0);
        const columnOffset = lastMatchLine.length > 0 ? lastMatchLine.length - symbolMatch.length - 1 + (matchEndsInNewline ? 1 : 0) : 0;
        stop();
        const symbolRange = new Range(range.start.translate([rowOffset, columnOffset]), range.start.translate([rowOffset, columnOffset + symbolMatch.length]));
        func(symbolRange);
      }
    });
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

  splitArgs(argsString) {
    if (!argsString || argsString.length === 0) {
      return [];
    }
    let args = [];
    let i = 0;
    let openParens = {'()' : 0, '{}' : 0, '[]': 0};
    let acc = '';
    const n = argsString.length;
    while (i < n) {
      const ch = argsString[i];
      if (openParens['()'] === 0 && openParens['{}'] === 0 && openParens['[]'] === 0 &&
          ch === ' ') {
        args.push(acc.trim());
        acc = '';
        i++;
      } else {
        switch (ch) {
          case '(': openParens['()']++; break;
          case ')': openParens['()']--; break;
          case '{': openParens['{}']++; break;
          case '}': openParens['{}']--; break;
          case '[': openParens['[]']++; break;
          case ']': openParens['[]']--; break;
        }
        acc += ch;
        i++;
        if (i === n) {
          args.push(acc.trim());
        }
      }
    }
    return args;
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
    return getProjectDirectoryRecur(path.dirname(filePath));
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
      // return JSON.parse(fs.readFileSync(filePath).toString());
      return fs.readJsonSync(filePath);
    } catch(e) {
      this.log('Error reading ' + filePath + ': ' + e, 'red');
      return null;
    }
  },

  writeJson(filePath, json) {
    try {
      // fs.writeFileSync(filePath, JSON.stringify(json, null, 4));
      fs.writeJsonSync(filePath, json, {spaces: 4});
      return true;
    } catch(e) {
      this.log('Error writing to ' + filePath + ': ' + e, 'red');
    }
    return false;
  }

};

// Copied from `linter-elm-make`.
function getProjectDirectoryRecur(directory) {
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
      return getProjectDirectoryRecur(parentDirectory);
    }
  }
}
