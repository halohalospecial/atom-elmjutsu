'use babel';

export default {
  autocompleteEnabled: {
    title: 'Enable Autocomplete',
    type: 'boolean',
    default: false,
    order: 1
  },
  globalAutocompleteEnabled: {
    title: 'Enable Global Autocomplete',
    description: 'Whether to include unimported project symbols.',
    type: 'boolean',
    default: false,
    order: 2
  },
  autocompleteMinChars: {
    title: 'Autocomplete Min Chars',
    description: 'Minimum number of characters to type before showing suggestions.',
    type: 'integer',
    default: 1,
    order: 3
  },
  autocompleteSnippetsEnabled: {
    title: 'Enable Autocomplete Snippets',
    type: 'boolean',
    default: false,
    order: 4
  },
  hyperclickEnabled: {
    title: 'Enable Hyperclick',
    type: 'boolean',
    default: false,
    order: 5
  },
  showTypesInTooltip: {
    title: 'Show Types in Tooltip',
    type: 'boolean',
    default: false,
    order: 6
  },
  showSidekick: {
    title: 'Show Sidekick',
    description: 'Show types and documentation in another panel.',
    type: 'boolean',
    default: false,
    order: 7
  },
  sidekickPosition: {
    title: 'Sidekick Position',
    type: 'string',
    default: 'bottom',
    enum: ['top', 'right', 'bottom', 'left'],
    order: 8
  },
  sidekickSize: {
    title: 'Sidekick Size (in pixels)',
    description: 'Automatically resizes to fit content if set to `0`.',
    type: 'integer',
    default: 0,
    minimum: 0,
    order: 9
  },
  showTypesInSidekick: {
    title: 'Show Types in Sidekick',
    type: 'boolean',
    default: true,
    order: 10
  },
  showTypeCasesInSidekick: {
    title: 'Show Tags of Union Types in Sidekick',
    type: 'boolean',
    default: true,
    order: 11
  },
  showDocCommentsInSidekick: {
    title: 'Show Doc Comments in Sidekick',
    type: 'boolean',
    default: true,
    order: 12
  },
  showAssociativitiesInSidekick: {
    title: 'Show Associativities in Sidekick',
    type: 'boolean',
    default: true,
    order: 13
  },
  showPrecedencesInSidekick: {
    title: 'Show Precedences in Sidekick',
    type: 'boolean',
    default: true,
    order: 14
  },
  showSourcePathsInSidekick: {
    title: 'Show Source Paths in Sidekick',
    type: 'boolean',
    default: true,
    order: 15
  },
  cacheDirectory: {
    title: 'Cache Directory',
    description: 'Directory where the downloaded docs will saved.  If blank, a temporary directory will be used.  Take note that most operating systems delete temporary directories at bootup or at regular intervals.',
    type: 'string',
    default: '',
    order: 16
  },
  elmPackageExecPath: {
    title: 'Elm Package Path',
    description: 'Path to the `elm-package` executable.',
    type: 'string',
    default: 'elm-package',
    order: 17
  },
  elmReplExecPath: {
    title: 'Elm REPL Path',
    description: 'Path to the `elm-repl` executable.',
    type: 'string',
    default: 'elm-repl',
    order: 18
  },
  evalPreludePath: {
    title: 'Eval Prelude Path',
    // description: 'Path to the prelude file for `Elmjutsu: Pipe Selections`.  This will also be used when invoking `Elmjutsu: Eval` in a non-Elm editor.  If blank, the default will be used (EvalPrelude.elm).',
    description: 'Path to the prelude file for `Elmjutsu: Pipe Selections`.  If blank, the default will be used (EvalPrelude.elm).',
    type: 'string',
    default: '',
    order: 19
  },
};
