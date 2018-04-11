'use babel';

import indexing from './indexing';
import helper from './helper';

export function provide(indexer) {
  return (filePath, position, token) => {
    if (!filePath || !position || !token) {
      indexing.sendToken(indexer, null, null, null);
      return;
    }
    const tokenInfoReceivedCmd = indexer.onTokenInfoReceived(info => {
      tokenInfoReceivedCmd.dispose();
      indexing.sendToken(indexer, editor, position, token);
    });
    const projectDirectory = helper.getProjectDirectory(filePath);
    const editor = atom.workspace
      .getTextEditors()
      .find(editor => editor.getPath() === filePath);
    const activeTopLevel = editor
      ? helper.getActiveTopLevel(editor, position)
      : null;
    const activeRecordVariable = editor
      ? helper.getActiveRecordVariable(editor, position)
      : null;
    indexer.getTokenInfo([
      projectDirectory,
      filePath,
      activeTopLevel,
      activeRecordVariable,
      token,
    ]);
  };
}
