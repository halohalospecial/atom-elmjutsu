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
    const storeJumpPointFunction = this.core.storeJumpPoint.bind(this.core);
    this.goToSymbol = new GoToSymbol(this.core.getIndexer(), storeJumpPointFunction);
    this.sidekick = new Sidekick(this.core.getIndexer());
    this.findAndRenameUsages = new FindAndRenameUsages(this.core.getIndexer(), storeJumpPointFunction);
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.commands.add('atom-text-editor:not([mini])[data-grammar^="source elm"]', {
      'elmjutsu:go-to-definition': () => this.core.goToDefinition(),
      'elmjutsu:go-to-symbol': () => this.goToSymbol.goToSymbol(),
      'elmjutsu:find-usages': () => this.findAndRenameUsages.findUsages(),
      'elmjutsu:go-to-next-usage': () => this.findAndRenameUsages.goToNextUsage(),
      'elmjutsu:go-to-previous-usage': () => this.findAndRenameUsages.goToPreviousUsage(),
      'elmjutsu:go-back': () => this.core.goBack(),
      'elmjutsu:rename-symbol': () => this.findAndRenameUsages.renameSymbol()
    }));
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'elmjutsu:hide-usages-panel': () => this.findAndRenameUsages.hide(),
      'elmjutsu:toggle-sidekick': () => this.sidekick.toggle()
    }));
  },

  deactivate() {
    this.core.destroy();
    this.core = null;
    this.goToSymbol.destroy();
    this.goToSymbol = null;
    this.sidekick.destroy();
    this.sidekick = null;
    this.findAndRenameUsages.destroy();
    this.findAndRenameUsages = null;
    this.subscriptions.dispose();
    this.subscriptions = null;
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
    this.core.setGetWorkDirectoryFunction(getWorkDirectoryFunction);
    this.findAndRenameUsages.setGetWorkDirectoryFunction(getWorkDirectoryFunction);
  }

};
