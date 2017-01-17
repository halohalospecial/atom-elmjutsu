'use babel';

import {CompositeDisposable, Point, Range} from 'atom';
import helper from './helper';

export default class ActOnSelection {

  constructor() {
    this.suggestionsEnabled = true;
    this.subscriptions = new CompositeDisposable();
  }

  destroy() {
    this.subscriptions.dispose();
    this.subscriptions = null;
  }

  shouldGetSuggestions() {
    return this.suggestionsEnabled;
  }

  handleEndOfAct(editor) {
    let disposable = editor.onDidRemoveSelection(() => {
      this.suggestionsEnabled = true;
      disposable.dispose();
    });
  }

  surroundWithLetInCommand() {
    this.suggestionsEnabled = true;
    const editor = atom.workspace.getActiveTextEditor();
    if (helper.isElmEditor(editor)) {
      editor.transact(() => {
        this.suggestionsEnabled = false;
        const selectedRange = editor.getSelectedBufferRange();
        const selectedText = editor.getSelectedText();
        const leadingSpaces = new Array(selectedRange.start.column + 1).join(' ');
        const placeholder = 'var';
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
        this.handleEndOfAct(editor);
      });
    }
  }

  liftToLetCommand() {
    this.suggestionsEnabled = true;
    const editor = atom.workspace.getActiveTextEditor();
    if (helper.isElmEditor(editor)) {
      editor.transact(() => {
        this.suggestionsEnabled = false;
        const selectedRange = editor.getSelectedBufferRange();
        const selectionMarker = editor.markBufferRange(selectedRange);
        const selectedText = editor.getSelectedText();
        const placeholder = 'var';
        // Look for top-level position.
        let topLevelRange = [0, 0];
        editor.backwardsScanInBufferRange(helper.blockRegex(), [[0, 0], editor.getCursorBufferPosition()], ({range, stop}) => {
          stop();
          topLevelRange = range;
        });
        // Look for "in" above.
        const inRegex = /\s(let|in)(?:\s*$)/;
        let inRange = null;
        let inMarker = null;
        let inIsAbove = true;
        let letInMatchText = null;
        editor.backwardsScanInBufferRange(inRegex, [topLevelRange.start, selectedRange.start], ({range, match, stop}) => {
          stop();
          inRange = range;
          inMarker = editor.markBufferRange(range);
          inIsAbove = true;
          letInMatchText = match[1];
        });
        if (!inRange || letInMatchText === 'let') {
          // Look for next top-level position (to determine search bounds).
          let nextTopLevelRange = [editor.getEofBufferPosition(), editor.getEofBufferPosition()];
          editor.scanInBufferRange(helper.blockRegex(), [selectedRange.end, editor.getEofBufferPosition()], ({range, stop}) => {
            stop();
            nextTopLevelRange = range;
          });
          // Look for "in" below.
          editor.scanInBufferRange(inRegex, [selectedRange.end, nextTopLevelRange.start], ({range, stop}) => {
            stop();
            inRange = range;
            inMarker = editor.markBufferRange(range);
            inIsAbove = false;
          });
        }
        if (inRange) {
          // Found an "in" above or below.
          const leadingSpaces = new Array(inRange.start.column + 2).join(' ');
          const selectedLines = selectedText.split('\n');
          editor.setCursorBufferPosition(inRange.start);
          editor.insertText('\n' +
            leadingSpaces + helper.tabSpaces() + placeholder + ' =\n' +
            leadingSpaces + helper.tabSpaces() +
            (inIsAbove ?
              selectedLines.map((text) => { return helper.tabSpaces() + text; }).join('\n') :
              helper.tabSpaces() + selectedLines.map((text) => { return text; }).join('\n')
            ) + '\n' +
            new Array(inRange.start.column + 1).join(' ')
            );
          editor.setTextInBufferRange(selectionMarker.getBufferRange(), placeholder);
          const offset1 = inMarker.getBufferRange().start.row - (selectedLines.length - 1) + selectedLines.length;
          const cursorPosition1 = new Point(offset1, leadingSpaces.length + helper.tabSpaces().length);
          editor.setSelectedBufferRanges([
            selectionMarker.getBufferRange(),
            [cursorPosition1, cursorPosition1.translate([0, placeholder.length])]
          ]);
          inMarker.destroy();
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
        this.handleEndOfAct(editor);
        selectionMarker.destroy();
      });
    }
  }

  liftToTopLevelCommand() {
    this.suggestionsEnabled = true;
    const editor = atom.workspace.getActiveTextEditor();
    if (helper.isElmEditor(editor)) {
      editor.transact(() => {
        this.suggestionsEnabled = false;
        const selectedRange = editor.getSelectedBufferRange();
        const selectionMarker = editor.markBufferRange(selectedRange);
        const selectedText = editor.getSelectedText();
        const selectedLines = selectedText.split('\n');
        const leadingSpaces = new Array(selectedRange.start.column + 1).join(' ');
        const placeholder = 'function';
        // Look for start of current top-level.
        let topLevelStart = new Point(0, 0);
        editor.backwardsScanInBufferRange(helper.blockRegex(), [selectedRange.start, topLevelStart], ({range, stop}) => {
          stop();
          topLevelStart = range.start;
        });
        // Look for end of current top-level.
        let topLevelEnd = editor.getEofBufferPosition();
        editor.scanInBufferRange(helper.blockRegex(), [topLevelStart, editor.getEofBufferPosition()], ({range, stop}) => {
          stop();
          topLevelEnd = range.end;
        });
        const atEndOfFile = topLevelEnd.isEqual(editor.getEofBufferPosition());
        editor.setCursorBufferPosition(topLevelEnd);
        editor.insertText('\n' +
          (atEndOfFile ? '\n' : '') +
          placeholder + ' =\n' +
          selectedLines.map((text) => { return helper.tabSpaces() + text.replace(leadingSpaces, ''); }).join('\n') +
          '\n\n');
        editor.setTextInBufferRange(selectionMarker.getBufferRange(), placeholder);
        const cursorPosition1 = new Point(topLevelEnd.row + 1 - (selectedLines.length - 1) + (atEndOfFile ? 1 : 0), 0);
        editor.setSelectedBufferRanges([
          selectionMarker.getBufferRange(),
          [cursorPosition1, cursorPosition1.translate([0, placeholder.length])]
        ]);
        this.handleEndOfAct(editor);
      });
    }
  }

}
