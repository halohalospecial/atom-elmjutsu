'use babel';

const _ = require('underscore-plus');
import PipeSelectionsView from './pipe-selections-view';
import helper from './helper';

export default class PipeSelections {

  constructor(executeInReplFunction, sendToReplFunction) {
    this.executeInRepl = executeInReplFunction;
    this.sendToRepl = sendToReplFunction;
    this.selectionMarkers = [];
    this.view = new PipeSelectionsView();
    this.view.onDoExecute((code) => {
      return this.applyToEditor(code);
    });
    this.view.onDidHide(() => {
      this.hide();
    });
  }

  destroy() {
    this.view.destroy();
    this.view = null;
    this.hide();
    this.prevActivePane = null;
  }

  show() {
    this.targetEditor = atom.workspace.getActiveTextEditor();
    if (!this.targetEditor) {
      return;
    }
    this.previouslyFocusedElement = document.activeElement;
    this.panel = atom.workspace.addFooterPanel({
      item: this.view.getElement(),
      visible: true,
      priority: -Number.MAX_SAFE_INTEGER
    });
    this.panel.show();
    this.view.show();
    this.markSelections(this.targetEditor);
  }

  hide() {
    this.clearSelectionMarkers();
    if (this.panel) {
      this.panel.destroy();
      this.panel = null;
    }
    if (this.previouslyFocusedElement) {
      this.previouslyFocusedElement.focus();
    }
  }

  applyToEditor(code) {
    const editor = this.targetEditor;
    if (helper.isElmEditor(editor)) {
      const projectDirectory = helper.getProjectDirectory(editor.getPath());
      // Ignore `elm-repl` banner.
      const numOutputsToIgnore = 1;
      const oldSelections = editor.getSelectionsOrderedByBufferPosition();
      const proc = this.executeInRepl(projectDirectory, numOutputsToIgnore, (errString, outString) => {
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
          const outputs = _.isArray(result) ? result.map((chuva) => { return chuva.toString(); }) : [result];
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
      const selectedTexts = oldSelections.map((selection) => {
        return selection.getText();
      });
      const inputString = JSON.stringify(selectedTexts);
      // // //
      const prelude =
        helper.defaultImports() + '\n' +
        'import Regex\n' +
        'import String exposing (..)\n' +
        'import List exposing (..)\n' +
        'concat = String.concat';
      // // //
      this.sendToRepl(proc, prelude);
      this.sendToRepl(proc, inputString + ' |> ' + code);
    } else {
      // TODO: Spawn REPL in temporary directory.
    }
  }

  markSelections(editor) {
    this.clearSelectionMarkers();
    editor.getSelections().forEach((selection) => {
      const {start, end} = selection.getBufferRange();
      this.markRange(editor, [start, start.traverse([0, 1])], 'elmjutsu-pipe-selection-start');
      this.markRange(editor, [end.traverse([0, -1]), end], 'elmjutsu-pipe-selection-end');
    });
  }

  markRange(editor, range, klass) {
    const marker = editor.markBufferRange(range, {invalidate: 'never', persistent: false});
    const decor = editor.decorateMarker(marker, {type: 'highlight', class: klass});
    this.selectionMarkers.push(marker);
  }

  clearSelectionMarkers() {
    this.selectionMarkers.forEach((marker) => {
      marker.destroy();
    });
    this.selectionMarkers = [];
  }

}
