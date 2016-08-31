'use babel';

import {CompositeDisposable} from 'atom';
const _ = require('underscore-plus');
import PipeSelectionsView from './pipe-selections-view';
import helper from './helper';

export default class PipeSelections {

  constructor(executeInReplFunction, sendToReplFunction) {
    this.executeInRepl = executeInReplFunction;
    this.sendToRepl = sendToReplFunction;
    this.subscriptions = new CompositeDisposable();
    this.view = new PipeSelectionsView();
    this.subscriptions.add(atom.commands.add('atom-text-editor.elmjutsu-pipe-selections', {
      'blur': this.hide.bind(this),
      'elmjutsu:cancel-pipe-selections': this.hide.bind(this), // escape
      'elmjutsu:apply-pipe-selections': this.applyToEditor.bind(this), // ctrl-enter / cmd-enter
    }));
  }

  destroy() {
    this.subscriptions.dispose();
    this.subscriptions = null;
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
  }

  hide() {
    if (this.panel) {
      this.panel.destroy();
      this.panel = null;
    }
    if (this.previouslyFocusedElement) {
      this.previouslyFocusedElement.focus();
    }
  }

  applyToEditor() {
    const editor = this.targetEditor;
    if (helper.isElmEditor(editor)) {
      const projectDirectory = helper.getProjectDirectory(editor.getPath());
      // Ignore `elm-repl` banner.
      const numOutputsToIgnore = 1;
      const oldSelections = editor.getSelections();
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
                // const nextPoint = newestRangeEnd.traverse([0, 1]);
                const nextPoint = newestRangeEnd;
                const newSelection = editor.addSelectionForBufferRange([nextPoint, nextPoint]);
                updateSelection(newSelection, output);
              }
            });
            if (newRanges.length > 0) {
              editor.setSelectedBufferRanges(newRanges);
            } else {
              editor.setCursorBufferPosition(oldSelections[0].getBufferRange().start);
            }
          });
        }
      });
      const selectedTexts = oldSelections.map((selection) => {
        return selection.getText();
      });
      const prelude = helper.defaultImports() + '\n' + 'import String'; // // //
      // const pipeCode = 'List.map (\\s -> s ++ "...")'; // // //
      // const pipeCode = '(always {a = 1, b = 2})'; // // //
      // const pipeCode = '(always ({a = 1, b = 2}, "1\\"23"))'; // // //
      // const pipeCode = '(always [1, 2, 3, 4, 5, 6])'; // // //
      const pipeCode = 'List.head |> Maybe.withDefault "" |> String.split ","'; // // //
      const code = JSON.stringify(selectedTexts) + ' |> ' + pipeCode;
      this.sendToRepl(proc, prelude);
      this.sendToRepl(proc, code);
    } else {
      // TODO: Spawn REPL in temporary directory.
    }
  }

}
