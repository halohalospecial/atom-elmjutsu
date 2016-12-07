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
    this.setItems(symbols.map((item) => {
      item.filterKey = item.fullName;
      const parts = item.fullName.split('.');
      const symbolName = parts.pop();
      const moduleName = parts.join('.');
      item.moduleName = moduleName !== '' ? moduleName : symbolName;
      item.symbolName = moduleName !== '' ? (item.caseTipe ? item.caseTipe + '(' + symbolName + ')' : symbolName) : null;
      item.filePath = filePath;
      item.projectDirectory = projectDirectory;
      return item;
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
