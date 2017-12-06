'use babel';

import helper from './helper';
import ModalListView from './modal-list-view';

export default class AddImportView extends ModalListView {
  constructor() {
    super();
  }

  initialize() {
    super.initialize();
    this.addClass('overlay elmjutsu-add-import');
  }

  setSymbols(defaultSymbolName, filePath, projectDirectory, symbols) {
    if (defaultSymbolName) {
      this.filterEditorView.getModel().setText(defaultSymbolName);
      this.filterEditorView.getModel().selectAll();
    }
    this.setItems(
      symbols.map(([moduleName, symbolName]) => {
        return {
          filterKey: moduleName + (symbolName ? ' ' + symbolName : ''),
          moduleName,
          symbolName,
          filePath,
          projectDirectory,
        };
      })
    );
  }

  viewForItem({ moduleName, symbolName }) {
    if (symbolName) {
      if (symbolName !== '..' && helper.isInfix(symbolName)) {
        symbolName = '(' + symbolName + ')';
      }
      const symbolNameClass =
        symbolName[0] === symbolName[0].toUpperCase()
          ? 'syntax--storage'
          : 'syntax--entity';
      const symbolNameClause =
        symbolName === '..'
          ? `<span class="syntax--keyword">(..)</span>`
          : `<span class="syntax--punctuation">(</span><span class="${symbolNameClass}">${symbolName}</span><span class="syntax--punctuation">)</span>`;
      return `<li><span class="syntax--keyword">import</span> <span class="syntax--support">${moduleName}</span> <span class="syntax--keyword">exposing</span> ${symbolNameClause}</li>`;
    } else {
      return `<li><span class="syntax--keyword">import</span> <span class="syntax--support">${moduleName}</span></li>`;
    }
  }
}
