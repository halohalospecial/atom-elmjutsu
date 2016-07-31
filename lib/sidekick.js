'use babel';

const CompositeDisposable = require('atom').CompositeDisposable;
import SidekickView from './sidekick-view';

export default class Sidekick {

  constructor(indexer) {
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.workspace.addOpener((uriToOpen) => {
      if (uriToOpen === getURI()) {
        this.sidekickView = new SidekickView(indexer);
        return this.sidekickView;
      }
    }));
  }

  destroy() {
    this.subscriptions.dispose();
    this.sidekickView.destroy();
  }

  createView(state) {
    return new SidekickView(state);
  }

  toggle() {
    if (isSidekickView(atom.workspace.getActivePaneItem())) {
      atom.workspace.destroyActivePaneItem();
      return;
    }
    if (!this.removeView()) {
      this.addView();
    }
  }

  addView() {
    const prevActivePane = atom.workspace.getActivePane();
    atom.workspace.open(getURI(), {searchAllPanes: true, split: 'right'})
      .then((view) => {
        if (isSidekickView(view)) {
          prevActivePane.activate();
        }
      });
  }

  removeView() {
    const uri = getURI();
    const pane = atom.workspace.paneForURI(uri);
    if (pane) {
      const result = pane.destroyItem(pane.itemForURI(uri));
      return true;
    }
    return false;
  }

}

function getURI() {
  return 'elmjutsu-sidekick-view://';
}

function isSidekickView(view) {
  return view instanceof SidekickView;
}
