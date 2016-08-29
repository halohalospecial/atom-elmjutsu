'use babel';

import {CompositeDisposable} from 'atom';
import childProcess from 'child_process';
import helper from './helper';

export default class Eval {

  // Command
  eval() {
    const editor = atom.workspace.getActiveTextEditor();
    const editorText = editor.getText();
    const selectedText = editor.getSelectedText();
    if (helper.isElmEditor(editor)) {
      const projectDirectory = helper.getProjectDirectory(editor.getPath());
      const proc = childProcess.spawn(atom.config.get('elmjutsu.elmReplExecPath'), {
        cwd: projectDirectory
      });
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
            proc.stdin.end();
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
        const result = (errString.length > 0 ? errString : outString).replace(/\n$/, ''); // Remove last newline
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
      // Get imports.
      const localImports = getImports(editorText).join('\n');
      // Get module name.
      let maybeImportModule = '';
      const match = helper.moduleNameRegex().exec(editorText);
      if (match && match.length > 4 && match[4]) {
        maybeImportModule = 'import ' + match[4] + ' exposing (..)';
      }
      // Remove module definition and type annotations.
      // const cleanedText = editorText.replace(/^(?!-|{)(((effect |port |)module)\s+\S+)\s(\s*(.|\n)*?(?=\n^\S|$(?![\r\n])))/m, '').replace(/^\S+\s+:.*(\n|$)/mg);
      proc.stdin.write(
        formatCode(defaultImports + '\n') +
        formatCode(localImports + '\n') +
        maybeImportModule +
        // formatCode(cleanedText + '\n') +
        '\n' +
        formatCode(selectedText) +
        '\n');

    } else {
      // TODO: Spawn REPL in temporary directory.
    }
  }

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
