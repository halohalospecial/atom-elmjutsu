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
        const partial = helper.getToken(editor);
        const autocompleteMinChars = atom.config.get('elmjutsu.autocompleteMinChars');
        if (partial.length < autocompleteMinChars) {
          return resolve([]);
        }
        // const excludeFromSuggestions = ['=='];
        const onHintsForPartial = ([partial, hints]) => {
          // const partial = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
          indexer.ports.gotHintsForPartialCmd.unsubscribe(onHintsForPartial);
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
        indexer.ports.gotHintsForPartialCmd.subscribe(onHintsForPartial);
        indexer.ports.getHintsForPartialSub.send(partial);
      });
    }
  };
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
