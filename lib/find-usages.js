'use babel';

const CompositeDisposable = require('atom').CompositeDisposable;
import path from 'path';
const _ = require('underscore-plus');
import FindUsagesView from './find-usages-view';
import helper from './helper';
import usageFinder from './usage-finder';

export default class FindUsages {

  constructor(indexer, core) {
    this.indexer = indexer;
    this.core = core;
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.workspace.addOpener((uriToOpen) => {
      if (uriToOpen === getURI()) {
        this.view = new FindUsagesView(indexer);
        return this.view;
      }
    }));
  }

  destroy() {
    this.subscriptions.dispose();
    this.subscriptions = null;
    this.view.destroy();
    this.view = null;
  }

  createView(state) {
    return new FindUsagesView(state);
  }

  show(projectDirectory, token, usages) {
    const prevActivePane = atom.workspace.getActivePane();
    atom.workspace.open(getURI(), {searchAllPanes: true, split: 'right'})
      .then((view) => {
        if (isFindUsagesView(view)) {
          prevActivePane.activate();
          setTimeout(() => {
            view.setUsages(projectDirectory, token, usages);
          }, 0);
        }
      });
  }

  hide() {
    const uri = getURI();
    const pane = atom.workspace.paneForURI(uri);
    if (pane) {
      const result = pane.destroyItem(pane.itemForURI(uri));
      return true;
    }
    return false;
  }

  findUsages() {
    const editor = atom.workspace.getActiveTextEditor();
    if (helper.isElmEditor(editor)) {
      usageFinder.findUsagesOfSymbolAtCursor(editor, this.indexer, (projectDirectory, tokenToHighlight, usages) => {
        this.show(projectDirectory + path.sep, tokenToHighlight, usages);
      });
    }
  }

  goToNextUsage() {
    if (this.view) {
      this.core.storeJumpPoint();
      this.view.goToNextUsage();
    }
  }

  goToPreviousUsage() {
    if (this.view) {
      this.core.storeJumpPoint();
      this.view.goToPreviousUsage();
    }
  }

}

function getURI() {
  return 'elmjutsu-find-usages-view://';
}

function isFindUsagesView(view) {
  return view instanceof FindUsagesView;
}
