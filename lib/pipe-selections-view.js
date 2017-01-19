'use babel';

import {CompositeDisposable, Emitter, TextBuffer} from 'atom';
import indexing from './indexing';
import helper from './helper';

export default class PipeSelectionsView {

  constructor(indexer, preludePath) {
    this.indexer = indexer;
    this.element = document.createElement('div');
    // Force editor to have a `filePath`.
    const buffer = new TextBuffer({filePath: preludePath});
    this.editor = atom.workspace.buildTextEditor({buffer: buffer, lineNumberGutterVisible: false});
    this.editor.isPipeSelectionsEditor = true;
    this.editor.setGrammar(atom.grammars.grammarForScopeName('source.elm'));
    this.editorView = this.editor.getElement();
    this.editorView.classList.add('atom-text-editor', 'elmjutsu-pipe-selections');
    this.element.appendChild(this.editorView);
    this.subscriptions = new CompositeDisposable();
    this.emitter = new Emitter();
    this.subscriptions.add(atom.commands.add('atom-text-editor.elmjutsu-pipe-selections', {
      // 'blur': this.hide.bind(this),
      'elmjutsu:cancel-pipe-selections': this.hide.bind(this), // escape
      'elmjutsu:apply-pipe-selections': this.execute.bind(this), // ctrl-enter / cmd-enter
    }));
    this.editorRegistered = false;
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

  show(preludePath) {
    if (!this.editorRegistered) {
      this.editorRegistered = true;
      this.subscriptions.add(atom.textEditors.add(this.editor));
    }
    this.editor.buffer.setPath(preludePath);
    this.editorView.focus();
    this.indexer.ports.activeFileChangedSub.send([{
      filePath: preludePath,
      projectDirectory: helper.getProjectDirectory(preludePath)
    }, null, helper.getToken(this.editor)]);
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
