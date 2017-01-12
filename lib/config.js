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
  showSidekick: {
    title: 'Show Sidekick',
    description: 'Show type hints and documentation in another panel.',
    type: 'boolean',
    default: false,
    order: 6
  },
  sidekickPosition: {
    title: 'Sidekick Position',
    type: 'string',
    default: 'bottom',
    enum: ['top', 'right', 'bottom', 'left'],
    order: 7
  },
  sidekickSize: {
    title: 'Sidekick Size (in pixels)',
    description: 'Automatically resizes to fit content if set to `0`.',
    type: 'integer',
    default: 0,
    minimum: 0,
    order: 8
  },
  cacheDirectory: {
    title: 'Cache Directory',
    description: 'Directory where the downloaded docs will saved.  If blank, a temporary directory will be used.  Take note that most operating systems delete temporary directories at bootup or at regular intervals.',
    type: 'string',
    default: '',
    order: 9
  },
  elmPackageExecPath: {
    title: 'Elm Package Path',
    description: 'Path to the `elm-package` executable.',
    type: 'string',
    default: 'elm-package',
    order: 10
  },
  elmReplExecPath: {
    title: 'Elm REPL Path',
    description: 'Path to the `elm-repl` executable.',
    type: 'string',
    default: 'elm-repl',
    order: 11
  },
  evalPreludePath: {
    title: 'Eval Prelude Path',
    description: 'Path to the prelude file for `Elmjutsu: Pipe Selections`.  This will also be used when invoking `Elmjutsu: Eval` in a non-Elm editor.  If blank, the default will be used (EvalPrelude.elm).',
    type: 'string',
    default: '',
    order: 12
  },
};
