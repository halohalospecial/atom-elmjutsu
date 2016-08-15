'use babel';

const CompositeDisposable = require('atom').CompositeDisposable;
import fs from 'fs';
const _ = require('underscore-plus');
import FindUsagesView from './find-usages-view';
import helper from './helper';

export default class FindUsages {

  constructor(indexer) {
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.workspace.addOpener((uriToOpen) => {
      if (uriToOpen === getURI()) {
        this.view = new FindUsagesView(indexer);
        return this.view;
      }
    }));
    indexer.ports.importersForTokenReceivedCmd.subscribe(([maybeToken, sourcePathAndNamesList]) => {
      var allLineUsages = [];
      sourcePathAndNamesList.forEach(([sourcePath, names]) => {
        const editor = helper.getEditorForSourcePath(sourcePath);
        const text = editor ? editor.getText() : fs.readFileSync(sourcePath).toString();
        text.split('\n').forEach((line, row) => {
          const lineUsages = parseLine(sourcePath, row, line, names);
          allLineUsages.push(lineUsages);
        });
      });
      const usages = _.flatten(allLineUsages, true);
      this.show(usages);
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

  show(usages) {
    const prevActivePane = atom.workspace.getActivePane();
    atom.workspace.open(getURI(), {searchAllPanes: true, split: 'right'})
      .then((view) => {
        if (isFindUsagesView(view)) {
          prevActivePane.activate();
          setTimeout(() => {
            view.setUsages(usages);
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

  goToNextUsage() {
    if (this.view) {
      this.view.goToNextUsage();
    }
  }

  goToPreviousUsage() {
    if (this.view) {
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

function parseLine(sourcePath, row, rawLine, names) {
  const line = rawLine.replace(/\\r/, '');
  const boundaryRegex = '\\s|,|\\(|\\)|\\[|\\]|\\{|\\}';
  const localNamesRegex = names.map((name) => {
    return _.escapeRegExp(name);
  }).join('|');
  // Do not include matches at start of line (e.g. foo = 42) (e.g. foo : number).
  const regex = new RegExp('(?!^)(?:' + boundaryRegex +  ')(' + localNamesRegex + ')(?:' + boundaryRegex + '|$)', 'g');
  var match = regex.exec(line);
  var usages = [];
  // TODO: Investigate why the match is capturing the leading and trailing characters.
  const leadingExtraRegex = new RegExp(boundaryRegex);
  const trailingExtraRegex = new RegExp(boundaryRegex + '$');
  while (match) {
    // Trim leading extra.
    const textMinusLeading = match[0].replace(leadingExtraRegex, '');
    const numTrimmed = match[0].length - textMinusLeading.length;
    // Trim trailing extra.
    const matchText = textMinusLeading.replace(trailingExtraRegex, '');
    const index = match.index + numTrimmed;
    usages.push({
      sourcePath: sourcePath,
      lineText: line,
      // name: matchText,
      range: {start: {row, column: index}, end: {row, column: index + matchText.length}}
    });
    match = regex.exec(line);
  }
  return usages;
}
