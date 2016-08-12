'use babel';

import helper from './helper';
const Range = require('atom').Range;
import fs from 'fs';
const _ = require('underscore-plus');

export default class FindUsages {

  constructor(indexer) {
    indexer.ports.importersForTokenReceivedCmd.subscribe(([maybeToken, sourcePathAndNamesList]) => {
      var allLineUsages = [];
      sourcePathAndNamesList.forEach(([sourcePath, names]) => {
        const editor = getEditorForSourcePath(sourcePath);
        const text = editor ? editor.getText() : fs.readFileSync(sourcePath).toString();
        text.split('\n').forEach((line, row) => {
          const lineUsages = this.parseLine(sourcePath, row, line, names);
          allLineUsages.push(lineUsages);
        });
      });
      const usages = _.flatten(allLineUsages, true);
      console.log(usages); // // //
    });
  }

  destroy() {
  }

  parseLine(sourcePath, row, rawLine, names) {
    const line = rawLine.replace(/\\r/, '');
    const boundaryRegex = '\\s|,|\\(|\\)|\\[|\\]|\\{|\\}';
    const localNamesRegex = names.map((name) => {
      return _.escapeRegExp(name);
    }).join('|');
    const regex = new RegExp('(?!^(' + boundaryRegex +  '))(' + localNamesRegex + ')(' + boundaryRegex + '|$)', 'g');
    var match = regex.exec(line);
    var usages = [];
    while (match) {
      // Do not include matches at start of line (for definitions).
      if (match.index > 0) {
        const matchText = match[2];
        usages.push({
          sourcePath: sourcePath,
          line: line,
          range: new Range([row, match.index], [row, match.index + matchText.length - 1])
        });
      }
      match = regex.exec(line);
    }
    return usages;
  }

}

function getEditorForSourcePath(sourcePath) {
  const pane = atom.workspace.paneForURI(sourcePath);
  if (pane) {
    const item = pane.itemForURI(sourcePath);
    if (item) {
      return item;
    }
  }
  return null;
}
