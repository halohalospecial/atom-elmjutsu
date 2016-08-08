'use babel';

import {CompositeDisposable, Emitter} from 'atom';
import {SelectListView} from 'atom-space-pen-views';

export default class GoToSymbolView extends SelectListView {

  constructor() {
    super();
  }

  initialize() {
    super.initialize();
    this.addClass('overlay elmjutsu-go-to-symbol');
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

  setSymbols(defaultSymbolName, activeFilePath, symbols) {
    this.activeFilePath = activeFilePath;
    this.filterEditorView.getModel().setText(defaultSymbolName);
    this.filterEditorView.getModel().selectAll();
    this.setItems(symbols.map((symbol) => {
      if (this.activeFilePath === symbol.sourcePath) {
        const nameParts = symbol.fullName.split('.');
        const lastName = nameParts[nameParts.length - 1];
        symbol.filterKey = lastName;
      } else {
        symbol.filterKey = symbol.fullName;
      }
      return symbol;
    }));
  }

  getFilterKey() {
    return 'filterKey';
  }

  viewForItem({fullName, kind, caseTipe, sourcePath}) {
    const parts = fullName.split('.');
    const symbolName = parts.pop();
    const moduleName = parts.join('.');
    // const iconSpan = `<span class="symbol-icon ${kindToIcon(kind)}"></span>`;
    const moduleNameSpan = moduleName === '' || this.activeFilePath === sourcePath ? '' : `<span class="module-name">${moduleName}.</span>`;
    const kindSpan = kind === 'type case' ? `<span class="type-case">: ${caseTipe}</span>` : '';
    const dashedSymbolKind = kind.replace(/ /g, '-');
    // return `<li>${iconSpan}<span class="symbol-kind-${dashedSymbolKind}">${symbolName}</span>${kindSpan}</li>`;
    return `<li>${moduleNameSpan}<span class="symbol-kind-${dashedSymbolKind}">${symbolName}</span>${kindSpan}</li>`;
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

// const kindToIcon = (kind) => {
//   const icons = {
//     'default': 'icon-gist',
//     'type alias': 'icon-gist-secret',
//     'type': 'icon-organization',
//     'type case': 'icon-person',
//     'module': 'icon-package',
//     'port': 'icon-plug'
//   };
//   return icons[kind] || '';
// };
