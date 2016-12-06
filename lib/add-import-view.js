'use babel';

import SymbolListView from './symbol-list-view';

export default class AddImportView extends SymbolListView {

  constructor() {
    super();
  }

  initialize() {
    super.initialize();
    this.addClass('overlay elmjutsu-add-import');
  }

  setSymbols(defaultSymbolName, activeFilePath, symbols) {
    this.activeFilePath = activeFilePath;
    this.filterEditorView.getModel().setText(defaultSymbolName);
    this.filterEditorView.getModel().selectAll();
    this.setItems(symbols.map((symbol) => {
      symbol.filterKey = symbol.fullName;
      return symbol;
    }));
  }

  viewForItem({fullName}) {
    const parts = fullName.split('.');
    const symbolName = parts.pop();
    const moduleName = parts.join('.');
    if (moduleName !== '') {
      if (symbolName !== '') {
        return `<li><span class="keyword">import</span> ${moduleName} <span class="keyword">exposing</span> (${symbolName})</li>`;
      } else {
        return `<li><span class="keyword">import</span> ${moduleName} <span class="keyword">exposing</span> (...)</li>`;
      }
    } else {
      return `<li><span class="keyword">import</span> ${symbolName}</li>`;
    }
  }

}
