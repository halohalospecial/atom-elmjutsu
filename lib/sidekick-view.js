'use babel';

import Elm from '../elm/sidekick';
import helper from './helper';

export default class SidekickView {
  constructor(indexer, storeJumpPointFunction, config) {
    this.storeJumpPointFunction = storeJumpPointFunction;
    this.elmDiv = document.createElement('div');
    // Set `tabindex` to `-1` to allow selecting.
    this.elmDiv.setAttribute('tabindex', -1);
    // Add `native-key-bindings` to class list to allow copying.
    this.elmDiv.classList.add('elmjutsu-sidekick', 'native-key-bindings');
    this.sidekick = Elm.Sidekick.embed(this.elmDiv, config);
    indexer.onActiveTokenHintsChanged(([activeToken, activeTokenHints]) => {
      this.activeToken = activeToken;
      this.sidekick.ports.activeTokenHintsChangedSub.send(activeTokenHints);
    });
    indexer.onActiveFileChanged(activeFile => {
      this.sidekick.ports.activeFileChangedSub.send(activeFile);
    });
    indexer.onDocsRead(data => {
      this.sidekick.ports.docsReadSub.send(null);
    });
    indexer.onDocsDownloaded(data => {
      this.sidekick.ports.docsDownloadedSub.send(null);
    });
    // indexer.onDownloadDocsFailed((data) => {
    //   this.sidekick.ports.downloadDocsFailedSub.send(data);
    // });
    indexer.onReadingPackageDocs(data => {
      this.sidekick.ports.readingPackageDocsSub.send(null);
    });
    indexer.onDownloadingPackageDocs(data => {
      this.sidekick.ports.downloadingPackageDocsSub.send(null);
    });
    this.sidekick.ports.goToDefinitionCmd.subscribe(name => {
      const editor = atom.workspace.getActiveTextEditor();
      if (helper.isElmEditor(editor)) {
        storeJumpPointFunction();
        indexer.goToDefinition([
          helper.getActiveTopLevel(editor),
          helper.getActiveRecordVariable(editor),
          this.activeToken,
        ]);
      }
    });
  }

  destroy() {
    this.elmDiv.remove();
    this.elmDiv = null;
  }

  getElement() {
    return this.elmDiv;
  }

  updateConfig(config) {
    this.sidekick.ports.configChangedSub.send(config);
  }
}
