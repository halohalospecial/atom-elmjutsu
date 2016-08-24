'use babel';

import Elm from '../elm/sidekick';

export default class SidekickView {

  constructor(indexer) {
    this.elmDiv = document.createElement('div');
    // Set `tabindex` to `-1` to allow selecting.
    this.elmDiv.setAttribute('tabindex', -1);
    // Add `native-key-bindings` to class list to allow copying.
    this.elmDiv.classList.add('elmjutsu', 'sidekick', 'native-key-bindings');
    const sidekick = Elm.Sidekick.embed(this.elmDiv);
    sidekick.ports.goToDefinitionCmd.subscribe((name) => {
      indexer.ports.goToDefinitionSub.send(name);
    });
    indexer.ports.activeHintsChangedCmd.subscribe((activeHints) => {
      sidekick.ports.activeHintsChangedSub.send(activeHints);
    });
    indexer.ports.activeFileChangedCmd.subscribe((activeFile) => {
      sidekick.ports.activeFilePathChangedSub.send((activeFile && activeFile.filePath) || null);
    });
    indexer.ports.docsLoadedCmd.subscribe((data) => {
      sidekick.ports.docsLoadedSub.send(null);
    });
    indexer.ports.docsFailedCmd.subscribe((data) => {
      sidekick.ports.docsFailedSub.send(null);
    });
    indexer.ports.updatingPackageDocsCmd.subscribe((data) => {
      sidekick.ports.updatingPackageDocsSub.send(null);
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
