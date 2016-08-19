'use babel';

const {Emitter, CompositeDisposable} = require('atom');

export default class RenameSymbolView {

  constructor() {
    this.element = document.createElement('div');
    this.element.classList.add('elmjutsu', 'rename-symbol');

    const notes = document.createElement('div');
    notes.classList.add('notes');
    notes.appendChild(document.createTextNode('WARNING: This is an undoable operation!'));
    this.element.appendChild(notes);

    this.editorView = document.createElement('atom-text-editor');
    this.editorView.classList.add('atom-text-editor', 'elmjutsu-rename-symbol');
    this.element.appendChild(this.editorView);
    this.editor = this.editorView.getModel();
    this.editor.setMini(true);

    this.modalPanel = atom.workspace.addModalPanel({
      item: this.element,
      visible: false
    });

    this.emitter = new Emitter();
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.commands.add('atom-text-editor.elmjutsu-rename-symbol', {
      'blur': this.hide.bind(this),
      'elmjutsu:cancel-rename-symbol':  this.hide.bind(this), // escape
      'elmjutsu:confirm-rename-symbol': this.confirm.bind(this) // enter
    }));
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

  show(currentName, projectDirectory, usages) {
    this.projectDirectory = projectDirectory;
    this.usages = usages;
    this.previouslyFocusedElement = document.activeElement;
    this.modalPanel.show();
    this.editor.setText(currentName);
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
    this.emitter.emit('did-confirm', {newName: this.editor.getText(), projectDirectory: this.projectDirectory, usages: this.usages});
    this.hide();
  }

}
