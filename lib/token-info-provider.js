'use babel';

import indexing from './indexing';
import helper from './helper';

export function provide(indexer) {
  return (filePath, position, token) => {
    // return new Promise(resolve => {
    if (!filePath || !position || !token) {
      indexing.sendToken(indexer, editor, position, token);
      // return resolve([]);
    }
    const tokenInfoReceivedCmd = indexer.onTokenInfoReceived(info => {
      tokenInfoReceivedCmd.dispose();
      indexing.sendToken(indexer, editor, position, token);
      // return resolve(info);
    });
    const projectDirectory = helper.getProjectDirectory(filePath);
    const editor = atom.workspace
      .getTextEditors()
      .find(editor => editor.getPath() === filePath);
    const activeTopLevel = editor
      ? helper.getActiveTopLevel(editor, position)
      : null;
    indexer.postMessage({
      type: 'getTokenInfo',
      data: [projectDirectory, filePath, activeTopLevel, token],
    });
    // });
  };
}
