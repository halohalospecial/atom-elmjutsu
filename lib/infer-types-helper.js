'use babel';

import helper from './helper';

export default {
  getInferredTypeFromProblem(problem) {
    if (helper.isPre0_19ElmVersion(problem.elmVersion)) {
      return this.getInferredTypeFromProblemPre0_19(problem);
    }
    const message = problem.message;
    let matches;
    const checks = [
      [
        /^The .+ argument to `.+` is not what I expect:/,
        /(This `.+` value is a:)|(But `.+` needs the .+ argument to be:)/,
      ],
      [
        /^The .+ argument to `.+` is not what I expect:/,
        /(The value at .+ is a:)|(But `.+` needs the .+ argument to be:)/,
      ],
      [
        /^The .+ argument to `.+` is not what I expect:/,
        /(This argument is a record of type:)|(But `.+` needs the 1st argument to be:)/,
      ],
      [
        /^Something is off with the body of the `.+` definition:/,
        /(But the type annotation on `.+` says it should be:)|(The body is a tuple of type:)/,
      ],
      [
        /^The .+ argument to `.+` is not what I expect:/,
        /(This `.+` call produces:)|(But `.+` needs the .+ argument to be:)/,
      ],
      [
        /^Something is off with the .+ branch of this `.+` expression:/,
        /(The .+ branch is a tuple of type:)|(But the type annotation on `.+` says it should be:)/,
      ],
      [
        /^Something is off with the body of the `.+` definition:/,
        /(This `.+` call produces:)|(But the type annotation on `.+` says it should be:)/,
      ],
      [
        /^The .+ branch of this `.+` does not match all the previous branches:/,
        /(This `.+` call produces:)|(But all the previous branches result in:)/,
      ],
      [
        /The .+ branch of this `.+` does not match all the previous branches:/,
        /(This `.+` value is a:)|(But all the previous branches result in:)/,
      ],
      [
        /The .+ branch of this `.+` does not match all the previous branches:/,
        /(The .+ branch is a .+ of type:)|(But all the previous branches result in:)/,
      ],
      [
        /The .+ branch of this `.+` does not match all the previous branches:/,
        /(The .+ branch is:)|(But all the previous branches result in:)/,
      ],
      [
        /^I cannot update the `.+` field like this:/,
        /(This `.+` value is a:)|(But it should be:)/,
      ],
      [
        /^The .+ element of this list does not match all the previous elements:/,
        /(This `.+` value is a:)|(But all the previous elements in the list are:)/,
      ],
      [
        /^The \(\+\+\) operator cannot append these two values:/,
        /(I already figured out that the left side of \(\+\+\) is:)|(This `.+` value is a:)/,
      ],
      [
        /I need both sides of .+ to be the same type:/,
        /(The left side of .+ is:)|(But the right side is:)/,
      ],
    ];
    for (let check of checks) {
      matches = message[0].match(check[0]);
      if (matches) {
        const type = this.findTypeInMessage(message, check[1]);
        if (type) {
          return this.formatType(type);
        }
      }
    }
    return null;
  },

  getInferredTypeFromProblemPre0_19(problem) {
    let regex;
    let matches;
    regex = /^(.+) is expecting the left argument to be a:\n\n((?:.|\n)+)\n\nBut the left argument is:\n\n((?:.|\n)+)/;
    matches = problem.details.match(regex);
    if (matches && matches.length > 3) {
      if (this.isDummyType(matches[3].split('\n\n')[0])) {
        return this.formatType(matches[2]);
      } else if (this.isDummyType(matches[2])) {
        return this.formatType(matches[3].split('\n\n')[0]);
      }
    }
    regex = /(.+) is expecting the right side to be a:\n\n((?:.|\n)+)\n\nBut the right side is:\n\n((?:.|\n)+)/;
    matches = problem.details.match(regex);
    if (matches && matches.length > 3) {
      if (this.isDummyType(matches[3].split('\n\n')[0])) {
        return this.formatType(matches[2]);
      } else if (this.isDummyType(matches[2])) {
        return this.formatType(matches[3].split('\n\n')[0]);
      }
    }
    regex = /^Function `(.+)`\sis\sexpecting\sthe\s(.+)\sargument\sto\sbe:\n\n((?:.|\n)+)\n\nBut it is:\n\n((?:.|\n)+)/;
    matches = problem.details.match(regex);
    if (matches && matches.length > 4) {
      if (this.isDummyType(matches[4].split('\n\n')[0])) {
        return this.formatType(matches[3]);
      } else if (this.isDummyType(matches[3])) {
        return this.formatType(matches[4].split('\n\n')[0]);
      }
    }
    regex = /^Function `(.+)`\sis\sexpecting\sthe\sargument\sto\sbe:\n\n((?:.|\n)+)\n\nBut it is:\n\n((?:.|\n)+)/;
    matches = problem.details.match(regex);
    if (matches && matches.length > 3) {
      if (this.isDummyType(matches[3].split('\n\n')[0])) {
        return this.formatType(matches[2]);
      } else if (this.isDummyType(matches[2])) {
        return this.formatType(matches[3].split('\n\n')[0]);
      }
    }
    regex = /^The (.+) branch has this type:\n\n((?:.|\n)+)\n\nBut the (.+) is:\n\n((?:.|\n)+)/;
    matches = problem.details.match(regex);
    if (matches && matches.length > 4) {
      if (this.isDummyType(matches[4].split('\n\n')[0])) {
        return this.formatType(matches[2]);
      } else if (this.isDummyType(matches[2])) {
        return this.formatType(matches[4].split('\n\n')[0]);
      }
    }
    regex = /^The type annotation for `(.+)` says it always returns:\n\n((?:.|\n)+)\n\nBut the returned value \(shown above\) is a:\n\n((?:.|\n)+)/;
    matches = problem.details.match(regex);
    if (matches && matches.length > 3) {
      if (this.isDummyType(matches[3].split('\n\n')[0])) {
        return this.formatType(matches[2]);
      } else if (this.isDummyType(matches[2])) {
        return this.formatType(matches[3].split('\n\n')[0]);
      }
    }
    regex = /^The type annotation for `(.+)` says it is a:\n\n((?:.|\n)+)\n\nBut the definition \(shown above\) is a:\n\n((?:.|\n)+)/;
    matches = problem.details.match(regex);
    if (matches && matches.length > 3) {
      if (this.isDummyType(matches[3].split('\n\n')[0])) {
        return this.formatType(matches[2]);
      } else if (this.isDummyType(matches[2])) {
        return this.formatType(matches[3].split('\n\n')[0]);
      }
    }
    regex = /^The pattern matches things of type:\n\n((?:.|\n)+)\n\nBut the values it will actually be trying to match are:\n\n((?:.|\n)+)/;
    matches = problem.details.match(regex);
    if (matches && matches.length > 2) {
      if (this.isDummyType(matches[1].split('\n\n')[0])) {
        return this.formatType(matches[2]);
      } else if (this.isDummyType(matches[2])) {
        return this.formatType(matches[1].split('\n\n')[0]);
      }
    }
    regex = /^The anonymous function has type:\n\n((?:.|\n)+)\n\nBut you are trying to use it as:\n\n((?:.|\n)+)/;
    matches = problem.details.match(regex);
    if (matches && matches.length > 2) {
      if (this.isDummyType(matches[2].split('\n\n')[0])) {
        return this.formatType(matches[1]);
      } else if (this.isDummyType(matches[1])) {
        return this.formatType(matches[2].split('\n\n')[0]);
      }
    }
    return null;
  },

  findTypeInMessage(message, regex) {
    let tempType = null;
    let foundDummyType = false;
    for (let i = message.length - 1; i > 0; --i) {
      matches = message[i].match && message[i].match(regex);
      if (matches) {
        const type = message[i + 1].string;
        if (type === this.dummyType()) {
          if (tempType) {
            return tempType;
          } else {
            foundDummyType = true;
          }
        } else {
          if (foundDummyType) {
            return type;
          } else {
            tempType = type;
          }
        }
      }
    }
    return null;
  },

  formatType(type) {
    // TODO: Handle type variables beyond `z`.
    let letters = 'abcdefghijklmnopqrstuvwxyz'.split('');
    const typeVariablesRegex = /\b([a-z]+)\b/g;
    let match = typeVariablesRegex.exec(type);
    while (match) {
      const name = match[1];
      let index = letters.indexOf(name);
      if (index != -1) {
        letters.splice(index, 1);
      }
      match = typeVariablesRegex.exec(type);
    }
    const typeVariableName = letters.length > 0 ? letters[0] : 'something';
    return type
      .trim()
      .replace(
        new RegExp('(\\b)(' + this.dummyType() + ')(\\b)', 'g'),
        '$1' + typeVariableName + '$3'
      );
  },

  isDummyType(aType) {
    return aType.trim().indexOf(this.dummyType()) > -1;
  },

  dummyType() {
    return 'Elmjutsu_DuMmY_tYp3_';
  },

  dummyVariable() {
    return 'elmjutsu_dUmMy_VaR1AbL3_';
  },

  dummyFunction() {
    return 'elmjutsu_duMMy_fuNct10n_';
  },

  dummyModule() {
    return 'ElmjutsuDuMmYM0dul3';
  },
};
