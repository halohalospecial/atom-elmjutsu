'use babel';

import { Range, CompositeDisposable } from 'atom';
import path from 'path';
import _ from 'underscore-plus';
const atomLinter = require('atom-linter');
import indexing from './indexing';
import helper from './helper';
import elmMakeHelper from './elm-make-helper';

export default class InferTypes {
  constructor(indexer) {
    this.indexer = indexer;
    this.markers = [];
    this.subscriptions = new CompositeDisposable();
    this.progressIndicators = {};
    let inferTypeDebouncer = null;
    this.subscriptions.add(
      atom.textEditors.observe(editor => {
        if (helper.isElmEditor(editor)) {
          let editorSubscriptions = new CompositeDisposable();
          this.subscriptions.add(editorSubscriptions);
          editorSubscriptions.add(
            editor.onDidStopChanging(() => {
              if (atom.config.get('elmjutsu.inferHoleTypesOnTheFly')) {
                this.inferHoleTypesCommand();
              }
            })
          );
          editorSubscriptions.add(
            editor.onDidChangeSelectionRange(({ selection }) => {
              if (selection !== editor.getLastSelection()) {
                return;
              }
              if (
                atom.config.get('elmjutsu.inferTypeOfSelectionOnTheFly') ||
                atom.config.get('elmjutsu.inferExpectedTypeAtCursorOnTheFly')
              ) {
                this.destroyMarkers(SELECTION_TYPE);
                if (inferTypeDebouncer) {
                  clearTimeout(inferTypeDebouncer);
                  inferTypeDebouncer = null;
                }
                inferTypeDebouncer = setTimeout(() => {
                  this.inferType();
                }, 200);
              }
            })
          );
          editorSubscriptions.add(
            editor.onDidDestroy(() => {
              editorSubscriptions.dispose();
            })
          );
        }
      })
    );
    this.subscriptions.add(
      atom.workspace.observeActivePaneItem(item => {
        if (item && helper.isElmEditor(item)) {
          if (atom.config.get('elmjutsu.inferHoleTypesOnTheFly')) {
            this.inferHoleTypesCommand();
          }
          if (
            atom.config.get('elmjutsu.inferTypeOfSelectionOnTheFly') ||
            atom.config.get('elmjutsu.inferExpectedTypeAtCursorOnTheFly')
          ) {
            this.inferType();
          }
        }
      })
    );
  }

  destroy() {
    this.destroyMarkers();
    this.subscriptions.dispose();
    this.subscriptions = null;
    Object.keys(this.progressIndicators).forEach(progressIndicator => {
      progressIndicator.destroy();
    });
    this.progressIndicators = null;
  }

  inferTypeCommand() {
    const editor = atom.workspace.getActiveTextEditor();
    if (editor.getSelectedBufferRange().isEmpty()) {
      editor.selectWordsContainingCursors();
    }
    this.destroyMarkers(CURSOR_TYPE);
    this.destroyMarkers(SELECTION_TYPE);
    this.inferType(CURSOR_TYPE | SELECTION_TYPE);
  }

  inferType(inferTypes) {
    const editor = atom.workspace.getActiveTextEditor();
    if (helper.isElmEditor(editor)) {
      if (!inferTypes) {
        inferTypes = NO_TYPE;
        if (atom.config.get('elmjutsu.inferTypeOfSelectionOnTheFly')) {
          inferTypes |= SELECTION_TYPE;
        }
        if (atom.config.get('elmjutsu.inferExpectedTypeAtCursorOnTheFly')) {
          inferTypes |= CURSOR_TYPE;
        }
      }
      let selectedRange = editor.getSelectedBufferRange();
      let selectedText = editor.getSelectedText();
      const isNothingSelected =
        selectedRange.isEmpty() || selectedText.trim().length === 0;
      const prefix = editor.getTextInRange([
        [selectedRange.start.row, 0],
        selectedRange.start,
      ]);
      const isAllSpaces = prefix.trim().length === 0;
      const charAfter = editor.getTextInBufferRange([
        selectedRange.start,
        selectedRange.start.translate([0, 1]),
      ]);
      if ((inferTypes & CURSOR_TYPE) <= 0 && isNothingSelected) {
        return;
      }
      if ((inferTypes & SELECTION_TYPE) <= 0 && !isNothingSelected) {
        return;
      }
      // Abort if nothing is selected and cursor is in a comment or string.
      const scopeDescriptor = editor.scopeDescriptorForBufferPosition(
        editor.getCursorBufferPosition()
      );
      if (
        (inferTypes & CURSOR_TYPE) > 0 &&
        isNothingSelected &&
        (helper.isScopeAString(scopeDescriptor) ||
          helper.isScopeAComment(scopeDescriptor))
      ) {
        return;
      }
      // Abort if nothing is selected and cursor is neither between whitespaces (excluding indents) nor before a closing parenthesis.
      if (
        (inferTypes & CURSOR_TYPE) > 0 &&
        isNothingSelected &&
        (!/\s$/.test(prefix) ||
          (isAllSpaces && prefix.length > 1 && charAfter !== '') ||
          !/^(\s|\n|\)|)$/.test(charAfter))
      ) {
        return;
      }
      // Abort if nothing is selected and the token is not blank.
      const token = helper.getToken(editor);
      if (
        (inferTypes & CURSOR_TYPE) > 0 &&
        isNothingSelected &&
        token &&
        token.trim().length > 0
      ) {
        return;
      }
      let code;
      helper.doInTempEditor(tempEditor => {
        const text = editor.getText();
        tempEditor.setText(text);
        // Change module name.
        tempEditor.scanInBufferRange(
          helper.moduleNameRegex(),
          [[0, 0], editor.getEofBufferPosition()],
          ({ match, matchText, range, stop, replace }) => {
            if (match && match.length > 3) {
              const originalModuleName = match[3];
              if (originalModuleName) {
                replace(
                  matchText.replace(originalModuleName, helper.dummyModule())
                );
              }
              stop();
            }
          }
        );
        if (helper.isInfix(selectedText.trim())) {
          selectedText = '(' + selectedText + ')';
        }
        if (isNothingSelected) {
          tempEditor.setTextInBufferRange(selectedRange, dummyType());
        } else {
          const lineLength = tempEditor
            .getBuffer()
            .lineLengthForRow(selectedRange.start.row);
          const lineRange = [
            [selectedRange.start.row, 0],
            [selectedRange.start.row, lineLength],
          ];
          const lineText = tempEditor.getTextInRange(lineRange).trim();
          const endsWithArrow =
            lineText.length >= 2 && lineText.substr(-2, 2) === '->';
          const endsWithEqual =
            lineText.length >= 1 && lineText.substr(-1, 1) === '=';
          if (endsWithArrow || endsWithEqual) {
            const leadingSpaces = new Array(
              selectedRange.start.column + 1
            ).join(' ');
            const lineTokens = lineText
              .replace(/=$/, '')
              .split(' ')
              .filter(token => {
                return token.trim().length > 0;
              });
            // If selected text is a function name without arguments, put a dummy type annotation above it.
            // Example:
            //     let
            //         foo = 1
            // becomes:
            //     let
            //         foo : DummyType
            //         foo = 1
            if (endsWithEqual && lineTokens.length === 1) {
              tempEditor.setCursorBufferPosition([
                selectedRange.start.row,
                selectedRange.start.column,
              ]);
              tempEditor.insertText(
                selectedText + ' : ' + dummyType() + '\n' + leadingSpaces
              );
            } else {
              // If selected text is a wildcard expression ("_"), replace it with a dummy.
              // Example:
              //     case x of
              //         _ ->
              //             1
              // becomes:
              //     case x of
              //         dummyVariable ->
              //             let _ = (dummyFunction (dummyVariable)) in
              //             1
              if (selectedText === '_') {
                selectedText = dummyVariable();
                tempEditor.setTextInBufferRange(selectedRange, selectedText);
              }
              tempEditor.setCursorBufferPosition([
                selectedRange.start.row,
                lineLength + dummyVariable().length,
              ]);
              tempEditor.insertText(
                '\n' +
                  leadingSpaces +
                  ' let _ = (' +
                  dummyFunction() +
                  ' (' +
                  selectedText +
                  ')) in\n'
              );
            }
          } else {
            tempEditor.setTextInBufferRange(
              selectedRange,
              '(' + dummyFunction() + ' (' + selectedText + '))'
            );
          }
        }
        code =
          tempEditor.getText() +
          '\n' +
          dummyFunction() +
          ' : ' +
          dummyType() +
          ' -> ' +
          dummyType() +
          '\n' +
          dummyFunction() +
          ' a = a\n' +
          'type ' +
          dummyType() +
          ' = ' +
          dummyType();
        // console.log('code', code);
      });
      const inferenceType = isNothingSelected ? CURSOR_TYPE : SELECTION_TYPE;
      const inferenceName = helper.unknownName();
      const shouldDecorate = false;
      const shouldDestroyOnChange = !isNothingSelected;
      const shouldShowAutocomplete = isNothingSelected;
      const getInferenceFunction = (problem, editor) => {
        return {
          type: getInferredTypeFromProblem(problem),
          range: selectedRange,
        };
      };
      this.doInferTypes(
        code,
        inferenceType,
        inferenceName,
        editor,
        shouldDecorate,
        shouldDestroyOnChange,
        shouldShowAutocomplete,
        getInferenceFunction
      );
    }
  }

  // TODO: Chain inferences by replacing holes with default values (based on inferred type), `_`, or `Debug.crash ""`, then calling `elm-make` again.
  inferHoleTypesCommand() {
    const editor = atom.workspace.getActiveTextEditor();
    if (helper.isElmEditor(editor)) {
      const origCode = editor.getText();
      const modifiedCode = origCode.replace(
        new RegExp(
          '(^|\\s|\\n)(' + _.escapeRegExp(helper.holeToken()) + ')(\\s|$)',
          'g'
        ),
        '$1' + dummyType() + '$3'
      );
      const inputCode =
        modifiedCode + '\n' + 'type ' + dummyType() + ' = ' + dummyType();
      if (origCode !== modifiedCode) {
        const inferenceType = HOLE_TYPES;
        const inferenceName = helper.holeToken();
        const shouldDecorate = true;
        const shouldDestroyOnChange = true;
        const shouldShowAutocomplete = false;
        const getInferenceFunction = (problem, editor) => {
          return {
            type: getInferredTypeFromProblem(problem),
            range: getHoleRangeFromProblem(problem, editor),
          };
        };
        this.doInferTypes(
          inputCode,
          inferenceType,
          inferenceName,
          editor,
          shouldDecorate,
          shouldDestroyOnChange,
          shouldShowAutocomplete,
          getInferenceFunction
        );
      }
    }
  }

  doInferTypes(
    code,
    inferenceType,
    inferenceName,
    editor,
    shouldDecorate,
    shouldDestroyOnChange,
    shouldShowAutocomplete,
    getInferenceFunction
  ) {
    const self = this;
    this.destroyMarkers(inferenceType);
    const inputFilePath = editor.getPath();
    const projectDirectory = helper.getProjectDirectory(inputFilePath);
    const elmVersion = helper.getElmVersion(projectDirectory);
    const usingPre0_19ElmVersion = helper.isPre0_19ElmVersion(elmVersion);
    const configExecutablePath = usingPre0_19ElmVersion
      ? atom.config.get('elmjutsu.elmMakeExecPath')
      : atom.config.get('elmjutsu.elmExecPath');
    const executablePath = helper.getAbsoluteExecutablePath(
      projectDirectory,
      configExecutablePath
    );
    atomLinter.tempFile(path.basename(inputFilePath), code, tempFilePath => {
      const args = usingPre0_19ElmVersion
        ? [tempFilePath, '--report=json', '--output=/dev/null', '--yes']
        : ['make', tempFilePath, '--report=json', '--output=/dev/null'];
      const uniqueKey = 'inferTypes: ' + inputFilePath;
      if (self.statusBar && !self.progressIndicators[uniqueKey]) {
        self.progressIndicators[uniqueKey] = self.statusBar.addLeftTile({
          item: createProgressIndicator('Inferring...'),
          priority: 7,
        });
      }
      return atomLinter
        .exec(executablePath, args, {
          uniqueKey,
          stream: 'both', // stdout and stderr
          cwd: projectDirectory,
          env: process.env,
        })
        .then(data => {
          // Killed processes return null.
          if (data === null) {
            return null;
          }
          if (self.progressIndicators[uniqueKey]) {
            self.progressIndicators[uniqueKey].destroy();
            delete self.progressIndicators[uniqueKey];
          }
          const problems = usingPre0_19ElmVersion
            ? elmMakeHelper.parseProblemsPre0_19(data, projectDirectory)
            : elmMakeHelper.parseProblems(data, projectDirectory, elmVersion);
          // Return default inference if there were no errors.
          const defaultInference = {
            type: 'a',
            range: editor.getSelectedBufferRange(),
          };
          const numErrors = usingPre0_19ElmVersion
            ? elmMakeHelper.getErrorsAndWarnings(problems)[0].length
            : problems.length;
          const inferences =
            numErrors === 0
              ? [defaultInference]
              : _.flatten(problems)
                  .map(problem => {
                    return getInferenceFunction(problem, editor);
                  })
                  .filter(({ type }) => {
                    return type;
                  });
          inferences.forEach(inference => {
            let marker = editor.markBufferRange(inference.range, {
              invalidate: 'never',
            });
            marker.setProperties({
              type: inferenceType,
              inference: {
                name: inferenceName,
                tipe: helper.formatTipe(inference.type),
              },
            });
            if (shouldDecorate) {
              editor.decorateMarker(marker, {
                type: 'highlight',
                class: 'elmjutsu-inferred-range',
              });
            }
            this.subscriptions.add(
              marker.onDidChange(
                ({ oldHeadBufferPosition, newHeadBufferPosition }) => {
                  if (
                    shouldDestroyOnChange ||
                    newHeadBufferPosition.isLessThan(oldHeadBufferPosition)
                  ) {
                    marker.destroy();
                    this.removeMarker(marker);
                  }
                }
              )
            );
            this.subscriptions.add(
              marker.onDidDestroy(() => {
                this.removeMarker(marker);
              })
            );
            this.markers.push(marker);
          });
          const inference = this.getInferenceAtPosition(editor);
          if (inference) {
            indexing.sendEnteredInference(this.indexer, inference);
            if (shouldShowAutocomplete) {
              const onAutocompleteActivate = helper.forceActivateAutocomplete(
                editor
              );
              if (onAutocompleteActivate) {
                this.subscriptions.add(onAutocompleteActivate);
              }
            }
          }
        })
        .catch(errorMessage => {
          if (self.progressIndicators[uniqueKey]) {
            self.progressIndicators[uniqueKey].destroy();
            delete self.progressIndicators[uniqueKey];
          }
          atom.notifications.addError('Failed to infer types', {
            detail: errorMessage,
            dismissable: true,
          });
        });
    });
  }

  getInferenceAtCursorPosition(editor) {
    return this.getInferenceAtPosition(editor, CURSOR_TYPE);
  }

  getInferenceAtPosition(editor, inferenceType, position) {
    const containsBufferPosition = position || editor.getCursorBufferPosition();
    const markers = editor
      .findMarkers({ containsBufferPosition })
      .filter(marker => {
        const props = marker.getProperties();
        const inference = props.inference;
        return (
          props.inference && (!inferenceType || props.type === inferenceType)
        );
      });
    if (markers.length > 0) {
      return markers[0].getProperties().inference;
    }
    return null;
  }

  destroyMarkers(inferenceType) {
    this.markers
      .filter(marker => {
        return !inferenceType || marker.getProperties().type === inferenceType;
      })
      .forEach(marker => {
        marker.destroy();
        this.removeMarker(marker);
      });
  }

  clearCursorInference() {
    this.destroyMarkers(CURSOR_TYPE);
  }

  removeMarker(marker) {
    const markerIndex = this.markers.indexOf(marker);
    if (markerIndex != -1) {
      this.markers.splice(markerIndex, 1);
    }
  }

  setStatusBar(statusBar) {
    this.statusBar = statusBar;
  }
}

const NO_TYPE = 0,
  CURSOR_TYPE = 1,
  SELECTION_TYPE = 2,
  HOLE_TYPES = 4;

function getInferredTypeFromProblem(problem) {
  if (helper.isPre0_19ElmVersion(problem.elmVersion)) {
    return getInferredTypeFromProblemPre0_19(problem);
  }
  const message = problem.message;
  let matches;
  const checks = [
    [
      /^The .+ argument to `.+` is not what I expect:/,
      /(This `.+` value is a:)|(But `.+` needs the .+ argument to be:)/,
    ],
    [
      /^The .+ argument to `.+` is not what I expect:/,
      /(The value at .+ is a:)|(But `.+` needs the .+ argument to be:)/,
    ],
    [
      /^The .+ argument to `.+` is not what I expect:/,
      /(This argument is a record of type:)|(But `.+` needs the 1st argument to be:)/,
    ],
    [
      /^Something is off with the body of the `.+` definition:/,
      /(But the type annotation on `.+` says it should be:)|(The body is a tuple of type:)/,
    ],
    [
      /^The .+ argument to `.+` is not what I expect:/,
      /(This `.+` call produces:)|(But `.+` needs the .+ argument to be:)/,
    ],
    [
      /^Something is off with the .+ branch of this `.+` expression:/,
      /(The .+ branch is a tuple of type:)|(But the type annotation on `.+` says it should be:)/,
    ],
    [
      /^Something is off with the body of the `.+` definition:/,
      /(This `.+` call produces:)|(But the type annotation on `.+` says it should be:)/,
    ],
    [
      /^The .+ branch of this `.+` does not match all the previous branches:/,
      /(This `.+` call produces:)|(But all the previous branches result in:)/,
    ],
    [
      /The .+ branch of this `.+` does not match all the previous branches:/,
      /(This `.+` value is a:)|(But all the previous branches result in:)/,
    ],
    [
      /The .+ branch of this `.+` does not match all the previous branches:/,
      /(The .+ branch is a .+ of type:)|(But all the previous branches result in:)/,
    ],
    [
      /The .+ branch of this `.+` does not match all the previous branches:/,
      /(The .+ branch is:)|(But all the previous branches result in:)/,
    ],
    [
      /^I cannot update the `.+` field like this:/,
      /(This `.+` value is a:)|(But it should be:)/,
    ],
    [
      /^The .+ element of this list does not match all the previous elements:/,
      /(This `.+` value is a:)|(But all the previous elements in the list are:)/,
    ],
    [
      /^The .+ element of this list does not match all the previous elements:/,
      /(The .+ element is a record of type:)|(But all the previous elements in the list are:)/,
    ],
    [
      /^The \(\+\+\) operator cannot append these two values:/,
      /(I already figured out that the left side of \(\+\+\) is:)|(This `.+` value is a:)/,
    ],
    [
      /I need both sides of .+ to be the same type:/,
      /(The left side of .+ is:)|(But the right side is:)/,
    ],
    [
      /This function cannot handle the argument sent through the \(|>\) pipe:/,
      /(The argument is:)|(But \(|>\) is piping it a function that expects:)/,
    ],
  ];
  for (let check of checks) {
    matches = message[0].match(check[0]);
    if (matches) {
      const type = findTypeInMessage(message, check[1]);
      if (type) {
        return formatType(type);
      }
    }
  }
  return null;
}

function getInferredTypeFromProblemPre0_19(problem) {
  let regex;
  let matches;
  regex = /^(.+) is expecting the left argument to be a:\n\n((?:.|\n)+)\n\nBut the left argument is:\n\n((?:.|\n)+)/;
  matches = problem.details.match(regex);
  if (matches && matches.length > 3) {
    if (isDummyType(matches[3].split('\n\n')[0])) {
      return formatType(matches[2]);
    } else if (isDummyType(matches[2])) {
      return formatType(matches[3].split('\n\n')[0]);
    }
  }
  regex = /(.+) is expecting the right side to be a:\n\n((?:.|\n)+)\n\nBut the right side is:\n\n((?:.|\n)+)/;
  matches = problem.details.match(regex);
  if (matches && matches.length > 3) {
    if (isDummyType(matches[3].split('\n\n')[0])) {
      return formatType(matches[2]);
    } else if (isDummyType(matches[2])) {
      return formatType(matches[3].split('\n\n')[0]);
    }
  }
  regex = /^Function `(.+)`\sis\sexpecting\sthe\s(.+)\sargument\sto\sbe:\n\n((?:.|\n)+)\n\nBut it is:\n\n((?:.|\n)+)/;
  matches = problem.details.match(regex);
  if (matches && matches.length > 4) {
    if (isDummyType(matches[4].split('\n\n')[0])) {
      return formatType(matches[3]);
    } else if (isDummyType(matches[3])) {
      return formatType(matches[4].split('\n\n')[0]);
    }
  }
  regex = /^Function `(.+)`\sis\sexpecting\sthe\sargument\sto\sbe:\n\n((?:.|\n)+)\n\nBut it is:\n\n((?:.|\n)+)/;
  matches = problem.details.match(regex);
  if (matches && matches.length > 3) {
    if (isDummyType(matches[3].split('\n\n')[0])) {
      return formatType(matches[2]);
    } else if (isDummyType(matches[2])) {
      return formatType(matches[3].split('\n\n')[0]);
    }
  }
  regex = /^The (.+) branch has this type:\n\n((?:.|\n)+)\n\nBut the (.+) is:\n\n((?:.|\n)+)/;
  matches = problem.details.match(regex);
  if (matches && matches.length > 4) {
    if (isDummyType(matches[4].split('\n\n')[0])) {
      return formatType(matches[2]);
    } else if (isDummyType(matches[2])) {
      return formatType(matches[4].split('\n\n')[0]);
    }
  }
  regex = /^The type annotation for `(.+)` says it always returns:\n\n((?:.|\n)+)\n\nBut the returned value \(shown above\) is a:\n\n((?:.|\n)+)/;
  matches = problem.details.match(regex);
  if (matches && matches.length > 3) {
    if (isDummyType(matches[3].split('\n\n')[0])) {
      return formatType(matches[2]);
    } else if (isDummyType(matches[2])) {
      return formatType(matches[3].split('\n\n')[0]);
    }
  }
  regex = /^The type annotation for `(.+)` says it is a:\n\n((?:.|\n)+)\n\nBut the definition \(shown above\) is a:\n\n((?:.|\n)+)/;
  matches = problem.details.match(regex);
  if (matches && matches.length > 3) {
    if (isDummyType(matches[3].split('\n\n')[0])) {
      return formatType(matches[2]);
    } else if (isDummyType(matches[2])) {
      return formatType(matches[3].split('\n\n')[0]);
    }
  }
  regex = /^The pattern matches things of type:\n\n((?:.|\n)+)\n\nBut the values it will actually be trying to match are:\n\n((?:.|\n)+)/;
  matches = problem.details.match(regex);
  if (matches && matches.length > 2) {
    if (isDummyType(matches[1].split('\n\n')[0])) {
      return formatType(matches[2]);
    } else if (isDummyType(matches[2])) {
      return formatType(matches[1].split('\n\n')[0]);
    }
  }
  regex = /^The anonymous function has type:\n\n((?:.|\n)+)\n\nBut you are trying to use it as:\n\n((?:.|\n)+)/;
  matches = problem.details.match(regex);
  if (matches && matches.length > 2) {
    if (isDummyType(matches[2].split('\n\n')[0])) {
      return formatType(matches[1]);
    } else if (isDummyType(matches[1])) {
      return formatType(matches[2].split('\n\n')[0]);
    }
  }
  return null;
}

function getHoleRangeFromProblem(problem, editor) {
  let holeRange = regionToHoleRange(problem.subregion || problem.region);
  let isFound = false;
  [regionToRange(problem.subregion), regionToRange(problem.region)].forEach(
    rangeToCheck => {
      if (!isFound && rangeToCheck) {
        editor.scanInBufferRange(
          new RegExp(_.escapeRegExp(helper.holeToken())),
          rangeToCheck,
          ({ range, stop }) => {
            const scopeDescriptor = editor.scopeDescriptorForBufferPosition(
              range.start
            );
            if (
              !helper.isScopeAString(scopeDescriptor) &&
              !helper.isScopeAComment(scopeDescriptor)
            ) {
              stop();
              isFound = true;
              holeRange = range;
            }
          }
        );
      }
    }
  );
  return holeRange;
}

function formatType(type) {
  // TODO: Handle type variables beyond `z`.
  let letters = 'abcdefghijklmnopqrstuvwxyz'.split('');
  const typeVariablesRegex = /\b([a-z]+)\b/g;
  let match = typeVariablesRegex.exec(type);
  while (match) {
    const name = match[1];
    let index = letters.indexOf(name);
    if (index != -1) {
      letters.splice(index, 1);
    }
    match = typeVariablesRegex.exec(type);
  }
  const typeVariableName = letters.length > 0 ? letters[0] : 'something';
  return type
    .trim()
    .replace(
      new RegExp('(\\b)(' + dummyType() + ')(\\b)', 'g'),
      '$1' + typeVariableName + '$3'
    );
}

function regionToRange(region) {
  if (!region) {
    return null;
  }
  return new Range(
    [region.start.line - 1, region.start.column - 1],
    [region.end.line - 1, region.end.column - 1]
  );
}

function regionToHoleRange(region) {
  if (!region) {
    return null;
  }
  return regionToRange(region).translate([0, 0], [0, dummyType().length]);
}

function createProgressIndicator(text) {
  const result = document.createElement('div');
  result.classList.add('inline-block');
  result.classList.add('icon-ellipsis');
  result.textContent = text;
  return result;
}

function isDummyType(aType) {
  return aType.trim().indexOf(dummyType()) > -1;
}

function dummyType() {
  return 'Elmjutsu_DuMmY_tYp3_';
}

function dummyVariable() {
  return 'elmjutsu_dUmMy_VaR1AbL3_';
}

function dummyFunction() {
  return 'elmjutsu_duMMy_fuNct10n_';
}

function findTypeInMessage(message, regex) {
  let tempType = null;
  let foundDummyType = false;
  for (let i = message.length - 1; i > 0; --i) {
    matches = message[i].match && message[i].match(regex);
    if (matches) {
      const type = message[i + 1].string;
      if (type === dummyType()) {
        if (tempType) {
          return tempType;
        } else {
          foundDummyType = true;
        }
      } else {
        if (foundDummyType) {
          return type;
        } else {
          tempType = type;
        }
      }
    }
  }
  return null;
}
