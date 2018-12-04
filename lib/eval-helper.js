'use babel';

import childProcess from 'child_process';
import os from 'os';
import helper from './helper';

export default {
  executeElmRepl(projectDirectory, elmVersion, numOutputsNeeded, onDone) {
    const usingPre0_19ElmVersion = helper.isPre0_19ElmVersion(elmVersion);
    const configExecutablePath = usingPre0_19ElmVersion
      ? atom.config.get('elmjutsu.elmReplExecPath')
      : atom.config.get('elmjutsu.elmExecPath');
    const executablePath = helper.getAbsoluteExecutablePath(
      projectDirectory,
      configExecutablePath
    );
    const args = usingPre0_19ElmVersion ? [] : ['repl', '--no-colors'];
    const proc = childProcess.spawn(executablePath, args, {
      cwd: projectDirectory,
      env: process.env,
    });
    let outString = '';
    let errString = '';
    // Ignore `elm-repl` banner.
    const numOutputsToIgnore = 1;
    let ignoredOutputs = 0;
    let outputsReceived = 0;
    proc.stdout.on('data', data => {
      data = data.toString();
      const cleanedData = data.replace(/^((>|\|)\s*)+/gm, '');
      const lines = cleanedData.split('\n');
      if (lines[lines.length - 1].trim() === '') {
        if (ignoredOutputs < numOutputsToIgnore) {
          ignoredOutputs = ignoredOutputs + 1;
        } else {
          outString += cleanedData;
          if (cleanedData.trim().length > 0) {
            outputsReceived = outputsReceived + 1;
            if (outputsReceived >= numOutputsNeeded) {
              proc.kill();
            }
          }
        }
      } else {
        outString += data;
      }
    });
    proc.stderr.on('data', data => {
      errString += data.toString();
    });
    proc.on('error', err => {
      // TODO: Show notification
      onDone(err.replace(/\n$/, ''), '');
    });
    proc.on('close', (_code, _signal) => {
      onDone(errString.replace(/\n$/, ''), outString.replace(/\n$/, ''));
    });
    return proc;
  },

  getImports(code) {
    const regex = helper.importRegex();
    let imports = [];
    let match = regex.exec(code);
    while (match) {
      imports.push(match[0]);
      match = regex.exec(code);
    }
    return imports;
  },

  sendToRepl(proc, code, elmVersion) {
    proc.stdin.write(formatCode(code, elmVersion) + os.EOL);
  },
};

function formatCode(code, elmVersion) {
  const usingPre0_19ElmVersion = helper.isPre0_19ElmVersion(elmVersion);
  const scrubbedCode = code
    // Remove module definition.
    .replace(
      /^(?!-|{)(((effect |port |)module)\s+\S+)\s(\s*(.|\n)*?(?=\n^\S|$(?![\r\n])))/m,
      ''
    )
    // Remove type annotations.
    .replace(/^\S+\s+:.*(\n|$)/gm, '');
  if (usingPre0_19ElmVersion) {
    // Convert newline to backslash + newline.
    return scrubbedCode.replace(/\n/g, '\\\n');
  } else {
    return scrubbedCode;
  }
}
