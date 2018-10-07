'use babel';

import childProcess from 'child_process';
import path from 'path';
import { renderToStaticMarkup } from 'react-dom/server';
import _ from 'underscore-plus';
import fs from 'fs-extra';
const atomLinter = require('atom-linter');
import { Range } from 'atom';
import formatting from './formatting';
import helper from './helper';
import SetMainPathsView from './set-main-paths-view';

export default class ElmMakeRunner {
  constructor(quickFix) {
    this.quickFix = quickFix;

    this.setMainPathsView = new SetMainPathsView();
    this.setMainPathsView.onDidConfirm(({ projectDirectory, mainPaths }) => {
      const jsonFilePath = path.join(projectDirectory, 'elmjutsu-config.json');
      let json;
      if (helper.fileExists(jsonFilePath)) {
        json = fs.readJsonSync(jsonFilePath, { throws: false });
        if (!json) {
          atom.notifications.addError('Error reading `elmjutsu-config.json`', {
            dismissable: true,
          });
          return;
        }
        json.mainPaths = mainPaths;
      } else {
        json = { mainPaths: mainPaths };
      }
      fs.writeJsonSync(jsonFilePath, json);
      atom.notifications.addSuccess(
        'Set main paths to `[' +
          mainPaths.map(mainPath => '"' + mainPath + '"').join(', ') +
          ']` in `elmjutsu-config.json`',
        {}
      );
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
    const alwaysCompileMain =
      atom.config.get('elmjutsu.alwaysCompileMain') === true;
    const editorFilePath = editor.getPath();
    const projectDirectory = helper.getProjectDirectory(editorFilePath);
    const localExecOption =
      atom.config.get('elmjutsu.useNodeModulesBin') === true
        ? { directory: projectDirectory, prepend: true }
        : undefined;

    let filePathsToCompile = [editorFilePath];
    if (alwaysCompileMain) {
      const mainFilePaths = this.getMainFilePaths(projectDirectory);
      if (mainFilePaths) {
        filePathsToCompile = mainFilePaths;
      } else {
        return [];
      }
    }

    const outputPath = '/dev/null'; // TODO: Make this configurable.
    let args = ['make', '--report=json', '--output=' + outputPath].concat(
      filePathsToCompile
    );
    // const cwd = path.dirname(editorFilePath);

    return atomLinter
      .exec(atom.config.get('elmjutsu.elmExecPath'), args, {
        uniqueKey: 'elm make: ' + projectDirectory,
        stream: 'both', // stdout and stderr
        cwd: projectDirectory,
        local: localExecOption
      })
      .then(data => {
        // console.log('data', data);
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
                    this.toProblemFilePath(error.path, projectDirectory),
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
                      filePath: this.toProblemFilePath(
                        error.path,
                        projectDirectory
                      ),
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

  toProblemFilePath(filePath, projectDirectory) {
    if (filePath.startsWith(projectDirectory + path.sep)) {
      // `filePath` is already an absoute path, so just return it.
      return filePath;
    }
    if (filePath.startsWith('.' + path.sep)) {
      // `filePath` is not normalized (e.g. '././A.elm'), convert to absoute path.
      return path.join(projectDirectory, path.normalize(filePath));
    }
    // `filePath` is a relative path, convert to an absoute path.
    return path.resolve(projectDirectory, filePath);
  }

  setMainPathsCommand() {
    const editor = atom.workspace.getActiveTextEditor();
    if (!helper.isElmEditor(editor)) {
      return;
    }
    const editorFilePath = editor.getPath();
    const projectDirectory = helper.getProjectDirectory(editorFilePath);
    if (!projectDirectory) {
      return;
    }
    const jsonFilePath = path.join(projectDirectory, 'elmjutsu-config.json');
    let json;
    if (helper.fileExists(jsonFilePath)) {
      json = fs.readJsonSync(jsonFilePath, { throws: false });
    }
    const mainPaths = (json && json.mainPaths) || [];
    this.setMainPathsView.show(
      editorFilePath.replace(projectDirectory + path.sep, ''),
      projectDirectory,
      mainPaths
    );
  }

  getMainFilePaths(projectDirectory) {
    const elmJsonFilePath = path.join(projectDirectory, 'elm.json');
    if (!helper.fileExists(elmJsonFilePath)) {
      return null;
    }
    const elmJson = fs.readJsonSync(elmJsonFilePath, { throws: false });
    if (!elmJson) {
      return null;
    }
    const elmjutsuConfigJsonFilePath = path.join(
      projectDirectory,
      'elmjutsu-config.json'
    );
    let elmjutsuConfigJson;
    if (helper.fileExists(elmjutsuConfigJsonFilePath)) {
      elmjutsuConfigJson = fs.readJsonSync(elmjutsuConfigJsonFilePath, {
        throws: false,
      });
    }
    const mainPaths = elmjutsuConfigJson && elmjutsuConfigJson.mainPaths;
    const errorDetail =
      'Note that "Always Compile Main" is ON.  You can do one of the following:\n' +
      ' - Turn off "Always Compile Main" in the package settings to compile the active file instead.\n' +
      ' - Set the main paths of the project using `Elmjutsu: Set Main Paths`. (Saves the main paths to `elmjutsu-config.json`.)\n' +
      ' - Put a `Main.elm` file in at least one of the source directories.';
    // If `mainPaths` exists, use that.
    if (mainPaths && mainPaths.length > 0) {
      const BreakException = {};
      try {
        return mainPaths.map(mainPath => {
          const mainFilePath = path.resolve(projectDirectory, mainPath);
          if (!helper.fileExists(mainFilePath)) {
            atom.notifications.addError(
              'The main path `' + mainPath + '` does not exist',
              {
                detail: errorDetail,
                dismissable: true,
              }
            );
            throw BreakException;
          }
          const isMainPathInsideSourceDirectory = (
            sourceDirectories,
            filePath
          ) => {
            // TODO Check if `sourceDirectories` is an array of strings.
            if (sourceDirectories) {
              for (let i in sourceDirectories) {
                const sourceDirectory = sourceDirectories[i];
                if (
                  filePath.startsWith(
                    path.resolve(projectDirectory, sourceDirectory) + path.sep
                  )
                ) {
                  return true;
                }
              }
            }
            return false;
          };
          if (
            !isMainPathInsideSourceDirectory(
              elmJson['source-directories'],
              mainFilePath
            )
          ) {
            atom.notifications.addError(
              'The main path `' +
                mainPath +
                '` is not inside a source directory',
              {
                detail: errorDetail,
                dismissable: true,
              }
            );
            throw BreakException;
          }
          return mainFilePath;
        });
      } catch (e) {
        if (e !== BreakException) {
          return null;
        }
      }
    } else {
      // Else, look for `Main.elm` files in the source directories.
      // TODO Check if `sourceDirectories` is an array of strings.
      const sourceDirectories = elmJson['source-directories'];
      if (sourceDirectories) {
        const mainFilePaths = sourceDirectories
          .map(sourceDirectory => {
            return path.join(projectDirectory, sourceDirectory, 'Main.elm');
          })
          .filter(mainFilePath => {
            return helper.fileExists(mainFilePath);
          });
        if (mainFilePaths.length > 0) {
          return mainFilePaths;
        } else {
          atom.notifications.addError(
            'Could not find `Main.elm` in `[' +
              sourceDirectories
                .map(directory => '"' + directory + '"')
                .join(', ') +
              ']`',
            {
              detail: errorDetail,
              dismissable: true,
            }
          );
        }
      }
    }
    return null;
  }
}

function formatIssue(filePath, message, range) {
  const messagesEnhanced =
    atom.config.get('elmjutsu.enhancedElmMakeMessages') === true;
  if (messagesEnhanced) {
    // message = relayoutTexts(message);
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

// function relayoutTexts(message) {
//   // Replace newlines (\n) with spaces (keeps all \n\n).
//   let updatedMessage = [];
//   const messageLength = message.length;
//   for (let i = 0; i < messageLength; ++i) {
//     const part = message[i];
//     if (part.string) {
//       updatedMessage.push(part);
//     } else {
//       updatedMessage.push(
//         part
//           .split(/\n\n/g)
//           .map(text => {
//             return text.replace(/(?!^)\n/g, ' ');
//           })
//           .join('\n\n')
//       );
//     }
//   }
//   return updatedMessage;
// }
