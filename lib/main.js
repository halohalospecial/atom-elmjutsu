'use babel';

import {CompositeDisposable} from 'atom';
import helper from './helper';
import Config from './config';
import Core from './core';
import PackageManager from './package-manager';
import GoToSymbol from './go-to-symbol';
import FindAndRenameUsages from './find-and-rename-usages';
import AddImport from './add-import';
import Sidekick from './sidekick';
import HintTooltip from './hint-tooltip';
import Eval from './eval';
import ActOnSelection from './act-on-selection';
import InferTypes from './infer-types';

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
    this.hintTooltip = new HintTooltip(this.core.getIndexer());
    this.eval = new Eval(this.core.getIndexer());
    this.actOnSelection = new ActOnSelection();
    this.inferTypes = new InferTypes(this.core.getIndexer());
    this.core.setInferTypes(this.inferTypes);
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
      'elmjutsu:surround-with-let': () => this.actOnSelection.surroundWithLetCommand(),
      'elmjutsu:lift-to-let': () => this.actOnSelection.liftToLetCommand(),
      'elmjutsu:lift-to-top-level': () => this.actOnSelection.liftToTopLevelCommand(),
      'elmjutsu:infer-hole-types': () => this.inferTypes.inferHoleTypesCommand(),
      'elmjutsu:infer-expression-type': () => this.inferTypes.inferExpressionTypeCommand(),
    }));
    this.subscriptions.add(atom.commands.add('atom-text-editor', {
      'elmjutsu:install-package': () => this.packageManager.installPackageCommand(),
      'elmjutsu:uninstall-package': () => this.packageManager.uninstallPackageCommand(),
      'elmjutsu:eval': () => this.eval.evalCommand(),
      'elmjutsu:pipe-selections': () => this.eval.pipeCommand(),
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
    this.hintTooltip.destroy();
    this.hintTooltip = null;
    this.eval.destroy();
    this.eval = null;
    this.actOnSelection.destroy();
    this.actOnSelection = null;
    this.inferTypes.destroy();
    this.inferTypes = null;
    this.subscriptions.dispose();
    this.subscriptions = null;
  },

  // For `autocomplete-plus`.
  provideAutocomplete() {
    const shouldGetSuggestions = () => {
      return this.actOnSelection.shouldGetSuggestions();
    };
    const getInferenceAtCursorPosition = (editor) => {
      return this.inferTypes.getInferenceAtCursorPosition(editor);
    };
    const clearCursorInferenceFunction = () => {
      return this.inferTypes.clearCursorInference();
    };
    return require('./autocomplete-provider').provide(this.core.getIndexer(), shouldGetSuggestions, getInferenceAtCursorPosition, clearCursorInferenceFunction);
  },

  // For `hyperclick`.
  provideHyperclick() {
    return require('./hyperclick-provider').provide(this.core.getIndexer());
  },

  consumeStatusBar(statusBar) {
    if (!statusBar) {
      return;
    }
    this.inferTypes.setStatusBar(statusBar);
  },

  // Provided by `linter-elm-make`.
  consumeGetWorkDirectory(getWorkDirectoryFunction) {
    this.core.setGetWorkDirectoryFunction(getWorkDirectoryFunction);
    this.findAndRenameUsages.setGetWorkDirectoryFunction(getWorkDirectoryFunction);
  }

};
