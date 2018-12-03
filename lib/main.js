'use babel';

import { CompositeDisposable } from 'atom';
import tmp from 'tmp';
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
import Datatip from './datatip';
import Eval from './eval';
import ActOnSelection from './act-on-selection';
import ReplaceTypeWithAlias from './replace-type-with-alias';
import InferTypes from './infer-types';
import ScopeBar from './scope-bar';
import HotReloader from './hot-reloader';
import ElmMakeRunner from './elm-make-runner';
import QuickFix from './quick-fix';

export default {
  config: Config,

  activate() {
    let startTime = helper.getTimestamp();
    require('atom-package-deps').install('elmjutsu');
    this.core = new Core();
    helper.debugLog(
      'Core activated ' + (helper.getTimestamp() - startTime) + ' ms'
    );
    startTime = helper.getTimestamp();
    this.goTo = new GoTo(this.core.getIndexer());
    this.storeJumpPointFunction = this.goTo.storeJumpPoint.bind(this.goTo);
    helper.debugLog(
      'GoTo activated ' + (helper.getTimestamp() - startTime) + ' ms'
    );
    startTime = helper.getTimestamp();
    this.goToSymbol = new GoToSymbol(
      this.core.getIndexer(),
      this.storeJumpPointFunction
    );
    helper.debugLog(
      'GoToSymbol activated ' + (helper.getTimestamp() - startTime) + ' ms'
    );
    startTime = helper.getTimestamp();
    this.findAndRenameUsages = new FindAndRenameUsages(
      this.core.getIndexer(),
      this.storeJumpPointFunction
    );
    helper.debugLog(
      'FindAndRenameUsages activated ' +
        (helper.getTimestamp() - startTime) +
        ' ms'
    );
    startTime = helper.getTimestamp();
    this.addImport = new AddImport(this.core.getIndexer());
    helper.debugLog(
      'AddImport activated ' + (helper.getTimestamp() - startTime) + ' ms'
    );
    startTime = helper.getTimestamp();
    this.packageManager = new PackageManager();
    helper.debugLog(
      'PackageManager activated ' + (helper.getTimestamp() - startTime) + ' ms'
    );
    startTime = helper.getTimestamp();
    this.sidekick = new Sidekick(
      this.core.getIndexer(),
      this.storeJumpPointFunction
    );
    helper.debugLog(
      'Sidekick activated ' + (helper.getTimestamp() - startTime) + ' ms'
    );
    startTime = helper.getTimestamp();
    this.hintTooltip = new HintTooltip(this.core.getIndexer());
    helper.debugLog(
      'HintTooltip activated ' + (helper.getTimestamp() - startTime) + ' ms'
    );
    startTime = helper.getTimestamp();
    this.datatip = new Datatip(
      this.core.getIndexer(),
      this.storeJumpPointFunction
    );
    helper.debugLog(
      'Datatip activated ' + (helper.getTimestamp() - startTime) + ' ms'
    );
    startTime = helper.getTimestamp();
    this.eval = new Eval(this.core.getIndexer());
    helper.debugLog(
      'Eval activated ' + (helper.getTimestamp() - startTime) + ' ms'
    );
    startTime = helper.getTimestamp();
    this.actOnSelection = new ActOnSelection();
    helper.debugLog(
      'ActOnSelection activated ' + (helper.getTimestamp() - startTime) + ' ms'
    );
    startTime = helper.getTimestamp();
    this.replaceTypeWithAlias = new ReplaceTypeWithAlias(
      this.core.getIndexer()
    );
    helper.debugLog(
      'ReplaceTypeWithAlias activated ' +
        (helper.getTimestamp() - startTime) +
        ' ms'
    );
    startTime = helper.getTimestamp();
    this.inferTypes = new InferTypes(this.core.getIndexer());
    this.core.setInferTypes(this.inferTypes);
    helper.debugLog(
      'InferTypes activated ' + (helper.getTimestamp() - startTime) + ' ms'
    );
    startTime = helper.getTimestamp();
    this.scopeBar = new ScopeBar();
    helper.debugLog(
      'ScopeBar activated ' + (helper.getTimestamp() - startTime) + ' ms'
    );
    startTime = helper.getTimestamp();
    this.hotReloader = new HotReloader();
    helper.debugLog(
      'HotReloader activated ' + (helper.getTimestamp() - startTime) + ' ms'
    );
    startTime = helper.getTimestamp();
    this.quickFix = new QuickFix(this.packageManager, this.addImport);
    helper.debugLog(
      'QuickFix activated ' + (helper.getTimestamp() - startTime) + ' ms'
    );
    startTime = helper.getTimestamp();
    this.elmMakeRunner = new ElmMakeRunner(this.quickFix);
    this.core.setElmMakeRunner(this.elmMakeRunner);
    helper.debugLog(
      'ElmMakeRunner activated ' + (helper.getTimestamp() - startTime) + ' ms'
    );
    startTime = helper.getTimestamp();
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(
      atom.commands.add(
        'atom-text-editor:not([mini])[data-grammar^="source elm"]',
        {
          'elmjutsu:quick-fix-file': () => this.quickFix.quickFixFileCommand(),
          'elmjutsu:set-main-paths': () =>
            this.elmMakeRunner.setMainPathsCommand(),
          'elmjutsu:set-compile-output-path': () =>
            this.elmMakeRunner.setCompileOutputPathCommand(),
          'elmjutsu:go-to-definition': () => this.goTo.goToDefinitionCommand(),
          'elmjutsu:go-to-symbol': () => this.goToSymbol.goToSymbolCommand(),
          'elmjutsu:find-usages': () =>
            this.findAndRenameUsages.findUsagesCommand(),
          'elmjutsu:go-to-next-usage': () =>
            this.findAndRenameUsages.goToNextUsageCommand(),
          'elmjutsu:go-to-previous-usage': () =>
            this.findAndRenameUsages.goToPreviousUsageCommand(),
          'elmjutsu:go-back': () => this.goTo.goBackCommand(),
          // 'elmjutsu:infer-hole-types': () => this.inferTypes.inferHoleTypesCommand(),
          'elmjutsu:infer-type': () => this.inferTypes.inferTypeCommand(),
          'elmjutsu:add-import': () => this.addImport.addImportCommand(),
          'elmjutsu:add-import-as': () => this.addImport.addImportAsCommand(),
          'elmjutsu:rename-symbol': () =>
            this.findAndRenameUsages.renameSymbolCommand(),
          'elmjutsu:surround-with-let': () =>
            this.actOnSelection.surroundWithLetCommand(),
          'elmjutsu:lift-to-let': () => this.actOnSelection.liftToLetCommand(),
          'elmjutsu:lift-to-top-level': () =>
            this.actOnSelection.liftToTopLevelCommand(),
          // 'elmjutsu:replace-type-with-alias': () => this.replaceTypeWithAlias.replaceTypeWithAliasCommand(),
          'elmjutsu:toggle-always-compile-main': () =>
            this.elmMakeRunner.toggleAlwaysCompileMainCommand(),
          'elmjutsu:toggle-report-warnings': () =>
            this.elmMakeRunner.toggleReportWarningsCommand(),
          'elmjutsu:toggle-compile-with-debugger': () =>
            this.elmMakeRunner.toggleCompileWithDebuggerCommand(),
          'elmjutsu:toggle-compile-with-optimizations': () =>
            this.elmMakeRunner.toggleCompileWithOptimizationsCommand(),
        }
      )
    );
    this.subscriptions.add(
      atom.commands.add('atom-text-editor', {
        'elmjutsu:install-package': () =>
          this.packageManager.installPackageCommand(),
        'elmjutsu:uninstall-package': () =>
          this.packageManager.uninstallPackageCommand(),
        'elmjutsu:eval': () => this.eval.evalCommand(),
        'elmjutsu:pipe-selections': () => this.eval.pipeCommand(),
      })
    );
    this.subscriptions.add(
      atom.commands.add('atom-workspace', {
        'elmjutsu:hide-usages-panel': () =>
          this.findAndRenameUsages.hideCommand(),
        'elmjutsu:toggle-sidekick': () => this.sidekick.toggleCommand(),
      })
    );
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
    this.datatip.destroy();
    this.datatip = null;
    this.eval.destroy();
    this.eval = null;
    this.actOnSelection.destroy();
    this.actOnSelection = null;
    this.replaceTypeWithAlias.destroy();
    this.replaceTypeWithAlias = null;
    this.inferTypes.destroy();
    this.inferTypes = null;
    this.scopeBar.destroy();
    this.scopeBar = null;
    this.hotReloader.destroy();
    this.hotReloader = null;
    this.elmMakeRunner.destroy();
    this.elmMakeRunner = null;
    tmp.setGracefulCleanup();
  },

  // For `autocomplete-plus`.
  provideAutocomplete() {
    const shouldGetSuggestions = () => {
      return this.actOnSelection && this.actOnSelection.shouldGetSuggestions();
    };
    const getInferenceAtCursorPosition = editor => {
      return (
        this.inferTypes && this.inferTypes.getInferenceAtCursorPosition(editor)
      );
    };
    const clearCursorInferenceFunction = () => {
      return this.inferTypes && this.inferTypes.clearCursorInference();
    };
    const setAutocompleteActiveFunction = (editor, isActive) => {
      return this.core && this.core.setAutocompleteActive(editor, isActive);
    };
    return require('./autocomplete-provider').provide(
      this.core.getIndexer(),
      shouldGetSuggestions,
      getInferenceAtCursorPosition,
      clearCursorInferenceFunction,
      setAutocompleteActiveFunction
    );
  },

  // For `hyperclick` / `atom-ide-ui`.
  provideHyperclick() {
    return require('./hyperclick-provider').provide(
      this.core.getIndexer(),
      this.storeJumpPointFunction
    );
  },

  provideGetTokenInfo() {
    return require('./token-info-provider').provide(this.core.getIndexer());
  },

  provideGoToDefinition() {
    return (position, token) => {
      this.goTo.goToDefinition(token, position);
    };
  },

  provideGetFunctionsMatchingType() {
    return require('./type-matching-provider').provide(this.core.getIndexer());
  },

  provideAddImport() {
    return (filePath, projectDirectory, moduleName, name) => {
      this.core
        .getIndexer()
        .addImport([filePath, projectDirectory, moduleName, name]);
    };
  },

  provideAddImportAs() {
    return moduleName => {
      this.addImport.addImportAsCommand(moduleName);
    };
  },

  provideLinter() {
    const self = this;
    let linter = {
      name: 'Elm',
      grammarScopes: ['source.elm'],
      scope: 'project',
      lintOnFly: false,
      lint(editor) {
        return self.elmMakeRunner.compile(editor);
      },
    };
    this.subscriptions.add(
      atom.config.observe('elmjutsu.runElmMake', mode => {
        const lintOnTheFly = mode === 'on the fly';
        linter.lintOnFly = lintOnTheFly;
      })
    );
    return linter;
  },

  provideCodeActions() {
    return {
      grammarScopes: ['source.elm'],
      getCodeActions: (editor, range, _diagnostics) => {
        return this.quickFix.getCodeActions(editor, range);
      },
    };
  },

  consumeStatusBar(statusBar) {
    if (!statusBar) {
      return;
    }
    this.inferTypes.setStatusBar(statusBar);
  },

  consumeDatatipService(datatipService) {
    const getInferenceAtPosition = (editor, position) => {
      return (
        this.inferTypes &&
        this.inferTypes.getInferenceAtPosition(editor, position)
      );
    };
    this.datatip.setDatatipService(datatipService, getInferenceAtPosition);
  },

  consumeSignatureHelp(signatureHelpRegistry) {
    return require('./signature-help').provide(
      signatureHelpRegistry,
      this.core.getIndexer()
    );
  },

  // Provided by `linter-elm-make`.
  consumeGetWorkDirectory(getWorkDirectoryFunction) {
    this.core.setGetWorkDirectoryFunction(getWorkDirectoryFunction);
    this.findAndRenameUsages.setGetWorkDirectoryFunction(
      getWorkDirectoryFunction
    );
  },
};
