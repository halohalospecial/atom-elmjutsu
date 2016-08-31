'use babel';

export default class PipeSelectionsView {

  constructor(indexer) {
    this.element = document.createElement('div');

    this.editor = atom.workspace.buildTextEditor({lineNumberGutterVisible: false});
    this.editor.setGrammar(atom.grammars.grammarForScopeName('source.elm'));
    this.editorView = this.editor.getElement();
    this.editorView.classList.add('atom-text-editor', 'elmjutsu-pipe-selections');
    this.element.appendChild(this.editorView);
  }

  destroy() {
    this.editorView.remove();
    this.editorView = null;
    this.element.remove();
    this.element = null;
  }

  getElement() {
    return this.element;
  }

  show() {
    this.editorView.focus();
  }

}
