'use babel';

const CompositeDisposable = require('atom').CompositeDisposable;
import helper from './helper';
import Config from './config';
import Core from './core';
import GoToSymbol from './go-to-symbol';
import Sidekick from './sidekick';
import FindAndRenameUsages from './find-and-rename-usages';

export default {
  config: Config,

  activate() {
    this.core = new Core();
    this.goToSymbol = new GoToSymbol(this.core.getIndexer());
    this.sidekick = new Sidekick(this.core.getIndexer());
    this.findAndRenameUsages = new FindAndRenameUsages(this.core.getIndexer(), this.core);
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.commands.add('atom-text-editor:not([mini])[data-grammar^="source elm"]', {
      'elmjutsu:go-to-definition': () => this.core.goToDefinition(),
      'elmjutsu:go-to-symbol': () => this.core.goToSymbol(),
      'elmjutsu:go-back': () => this.core.goBack(),
      'elmjutsu:find-usages': () => this.findAndRenameUsages.findUsages(),
      'elmjutsu:go-to-next-usage': () => this.findAndRenameUsages.goToNextUsage(),
      'elmjutsu:go-to-previous-usage': () => this.findAndRenameUsages.goToPreviousUsage(),
      'elmjutsu:rename-symbol': () => this.findAndRenameUsages.renameSymbol()
    }));
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'elmjutsu:hide-usages-panel': () => this.findAndRenameUsages.hide(),
      'elmjutsu:toggle-sidekick': () => this.sidekick.toggle()
    }));
  },

  deactivate() {
    this.core.destroy();
    this.goToSymbol.destroy();
    this.sidekick.destroy();
    this.findAndRenameUsages.destroy();
    this.subscriptions.dispose();
  },

  // For `autocomplete-plus`.
  provideAutocomplete() {
    return require('./autocomplete-provider').provide(this.core.getIndexer());
  },

  // For `hyperclick`.
  provideHyperclick() {
    return require('./hyperclick-provider').provide(this.core.getIndexer());
  },

  // Provided by `linter-elm-make`.
  consumeGetWorkDirectory(getWorkDirectoryFunction) {
    this.findAndRenameUsages.setGetWorkDirectoryFunction(getWorkDirectoryFunction);
  }

};
