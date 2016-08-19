'use babel';

import fs from 'fs';
import path from 'path';
const _ = require('underscore-plus');
import helper from './helper';
import indexing from './indexing';
import usageFinder from './usage-finder';
import RenameSymbolView from './rename-symbol-view';

export default class RenameSymbol {

  constructor(indexer) {
    this.indexer = indexer;
    this.view = new RenameSymbolView();
    this.view.onDidConfirm(({newName, projectDirectory, usages}) => {
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
          this.updateWorkFile(projectDirectory, sourcePath, updatedText);
          indexing.sendActiveFile(this.indexer, editor);
          editor.setText(updatedText);
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
    });
  }

  destroy() {
    this.view.destroy();
    this.view = null;
  }

  renameSymbol() {
    const editor = atom.workspace.getActiveTextEditor();
    if (helper.isElmEditor(editor)) {
      usageFinder.findUsagesOfSymbolAtCursor(editor, this.indexer, (projectDirectory, tokenToHighlight, usages) => {
        if (usages.length > 0) {
          this.view.show(tokenToHighlight, projectDirectory, usages);
        } else {
          atom.notifications.addError('Sorry, I don\'t know how to rename that. (•́︿•̀)');
        }
      });
    }
  }

  setGetWorkDirectoryFunction(getWorkDirectoryFunction) {
    this.getWorkDirectory = getWorkDirectoryFunction;
  }

  // Force an update to the work file.
  updateWorkFile(projectDirectory, filePath, text) {
    if (filePath) {
      const workDirectory = this.getWorkDirectory(filePath);
      if (workDirectory) {
        const workFilePath = path.join(workDirectory, filePath.replace(projectDirectory, ''));
        fs.writeFileSync(workFilePath, text);
      }
    }
  }

}
