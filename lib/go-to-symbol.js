'use babel';

import path from 'path';
const _ = require('underscore-plus');
import helper from './helper';
import SymbolFinder from './symbol-finder';
import GoToSymbolView from './go-to-symbol-view';

export default class GoToSymbol extends SymbolFinder {

  constructor(indexer) {
    super(indexer, GoToSymbolView);
    indexer.ports.goToSymbolCmd.subscribe(([defaultSymbolName, activeFile, symbols]) => {
      this.show(defaultSymbolName, (activeFile && activeFile.filePath) || null, symbols);
    });
  }

  getSymbolRange(symbol, editor) {
    var symbolRange = editor.getSelectedBufferRange();
    helper.scanForSymbolDefinitionRange(editor, symbol, (range) => {
      symbolRange = range;
    });
    return symbolRange;
  }

  show(defaultSymbolFullName, activeFilePath, symbols) {
    super.show();
    this.view.setSymbols(defaultSymbolFullName, activeFilePath, symbols);
  }

}
