'use babel';

import path from 'path';
import { renderToStaticMarkup } from 'react-dom/server';
import _ from 'underscore-plus';
import fs from 'fs-extra';
import os from 'os';
const atomLinter = require('atom-linter');
import { Range } from 'atom';
import formatting from './formatting';
import indexing from './indexing';
import evalHelper from './eval-helper';
import helper from './helper';
import SetMainPathsView from './set-main-paths-view';
import SetCompileOutputPathView from './set-compile-output-path-view';

export default class ElmMakeRunner {
  constructor(quickFix) {
    this.quickFix = quickFix;
    this.typeAnnotationMarkers = {};

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

    this.setCompileOutputPathView = new SetCompileOutputPathView();
    this.setCompileOutputPathView.onDidConfirm(
      ({ projectDirectory, outputPath }) => {
        const jsonFilePath = path.join(
          projectDirectory,
          'elmjutsu-config.json'
        );
        let json;
        if (helper.fileExists(jsonFilePath)) {
          json = fs.readJsonSync(jsonFilePath, { throws: false });
          if (!json) {
            atom.notifications.addError(
              'Error reading `elmjutsu-config.json`',
              {
                dismissable: true,
              }
            );
            return;
          }
          json.outputPath = outputPath;
        } else {
          json = { outputPath: outputPath };
        }
        fs.writeJsonSync(jsonFilePath, json);
        atom.notifications.addSuccess(
          'Set compile output to `' +
            outputPath +
            '` in `elmjutsu-config.json`',
          {}
        );
      }
    );

    atom.config.observe('elmjutsu.compileWithDebugger', compileWithDebugger => {
      if (
        compileWithDebugger &&
        atom.config.get('elmjutsu.compileWithOptimizations') === true
      ) {
        atom.config.set('elmjutsu.compileWithOptimizations', false);
        atom.notifications.addInfo('"Compile With Optimizations" is now OFF', {
          dismissable: true,
        });
      }
    });
    atom.config.observe(
      'elmjutsu.compileWithOptimizations',
      compileWithOptimizations => {
        if (
          compileWithOptimizations &&
          atom.config.get('elmjutsu.compileWithDebugger') === true
        ) {
          atom.config.set('elmjutsu.compileWithDebugger', false);
          atom.notifications.addInfo('"Compile With Debugger" is now OFF', {
            dismissable: true,
          });
        }
      }
    );
  }

  destroy() {
    destroyAllMarkers(this.typeAnnotationMarkers);
    this.typeAnnotationMarkers = null;
  }

  compile(editor) {
    const self = this;
    if (atom.config.get('elmjutsu.runElmMake') === 'never') {
      return null;
    }
    if (!helper.isElmEditor(editor)) {
      return null;
    }
    const editorFilePath = editor.getPath();
    let projectDirectory = helper.getProjectDirectory(editorFilePath);

    const isInsideTestDirectory = projectDirectory.endsWith(path.sep + 'tests');
    if (isInsideTestDirectory) {
      projectDirectory = helper.getProjectDirectory(projectDirectory);
    }

    const elmVersion = helper.getElmVersion(projectDirectory);
    if (helper.isPre0_19ElmVersion(elmVersion)) {
      return null;
    }

    const elmExecPath = atom.config.get('elmjutsu.elmExecPath');
    const elmTestExecPath = atom.config.get('elmjutsu.elmTestExecPath');
    const alwaysCompileMain =
      atom.config.get('elmjutsu.alwaysCompileMain') === true;

    const isTestFilePath =
      editorFilePath.startsWith(
        path.resolve(projectDirectory, 'tests') + path.sep
      ) || isInsideTestDirectory;

    let filePathsToCompile = [];
    if (alwaysCompileMain) {
      const elmJsonFilePath = path.join(projectDirectory, 'elm.json');
      if (!helper.fileExists(elmJsonFilePath)) {
        return null;
      }
      const elmJson = fs.readJsonSync(elmJsonFilePath, { throws: false });
      if (!elmJson) {
        return null;
      }
      const isPackageType = elmJson['type'] === 'package';

      if (isPackageType) {
        filePathsToCompile = [];
      } else {
        const mainFilePaths = this.getMainFilePaths(projectDirectory);
        if (mainFilePaths) {
          if (!isTestFilePath) {
            filePathsToCompile = mainFilePaths;
          }
        } else {
          if (!isTestFilePath) {
            return [];
          }
        }
      }
    } else {
      if (isTestFilePath && process.platform === 'win32') {
        // Workaround for https://github.com/halohalospecial/atom-elmjutsu/issues/131#issuecomment-429445645
        const relativeEditorFilePath = path.relative(
          projectDirectory,
          editorFilePath
        );
        filePathsToCompile = [relativeEditorFilePath];
      } else {
        filePathsToCompile = [editorFilePath];
      }
    }

    let args = [
      'make',
      '--report=json',
      '--output=' + this.getCompileOutputPath(projectDirectory),
    ];
    if (isTestFilePath) {
      args.unshift('--compiler=' + elmExecPath.trim());
    }
    if (atom.config.get('elmjutsu.compileWithDebugger') === true) {
      args.push('--debug');
    }
    if (atom.config.get('elmjutsu.compileWithOptimizations') === true) {
      args.push('--optimize');
    }
    args = args.concat(filePathsToCompile);

    const configExecutablePath = isTestFilePath ? elmTestExecPath : elmExecPath;
    const executablePath = helper.getAbsoluteExecutablePath(
      projectDirectory,
      configExecutablePath
    );
    if (!executablePath) {
      atom.notifications.addError('Compile error', {
        detail:
          'Please check the value of `Elm Path` and/or `Elm Test Path` in the Settings view.',
        dismissable: true,
      });
      return null;
    }

    helper.debugLog('Running ' + executablePath + ' ' + args.join(' ') + '...');
    const text = editor.getText();
    const execLocalOption =
      executablePath ===
        path.join(projectDirectory, 'node_modules', '.bin', 'elm') ||
      executablePath ===
        path.join(projectDirectory, 'node_modules', '.bin', 'elm-test')
        ? { directory: projectDirectory, prepend: true }
        : undefined;
    return new Promise(resolve => {
      atomLinter
        .exec(executablePath, args, {
          uniqueKey: 'elm make: ' + projectDirectory,
          stream: 'both', // stdout and stderr
          cwd: projectDirectory,
          env: process.env,
          local: execLocalOption,
          timeout: Infinity,
        })
        .then(data => {
          // console.log('data', data);
          // Killed processes return null.
          if (data === null) {
            return resolve(null);
          }

          destroyEditorMarkers(this.typeAnnotationMarkers, editor.id);
          this.typeAnnotationMarkers[editor.id] = [];

          if (data.stderr.length > 0) {
            let result;
            try {
              result = JSON.parse(data.stderr);
            } catch (e) {
              atom.notifications.addError('Compile error', {
                detail: data.stderr,
                dismissable: true,
              });
              return resolve(null);
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
                      [
                        problem.region.end.line - 1,
                        problem.region.end.column - 1,
                      ]
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
                editorFilePath,
                projectDirectory,
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
              return resolve(issues);
            } else if (result.type === 'error') {
              // const title = result.title;
              const range = new Range([0, 0], [0, 1]);
              self.quickFix.computeFixes(editorFilePath, projectDirectory, [
                {
                  filePath: editorFilePath,
                  message: result.message,
                  range,
                },
              ]);
              return resolve([
                formatIssue(editorFilePath, result.message, range),
              ]);
            }
          }
          if (atom.config.get('elmjutsu.reportWarnings') == true) {
            const { values } = indexing.parseModuleValues(text);
            const valuesWithoutTypeAnnotations = values.filter(({ tipe }) => {
              return tipe.trim() === '';
            });

            if (valuesWithoutTypeAnnotations.length > 0) {
              let scanStart = [0, 0];
              const namesAndRanges = valuesWithoutTypeAnnotations
                .map(({ name }) => {
                  let issueRange = null;
                  editor.scanInBufferRange(
                    new RegExp('^' + _.escapeRegExp(name) + ' '),
                    [scanStart, editor.getEofBufferPosition()],
                    ({ range, stop }) => {
                      // WARNING: This won't work if syntax highlighting is not yet finished.
                      const scopeDescriptor = editor.scopeDescriptorForBufferPosition(
                        range.start
                      );
                      if (
                        !helper.isScopeAString(scopeDescriptor) &&
                        !helper.isScopeAComment(scopeDescriptor)
                      ) {
                        stop();
                        issueRange = range.translate([0, 0], [0, -1]);
                      }
                      scanStart = range.end;
                    }
                  );
                  if (issueRange) {
                    return { name, range: issueRange };
                  } else {
                    return null;
                  }
                })
                .filter(nameAndRange => {
                  return nameAndRange !== null;
                });
              if (namesAndRanges.length > 0) {
                return this.getInferredTypeAnnotations(
                  namesAndRanges,
                  projectDirectory,
                  elmVersion,
                  editor,
                  resolve
                );
              } else {
                self.quickFix.computeFixes(
                  editorFilePath,
                  projectDirectory,
                  []
                );
                return resolve([]);
              }
            } else {
              self.quickFix.computeFixes(editorFilePath, projectDirectory, []);
              return resolve([]);
            }
          } else {
            self.quickFix.computeFixes(editorFilePath, projectDirectory, []);
            return resolve([]);
          }
        });
    });
  }

  getInferredTypeAnnotations(
    namesAndRanges,
    projectDirectory,
    elmVersion,
    editor,
    resolve
  ) {
    const text = editor.getText();
    const filePath = editor.getPath();
    const baseDummyModuleName = helper.dummyModule();
    let dummyModuleName = baseDummyModuleName;
    let code;
    helper.doInTempEditor(tempEditor => {
      tempEditor.setText(text);
      // Change module name.
      let hasModuleName = false;
      tempEditor.scanInBufferRange(
        helper.moduleNameBlockRegex(),
        [[0, 0], editor.getEofBufferPosition()],
        ({ match, matchText, stop, replace }) => {
          if (match && match.length > 3) {
            const originalModuleName = match[3];
            const originalModuleNameParts = originalModuleName.split(/\./g);
            originalModuleNameParts.pop();
            if (originalModuleNameParts.length > 0) {
              dummyModuleName =
                originalModuleNameParts.join('.') + '.' + baseDummyModuleName;
            }
            if (originalModuleName) {
              replace(
                matchText
                  .replace(
                    originalModuleName,
                    dummyModuleName + ' exposing (..)\n'
                  )
                  .replace(/^\s+/gm, '-- ')
              );
            }
            hasModuleName = true;
            stop();
          }
        }
      );
      if (!hasModuleName) {
        tempEditor.setCursorBufferPosition([0, 0]);
        tempEditor.insertText('module ' + dummyModuleName + ' exposing (..)\n');
      }
      code = tempEditor.getText();
    });

    const tempFilePath = path.join(
      path.dirname(filePath),
      baseDummyModuleName + '.elm'
    );
    // Create temp file.
    fs.writeFileSync(tempFilePath, code);

    const numOutputsNeeded = namesAndRanges.length * 2;
    const proc = evalHelper.executeElmRepl(
      projectDirectory,
      elmVersion,
      numOutputsNeeded,
      (errString, outString) => {
        // Delete temp file.
        fs.removeSync(tempFilePath);

        if (errString.length === 0) {
          const typeAnnotations = outString
            .split(os.EOL + '0 : number')
            .filter(part => {
              return part.trim().length > 0;
            });
          const issues = _.zip(namesAndRanges, typeAnnotations).map(
            ([{ name, range }, result]) => {
              result = result.split(/\s:\s/);
              result.shift();
              const typeAnnotation = result.join(' : ');
              const message = [
                'Top-level value `' +
                  name +
                  '` does not have a type annotation.\n\n' +
                  'I inferred the type annotation so you can copy it into your code:\n\n    ',
                {
                  string: name + ' : ' + typeAnnotation,
                  color: 'yellow',
                  bold: false,
                  underline: false,
                },
              ];
              let issue = formatIssue(filePath, message, range, 'warning');
              issue.filePath = filePath;
              issue.message = message;
              return issue;
            }
          );
          this.quickFix.computeFixes(
            filePath,
            projectDirectory,
            issues.map(({ filePath, message, range }) => {
              return {
                filePath,
                message,
                range,
              };
            })
          );
          this.maybeShowInferredTypeAnnotations(editor, filePath);
          resolve(issues);
        } else {
          resolve([]);
        }
      }
    );
    // Get import statements.
    const imports = evalHelper.getImports(text).join('\n');
    // Send imports to Elm REPL.
    evalHelper.sendToRepl(
      proc,
      imports + '\nimport ' + dummyModuleName + ' exposing (..)',
      elmVersion
    );
    // Send values to Elm REPL.
    namesAndRanges.forEach(({ name }) => {
      evalHelper.sendToRepl(proc, name, elmVersion);
      evalHelper.sendToRepl(proc, '0', elmVersion);
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
    const self = this;
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
            const notification = atom.notifications.addError(
              'The main path `' +
                mainPath +
                '` is not inside a source directory',
              {
                detail: errorDetail,
                dismissable: true,
                buttons: [
                  {
                    text: 'Turn off "Always Compile Main"',
                    onDidClick: () => {
                      atom.config.set('elmjutsu.alwaysCompileMain', false);
                      notification.dismiss();
                    },
                  },
                  {
                    text: 'Set the main paths',
                    onDidClick: () => {
                      self.setMainPathsCommand();
                      notification.dismiss();
                    },
                  },
                ],
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
          const notification = atom.notifications.addError(
            'Could not find `Main.elm` in `[' +
              sourceDirectories
                .map(directory => '"' + directory + '"')
                .join(', ') +
              ']`',
            {
              detail: errorDetail,
              dismissable: true,
              buttons: [
                {
                  text: 'Turn off "Always Compile Main"',
                  onDidClick: () => {
                    atom.config.set('elmjutsu.alwaysCompileMain', false);
                    notification.dismiss();
                  },
                },
                {
                  text: 'Set the main paths',
                  onDidClick: () => {
                    self.setMainPathsCommand();
                    notification.dismiss();
                  },
                },
              ],
            }
          );
        }
      }
    }
    return null;
  }

  setCompileOutputPathCommand() {
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
    const outputPath =
      (json && json.outputPath) ||
      path.basename(editorFilePath).replace('.elm', '.js');
    this.setCompileOutputPathView.show(
      editorFilePath.replace(projectDirectory + path.sep, ''),
      projectDirectory,
      outputPath
    );
  }

  getCompileOutputPath(projectDirectory) {
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
    return (elmjutsuConfigJson && elmjutsuConfigJson.outputPath) || '/dev/null';
  }

  maybeShowInferredTypeAnnotations(editor, filePath) {
    destroyEditorMarkers(this.typeAnnotationMarkers, editor.id);
    this.typeAnnotationMarkers[editor.id] = [];
    if (atom.config.get('elmjutsu.showInferredTypeAnnotations')) {
      this.quickFix
        .getFixes()
        .filter(fix => {
          return (
            fix.type === 'Add type annotation' && fix.filePath === filePath
          );
        })
        .forEach(({ range, text }) => {
          let element = document.createElement('div');
          element.classList.add('elmjutsu-inferred-type-annotation');
          element.textContent = text;
          let marker = editor.markBufferPosition(range.start);
          marker.setProperties({
            fixType: 'Add type annotation',
            fixRange: range,
          });
          editor.decorateMarker(marker, {
            type: 'block',
            position: 'before',
            item: element,
          });
          this.typeAnnotationMarkers[editor.id].push(marker);
        });
    }
  }

  toggleAlwaysCompileMainCommand() {
    const updatedAlwaysCompileMain = helper.toggleConfig(
      'elmjutsu.alwaysCompileMain'
    );
    atom.notifications.addInfo(
      '"Always Compile Main" is now ' +
        (updatedAlwaysCompileMain ? 'ON' : 'OFF'),
      { dismissable: true }
    );
  }

  toggleReportWarningsCommand() {
    const updatedReportWarnings = helper.toggleConfig(
      'elmjutsu.reportWarnings'
    );
    atom.notifications.addInfo(
      '"Report Warnings" is now ' + (updatedReportWarnings ? 'ON' : 'OFF'),
      { dismissable: true }
    );
  }

  toggleCompileWithDebuggerCommand() {
    const updatedCompileWithDebugger = helper.toggleConfig(
      'elmjutsu.compileWithDebugger'
    );
    atom.notifications.addInfo(
      '"Compile With Debugger" is now ' +
        (updatedCompileWithDebugger ? 'ON' : 'OFF'),
      { dismissable: true }
    );
  }

  toggleCompileWithOptimizationsCommand() {
    const updatedCompileWithOptimizations = helper.toggleConfig(
      'elmjutsu.compileWithOptimizations'
    );
    atom.notifications.addInfo(
      '"Compile With Optimizations" is now ' +
        (updatedCompileWithOptimizations ? 'ON' : 'OFF'),
      { dismissable: true }
    );
  }
}

function formatIssue(filePath, message, range, type) {
  const messagesEnhanced =
    atom.config.get('elmjutsu.enhancedElmMakeMessages') === true;
  if (messagesEnhanced) {
    const shadowingRegex = /^The name `.+` is first defined here:\n\n/;
    const match = message[0].match(shadowingRegex);
    if (!match) {
      // message = relayoutTexts(message);
      message = removeCodeSnippet(message);
    }
  }
  const jsx = formatting.formatMessage(message, messagesEnhanced);
  if (range.isEmpty()) {
    range = range.translate([0, 0], [0, 1]);
  }
  return {
    type: type || 'error',
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
    if (part.hasOwnProperty('string')) {
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
          if (segments.length > 1) {
            const lastSegment = segments[segments.length - 1];
            match = lastSegment.match(
              /\n\n(This `.+` value is a:|The value at .+ is a:|This argument is a .+ of type:|This argument is an anonymous function of type:|But the type annotation on `.+` says it should be:|This `.+` call produces:|The .+ branch is a .+ of type:|The .+ branch is:|This `.+` call produces:|The .+ element is a .+ of type:|The argument is:)\n\n(.|\s)+/
            );
            if (match) {
              updatedMessage.push(match[0]);
              nonCodeLine = null;
            }
          } else {
            nonCodeLine = part;
          }
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
  const lines = nonCodeLine.split('\n\n');
  if (lines.length > 1) {
    return '\n' + lines.slice(1).join('\n\n');
  } else {
    return nonCodeLine;
  }
}

function destroyEditorMarkers(editorMarkers, editorId) {
  const markers = editorMarkers[editorId];
  if (markers) {
    markers.forEach(marker => {
      marker.destroy();
    });
  }
}

function destroyAllMarkers(allMarkers) {
  Object.keys(allMarkers).forEach(editorId => {
    const markers = allMarkers[editorId];
    destroyEditorMarkers(markers, editorId);
  });
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
