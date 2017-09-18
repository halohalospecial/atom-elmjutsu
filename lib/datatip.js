'use babel';

import {Range} from 'atom';
import datatipView from './datatip-view';
import indexing from './indexing';
import helper from './helper';

export default class Datatip {

  constructor(indexer, storeJumpPointFunction) {
    this.indexer = indexer;
    this.storeJumpPointFunction = storeJumpPointFunction;
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

  setDatatipService(datatipService, getInferenceAtPosition) {
    const self = this;
    datatipService.addProvider({
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
            const activeTopLevel = helper.getActiveTopLevel(editor);
            const token = editor.getTextInBufferRange(range);
            indexing.sendToken(self.indexer, editor, range, token);
            setTimeout(() => {
              const inference = getInferenceAtPosition(editor, null, bufferPosition);
              if (inference && inference.tipe) {
                resolve({
                  markedStrings: [{
                    type: 'markdown',
                    value: helper.unknownName() + ' : ' + inference.tipe
                  }],
                  range,
                  pinnable: true
                });
              } else {
                const activeTokenHints = self.activeTokenHints.filter(({name}) => { return name.trim().length > 0; });
                if (!activeTokenHints || activeTokenHints.length === 0) {
                  resolve();
                } else {
                  const goToDefinitionFunction = () => {
                    self.storeJumpPointFunction();
                    self.indexer.ports.goToDefinitionSub.send([activeTopLevel, token]);
                  };
                  resolve({
                    component: datatipView.create(activeTokenHints, self.activeFile, goToDefinitionFunction),
                    range,
                    pinnable: true
                  });
                }
              }
            }, 0);
          }
        });
      }
    });
  }

}

function goToDefinition(indexer, activeTopLevel, name) {
  indexer.ports.goToDefinitionSub.send([activeTopLevel, name]);
}
