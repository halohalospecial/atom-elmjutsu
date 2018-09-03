'use babel';

import childProcess from 'child_process';
import path from 'path';
import { renderToStaticMarkup } from 'react-dom/server';
import _ from 'underscore-plus';
import tmp from 'tmp';
import fs from 'fs-extra';
const atomLinter = require('atom-linter');
import { Range } from 'atom';
import formatting from './formatting';
import helper from './helper';

export default class ElmMakeRunner {
  constructor(quickFix) {
    this.quickFix = quickFix;
    this.actualToTempFileMapping = {};
    this.tempToActualFileMapping = {};
  }

  forceCompile(editor) {
    editor.transact(() => {
      const origRanges = editor.getSelectedBufferRanges();
      // This triggers the lint() function when `lintOnFly` is `true`:
      editor.setText(editor.getText());
      editor.setSelectedBufferRanges(origRanges);
    });
  }

  compile(editor) {
    const self = this;
    if (atom.config.get('elmjutsu.runElmMake') === 'never') {
      return null;
    }
    if (!helper.isElmEditor(editor)) {
      return null;
    }
    const isCompilingOnTheFly =
      atom.config.get('elmjutsu.runElmMake') === 'on the fly';
    const editorFilePath = editor.getPath();

    if (isCompilingOnTheFly) {
      if (!this.actualToTempFileMapping[editorFilePath]) {
        // Create a temporary Elm file and assign its name to the file path.
        const tempFile = tmp.fileSync({ prefix: 'elmjutsu-', postfix: '.elm' });
        this.actualToTempFileMapping[editorFilePath] = tempFile.name;
        // Reverse lookup.
        this.tempToActualFileMapping[tempFile.name] = editorFilePath;
      }
      // Write text to temp file.
      fs.writeFileSync(
        this.actualToTempFileMapping[editorFilePath],
        editor.getText()
      );
    }
    const projectDirectory = helper.getProjectDirectory(editorFilePath);
    const tempFiles = this.getTempFilesForProjectDirectory(projectDirectory);
    const filePathsToCompile =
      isCompilingOnTheFly && tempFiles.length > 0
        ? tempFiles
        : [editorFilePath];
    const outputPath = '/dev/null'; // TODO: Make this configurable.
    let args = ['make', '--report=json', '--output=' + outputPath].concat(
      filePathsToCompile
    );
    // const cwd = path.dirname(editorFilePath);
    const cwd = projectDirectory;

    return atomLinter
      .exec(atom.config.get('elmjutsu.elmExecPath'), args, {
        uniqueKey: 'elm make: ' + projectDirectory,
        stream: 'both', // stdout and stderr
        cwd,
        // env: process.env,
      })
      .then(data => {
        // Killed processes return null.
        if (data === null) {
          return null;
        }

        if (data.stderr.length > 0) {
          let result;
          try {
            result = JSON.parse(data.stderr);
          } catch (e) {
            atom.notifications.addError('Elm make error', {
              detail:
                'Error parsing output. Please check the value of `Elm Path` in the Settings view.',
              dismissable: true,
            });
            return null;
          }
          if (result.type === 'compile-errors') {
            const issues = _.flatten(
              result.errors.map(error => {
                return error.problems.map(problem => {
                  // const title = result.title;
                  const range = new Range(
                    [
                      problem.region.start.line - 1,
                      problem.region.start.column - 1,
                    ],
                    [problem.region.end.line - 1, problem.region.end.column - 1]
                  );
                  return formatIssue(
                    this.toProblemFilePath(error.path, cwd),
                    problem.message,
                    range
                  );
                });
              })
            );
            self.quickFix.computeFixes(
              _.flatten(
                result.errors.map(error => {
                  return error.problems.map(problem => {
                    const range = new Range(
                      [
                        problem.region.start.line - 1,
                        problem.region.start.column - 1,
                      ],
                      [
                        problem.region.end.line - 1,
                        problem.region.end.column - 1,
                      ]
                    );
                    return {
                      filePath: this.toProblemFilePath(error.path, cwd),
                      message: problem.message,
                      range,
                    };
                  });
                })
              )
            );
            return issues;
          } else if (result.type === 'error') {
            // const title = result.title;
            const range = new Range([0, 0], [0, 0]);
            self.quickFix.computeFixes([
              {
                filePath: editorFilePath,
                message: result.message,
                range,
              },
            ]);
            return [formatIssue(editorFilePath, result.message, range)];
          }
        }
        self.quickFix.computeFixes([]);
        return [];
      });
  }

  setEditorDestroyed(editor) {
    if (!helper.isElmEditor(editor)) {
      return;
    }
    const filePath = editor.getPath();
    const tempFilePath = this.actualToTempFileMapping[filePath];
    if (tempFilePath) {
      fs.removeSync(tempFilePath);
      delete this.actualToTempFileMapping[filePath];
      delete this.tempToActualFileMapping[tempFilePath];
    }
  }

  toProblemFilePath(filePath, cwd) {
    let problemFilePath = this.tempToActualFileMapping[filePath] || filePath;
    if (problemFilePath.startsWith('.' + path.sep)) {
      // `problemFilePath` has a relative path (e.g. `././A.elm`) . Convert to absolute.
      problemFilePath = path.join(cwd, path.normalize(problemFilePath));
    }
    return problemFilePath;
  }

  getTempFilesForProjectDirectory(projectDirectory) {
    return _
      .pairs(this.actualToTempFileMapping)
      .filter(([actualFilePath, tempFilePath]) => {
        return actualFilePath.startsWith(projectDirectory + path.sep);
      })
      .map(([actualFilePath, tempFilePath]) => {
        return tempFilePath;
      });
  }
}

function formatIssue(filePath, message, range) {
  const messagesEnhanced =
    atom.config.get('elmjutsu.enhancedElmMakeMessages') === true;
  if (messagesEnhanced) {
    message = relayoutTexts(message);
    message = removeCodeSnippet(message);
  }
  const jsx = formatting.formatMessage(message, messagesEnhanced);
  if (range.isEmpty()) {
    range = range.translate([0, 0], [0, 1]);
  }
  return {
    type: 'error',
    html: renderToStaticMarkup(jsx),
    filePath,
    range,
  };
}

function removeCodeSnippet(message) {
  let updatedMessage = [];
  const lineNumberRegex1 = /\n *\d+\|/;
  const lineNumberRegex2 = /\n *\d+\|$/;
  const regionHighlightRegex = /^\^+$/;
  const messageLength = message.length;
  let match;
  let lookingForCode = false;
  let nonCodeLine = null;
  for (let i = 0; i < messageLength; ++i) {
    let part = message[i];
    if (part.string) {
      if (part.color === 'red' && part.string === '>') {
        lookingForCode = true;
        continue;
      } else if (
        part.color === 'red' &&
        regionHighlightRegex.test(part.string)
      ) {
        continue;
      } else {
        if (!lookingForCode && nonCodeLine) {
          updatedMessage.push(removeFirstPartOfNonCodeLine(nonCodeLine));
          nonCodeLine = null;
        }
        updatedMessage.push(part);
      }
    } else {
      const segments = part.split(lineNumberRegex1);
      if (segments.length > 1) {
        part = segments[0];
      }
      match = part.match(lineNumberRegex2);
      if (match) {
        if (!lookingForCode) {
          updatedMessage.push(part.replace(lineNumberRegex2, ''));
        }
      } else {
        if (lookingForCode) {
          lookingForCode = false;
          nonCodeLine = part;
          continue;
        } else {
          if (nonCodeLine) {
            updatedMessage.push(removeFirstPartOfNonCodeLine(nonCodeLine));
            nonCodeLine = null;
          }
          updatedMessage.push(part);
        }
      }
    }
  }
  return updatedMessage;
}

function removeFirstPartOfNonCodeLine(nonCodeLine) {
  return (
    '\n' +
    nonCodeLine
      .split('\n\n')
      .slice(1)
      .join('\n\n')
  );
}

function relayoutTexts(message) {
  // Replace newlines (\n) with spaces (keeps all \n\n).
  let updatedMessage = [];
  const messageLength = message.length;
  for (let i = 0; i < messageLength; ++i) {
    const part = message[i];
    if (part.string) {
      updatedMessage.push(part);
    } else {
      updatedMessage.push(
        part
          .split(/\n\n/g)
          .map(text => {
            return text.replace(/(?!^)\n/g, ' ');
          })
          .join('\n\n')
      );
    }
  }
  return updatedMessage;
}
