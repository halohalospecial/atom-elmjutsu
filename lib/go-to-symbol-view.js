'use babel';

import ModalListView from './modal-list-view';

export default class GoToSymbolView extends ModalListView {

  constructor() {
    super();
  }

  initialize() {
    super.initialize();
    this.addClass('overlay elmjutsu-go-to-symbol');
  }

  setSymbols(defaultSymbolName, activeFilePath, symbols) {
    if (defaultSymbolName) {
      this.filterEditorView.getModel().setText(defaultSymbolName);
      this.filterEditorView.getModel().selectAll();
    }
    this.activeFilePath = activeFilePath;
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

  viewForItem({fullName, kind, caseTipe, sourcePath}) {
    const parts = fullName.split('.');
    const symbolName = parts.pop();
    const moduleName = parts.join('.');
    // const iconSpan = `<span class="symbol-icon ${kindToIcon(kind)}"></span>`;
    const moduleNameSpan = moduleName === '' || this.activeFilePath === sourcePath ? '' : `<span class="module-name">${moduleName}.</span>`;
    const kindSpan = kind === 'type case' ? `<span class="type-case">(${caseTipe})</span>` : '';
    const dashedSymbolKind = kind.replace(/ /g, '-');
    // return `<li>${iconSpan}<span class="symbol-kind-${dashedSymbolKind}">${symbolName}</span>${kindSpan}</li>`;
    return `<li>${moduleNameSpan}<span class="symbol-kind-${dashedSymbolKind}">${symbolName}</span>${kindSpan}</li>`;
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
