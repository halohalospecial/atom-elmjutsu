'use babel';

export default {
  autocompleteEnabled: {
    title: 'Enable Autocomplete',
    type: 'boolean',
    default: false,
    order: 1
  },
  autocompleteMinChars: {
    title: 'Autocomplete Min Chars',
    description: 'Minimum number of characters to type before showing suggestions.',
    type: 'integer',
    default: 1,
    order: 2
  },
  autocompleteSnippetsEnabled: {
    title: 'Enable Autocomplete Snippets',
    type: 'boolean',
    default: false,
    order: 3
  },
  hyperclickEnabled: {
    title: 'Enable Hyperclick',
    type: 'boolean',
    default: false,
    order: 4
  },
  showSidekick: {
    title: 'Show Sidekick',
    description: 'Show type hints and documentation in another panel.',
    type: 'boolean',
    default: false,
    order: 5
  },
  sidekickPosition: {
    title: 'Sidekick Position',
    type: 'string',
    default: 'bottom',
    enum: ['top', 'right', 'bottom', 'left'],
    order: 6
  },
  sidekickSize: {
    title: 'Sidekick Size (in pixels)',
    description: 'Automatically resizes to fit content if set to `0`.',
    type: 'integer',
    default: 0,
    minimum: 0,
    order: 7
  },
  cacheDirectory: {
    title: 'Cache Directory',
    description: 'Directory where the downloaded docs will saved.  If blank, a temporary directory will be used.  Take note that most operating systems delete temporary directories at bootup or at regular intervals.',
    type: 'string',
    default: '',
    order: 8
  },
  elmPackageExecPath: {
    title: 'Elm Package Path',
    description: 'Path to the `elm-package` executable.',
    type: 'string',
    default: 'elm-package',
    order: 9
  },
  elmReplExecPath: {
    title: 'Elm REPL Path',
    description: 'Path to the `elm-repl` executable.',
    type: 'string',
    default: 'elm-repl',
    order: 10
  },
  evalPreludePath: {
    title: 'Eval Prelude Path',
    description: 'Path to the prelude file for `Pipe Selections`.  This will also be used when using `Eval` on a non-Elm editor.  If blank, the default will be used.',
    type: 'string',
    default: '',
    order: 11
  },
};
