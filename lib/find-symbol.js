'use babel';

const Range = require('atom').Range;
import path from 'path';
const _ = require('underscore-plus');
import helper from './helper';
import FindSymbolView from './find-symbol-view';

export default class FindSymbol {

  constructor() {
    const self = this;
    this.stateBeforeFind = null;
    this.view = new FindSymbolView();
    var previewDebouncer = null;
    this.view.onDidSelect(({symbol}) => {
      if (previewDebouncer) {
        clearTimeout(previewDebouncer);
      }
      previewDebouncer =
        setTimeout(() => {
          self.view.cancelling = true;
          self.viewElmFile(symbol, true).then(() => {
            self.view.cancelling = false;
            self.view.focusFilterEditor();
          });
        }, 30);
    });
    this.view.onDidConfirm(({symbol}) => {
      self.viewElmFile(symbol, false);
      self.destroyUsageMarker();
    });
    this.view.onDidCancel(() => {
      self.revertToStateBeforeFind();
    });
  }

  destroy() {
    this.stateBeforeFind = null;
    this.view.destroy();
  }

  storeStateBeforeFind(editor) {
    const editorView = atom.views.getView(editor);
    this.stateBeforeFind = {
      existingEditorIds: new Set(atom.workspace.getTextEditors().map(({id}) => id)),
      pane: atom.workspace.getActivePane(),
      editor: editor,
      cursorPosition: editor.getCursorBufferPosition(),
      scrollTop: editorView.getScrollTop(),
      scrollLeft: editorView.getScrollLeft()
    };
  }

  revertToStateBeforeFind() {
    const pane = this.stateBeforeFind.pane;
    const editor = this.stateBeforeFind.editor;
    pane.activateItem(editor);
    const editorView = atom.views.getView(editor);
    editor.setCursorBufferPosition(this.stateBeforeFind.cursorPosition);
    editorView.setScrollTop(this.stateBeforeFind.scrollTop);
    editorView.setScrollLeft(this.stateBeforeFind.scrollLeft);
    this.closeTemporaryEditors();
    this.destroyUsageMarker();
  }

  closeTemporaryEditors(exceptEditorId) {
    atom.workspace.getTextEditors().forEach((textEditor) => {
      if ((!exceptEditorId || (exceptEditorId && textEditor.id !== exceptEditorId)) && !this.stateBeforeFind.existingEditorIds.has(textEditor.id)) {
        textEditor.destroy();
      }
    });
  }

  viewElmFile(symbol, isPreview) {
    const self = this;
    const parts = symbol.uri.split('#', 2);
    const filePath = parts[0].replace('file://', '');
    const symbolName = parts[1];
    // Open file containing symbol.
    return atom.workspace.open(filePath, {pending: isPreview}).then((editor) => {
      var symbolRange = editor.getSelectedBufferRange();
      // Move the cursor to the symbol definition's position.
      editor.scanInBufferRange(helper.symbolDefinitionRegex(symbolName), [[0, 0], editor.getEofBufferPosition()], ({match, range, stop}) => {
        const symbolMatch = match[2];
        symbolRange = new Range(range.start, range.start.translate([0, symbolMatch.length]));
        editor.setCursorBufferPosition(symbolRange.start);
        editor.scrollToCursorPosition({center: true});
        stop();
      });
      if (isPreview) {
        self.destroyUsageMarker();
        self.symbolMarker = editor.markBufferRange(symbolRange, {invalidate: 'never', persistent: false});
        editor.decorateMarker(self.symbolMarker, {type: 'highlight', class: 'elm-fu-symbol-highlight'});
      }
      if (!isPreview) {
        self.closeTemporaryEditors(editor.id);
      }
    });
  }

  destroyUsageMarker() {
    if (this.symbolMarker) {
      this.symbolMarker.destroy();
      this.symbolMarker = null;
    }
  }

  find(defaultSymbolFullName, symbols) {
    const editor = atom.workspace.getActiveTextEditor();
    this.storeStateBeforeFind(editor);
    this.view.show();
    const cancel = () => {
      this.view.hide();
    };
    const editorFilePath = editor.getPath();
    if (!editorFilePath) {
      return cancel();
    }
    this.view.setSymbols(defaultSymbolFullName, symbols);
  }

}
