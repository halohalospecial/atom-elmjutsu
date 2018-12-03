'use babel';

import which from 'which';

export default {
  // Compilation

  runElmMake: {
    title: 'Run `elm make` on the active file',
    description:
      'Note: If you are using Elm 0.18, set this to "never" and use https://atom.io/packages/linter-elm-make instead :)',
    type: 'string',
    // enum: ['on save', 'on the fly', 'never'],
    enum: ['on save', 'never'],
    default: 'on save',
    order: 1,
  },
  alwaysCompileMain: {
    title: 'Always Compile Main',
    description:
      'Always compile the main file(s) instead of the active file.  The main files can be set using the `Elmjutsu: Set Main Paths` command.  If not set, the linter will look for `Main.elm` files in the source directories.  Modules unreachable from the main modules will not be linted.  Main paths will be ignored if the project type is `"package"` (in `elm.json`).',
    type: 'boolean',
    default: false,
    order: 2,
  },
  reportWarnings: {
    title: 'Report Warnings',
    description: 'Also report warnings instead of just the errors.',
    type: 'boolean',
    default: false, // TODO: Change default to true when compiler warnings are available again.
    order: 3,
  },
  showInferredTypeAnnotations: {
    title: 'Show Inferred Type Annotations',
    description:
      'Note: This will only work if `Report Warnings` is also checked.',
    type: 'boolean',
    default: true,
    order: 4,
  },
  compileWithDebugger: {
    title: 'Compile With Debugger',
    description:
      'Adds the `--debug` flag to `elm make`.  Enabling this will automatically disable `Compile With Optimizations`.',
    type: 'boolean',
    default: false,
    order: 5,
  },
  compileWithOptimizations: {
    title: 'Compile With Optimizations',
    description:
      'Adds the `--optimize` flag to `elm make`.  Enabling this will automatically disable `Compile With Debugger`.',
    type: 'boolean',
    default: false,
    order: 6,
  },

  // Diagnostics

  codeActionsEnabled: {
    title: 'Enable Code Actions',
    description: 'Show quick fixes as code actions (for `atom-ide-ui`).',
    type: 'boolean',
    default: true,
    order: 7,
  },
  enhancedElmMakeMessages: {
    title: 'Enhanced Elm Make Messages',
    description:
      'Apply additional styling to Elm Make messages and removes code snippets to save space.',
    type: 'boolean',
    default: true,
    order: 8,
  },

  // Autocompletion

  autocompleteEnabled: {
    title: 'Enable Autocomplete',
    type: 'boolean',
    default: true,
    order: 9,
  },
  globalAutocompleteEnabled: {
    title: 'Enable Global Autocomplete',
    description: 'Whether to include unimported project symbols.',
    type: 'boolean',
    default: false,
    order: 10,
  },
  typeAwareAutocompleteEnabled: {
    title: 'Enable Type-Aware Autocomplete',
    description:
      'WARNING: This is highly experimental and may cause lag, especially if `Enable Global Autocomplete` is also checked.',
    type: 'boolean',
    default: false,
    order: 11,
  },
  autocompleteSnippetsEnabled: {
    title: 'Enable Autocomplete Snippets',
    type: 'boolean',
    default: false,
    order: 12,
  },
  autocompleteFuzzyFilteringEnabled: {
    title: 'Enable Autocomplete Fuzzy Filtering',
    type: 'boolean',
    default: false,
    order: 13,
  },
  autocompleteMaxSuggestions: {
    title: 'Max Number of Autocomplete Suggestions',
    description:
      'No limit if set to `0` (default).  Set this to a small number (e.g. `50`) if you are experiencing lag so that Atom will have less items to render.',
    type: 'integer',
    default: 0,
    order: 14,
  },
  autocompleteDescriptionDisplay: {
    title: 'Autocomplete Description Display',
    type: 'string',
    enum: ['markdown', 'text', 'none'],
    default: 'markdown',
    order: 15,
  },

  // Special completions

  autoImportCompletionEnabled: {
    title: 'Enable `Auto import` special completion',
    type: 'boolean',
    default: true,
    order: 16,
  },
  replaceWithInferredTypeCompletionEnabled: {
    title: 'Enable `Replace with inferred type` special completion',
    type: 'boolean',
    default: true,
    order: 17,
  },
  insertProgramCompletionEnabled: {
    title: 'Enable `Insert program` special completion',
    description:
      'This will activate by typing `html`, `Html.program`, `platform`, or `Platform.program` in an empty editor.',
    type: 'boolean',
    default: true,
    order: 18,
  },
  insertModuleCompletionEnabled: {
    title: 'Enable `Insert module` special completion',
    type: 'boolean',
    default: true,
    order: 19,
  },
  insertLetInCompletionEnabled: {
    title: 'Enable `Insert let/in` special completion',
    type: 'boolean',
    default: true,
    order: 20,
  },
  insertIfThenElseCompletionEnabled: {
    title: 'Enable `Insert if/then/else` special completion',
    type: 'boolean',
    default: true,
    order: 21,
  },
  insertCaseOfCompletionEnabled: {
    title: 'Enable `Insert case/of` special completion',
    type: 'boolean',
    default: true,
    order: 22,
  },
  insertDefaultArgumentsCompletionEnabled: {
    title: 'Enable `Insert default arguments` special completion',
    type: 'boolean',
    default: true,
    order: 23,
  },
  replaceTypeWithDefaultCompletionEnabled: {
    title: 'Enable `Replace type with default` special completion',
    type: 'boolean',
    default: true,
    order: 24,
  },
  defineFromTypeAnnotationCompletionEnabled: {
    title: 'Enable `Define from type annotation` special completion',
    type: 'boolean',
    default: true,
    order: 25,
  },
  // replaceTypeWithAliasCompletionEnabled: {
  //   title: 'Enable `Replace type with alias` special completion',
  //   type: 'boolean',
  //   default: true,
  //   order: 26
  // },

  recordFieldsCompletionEnabled: {
    title: 'Enable completion of record fields',
    type: 'boolean',
    default: true,
    order: 27,
  },

  autocompleteMinChars: {
    title: 'Autocomplete Min Chars',
    description:
      'Minimum number of characters to type before showing suggestions.',
    type: 'integer',
    default: 1,
    order: 28,
  },

  // Atom IDE integration

  hyperclickEnabled: {
    title: 'Enable Hyperclick',
    type: 'boolean',
    default: true,
    order: 29,
  },
  datatipsEnabled: {
    title: 'Enable Datatips',
    type: 'boolean',
    default: true,
    order: 30,
  },
  signatureHelpEnabled: {
    title: 'Enable Signature Help',
    type: 'boolean',
    default: true,
    order: 31,
  },

  // Tooltip

  showTypesInTooltip: {
    title: 'Show Types in Tooltip',
    type: 'boolean',
    default: false,
    order: 32,
  },
  // showAliasesOfTypesInTooltip: {
  //   title: 'Show Aliases of Types in Tooltip',
  //   type: 'boolean',
  //   default: false,
  //   order: 33
  // },
  typesTooltipPosition: {
    title: 'Types Tooltip Position',
    type: 'string',
    enum: ['top', 'right', 'bottom', 'left'],
    default: 'top',
    order: 34,
  },

  // Sidekick

  showSidekick: {
    title: 'Show Sidekick',
    description: 'Show types and documentation in another panel.',
    type: 'boolean',
    default: false,
    order: 35,
  },
  showTypesInSidekick: {
    title: 'Show Types in Sidekick and Datatips',
    type: 'boolean',
    default: true,
    order: 36,
  },
  showTypeCasesInSidekick: {
    title: 'Show Tags of Union Types in Sidekick and Datatips',
    type: 'boolean',
    default: true,
    order: 37,
  },
  showDocCommentsInSidekick: {
    title: 'Show Doc Comments in Sidekick and Datatips',
    type: 'boolean',
    default: true,
    order: 38,
  },
  showAssociativitiesInSidekick: {
    title: 'Show Associativities in Sidekick and Datatips',
    type: 'boolean',
    default: true,
    order: 39,
  },
  showPrecedencesInSidekick: {
    title: 'Show Precedences in Sidekick and Datatips',
    type: 'boolean',
    default: true,
    order: 40,
  },
  // showAliasesOfTypesInSidekick: {
  //   title: 'Show Aliases of Types in Sidekick',
  //   type: 'boolean',
  //   default: false,
  //   order: 41
  // },
  showSourcePathsInSidekick: {
    title: 'Show Source Paths in Sidekick and Datatips',
    type: 'boolean',
    default: true,
    order: 42,
  },
  sidekickPosition: {
    title: 'Sidekick Position',
    type: 'string',
    enum: ['top', 'right', 'bottom', 'left'],
    default: 'bottom',
    order: 43,
  },
  sidekickSize: {
    title: 'Sidekick Size (in pixels)',
    description: 'Automatically resizes to fit content if set to `0`.',
    type: 'integer',
    default: 0,
    minimum: 0,
    order: 44,
  },

  // Infer

  inferExpectedTypeAtCursorOnTheFly: {
    title: 'Infer Expected Type At Cursor On The Fly',
    type: 'boolean',
    default: false,
    order: 45,
  },
  inferTypeOfSelectionOnTheFly: {
    title: 'Infer Type Of Selection On The Fly',
    type: 'boolean',
    default: false,
    order: 46,
  },
  // inferHoleTypesOnTheFly: {
  //   title: 'Infer Hole Types On The Fly',
  //   type: 'boolean',
  //   default: false,
  //   order: 47
  // },

  showScopeBar: {
    title: 'Show Scope Bar',
    type: 'boolean',
    default: false,
    order: 48,
  },

  elmExecPath: {
    title: 'Elm Path',
    description:
      'Path to the `elm` executable.  This can be an absolute path or relative to the directory of `elm.json`.',
    type: 'string',
    default: which.sync('elm', { nothrow: true }) || '',
    order: 49,
  },
  elmTestExecPath: {
    title: 'Elm Test Path',
    description:
      'Path to the `elm-test` executable.  This will used to check for errors in test files.  This can be an absolute path or relative to the directory of `elm.json`.',
    type: 'string',
    default: which.sync('elm-test', { nothrow: true }) || '',
    order: 50,
  },

  // For Elm version <= 0.18

  elmMakeExecPath: {
    title: 'Elm Make Path (for Elm version <= 0.18.0)',
    description: 'Path to the `elm-make` executable.',
    type: 'string',
    default: which.sync('elm-make', { nothrow: true }) || '',
    order: 51,
  },
  elmPackageExecPath: {
    title: 'Elm Package Path (for Elm version <= 0.18.0)',
    description: 'Path to the `elm-package` executable.',
    type: 'string',
    default: which.sync('elm-package', { nothrow: true }) || '',
    order: 52,
  },
  elmReplExecPath: {
    title: 'Elm REPL Path (for Elm version <= 0.18.0)',
    description: 'Path to the `elm-repl` executable.',
    type: 'string',
    default: which.sync('elm-repl', { nothrow: true }) || '',
    order: 53,
  },

  hotReloadingEnabled: {
    title: 'Enable Hot Reloading',
    type: 'boolean',
    default: false,
    order: 54,
  },
  hotReloadingHost: {
    title: 'Hot Reloading Host',
    type: 'string',
    default: 'localhost',
    order: 55,
  },
  hotReloadingPort: {
    title: 'Hot Reloading Port',
    type: 'integer',
    default: 0,
    order: 56,
  },

  cacheDirectory: {
    title: 'Cache Directory (for Elm version <= 0.18.0)',
    description:
      'Directory where the downloaded docs will saved.  If blank, a temporary directory will be used.  Take note that most operating systems delete temporary directories at bootup or at regular intervals.',
    type: 'string',
    default: '',
    order: 57,
  },

  evalPreludePath: {
    title: 'Eval Prelude Path',
    // description: 'Path to the prelude file for `Elmjutsu: Pipe Selections`.  This will also be used when invoking `Elmjutsu: Eval` in a non-Elm editor.  If blank, the default will be used (EvalPrelude.elm).',
    description:
      'Path to the prelude file for `Elmjutsu: Pipe Selections`.  If blank, the default will be used (EvalPrelude.elm).',
    type: 'string',
    default: '',
    order: 58,
  },

  logDebugMessages: {
    title: 'Log Debug Messages',
    description: 'Show debug messages using `console.log`.',
    type: 'boolean',
    default: false,
    order: 59,
  },
};
