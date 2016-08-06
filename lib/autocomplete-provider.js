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
        var match = prefix.match(/(?:^|\n)import\s([\w\S]*)$/);
        // e.g. `import `
        // e.g. `import Html`
        if (match) {
          return getSuggestionsForImport(prefix, match[1], indexer, resolve);
        }
        match = prefix.match(/(?:^|\n)import\s([\w\.]*)\s$/);
        // e.g. `import Html `
        if (match) {
          return resolve([{text: 'exposing (..)'}, {text: 'exposing ('}, {text: 'as '}]);
        }
        match = prefix.match(/(?:^|\n)import\s([\w\.]*)\sexposing\s$/);
        // e.g. `import Html exposing `
        if (match) {
          return resolve([{text: '(..)'}]);
        }
        return getHintsForPartial(helper.getToken(editor), indexer, resolve);
      });
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
          // TODO: Change below to `descriptionHTML` when `autocomplete-plus` includes that option.
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
        return name.length > autocompleteMinChars;
      })
      .map((hint) => {
        let suggestion = {
          replacementPrefix: partial,
          leftLabel: hint.moduleName,
          rightLabelHTML: hint.tipe.replace(/^\*(.*)\*$/, '<i>$1</i>'),
          // TODO: Change below to `descriptionHTML` when `autocomplete-plus` includes that option.
          description: hint.comment,
          descriptionMoreURL: hint.sourcePath
        };
        if (atom.config.get('elmjutsu.autocompleteSnippetsEnabled')) {
          suggestion.snippet = hintToSnippet(hint);
          suggestion.displayText = hint.name;
        } else {
          suggestion.text = hint.name;
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
    const tabStops = parseTabStops(hint.tipe);
    return hint.name + (tabStops.trim() === '' ? '' : ' ' + tabStops);
  }
  const args = hint.args ? hint.args : hint.tipe.startsWith('*') ? hint.tipe.replace(/^\*|\*$/g, '').split(' ') : [];
  return hint.name + args.reduce((acc, arg, i) => {
    return acc + ' ${' + (i+1) + ':' + arg + '}';
  }, '');
}

// From https://github.com/edubkendo/atom-elm.
function parseTabStops(signature) {
  return signature.split(')')
    .filter((suggestion) => suggestion.trim().length)
    .reduce((acc, part) => {
      if ((/\(/g).test(part)) {
        acc.tabStops.push('${' + (++acc.position) + ':(' + part.replace(/\(|^(\ ?->)\ /g, '') + ')}');
      } else {
        part
          .split('->')
          .filter((part) => part.trim().length)
          .slice(0, -1)
          .forEach((part) => {
            acc.tabStops.push('${' + (++acc.position) + ':' + part.trim() + '}');
          });
      }
      return acc;
    }, { tabStops: [], position: 0 }).tabStops.join(' ');
}
