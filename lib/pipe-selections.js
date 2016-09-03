'use babel';

const _ = require('underscore-plus');
import fs from 'fs-extra';
import path from 'path';
import untildify from 'untildify';
import PipeSelectionsView from './pipe-selections-view';
import indexing from './indexing';
import helper from './helper';

export default class PipeSelections {

  constructor(indexer, executeInReplFunction, sendToReplFunction) {
    this.indexer = indexer;
    this.executeInRepl = executeInReplFunction;
    this.sendToRepl = sendToReplFunction;
    this.selectionMarkers = [];
    this.view = new PipeSelectionsView(getPreludePath());
    this.view.onDoExecute((code) => {
      return this.applyToEditor(code);
    });
    this.view.onDidHide(() => {
      this.hide();
    });
    this.panel = atom.workspace.addBottomPanel({
      item: this.view.getElement(),
      visible: false,
      priority: -Number.MAX_SAFE_INTEGER
    });
  }

  destroy() {
    this.view.destroy();
    this.view = null;
    this.hide();
    this.panel.destroy();
    this.panel = null;
    this.prevActivePane = null;
  }

  show() {
    this.targetEditor = atom.workspace.getActiveTextEditor();
    if (!this.targetEditor) {
      return;
    }
    this.previouslyFocusedElement = document.activeElement;
    this.panel.show();
    this.view.show(getPreludePath());
    indexing.sendActiveFile(this.indexer, this.targetEditor);
    this.markSelections(this.targetEditor);
  }

  hide() {
    this.clearSelectionMarkers();
    this.panel.hide();
    if (this.previouslyFocusedElement) {
      this.previouslyFocusedElement.focus();
    }
  }

  applyToEditor(code) {
    const editor = this.targetEditor;
    const preludePath = getPreludePath();
    if (!fs.existsSync(preludePath)) {
      // TODO: Show notification.
      return;
    }
    const projectDirectory = helper.getProjectDirectory(preludePath);
    if (!projectDirectory) {
      // TODO: Show notification.
      return;
    }
    // Ignore `elm-repl` banner.
    const numOutputsToIgnore = 1;
    const oldSelections = editor.getSelectionsOrderedByBufferPosition();
    this.view.setProcessing(true);
    const proc = this.executeInRepl(projectDirectory, numOutputsToIgnore, (errString, outString) => {
      this.view.setProcessing(false);
      if (errString.length > 0) {
        atom.notifications.addError('Pipe Selections Error', {
          detail: errString,
          dismissable: true
        });

      } else {
        let result = helper.removeTypeAnnotation(outString);
        try {
          result = JSON.parse(result);
        } catch (e) {
        }
        const outputs = _.isArray(result) ? result.map((chuva) => { return chuva.toString(); }) : [result.toString()];
        editor.transact(() => {
          let newRanges = [];
          let newestRangeStart = null;
          let newestRangeEnd = null;
          const updateSelection = (selection, newText) => {
            newestRangeStart = selection.getBufferRange().start;
            selection.insertText(newText);
            newestRangeEnd = selection.getBufferRange().end;
            newRanges.push([newestRangeStart, newestRangeEnd]);
          };
          _.zip(outputs, oldSelections).forEach(([output, selection]) => {
            if (selection) {
              if (output) {
                updateSelection(selection, output);
              } else {
                selection.insertText('');
              }
            } else {
              const newSelection = editor.addSelectionForBufferRange([newestRangeEnd, newestRangeEnd]);
              // Align the new selection with the last one.
              const leadingSpaces = Array(newestRangeStart.column + 1).join(' ');
              newSelection.insertText('\n' + leadingSpaces);
              updateSelection(newSelection, output);
            }
          });
          if (newRanges.length > 0) {
            editor.setSelectedBufferRanges(newRanges);
          } else {
            editor.setCursorBufferPosition(oldSelections[0].getBufferRange().start);
          }
          this.markSelections(editor);
        });
      }
    });
    let prelude = '';
    try {
      prelude = fs.readFileSync(preludePath).toString();
    } catch (e) {
      // TODO: Show notification.
      return;
    }
    const selectedTexts = oldSelections.map((selection) => {
      return selection.getText();
    });
    const imports = helper.defaultImports();
    // If it's a single selection, get the first element.
    const maybeConcat = oldSelections.length === 1 ? '\n |> List.head |> Maybe.withDefault ""' : '';
    this.sendToRepl(proc, imports + '\n' + prelude + '\n');
    this.sendToRepl(proc, JSON.stringify(selectedTexts) + maybeConcat + '\n |> ' + code);
  }

  markSelections(editor) {
    this.clearSelectionMarkers();
    editor.getSelections().forEach((selection) => {
      const {start, end} = selection.getBufferRange();
      this.selectionMarkers.push(helper.markRange(editor, [start, start.traverse([0, 1])], 'elmjutsu-pipe-selection-start'));
      this.selectionMarkers.push(helper.markRange(editor, [end.traverse([0, -1]), end], 'elmjutsu-pipe-selection-end'));
    });
  }

  clearSelectionMarkers() {
    this.selectionMarkers.forEach((marker) => {
      marker.destroy();
    });
    this.selectionMarkers = [];
  }

}

function getPreludePath() {
  let preludePath = atom.config.get('elmjutsu.pipeSelectionsPreludePath');
  if (!preludePath || preludePath.trim() === '') {
    preludePath = path.join(path.dirname(atom.config.getUserConfigPath()), 'packages', 'elmjutsu', 'elm', 'PipeSelectionsPrelude.elm');
  }
  return untildify(preludePath);
}
