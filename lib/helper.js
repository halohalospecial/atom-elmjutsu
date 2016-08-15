'use babel';

const Range = require('atom').Range;
import path from 'path';
import fs from 'fs';
const _ = require('underscore-plus');
const linter = require('atom-linter'); // TODO Use BufferedProcess instead

export default {

  tokenRegex() {
    return /[a-zA-Z0-9_\'\|!%\$\+:\-\.=<>\/]+|\(,+\)/;
  },

  getToken(editor) {
    const scopeDescriptor = editor.scopeDescriptorForBufferPosition(editor.getCursorBufferPosition());
    if (this.tokenIsString(scopeDescriptor) || this.tokenIsComment(scopeDescriptor)) {
      return '';
    }
    return editor.getWordUnderCursor({wordRegex: this.tokenRegex()}).trim();
  },

  tokenIsString({scopes}) {
    return _.isEqual(scopes, ['source.elm', 'string.quoted.double.elm']);
  },

  tokenIsComment({scopes}) {
    return _.contains(scopes, 'comment.block.elm') || _.contains(scopes, 'comment.line.double-dash.elm');
  },

  scanForSymbolDefinitionRange(editor, symbol, func) {
    const nameParts = symbol.fullName.split('.');
    const lastName = nameParts[nameParts.length - 1];
    const prefixedRegex = '^(?:(?:port module|module|import|type alias|type|port)\\s+)(' + _.escapeRegExp(lastName) + ')(?:\\s|$)|';
    const tipeCaseRegex = symbol.caseTipe ? '^(?:type\\s+' + _.escapeRegExp(symbol.caseTipe) + '(?:.|\\n)*?(?:(?:=|\\|)\\s+))(' + _.escapeRegExp(lastName) + ')(?:\\s|$)|' : '';
    const defaultRegex = '^(\\(?' + _.escapeRegExp(lastName) + '\\)?)(?:\\s(?!:.*))';
    // Should not be inside a commented block.
    const docCommentStartRegex = '(?!{-[\\s\\S]*)';
    const docCommentEndRegex = '(?![\\s\\S]*-})';
    const symbolDefinitionRegex = new RegExp(docCommentStartRegex + tipeCaseRegex + prefixedRegex + defaultRegex + docCommentEndRegex, 'm');
    editor.scanInBufferRange(symbolDefinitionRegex, [[0, 0], editor.getEofBufferPosition()], ({match, range, stop}) => {
      const symbolMatch = match[1] || match[2];
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

  // Copied from `linter-elm-make`.
  getProjectBuildArtifactsDirectory(filePath) {
    if (filePath) {
      const projectDirectory = this.getProjectDirectory(path.dirname(filePath));
      if (projectDirectory === null) {
        return null;
      }
      const elmMakePath = atom.config.get('linter-elm-make.elmMakeExecutablePath');
      return linter.exec(elmMakePath, ['--help'], {
        stream: 'stdout',
        cwd: projectDirectory,
        env: process.env
      })
      .then(data => {
        var elmPlatformVersion = data.split('\n')[0].match(/\(Elm Platform (.*)\)$/)[1];
        let json = (() => {
          try {
            return JSON.parse(fs.readFileSync(path.join(projectDirectory, 'elm-package.json')).toString());
          } catch (error) {
          }
        })();
        if (json) {
          if (json.repository && json.version) {
            const matches = json.repository.match(/^(.+)\/(.+)\/(.+)\.git$/);
            const user = matches[2];
            const project = matches[3];
            if (user && project) {
              return path.join(projectDirectory, 'elm-stuff', 'build-artifacts', elmPlatformVersion, user, project, json.version);
            } else {
              atom.notifications.addError('Could not determine the value of "user" and/or "project"', {
                dismissable: true
              });
            }
          } else {
            atom.notifications.addError('Field "repository" and/or "version" not found in elm-package.json', {
              dismissable: true
            });
          }
        } else {
          atom.notifications.addError('Error parsing elm-package.json', {
            dismissable: true
          });
        }
      })
      .catch(errorMessage => {
        atom.notifications.addError('Failed to run ' + elmMakePath, {
          detail: errorMessage,
          dismissable: true
        });
        return null;
      });
    }
    return null;
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
  }

};
