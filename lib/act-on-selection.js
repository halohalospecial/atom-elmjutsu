'use babel';

import {CompositeDisposable, Point, Range} from 'atom';
import helper from './helper';

export default class ActOnSelection {

  constructor() {
    this.suggestionsEnabled = true;
  }

  destroy() {
    if (this.subscriptions) {
      this.subscriptions.dispose();
      this.subscriptions = null;
    }
  }

  shouldGetSuggestions() {
    return this.suggestionsEnabled;
  }

  handleEndOfAct(editor) {
    const reenableSuggestions = () => {
      this.suggestionsEnabled = true;
      this.subscriptions.dispose();
      this.subscriptions = null;
    };
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(editor.onDidAddSelection(() => {
      reenableSuggestions();
    }));
    this.subscriptions.add(editor.onDidRemoveSelection(() => {
      reenableSuggestions();
    }));
  }

  surroundWithLetCommand() {
    this.suggestionsEnabled = true;
    const editor = atom.workspace.getActiveTextEditor();
    if (helper.isElmEditor(editor)) {
      editor.transact(() => {
        // Temporarily disable autocomplete suggestions.
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
        // Temporarily disable autocomplete suggestions.
        this.suggestionsEnabled = false;
        const selectedRange = editor.getSelectedBufferRange();
        const selectionMarker = editor.markBufferRange(selectedRange);
        const selectedText = editor.getSelectedText();
        const placeholder = 'var';
        // Look for top-level position.
        let topLevelRange = new Range([0, 0], [0, 0]);
        editor.backwardsScanInBufferRange(helper.blockRegex(), [[0, 0], editor.getCursorBufferPosition()], ({range, stop}) => {
          stop();
          topLevelRange = range;
        });
        // Look for var or "in" above.
        const varOrInRegex = /(\s(\S+)\s*=\s*$)|(\s(in)\s*$)/;
        let varRange = topLevelRange;
        let gotInInsteadOfVar = false;
        editor.backwardsScanInBufferRange(varOrInRegex, [topLevelRange.start, selectedRange.start], ({range, match, stop}) => {
          stop();
          varRange = range;
          if (match[4] === 'in') {
            gotInInsteadOfVar = true;
          }
        });
        // Look for "let" or "in" above.
        let inRange = null;
        let inMarker = null;
        let inIsAbove = true;
        let letOrInMatchText = null;
        const letOrInRegex = /\s(let|in)\s*$/g;

        if (gotInInsteadOfVar) {
          inRange = varRange;
          inMarker = editor.markBufferRange(inRange);
          letOrInMatchText = 'in';
        } else {
          editor.backwardsScanInBufferRange(letOrInRegex, [topLevelRange.start, varRange.start], ({range, match, stop}) => {
            if (range.start.column < varRange.start.column) {
              stop();
              inRange = range;
              inMarker = editor.markBufferRange(inRange);
              letOrInMatchText = match[1];
            }
          });
        }

        if (!inRange || letOrInMatchText === 'let') {
          // Look for next top-level position (to determine search bounds).
          let nextTopLevelRange = new Range(editor.getEofBufferPosition(), editor.getEofBufferPosition());
          editor.scanInBufferRange(helper.blockRegex(), [selectedRange.end, editor.getEofBufferPosition()], ({range, stop}) => {
            stop();
            nextTopLevelRange = range;
          });
          // Look for "in" below, skipping let-in pairs.
          inRange = null;
          let numLetInPairs = 0;
          editor.scanInBufferRange(letOrInRegex, [selectedRange.end, nextTopLevelRange.start], ({range, match, stop}) => {
            if (match[1] === 'let') {
              ++numLetInPairs;
            } else if (match[1] === 'in') {
              if (numLetInPairs > 0) {
                --numLetInPairs;
              } else {
                stop();
                inRange = range;
                inMarker = editor.markBufferRange(range);
                inIsAbove = false;
              }
            }
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
          let bodyRange;
          editor.scanInBufferRange(/=\s*\n/, [topLevelRange.start, editor.getEofBufferPosition()], ({range, stop}) => {
            stop();
            bodyRange = range;
          });
          if (bodyRange) {
            const leadingSpaces = helper.tabSpaces();
            // Insert leading spaces on top-level body.
            let row = bodyRange.end.row;
            while (row <= topLevelRange.end.row + 1) {
              editor.setCursorBufferPosition([row, 0]);
              editor.insertText(leadingSpaces);
              ++row;
            }
            editor.setCursorBufferPosition(bodyRange.end);
            editor.insertText(
              leadingSpaces + 'let\n' +
              leadingSpaces + helper.tabSpaces() + placeholder + ' =\n' +
              leadingSpaces + selectedText.split('\n').map((text) => { return leadingSpaces + helper.tabSpaces() + text; }).join('\n') + '\n' +
              leadingSpaces + 'in\n');
            editor.setTextInBufferRange(selectionMarker.getBufferRange(), placeholder);
            const cursorPosition1 = new Point(bodyRange.start.row + 2, leadingSpaces.length + helper.tabSpaces().length);
            editor.setSelectedBufferRanges([
              selectionMarker.getBufferRange(),
              [cursorPosition1, cursorPosition1.translate([0, placeholder.length])]
            ]);
          } else {
            atom.notifications.addError('Sorry, I don\'t know how to lift that.');
          }
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
        // Temporarily disable autocomplete suggestions.
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
