'use babel';

import path from 'path';
import _ from 'underscore-plus';

export default {
  parseProblems(data, projectDirectory, elmVersion) {
    // Filter Haskell memory error messages (see https://ghc.haskell.org/trac/ghc/ticket/12495).
    data.stderr = data.stderr
      .split('\n')
      .filter(
        line =>
          ![
            'elm-make: unable to decommit memory: Invalid argument',
            'elm: unable to decommit memory: Invalid argument',
          ].includes(line)
      )
      .join('\n');
    let result;
    try {
      result = JSON.parse(data.stderr);
    } catch (e) {
      return [];
    }
    if (result.type === 'compile-errors') {
      return _.flatten(
        result.errors.map(error => {
          return error.problems.map(problem => {
            let filePath = error.path;
            if (error.path.startsWith('.' + path.sep)) {
              // `error.path` has a relative path (e.g. `././A.elm`) . Convert to absolute.
              filePath = path.join(
                projectDirectory,
                path.normalize(error.path)
              );
            }
            return Object.assign(problem, { filePath, elmVersion });
          });
        })
      );
    }
    return [];
  },

  parseProblemsPre0_19(data, projectDirectory) {
    // Filter Haskell memory error messages (see https://ghc.haskell.org/trac/ghc/ticket/12495).
    data.stderr = data.stderr
      .split('\n')
      .filter(
        line =>
          ![
            'elm-make: unable to decommit memory: Invalid argument',
            'elm: unable to decommit memory: Invalid argument',
          ].includes(line)
      )
      .join('\n');

    if (data.stderr !== '') {
      return [];
    }

    return data.stdout.split('\n').map(line => {
      let json = (() => {
        try {
          return JSON.parse(line);
        } catch (error) {}
      })();
      if (!json) {
        return [];
      }
      return json.map(problem => {
        let filePath = problem.file;
        if (problem.file.startsWith('.' + path.sep)) {
          // `problem.file` has a relative path (e.g. `././A.elm`) . Convert to absolute.
          filePath = path.join(projectDirectory, path.normalize(problem.file));
        }
        return Object.assign(problem, { filePath, elmVersion: '0.18.0' });
      });
    });
  },

  // Returns `[errors, warnings]`.
  getErrorsAndWarnings(problems) {
    return _.partition(_.flatten(problems), ({ type }) => {
      return type === 'error';
    });
  },
};
