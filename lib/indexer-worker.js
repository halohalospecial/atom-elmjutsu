'use babel';

import { Emitter } from 'atom';
import helper from './helper';
import Elm from '../elm/indexer';

export default class IndexerWorker {
  constructor() {
    this.emitter = new Emitter();
    helper.getIndexerMessageTypes().forEach(message => {
      this[
        'on' + message.charAt(0).toUpperCase() + message.slice(1)
      ] = callback => {
        return this.emitter.on(message, callback);
      };
    });
  }

  destroy() {
    // TODO: Unmount Elm.
  }

  onmessage({ type, data }) {
    this.emitter.emit(type, data);
  }

  postMessage({ type, data }) {
    switch (type) {
      case 'start':
        this.indexer = Elm.Indexer.worker();
        this.indexer.ports.configChangedSub.send(data);
        helper.getIndexerMessageTypes().forEach(message => {
          this.indexer.ports[message + 'Cmd'].subscribe(data => {
            this.onmessage({
              type: message,
              data,
            });
          });
        });
        break;

      case 'docsRead':
        this.indexer.ports.docsReadSub.send(data);
        break;

      case 'downloadMissingPackageDocs':
        this.indexer.ports.downloadMissingPackageDocsSub.send(data);
        break;

      case 'configChanged':
        this.indexer.ports.configChangedSub.send(data);
        break;

      case 'fileContentsChanged':
        this.indexer.ports.fileContentsChangedSub.send(data);
        break;

      case 'fileContentsRemoved':
        this.indexer.ports.fileContentsRemovedSub.send(data);
        break;

      case 'activeFileChanged':
        this.indexer.ports.activeFileChangedSub.send(data);
        break;

      case 'clearLocalHintsCache':
        this.indexer.ports.clearLocalHintsCacheSub.send(data);
        break;

      case 'activeTokenChanged':
        this.indexer.ports.activeTokenChangedSub.send(data);
        break;

      case 'inferenceEntered':
        this.indexer.ports.inferenceEnteredSub.send(data);
        break;

      case 'projectDependenciesChanged':
        this.indexer.ports.projectDependenciesChangedSub.send(data);
        break;

      case 'addImport':
        this.indexer.ports.addImportSub.send(data);
        break;

      case 'showAddImportView':
        this.indexer.ports.showAddImportViewSub.send(data);
        break;

      case 'getSuggestionsForImport':
        this.indexer.ports.getSuggestionsForImportSub.send(data);
        break;

      case 'getHintsForPartial':
        this.indexer.ports.getHintsForPartialSub.send(data);
        break;

      case 'constructFromTypeAnnotation':
        this.indexer.ports.constructFromTypeAnnotationSub.send(data);
        break;

      case 'constructCaseOf':
        this.indexer.ports.constructCaseOfSub.send(data);
        break;

      case 'constructDefaultArguments':
        this.indexer.ports.constructDefaultArgumentsSub.send(data);
        break;

      case 'constructDefaultValueForType':
        this.indexer.ports.constructDefaultValueForTypeSub.send(data);
        break;

      case 'getAliasesOfType':
        this.indexer.ports.getAliasesOfTypeSub.send(data);
        break;

      case 'goToDefinition':
        this.indexer.ports.goToDefinitionSub.send(data);
        break;

      case 'showGoToSymbolView':
        this.indexer.ports.showGoToSymbolViewSub.send(data);
        break;

      case 'askCanGoToDefinition':
        this.indexer.ports.askCanGoToDefinitionSub.send(data);
        break;

      case 'getImportersForToken':
        this.indexer.ports.getImportersForTokenSub.send(data);
        break;

      case 'getTokenInfo':
        this.indexer.ports.getTokenInfoSub.send(data);
        break;
    }
  }
}
