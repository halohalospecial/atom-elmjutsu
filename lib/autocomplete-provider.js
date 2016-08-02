'use babel';

import helper from './helper';

export function provide(indexer) {
  return {
    selector: '.source.elm',
    disableForSelector: '.source.elm .string, .source.elm .comment',
    inclusionPriority: 1,
    excludeLowerPriority: false,

    getSuggestions({editor, bufferPosition}) {
      return new Promise(resolve => {
        const onHintsForPartial = ([partial, hints]) => {
          indexer.ports.gotHintsForPartialCmd.unsubscribe(onHintsForPartial);
          const suggestions = hints.map((hint) => {
            return {
              text: hint.name,
              // snippet: 'div ${1:List (Html.Html msg)} ${2:Html.Html msg}',
              // displayText: '',
              replacementPrefix: partial,
              // type: 'function',
              // leftLabel: '',
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
        // const partial = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
        const partial = helper.getToken(editor);
        indexer.ports.getHintsForPartialSub.send(partial);
      });
    }
  };
}
