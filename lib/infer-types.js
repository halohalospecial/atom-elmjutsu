'use babel';

// TODO: Chain inferences by replacing holes with default values (based on inferred type) or `Debug.crash ""`, then calling `elm-make` again.

import {Range, CompositeDisposable} from 'atom';
import path from 'path';
import _ from 'underscore-plus';
const atomLinter = require('atom-linter');
import indexing from './indexing';
import helper from './helper';

export default class InferTypes {

  constructor(indexer) {
    this.indexer = indexer;
    this.markers = [];
    this.subscriptions = new CompositeDisposable();
  }

  destroy() {
    this.destroyMarkers();
    this.subscriptions.dispose();
    this.subscriptions = null;
  }

  inferHoleTypesCommand() {
    const editor = atom.workspace.getActiveTextEditor();
    if (helper.isElmEditor(editor)) {
      const code = editor.getText().replace(new RegExp('(^|\\s|\\n)(' + _.escapeRegExp(helper.holeToken()) + ')(\\s|$)', 'g'), '$1' + dummyType() + '$3') + '\n' +
        'type ' + dummyType() + ' = ' + dummyType();
      this.inferTypes(code, helper.holeToken(), (problem, editor) => {
        return {
          type: getInferredTypeFromProblem(problem),
          range: getHoleRangeFromProblem(problem, editor)
        };
      }, editor, 'Hole Types');
    }
  }

  inferExpressionTypeCommand() {
    const editor = atom.workspace.getActiveTextEditor();
    if (helper.isElmEditor(editor)) {
      let selectedRange = editor.getSelectedBufferRange();
      let selectedText = editor.getSelectedText();
      if (selectedRange.isEmpty() || selectedText.trim().length === 0) {
        // If nothing is selected, select the word under the cursor.
        editor.selectWordsContainingCursors();
        selectedRange = editor.getSelectedBufferRange();
        selectedText = editor.getSelectedText();
        if (selectedRange.isEmpty() || selectedText.trim().length === 0) {
          return;
        }
      }
      let code;
      editor.transact(() => {
        if (helper.isInfix(selectedText.trim())) {
          selectedText = '(' + selectedText + ')';
        }
        editor.setTextInBufferRange(selectedRange, '(' + dummyFunction() + ' <| ' + selectedText + ')');
        code = editor.getText() + '\n' +
          dummyFunction() + ' : ' + dummyType() + ' -> ' + dummyType() + '\n' +
          dummyFunction() + ' a = a\n' +
          'type ' + dummyType() + ' = ' + dummyType();
        editor.abortTransaction();
      });
      this.inferTypes(code, '↓', (problem, editor) => {
        return {
          type: getInferredTypeFromProblem(problem),
          range: selectedRange
        };
      }, editor, 'Expression Type');
    }
  }

  inferTypes(code, inferenceName, getInferenceFunction, editor, kind) {
    this.destroyMarkers();
    let progressIndicator;
    if (this.statusBar) {
      progressIndicator = this.statusBar.addLeftTile({
        item: createProgressIndicator('Inferring ' + kind + '...'),
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
        if (data.stderr !== '') {
          atom.notifications.addError('Error while inferring ' + kind.toLowerCase(), {
            detail: data.stderr,
            dismissable: true
          });
          if (progressIndicator) {
            progressIndicator.destroy();
          }
          return;
        }
        const problems = data.stderr === '' ? parseStdout(data.stdout) : [];
        const inferences =
          _.flatten(problems)
          .map((problem) => {
            return getInferenceFunction(problem, editor);
          })
          .filter(({type}) => {
            return type;
          });
        this.markers = inferences.map((inference) => {
          let marker = editor.markBufferRange(inference.range, {invalidate: 'never'});
          marker.setProperties({inference: {name: inferenceName, tipe: inference.type}});
          editor.decorateMarker(marker, {type: 'highlight', class: 'elmjutsu-inferred-range'});
          this.subscriptions.add(marker.onDidChange(() => {
            marker.destroy();
          }));
          this.subscriptions.add(marker.onDidDestroy(() => {
            let markerIndex = this.markers.indexOf(marker);
            if(markerIndex != -1) {
            	this.markers.splice(markerIndex, 1);
            }
          }));
          return marker;
        });
        const inferenceAtCursorPosition = this.getInferenceAtCursorPosition(editor);
        if (inferenceAtCursorPosition) {
          indexing.sendEnteredHole(this.indexer, inferenceAtCursorPosition);
        }
        if (progressIndicator) {
          progressIndicator.destroy();
        }
      })
      .catch(errorMessage => {
        atom.notifications.addError('Failed to infer ' + kind.toLowerCase(), {
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
    const markers = editor.findMarkers({containsBufferPosition: editor.getCursorBufferPosition()});
    if (markers.length) {
      return markers[0].getProperties().inference;
    }
    return null;
  }

  destroyMarkers() {
    this.markers.forEach((marker) => {
      marker.destroy();
    });
    this.markers = [];
  }

  setStatusBar(statusBar) {
    this.statusBar = statusBar;
  }

}

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
      return formatHoleType(matches[2]);
    } else if (isDummyType(matches[2])) {
      return formatHoleType(matches[3].split('\n\n')[0]);
    }
  }
  regex = /(.+) is expecting the right side to be a:\n\n((?:.|\n)+)\n\nBut the right side is:\n\n((?:.|\n)+)/;
  matches = problem.details.match(regex);
  if (matches && matches.length > 3) {
    if (isDummyType(matches[3].split('\n\n')[0])) {
      return formatHoleType(matches[2]);
    } else if (isDummyType(matches[2])) {
      return formatHoleType(matches[3].split('\n\n')[0]);
    }
  }
  regex = /^Function `(.+)` is expecting the (.+) argument to be:\n\n((?:.|\n)+)\n\nBut it is:\n\n((?:.|\n)+)/;
  matches = problem.details.match(regex);
  if (matches && matches.length > 4) {
    if (isDummyType(matches[4].split('\n\n')[0])) {
      return formatHoleType(matches[3]);
    } else if (isDummyType(matches[3])) {
      return formatHoleType(matches[4].split('\n\n')[0]);
    }
  }
  regex = /^Function `(.+)` is expecting the argument to be:\n\n((?:.|\n)+)\n\nBut it is:\n\n((?:.|\n)+)/;
  matches = problem.details.match(regex);
  if (matches && matches.length > 3) {
    if (isDummyType(matches[3].split('\n\n')[0])) {
      return formatHoleType(matches[2]);
    } else if (isDummyType(matches[2])) {
      return formatHoleType(matches[3].split('\n\n')[0]);
    }
  }
  regex = /^The (.+) branch has this type:\n\n((?:.|\n)+)\n\nBut the (.+) is:\n\n((?:.|\n)+)/;
  matches = problem.details.match(regex);
  if (matches && matches.length > 4) {
    if (isDummyType(matches[4].split('\n\n')[0])) {
      return formatHoleType(matches[2]);
    } else if (isDummyType(matches[2])) {
      return formatHoleType(matches[4].split('\n\n')[0]);
    }
  }
  regex = /^The type annotation for `(.+)` says it always returns:\n\n((?:.|\n)+)\n\nBut the returned value \(shown above\) is a:\n\n((?:.|\n)+)/;
  matches = problem.details.match(regex);
  if (matches && matches.length > 3) {
    if (isDummyType(matches[3].split('\n\n')[0])) {
      return formatHoleType(matches[2]);
    } else if (isDummyType(matches[2])) {
      return formatHoleType(matches[3].split('\n\n')[0]);
    }
  }
  regex = /^The type annotation for `(.+)` says it is a:\n\n((?:.|\n)+)\n\nBut the definition \(shown above\) is a:\n\n((?:.|\n)+)/;
  matches = problem.details.match(regex);
  if (matches && matches.length > 3) {
    if (isDummyType(matches[3].split('\n\n')[0])) {
      return formatHoleType(matches[2]);
    } else if (isDummyType(matches[2])) {
      return formatHoleType(matches[3].split('\n\n')[0]);
    }
  }
  regex = /^The pattern matches things of type:\n\n((?:.|\n)+)\n\nBut the values it will actually be trying to match are:\n\n((?:.|\n)+)/;
  matches = problem.details.match(regex);
  if (matches && matches.length > 2 && isDummyType(matches[1])) {
    return formatHoleType(matches[2].split('\n\n')[0]);
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

function formatHoleType(holeType) {
  return holeType.trim().replace(new RegExp('(\\b)(' + dummyType() + ')(\\b)', 'g'), '$1something$3');
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
  return 'd1z_iz_a_DuMMy_fuNct10n_';
}
