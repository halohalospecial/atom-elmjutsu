'use babel';

import { Emitter } from 'atom';
import helper from './helper';
import Elm from '../elm/indexer';

export default class IndexerWorker {
  constructor() {
    this.emitter = new Emitter();
    helper.getIndexerCmds().forEach(message => {
      this[
        'on' + message.charAt(0).toUpperCase() + message.slice(1)
      ] = callback => {
        return this.emitter.on(message, callback);
      };
    });
    helper.getIndexerSubs().forEach(message => {
      this[message] = data => {
        this.indexer.ports[message + 'Sub'].send(data);
      };
    });
  }

  destroy() {
    // TODO: Unmount Elm.
  }

  start(data) {
    this.indexer = Elm.Indexer.worker();
    this.indexer.ports.configChangedSub.send(data);
    helper.getIndexerCmds().forEach(message => {
      this.indexer.ports[message + 'Cmd'].subscribe(data => {
        this.emitter.emit(message, data);
      });
    });
  }
}
