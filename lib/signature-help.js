'use babel';

import helper from './helper';

export function provide(signatureHelpRegistry, indexer) {
  signatureHelpRegistry({
    // priority: ,
    grammarScopes: ['source.elm'],
    triggerCharacters: new Set([' ']),
    getSignatureHelp(editor, point) {
      return new Promise(resolve => {
        if (!atom.config.get('elmjutsu.signatureHelpEnabled')) {
          return resolve();
        }

        const tokenPosition = point.translate([0, -1]);
        const isSucceedingSpace =
          editor.getTextInBufferRange([tokenPosition, point]) == ' ';
        if (!isSucceedingSpace) {
          return resolve();
        }
        const tokenRange = helper.getTokenRange(editor, tokenPosition);
        const token = editor.getTextInBufferRange(tokenRange);
        if (!token) {
          return resolve();
        }
        const maybeActiveTopLevel = helper.getActiveTopLevel(
          editor,
          tokenPosition
        );

        const signatureHelpReceived = indexer.onSignatureHelpReceived(
          signatures => {
            signatureHelpReceived.dispose();
            if (signatures.length === 0) {
              return resolve();
            }
            const activeParameter = signatures[0].length > 1 ? 0 : -1; // // //
            return resolve({
              signatures: signatures.map(parts => {
                const formattedParts = parts.map((part, index) => {
                  // HACK: Append zero-width spaces to differentiate each parameter.
                  return part + '\u200b'.repeat(index + 1);
                });
                return {
                  label: token + ' : ' + formattedParts.join(' -> '),
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
        indexer.getSignatureHelp([maybeActiveTopLevel, token]);
      });
    },
  });
}
