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
        let foundImports = false;
        editor.scanInBufferRange(helper.allImportsRegex(), [[0, 0], editor.getEofBufferPosition()], ({matchText, replace, stop}) => {
          const leadingWhitespaces = matchText.match(/\s*/)[0];
          replace(leadingWhitespaces + imports);
          stop();
          foundImports = true;
        });
        if (!foundImports) {
          editor.scanInBufferRange(helper.moduleNameRegex(), [[0, 0], editor.getEofBufferPosition()], ({range, stop}) => {
            editor.setTextInBufferRange([range.end, range.end], '\n\n' + imports);
            stop();
          });
        }
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

  addImportCommand() {
    const editor = atom.workspace.getActiveTextEditor();
    if (helper.isElmEditor(editor)) {
      this.indexer.ports.showAddImportViewSub.send([editor.getPath(), helper.getToken(editor)]);
    }
  }

}
