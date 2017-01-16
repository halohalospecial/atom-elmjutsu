'use babel';

import {CompositeDisposable} from 'atom';

export default class SymbolFinder {

  constructor(indexer, viewClass) {
    this.stateBeforeFind = null;
    this.view = new viewClass();
    this.previewDebouncer = null;
    this.view.onDidSelect(({item}) => {
      if (this.previewDebouncer) {
        clearTimeout(this.previewDebouncer);
        this.previewDebouncer = null;
      }
      this.previewDebouncer =
        setTimeout(() => {
          this.view.cancelling = true;
          this.viewInEditor(item, true).then(() => {
            this.view.cancelling = false;
            this.view.focusFilterEditor();
          });
        }, 30);
    });
    this.view.onDidConfirm(({item}) => {
      clearTimeout(this.previewDebouncer);
      this.previewDebouncer = null;
      this.viewInEditor(item, false);
      this.reenableLinterPackage();
      this.destroyUsageMarker();
    });
    this.view.onDidCancel(() => {
      clearTimeout(this.previewDebouncer);
      this.previewDebouncer = null;
      this.revertToStateBeforeFind();
      this.reenableLinterPackage();
      this.destroyUsageMarker();
    });
  }

  destroy() {
    if (this.previewDebouncer) {
      clearTimeout(this.previewDebouncer);
      this.previewDebouncer = null;
    }
    this.destroyUsageMarker();
    this.view.destroy();
    this.view = null;
    this.stateBeforeFind = null;
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
    this.closePreviewEditors();
  }

  closePreviewEditors(exceptEditorId) {
    atom.workspace.getTextEditors().forEach((textEditor) => {
      if ((!exceptEditorId || (exceptEditorId && textEditor.id !== exceptEditorId)) && !this.stateBeforeFind.existingEditorIds.has(textEditor.id)) {
        textEditor.destroy();
      }
    });
  }

  viewInEditor(symbol, isPreview) {
    return atom.workspace.open(symbol.sourcePath, {pending: isPreview}).then((editor) => {
      const symbolRange = this.getSymbolRange(symbol, editor);
      editor.setCursorBufferPosition(symbolRange.start);
      editor.scrollToCursorPosition({center: true});
      if (isPreview) {
        this.destroyUsageMarker();
        this.symbolMarker = editor.markBufferRange(symbolRange, {invalidate: 'never', persistent: false});
        editor.decorateMarker(this.symbolMarker, {type: 'highlight', class: 'elmjutsu-symbol-marker'});
      }
      if (!isPreview) {
        this.closePreviewEditors(editor.id);
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
  }

}
