'use babel';

import helper from './helper';
import SymbolFinder from './symbol-finder';
import GoToSymbolView from './go-to-symbol-view';

export default class GoToSymbol extends SymbolFinder {

  constructor(indexer, storeJumpPointFunction) {
    super(indexer, GoToSymbolView);
    this.indexer = indexer;
    this.storeJumpPoint = storeJumpPointFunction;
    this.indexer.ports.showGoToSymbolViewCmd.subscribe(([defaultSymbolName, activeFile, symbols]) => {
      super.show();
      this.view.setSymbols(defaultSymbolName, (activeFile && activeFile.filePath) || null, symbols);
    });
  }

  getSymbolRange(symbol, editor) {
    var symbolRange = editor.getSelectedBufferRange();
    helper.scanForSymbolDefinitionRange(editor, symbol, (range) => {
      symbolRange = range;
    });
    return symbolRange;
  }

  goToSymbolCommand() {
    const editor = atom.workspace.getActiveTextEditor();
    if (helper.isElmEditor(editor)) {
      this.storeJumpPoint();
      this.indexer.ports.showGoToSymbolViewSub.send([helper.getProjectDirectory(editor.getPath()), helper.getToken(editor)]);
    }
  }

}
