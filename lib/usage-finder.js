'use babel';

const _ = require('underscore-plus');
import fs from 'fs-extra';
import helper from './helper';

export default {

  findUsagesOfSymbolAtCursor(indexer, activeEditor, callback) {
    const importersForTokenReceived = ([projectDirectory, rawToken, willUseFullToken, isCursorAtLastPartOfToken, sourcePathAndNamesList]) => {
      indexer.ports.importersForTokenReceivedCmd.unsubscribe(importersForTokenReceived);
      var allLineUsages = [];
      const tokenParts = rawToken.split('.');
      const tokenLastPart = tokenParts.pop();
      const tokenFirstParts = tokenParts.join('.');
      const tokenToHighlight = willUseFullToken ? rawToken : (isCursorAtLastPartOfToken ? tokenLastPart: tokenFirstParts);
      sourcePathAndNamesList.forEach(([sourcePath, isModule, isImportAlias, names]) => {
        const editor = helper.getEditorForSourcePath(sourcePath);
        const text = editor ? editor.getText() : fs.readFileSync(sourcePath).toString();
        text.split('\n').forEach((line, row) => {
          const lineUsages = parseLine(sourcePath, row, line, rawToken, tokenToHighlight, tokenLastPart, isCursorAtLastPartOfToken, willUseFullToken, isModule, isImportAlias, names);
          allLineUsages.push(lineUsages);
        });
      });
      const usages = _.flatten(allLineUsages, true);
      callback(projectDirectory, tokenToHighlight, usages);
    };
    indexer.ports.importersForTokenReceivedCmd.subscribe(importersForTokenReceived);
    indexer.ports.getImportersForTokenSub.send([helper.getProjectDirectory(activeEditor.getPath()), helper.getToken(activeEditor), helper.isCursorAtLastPartOfToken(activeEditor)]);
  },

};

function parseLine(sourcePath, row, rawLine, token, tokenToHighlight, tokenLastPart, isCursorAtLastPartOfToken, willUseFullToken, isModule, isImportAlias, names) {
  const line = rawLine.replace(/\\r/, '');
  const boundaryRegex = '\\s|,|\\(|\\)|\\[|\\]|\\{|\\}';
  const localNamesRegex = names.map((name) => {
    return _.escapeRegExp(name);
  }).join('|');
  const moduleSymbolRegex = isModule ? `|${tokenToHighlight}\\.((?!${boundaryRegex}).)+` : '';
  const regex = new RegExp('(^|\\s+as\\s+|' + boundaryRegex +  ')(' + localNamesRegex + moduleSymbolRegex + ')(?:' + boundaryRegex + '|$)', 'g');
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
    usages.push({
      sourcePath: sourcePath,
      lineText: line,
      range: {
        start: {row, column: index},
        end: {row, column: index + tokenToHighlight.length}
      }
    });
    match = regex.exec(line);
  }
  return usages;
}
