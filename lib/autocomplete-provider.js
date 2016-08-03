'use babel';

const _ = require('underscore-plus');
import helper from './helper';

export function provide(indexer) {
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
        var prefix = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
        var match = prefix.match(/(?:^|\n)import\s([\w\.]*)$/);
        if (match) {
          return getSuggestionsForImport(prefix, match[1], indexer, resolve);
        }
        return getHintsForPartial(helper.getToken(editor), indexer, resolve);
      });
    }
  };
}

function getSuggestionsForImport(prefix, partial, indexer, resolve) {
  const suggestionsForImportReceived = ([partial, suggestions]) => {
    indexer.ports.suggestionsForImportReceivedCmd.unsubscribe(suggestionsForImportReceived);
      return resolve(suggestions.map((suggestion) => {
        return {
          text: 'import ' + suggestion.name,
          replacementPrefix: prefix,
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
  // const excludeFromSuggestions = ['=='];
  const hintsForPartialReceived = ([partial, hints]) => {
    indexer.ports.hintsForPartialReceivedCmd.unsubscribe(hintsForPartialReceived);
    const suggestions =
      hints
      .filter(({name}) => {
        return name.length > autocompleteMinChars; // && !_.contains(excludeFromSuggestions, name);
      })
      .map((hint) => {
        return {
          text: hint.name,
          // snippet: hintToSnippet(hint),
          // displayText: '',
          replacementPrefix: partial,
          // type: 'function',
          leftLabel: hint.moduleName,
          // leftLabelHTML: '',
          rightLabel: hint.tipe,
          // rightLabelHTML: '',
          // className: '',
          // iconHTML: '',
          description: hint.comment,
          // descriptionMoreURL: ''
        };
      });
    return resolve(suggestions);
  };
  indexer.ports.hintsForPartialReceivedCmd.subscribe(hintsForPartialReceived);
  indexer.ports.getHintsForPartialSub.send(partial);
}
