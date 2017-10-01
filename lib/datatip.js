'use babel';

import { CompositeDisposable } from 'atom';
import datatipView from './datatip-view';
import indexing from './indexing';
const tokenInfoProvider = require('./token-info-provider');
import helper from './helper';

export default class Datatip {
  constructor(indexer, storeJumpPointFunction) {
    this.indexer = indexer;
    this.storeJumpPointFunction = storeJumpPointFunction;
    this.getTokenInfoFunction = tokenInfoProvider.provide(indexer);
    this.subscriptions = new CompositeDisposable();
    this.activeFile = null;
    this.activeTokenHints = null;
    this.indexer.onActiveFileChanged(activeFile => {
      this.activeFile = activeFile;
    });
    this.indexer.onActiveTokenHintsChanged(
      ([activeToken, activeTokenHints]) => {
        this.activeTokenHints = activeTokenHints;
      }
    );
  }

  destroy() {
    this.subscriptions.dispose();
    this.subscriptions = null;
  }

  setDatatipService(datatipService, getInferenceAtPosition) {
    const self = this;
    this.datatipService = datatipService;
    this.subscriptions.add(
      datatipService.addProvider({
        grammarScopes: ['source.elm'],
        providerName: 'elmjutsu',
        priority: Number.MAX_SAFE_INTEGER - 1, // linter-elm-make's priority is higher.
        datatip: (editor, bufferPosition) => {
          return new Promise(resolve => {
            if (!atom.config.get('elmjutsu.datatipsEnabled')) {
              return resolve();
            }
            const scopeDescriptor = editor.scopeDescriptorForBufferPosition(
              bufferPosition
            );
            if (
              helper.isScopeAString(scopeDescriptor) ||
              helper.isScopeAComment(scopeDescriptor)
            ) {
              return resolve();
            } else {
              const range = helper.getTokenRange(bufferPosition, editor);
              if (!range) {
                return resolve();
              }
              const activeTopLevel = helper.getActiveTopLevel(editor);
              const token = editor.getTextInBufferRange(range);
              indexing.sendToken(self.indexer, editor, range.start, token);
              setTimeout(() => {
                const inference = getInferenceAtPosition(
                  editor,
                  null,
                  bufferPosition
                );
                if (inference && inference.tipe) {
                  resolve({
                    markedStrings: [
                      {
                        type: 'markdown',
                        value: helper.unknownName() + ' : ' + inference.tipe,
                      },
                    ],
                    range,
                    pinnable: true,
                  });
                } else {
                  if (!self.activeTokenHints) {
                    resolve();
                  } else {
                    const activeTokenHints = self.activeTokenHints.filter(
                      ({ name }) => {
                        return name.trim().length > 0;
                      }
                    );
                    if (activeTokenHints.length === 0) {
                      resolve();
                    } else {
                      const goToDefinitionFunction = otherToken => {
                        self.storeJumpPointFunction();
                        self.indexer.postMessage({
                          type: 'goToDefinition',
                          data: [activeTopLevel, otherToken || token],
                        });
                      };
                      const getTokenInfoFunction = token => {
                        if (self.activeFile) {
                          self.getTokenInfoFunction(
                            self.activeFile.filePath,
                            bufferPosition,
                            token
                          );
                        }
                      };
                      const activeTokenHintsWithTypeHints = activeTokenHints.map(
                        hint => {
                          hint.typeInfo = getHintTypeInfo(
                            hint,
                            self.activeFile
                          );
                          return hint;
                        }
                      );
                      setTimeout(() => {
                        resolve({
                          component: datatipView.create(
                            activeTokenHintsWithTypeHints,
                            self.activeFile,
                            getTokenInfoFunction,
                            goToDefinitionFunction
                          ),
                          range,
                          pinnable: true,
                        });
                      });
                    }
                  }
                }
              }, 0);
            }
          });
        },
      })
    );
  }
}

function goToDefinition(indexer, activeTopLevel, name) {
  indexer.postMessage({
    type: 'goToDefinition',
    data: [activeTopLevel, name],
  });
}

function getHintTypeInfo(hint, activeFile) {
  if (atom.config.get('elmjutsu.showTypesInSidekick')) {
    const maybeModuleName =
      hint.moduleName === '' || activeFile.filePath === hint.sourcePath
        ? ''
        : hint.moduleName + '.';
    const name =
      hint.name === helper.holeToken()
        ? hint.name
        : helper.isInfix(hint.name) ? '(' + hint.name + ')' : hint.name;
    const maybeName = name.trim().length > 0 ? name : '';
    const maybeArgs =
      hint.tipe === ''
        ? hint.args.length > 0 ? ' ' + hint.args.join(' ') : ''
        : '';
    const maybeTipe =
      hint.tipe === '' ? '' : name !== '' ? ' : ' + hint.tipe : hint.tipe;
    const maybeAliasesOfType = atom.config.get(
      'elmjutsu.showAliasesOfTypesInTooltip'
    )
      ? hint.aliasesOfTipe
          .map(tipeAlias => {
            return ' *a.k.a.* ' + tipeAlias;
          })
          .join('')
      : '';
    return {
      maybeModuleName,
      maybeName,
      maybeArgs,
      maybeTipe,
      maybeAliasesOfType,
    };
  }
  return {
    maybeModuleName: '',
    maybeName: '',
    maybeTipe: '',
    maybeArgs: '',
    maybeAliasesOfType: '',
  };
}
