'use babel';

const CompositeDisposable = require('atom').CompositeDisposable;
import Sidekick from './sidekick';
// import Finder from './finder';

export default {

  activate() {
    this.sidekick = new Sidekick();
    // this.finder = new Finder();
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.commands.add('atom-text-editor:not([mini])[data-grammar^="source elm"]', {
      // 'elm-fu:find-usages': () => this.finder.findUsages(),
      // 'elm-fu:find-unused': () => this.finder.findUnused(),
    }));
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'elm-fu:toggle-sidekick': () => this.sidekick.toggle()
    }));
  },

  deactivate() {
    this.sidekick.destroy();
    // this.finder.destroy();
    this.subscriptions.dispose();
  },

  // Provided by `linter-elm-make`.
  consumeGetWorkDirectory(getWorkDirectory) {
    this.getWorkDirectory = getWorkDirectory;
  }

};
