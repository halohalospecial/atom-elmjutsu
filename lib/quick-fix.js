'use babel';

export default class QuickFix {
  constructor() {
    this.fixes = [];
  }
  computeFixes(issues) {
    this.fixes = [];
    let regex;
    let match;
    issues.forEach(({ message, range }) => {
      for (let i = message.length - 1; i > 0; --i) {
        regex = /These\snames\sseem\sclose\sthough:/;
        match = message[i].match && message[i].match(regex);
        if (match) {
          // Parse suggestions.
          for (let j = i + 1; j < message.length; ++j) {
            if (
              message[j].string &&
              message[j].string === 'Hint' &&
              message[j].underline
            ) {
              break; // for j
            } else if (message[j].string) {
              this.fixes.push({
                type: 'Replace with',
                text: message[j].string,
                range,
              });
            }
          }
          break; // for i
        }
      }
    });
  }
  getFixesForRange(editor, range) {
    return this.fixes.filter(issue => {
      return issue.range.isEqual(range);
    });
  }
  getCodeActions(editor, range) {
    const self = this;
    return new Promise(resolve => {
      if (!atom.config.get('elmjutsu.codeActionsEnabled')) {
        return resolve([]);
      }
      const fixes = self.getFixesForRange(editor, range);
      if (fixes.length === 0) {
        return resolve([]);
      }
      const codeActions = fixes.map(fix => {
        return {
          apply: () => {
            return new Promise(resolve => {
              const prevActivePane = atom.workspace.getActivePane();
              fixProblem(editor, range, fix);
              prevActivePane.activate();
              return resolve();
            });
          },
          getTitle: () => {
            return new Promise(resolve => {
              return resolve(fix.type + ': ' + fix.text);
            });
          },
          dispose: () => {},
        };
      });
      return resolve(codeActions);
    });
  }
}

function fixProblem(editor, range, fix) {
  switch (fix.type) {
    case 'Replace with':
      editor.setTextInBufferRange(fix.range ? fix.range : range, fix.text);
      break;
  }
}
