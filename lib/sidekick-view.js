'use babel';

import Elm from '../elm/sidekick';

export default class SidekickView {

  constructor(indexer) {
    this.elmDiv = document.createElement('div');
    // Set `tabindex` to `-1` to allow selecting.
    this.elmDiv.setAttribute('tabindex', -1);
    // Add `native-key-bindings` to class list to allow copying.
    this.elmDiv.classList.add('elmjutsu-sidekick', 'native-key-bindings');
    const sidekick = Elm.Sidekick.embed(this.elmDiv);
    indexer.ports.activeHintsChangedCmd.subscribe((activeHints) => {
      sidekick.ports.activeHintsChangedSub.send(activeHints);
    });
    indexer.ports.activeFileChangedCmd.subscribe((activeFile) => {
      sidekick.ports.activeFileChangedSub.send(activeFile);
    });
    indexer.ports.docsReadCmd.subscribe((data) => {
      sidekick.ports.docsReadSub.send(null);
    });
    indexer.ports.docsDownloadedCmd.subscribe((data) => {
      sidekick.ports.docsDownloadedSub.send(null);
    });
    indexer.ports.downloadDocsFailedCmd.subscribe((data) => {
      sidekick.ports.downloadDocsFailedSub.send(null);
    });
    indexer.ports.readingPackageDocsCmd.subscribe((data) => {
      sidekick.ports.readingPackageDocsSub.send(null);
    });
    indexer.ports.downloadingPackageDocsCmd.subscribe((data) => {
      sidekick.ports.downloadingPackageDocsSub.send(null);
    });
    sidekick.ports.goToDefinitionCmd.subscribe((name) => {
      indexer.ports.goToDefinitionSub.send(name);
    });
  }

  destroy() {
    this.elmDiv.remove();
    this.elmDiv = null;
  }

  getElement() {
    return this.elmDiv;
  }

}
