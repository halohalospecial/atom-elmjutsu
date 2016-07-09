'use babel';

const CompositeDisposable = require('atom').CompositeDisposable;
import Finder from './finder';
import Hinter from './hinter';

export default {

  activate() {
    this.finder = new Finder();
    this.hinter = new Hinter();
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.commands.add('atom-text-editor:not([mini])[data-grammar^="source elm"]', {
      'elm-fu:find-usages': () => this.finder.findUsages(),
      'elm-fu:find-unused': () => this.finder.findUnused()
    }));
  },

  deactivate() {
    this.finder.destroy();
    this.hinter.destroy();
    this.subscriptions.dispose();
  },

  consumeStatusBar(statusBar) {
    statusBar.addLeftTile({
      item: this.hinter.getElement(),
      priority: 1
    });
  },

  // Provided by `linter-elm-make`.
  consumeGetWorkDirectory(getWorkDirectory) {
    this.getWorkDirectory = getWorkDirectory;
  }

};
