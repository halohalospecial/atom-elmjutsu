'use babel';

import ModalListView from './modal-list-view';

export default class GoToSymbolView extends ModalListView {
  constructor() {
    super();
  }

  initialize() {
    super.initialize();
    this.addClass('overlay elmjutsu-go-to-symbol');

    let filterMode = 'nameOnly'; // 'nameOnly' | 'typeOnly' | 'nameAndType'
    const filterEditor = this.filterEditorView.getModel();
    filterEditor.onDidChange(() => {
      const text = filterEditor.getText();
      if (text.startsWith(':')) {
        if (filterMode === 'typeOnly') {
          return;
        }
        filterMode = 'typeOnly';
        this.items.forEach(item => {
          item.filterKey = ':' + item.tipe;
        });
      } else if (text.includes(':')) {
        if (filterMode === 'nameAndType') {
          return;
        }
        filterMode = 'nameAndType';
        this.items.forEach(item => {
          item.filterKey = this.getNameFilterKey(item) + ':' + item.tipe;
        });
      } else {
        if (filterMode === 'nameOnly') {
          return;
        }
        filterMode = 'nameOnly';
        this.items.forEach(item => {
          item.filterKey = this.getNameFilterKey(item);
        });
      }
    });
  }

  getNameFilterKey(symbol) {
    if (this.activeFilePath === symbol.sourcePath) {
      const nameParts = symbol.fullName.split('.');
      const lastName = nameParts[nameParts.length - 1];
      return lastName;
    } else {
      return symbol.fullName;
    }
  }

  setSymbols(defaultSymbolName, activeFilePath, symbols) {
    if (defaultSymbolName) {
      this.filterEditorView.getModel().setText(defaultSymbolName);
      this.filterEditorView.getModel().selectAll();
    }
    this.activeFilePath = activeFilePath;
    this.setItems(
      symbols.map(symbol => {
        symbol.filterKey = this.getNameFilterKey(symbol);
        return symbol;
      })
    );
  }

  viewForItem({ fullName, kind, sourcePath, tipe }) {
    const parts = fullName.split('.');
    const symbolName = parts.pop();
    const moduleName = parts.join('.');
    // const iconSpan = `<span class="symbol-icon ${kindToIcon(kind)}"></span>`;
    const moduleNameSpan =
      moduleName === '' || this.activeFilePath === sourcePath
        ? ''
        : `<span class="module-name">${moduleName}.</span>`;
    const dashedSymbolKind = kind.replace(/ /g, '-');
    const tipeSpan =
      tipe.trim().length > 0 ? `<span class="type-case"> : ${tipe}</span>` : '';
    // return `<li>${iconSpan}<span class="symbol-kind-${dashedSymbolKind}">${symbolName}</span>${tipeSpan}</li>`;
    return `<li>${moduleNameSpan}<span class="symbol-kind-${dashedSymbolKind}">${symbolName}</span>${tipeSpan}</li>`;
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
