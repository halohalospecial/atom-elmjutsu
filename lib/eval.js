'use babel';

import childProcess from 'child_process';
import _ from 'underscore-plus';
import indexing from './indexing';
import helper from './helper';
import PipeSelections from './pipe-selections';
import os from 'os';

export default class Eval {

  constructor(indexer) {
    this.pipeSelections = new PipeSelections(indexer, this.executeInRepl.bind(this), sendToRepl);
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
      // Ignore `elm-repl` banner and `editorText`.
      const numOutputsToIgnore = 2;
      let selection = editor.getLastSelection();
      // Select the whole line if nothing is selected.
      if (selection.isEmpty()) {
        editor.transact(() => {
          const row = selection.getBufferRange().start.row;
          editor.setSelectedBufferRange([[row, 0], [row, editor.lineTextForBufferRow(row).length]]);
          selection = editor.getLastSelection();
        });
      }
      const range = selection.getBufferRange();
      const selectedText = editor.getTextInBufferRange(range);
      const marker = helper.markRange(editor, range, 'elmjutsu-eval');
      const proc = this.executeInRepl(projectDirectory, numOutputsToIgnore, (errString, outString) => {
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
          let marker = editor.markBufferRange(resultRange, {invalidate: 'inside'});
          const isError = result.startsWith('--');
          editor.decorateMarker(marker, {type: 'highlight', class: isError ? 'elmjutsu-eval-result-error' : 'elmjutsu-eval-result'});
        });
      });
      // Get import statements.
      const imports = getImports(editorText).join('\n');
      // Import module name, if available.
      let maybeImportModule = '';
      const match = indexing.parseModuleNameAndComment(editorText);
      if (match) {
        maybeImportModule = 'import ' + match.name + ' exposing (..)';
      }
      sendToRepl(proc, helper.defaultImports());
      sendToRepl(proc, imports + '\n' + maybeImportModule);
      sendToRepl(proc, selectedText);

    } else {
      // TODO: Spawn REPL in temporary directory.
    }
  }

  pipeCommand() {
    this.pipeSelections.show();
  }

  executeInRepl(projectDirectory, numOutputsToIgnore, onDone) {
    const proc = childProcess.spawn(atom.config.get('elmjutsu.elmReplExecPath'), {
      cwd: projectDirectory
    });
    var outString = '';
    var errString = '';
    var ignoredOutputs = 0;
    proc.stdout.on('data', (data) => {
      data = data.toString();
      const cleanedData = data.replace(/^((>|\|)\s*)+/mg, '');
      const lines = cleanedData.split('\n');
      if (lines[lines.length - 1].trim() === '') {
        if (ignoredOutputs < numOutputsToIgnore) {
          ignoredOutputs = ignoredOutputs + 1;
        } else {
          outString += cleanedData;
          proc.kill();
        }
      } else {
        outString += data;
      }
    });
    proc.stderr.on('data', (data) => {
      errString += data.toString();
    });
    proc.on('error', (err) => {
      // TODO: Show notification
    });
    proc.on('close', (code, signal) => {
      onDone(errString.replace(/\n$/, ''), outString.replace(/\n$/, ''));
    });
    return proc;
  }

}

function sendToRepl(proc, code) {
  proc.stdin.write(formatCode(code) + os.EOL);
}

function formatCode(code) {
  return code
    // Remove module definition.
    .replace(/^(?!-|{)(((effect |port |)module)\s+\S+)\s(\s*(.|\n)*?(?=\n^\S|$(?![\r\n])))/m, '')
    // Remove type annotations.
    .replace(/^\S+\s+:.*(\n|$)/mg, '')
    // Convert newline to backslash + newline.
    .replace(/\n/g, '\\\n');
}

function getImports(code) {
  const regex = helper.importRegex();
  var imports = [];
  var match = regex.exec(code);
  while (match) {
    imports.push(match[0]);
    match = regex.exec(code);
  }
  return imports;
}
