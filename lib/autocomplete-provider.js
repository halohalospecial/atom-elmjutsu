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
                // snippet: 'div ${1:List (Html.Html msg)} ${2:Html.Html msg}',
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
