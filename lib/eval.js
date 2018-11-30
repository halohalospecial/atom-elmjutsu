'use babel';

// TODO: Make it work with Elm 0.19.

import _ from 'underscore-plus';
import indexing from './indexing';
import evalHelper from './eval-helper';
import helper from './helper';
import PipeSelections from './pipe-selections';

export default class Eval {
  constructor(indexer) {
    this.pipeSelections = new PipeSelections(
      indexer,
      evalHelper.executeElmRepl.bind(this),
      evalHelper.sendToRepl
    );
  }

  destroy() {
    this.pipeSelections.destroy();
    this.pipeSelections = null;
  }

  evalCommand() {
    const editor = atom.workspace.getActiveTextEditor();
    const editorText = editor.getText();
    if (helper.isElmEditor(editor)) {
      const projectDirectory = helper.getProjectDirectory(editor.getPath());
      let selection = editor.getLastSelection();
      // Select the whole line if nothing is selected.
      if (selection.isEmpty()) {
        editor.transact(() => {
          const row = selection.getBufferRange().start.row;
          editor.setSelectedBufferRange([
            [row, 0],
            [row, editor.lineTextForBufferRow(row).length],
          ]);
          selection = editor.getLastSelection();
        });
      }
      const range = selection.getBufferRange();
      const selectedText = editor.getTextInBufferRange(range);
      const marker = helper.markRange(editor, range, 'elmjutsu-eval');
      const elmVersion = helper.getElmVersion(projectDirectory);
      const numOutputsNeeded = 1;
      const proc = evalHelper.executeElmRepl(
        projectDirectory,
        elmVersion,
        numOutputsNeeded,
        (errString, outString) => {
          marker.destroy();
          // Remove last newline.
          const result = errString.length > 0 ? errString : outString;
          editor.transact(() => {
            selection.setBufferRange([range.end, range.end]);
            // const type = result.replace(value + ' : ', '');
            // const value = helper.removeTypeAnnotation(result);
            const leadingSpaces = new Array(range.start.column + 1).join(' ');
            selection.insertText('\n' + leadingSpaces);
            let resultRange = selection.insertText(result);
            selection.insertText('\n' + leadingSpaces);
            let marker = editor.markBufferRange(resultRange, {
              invalidate: 'inside',
            });
            const isError = result.startsWith('--');
            editor.decorateMarker(marker, {
              type: 'highlight',
              class: isError
                ? 'elmjutsu-eval-result-error'
                : 'elmjutsu-eval-result',
            });
          });
        }
      );
      // Get import statements.
      const imports = evalHelper.getImports(editorText).join('\n');
      // Import module name, if available.
      let maybeImportModule = '';
      const match = indexing.parseModuleNameAndComment(editorText);
      if (match) {
        maybeImportModule = 'import ' + match.name + ' exposing (..)';
      }
      evalHelper.sendToRepl(
        proc,
        helper.defaultImports(elmVersion),
        elmVersion
      );
      evalHelper.sendToRepl(
        proc,
        imports + '\n' + maybeImportModule,
        elmVersion
      );
      evalHelper.sendToRepl(proc, selectedText, elmVersion);
    } else {
      // TODO: Spawn REPL in temporary directory.
    }
  }

  pipeCommand() {
    this.pipeSelections.show();
  }
}
