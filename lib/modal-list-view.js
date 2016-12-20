'use babel';

import {Emitter} from 'atom';
import {SelectListView} from 'atom-space-pen-views';

export default class ModalListView extends SelectListView {

  constructor() {
    super();
  }

  initialize() {
    super.initialize();
    if (!this.panel) {
      this.panel = atom.workspace.addModalPanel({item: this, visible: false});
    }
    this.emitter = new Emitter();
  }

  destroy () {
    this.emitter.dispose();
    this.emitter = null;
    this.panel.destroy();
    this.panel = null;
  }

  selectItemView(view) {
    super.selectItemView(view);
    this.emitter.emit('did-select', {item: this.getSelectedItem()});
  }

  onDidConfirm(fn) {
    this.emitter.on('did-confirm', fn);
  }

  onDidCancel(fn) {
    this.emitter.on('did-cancel', fn);
  }

  onDidSelect(fn) {
    this.emitter.on('did-select', fn);
  }

  show() {
    this.showing = true;
    this.panel.show();
    this.setLoading('Loading...');
    this.storeFocusedElement();
    this.focusFilterEditor();
  }

  hide() {
    this.panel.hide();
    this.restoreFocus();
  }

  getFilterKey() {
    return 'filterKey';
  }

  confirmed(item) {
    this.emitter.emit('did-confirm', {item});
    this.panel.hide();
    this.showing = false;
  }

  cancelled(item) {
    if (this.showing) {
      this.emitter.emit('did-cancel', null);
      this.showing = false;
    }
    this.panel.hide();
  }
}
