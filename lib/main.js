'use babel';

const CompositeDisposable = require('atom').CompositeDisposable;
import Config from './config';
import Indexer from './indexer';
import GoToSymbol from './go-to-symbol';
import Sidekick from './sidekick';
import FindUsages from './find-usages';

export default {
  config: Config,

  activate() {
    this.indexer = new Indexer();
    this.goToSymbol = new GoToSymbol(this.indexer.getIndexer());
    this.sidekick = new Sidekick(this.indexer.getIndexer());
    this.findUsages = new FindUsages(this.indexer.getIndexer());
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.commands.add('atom-text-editor:not([mini])[data-grammar^="source elm"]', {
      'elmjutsu:go-to-definition': () => this.indexer.goToDefinition(),
      'elmjutsu:go-to-symbol': () => this.indexer.goToSymbol(),
      'elmjutsu:go-back': () => this.indexer.goBack(),
      'elmjutsu:find-usages': () => this.indexer.findUsages(),
      'elmjutsu:go-to-next-usage': () => this.findUsages.goToNextUsage(),
      'elmjutsu:go-to-previous-usage': () => this.findUsages.goToPreviousUsage(),
      'elmjutsu:cancel-find-usages': () => this.findUsages.hide()
    }));
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'elmjutsu:toggle-sidekick': () => this.sidekick.toggle()
    }));
  },

  deactivate() {
    this.indexer.destroy();
    this.goToSymbol.destroy();
    this.sidekick.destroy();
    this.findUsages.destroy();
    this.subscriptions.dispose();
  },

  // For `autocomplete-plus`.
  provideAutocomplete() {
    return require('./autocomplete-provider').provide(this.indexer.getIndexer());
  },

  // For `hyperclick`.
  provideHyperclick() {
    return require('./hyperclick-provider').provide(this.indexer.getIndexer());
  }

};
