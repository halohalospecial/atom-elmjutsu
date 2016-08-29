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
    const element = document.createElement('div');
    this.html(element);

    this.editorView = document.createElement('atom-text-editor');
    this.editor = this.editorView.getModel();
    this.element.appendChild(this.editorView);
  }

  detached() {
  }

  getTitle() {
    return 'Elm REPL';
  }

}
