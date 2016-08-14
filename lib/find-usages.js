'use babel';

const Range = require('atom').Range;
import fs from 'fs';
const _ = require('underscore-plus');
import helper from './helper';
import SymbolFinder from './symbol-finder';
import FindUsagesView from './find-usages-view';

export default class FindUsages extends SymbolFinder {

  constructor(indexer) {
    super(indexer, FindUsagesView);
    indexer.ports.importersForTokenReceivedCmd.subscribe(([maybeToken, sourcePathAndNamesList]) => {
      var allLineUsages = [];
      sourcePathAndNamesList.forEach(([sourcePath, names]) => {
        const editor = helper.getEditorForSourcePath(sourcePath);
        const text = editor ? editor.getText() : fs.readFileSync(sourcePath).toString();
        text.split('\n').forEach((line, row) => {
          const lineUsages = this.parseLine(sourcePath, row, line, names);
          allLineUsages.push(lineUsages);
        });
      });
      const usages = _.flatten(allLineUsages, true);
      this.show(usages);
    });
  }

  getSymbolRange(usage, editor) {
    return usage.range;
  }

  show(usages) {
    super.show();
    this.view.setUsages(usages);
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
      // Do not include matches at start of line (e.g. foo = 42) (e.g. foo : number).
      if (match.index > 0) {
        const matchText = match[2];
        usages.push({
          sourcePath: sourcePath,
          lineText: line,
          name: matchText,
          range: new Range([row, match.index], [row, match.index + matchText.length])
        });
      }
      match = regex.exec(line);
    }
    return usages;
  }

}
