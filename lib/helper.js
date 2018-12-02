'use babel';

import { Point, Range } from 'atom';
import path from 'path';
import os from 'os';
import fs from 'fs-extra';
import _ from 'underscore-plus';
import unicodeHelper from './unicode-helper';
import childProcess from 'child_process';
import cmp from 'semver-compare';

let $fileProjectDirectories = {};
let $editorActiveTopLevels = {};

export default {
  getToken(editor) {
    const startTime = this.getTimestamp();
    const position = editor.getCursorBufferPosition();
    const scopeDescriptor = editor.scopeDescriptorForBufferPosition(position);
    // if (this.isScopeAString(scopeDescriptor) || this.isScopeAComment(scopeDescriptor)) {
    if (this.isScopeAString(scopeDescriptor)) {
      return null;
    }
    const cursor = editor.getLastCursor();
    const startPoint = cursor.getBeginningOfCurrentWordBufferPosition({
      wordRegex: this.tokenRegex(),
      allowPrevious: false,
    });
    if (!startPoint) {
      return null;
    }
    const column = position.column - startPoint.column;
    const token = editor
      .getWordUnderCursor({ wordRegex: this.tokenRegex() })
      .trim();
    const tokenPart = this.getTokenPartAtColumn(token, column);
    this.debugLog(
      'getToken ' + tokenPart + ' ' + (this.getTimestamp() - startTime) + ' ms'
    );
    return tokenPart;
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

  getTokenRange(editor, position) {
    let scanRange = [[position.row, 0], position];
    let beginningOfWordPosition = position;
    editor.backwardsScanInBufferRange(
      this.tokenRegex(),
      scanRange,
      ({ range, matchText, stop }) => {
        if (matchText !== '' || range.start.column !== 0) {
          if (range.start.isLessThan(position)) {
            if (range.end.isGreaterThanOrEqual(position)) {
              beginningOfWordPosition = range.start;
            }
            stop();
          }
        }
      }
    );
    scanRange = [position, editor.getEofBufferPosition()];
    let endOfWordPosition = position;
    editor.scanInBufferRange(
      this.tokenRegex(),
      scanRange,
      ({ range, matchText, stop }) => {
        if (matchText !== '' || range.start.column !== 0) {
          if (range.end.isGreaterThan(position)) {
            if (range.start.isLessThanOrEqual(position)) {
              endOfWordPosition = range.end;
            }
          }
          stop();
        }
      }
    );
    let tokenRange = new Range(beginningOfWordPosition, endOfWordPosition);
    const column = position.column - beginningOfWordPosition.column;
    const token = editor.getTextInBufferRange(tokenRange);
    const tokenPart = this.getTokenPartAtColumn(token, column);
    if (tokenPart) {
      tokenRange = new Range(
        tokenRange.start,
        tokenRange.start.translate([0, tokenPart.length])
      );
    }
    return tokenRange;
  },

  // If the token is "A.B.C.foo", return true if the cursor is after the last period.
  isCursorAtLastPartOfToken(editor) {
    const token = this.getToken(editor);
    if (token) {
      const word = editor
        .getWordUnderCursor({ wordRegex: this.tokenRegex() })
        .trim();
      return !isCapitalized(token) || token === word;
    }
    return null;
  },

  tokenRegex() {
    return new RegExp(
      '[\\d' +
        unicodeHelper.letters() +
        '~`!@#\\$%\\^&\\*_\\-\\+=:;\\|\\\\<>\\.\\?\\/]+|\\(,+\\)'
    );
  },

  blockRegex() {
    return /(^{-\|([\s\S]*?)-}\s*|)(^(?!-|{)([^:=\s]+)\s*(:|)(\s*(?:.|\r|\n)*?(?=\n^\S|$(?![\r\n]))))/gm;
  },

  topLevelRegex() {
    return /(^{-\|([\s\S]*?)-}\s*|)(^(?!-|{)(type\s+alias|[^:=\s]+)\s*(:|))/gm;
  },

  typeAnnotationAboveRegex() {
    return /(^{-\|([\s\S]*?)-}\s*|)(^(?!-|{)([^:=\s]+)\s*(:|)(\s*(?:.|\r|\n)*?$))/gm;
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

  moduleNameBlockRegex() {
    return /(?:^|\n)((effect|port)\s+)?module\s+([\w\.]+)(\s*(?:.|\r|\n)*?(?=\n^\S|$(?![\r\n])))/m;
  },

  importRegex() {
    return /(?:^|\n)import\s([\w\.]+)(?:\s+as\s+(\w+))?(?:\s+exposing\s*\(((?:\s*(?:\w+|\(.+\)|\w+\(.+\))\s*,)*)\s*((?:\.\.|\w+|\(.+\)|\w+\(.+\)))\s*\))?/g;
  },

  allImportsRegex() {
    // TODO: Make this work even if there are comments.
    return /((?:^|\n+)import\s([\w\.]+)(?:\s+as\s+(\w+))?(?:\s+exposing\s*\(((?:\s*(?:\w+|\(.+\)|\w+\(.+\))\s*,)*)\s*((?:\.\.|\w+|\(.+\)|\w+\(.+\)))\s*\))?)+/m;
  },

  isScopeAString({ scopes }) {
    return (
      _.contains(scopes, 'string.quoted.double.elm') ||
      _.contains(scopes, 'string.quoted.triple.elm')
    );
  },

  isScopeAComment({ scopes }) {
    return (
      _.contains(scopes, 'comment.block.elm') ||
      _.contains(scopes, 'comment.line.double-dash.elm')
    );
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
    const startTime = this.getTimestamp();
    if (!position && $editorActiveTopLevels[editor.id]) {
      this.debugLog(
        'getActiveTopLevel (from cache) ' +
          $editorActiveTopLevels[editor.id] +
          ' ' +
          (this.getTimestamp() - startTime) +
          ' ms'
      );
      return $editorActiveTopLevels[editor.id];
    }
    if (!this.isElmEditor(editor)) {
      return null;
    }
    position = position || editor.getCursorBufferPosition();
    let activeTopLevel = null;
    let block = null;
    let matchRange = null;
    if (
      position.column === 0 &&
      !/^(\s|)$/.test(
        editor.getTextInBufferRange([position, position.translate([0, 1])])
      )
    ) {
      editor.scanInBufferRange(
        this.topLevelRegex(),
        [position, editor.getEofBufferPosition()],
        ({ match, range, stop }) => {
          if (match && match.length > 3) {
            stop();
            if (!this.moduleOrImportBlockRegex().test(match[3])) {
              block = match[3];
              matchRange = range;
            }
          }
        }
      );
    } else {
      editor.backwardsScanInBufferRange(
        this.topLevelRegex(),
        [[0, 0], position],
        ({ match, range, stop }) => {
          if (match && match.length > 3) {
            stop();
            if (!this.moduleOrImportBlockRegex().test(match[3])) {
              block = match[3];
              matchRange = range;
            }
          }
        }
      );
    }
    if (block && matchRange) {
      let prefix = '';
      const prefixes = _.sortBy(['type alias ', 'type ', 'port '], s => {
        return -s.length;
      });
      for (let p of prefixes) {
        if (block.startsWith(p)) {
          prefix = p;
          break;
        }
      }
      editor.scanInBufferRange(
        /(\S+)\s/,
        [
          matchRange.start.translate([0, prefix.length]),
          editor.getEofBufferPosition(),
        ],
        ({ match, stop }) => {
          if (match && match.length > 1) {
            stop();
            if (!_.contains(prefixes, match[1] + ' ')) {
              activeTopLevel = this.formatSymbolName(match[1]);
            }
          }
        }
      );
    }
    this.debugLog(
      'getActiveTopLevel ' +
        activeTopLevel +
        ' ' +
        (this.getTimestamp() - startTime) +
        ' ms'
    );
    $editorActiveTopLevels[editor.id] = activeTopLevel;
    return activeTopLevel;
  },

  getActiveRecordVariable(editor, position) {
    const startTime = this.getTimestamp();
    if (!atom.config.get('elmjutsu.recordFieldsCompletionEnabled')) {
      return null;
    }
    if (!this.isElmEditor(editor)) {
      return null;
    }
    position = position || editor.getCursorBufferPosition();
    let activeRecordVariable = null;
    let pipeOrComma = null;
    let pipeOrCommaPosition = null;
    const prefix = editor.getTextInBufferRange([[position.row, 0], position]);
    const suffix = editor.getTextInBufferRange([
      position,
      [position.row, editor.getBuffer().lineLengthForRow(position.row)],
    ]);
    let prefixMatch = prefix.match(/(,|\s+\|)(\s+)(\S*)$/);
    let suffixMatch = suffix.match(/^(\s*$|\S*\s+=|\s*})/);
    if (
      prefixMatch &&
      prefixMatch.length > 3 &&
      suffixMatch &&
      suffixMatch.length > 1
    ) {
      pipeOrComma = prefixMatch[1].trim();
      pipeOrCommaPosition = position.translate([
        0,
        -prefixMatch[2].length - prefixMatch[3].length - pipeOrComma.length,
      ]);
    }
    // Check if we're inside a record.
    if (['|', ','].includes(pipeOrComma)) {
      const topLevelPosition = this.getTopLevelPosition(editor, position);
      if (pipeOrComma === '|') {
        const codeToCheck = editor.getTextInBufferRange([
          topLevelPosition,
          pipeOrCommaPosition,
        ]);
        const match = codeToCheck.match(/{\s*(\S+)\s+$/);
        if (match && match.length > 1) {
          activeRecordVariable = match[1];
        }
      } else if (pipeOrComma === ',') {
        editor.backwardsScanInBufferRange(
          /{\s*(\S+)\s+\||(?:{)/,
          [topLevelPosition, pipeOrCommaPosition],
          ({ match, stop }) => {
            stop();
            if (match && match.length > 1) {
              if (match[1]) {
                activeRecordVariable = match[1];
              }
            }
          }
        );
      }
    }
    this.debugLog(
      'getActiveRecordVariable ' +
        activeRecordVariable +
        ' ' +
        (this.getTimestamp() - startTime) +
        ' ms'
    );
    return activeRecordVariable;
  },

  getTypeAnnotationAbove(editor) {
    let typeAnnotation = null;
    editor.backwardsScanInBufferRange(
      this.typeAnnotationAboveRegex(),
      [[0, 0], [editor.getCursorBufferPosition().row, 0]],
      ({ match, range, stop }) => {
        if (match && match.length > 3) {
          stop();
          const block = match[3];
          if (
            !this.moduleOrImportBlockRegex().test(block) &&
            !this.typeAliasBlockRegex().test(block) &&
            !this.typeBlockRegex().test(block) &&
            !this.portBlockRegex().test(block)
          ) {
            const text = block.replace(/\n/g, ' ');
            if (/^\S+\s*:/.test(text)) {
              typeAnnotation = text;
            }
          }
        }
      }
    );
    return typeAnnotation;
  },

  scanForSymbolDefinitionRange(editor, symbol, func) {
    let symbolDefinitionRegex;
    const sourcePathParts = symbol.sourcePath.split(this.filePathSeparator());
    const topLevel = sourcePathParts.length > 1 ? sourcePathParts[1] : null;
    let nameParts = symbol.fullName.split('.');
    const symbolName = nameParts[nameParts.length - 1];
    let numJumps =
      nameParts.length === 2 && nameParts[0] === nameParts[1] ? 2 : 1;
    if (topLevel) {
      sourcePathParts.pop();
      sourcePathParts.pop();
      const numRecordLevels = sourcePathParts.length;
      // TODO: Make this work for nested records with the same field names.
      let recordLevelsRegex = '';
      for (let i = 0; i <= numRecordLevels; ++i) {
        recordLevelsRegex += '{(?:.|\\n)*?';
      }
      const recordRegex =
        '^(?:(?:type alias)\\s+)(?:' +
        _.escapeRegExp(topLevel) +
        ')(?:\\s+(?:.|\\n)*?' +
        recordLevelsRegex +
        ')(?:\\s*|,|{)(' +
        _.escapeRegExp(symbolName) +
        ')(?:\\s|:)|';
      const prefixedRegex =
        '^(?:(?:import|type alias|type|port)\\s+)(' +
        _.escapeRegExp(symbolName) +
        ')(?:\\s|$)|';
      const functionArgRegex =
        '^(?:\\(?' +
        _.escapeRegExp(topLevel) +
        '\\)?)(?:\\s(?!:).*)(' +
        _.escapeRegExp(symbolName) +
        ')';
      symbolDefinitionRegex = new RegExp(
        recordRegex + prefixedRegex + functionArgRegex,
        'mg'
      );
    } else {
      const tipeCaseRegex = symbol.caseTipe
        ? '^(?:type\\s+' +
          _.escapeRegExp(symbol.caseTipe) +
          '(?:.|\\n)*?(?:(?:=|\\|)\\s+))(' +
          _.escapeRegExp(symbolName) +
          ')(?:\\s|$)|'
        : '';
      const prefixedRegex =
        '^(?:(?:import|type alias|type|port)\\s+)(' +
        _.escapeRegExp(symbolName) +
        ')(?:\\s|$)|';
      const moduleRegex =
        '^(?:(?:port module|module)\\s+)(' +
        _.escapeRegExp(symbolName) +
        ')(?:\\s|$)|';
      const functionRegex =
        '^(\\(?' + _.escapeRegExp(symbolName) + '\\)?)(?:\\s(?!:.*))';
      symbolDefinitionRegex = new RegExp(
        tipeCaseRegex + prefixedRegex + moduleRegex + functionRegex,
        'mg'
      );
    }
    editor.scanInBufferRange(
      symbolDefinitionRegex,
      [[0, 0], editor.getEofBufferPosition()],
      ({ match, range, stop }) => {
        if (match && match.length > 0) {
          if (--numJumps === 0) {
            const scopeDescriptor = editor.scopeDescriptorForBufferPosition(
              range.start
            );
            if (
              !this.isScopeAString(scopeDescriptor) &&
              !this.isScopeAComment(scopeDescriptor)
            ) {
              stop();
              const symbolMatch = match[1] || match[2] || match[3];
              const matchLines = match[0].replace(/\n$/, '').split('\n');
              const matchEndsInNewline = match[0].endsWith('\n');
              const lastMatchLine = matchLines[matchLines.length - 1];
              const rowOffset =
                matchLines.length - 1 + (lastMatchLine.length === 0 ? -1 : 0);
              const columnOffset =
                lastMatchLine.length > 0
                  ? lastMatchLine.length -
                    symbolMatch.length -
                    1 +
                    (matchEndsInNewline ? 1 : 0) +
                    (topLevel && match[3] ? 1 : 0)
                  : 0;
              const symbolRange = new Range(
                range.start.translate([rowOffset, columnOffset]),
                range.start.translate([
                  rowOffset,
                  columnOffset + symbolMatch.length,
                ])
              );
              func(symbolRange);
            }
          }
        }
      }
    );
  },

  flashRange(editor, range, klass) {
    if (editor.elmjutsuFlashMarker) {
      editor.elmjutsuFlashMarker.destroy();
    }
    editor.elmjutsuFlashMarker = editor.markBufferRange(range, {
      invalidate: 'touch',
      persistent: false,
    });
    editor.decorateMarker(editor.elmjutsuFlashMarker, {
      type: 'highlight',
      class: klass,
    });
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
    let openParens = { '()': 0, '{}': 0 };
    let acc = '';
    const n = sig.length;
    while (i < n) {
      const ch = sig[i];
      if (
        openParens['()'] === 0 &&
        openParens['{}'] === 0 &&
        ch === '-' &&
        i + 1 < n &&
        sig[i + 1] === '>'
      ) {
        parts.push(acc.trim());
        acc = '';
        i += 2;
      } else {
        switch (ch) {
          case '(':
            openParens['()']++;
            break;
          case ')':
            openParens['()']--;
            break;
          case '{':
            openParens['{}']++;
            break;
          case '}':
            openParens['{}']--;
            break;
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
    let openParens = { '()': 0, '{}': 0 };
    let acc = '';
    const n = argsString.length;
    while (i < n) {
      const ch = argsString[i];
      if (openParens['()'] === 0 && openParens['{}'] === 0 && ch === ' ') {
        parts.push(acc.trim());
        acc = '';
        i++;
      } else {
        switch (ch) {
          case '(':
            openParens['()']++;
            break;
          case ')':
            openParens['()']--;
            break;
          case '{':
            openParens['{}']++;
            break;
          case '}':
            openParens['{}']--;
            break;
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

  defaultImports(elmVersion) {
    const usingPre0_19ElmVersion = this.isPre0_19ElmVersion(elmVersion);
    if (usingPre0_19ElmVersion) {
      return [
        'import Basics exposing (..)',
        'import Debug',
        'import List exposing (List, (::))',
        'import Maybe exposing (Maybe(Just, Nothing))',
        'import Result exposing (Result(Ok, Err))',
        'import Platform exposing (Program)',
        'import Platform.Cmd as Cmd exposing (Cmd, (!))',
        'import Platform.Sub as Sub exposing (Sub)',
        'import String exposing (String)',
        'import Tuple',
      ].join('\n');
    } else {
      return [
        'import Basics exposing (..)',
        'import Char exposing (Char)',
        'import Debug',
        'import List exposing ((::))',
        'import Maybe exposing (Maybe(..))',
        'import Result exposing (Result(..))',
        'import Platform exposing (Program)',
        'import Platform.Cmd as Cmd exposing (Cmd)',
        'import Platform.Sub as Sub exposing (Sub)',
        'import String exposing (String)',
        'import Tuple',
      ].join('\n');
    }
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
    let openParens = { '[]': 0, '()': 0, '{}': 0 };
    let stillSearching = true;
    let waitForChar = false;
    while (stillSearching && currPos <= str.length) {
      let currChar = str.charAt(currPos);
      if (!waitForChar) {
        switch (currChar) {
          case '[':
            openParens['[]']++;
            break;
          case ']':
            openParens['[]']--;
            break;
          case '(':
            openParens['()']++;
            break;
          case ')':
            openParens['()']--;
            break;
          case '{':
            openParens['{}']++;
            break;
          case '}':
            openParens['{}']--;
            break;
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
      if (
        openParens['[]'] === 0 &&
        openParens['()'] === 0 &&
        openParens['{}'] === 0
      ) {
        stillSearching = false;
      }
    }
    return str.slice(0, currPos);
  },

  getProjectDirectory(filePath) {
    if ($fileProjectDirectories[filePath]) {
      return $fileProjectDirectories[filePath];
    }
    const startingDirectory = path.dirname(filePath);
    const projectDirectory = this.getProjectDirectoryRecur(
      startingDirectory,
      startingDirectory
    );
    // Cache project directory for `filePath`.
    this.setProjectDirectory(filePath, projectDirectory);
    return projectDirectory;
  },

  setProjectDirectory(filePath, projectDirectory) {
    $fileProjectDirectories[filePath] = projectDirectory;
  },

  unsetProjectDirectory(editor) {
    delete $fileProjectDirectories[editor.getPath()];
  },

  unsetActiveTopLevel(editor) {
    delete $editorActiveTopLevels[editor.id];
  },

  // From `linter-elm-make`.
  getProjectDirectoryRecur(directory, startingDirectory) {
    if (
      this.fileExists(path.join(directory, 'elm.json')) ||
      this.fileExists(path.join(directory, 'elm-package.json'))
    ) {
      return directory;
    } else {
      const parentDirectory = path.join(directory, '..');
      if (parentDirectory === directory) {
        const notification = atom.notifications.addError(
          'Could not find `elm.json` (for Elm version >= 0.19.0) or `elm-package.json` (for Elm version <= 0.18.0).<br><br>' +
            'Do you want me to run `elm init` in `' +
            startingDirectory +
            '`?',
          {
            dismissable: true,
            buttons: [
              {
                text: 'Yes, run `elm init`',
                onDidClick: () => {
                  this.executeElmInit(startingDirectory);
                  notification.dismiss();
                },
              },
              {
                text: 'No, thanks',
                onDidClick: () => {
                  notification.dismiss();
                },
              },
            ],
          }
        );
        return null;
      } else {
        return this.getProjectDirectoryRecur(
          parentDirectory,
          startingDirectory
        );
      }
    }
  },

  getAbsoluteExecutablePath(projectDirectory, configExecutablePath) {
    const relativePath = path.join(
      projectDirectory,
      configExecutablePath.trim()
    );
    if (this.fileExists(relativePath)) {
      return relativePath;
    } else if (this.fileExists(configExecutablePath)) {
      return configExecutablePath;
    } else {
      return null;
    }
  },

  executeElmInit(projectDirectory) {
    const elmExecPath = this.getAbsoluteExecutablePath(
      projectDirectory,
      atom.config.get('elmjutsu.elmExecPath')
    );
    if (!elmExecPath) {
      atom.notifications.addError('Elm init error', {
        detail: 'Please check the value of `Elm Path` in the Settings view.',
        dismissable: true,
      });
      return;
    }
    const proc = childProcess.spawn(elmExecPath, ['init'], {
      cwd: projectDirectory,
    });
    let outString = '';
    let errString = '';
    proc.stdout.on('data', data => {
      outString = data.toString();
      if (outString.endsWith('[Y/n]: ')) {
        setTimeout(() => {
          const notification = atom.notifications.addInfo(
            outString.replace(/\n/g, '<br>'),
            {
              dismissable: true,
              buttons: [
                {
                  text: 'Yes, create an elm.json file',
                  onDidClick: () => {
                    proc.stdin.write('Y' + os.EOL);
                    proc.stdin.end();
                    outString += ' Y';
                    notification.dismiss();
                  },
                },
                {
                  text: 'No, thanks',
                  onDidClick: () => {
                    proc.stdin.write('n' + os.EOL);
                    proc.stdin.end();
                    outString += ' n';
                    notification.dismiss();
                  },
                },
              ],
            }
          );
        }, 0);
      }
    });
    proc.stderr.on('data', data => {
      errString += data.toString();
    });
    proc.on('error', err => {
      errString = err.toString();
    });
    proc.on('close', (code, _signal) => {
      if (code === 0) {
        atom.notifications.addSuccess(outString.replace(/\n/g, '<br>'), {
          dismissable: true,
        });
      } else {
        atom.notifications.addError(errString.replace(/\n/g, '<br>'), {
          dismissable: true,
        });
      }
    });
  },

  getElmVersion(projectDirectory) {
    // For Elm version >= 0.19.0:
    let elmJson = null;
    try {
      elmJson = JSON.parse(
        fs.readFileSync(path.join(projectDirectory, 'elm.json')).toString()
      );
    } catch (e) {}
    if (elmJson && elmJson instanceof Object) {
      return elmJson['elm-version'].split(' ').shift();
    } else {
      // For Elm version <= 0.18.0:
      return '0.18.0';
    }
  },

  isPre0_19ElmVersion(elmVersion) {
    return cmp(elmVersion, '0.19.0') < 0;
  },

  fileExists(filePath) {
    try {
      if (fs.statSync(filePath)) {
        return true;
      }
    } catch (e) {}
    return false;
  },

  isElmEditor(editor) {
    return (
      editor &&
      editor.getPath &&
      editor.getPath() &&
      path.extname(editor.getPath()) === '.elm' &&
      !editor.isRemote // `isRemote` is set to `true` by Atom Teletype.  We'll ignore remote editors for now.
    );
    // TODO: Do not check for `editor.isRemote` anymore once Atom Teletype shares the entire project directory.
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

  debugLog(msg, color) {
    if (atom.config.get('elmjutsu.logDebugMessages')) {
      if (color) {
        console.log('[elmjutsu] %c' + msg, 'color:' + color + ';');
      } else {
        console.log('[elmjutsu] ' + msg);
      }
    }
  },

  getTimestamp() {
    return performance.now();
  },

  markRange(editor, range, klass) {
    const marker = editor.markBufferRange(range, {
      invalidate: 'never',
      persistent: false,
    });
    const decor = editor.decorateMarker(marker, {
      type: 'highlight',
      class: klass,
    });
    return marker;
  },

  forceActivateAutocomplete(editor) {
    const autocompletePackage = atom.packages.getActivePackage(
      'autocomplete-plus'
    );
    if (autocompletePackage) {
      const autocompleteManager =
        autocompletePackage.mainModule.autocompleteManager ||
        autocompletePackage.mainModule.getAutocompleteManager();
      // Temporarily disable auto confirm single suggestion.
      const origAutoConfirmSingleSuggestionEnabled =
        autocompleteManager.autoConfirmSingleSuggestionEnabled;
      autocompleteManager.autoConfirmSingleSuggestionEnabled = false;
      if (editor) {
        const editorView = atom.views.getView(editor);
        if (editorView) {
          atom.commands.dispatch(editorView, 'autocomplete-plus:activate', {
            activatedManually: true,
          });
          let onAutocompleteActivate = atom.commands.onDidDispatch(event => {
            if (event.type === 'autocomplete-plus:activate') {
              // Revert auto confirm single suggestion.
              autocompleteManager.autoConfirmSingleSuggestionEnabled = origAutoConfirmSingleSuggestionEnabled;
            }
            onAutocompleteActivate.dispose();
          });
          return onAutocompleteActivate;
        }
      }
    }
    return null;
  },

  getTopLevelPosition(editor, currentPosition) {
    let topLevelPosition = new Point(0, 0);
    editor.backwardsScanInBufferRange(
      this.topLevelRegex(),
      [currentPosition, topLevelPosition],
      ({ range, stop }) => {
        stop();
        topLevelPosition = range.start;
      }
    );
    return topLevelPosition;
  },

  getNonWhitespacePosition(
    editor,
    endPosition,
    startPosition,
    currentPosition
  ) {
    let tokenPosition = currentPosition;
    editor.backwardsScanInBufferRange(
      /(?:\s)(\S)/,
      [endPosition, startPosition],
      ({ range, stop }) => {
        stop();
        tokenPosition = range.start;
      }
    );
    return tokenPosition;
  },

  getPackageDocsPrefix() {
    return 'http://package.elm-lang.org/packages/';
  },

  readJson(filePath) {
    try {
      return fs.readJsonSync(filePath);
    } catch (e) {
      this.debugLog('Error reading ' + filePath + ': ' + e, 'red');
      return null;
    }
  },

  writeJson(filePath, json) {
    try {
      fs.writeJsonSync(filePath, json, { spaces: 4 });
      return true;
    } catch (e) {
      this.debugLog('Error writing to ' + filePath + ': ' + e, 'red');
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

  unknownName() {
    return '□';
  },

  holeToken() {
    return '?';
  },

  tabSpaces() {
    return '    ';
  },

  filePathSeparator() {
    return ' > ';
  },

  doInTempEditor(func) {
    let tempEditor = atom.workspace.buildTextEditor();
    func(tempEditor);
    tempEditor.destroy();
    tempEditor = null;
  },

  notifyError(message, detail) {
    atom.notifications.addError(message, {
      detail,
      dismissable: true,
    });
  },

  dummyModule() {
    return 'ElmjutsuDumMyM0DuL3';
  },

  getIndexerCmds() {
    return [
      'docsDownloaded',
      'downloadDocsFailed',
      'dependenciesNotFound',
      'readPackageDocs',
      'showAddImportView',
      'updateImports',
      'suggestionsForImportReceived',
      'hintsForPartialReceived',
      'fieldsForRecordVariableReceived',
      'fromTypeAnnotationConstructed',
      'caseOfConstructed',
      'defaultArgumentsConstructed',
      'defaultValueForTypeConstructed',
      'aliasesOfTypeReceived',
      'showGoToSymbolView',
      'canGoToDefinitionReplied',
      'docsRead',
      'readingPackageDocs',
      'downloadingPackageDocs',
      'importersForTokenReceived',
      'goToDefinition',
      'activeTokenHintsChanged',
      'activeFileChanged',
      'tokenInfoReceived',
      'functionsMatchingTypeReceived',
      'signatureHelpReceived',
    ];
  },

  getIndexerSubs() {
    return [
      'docsRead',
      'downloadMissingPackageDocs',
      'configChanged',
      'fileContentsChanged',
      'fileContentsRemoved',
      'updateActiveFile',
      'clearLocalHintsCache',
      'updateActiveToken',
      'inferenceEntered',
      'projectDependenciesChanged',
      'addImport',
      'showAddImportView',
      'getSuggestionsForImport',
      'getHintsForPartial',
      'getFieldsForRecordVariable',
      'constructFromTypeAnnotation',
      'constructCaseOf',
      'constructDefaultArguments',
      'constructDefaultValueForType',
      'getAliasesOfType',
      'goToDefinition',
      'showGoToSymbolView',
      'askCanGoToDefinition',
      'getImportersForToken',
      'getTokenInfo',
      'getFunctionsMatchingType',
      'getSignatureHelp',
    ];
  },
};

function isCapitalized(token) {
  return token[0] === token[0].toUpperCase();
}

function containsPath(superPath, subPath) {
  return superPath.startsWith(subPath);
}
