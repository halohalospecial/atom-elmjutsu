'use babel';

import { Emitter, CompositeDisposable } from 'atom';

export default class SetCompileOutputPathView {
  constructor() {
    this.element = document.createElement('div');
    this.element.classList.add('elmjutsu', 'set-compile-output-path');

    const notes = document.createElement('div');
    notes.classList.add('notes');
    notes.appendChild(document.createTextNode('Paths are relative to '));
    const code = document.createElement('code');
    code.innerText = 'elm.json';
    notes.appendChild(code);
    notes.appendChild(document.createTextNode('.'));
    this.element.appendChild(notes);

    this.editorView = document.createElement('atom-text-editor');
    this.editorView.classList.add(
      'atom-text-editor',
      'elmjutsu-set-compile-output-path'
    );
    this.element.appendChild(this.editorView);
    this.editor = this.editorView.getModel();
    this.editor.setMini(true);

    this.modalPanel = atom.workspace.addModalPanel({
      item: this.element,
      visible: false,
    });

    this.emitter = new Emitter();
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(
      atom.commands.add('atom-text-editor.elmjutsu-set-compile-output-path', {
        'elmjutsu:cancel-set-compile-output-path': this.hide.bind(this), // escape
        'elmjutsu:confirm-set-compile-output-path': this.confirm.bind(this), // enter
      })
    );
  }

  destroy() {
    this.emitter.dispose();
    this.subscriptions.dispose();
    this.element.remove();
    this.modalPanel.destroy();
  }

  onDidConfirm(fn) {
    this.emitter.on('did-confirm', fn);
  }

  getElement() {
    return this.modalPanel;
  }

  show(activeFilePath, projectDirectory, outputPath) {
    this.previouslyFocusedElement = document.activeElement;
    this.modalPanel.show();
    this.projectDirectory = projectDirectory;
    this.editor.setText(outputPath);
    this.editor.selectAll();
    this.editorView.focus();
  }

  hide() {
    this.modalPanel.hide();
    if (this.previouslyFocusedElement) {
      this.previouslyFocusedElement.focus();
    }
  }

  confirm() {
    this.emitter.emit('did-confirm', {
      projectDirectory: this.projectDirectory,
      outputPath: this.editor.getText(),
    });
    this.hide();
  }
}
