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

  setSymbols(defaultSymbolName, filePath, projectDirectory, symbols) {
    this.filterEditorView.getModel().setText(defaultSymbolName);
    this.filterEditorView.getModel().selectAll();
    this.setItems(symbols.map(([moduleName, symbolName]) => {
      return {
        filterKey: moduleName + (symbolName ? ' ' + symbolName : ''),
        moduleName,
        symbolName,
        filePath,
        projectDirectory
      };
    }));
  }

  viewForItem({moduleName, symbolName}) {
    if (symbolName) {
      return `<li><span class="keyword">import</span> ${moduleName} <span class="keyword">exposing</span> (${symbolName})</li>`;
    } else {
      return `<li><span class="keyword">import</span> ${moduleName}</li>`;
    }
  }

}
