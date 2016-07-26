'use babel';

import {CompositeDisposable, Emitter} from 'atom';
import {SelectListView} from 'atom-space-pen-views';

export default class FindSymbolView extends SelectListView {

  constructor() {
    super();
  }

  initialize() {
    super.initialize();
    this.addClass('overlay elm-fu-find-symbol');
    if (!this.panel) {
      this.panel = atom.workspace.addModalPanel({item: this, visible: false});
    }
    this.emitter = new Emitter();
  }

  destroy () {
    this.emitter.dispose();
    this.panel.destroy();
  }

  selectItemView(view) {
    super.selectItemView(view);
    this.emitter.emit('did-select', {symbol: this.getSelectedItem()});
  }

  onDidConfirm(fn) {
    this.emitter.on('did-confirm', fn);
  }

  onDidCancel(fn) {
    this.emitter.on('did-cancel', fn);
  }

  onDidSelect(fn) {
    this.emitter.on('did-select', fn);
  }

  show() {
    this.showing = true;
    this.panel.show();
    this.setLoading('Loading Symbols...');
    this.storeFocusedElement();
    this.focusFilterEditor();
  }

  hide() {
    this.panel.hide();
    this.restoreFocus();
  }

  setSymbols(defaultSymbolFullName, symbols) {
    this.filterEditorView.getModel().setText(defaultSymbolFullName);
    this.filterEditorView.getModel().selectAll();
    // this.filterEditorView.focus();
    this.setItems(symbols.map((symbol) => {
      symbol.filterKey = symbol.fullName;
      return symbol;
    }));
  }

  getFilterKey() {
    return 'filterKey';
  }

  viewForItem({fullName}) {
    const parts = fullName.split('.');
    const symbolName = parts.pop();
    const moduleName = parts.join('.');
    return `<li><span class="module-name">${moduleName}.</span><span class="symbol-name">${symbolName}</span></li>`;
  }

  confirmed(symbol) {
    this.emitter.emit('did-confirm', {symbol});
    this.panel.hide();
    this.showing = false;
  }

  cancelled(item) {
    if (this.showing) {
      this.emitter.emit('did-cancel', null);
      this.showing = false;
    }
    this.panel.hide();
  }
}
