'use babel';

import {CompositeDisposable, Point} from 'atom';
import helper from './helper';

export default class ActOnSelection {

  constructor() {
    this.suggestionsEnabled = true;
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.commands.add('atom-text-editor:not([mini])[data-grammar^="source elm"]', {
      'editor:consolidate-selections': this.stopActing.bind(this), // escape
      'core:cancel': this.stopActing.bind(this), // escape
    }));
  }

  destroy() {
    this.subscriptions.dispose();
    this.subscriptions = null;
  }

  shouldGetSuggestions() {
    return this.suggestionsEnabled;
  }

  stopActing() {
    this.suggestionsEnabled = true;
  }

  surroundWithLetInCommand() {
    const editor = atom.workspace.getActiveTextEditor();
    if (helper.isElmEditor(editor)) {
      editor.transact(() => {
        this.suggestionsEnabled = false;
        const selectedRange = editor.getSelectedBufferRange();
        const selectedText = editor.getSelectedText();
        const leadingSpaces = new Array(selectedRange.start.column + 1).join(' ');
        const placeholder = 'name';
        const selectedLines = selectedText.split('\n');
        editor.delete();
        editor.insertText('let\n' +
          leadingSpaces + helper.tabSpaces() + placeholder + ' =\n' +
          leadingSpaces + selectedLines.map((text) => { return helper.tabSpaces() + helper.tabSpaces() + text; }).join('\n') + '\n' +
          leadingSpaces + 'in\n' +
          leadingSpaces + helper.tabSpaces() + placeholder);
        const cursorPosition1 = new Point(selectedRange.start.row + 1, leadingSpaces.length + helper.tabSpaces().length);
        const cursorPosition2 = new Point(selectedRange.start.row + 3 + selectedLines.length, leadingSpaces.length + helper.tabSpaces().length);
        editor.setSelectedBufferRanges([
          [cursorPosition2, cursorPosition2.translate([0, placeholder.length])],
          [cursorPosition1, cursorPosition1.translate([0, placeholder.length])]
        ]);
      });
    }
  }

  liftToLetCommand() {
    const editor = atom.workspace.getActiveTextEditor();
    if (helper.isElmEditor(editor)) {
      editor.transact(() => {
        this.suggestionsEnabled = false;
        const selectedRange = editor.getSelectedBufferRange();
        const selectionMarker = editor.markBufferRange(selectedRange);
        const selectedText = editor.getSelectedText();
        const placeholder = 'name';
        // Look for top-level position.
        let topLevelRange = [0, 0];
        editor.backwardsScanInBufferRange(helper.blockRegex(), [[0, 0], editor.getCursorBufferPosition()], ({range, matchText, stop}) => {
          stop();
          topLevelRange = range;
        });
        // Look for " in" of let/in.
        let inRange = null;
        editor.backwardsScanInBufferRange(/\sin(\s*)(?:$)/, [topLevelRange.start, selectedRange.start], ({range, stop}) => {
          stop();
          inRange = range;
        });
        if (inRange) {
          // Found a `let/in`.
          const leadingSpaces = new Array(inRange.start.column + 2).join(' ');
          editor.insertText(placeholder);
          editor.setSelectedBufferRange(inRange);
          editor.deleteLine();
          editor.insertText('\n' +
            leadingSpaces + helper.tabSpaces() + placeholder + ' =\n' +
            leadingSpaces + helper.tabSpaces() + selectedText.split('\n').map((text) => { return leadingSpaces + text; }).join('\n') + '\n' +
            leadingSpaces + 'in\n');
          editor.setTextInBufferRange(selectionMarker.getBufferRange(), placeholder);
          const cursorPosition1 = new Point(inRange.start.row + 1, leadingSpaces.length + helper.tabSpaces().length);
          editor.setSelectedBufferRanges([
            selectionMarker.getBufferRange(),
            [cursorPosition1, cursorPosition1.translate([0, placeholder.length])]
          ]);
        } else {
          // No `let/in` found.  Wrap function body in a `let/in` instead.
          editor.scanInBufferRange(/=\s*\n/, [topLevelRange.start, editor.getEofBufferPosition()], ({range, stop}) => {
            stop();
            const leadingSpaces = helper.tabSpaces();
            // Insert leading spaces on top-level body.
            let row = range.end.row;
            while (row <= topLevelRange.end.row + 1) {
              editor.setCursorBufferPosition([row, 0]);
              editor.insertText(leadingSpaces);
              ++row;
            }
            editor.setCursorBufferPosition(range.end);
            editor.insertText(
              leadingSpaces + 'let\n' +
              leadingSpaces + helper.tabSpaces() + placeholder + ' =\n' +
              leadingSpaces + selectedText.split('\n').map((text) => { return leadingSpaces + helper.tabSpaces() + text; }).join('\n') + '\n' +
              leadingSpaces + 'in\n');
            editor.setTextInBufferRange(selectionMarker.getBufferRange(), placeholder);
            const cursorPosition1 = new Point(range.start.row + 2, leadingSpaces.length + helper.tabSpaces().length);
            editor.setSelectedBufferRanges([
              selectionMarker.getBufferRange(),
              [cursorPosition1, cursorPosition1.translate([0, placeholder.length])]
            ]);
          });
        }
        selectionMarker.destroy();
      });
    }
  }

}
