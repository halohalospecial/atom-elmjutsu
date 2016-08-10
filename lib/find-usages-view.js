'use babel';

import {CompositeDisposable, Emitter} from 'atom';
import {SelectListView} from 'atom-space-pen-views';

export default class FindUsagesView extends SelectListView {
  constructor() {
    super();
  }

  initialize() {
    super.initialize();
    this.addClass('overlay elmjutsu-find-usages');
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
    const {moduleName, functionName, index} = this.getSelectedItem();
    this.emitter.emit('did-select', {projectDirectory: this.projectDirectory, rangeText: this.rangeText, moduleName, functionName, index});
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
    this.setLoading('Maybe Usages');
    this.storeFocusedElement();
    this.focusFilterEditor();
  }

  hide() {
    this.panel.hide();
    this.restoreFocus();
  }

  setCallers(projectDirectory, rangeText, callers) {
    this.projectDirectory = projectDirectory;
    this.rangeText = rangeText;
    this.setItems(callers.map((caller) => {
      caller.filterKey = caller.moduleName + '.' + caller.functionName;
      return caller;
    }));
  }

  getFilterKey() {
    return 'filterKey';
  }

  viewForItem({moduleName, functionName, index}) {
    return `<li><span class="module-name">${moduleName}.</span><span class="function-name">${functionName}</span><span class="index">${index + 1}</span></li>`;
  }

  confirmed({moduleName, functionName, index}) {
    this.emitter.emit('did-confirm', {projectDirectory: this.projectDirectory, rangeText: this.rangeText, moduleName, functionName, index});
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
