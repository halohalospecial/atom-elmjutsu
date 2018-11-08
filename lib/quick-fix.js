'use babel';

import fs from 'fs-extra';
import PackageManager from './package-manager';
import helper from './helper';

export default class QuickFix {
  constructor(packageManager) {
    this.fixes = [];
    this.packageManager = packageManager;
  }

  computeFixes(projectDirectory, issues) {
    this.fixes = [];
    let regex;
    let match;
    issues.forEach(({ message, range }) => {
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
            type: 'Install package',
            text: packageName,
            range,
            projectDirectory,
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
    return this.fixes.filter(issue => {
      return issue.range.isEqual(range);
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
            if (!new RegExp('^' + fix.text + '$', 'm').test(matchText)) {
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
    }
  }
}
