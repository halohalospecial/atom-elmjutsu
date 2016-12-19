'use babel';

const CompositeDisposable = require('atom').CompositeDisposable;
import helper from './helper';
import Config from './config';
import Core from './core';
import PackageManager from './package-manager';
import GoToSymbol from './go-to-symbol';
import FindAndRenameUsages from './find-and-rename-usages';
import AddImport from './add-import';
import Sidekick from './sidekick';
import Eval from './eval';

export default {
  config: Config,

  activate() {
    this.core = new Core();
    this.packageManager = new PackageManager();
    const storeJumpPointFunction = this.core.storeJumpPoint.bind(this.core);
    this.goToSymbol = new GoToSymbol(this.core.getIndexer(), storeJumpPointFunction);
    this.findAndRenameUsages = new FindAndRenameUsages(this.core.getIndexer(), storeJumpPointFunction);
    this.addImport = new AddImport(this.core.getIndexer());
    this.sidekick = new Sidekick(this.core.getIndexer());
    this.eval = new Eval(this.core.getIndexer());
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.commands.add('atom-text-editor:not([mini])[data-grammar^="source elm"]', {
      'elmjutsu:go-to-definition': () => this.core.goToDefinitionCommand(),
      'elmjutsu:go-to-symbol': () => this.goToSymbol.goToSymbolCommand(),
      'elmjutsu:find-usages': () => this.findAndRenameUsages.findUsagesCommand(),
      'elmjutsu:go-to-next-usage': () => this.findAndRenameUsages.goToNextUsageCommand(),
      'elmjutsu:go-to-previous-usage': () => this.findAndRenameUsages.goToPreviousUsageCommand(),
      'elmjutsu:go-back': () => this.core.goBackCommand(),
      'elmjutsu:rename-symbol': () => this.findAndRenameUsages.renameSymbolCommand(),
      'elmjutsu:add-import': () => this.addImport.addImportCommand(),
    }));
    this.subscriptions.add(atom.commands.add('atom-text-editor', {
      'elmjutsu:install-package': () => this.packageManager.installPackageCommand(),
      'elmjutsu:uninstall-package': () => this.packageManager.uninstallPackageCommand(),
      // 'elmjutsu:eval': () => this.eval.evalCommand(),
      // 'elmjutsu:pipe-selections': () => this.eval.pipeCommand(),
    }));
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'elmjutsu:hide-usages-panel': () => this.findAndRenameUsages.hideCommand(),
      'elmjutsu:toggle-sidekick': () => this.sidekick.toggleCommand(),
    }));
  },

  deactivate() {
    this.core.destroy();
    this.core = null;
    this.packageManager.destroy();
    this.packageManager = null;
    this.goToSymbol.destroy();
    this.goToSymbol = null;
    this.findAndRenameUsages.destroy();
    this.findAndRenameUsages = null;
    this.addImport.destroy();
    this.addImport = null;
    this.sidekick.destroy();
    this.sidekick = null;
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
