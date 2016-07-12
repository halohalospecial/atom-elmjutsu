'use babel';

const CompositeDisposable = require('atom').CompositeDisposable;
import Finder from './finder';
import Sidekick from './sidekick';

export default {

  activate() {
    this.finder = new Finder();
    this.sidekick = new Sidekick();
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.commands.add('atom-text-editor:not([mini])[data-grammar^="source elm"]', {
      'elm-fu:find-usages': () => this.finder.findUsages(),
      'elm-fu:find-unused': () => this.finder.findUnused(),
    }));
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'elm-fu:toggle-sidekick': () => this.sidekick.toggle()
    }));
  },

  deactivate() {
    this.finder.destroy();
    this.sidekick.destroy();
    this.subscriptions.dispose();
  },

  // Provided by `linter-elm-make`.
  consumeGetWorkDirectory(getWorkDirectory) {
    this.getWorkDirectory = getWorkDirectory;
  }

};
