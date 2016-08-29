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
  sidekickSize: {
    title: 'Sidekick Size (in pixels)',
    description: 'Automatically resizes to fit content if set to `0`.',
    type: 'integer',
    default: 0,
    minimum: 0,
    order: 6
  },
  sidekickPosition: {
    title: 'Sidekick Position',
    type: 'string',
    default: 'bottom',
    enum: ['top', 'right', 'bottom', 'left'],
    order: 7
  },
  // elmReplExecPath: {
  //   title: 'Path to the `elm-repl` executable.',
  //   type: 'string',
  //   default: 'elm-repl',
  //   order: 8
  // },
  cacheDirectory: {
    title: 'Cache Directory',
    description: 'Where to save the downloaded docs.  If blank, a temporary directory will be used.',
    type: 'string',
    default: '',
    order: 9
  }
};
