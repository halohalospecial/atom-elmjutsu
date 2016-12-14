'use babel';

const CompositeDisposable = require('atom').CompositeDisposable;
const _ = require('underscore-plus');
import helper from './helper';

export function provide(indexer) {
  let usedEnterKeyToAutocomplete;
  let subscriptions = new CompositeDisposable();
  subscriptions.add(atom.commands.onWillDispatch((event) => {
    // Determine if <kbd>enter</kbd> was used to choose a suggestion.
    if (event.type === 'autocomplete-plus:confirm' && event.originalEvent &&
      event.target.getModel && helper.isElmEditor(event.target.getModel())) {
        usedEnterKeyToAutocomplete = (event.originalEvent.keyCode === 13);
    }
  }));
  return {
    selector: '.source.elm',
    disableForSelector: '.source.elm .string, .source.elm .comment',
    inclusionPriority: 1,
    excludeLowerPriority: false,
    getSuggestions({editor, bufferPosition}) {
      return new Promise(resolve => {
        if (!atom.config.get('elmjutsu.autocompleteEnabled')) {
          return resolve([]);
        }
        let prefix = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
        let match = prefix.match(/(?:^|\n)import\s([\w\S]*)$/);
        // e.g. `import ` (there's a space at the end)
        // e.g. `import Dict`
        if (match) {
          return getSuggestionsForImport(prefix, match[1], indexer, resolve);
        }
        match = prefix.match(/(?:^|\n)import\s([\w\.]+)\s$/);
        // e.g. `import Dict ` (there's a space at the end)
        if (match) {
          return resolve([{text: 'exposing (..)'}, {text: 'exposing ('}, {text: 'as '}]);
        }
        match = prefix.match(/(?:^|\n)import\s([\w\.]+)(?:\s+as\s+(\w+))?\s+exposing\s$/);
        // e.g. `import Dict exposing ` (there's a space at the end)
        if (match) {
          return resolve([{text: '(..)'}]);
        }
        return getHintsForPartial(helper.getToken(editor), indexer, resolve);
      });
    },
    onDidInsertSuggestion({editor, triggerPosition, suggestion}) {
      // HACK: If the typed text is equal to the chosen suggestion and <kbd>enter</kbd> was used, insert a newline.
      if (usedEnterKeyToAutocomplete &&
        suggestion.replacementPrefix === suggestion.text &&
        atom.config.get('autocomplete-plus.confirmCompletion') !== 'tab') {
        // `Keymap For Confirming A Suggestion` should be 'enter', 'tab and enter', or 'tab always, enter when suggestion explicitly selected'.
        editor.insertText('\n');
      }
    },
    dispose() {
      subscriptions.dispose();
      subscriptions = null;
    }
  };
}

function getSuggestionsForImport(prefix, partial, indexer, resolve) {
  const suggestionsForImportReceived = ([partial, suggestions]) => {
    indexer.ports.suggestionsForImportReceivedCmd.unsubscribe(suggestionsForImportReceived);
      return resolve(_.sortBy(suggestions, 'name').map((suggestion) => {
        return {
          text: 'import ' + suggestion.name,
          replacementPrefix: prefix,
          // TODO: Change below to `descriptionHTML` when `autocomplete-plus` adds that option.
          description: suggestion.comment,
          descriptionMoreURL: suggestion.sourcePath === '' ? null : suggestion.sourcePath
        };
      }));
  };
  indexer.ports.suggestionsForImportReceivedCmd.subscribe(suggestionsForImportReceived);
  indexer.ports.getSuggestionsForImportSub.send(partial);
}

function getHintsForPartial(partial, indexer, resolve) {
  const autocompleteMinChars = atom.config.get('elmjutsu.autocompleteMinChars');
  if (partial.length < autocompleteMinChars) {
    return resolve([]);
  }
  const hintsForPartialReceived = ([partial, hints]) => {
    indexer.ports.hintsForPartialReceivedCmd.unsubscribe(hintsForPartialReceived);
    const suggestions =
      hints
      .filter(({name}) => {
        return name.length >= autocompleteMinChars;
      })
      .map((hint) => {
        let suggestion = {
          replacementPrefix: partial,
          text: hint.name,
          leftLabel: hint.moduleName,
          rightLabelHTML: hint.tipe.replace(/^\*(.*)\*$/, '<i>$1</i>'),
          // TODO: Change below to `descriptionHTML` when `autocomplete-plus` adds that option.
          description: hint.comment,
          descriptionMoreURL: hint.sourcePath
        };
        if (atom.config.get('elmjutsu.autocompleteSnippetsEnabled')) {
          suggestion.snippet = hintToSnippet(hint);
          suggestion.displayText = hint.name;
        }
        return suggestion;
      });
    return resolve(suggestions);
  };
  indexer.ports.hintsForPartialReceivedCmd.subscribe(hintsForPartialReceived);
  indexer.ports.getHintsForPartialSub.send(partial);
}

function hintToSnippet(hint) {
  if ((!hint.args || hint.args.length === 0) && !hint.tipe.startsWith('*')) {
    const parts = helper.getTipeParts(hint.tipe);
    const tabStops = parts.slice(0,parts.length-1).map((part, i) => {
      // Replace closing brace with \}.
      return '${' + (i + 1) + ':' + part.replace(/}/g, '\\}') + '}';
    }).join(' ');
    return hint.name + (tabStops.trim() === '' ? '' : ' ' + tabStops);
  }
  const args = hint.args ? hint.args : hint.tipe.startsWith('*') ? hint.tipe.replace(/^\*|\*$/g, '').split(' ') : [];
  return hint.name + args.reduce((acc, arg, i) => {
    return acc + ' ${' + (i + 1) + ':' + arg + '}';
  }, '');
}
