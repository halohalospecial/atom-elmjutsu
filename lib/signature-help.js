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

        const isSucceedingSpace =
          editor.getTextInBufferRange([point.translate([0, -1]), point]) == ' ';
        if (!isSucceedingSpace) {
          return resolve();
        }

        let minPosition = helper.getTopLevelPosition(editor, point);
        let startPosition = point;
        const result = getTokenAndRangeAndSkippedParens(
          editor,
          startPosition,
          minPosition
        );
        if (!result) {
          return resolve();
        }

        const { token, tokenRange, skippedParens } = result;
        startPosition = tokenRange.start.translate([0, -1]);
        if (isBoundaryToken(token)) {
          return resolve();
        }
        let name = null;

        const maybeActiveTopLevel = helper.getActiveTopLevel(editor, point);

        let activeParameter = skippedParens;
        const signatureHelpReceived = indexer.onSignatureHelpReceived(
          signatures => {
            if (signatures.length === 0 || signatures[0].length < 2) {
              const result = getTokenAndRangeAndSkippedParens(
                editor,
                startPosition,
                minPosition
              );
              if (result) {
                const { token, tokenRange, skippedParens } = result;
                startPosition = tokenRange.start.translate([0, -1]);
                if (!isBoundaryToken(token)) {
                  activeParameter = activeParameter + 1 + skippedParens;
                  name = cleanName(token);
                  indexer.getSignatureHelp([maybeActiveTopLevel, name]);
                  return; // Exit function.
                }
              }

              signatureHelpReceived.dispose();
              return resolve();
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
        name = cleanName(token);
        indexer.getSignatureHelp([maybeActiveTopLevel, name]);
      });
    },
  });
}

function getTokenAndRangeAndSkippedParens(editor, position, minPosition) {
  let tokenEndPosition = position.translate([0, -1]);
  tokenEndPosition = getNonWhitespacePosition(
    editor,
    position,
    minPosition,
    tokenEndPosition
  );

  let skippedParens = 0;
  const result = skipParens(editor, tokenEndPosition, minPosition);
  if (!result) {
    return null;
  } else {
    skippedParens = result.skippedParens;
    tokenEndPosition = result.tokenEndPosition;
  }

  let tokenStartPosition = tokenEndPosition;
  // Get token.
  editor.backwardsScanInBufferRange(
    /\s/,
    [tokenEndPosition, minPosition],
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

function isBoundaryToken(token) {
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

function getSkippedTokenEndPosition(
  tokenEndPosition,
  minPosition,
  openingParen,
  closingParen,
  editor
) {
  let newTokenEndPosition = null;
  let openParens = 1;
  editor.backwardsScanInBufferRange(
    new RegExp('[' + openingParen + closingParen + ']', 'g'),
    [tokenEndPosition, minPosition],
    ({ matchText, range, stop }) => {
      if (matchText === openingParen) {
        --openParens;
      } else if (matchText === closingParen) {
        ++openParens;
      }
      if (openParens === 0) {
        stop();
        newTokenEndPosition = getNonWhitespacePosition(
          editor,
          range.start.translate([0, -1]),
          minPosition,
          tokenEndPosition
        );
      }
    }
  );
  if (
    openParens !== 0 ||
    !newTokenEndPosition ||
    newTokenEndPosition.isEqual(tokenEndPosition) ||
    newTokenEndPosition.isLessThanOrEqual(minPosition)
  ) {
    return null;
  } else {
    return newTokenEndPosition;
  }
}

function skipParens(editor, tokenEndPosition, minPosition) {
  let skippedParens = 0;
  while (true) {
    const nonWhitespaceChar = editor.getTextInBufferRange([
      tokenEndPosition,
      tokenEndPosition.translate([0, 1]),
    ]);
    if (!nonWhitespaceChar) {
      return null;
    } else if (nonWhitespaceChar === ')') {
      ++skippedParens;
      tokenEndPosition = getSkippedTokenEndPosition(
        tokenEndPosition,
        minPosition,
        '(',
        ')',
        editor
      );
      if (!tokenEndPosition) {
        return null;
      }
    } else if (nonWhitespaceChar === '}') {
      ++skippedParens;
      tokenEndPosition = getSkippedTokenEndPosition(
        tokenEndPosition,
        minPosition,
        '{',
        '}',
        editor
      );
      if (!tokenEndPosition) {
        return null;
      }
    } else {
      return { tokenEndPosition, skippedParens };
    }
  }
}
