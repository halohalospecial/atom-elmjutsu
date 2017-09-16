'use babel';

import {Range} from 'atom';
import _ from 'underscore-plus';
import indexing from './indexing';
import helper from './helper';

export default class Datatip {

  constructor(indexer) {
    this.indexer = indexer;
    this.activeFile = null;
    this.activeTokenHints = null;
    this.indexer.ports.activeFileChangedCmd.subscribe((activeFile) => {
      this.activeFile = activeFile;
    });
    this.indexer.ports.activeTokenHintsChangedCmd.subscribe((activeTokenHints) => {
      this.activeTokenHints = activeTokenHints;
    });
  }

  destroy() {
  }

  setDatatipService(datatipService) {
    const self = this;
    datatipService.addProvider({
      priority: 1,
      grammarScopes: ['source.elm'],
      providerName: 'Elmjutsu',
      datatip: (editor, bufferPosition) => {
        return new Promise((resolve) => {
          if (!atom.config.get('elmjutsu.datatipsEnabled')) {
            return resolve();
          }
          const scopeDescriptor = editor.scopeDescriptorForBufferPosition(bufferPosition);
          if (helper.isScopeAString(scopeDescriptor) || helper.isScopeAComment(scopeDescriptor)) {
            return resolve();
          } else {
            const range = helper.getTokenRange(bufferPosition, editor);
            if (!range) {
              return resolve();
            }
            indexing.sendTokenAtRange(self.indexer, editor, range);
            setTimeout(() => {
              if (!self.activeTokenHints || self.activeTokenHints.length === 0) {
                resolve();
              } else {
                const markedStrings = _.flatten(self.activeTokenHints.map((hint) => {
                  const moduleName = hint.moduleName === '' || self.activeFile.filePath === hint.sourcePath ? '' : hint.moduleName + '.';
                  const name = hint.name === helper.holeToken() ? hint.name : (helper.isInfix(hint.name) ? '(' + hint.name + ')' : hint.name);
                  const tipe = hint.tipe === '' ? (hint.args.length > 0 ? hint.args.join(' ') : '') : (name !== '' ? ': ' + hint.tipe : hint.tipe);
                  const aliasesOfTipe = atom.config.get('elmjutsu.showAliasesOfTypesInTooltip') ? hint.tipeAliases.map((tipeAlias) => { return " a.k.a. " + tipeAlias; }).join('') : '';
                  let maybeTypeCases = '';
                  if (atom.config.get('elmjutsu.showTypeCasesInSidekick') && hint.cases.length > 0) {
                    const headCase = _.first(hint.cases);
                    const tailCases = _.rest(hint.cases);
                    maybeTypeCases = '\n\n= ' + caseToString(headCase) + '\n' + tailCases.map((kase) => { return '| ' + caseToString(kase); }).join('\n') + (tailCases.length > 0 ? '\n' : '');
                  }
                  const typeSignature = moduleName + (name.trim().length > 0 ? name + ' ' : '') + tipe + aliasesOfTipe;
                  let datatips = [{
                    type: 'snippet',
                    grammar: atom.grammars.grammarForScopeName('source.elm'),
                    value: typeSignature + maybeTypeCases
                  }];
                  let markdownItems = [];
                  if (atom.config.get('elmjutsu.showDocCommentsInSidekick')) {
                    markdownItems.push(hint.comment);
                  }
                  if (atom.config.get('elmjutsu.showAssociativitiesInSidekick') && hint.associativity) {
                    markdownItems.push('Associativity: ' + hint.associativity);
                  }
                  if (atom.config.get('elmjutsu.showPrecedencesInSidekick') && hint.precedence) {
                    markdownItems.push('Precedence: ' + hint.precedence);
                  }
                  if (markdownItems.length > 0) {
                    datatips.push({
                      type: 'markdown',
                      value: markdownItems.join('\n- ')
                    });
                  }
                  return datatips;
                }));
                resolve({
                  markedStrings,
                  range,
                  pinnable: true
                });
              }
            }, 0);
          }
        });
      }
    });
  }

}

function caseToString({name, args}) {
  if (args.length > 0) {
    return name + ' ' + args.join(' ');
  }
  return name;
}
