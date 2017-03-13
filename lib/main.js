'use babel';

import {CompositeDisposable} from 'atom';
import helper from './helper';
import Config from './config';
import Core from './core';
import GoTo from './go-to';
import GoToSymbol from './go-to-symbol';
import FindAndRenameUsages from './find-and-rename-usages';
import AddImport from './add-import';
import PackageManager from './package-manager';
import Sidekick from './sidekick';
import HintTooltip from './hint-tooltip';
import Eval from './eval';
import ActOnSelection from './act-on-selection';
import ReplaceTypeWithAlias from './replace-type-with-alias';
import InferTypes from './infer-types';

export default {
  config: Config,

  activate() {
    this.core = new Core();
    this.goTo = new GoTo(this.core.getIndexer());
    this.storeJumpPointFunction = this.goTo.storeJumpPoint.bind(this.goTo);
    this.goToSymbol = new GoToSymbol(this.core.getIndexer(), this.storeJumpPointFunction);
    this.findAndRenameUsages = new FindAndRenameUsages(this.core.getIndexer(), this.storeJumpPointFunction);
    this.addImport = new AddImport(this.core.getIndexer());
    this.packageManager = new PackageManager();
    this.sidekick = new Sidekick(this.core.getIndexer());
    this.hintTooltip = new HintTooltip(this.core.getIndexer());
    this.eval = new Eval(this.core.getIndexer());
    this.actOnSelection = new ActOnSelection();
    this.replaceTypeWithAlias = new ReplaceTypeWithAlias(this.core.getIndexer());
    this.inferTypes = new InferTypes(this.core.getIndexer());
    this.core.setInferTypes(this.inferTypes);
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.commands.add('atom-text-editor:not([mini])[data-grammar^="source elm"]', {
      'elmjutsu:go-to-definition': () => this.goTo.goToDefinitionCommand(),
      'elmjutsu:go-to-symbol': () => this.goToSymbol.goToSymbolCommand(),
      'elmjutsu:find-usages': () => this.findAndRenameUsages.findUsagesCommand(),
      'elmjutsu:go-to-next-usage': () => this.findAndRenameUsages.goToNextUsageCommand(),
      'elmjutsu:go-to-previous-usage': () => this.findAndRenameUsages.goToPreviousUsageCommand(),
      'elmjutsu:go-back': () => this.goTo.goBackCommand(),
      // 'elmjutsu:infer-hole-types': () => this.inferTypes.inferHoleTypesCommand(),
      'elmjutsu:infer-type': () => this.inferTypes.inferTypeCommand(),
      'elmjutsu:add-import': () => this.addImport.addImportCommand(),
      'elmjutsu:rename-symbol': () => this.findAndRenameUsages.renameSymbolCommand(),
      'elmjutsu:surround-with-let': () => this.actOnSelection.surroundWithLetCommand(),
      'elmjutsu:lift-to-let': () => this.actOnSelection.liftToLetCommand(),
      'elmjutsu:lift-to-top-level': () => this.actOnSelection.liftToTopLevelCommand(),
      // 'elmjutsu:replace-type-with-alias': () => this.replaceTypeWithAlias.replaceTypeWithAliasCommand(),
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
    this.subscriptions.dispose();
    this.subscriptions = null;
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
    this.replaceTypeWithAlias.destroy();
    this.replaceTypeWithAlias = null;
    this.inferTypes.destroy();
    this.inferTypes = null;
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
    const setAutocompleteActiveFunction = (editor, isActive) => {
      return this.core.setAutocompleteActive(editor, isActive);
    };
    return require('./autocomplete-provider').provide(this.core.getIndexer(), shouldGetSuggestions, getInferenceAtCursorPosition, clearCursorInferenceFunction, setAutocompleteActiveFunction);
  },

  // For `hyperclick`.
  provideHyperclick() {
    return require('./hyperclick-provider').provide(this.core.getIndexer(), this.storeJumpPointFunction);
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
