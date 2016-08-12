'use babel';

const lineReader = require('line-reader');
const _ = require('underscore-plus');
import helper from './helper';

export default class FindUsages {

  constructor(indexer) {
    indexer.ports.importersForTokenReceivedCmd.subscribe(([maybeToken, sourcePathAndLocalNameList]) => {
      console.log('importersForTokenReceivedCmd', maybeToken, sourcePathAndLocalNameList); // // //

      // sourcePathAndLocalNameList.forEach(([sourcePath, localName]) => {
      //   lineReader.eachLine(sourcePath, function(rawLine, last) {
      //     const line = last ? rawLine.replace(/\\r$/, '') : rawLine;
      //     const regex = new RegExp('\s' + _.escapeRegExp(localName) + '\s', 'g');
      //     const matches = line.match(regex);
      //     matches.forEach((match) => {
      //       console.log('match', match); // // //
      //     });
      //   });
      // });




      // const symbol = symbols[0]; // // //

      // symbols.forEach((symbol) => {
      //   atom.workspace.open(symbol.sourcePath).then((editor) => {
      //     helper.scanForSymbolNonDefinitionRange(editor, symbol, (range) => {
      //       symbolRange = range;
      //       editor.setCursorBufferPosition(symbolRange.start);
      //       editor.scrollToCursorPosition({center: true});
      //     });
      //   });
      // });

      // // Find symbol in active editor.
      // const editor = atom.workspace.getActiveTextEditor();
      // if (helper.isElmEditor(editor)) {
      //   helper.scanForSymbolNonDefinitionRange(editor, symbol, (range, stop) => {
      //     editor.setCursorBufferPosition(range.start);
      //     editor.scrollToCursorPosition({center: true});
      //     stop();
      //   });
      // }

    });
  }

  destroy() {
  }

}
