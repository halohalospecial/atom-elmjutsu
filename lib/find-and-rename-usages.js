'use babel';

import {CompositeDisposable} from 'atom';
import path from 'path';
import fs from 'fs-extra';
const _ = require('underscore-plus');
import FindAndRenameUsagesView from './find-and-rename-usages-view';
import helper from './helper';
import indexing from './indexing';
import usageFinder from './usage-finder';

export default class FindUsages {

  constructor(indexer, storeJumpPointFunction) {
    this.indexer = indexer;
    this.storeJumpPoint = storeJumpPointFunction;
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.commands.add('atom-text-editor.elmjutsu-rename-symbol', {
      'elmjutsu:cancel-rename-symbol':  this.hide.bind(this), // escape
      'elmjutsu:confirm-rename-symbol': this.doRenameSymbol.bind(this) // enter
    }));
    this.view = new FindAndRenameUsagesView();
    this.subscriptions.add(atom.workspace.addOpener((uriToOpen) => {
      if (uriToOpen === getURI()) {
        return this.view;
      }
    }));
  }

  destroy() {
    this.subscriptions.dispose();
    this.subscriptions = null;
    this.view.destroy();
    this.view = null;
  }

  show(projectDirectory, tokenToHighlight, selectedIndex, usages, willShowRenamePanel) {
    const prevActivePane = atom.workspace.getActivePane();
    atom.workspace.open(getURI(), {searchAllPanes: true, split: 'right'})
      .then((view) => {
        if (isFindAndRenameUsagesView(view)) {
          prevActivePane.activate();
          setTimeout(() => {
            if (willShowRenamePanel) {
              view.showRenamePanel(tokenToHighlight);
            } else {
              view.hideRenamePanel();
            }
            view.setContents(projectDirectory, tokenToHighlight, selectedIndex, usages, willShowRenamePanel);
          }, 0);
        }
      });
  }

  hide() {
    const pane = atom.workspace.paneForURI(getURI());
    if (pane) {
      pane.destroyItem(pane.itemForURI(getURI()));
    }
  }

  // Command
  findUsages(indexDelta, callback) {
    const editor = atom.workspace.getActiveTextEditor();
    if (helper.isElmEditor(editor)) {
      usageFinder.findUsagesOfSymbolAtCursor(this.indexer, editor, indexDelta || 0, (projectDirectory, tokenToHighlight, selectedIndex, usages) => {
        this.show(projectDirectory + path.sep, tokenToHighlight, selectedIndex, usages, false);
      });
    }
  }

  // Command
  renameSymbol() {
    const editor = atom.workspace.getActiveTextEditor();
    if (helper.isElmEditor(editor)) {
      usageFinder.findUsagesOfSymbolAtCursor(this.indexer, editor, 0, (projectDirectory, tokenToHighlight, selectedIndex, usages) => {
        if (usages.length > 0) {
          this.renameInfo = {
            oldName: tokenToHighlight,
            projectDirectory: projectDirectory,
          };
          this.show(projectDirectory + path.sep, tokenToHighlight, selectedIndex, usages, true);
        } else {
          atom.notifications.addError('Sorry, I don\'t know how to rename that.');
        }
      });
    }
  }

  // Command
  goToNextUsage() {
    this.storeJumpPoint();
    if (!this.view.isShown) {
      this.findUsages(1, () => {
        this.view.goToNextUsage();
      });
    } else {
      this.view.goToNextUsage();
    }
  }

  // Command
  goToPreviousUsage() {
    this.storeJumpPoint();
    if (!this.view.isShown) {
      this.findUsages(-1, () => {
        this.view.goToPreviousUsage();
      });
    } else {
      this.view.goToPreviousUsage();
    }
  }

  doRenameSymbol() {
    this.view.getCheckedUsages((usages) => {
      const newName = this.view.getRenameText();
      const {oldName, projectDirectory} = this.renameInfo;
      if (newName === oldName) {
        return;
      }
      const groupsBySourcePath = _.groupBy(usages, 'sourcePath');
      _.pairs(groupsBySourcePath).forEach(([sourcePath, usages]) => {
        const editor = helper.getEditorForSourcePath(sourcePath);
        const text = editor ? editor.getText() : fs.readFileSync(sourcePath).toString();
        let lines = text.split('\n');
        const groupsByRow = _.groupBy(usages, ({range}) => {
          return range.start.row;
        });
        _.pairs(groupsByRow).forEach(([row, usages]) => {
          const usagesSorted = _.sortBy(usages, ({range}) => {
            return range.start.column;
          });
          const lineText = usagesSorted[0].lineText;
          let slices = [];
          slices.push(lineText.slice(0, usagesSorted[0].range.start.column));
          let i = 0;
          while (i < usagesSorted.length) {
            if (i === usagesSorted.length - 1) {
              slices.push(lineText.slice(usagesSorted[i].range.end.column));
            } else {
              slices.push(lineText.slice(usagesSorted[i].range.end.column, usagesSorted[i+1].range.start.column));
            }
            i = i + 1;
          }
          lines[row] = slices.join(newName);
        });
        const updatedText = lines.join('\n');
        if (editor) {
          const position = editor.getCursorScreenPosition();
          this.maybeUpdateWorkFile(projectDirectory, sourcePath, updatedText);
          indexing.sendActiveFile(this.indexer, editor);
          editor.buffer.setTextViaDiff(updatedText);
          editor.setCursorScreenPosition(position);
        } else {
          fs.writeFileSync(sourcePath, updatedText);
        }
      });

      // Force a lint if `Lint On The Fly` is enabled in `linter-elm-make`.
      setTimeout(() => {
        if (atom.packages.isPackageActive('linter-elm-make') && atom.config.get('linter-elm-make.lintOnTheFly')) {
          const activeEditor = atom.workspace.getActiveTextEditor();
          if (helper.isElmEditor(activeEditor)) {
            // Toggle linter off then on again to refresh the lint results.
            [1, 2].forEach(() => {
              atom.commands.dispatch(atom.views.getView(activeEditor), 'linter:toggle');
            });
          }
        }
      }, 600);

      this.hide();
    });
  }

  getWorkDirectory(filePath) {
    if (atom.packages.isPackageActive('linter-elm-make') && this.getWorkDirectoryFunction) {
      return this.getWorkDirectoryFunction(filePath);
    }
    return null;
  }

  setGetWorkDirectoryFunction(getWorkDirectoryFunction) {
    this.getWorkDirectoryFunction = getWorkDirectoryFunction;
  }

  // Force an update to the work file.
  maybeUpdateWorkFile(projectDirectory, filePath, text) {
    if (filePath) {
      const workDirectory = this.getWorkDirectory(filePath);
      if (workDirectory) {
        const workFilePath = path.join(workDirectory, filePath.replace(projectDirectory, ''));
        if (workFilePath !== filePath) {
          fs.writeFileSync(workFilePath, text);
        }
      }
    }
  }

}

// Must the same as in `find-and-rename-usages-view.js`.
function getURI() {
  return 'elmjutsu-usages-view://';
}

function isFindAndRenameUsagesView(view) {
  return view instanceof FindAndRenameUsagesView;
}
