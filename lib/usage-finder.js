'use babel';

import {Range, Point} from 'atom';
const _ = require('underscore-plus');
import fs from 'fs-extra';
import helper from './helper';

export default {

  findUsagesOfSymbolAtCursor(indexer, activeEditor, indexDelta, callback) {
    const filePath = activeEditor.getPath();
    const importersForTokenReceived = ([projectDirectory, rawToken, willUseFullToken, isCursorAtLastPartOfToken, sourcePathAndNamesList]) => {
      indexer.ports.importersForTokenReceivedCmd.unsubscribe(importersForTokenReceived);
      var allLineUsages = [];
      const tokenParts = rawToken.split('.');
      const tokenLastPart = tokenParts.pop();
      const tokenFirstParts = tokenParts.join('.');
      const tokenToHighlight = willUseFullToken ? rawToken : (isCursorAtLastPartOfToken ? tokenLastPart: tokenFirstParts);
      sourcePathAndNamesList.forEach(([sourcePath, isModule, isImportAlias, names]) => {
        // TODO: Investigate why `sourcePath` can sometimes be ''.
        if (fs.existsSync(sourcePath)) {
          const editor = helper.getEditorForSourcePath(sourcePath);
          const text = editor ? editor.getText() : fs.readFileSync(sourcePath).toString();
          text.split('\n').forEach((line, row) => {
            const lineUsages = parseLine(sourcePath, row, line, rawToken, tokenToHighlight, tokenLastPart, isCursorAtLastPartOfToken, willUseFullToken, isModule, isImportAlias, names);
            allLineUsages.push(lineUsages);
          });
        }
      });
      const usages = _.flatten(allLineUsages, true);
      const position = activeEditor.getCursorBufferPosition();
      const selectedIndex = indexDelta + Math.max(0, usages.findIndex(({sourcePath, range}) => {
        return range.containsPoint(position);
      }));
      callback(projectDirectory, tokenToHighlight, selectedIndex, usages);
    };
    indexer.ports.importersForTokenReceivedCmd.subscribe(importersForTokenReceived);
    indexer.ports.getImportersForTokenSub.send([helper.getProjectDirectory(filePath), helper.getToken(activeEditor), helper.isCursorAtLastPartOfToken(activeEditor)]);
  },

};

function parseLine(sourcePath, row, line, token, tokenToHighlight, tokenLastPart, isCursorAtLastPartOfToken, willUseFullToken, isModule, isImportAlias, names) {
  const boundaryRegex = '\\s|,|\\(|\\)|\\[|\\]|\\{|\\}';
  const localNamesRegex = names.map((name) => {
    return _.escapeRegExp(name);
  }).join('|');
  const moduleSymbolRegex = isModule ? `|${tokenToHighlight}\\.((?!${boundaryRegex}).)+` : '';
  let regex = new RegExp('(^|\\s+as\\s+|' + boundaryRegex +  ')(' + localNamesRegex + moduleSymbolRegex + ')(?:' + boundaryRegex + '|$)', 'g');
  var match = regex.exec(line);
  var usages = [];
  const leadingExtraRegex = new RegExp('^(\\s+as\\s+|' + boundaryRegex + ')');
  const trailingExtraRegex = new RegExp(boundaryRegex + '$');
  while (match) {
    if (!isImportAlias && match[1].trim() === 'as') {
      match = regex.exec(line);
      continue;
    }
    const textMinusLeading = match[0].replace(leadingExtraRegex, '');
    const numTrimmed = match[0].length - textMinusLeading.length;
    const matchText = textMinusLeading.replace(trailingExtraRegex, '');
    const trimmedMatchText = matchText.replace(new RegExp(tokenLastPart + '$'), '');
    const tokenSubTokenDiff = !willUseFullToken && !isImportAlias && isCursorAtLastPartOfToken ? trimmedMatchText.length : 0;
    const index = match.index + numTrimmed + tokenSubTokenDiff;
    regex.lastIndex = match.index + tokenToHighlight.length;
    usages.push({
      sourcePath: sourcePath,
      lineText: line,
      range: new Range(new Point(row, index), new Point(row, index + tokenToHighlight.length))
    });
    match = regex.exec(line);
  }
  return usages;
}
