'use babel';

import childProcess from 'child_process';
const _ = require('underscore-plus');
import helper from './helper';
import PipeSelections from './pipe-selections';

export default class Eval {

  constructor() {
    this.pipeSelections = new PipeSelections(this.getProjectRepl.bind(this), sendToRepl, formatCode);
    this.procs = {};
    // TODO: When to kill project repl and remove from `this.procs`?
  }

  destroy() {
    this.pipeSelections.destroy();
    this.pipeSelections = null;
    _.values((proc) => {
      proc.kill();
    });
    this.procs = null;
  }

  // Command
  eval() {
    const editor = atom.workspace.getActiveTextEditor();
    const editorText = editor.getText();
    const selectedText = editor.getSelectedText();
    if (helper.isElmEditor(editor)) {
      const projectDirectory = helper.getProjectDirectory(editor.getPath());
      const proc = this.getProjectRepl(projectDirectory, (result) => {
        editor.transact(() => {
          editor.moveRight();
          editor.insertText(' {- ' + result + ' -}', {select: true});
        });
      });
      const defaultImports = [
        'import Basics exposing (..)',
        'import Debug',
        // 'import List exposing ( List, (::) )',
        'import List exposing ( (::) )',
        'import Maybe exposing ( Maybe( Just, Nothing ) )',
        'import Result exposing ( Result( Ok, Err ) )',
        'import Platform exposing ( Program )',
        'import Platform.Cmd exposing ( Cmd, (!) )',
        'import Platform.Sub exposing ( Sub )'
      ].join('\n');
      // Get import expressions.
      const imports = getImports(editorText).join('\n');
      // Import module name, if available.
      let maybeImportModule = '';
      const match = helper.moduleNameRegex().exec(editorText);
      if (match && match.length > 4 && match[4]) {
        maybeImportModule = 'import ' + match[4] + ' exposing (..)';
      }
      // // Remove module definition and type annotations.
      // const cleanedText = editorText.replace(/^(?!-|{)(((effect |port |)module)\s+\S+)\s(\s*(.|\n)*?(?=\n^\S|$(?![\r\n])))/m, '').replace(/^\S+\s+:.*(\n|$)/mg);
      sendToRepl(proc,
        formatCode(defaultImports + '\n') +
        formatCode(imports + '\n') +
        maybeImportModule +
        // formatCode(cleanedText + '\n') +
        '\n' +
        formatCode(selectedText));

    } else {
      // TODO: Spawn REPL in temporary directory.
    }
  }

  // Command
  pipe() {
    this.pipeSelections.show();
  }

  getProjectRepl(projectDirectory, onDone) {
    if (this.procs[projectDirectory]) {
      return this.procs[projectDirectory];
    }
    const proc = childProcess.spawn(atom.config.get('elmjutsu.elmReplExecPath'), {
      cwd: projectDirectory
    });
    this.procs[projectDirectory] = proc;
    var outString = '';
    var errString = '';
    // Ignore banner and `editorText`.
    const numOutputsToIgnore = 2;
    var ignoredOutputs = 0;
    proc.stdout.on('data', (rawData) => {
      rawData = rawData.toString();
      const data = rawData.replace(/^((>|\|)\s*)+/mg, '');
      const lines = data.split('\n');
      if (lines[lines.length - 1].trim() === '') {
        if (ignoredOutputs < numOutputsToIgnore) {
          ignoredOutputs = ignoredOutputs + 1;
        } else {
          outString += data;
          // proc.stdin.end();
          // proc.kill();
          // if (/\n> $/.test(rawData)) {
          if (errString !== '' || outString !== '') {
            outString = outString.replace(/(\n|)Environment Reset$/m, '');
            const result = (errString.length > 0 ? errString : outString).replace(/\n$/, ''); // Remove last newline
            onDone(result);
            errString = '';
            outString = '';
          }
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
    // proc.on('close', (code, signal) => {
    //   onDone(errString, outString);
    // });
    return proc;
  }

}

function sendToRepl(proc, code) {
  proc.stdin.write(code + '\n:reset\n');
}

function formatCode(code) {
  return code.replace(/\n/g, '\\\n');
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
