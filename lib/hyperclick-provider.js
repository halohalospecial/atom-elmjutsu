'use babel';

import {Range} from 'atom';
import helper from './helper';

export function provide(indexer, storeJumpPointFunction) {
  return {
    providerName: 'elmjutsu-hyperclick',
    getSuggestion(editor, position) {
      if (atom.config.get('elmjutsu.hyperclickEnabled') && helper.isElmEditor(editor)) {
        return new Promise((resolve) => {
          const cursorPosition = editor.getCursorBufferPosition();
          const scopeDescriptor = editor.scopeDescriptorForBufferPosition(position);
          if (!helper.isScopeAString(scopeDescriptor) && !helper.isScopeAComment(scopeDescriptor)) {
            const range = helper.getTokenRange(position, editor);
            if (!range) {
              return resolve();
            }
            const token = editor.getTextInBufferRange(range);
            const canGoToDefinitionReplied = ([token, yes]) => {
              indexer.ports.canGoToDefinitionRepliedCmd.unsubscribe(canGoToDefinitionReplied);
              if (yes) {
                return resolve({
                  range,
                  callback() {
                    if (!position.isEqual(cursorPosition)) {
                      storeJumpPointFunction(cursorPosition);
                    }
                    storeJumpPointFunction(position);
                    indexer.ports.goToDefinitionSub.send([helper.getActiveTopLevel(editor, position), token]);
                  }
                });
              } else {
                return resolve();
              }
            };
            indexer.ports.canGoToDefinitionRepliedCmd.subscribe(canGoToDefinitionReplied);
            indexer.ports.askCanGoToDefinitionSub.send([helper.getActiveTopLevel(editor, position), token]);
          } else {
            return resolve();
          }
        });
      }
    },
  };
}
