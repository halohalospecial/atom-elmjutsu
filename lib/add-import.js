'use babel';

import helper from './helper';
import AddImportView from './add-import-view';

export default class AddImport {

  constructor(indexer) {
    this.indexer = indexer;
    this.view = new AddImportView();
    this.indexer.ports.showAddImportViewCmd.subscribe(([defaultSymbolName, activeFile, symbols]) => {
      this.view.show();
      this.view.setSymbols(defaultSymbolName, activeFile.filePath, activeFile.projectDirectory, symbols);
    });
    this.indexer.ports.updateImportsCmd.subscribe(([filePath, imports]) => {
      // Check if the active text editor is still the same.
      const editor = atom.workspace.getActiveTextEditor();
      if (helper.isElmEditor(editor) && editor.getPath() === filePath) {
        editor.scanInBufferRange(helper.allImportsRegex(), [[0, 0], editor.getEofBufferPosition()], ({replace, stop}) => {
          replace('\n' + imports);
          stop();
        });
      }
    });
    this.view.onDidConfirm(({item}) => {
      this.view.hide();
      this.indexer.ports.addImportSub.send([item.filePath, item.projectDirectory, item.moduleName, item.symbolName]);
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
      this.indexer.ports.showAddImportViewSub.send([editor.getPath(), helper.getToken(editor)]);
    }
  }

}
