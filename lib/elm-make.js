'use babel';

import childProcess from 'child_process';
import path from 'path';
import { renderToStaticMarkup } from 'react-dom/server';
import _ from 'underscore-plus';
import { Range } from 'atom';
import formatting from './formatting';
import helper from './helper';

export default class ElmMake {
  constructor(quickFix) {
    this.quickFix = quickFix;
  }
  compile(editor) {
    const self = this;
    if (atom.config.get('elmjutsu.runElmMake') === 'never') {
      return null;
    }
    const filePath = editor.getPath();
    if (!filePath) {
      return [];
    }
    return new Promise(resolve => {
      const projectDirectory = helper.getProjectDirectory(filePath);
      const outputPath = '/dev/null';
      const args = [
        atom.config.get('elmjutsu.elmExecPath'),
        'make',
        '--report=json',
        '--output=' + outputPath,
        filePath,
      ];
      const elmMakeProcess = childProcess.exec(args.join(' '), {
        cwd: path.dirname(filePath),
      });
      const stderr = [];
      elmMakeProcess.stderr.on('data', data => {
        if (data) {
          stderr.push(data);
        }
      });
      elmMakeProcess.on('error', err => {
        atom.notifications.addError('Elm make error', {
          detail: err.toString(),
          dismissable: true,
        });
      });
      elmMakeProcess.on('close', (code, signal) => {
        // console.log('stderr', stderr.join('')); // // //
        if (stderr.length > 0) {
          let result;
          try {
            result = JSON.parse(stderr.join(''));
          } catch (e) {
            atom.notifications.addError('Elm make error', {
              detail:
                'Error parsing output. Please check the value of `Elm Path` in the Settings view.',
              dismissable: true,
            });
            return resolve([]);
          }
          if (result.type === 'compile-errors') {
            const issues = _.flatten(
              result.errors.map(error => {
                return error.problems.map(problem => {
                  // const title = result.title;
                  const range = new Range(
                    [
                      problem.region.start.line - 1,
                      problem.region.start.column - 1,
                    ],
                    [problem.region.end.line - 1, problem.region.end.column - 1]
                  );
                  return formatIssue(error.path, problem.message, range);
                });
              })
            );
            self.quickFix.computeFixes(
              _.flatten(
                result.errors.map(error => {
                  return error.problems.map(problem => {
                    const range = new Range(
                      [
                        problem.region.start.line - 1,
                        problem.region.start.column - 1,
                      ],
                      [
                        problem.region.end.line - 1,
                        problem.region.end.column - 1,
                      ]
                    );
                    return {
                      filePath: error.path,
                      message: problem.message,
                      range,
                    };
                  });
                })
              )
            );
            return resolve(issues);
          } else if (result.type === 'error') {
            // const title = result.title;
            const range = new Range([0, 0], [0, 0]);
            self.quickFix.computeFixes([
              {
                filePath: result.path,
                message: result.message,
                range,
              },
            ]);
            return resolve([formatIssue(filePath, result.message, range)]);
          }
        }
        self.quickFix.computeFixes([]);
        return resolve([]);
      });
    });
  }
}

function formatIssue(filePath, message, range) {
  const jsx = formatting.formatMessage(message);
  if (range.isEmpty()) {
    range = range.translate([0, 0], [0, 1]);
  }
  return {
    type: 'error',
    html: renderToStaticMarkup(jsx),
    filePath,
    range,
  };
}
