'use babel';

import {CompositeDisposable} from 'atom';
import helper from './helper';

export default class HintTooltip {

  constructor(indexer, config) {
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.textEditors.observe((editor) => {
      if (helper.isElmEditor(editor)) {
        this.subscriptions.add(editor.onDidChangeCursorPosition(({cursor, newBufferPosition}) => {
          if (cursor !== editor.getLastCursor()) {
            return;
          }
          this.destroyTooltip();
        }));
        const editorView = atom.views.getView(editor);
        this.subscriptions.add(editorView.onDidChangeScrollTop(() => {
          this.destroyTooltip();
        }));
      }
    }));
    this.subscriptions.add(atom.workspace.observeActivePaneItem((item) => {
      if (!helper.isElmEditor(item)) {
        this.destroyTooltip();
      }
    }));
    indexer.ports.activeFileChangedCmd.subscribe((activeFile) => {
      this.activeFile = activeFile;
    });
    indexer.ports.activeHintsChangedCmd.subscribe((activeHints) => {
      this.destroyTooltip();
      const editor = atom.workspace.getActiveTextEditor();
      if (atom.config.get('elmjutsu.showTypesInTooltip')) {
        if (this.activeFile && helper.isElmEditor(editor)) {
          const text = activeHints.map((hint) => {
            const moduleName = hint.moduleName === '' || this.activeFile.filePath === hint.sourcePath ? '' : hint.moduleName + '.';
            const name = helper.isInfix(hint.name) ? '(' + hint.name + ')' : hint.name;
            const tipe = hint.tipe === '' ? (hint.args.length > 0 ? '<i>' + hint.args.join(' ') + '</i>' : '') : ': ' + hint.tipe;
            return moduleName + (name.trim().length > 0 ? '<b>' + name + '</b> ' : '') + tipe;
          }).join('<br>');
          if (text.trim().length > 0) {
            const editorView = atom.views.getView(editor);
            const targetElement = editorView.querySelector('.cursors .cursor');
            if (targetElement) {
              this.tooltip = atom.tooltips.add(targetElement, {
                title: text,
                trigger: 'manual',
                placement: 'auto top',
                class: 'elmjutsu-hint-tooltip',
                delay: {show: 0, hide: 0}
              });
            }
          }
        }
      }
    });
  }

  destroyTooltip() {
    if (this.tooltip) {
      this.tooltip.dispose();
      this.tooltip = null;
    }
  }

  destroy() {
    this.subscriptions.dispose();
    this.subscriptions = null;
    this.destroyTooltip();
  }

}
