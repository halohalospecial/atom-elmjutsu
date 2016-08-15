'use babel';

const CompositeDisposable = require('atom').CompositeDisposable;
import helper from './helper';
import Config from './config';
import Core from './core';
import GoToSymbol from './go-to-symbol';
import Sidekick from './sidekick';
import FindUsages from './find-usages';

export default {
  config: Config,

  activate() {
    this.core = new Core();
    this.goToSymbol = new GoToSymbol(this.core.getIndexer());
    this.sidekick = new Sidekick(this.core.getIndexer());
    this.findUsages = new FindUsages(this.core.getIndexer(), this.core);
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.commands.add('atom-text-editor:not([mini])[data-grammar^="source elm"]', {
      'elmjutsu:go-to-definition': () => this.core.goToDefinition(),
      'elmjutsu:go-to-symbol': () => this.core.goToSymbol(),
      'elmjutsu:go-back': () => this.core.goBack(),
      'elmjutsu:find-usages': () => this.core.findUsages(),
      'elmjutsu:go-to-next-usage': () => this.findUsages.goToNextUsage(),
      'elmjutsu:go-to-previous-usage': () => this.findUsages.goToPreviousUsage(),
      'elmjutsu:cancel-find-usages': () => this.findUsages.hide()
    }));
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'elmjutsu:toggle-sidekick': () => this.sidekick.toggle()
    }));
  },

  deactivate() {
    this.core.destroy();
    this.goToSymbol.destroy();
    this.sidekick.destroy();
    this.findUsages.destroy();
    this.subscriptions.dispose();
  },

  // For `autocomplete-plus`.
  provideAutocomplete() {
    return require('./autocomplete-provider').provide(this.core.getIndexer());
  },

  // For `hyperclick`.
  provideHyperclick() {
    return require('./hyperclick-provider').provide(this.core.getIndexer());
  }

};
