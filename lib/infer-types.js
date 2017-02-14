'use babel';

// TODO: Chain inferences by replacing holes with default values (based on inferred type) or `Debug.crash ""`, then calling `elm-make` again.

import {Range, CompositeDisposable} from 'atom';
import path from 'path';
import _ from 'underscore-plus';
import Queue from 'promise-queue';
const atomLinter = require('atom-linter');
import indexing from './indexing';
import helper from './helper';

export default class InferTypes {

  constructor(indexer) {
    this.indexer = indexer;
    this.markers = [];
    this.subscriptions = new CompositeDisposable();
    this.inferQueue = new Queue(1, Infinity);
    let inferTypeDebouncer = null;
    this.subscriptions.add(atom.textEditors.observe((editor) => {
      if (helper.isElmEditor(editor)) {
        this.subscriptions.add(editor.onDidStopChanging(() => {
          if (atom.config.get('elmjutsu.inferHoleTypesOnTheFly')) {
            this.inferHoleTypesCommand();
          }
        }));
        this.subscriptions.add(editor.onDidChangeSelectionRange(({selection}) => {
          if (selection !== editor.getLastSelection()) {
            return;
          }
          if (atom.config.get('elmjutsu.inferTypeOfSelectionOnTheFly') ||
              atom.config.get('elmjutsu.inferExpectedTypeAtCursorOnTheFly')) {
            this.destroyMarkers(SELECTION_TYPE);
            if (inferTypeDebouncer) {
              clearTimeout(inferTypeDebouncer);
              inferTypeDebouncer = null;
            }
            inferTypeDebouncer =
              setTimeout(() => {
                this.inferExpressionType();
              }, 200);
          }
        }));
        this.subscriptions.add(atom.workspace.observeActivePaneItem((item) => {
          if (item && helper.isElmEditor(item)) {
            if (atom.config.get('elmjutsu.inferHoleTypesOnTheFly')) {
              this.inferHoleTypesCommand();
            }
            if (atom.config.get('elmjutsu.inferTypeOfSelectionOnTheFly') ||
                atom.config.get('elmjutsu.inferExpectedTypeAtCursorOnTheFly')) {
              this.inferExpressionType();
            }
          }
        }));
      }
    }));
  }

  destroy() {
    this.destroyMarkers();
    this.subscriptions.dispose();
    this.subscriptions = null;
    this.inferQueue = null;
  }

  // inferTypeOfSelectionCommand() {
  //   this.destroyMarkers(CURSOR_TYPE);
  //   this.inferExpressionType(SELECTION_TYPE);
  // }
  //
  // inferExpectedTypeAtCursorCommand() {
  //   this.destroyMarkers(SELECTION_TYPE);
  //   this.inferExpressionType(CURSOR_TYPE);
  // }

  inferExpressionTypeCommand() {
    this.destroyMarkers(CURSOR_TYPE);
    this.destroyMarkers(SELECTION_TYPE);
    this.inferExpressionType(CURSOR_TYPE | SELECTION_TYPE);
  }

  inferExpressionType(inferTypes) {
    const editor = atom.workspace.getActiveTextEditor();
    if (helper.isElmEditor(editor)) {
      if (!inferTypes) {
        inferTypes = 0;
        if (atom.config.get('elmjutsu.inferTypeOfSelectionOnTheFly')) {
          inferTypes |= SELECTION_TYPE;
        }
        if (atom.config.get('elmjutsu.inferExpectedTypeAtCursorOnTheFly')) {
          inferTypes |= CURSOR_TYPE;
        }
      }
      let selectedRange = editor.getSelectedBufferRange();
      let selectedText = editor.getSelectedText();
      const isNothingSelected = selectedRange.isEmpty() || selectedText.trim().length === 0;
      const prefix = editor.getTextInRange([[selectedRange.start.row, 0], selectedRange.start]);
      const isAllSpaces = prefix.trim().length === 0;
      const charAfter = editor.getTextInBufferRange([selectedRange.start, selectedRange.start.translate([0, 1])]);
      if ((inferTypes & CURSOR_TYPE) <= 0 && isNothingSelected) {
        return;
      }
      if ((inferTypes & SELECTION_TYPE) <= 0 && !isNothingSelected) {
        return;
      }
      // Abort if nothing is selected and cursor is not between whitespaces (excluding indents) or before a closing parenthesis.
      if ((inferTypes & CURSOR_TYPE) > 0 && isNothingSelected &&
          (!/\s$/.test(prefix) || (isAllSpaces && prefix.length > 1 && charAfter !== '') || !/^(\s|\n|\)|)$/.test(charAfter))) {
        return;
      }
      // Abort if nothing is selected and the token is not blank.
      const token = helper.getToken(editor);
      if ((inferTypes & CURSOR_TYPE) > 0 && isNothingSelected && token && token.trim().length > 0) {
        return;
      }
      let code;
      editor.transact(() => {
        if (helper.isInfix(selectedText.trim())) {
          selectedText = '(' + selectedText + ')';
        }
        if (isNothingSelected) {
          editor.setTextInBufferRange(selectedRange, dummyType());
        } else {
          editor.setTextInBufferRange(selectedRange, '(' + dummyFunction() + ' <| ' + selectedText + ')');
        }
        code = editor.getText() + '\n' +
          dummyFunction() + ' : ' + dummyType() + ' -> ' + dummyType() + '\n' +
          dummyFunction() + ' a = a\n' +
          'type ' + dummyType() + ' = ' + dummyType();
        editor.abortTransaction();
      });
      this.inferQueue.add(() => {
        return this.inferTypes(code, isNothingSelected ? CURSOR_TYPE :  SELECTION_TYPE, '↓', editor, false, !isNothingSelected, isNothingSelected,
          (problem, editor) => {
            return {
              type: getInferredTypeFromProblem(problem),
              range: selectedRange
            };
          });
      });
    }
  }

  inferHoleTypesCommand() {
    const editor = atom.workspace.getActiveTextEditor();
    if (helper.isElmEditor(editor)) {
      const origCode = editor.getText();
      const modifiedCode = origCode.replace(new RegExp('(^|\\s|\\n)(' + _.escapeRegExp(helper.holeToken()) + ')(\\s|$)', 'g'), '$1' + dummyType() + '$3');
      const inputCode = modifiedCode + '\n' + 'type ' + dummyType() + ' = ' + dummyType();
      if (origCode !== modifiedCode) {
        this.inferQueue.add(() => {
          return this.inferTypes(inputCode, HOLE_TYPES, helper.holeToken(), editor, true, true, false,
            (problem, editor) => {
              return {
                type: getInferredTypeFromProblem(problem),
                range: getHoleRangeFromProblem(problem, editor)
              };
            },
            (marker) => {
              marker.destroy();
            });
        });
      }
    }
  }

  inferTypes(code, inferenceType, inferenceName, editor, shouldDecorate, shouldDestroyOnChange, shouldShowAutocomplete, getInferenceFunction) {
    this.destroyMarkers(inferenceType);
    let progressIndicator;
    if (this.statusBar) {
      progressIndicator = this.statusBar.addLeftTile({
        item: createProgressIndicator('Inferring...'),
        priority: 1
      });
    }
    const inputFilePath = editor.getPath();
    const projectDirectory = helper.getProjectDirectory(inputFilePath);
    const executablePath = atom.config.get('elmjutsu.elmMakeExecPath');
    atomLinter.tempFile(path.basename(inputFilePath), code, (tempFilePath) => {
      const args = [tempFilePath, '--report=json', '--output=/dev/null', '--yes'];
      return atomLinter.exec(executablePath, args, {
        stream: 'both', // stdout and stderr
        cwd: projectDirectory,
        env: process.env
      })
      .then(data => {
        // Filter Haskell memory error messages (see https://ghc.haskell.org/trac/ghc/ticket/12495).
        data.stderr = data.stderr.split('\n').filter((line) => line !== 'elm-make: unable to decommit memory: Invalid argument').join('\n');
        const problems = data.stderr === '' ? parseStdout(data.stdout) : [];
        const inferences =
          _.flatten(problems)
          .map((problem) => {
            return getInferenceFunction(problem, editor);
          })
          .filter(({type}) => {
            return type;
          });
        inferences.forEach((inference) => {
          let marker = editor.markBufferRange(inference.range, {invalidate: 'never'});
          marker.setProperties({
            type: inferenceType,
            inference: {
              name: inferenceName,
              tipe: inference.type
            }
          });
          if (shouldDecorate) {
            editor.decorateMarker(marker, {type: 'highlight', class: 'elmjutsu-inferred-range'});
          }
          this.subscriptions.add(marker.onDidChange(({oldHeadBufferPosition, newHeadBufferPosition}) => {
            if (shouldDestroyOnChange || newHeadBufferPosition.isLessThan(oldHeadBufferPosition)) {
              marker.destroy();
            }
          }));
          this.subscriptions.add(marker.onDidDestroy(() => {
            this.removeMarker(marker);
          }));
          this.markers.push(marker);
        });
        const inference = this.getInferenceAtPosition(editor);
        if (inference) {
          indexing.sendEnteredHole(this.indexer, inference);
          if (shouldShowAutocomplete) {
            // Force show the autocomplete dialog.
            const autocompletePackage = atom.packages.getActivePackage('autocomplete-plus');
            if (autocompletePackage) {
              const autocompleteManager = autocompletePackage.mainModule.getAutocompleteManager();
              // Temporarily disable auto confirm single suggestion.
              const origAutoConfirmSingleSuggestionEnabled = autocompleteManager.autoConfirmSingleSuggestionEnabled;
              autocompleteManager.autoConfirmSingleSuggestionEnabled = false;
              if (editor) {
                const editorView = atom.views.getView(editor);
                if (editorView) {
                  atom.commands.dispatch(editorView, 'autocomplete-plus:activate', {activatedManually: true});
                  let onAutocompleteActivate = atom.commands.onDidDispatch((event) => {
                    if (event.type === 'autocomplete-plus:activate') {
                      // Revert auto confirm single suggestion.
                      autocompleteManager.autoConfirmSingleSuggestionEnabled = origAutoConfirmSingleSuggestionEnabled;
                    }
                    onAutocompleteActivate.dispose();
                  });
                  this.subscriptions.add(onAutocompleteActivate);
                }
              }
            }
          }
        }
        if (progressIndicator) {
          progressIndicator.destroy();
        }
      })
      .catch(errorMessage => {
        atom.notifications.addError('Failed to infer ' + inferenceType, {
          detail: errorMessage,
          dismissable: true
        });
        if (progressIndicator) {
          progressIndicator.destroy();
        }
      });
    });
  }

  getInferenceAtCursorPosition(editor) {
    return this.getInferenceAtPosition(editor, CURSOR_TYPE);
  }

  getInferenceAtPosition(editor, inferenceType) {
    const markers =
      editor
      .findMarkers({containsBufferPosition: editor.getCursorBufferPosition()})
      .filter((marker) => {
        const props = marker.getProperties();
        const inference = props.inference;
        return props.inference && (!inferenceType || props.type === inferenceType);
      });
    if (markers.length > 0) {
      return markers[0].getProperties().inference;
    }
    return null;
  }

  destroyMarkers(inferenceType) {
    this.markers
    .filter((marker) => {
      return !inferenceType || marker.getProperties().type === inferenceType;
    })
    .forEach((marker) => {
      marker.destroy();
      this.removeMarker(marker);
    });
  }

  clearCursorInference() {
    this.destroyMarkers(CURSOR_TYPE);
  }

  removeMarker(marker) {
    let markerIndex = this.markers.indexOf(marker);
    if(markerIndex != -1) {
      this.markers.splice(markerIndex, 1);
    }
  }

  setStatusBar(statusBar) {
    this.statusBar = statusBar;
  }

}

const CURSOR_TYPE = 1,
      SELECTION_TYPE = 2,
      HOLE_TYPES = 4;

function parseStdout(stdout) {
  return stdout.split('\n')
    .map((line) => {
        let json = (() => {
          try { return JSON.parse(line); }
          catch (error) {}
        })();
        if (!json) {
          return [];
        }
        return json.map((problem) => {
          let filePath = problem.file;
          if (problem.file.startsWith('.' + path.sep)) {
            // `problem.file` has a relative path (e.g. `././A.elm`) . Convert to absolute.
            filePath = path.join(projectDirectory, path.normalize(problem.file));
          }
          return Object.assign(problem, {filePath});
        });
      });
}

function getInferredTypeFromProblem(problem) {
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
  regex = /^Function `(.+)` is expecting the (.+) argument to be:\n\n((?:.|\n)+)\n\nBut it is:\n\n((?:.|\n)+)/;
  matches = problem.details.match(regex);
  if (matches && matches.length > 4) {
    if (isDummyType(matches[4].split('\n\n')[0])) {
      return formatType(matches[3]);
    } else if (isDummyType(matches[3])) {
      return formatType(matches[4].split('\n\n')[0]);
    }
  }
  regex = /^Function `(.+)` is expecting the argument to be:\n\n((?:.|\n)+)\n\nBut it is:\n\n((?:.|\n)+)/;
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
  if (matches && matches.length > 2 && isDummyType(matches[1])) {
    return formatType(matches[2].split('\n\n')[0]);
  }
  return null;
}

function getHoleRangeFromProblem(problem, editor) {
  let holeRange = regionToHoleRange(problem.subregion || problem.region);
  let isFound = false;
  [regionToRange(problem.subregion), regionToRange(problem.region)].forEach((rangeToCheck) => {
    if (!isFound && rangeToCheck) {
      editor.scanInBufferRange(new RegExp(_.escapeRegExp(helper.holeToken())), rangeToCheck, ({range, stop}) => {
        const scopeDescriptor = editor.scopeDescriptorForBufferPosition(range.start);
        if (!helper.isTokenAString(scopeDescriptor) && !helper.isTokenAComment(scopeDescriptor)) {
          stop();
          isFound = true;
          holeRange = range;
        }
      });
    }
  });
  return holeRange;
}

function formatType(type) {
  // TODO: Handle type vars beyond `z`.
  let letters = 'abcdefghijklmnopqrstuvwxyz'.split('');
  const typeVarsRegex = /\b([a-z]+)\b/g;
  let match = typeVarsRegex.exec(type);
  while (match) {
    const name = match[1];
    let index = letters.indexOf(name);
    if(index != -1) {
      letters.splice(index, 1);
    }
    match = typeVarsRegex.exec(type);
  }
  const typeVarName = letters.length > 0 ? letters[0] : 'something';
  return type.trim().replace(new RegExp('(\\b)(' + dummyType() + ')(\\b)', 'g'), '$1' + typeVarName + '$3');
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
  return aType.trim() === dummyType();
}

function dummyType() {
  return 'MAL1nG_tYp3_iT0_';
}

function dummyFunction() {
  return 'd1z_iz_a_wRaPp3r_fuNct10n_';
}
