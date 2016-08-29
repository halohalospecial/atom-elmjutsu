'use babel';

const ScrollView = require('atom-space-pen-views').ScrollView;

export default class ReplView extends ScrollView {

  constructor() {
    super();
  }

  static content() {
    return this.div();
  }

  attached() {
    this.element = document.createElement('div');
    this.html(this.element);

    // const editorView = document.createElement('atom-text-editor');
    // const editor = this.editorView.getModel();
    // element.appendChild(editorView);

    // const editor = atom.workspace.buildTextEditor({lineNumberGutterVisible: false});
    // atom.textEditors.add(editor);
    // // editor.setGrammar('Elm');
    // element.appendChild(editor.getElement());

    // const editor = atom.textEditors.build({lineNumberGutterVisible: false});
    // atom.textEditors.add(editor);
    // // editor.setGrammar('Elm');
    // element.appendChild(editor.getElement());
  }

  detached() {
  }

  createEditor() {
    const editor = atom.workspace.buildTextEditor({lineNumberGutterVisible: false});
    editor.setGrammar(atom.grammars.grammarForScopeName('source.elm'));
    this.element.appendChild(editor.getElement());
  }

  getTitle() {
    return 'Elm REPL';
  }

}
