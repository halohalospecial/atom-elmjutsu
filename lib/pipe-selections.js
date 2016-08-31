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
    this.view = new PipeSelectionsView(getTemplatePath());
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
    this.view.show(getTemplatePath());
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
    const templatePath = getTemplatePath();
    if (!fs.existsSync(templatePath)) {
      // TODO: Show notification.
      return;
    }
    const projectDirectory = helper.getProjectDirectory(templatePath);
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
    let template = '';
    try {
      template = fs.readFileSync(templatePath).toString();
    } catch (e) {
      // TODO: Show notification.
      return;
    }
    const selectedTexts = oldSelections.map((selection) => {
      return selection.getText();
    });
    this.sendToRepl(proc, helper.defaultImports() + '\n' + template + '\n');
    this.sendToRepl(proc, JSON.stringify(selectedTexts) + ' |> ' + code);
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

function getTemplatePath() {
  let templatePath = atom.config.get('elmjutsu.pipeSelectionsTemplatePath');
  if (templatePath.trim() === '') {
    templatePath = '~/.atom/packages/elmjutsu/elm/PipeSelectionsTemplate.elm'; // // // TODO: Make this cross-platform.
  }
  return untildify(templatePath);
}
