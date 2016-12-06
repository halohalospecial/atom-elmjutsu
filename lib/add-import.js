'use babel';

import helper from './helper';
import AddImportView from './add-import-view';

export default class AddImport {

  constructor(indexer) {
    this.indexer = indexer;
    this.view = new AddImportView();
    this.view.onDidConfirm(({item}) => {
      // TODO
      this.view.hide();
    });
    this.view.onDidCancel(() => {
      // TODO
    });
    this.indexer.ports.addImportCmd.subscribe(([defaultSymbolName, activeFile, symbols]) => {
      this.view.show();
      this.view.setSymbols(defaultSymbolName, (activeFile && activeFile.filePath) || null, symbols);
    });
  }

  destroy() {
    this.view.destroy();
    this.view = null;
  }

  // Command
  addImport() {
    const editor = atom.workspace.getActiveTextEditor();
    if (helper.isElmEditor(editor)) {
      this.indexer.ports.addImportSub.send(helper.getToken(editor));
    }
  }

}
