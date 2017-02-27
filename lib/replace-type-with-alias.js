'use babel';

import helper from './helper';
import ReplaceTypeWithAliasView from './replace-type-with-alias-view';

export default class ReplaceTypeWithAlias {

  constructor(indexer) {
    this.indexer = indexer;
    this.replaceTypeWithAliasView = new ReplaceTypeWithAliasView();
    this.replaceTypeWithAliasView.onDidConfirm(({item}) => {
      this.replaceTypeWithAliasView.hide();
      // TODO: Check that editor is still valid.
      item.editor.insertText(item.alias);
    });
  }

  destroy() {
    this.replaceTypeWithAliasView.destroy();
    this.replaceTypeWithAliasView = null;
  }

  replaceTypeWithAliasCommand() {
    const editor = atom.workspace.getActiveTextEditor();
    if (helper.isElmEditor(editor)) {
      if (editor.getSelectedBufferRange().isEmpty()) {
        editor.selectWordsContainingCursors();
      }
      this.replaceTypeWithAliasView.show();
      const aliasesOfTypeReceived = (aliases) => {
        this.indexer.ports.aliasesOfTypeReceivedCmd.unsubscribe(aliasesOfTypeReceived);
        this.replaceTypeWithAliasView.setAliases(editor, aliases);
      };
      this.indexer.ports.aliasesOfTypeReceivedCmd.subscribe(aliasesOfTypeReceived);
      this.indexer.ports.getAliasesOfTypeSub.send(editor.getSelectedText());
    }
  }

}
