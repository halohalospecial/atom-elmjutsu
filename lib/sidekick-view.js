'use babel';

const ScrollView = require('atom-space-pen-views').ScrollView;
import Elm from '../elm/sidekick';

export default class SidekickView extends ScrollView {

  constructor(indexer) {
    super();
    this.indexer = indexer;
  }

  static content() {
    return this.div({tabindex: -1});
  }

  attached() {
    const elmDiv = document.createElement('div');
    elmDiv.classList.add('elmjutsu', 'sidekick');
    this.html(elmDiv);
    const sidekick = Elm.Sidekick.embed(elmDiv);
    sidekick.ports.goToDefinitionCmd.subscribe((name) => {
      this.indexer.ports.goToDefinitionSub.send(name);
    });
    this.indexer.ports.activeHintsChangedCmd.subscribe((activeHints) => {
      sidekick.ports.activeHintsChangedSub.send(activeHints);
    });
    this.indexer.ports.activeFilePathChangedCmd.subscribe((activeFilePath) => {
      sidekick.ports.activeFilePathChangedSub.send(activeFilePath);
    });
    this.indexer.ports.docsLoadedCmd.subscribe((data) => {
      sidekick.ports.docsLoadedSub.send(data);
    });
    this.indexer.ports.docsFailedCmd.subscribe((data) => {
      sidekick.ports.docsFailedSub.send(data);
    });
    this.indexer.ports.updatingPackageDocsCmd.subscribe((data) => {
      sidekick.ports.updatingPackageDocsSub.send(data);
    });
    // Resize pane to 1/4 width.
    this.parents('.pane')[0].style['flex-grow'] = 0.5;
  }

  detached() {
  }

  getURI() {
    return 'elmjutsu-sidekick-view://';
  }

  getTitle() {
    return 'Elmjutsu Sidekick';
  }

}
