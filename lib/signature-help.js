'use babel';

import { Point, Range } from 'atom';
import helper from './helper';

export function provide(signatureHelpRegistry, indexer) {
  signatureHelpRegistry({
    grammarScopes: ['source.elm'],
    // FIXME: `\n` is ignored.
    triggerCharacters: new Set([' ', '\n']),
    getSignatureHelp(editor, point) {
      return new Promise(resolve => {
        if (!atom.config.get('elmjutsu.signatureHelpEnabled')) {
          return resolve();
        }

        const positionBefore = point.translate([0, -1]);
        const isSucceedingSpace =
          editor.getTextInBufferRange([positionBefore, point]) == ' ';
        if (!isSucceedingSpace) {
          return resolve();
        }

        let minPosition = new Point(0, 0);
        // Look for start of current top-level.
        editor.backwardsScanInBufferRange(
          helper.blockRegex(),
          [point, minPosition],
          ({ range, stop }) => {
            stop();
            minPosition = range.start;
          }
        );

        let name = null;
        let startPosition = point;
        const result = getTokenAndRange(editor, startPosition, minPosition);
        if (!result) {
          return resolve();
        }
        const { token, tokenRange, skippedParens } = result;
        name = token;
        startPosition = tokenRange.start.translate([0, -1]);
        if (isTerminatingToken(name)) {
          return resolve();
        }
        name = cleanName(name);

        const maybeActiveTopLevel = helper.getActiveTopLevel(editor, point);

        let activeParameter = skippedParens;
        const signatureHelpReceived = indexer.onSignatureHelpReceived(
          signatures => {
            if (signatures.length === 0 || signatures[0].length < 2) {
              const result = getTokenAndRange(
                editor,
                startPosition,
                minPosition
              );
              if (!result) {
                return resolve();
              }
              const { token, tokenRange, skippedParens } = result;
              name = token;
              startPosition = tokenRange.start.translate([0, -1]);
              if (isTerminatingToken(name)) {
                signatureHelpReceived.dispose();
                return resolve();
              }
              name = cleanName(name);
              activeParameter += 1 + skippedParens;
              indexer.getSignatureHelp([maybeActiveTopLevel, name]);
              return;
            }

            signatureHelpReceived.dispose();
            if (signatures[0].length <= activeParameter + 1) {
              return resolve();
            }
            return resolve({
              signatures: signatures.map(parts => {
                const formattedParts = parts.map((part, index) => {
                  // HACK: Append zero-width spaces to differentiate each parameter.
                  return part + '\u200b'.repeat(index + 1);
                });
                return {
                  label: name + ' : ' + formattedParts.join(' -> '),
                  documentation: '',
                  parameters: formattedParts.map(part => {
                    return {
                      label: part,
                      documentation: '',
                    };
                  }),
                };
              }),
              activeSignature: 0,
              activeParameter,
            });
          }
        );
        indexer.getSignatureHelp([maybeActiveTopLevel, name]);
      });
    },
  });
}

function getTokenAndRange(editor, position, minPosition) {
  let scanRange = [position, minPosition];
  let tokenEndPosition = position.translate([0, -1]);
  tokenEndPosition = getNonWhitespacePosition(
    editor,
    position,
    minPosition,
    tokenEndPosition
  );

  let skippedParens = 0;
  const nonWhitespaceChar = editor.getTextInBufferRange([
    tokenEndPosition,
    tokenEndPosition.translate([0, 1]),
  ]);
  if (!nonWhitespaceChar) {
    return null;
  } else if (nonWhitespaceChar === ')') {
    skippedParens = 1;
    let openParens = 1;
    editor.backwardsScanInBufferRange(
      /[()]/,
      [tokenEndPosition, scanRange.start],
      ({ matchText, range, stop }) => {
        if (matchText === '(') {
          --openParens;
        } else if (matchText === ')') {
          ++openParens;
        }
        if (openParens === 0) {
          stop();
          tokenEndPosition = getNonWhitespacePosition(
            editor,
            range.start.translate([0, -1]),
            minPosition,
            tokenEndPosition
          );
        }
      }
    );
  } else if (nonWhitespaceChar === '}') {
    skippedParens = 1;
    let openBraces = 1;
    editor.backwardsScanInBufferRange(
      /[{}]/,
      [tokenEndPosition, scanRange.start],
      ({ matchText, range, stop }) => {
        if (matchText === '{') {
          --openBraces;
        } else if (matchText === '}') {
          ++openBraces;
        }
        if (openBraces === 0) {
          stop();
          tokenEndPosition = getNonWhitespacePosition(
            editor,
            range.start.translate([0, -1]),
            minPosition,
            tokenEndPosition
          );
        }
      }
    );
  }

  let tokenStartPosition = tokenEndPosition;
  // Get token.
  editor.backwardsScanInBufferRange(
    /\s/,
    [tokenEndPosition, scanRange.start],
    ({ range, stop }) => {
      stop();
      tokenStartPosition = range.end;
    }
  );
  const tokenRange = new Range(
    tokenStartPosition,
    tokenEndPosition.translate([0, 1])
  );
  if (tokenRange.isEmpty()) {
    return null;
  }
  const token = editor.getTextInBufferRange(tokenRange);
  return { token, tokenRange, skippedParens };
}

function isTerminatingToken(token) {
  return (
    !token ||
    ['=', '->', '(', '{', '|>', '<|'].includes(token) ||
    helper.isInfix(token)
  );
}

function cleanName(name) {
  return name.replace(/^[({|,]+/, '');
}

function getNonWhitespacePosition(
  editor,
  endPosition,
  startPosition,
  tokenPosition
) {
  editor.backwardsScanInBufferRange(
    /\S/,
    [endPosition, startPosition],
    ({ range, stop }) => {
      stop();
      tokenPosition = range.start;
    }
  );
  return tokenPosition;
}
