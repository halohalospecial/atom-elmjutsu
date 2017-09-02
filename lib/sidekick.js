'use babel';

import {CompositeDisposable, Disposable} from 'atom';
import helper from './helper';
import SidekickView from './sidekick-view';

export default class Sidekick {

  constructor(indexer) {
    const self = this;
    this.indexer = indexer;
    this.subscriptions = new CompositeDisposable();
  }

  destroy() {
    this.subscriptions.dispose();
    this.subscriptions = null;
    if (this.view) {
      this.view.destroy();
      this.view = null;
    }
  }

  toggleCommand() {
    if (!this.view) {
      this.view = new SidekickView(this.indexer, getConfig());
      [
        'elmjutsu.showTypesInSidekick',
        'elmjutsu.showTypeCasesInSidekick',
        'elmjutsu.showDocCommentsInSidekick',
        'elmjutsu.showAssociativitiesInSidekick',
        'elmjutsu.showPrecedencesInSidekick',
        'elmjutsu.showAliasesOfTypesInSidekick',
        'elmjutsu.showSourcePathsInSidekick',
      ].forEach((configKey) => {
          this.subscriptions.add(atom.config.observe(configKey, () => {
            this.view.updateConfig(getConfig());
          }));
        });
      const previousActivePane = atom.workspace.getActivePane();
      atom.workspace.open({
        element: this.view.getElement(),
        getTitle: () => {
          return this.view.getTitle();
        },
        getDefaultLocation: () => {
          return this.view.getDefaultLocation();
        }
      }).then((item) => {
          previousActivePane.activate();
          this.sidekickDockItem = item;
        });
    } else {
      const previousActivePane = atom.workspace.getActivePane();
      atom.workspace.toggle(this.sidekickDockItem).then(() => {
        previousActivePane.activate();
      });
    }
  }

}

function getConfig() {
  return {
    showTypes: atom.config.get('elmjutsu.showTypesInSidekick') || false,
    showTypeCases: atom.config.get('elmjutsu.showTypeCasesInSidekick') || false,
    showDocComments: atom.config.get('elmjutsu.showDocCommentsInSidekick') || false,
    showAssociativities: atom.config.get('elmjutsu.showAssociativitiesInSidekick') || false,
    showPrecedences: atom.config.get('elmjutsu.showPrecedencesInSidekick') || false,
    showAliasesOfType: atom.config.get('elmjutsu.showAliasesOfTypesInSidekick') || false,
    showSourcePaths: atom.config.get('elmjutsu.showSourcePathsInSidekick') || false,
  };
}
