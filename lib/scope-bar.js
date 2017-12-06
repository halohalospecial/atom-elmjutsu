'use babel';

import { CompositeDisposable } from 'atom';
import helper from './helper';

export default class ScopeBar {
  constructor() {
    this.div = document.createElement('div');
    const options = {
      item: this.div,
      visible: true,
    };
    this.panel = atom.workspace.addBottomPanel(options);
    this.debouncer = null;

    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(
      atom.config.observe('elmjutsu.showScopeBar', showScopeBar => {
        if (this.editorSubscriptions) {
          this.editorSubscriptions.dispose();
          this.editorSubscriptions = null;
        }
        if (showScopeBar) {
          this.editorSubscriptions = new CompositeDisposable();
          this.subscriptions.add(this.editorSubscriptions);
          this.editorSubscriptions.add(
            atom.textEditors.observe(editor => {
              if (helper.isElmEditor(editor)) {
                this.editorSubscriptions.add(
                  editor.onDidChangeCursorPosition(({ cursor }) => {
                    if (cursor !== editor.getLastCursor()) {
                      return;
                    }
                    if (this.debouncer) {
                      clearTimeout(this.debouncer);
                    }
                    this.debouncer = setTimeout(() => {
                      this.setText(helper.getActiveTopLevel(editor));
                    }, 300);
                  })
                );
              }
            })
          );
          this.editorSubscriptions.add(
            atom.workspace.observeActivePaneItem(item => {
              if (helper.isElmEditor(item)) {
                this.setText(helper.getActiveTopLevel(item));
              } else {
                this.setText('');
              }
            })
          );
        }
      })
    );
  }

  setText(text) {
    this.div.textContent = text;
  }

  destroy() {
    if (this.debouncer) {
      clearTimeout(this.debouncer);
      this.debouncer = null;
    }
    this.subscriptions.dispose();
    this.subscriptions = null;
  }
}
