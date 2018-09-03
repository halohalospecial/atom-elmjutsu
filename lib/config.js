'use babel';

export default {
  runElmMake: {
    title: 'Run `elm make` on the active file.',
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
      'Always compile the main file(s) instead of the active file.  The main files can be set using the `Elmjutsu: Set Main Paths` command.  If not set, the linter will look for `Main.elm` files in the source directories.  Modules unreachable from the main modules will not be linted.',
    type: 'boolean',
    default: false,
    order: 2,
  },
  codeActionsEnabled: {
    title: 'Enable Code Actions',
    description: 'Show quick fixes as code actions (for `atom-ide-ui`).',
    type: 'boolean',
    default: true,
    order: 3,
  },
  enhancedElmMakeMessages: {
    title: 'Enhanced Elm Make Messages',
    description:
      'Apply additional styling to Elm Make messages and removes code snippets to save space.',
    type: 'boolean',
    default: true,
    order: 4,
  },

  autocompleteEnabled: {
    title: 'Enable Autocomplete',
    type: 'boolean',
    default: true,
    order: 5,
  },
  globalAutocompleteEnabled: {
    title: 'Enable Global Autocomplete',
    description: 'Whether to include unimported project symbols.',
    type: 'boolean',
    default: false,
    order: 6,
  },
  typeAwareAutocompleteEnabled: {
    title: 'Enable Type-Aware Autocomplete',
    description:
      'WARNING: This is highly experimental and may cause lag, especially if `Enable Global Autocomplete` is also checked.',
    type: 'boolean',
    default: false,
    order: 7,
  },
  autocompleteSnippetsEnabled: {
    title: 'Enable Autocomplete Snippets',
    type: 'boolean',
    default: false,
    order: 8,
  },
  autocompleteFuzzyFilteringEnabled: {
    title: 'Enable Autocomplete Fuzzy Filtering',
    type: 'boolean',
    default: false,
    order: 9,
  },
  autocompleteMaxSuggestions: {
    title: 'Max Number of Autocomplete Suggestions',
    description:
      'No limit if set to `0` (default).  Set this to a small number (e.g. `50`) if you are experiencing lag so that Atom will have less items to render.',
    type: 'integer',
    default: 0,
    order: 10,
  },
  autocompleteDescriptionDisplay: {
    title: 'Autocomplete Description Display',
    type: 'string',
    enum: ['markdown', 'text', 'none'],
    default: 'markdown',
    order: 11,
  },

  // Special completions:
  autoImportCompletionEnabled: {
    title: 'Enable `Auto import` special completion',
    type: 'boolean',
    default: true,
    order: 12,
  },
  replaceWithInferredTypeCompletionEnabled: {
    title: 'Enable `Replace with inferred type` special completion',
    type: 'boolean',
    default: true,
    order: 13,
  },
  insertProgramCompletionEnabled: {
    title: 'Enable `Insert program` special completion',
    description:
      'This will activate by typing `html`, `Html.program`, `platform`, or `Platform.program` in an empty editor.',
    type: 'boolean',
    default: true,
    order: 14,
  },
  insertModuleCompletionEnabled: {
    title: 'Enable `Insert module` special completion',
    type: 'boolean',
    default: true,
    order: 15,
  },
  insertLetInCompletionEnabled: {
    title: 'Enable `Insert let/in` special completion',
    type: 'boolean',
    default: true,
    order: 16,
  },
  insertIfThenElseCompletionEnabled: {
    title: 'Enable `Insert if/then/else` special completion',
    type: 'boolean',
    default: true,
    order: 17,
  },
  insertCaseOfCompletionEnabled: {
    title: 'Enable `Insert case/of` special completion',
    type: 'boolean',
    default: true,
    order: 18,
  },
  insertDefaultArgumentsCompletionEnabled: {
    title: 'Enable `Insert default arguments` special completion',
    type: 'boolean',
    default: true,
    order: 19,
  },
  replaceTypeWithDefaultCompletionEnabled: {
    title: 'Enable `Replace type with default` special completion',
    type: 'boolean',
    default: true,
    order: 20,
  },
  defineFromTypeAnnotationCompletionEnabled: {
    title: 'Enable `Define from type annotation` special completion',
    type: 'boolean',
    default: true,
    order: 21,
  },
  // replaceTypeWithAliasCompletionEnabled: {
  //   title: 'Enable `Replace type with alias` special completion',
  //   type: 'boolean',
  //   default: true,
  //   order: 22
  // },

  recordFieldsCompletionEnabled: {
    title: 'Enable completion of record fields',
    type: 'boolean',
    default: true,
    order: 23,
  },

  autocompleteMinChars: {
    title: 'Autocomplete Min Chars',
    description:
      'Minimum number of characters to type before showing suggestions.',
    type: 'integer',
    default: 1,
    order: 24,
  },

  hyperclickEnabled: {
    title: 'Enable Hyperclick',
    type: 'boolean',
    default: true,
    order: 25,
  },

  datatipsEnabled: {
    title: 'Enable Datatips',
    type: 'boolean',
    default: true,
    order: 26,
  },

  signatureHelpEnabled: {
    title: 'Enable Signature Help',
    type: 'boolean',
    default: true,
    order: 27,
  },

  showTypesInTooltip: {
    title: 'Show Types in Tooltip',
    type: 'boolean',
    default: false,
    order: 28,
  },
  // showAliasesOfTypesInTooltip: {
  //   title: 'Show Aliases of Types in Tooltip',
  //   type: 'boolean',
  //   default: false,
  //   order: 29
  // },
  typesTooltipPosition: {
    title: 'Types Tooltip Position',
    type: 'string',
    enum: ['top', 'right', 'bottom', 'left'],
    default: 'top',
    order: 30,
  },

  showSidekick: {
    title: 'Show Sidekick',
    description: 'Show types and documentation in another panel.',
    type: 'boolean',
    default: false,
    order: 31,
  },
  showTypesInSidekick: {
    title: 'Show Types in Sidekick and Datatips',
    type: 'boolean',
    default: true,
    order: 32,
  },
  showTypeCasesInSidekick: {
    title: 'Show Tags of Union Types in Sidekick and Datatips',
    type: 'boolean',
    default: true,
    order: 33,
  },
  showDocCommentsInSidekick: {
    title: 'Show Doc Comments in Sidekick and Datatips',
    type: 'boolean',
    default: true,
    order: 34,
  },
  showAssociativitiesInSidekick: {
    title: 'Show Associativities in Sidekick and Datatips',
    type: 'boolean',
    default: true,
    order: 35,
  },
  showPrecedencesInSidekick: {
    title: 'Show Precedences in Sidekick and Datatips',
    type: 'boolean',
    default: true,
    order: 36,
  },
  // showAliasesOfTypesInSidekick: {
  //   title: 'Show Aliases of Types in Sidekick',
  //   type: 'boolean',
  //   default: false,
  //   order: 37
  // },
  showSourcePathsInSidekick: {
    title: 'Show Source Paths in Sidekick and Datatips',
    type: 'boolean',
    default: true,
    order: 38,
  },
  sidekickPosition: {
    title: 'Sidekick Position',
    type: 'string',
    enum: ['top', 'right', 'bottom', 'left'],
    default: 'bottom',
    order: 39,
  },
  sidekickSize: {
    title: 'Sidekick Size (in pixels)',
    description: 'Automatically resizes to fit content if set to `0`.',
    type: 'integer',
    default: 0,
    minimum: 0,
    order: 40,
  },

  inferExpectedTypeAtCursorOnTheFly: {
    title: 'Infer Expected Type At Cursor On The Fly',
    type: 'boolean',
    default: false,
    order: 41,
  },
  inferTypeOfSelectionOnTheFly: {
    title: 'Infer Type Of Selection On The Fly',
    type: 'boolean',
    default: false,
    order: 42,
  },
  // inferHoleTypesOnTheFly: {
  //   title: 'Infer Hole Types On The Fly',
  //   type: 'boolean',
  //   default: false,
  //   order: 43
  // },

  showScopeBar: {
    title: 'Show Scope Bar',
    type: 'boolean',
    default: false,
    order: 44,
  },

  cacheDirectory: {
    title: 'Cache Directory (for Elm version <= 0.18.0)',
    description:
      'Directory where the downloaded docs will saved.  If blank, a temporary directory will be used.  Take note that most operating systems delete temporary directories at bootup or at regular intervals.',
    type: 'string',
    default: '',
    order: 45,
  },

  elmExecPath: {
    title: 'Elm Path',
    description: 'Path to the `elm` executable.',
    type: 'string',
    default: 'elm',
    order: 46,
  },

  elmMakeExecPath: {
    title: 'Elm Make Path (for Elm version <= 0.18.0)',
    description: 'Path to the `elm-make` executable.',
    type: 'string',
    default: 'elm-make',
    order: 47,
  },
  elmPackageExecPath: {
    title: 'Elm Package Path (for Elm version <= 0.18.0)',
    description: 'Path to the `elm-package` executable.',
    type: 'string',
    default: 'elm-package',
    order: 48,
  },
  elmReplExecPath: {
    title: 'Elm REPL Path (for Elm version <= 0.18.0)',
    description: 'Path to the `elm-repl` executable.',
    type: 'string',
    default: 'elm-repl',
    order: 49,
  },
  evalPreludePath: {
    title: 'Eval Prelude Path',
    // description: 'Path to the prelude file for `Elmjutsu: Pipe Selections`.  This will also be used when invoking `Elmjutsu: Eval` in a non-Elm editor.  If blank, the default will be used (EvalPrelude.elm).',
    description:
      'Path to the prelude file for `Elmjutsu: Pipe Selections`.  If blank, the default will be used (EvalPrelude.elm).',
    type: 'string',
    default: '',
    order: 50,
  },
  logDebugMessages: {
    title: 'Log Debug Messages',
    description: 'Show debug messages using `console.log`.',
    type: 'boolean',
    default: false,
    order: 51,
  },
};
