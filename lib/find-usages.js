'use babel';

const CompositeDisposable = require('atom').CompositeDisposable;
import fs from 'fs';
import path from 'path';
const _ = require('underscore-plus');
import FindUsagesView from './find-usages-view';
import helper from './helper';

export default class FindUsages {

  constructor(indexer, core) {
    this.indexer = indexer;
    this.core = core;
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.workspace.addOpener((uriToOpen) => {
      if (uriToOpen === getURI()) {
        this.view = new FindUsagesView(indexer);
        return this.view;
      }
    }));
    indexer.ports.importersForTokenReceivedCmd.subscribe(([projectDirectory, token, isCursorAtLastPartOfToken, sourcePathAndNamesList]) => {
      var allLineUsages = [];
      sourcePathAndNamesList.forEach(([sourcePath, willUseFullToken, isImportAlias, names]) => {
        const editor = helper.getEditorForSourcePath(sourcePath);
        const text = editor ? editor.getText() : fs.readFileSync(sourcePath).toString();
        text.split('\n').forEach((line, row) => {
          const lineUsages = parseLine(sourcePath, row, line, token, isCursorAtLastPartOfToken, willUseFullToken, isImportAlias, names);
          allLineUsages.push(lineUsages);
        });
      });
      const usages = _.flatten(allLineUsages, true);
      this.show(projectDirectory + path.sep, usages);
    });
  }

  destroy() {
    this.subscriptions.dispose();
    this.subscriptions = null;
    this.view.destroy();
    this.view = null;
  }

  createView(state) {
    return new FindUsagesView(state);
  }

  show(projectDirectory, usages) {
    const prevActivePane = atom.workspace.getActivePane();
    atom.workspace.open(getURI(), {searchAllPanes: true, split: 'right'})
      .then((view) => {
        if (isFindUsagesView(view)) {
          prevActivePane.activate();
          setTimeout(() => {
            view.setUsages(projectDirectory, usages);
          }, 0);
        }
      });
  }

  hide() {
    const uri = getURI();
    const pane = atom.workspace.paneForURI(uri);
    if (pane) {
      const result = pane.destroyItem(pane.itemForURI(uri));
      return true;
    }
    return false;
  }

  findUsages() {
    const editor = atom.workspace.getActiveTextEditor();
    if (helper.isElmEditor(editor)) {
      this.indexer.ports.getImportersForTokenSub.send([helper.getProjectDirectory(editor.getPath()), helper.getToken(editor), helper.isCursorAtLastPartOfToken(editor)]);
    }
  }

  goToNextUsage() {
    if (this.view) {
      this.core.storeJumpPoint();
      this.view.goToNextUsage();
    }
  }

  goToPreviousUsage() {
    if (this.view) {
      this.core.storeJumpPoint();
      this.view.goToPreviousUsage();
    }
  }

}

function getURI() {
  return 'elmjutsu-find-usages-view://';
}

function isFindUsagesView(view) {
  return view instanceof FindUsagesView;
}

function parseLine(sourcePath, row, rawLine, token, isCursorAtLastPartOfToken, willUseFullToken, isImportAlias, names) {
  const line = rawLine.replace(/\\r/, '');
  const boundaryRegex = '\\s|,|\\(|\\)|\\[|\\]|\\{|\\}';
  const localNamesRegex = names.map((name) => {
    return _.escapeRegExp(name);
  }).join('|');

  // const moduleSymbolRegex = isModule ? `|${token}\\.((?!${boundaryRegex}).)+` : '';
  const moduleSymbolRegex = ''; // // //

  console.log('willUseFullToken', willUseFullToken); // // //
  console.log('isImportAlias', isImportAlias); // // //
  console.log('moduleSymbolRegex', moduleSymbolRegex); // // //

  const regex = new RegExp('(^|\\s+as\\s+|' + boundaryRegex +  ')(' + localNamesRegex + moduleSymbolRegex + ')(?:' + boundaryRegex + '|$)', 'g');
  console.log('regex', regex); // // //
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
    const tokenParts = token.split('.');
    const tokenLastPart = tokenParts.pop();
    const tokenFirstParts = tokenParts.join('.');
    const tokenSubTokenDiff = !willUseFullToken && isCursorAtLastPartOfToken ? matchText.replace(new RegExp(tokenLastPart + '$'), '').length : 0;
    const index = match.index + numTrimmed + tokenSubTokenDiff;
    const tokenToHighlight = willUseFullToken ? token : (isCursorAtLastPartOfToken ? tokenLastPart: tokenFirstParts);
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
