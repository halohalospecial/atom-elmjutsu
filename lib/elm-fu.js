'use babel';

const CompositeDisposable = require('atom').CompositeDisposable;
import Indexer from './indexer';
import Sidekick from './sidekick';
// import Finder from './finder';

export default {

  activate() {
    this.indexer = new Indexer();
    this.sidekick = new Sidekick(this.indexer.getIndexer());
    // this.getWorkDirectory = null;
    // this.finder = new Finder(this.getWorkDirectory);
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.commands.add('atom-text-editor:not([mini])[data-grammar^="source elm"]', {
      'elm-fu:go-to-definition': () => this.indexer.goToDefinition(),
      'elm-fu:return-from-definition': () => this.indexer.returnFromDefinition(),
      'elm-fu:find-symbol': () => this.indexer.findSymbol(),
      // 'elm-fu:find-usages': () => this.finder.findUsages(),
      // 'elm-fu:find-unused': () => this.finder.findUnused(),
    }));
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'elm-fu:toggle-sidekick': () => this.sidekick.toggle()
    }));
  },

  deactivate() {
    this.indexer.destroy();
    this.sidekick.destroy();
    // this.finder.destroy();
    this.subscriptions.dispose();
  },

  // // Provided by `linter-elm-make`.
  // consumeGetWorkDirectory(getWorkDirectory) {
  //   this.getWorkDirectory = getWorkDirectory;
  // }

};
