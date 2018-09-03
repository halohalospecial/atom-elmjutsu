'use babel';

import { Emitter, CompositeDisposable } from 'atom';

export default class SetMainPathsView {
  constructor() {
    this.element = document.createElement('div');
    this.element.classList.add('elmjutsu', 'set-main-paths');

    const notes = document.createElement('div');
    notes.classList.add('notes');
    notes.appendChild(document.createTextNode('Paths are relative to '));
    const code = document.createElement('code');
    code.innerText = 'elm.json';
    notes.appendChild(code);
    notes.appendChild(document.createTextNode(', separated by commas.'));
    this.element.appendChild(notes);

    this.editorView = document.createElement('atom-text-editor');
    this.editorView.classList.add(
      'atom-text-editor',
      'elmjutsu-set-main-paths'
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
      atom.commands.add('atom-text-editor.elmjutsu-set-main-paths', {
        'elmjutsu:cancel-set-main-paths': this.hide.bind(this), // escape
        'elmjutsu:confirm-set-main-paths': this.confirm.bind(this), // enter
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

  show(activeFilePath, projectDirectory, mainPaths) {
    this.previouslyFocusedElement = document.activeElement;
    this.modalPanel.show();
    this.projectDirectory = projectDirectory;
    const activeFileIndex = mainPaths.indexOf(activeFilePath);
    if (activeFileIndex === -1) {
      mainPaths.push(activeFilePath);
    }
    const separator = ', ';
    const mainPathsString = mainPaths.join(separator);
    const selectColumnStart = mainPathsString.lastIndexOf(separator);
    this.editor.setText(mainPathsString);
    if (activeFileIndex !== -1) {
      this.editor.setCursorBufferPosition([
        mainPathsString.length,
        mainPathsString.length,
      ]);
    } else if (selectColumnStart !== -1) {
      this.editor.setSelectedBufferRange([
        [0, selectColumnStart + separator.length],
        [0, mainPathsString.length],
      ]);
    } else {
      this.editor.selectAll();
    }
    this.editorView.focus();
  }

  hide() {
    this.modalPanel.hide();
    if (this.previouslyFocusedElement) {
      this.previouslyFocusedElement.focus();
    }
  }

  confirm() {
    const mainPaths = this.editor
      .getText()
      .split(',')
      .map(mainPath => {
        return mainPath.trim();
      })
      .filter(mainPath => {
        return mainPath.trim() !== '';
      });
    this.emitter.emit('did-confirm', {
      projectDirectory: this.projectDirectory,
      mainPaths: mainPaths,
    });
    this.hide();
  }
}
