'use babel';

import {CompositeDisposable, Emitter, TextBuffer} from 'atom';

export default class PipeSelectionsView {

  constructor(templatePath) {
    this.element = document.createElement('div');
    // Force editor to have a `filePath`.
    const buffer = new TextBuffer({filePath: templatePath});
    this.editor = atom.workspace.buildTextEditor({buffer: buffer, lineNumberGutterVisible: false});
    this.editor.setGrammar(atom.grammars.grammarForScopeName('source.elm'));
    this.editorView = this.editor.getElement();
    this.editorView.classList.add('atom-text-editor', 'elmjutsu-pipe-selections');
    this.element.appendChild(this.editorView);
    this.subscriptions = new CompositeDisposable();
    this.emitter = new Emitter();
    // Register created editor.
    this.subscriptions.add(atom.textEditors.add(this.editor));
    this.subscriptions.add(atom.commands.add('atom-text-editor.elmjutsu-pipe-selections', {
      'blur': this.hide.bind(this),
      'elmjutsu:cancel-pipe-selections': this.hide.bind(this), // escape
      'elmjutsu:apply-pipe-selections': this.execute.bind(this), // ctrl-enter / cmd-enter
    }));
  }

  destroy() {
    this.emitter.dispose();
    this.emitter = null;
    this.subscriptions.dispose();
    this.subscriptions = null;
    this.editorView.remove();
    this.editorView = null;
    this.element.remove();
    this.element = null;
  }

  getElement() {
    return this.element;
  }

  show(templatePath) {
    this.editor.buffer.setPath(templatePath);
    this.editorView.focus();
  }

  hide() {
    this.emitter.emit('did-hide');
  }

  execute() {
    this.emitter.emit('do-execute', this.editor.getText());
  }

  onDidHide(fn) {
    this.emitter.on('did-hide', fn);
  }

  onDoExecute(fn) {
    this.emitter.on('do-execute', fn);
  }

  setProcessing(isProcessing) {
    if (isProcessing) {
      this.editorView.classList.add('processing');
    } else {
      this.editorView.classList.remove('processing');
    }
  }

}
