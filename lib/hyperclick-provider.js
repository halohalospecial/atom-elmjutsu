'use babel';

import { Range } from 'atom';
import helper from './helper';

export function provide(indexer, storeJumpPointFunction) {
  return {
    providerName: 'elmjutsu-hyperclick',
    getSuggestion(editor, position) {
      if (
        atom.config.get('elmjutsu.hyperclickEnabled') &&
        helper.isElmEditor(editor)
      ) {
        return new Promise(resolve => {
          const cursorPosition = editor.getCursorBufferPosition();
          const scopeDescriptor = editor.scopeDescriptorForBufferPosition(
            position
          );
          if (
            !helper.isScopeAString(scopeDescriptor) &&
            !helper.isScopeAComment(scopeDescriptor)
          ) {
            const range = helper.getTokenRange(editor, position);
            if (!range) {
              return resolve();
            }
            const token = editor.getTextInBufferRange(range);
            const canGoToDefinitionReplied = indexer.onCanGoToDefinitionReplied(
              ([token, yes]) => {
                canGoToDefinitionReplied.dispose();
                if (yes) {
                  return resolve({
                    range,
                    callback() {
                      if (!position.isEqual(cursorPosition)) {
                        storeJumpPointFunction(cursorPosition);
                      }
                      storeJumpPointFunction(position);
                      indexer.goToDefinition([
                        helper.getActiveTopLevel(editor, position),
                        helper.getActiveRecordVariable(editor, position),
                        token,
                      ]);
                    },
                  });
                } else {
                  return resolve();
                }
              }
            );
            indexer.askCanGoToDefinition([
              helper.getActiveTopLevel(editor, position),
              helper.getActiveRecordVariable(editor, position),
              token,
            ]);
          } else {
            return resolve();
          }
        });
      }
    },
  };
}
