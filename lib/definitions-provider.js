'use babel';

import {Range} from 'atom';
import helper from './helper';

export function provide(indexer) {
  console.log('provide');
  return {
    grammarScopes: ['source.elm'],
    getDefinition: (editor, position) => {
      console.log('getDefinition', editor, position); // // //
      const range = helper.getTokenRange(position, editor);
      const queryRange = [range];
      const definitions = [
        {
          path: editor.getPath(),
          position,
          range,
          // name,
          // projectRoot,
          language: 'Elm'
        }
      ];
      return new Promise((resolve) => {
        return resolve({
          queryRange,
          definitions
        });
      });
    }
  }
}
