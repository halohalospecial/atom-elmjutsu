'use babel';

import fs from 'fs-extra';
import _ from 'underscore-plus';
import PackageManager from './package-manager';
import helper from './helper';

export default class QuickFix {
  constructor(packageManager, addImport) {
    this.fixes = [];
    this.packageManager = packageManager;
    this.addImport = addImport;
  }

  computeFixes(editorFilePath, projectDirectory, issues) {
    this.fixes = this.fixes.filter(fix => {
      return (
        (fix.type === 'Add type annotation' &&
          fix.filePath !== editorFilePath) ||
        fix.projectDirectory !== projectDirectory
      );
    });
    let regex;
    let match;
    issues.forEach(({ message, range, filePath }) => {
      // Add type annotation
      regex = /^Top-level value `.+` does not have a type annotation\./;
      match = message[0].match && message[0].match(regex);
      if (match) {
        this.fixes.push({
          projectDirectory,
          type: 'Add type annotation',
          text: message[1].string,
          range,
          filePath,
        });
        return;
      }

      for (let i = message.length - 1; i >= 0; --i) {
        // Define top-level
        regex = /I cannot find an? `(.+)` (variable):/;
        match = message[i].match && message[i].match(regex);
        if (match) {
          const name = match[1];
          const kind = match[2];
          const isLowerCase =
            name.length > 0 && name[0] === name[0].toLowerCase();
          if (isLowerCase) {
            this.fixes.unshift({
              projectDirectory,
              type: 'Define top-level',
              text: (kind === 'type' ? 'type ' : '') + name,
              range,
              kind,
              name,
            });
          }
        }

        // Add import
        regex = /I cannot find an? `(.+)` import\./;
        match = message[i].match && message[i].match(regex);
        if (match) {
          this.fixes.unshift({
            projectDirectory,
            type: 'Add import as',
            text: 'import <module> as ' + match[1],
            range,
            alias: match[1],
          });
          this.fixes.unshift({
            projectDirectory,
            type: 'Add import',
            text: 'import ' + match[1],
            range,
          });
        }

        // Install package
        if (
          message[i].color === 'GREEN' &&
          message[i].string &&
          message[i].string.startsWith('elm install ')
        ) {
          const packageName = message[i].string.replace(/^elm install /, '');
          this.fixes.unshift({
            projectDirectory,
            type: 'Install package',
            text: packageName,
            range,
            projectDirectory,
          });
        }

        regex = /Switch to \((.+)\) instead\.\n\n/;
        match = message[i].match && message[i].match(regex);
        if (match) {
          this.fixes.push({
            projectDirectory,
            type: 'Replace with',
            text: match[1],
            range,
          });
        }

        // Convert to String
        regex = /: Try using/;
        match = message[i].match && message[i].match(regex);
        if (match) {
          const converter = message[i + 1].string;
          this.fixes.push({
            projectDirectory,
            type: 'Convert using',
            text: converter,
            range,
            converter,
          });
        }

        // Convert from String
        regex = /: Want to convert a String into an? (.+)\? Use the /;
        match = message[i].match && message[i].match(regex);
        if (match) {
          const converter = message[i + 1].string;
          const defaultValue =
            match[1] === 'Int'
              ? '0'
              : match[1] === 'Float'
              ? '0.0'
              : match[1] === 'List'
              ? '[]'
              : '_';
          this.fixes.push({
            projectDirectory,
            type: 'Convert using',
            text: converter,
            range,
            converter,
            defaultValue,
          });
        }

        // Replace with
        regex = /These\snames\sseem\sclose\sthough:/;
        match = message[i].match && message[i].match(regex);
        if (match) {
          // Parse suggestions.
          for (let j = i + 1; j < message.length; ++j) {
            if (
              message[j].string &&
              message[j].string === 'Hint' &&
              message[j].underline
            ) {
              break; // for j
            } else if (message[j].string) {
              this.fixes.push({
                projectDirectory,
                type: 'Replace with',
                text: message[j].string,
                range,
              });
            }
          }
        }

        // Add missing patterns
        regex = /Missing possibilities include:\n\n    $/;
        match = message[i].match && message[i].match(regex);
        if (match) {
          // Parse missing patterns.
          let patterns = message[i + 1].string.split('\n    ');
          this.fixes.push({
            projectDirectory,
            type: 'Add missing patterns',
            text: patterns.join(' | '),
            range,
            patterns,
          });
        }
      }
    });
  }

  getFixesForRange(editor, range) {
    return this.fixes.filter(fix => {
      return fix.range.isEqual(range);
    });
  }

  getCodeActions(editor, range) {
    const self = this;
    return new Promise(resolve => {
      if (!atom.config.get('elmjutsu.codeActionsEnabled')) {
        return resolve([]);
      }
      const fixes = self.getFixesForRange(editor, range);
      if (fixes.length === 0) {
        return resolve([]);
      }
      const codeActions = fixes.map(fix => {
        return {
          apply: () => {
            return new Promise(resolve => {
              const prevActivePane = atom.workspace.getActivePane();
              self.fixProblem(editor, range, fix);
              prevActivePane.activate();
              return resolve();
            });
          },
          getTitle: () => {
            return new Promise(resolve => {
              return resolve(fix.type + ': ' + fix.text);
            });
          },
          dispose: () => {},
        };
      });
      return resolve(codeActions);
    });
  }

  fixProblem(editor, range, fix) {
    switch (fix.type) {
      case 'Replace with':
        editor.setTextInBufferRange(fix.range ? fix.range : range, fix.text);
        break;

      case 'Add missing patterns':
        editor.transact(() => {
          const leadingSpaces =
            new Array(fix.range.start.column + 1).join(' ') +
            helper.tabSpaces();
          editor.setCursorBufferPosition(fix.range.end);
          const patternsString = fix.patterns
            .map(pattern => {
              return (
                '\n\n' +
                leadingSpaces +
                pattern +
                ' ->\n' +
                leadingSpaces +
                helper.tabSpaces() +
                'Debug.todo "handle ' +
                pattern +
                '"'
              );
            })
            .join('');
          editor.insertText(patternsString);
        });
        break;

      case 'Add import':
        // Insert below the last import, or module declaration (unless already imported (as when using `Quick Fix All`)).
        let alreadyImported = false;
        const allImportsRegex = /((?:^|\n)import\s([\w\.]+)(?:\s+as\s+(\w+))?(?:\s+exposing\s*\(((?:\s*(?:\w+|\(.+\))\s*,)*)\s*((?:\.\.|\w+|\(.+\)))\s*\))?)+/m;
        editor.scanInBufferRange(
          allImportsRegex,
          [[0, 0], editor.getEofBufferPosition()],
          ({ matchText, range, stop }) => {
            if (
              !new RegExp('^' + _.escapeRegExp(fix.text) + '$', 'm').test(
                matchText
              )
            ) {
              const insertPoint = range.end.traverse([1, 0]);
              editor.setTextInBufferRange(
                [insertPoint, insertPoint],
                fix.text + '\n'
              );
            }
            alreadyImported = true;
            stop();
          }
        );
        if (!alreadyImported) {
          const moduleRegex = /(?:^|\n)((effect|port)\s+)?module\s+([\w\.]+)(?:\s+exposing\s*\(((?:\s*(?:\w+|\(.+\))\s*,)*)\s*((?:\.\.|\w+|\(.+\)))\s*\))?(\s*^{-\|([\s\S]*?)-}\s*|)/m;
          editor.scanInBufferRange(
            moduleRegex,
            [[0, 0], editor.getEofBufferPosition()],
            ({ range, stop }) => {
              const insertPoint = range.end.traverse([1, 0]);
              editor.setTextInBufferRange(
                [insertPoint, insertPoint],
                '\n' + fix.text + '\n'
              );
              alreadyImported = true;
              stop();
            }
          );
        }
        if (!alreadyImported) {
          editor.setTextInBufferRange([[0, 0], [0, 0]], fix.text + '\n');
        }
        break;

      case 'Add import as':
        this.addImport.addImportAsCommand(fix.alias);
        break;

      case 'Define top-level':
        if (fix.filePath) {
          if (fs.existsSync(fix.filePath)) {
            atom.workspace.open(fix.filePath).then(editor => {
              editor.transact(() => {
                editor.setCursorBufferPosition(editor.getEofBufferPosition());
                editor.insertText('\n\n' + fix.name + ' =\n    ');
              });
            });
          } else {
            fs.writeFileSync(
              fix.filePath,
              'module ' +
                fix.moduleName +
                ' exposing (..)\n\n' +
                fix.name +
                ' =\n    '
            );
            atom.notifications.addInfo('Created ' + fix.filePath, {
              dismissable: true,
            });
            atom.workspace.open(fix.filePath).then(editor => {
              editor.setCursorBufferPosition(editor.getEofBufferPosition());
            });
          }
        } else {
          let topLevelEnd = editor.getEofBufferPosition();
          if (fix.kind !== 'type') {
            // Look for next top-level position.
            editor.scanInBufferRange(
              helper.blockRegex(),
              [range.end, editor.getEofBufferPosition()],
              ({ matchText, range, stop }) => {
                stop();
                topLevelEnd = range.start;
              }
            );
          }
          const atEndOfFile = topLevelEnd.isEqual(
            editor.getEofBufferPosition()
          );
          editor.transact(() => {
            editor.setCursorBufferPosition(topLevelEnd);
            editor.insertText(
              (atEndOfFile ? '\n\n' : '') +
                (fix.kind === 'type' ? 'type ' : '') +
                fix.name +
                (fix.kind === 'type' ? '\n    = ' : ' =\n    ') +
                '\n\n\n'
            );
            editor.setCursorBufferPosition([
              topLevelEnd.row + (atEndOfFile ? 3 : 1),
              fix.kind === 'type' ? 6 : 4,
            ]);
          });
        }
        break;

      case 'Install package':
        this.packageManager.executeElmInstall(fix.projectDirectory, [
          'install',
          fix.text,
        ]);
        break;

      case 'Add type annotation':
        // Insert type annotation above the line.
        const leadingSpaces = new Array(range.start.column).join(' ');
        editor.setTextInBufferRange(
          [range.start, range.start],
          fix.text + '\n' + leadingSpaces
        );
        // Remove type annotation marker, if any.
        const markers = editor.findMarkers({
          fixType: 'Add type annotation',
          fixRange: range,
        });
        if (markers) {
          markers.forEach(marker => {
            marker.destroy();
          });
        }
        break;

      case 'Convert using':
        const bufferRange = fix.range ? fix.range : range;
        const rangeText = editor.getTextInBufferRange(bufferRange);
        const wrappedText = rangeText.includes(' ')
          ? '(' + rangeText + ')'
          : rangeText;
        const replacementText =
          fix.defaultValue !== undefined
            ? `(${fix.converter} ${wrappedText} |> Maybe.withDefault ${
                fix.defaultValue
              })`
            : `(${fix.converter} ${wrappedText})`;
        editor.setTextInBufferRange(bufferRange, replacementText);
        break;
    }
  }

  getFixes() {
    return this.fixes;
  }

  quickFixFileCommand() {
    const editor = atom.workspace.getActiveTextEditor();
    if (!editor) {
      return;
    }
    let markers = [];
    let marker = null;
    const fileFixes = this.fixes.filter(fix => {
      return fix.filePath === editor.getPath();
    });
    if (fileFixes) {
      editor.transact(() => {
        fileFixes.forEach(fix => {
          marker = editor.markBufferRange(fix.range, {
            invalidate: 'never',
            persistent: false,
          });
          marker.setProperties(fix);
          markers.push(marker);
        });
        markers.forEach(marker => {
          const fix = marker.getProperties();
          this.fixProblem(editor, marker.getBufferRange(), fix);
          marker.destroy();
        });
        markers = null;
      });
      this.fixes = this.fixes.filter(fix => {
        return fix.filePath !== editor.getPath();
      });
    }
  }
}
