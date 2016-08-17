'use babel';

const Range = require('atom').Range;
import helper from './helper';

export function provide(indexer) {
  return {
    providerName: 'elmjutsu-hyperclick',
    getSuggestion(editor, position) {
      return new Promise((resolve) => {
        if (atom.config.get('elmjutsu.hyperclickEnabled') && helper.isElmEditor(editor)) {
          const scopeDescriptor = editor.scopeDescriptorForBufferPosition(position);
          if (!helper.isTokenAString(scopeDescriptor) && !helper.isTokenAComment(scopeDescriptor)) {
            const range = getTokenRange(position, editor);
            const token = editor.getTextInBufferRange(range);
            const canGoToDefinitionReplied = ([token, yes]) => {
              indexer.ports.canGoToDefinitionRepliedCmd.unsubscribe(canGoToDefinitionReplied);
              if (yes) {
                return resolve({
                  range,
                  callback() {
                    indexer.ports.goToDefinitionSub.send(token);
                  }
                });
              } else {
                return resolve();
              }
            };
            indexer.ports.canGoToDefinitionRepliedCmd.subscribe(canGoToDefinitionReplied);
            indexer.ports.askCanGoToDefinitionSub.send(token);
          } else {
            return resolve();
          }
        }
      });
    },
  };
}

function getTokenRange(position, editor) {
  var scanRange = [[position.row, 0], position];
  var beginningOfWordPosition = position;
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
  var endOfWordPosition = position;
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
  return new Range(beginningOfWordPosition, endOfWordPosition);
}
