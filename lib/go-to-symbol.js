'use babel';

import path from 'path';
const _ = require('underscore-plus');
import helper from './helper';
import GoToSymbolView from './go-to-symbol-view';

export default class GoToSymbol {

  constructor() {
    const self = this;
    this.stateBeforeFind = null;
    this.view = new GoToSymbolView();
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
      self.reenableLinterPackage();
    });
    this.view.onDidCancel(() => {
      self.revertToStateBeforeFind();
      this.reenableLinterPackage();
    });
  }

  destroy() {
    this.stateBeforeFind = null;
    this.view.destroy();
  }

  reenableLinterPackage() {
    if (this.linterPackageDisabled) {
      atom.packages.enablePackage('linter');
      this.linterPackageDisabled = false;
    }
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
    // Open file containing symbol.
    return atom.workspace.open(symbol.sourcePath, {pending: isPreview}).then((editor) => {
      const nameParts = symbol.fullName.split('.');
      const lastName = nameParts[nameParts.length - 1];
      // Move the cursor to the symbol definition's position.
      var symbolRange = editor.getSelectedBufferRange();
      helper.scanForSymbolDefinitionRange(editor, lastName, symbol.caseTipe, (range) => {
        symbolRange = range;
        editor.setCursorBufferPosition(symbolRange.start);
        editor.scrollToCursorPosition({center: true});
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

  show(defaultSymbolFullName, activeFilePath, symbols) {
    // Temporarily disable `linter` package.
    this.linterPackageDisabled = atom.packages.disablePackage('linter');
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
    this.view.setSymbols(defaultSymbolFullName, activeFilePath, symbols);
  }

}
