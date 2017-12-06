'use babel';

import path from 'path';
import _ from 'underscore-plus';

export default {
  parseProblems(data, projectDirectory) {
    // Filter Haskell memory error messages (see https://ghc.haskell.org/trac/ghc/ticket/12495).
    data.stderr = data.stderr
      .split('\n')
      .filter(
        line =>
          line !==
          'elm-make-helper: unable to decommit memory: Invalid argument'
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
        return Object.assign(problem, { filePath });
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
