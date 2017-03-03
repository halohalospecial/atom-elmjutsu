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
            const range = getTokenRange(position, editor);
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

function getTokenRange(position, editor) {
  let scanRange = [[position.row, 0], position];
  let beginningOfWordPosition = position;
  editor.backwardsScanInBufferRange(helper.tokenRegex(), scanRange, ({range, matchText, stop}) => {
    if (matchText !== '' || range.start.column !== 0) {
      if (range.start.isLessThan(position)) {
        if (range.end.isGreaterThanOrEqual(position)) {
          beginningOfWordPosition = range.start;
        }
        stop();
      }
    }
  });
  scanRange = [position, editor.getEofBufferPosition()];
  let endOfWordPosition = position;
  editor.scanInBufferRange(helper.tokenRegex(), scanRange, ({range, matchText, stop}) => {
    if (matchText !== '' || range.start.column !== 0) {
      if (range.end.isGreaterThan(position)) {
        if (range.start.isLessThanOrEqual(position)) {
          endOfWordPosition = range.end;
        }
      }
      stop();
    }
  });
  let tokenRange = new Range(beginningOfWordPosition, endOfWordPosition);
  const column = position.column - beginningOfWordPosition.column;
  const token = editor.getTextInBufferRange(tokenRange);
  const tokenPart = helper.getTokenPartAtColumn(token, column);
  if (tokenPart) {
    tokenRange = new Range(tokenRange.start, tokenRange.start.translate([0, tokenPart.length]));
  }
  return tokenRange;
}
