'use babel';

import { CompositeDisposable } from 'atom';
const SelectListView = require('atom-space-pen-views').SelectListView;
const Emitter = require('atom').Emitter;

export default class FindUnusedView extends SelectListView {
  constructor() {
    super();
  }

  initialize() {
    super.initialize();
    this.addClass('overlay elm-fu-find-unused');
    if (!this.panel) {
      this.panel = atom.workspace.addModalPanel({item: this, visible: false});
    }
    this.emitter = new Emitter();
  }

  destroy () {
    this.emitter.dispose();
    this.panel.destroy();
  }

  selectItemView(view) {
    super.selectItemView(view);
    const {moduleName, functionName} = this.getSelectedItem();
    this.emitter.emit('did-select', {projectDirectory: this.projectDirectory, moduleName, functionName});
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
    this.setLoading('Maybe Unused');
    this.storeFocusedElement();
    this.focusFilterEditor();
  }

  hide() {
    this.panel.hide();
    this.restoreFocus();
  }

  setSymbols(projectDirectory, symbols) {
    this.projectDirectory = projectDirectory;
    this.setItems(symbols.map((symbol) => {
      symbol.filterKey = symbol.moduleName + '.' + symbol.functionName;
      return symbol;
    }));
  }

  getFilterKey() {
    return 'filterKey';
  }

  viewForItem({moduleName, functionName}) {
    return `<li><span class="module-name">${moduleName}.</span><span class="function-name">${functionName}</span></li>`;
  }

  confirmed({moduleName, functionName}) {
    this.emitter.emit('did-confirm', {projectDirectory: this.projectDirectory, moduleName, functionName});
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
