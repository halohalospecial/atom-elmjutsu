'use babel';

import childProcess from 'child_process';
import path from 'path';
import { renderToStaticMarkup } from 'react-dom/server';
import _ from 'underscore-plus';
import { Range } from 'atom';
import formatting from './formatting';
import helper from './helper';

export default class ElmMake {
  constructor(quickFix) {
    this.quickFix = quickFix;
  }
  compile(editor) {
    const self = this;
    if (atom.config.get('elmjutsu.runElmMake') === 'never') {
      return null;
    }
    const filePath = editor.getPath();
    if (!filePath) {
      return [];
    }
    return new Promise(resolve => {
      const projectDirectory = helper.getProjectDirectory(filePath);
      const outputPath = '/dev/null';
      const args = [
        atom.config.get('elmjutsu.elmExecPath'),
        'make',
        '--report=json',
        '--output=' + outputPath,
        filePath,
      ];
      const elmMakeProcess = childProcess.exec(args.join(' '), {
        cwd: path.dirname(filePath),
      });
      const stderr = [];
      elmMakeProcess.stderr.on('data', data => {
        if (data) {
          stderr.push(data);
        }
      });
      elmMakeProcess.on('error', err => {
        atom.notifications.addError('Elm make error', {
          detail: err.toString(),
          dismissable: true,
        });
      });
      elmMakeProcess.on('close', (code, signal) => {
        // console.log('stderr', stderr.join('')); // // //
        if (stderr.length > 0) {
          let result;
          try {
            result = JSON.parse(stderr.join(''));
          } catch (e) {
            atom.notifications.addError('Elm make error', {
              detail:
                'Error parsing output. Please check the value of `Elm Path` in the Settings view.',
              dismissable: true,
            });
            return resolve([]);
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
                  return formatIssue(error.path, problem.message, range);
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
                      filePath: error.path,
                      message: problem.message,
                      range,
                    };
                  });
                })
              )
            );
            return resolve(issues);
          } else if (result.type === 'error') {
            // const title = result.title;
            const range = new Range([0, 0], [0, 0]);
            self.quickFix.computeFixes([
              {
                filePath: result.path,
                message: result.message,
                range,
              },
            ]);
            return resolve([formatIssue(filePath, result.message, range)]);
          }
        }
        self.quickFix.computeFixes([]);
        return resolve([]);
      });
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
  const lineNumberRegex1 = /\n\d+\|/;
  const lineNumberRegex2 = /\n\d+\|$/;
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
