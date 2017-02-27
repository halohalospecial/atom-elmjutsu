'use babel';

import {ScrollView} from 'atom-space-pen-views';
import path from 'path';
import helper from './helper';
import Elm from '../elm/usages';

export default class FindAndRenameUsagesView extends ScrollView {

  constructor() {
    super();
    this.element = document.createElement('div');
    this.element.classList.add('elmjutsu-usages');

    this.renamePanel = document.createElement('div');
    this.element.appendChild(this.renamePanel);

    const renameLabel = document.createTextNode('Rename to: ');
    this.renamePanel.appendChild(renameLabel);

    this.renameEditorView = document.createElement('atom-text-editor');
    this.renameEditorView.classList.add('atom-text-editor', 'elmjutsu-rename-symbol');
    this.renameEditor = this.renameEditorView.getModel();
    this.renameEditor.setMini(true);
    this.renamePanel.appendChild(this.renameEditorView);

    const elmDiv = document.createElement('div');
    this.element.appendChild(elmDiv);

    this.elm = Elm.Usages.embed(elmDiv);
    this.elm.ports.viewInEditorCmd.subscribe((usage) => {
      this.viewInEditor(usage);
    });
  }

  destroy() {
  }

  static content() {
    return this.div();
  }

  // attached() {
  //   this.html(this.element);
  //   // // Resize pane to 1/3 width.
  //   // this.parents('.pane')[0].style['flex-grow'] = 0.33;
  // }
  //
  // detached() {
  // }

  getURI() {
    return helper.usagesViewURI();
  }

  getTitle() {
    return 'Usages';
  }

  showRenamePanel(defaultText) {
    this.renamePanel.style.display = 'block';
    this.renameEditor.setText(defaultText);
    this.renameEditor.selectAll();
    this.renameEditorView.focus();
  }

  hideRenamePanel() {
    this.renamePanel.style.display = 'none';
  }

  getRenameText() {
    return this.renameEditor.getText();
  }

  getCheckedUsages(callback) {
    const checkedUsagesReceived = (usages) => {
      this.elm.ports.checkedUsagesReceivedCmd.unsubscribe(checkedUsagesReceived);
      callback(usages);
    };
    this.elm.ports.checkedUsagesReceivedCmd.subscribe(checkedUsagesReceived);
    this.elm.ports.getCheckedUsagesSub.send(null);
  }

  setContents(projectDirectory, token, selectedIndex, usages, willShowRenamePanel) {
    const usagesWithChecked = usages.map((usage) => {
      usage.checked = true;
      return usage;
    });
    this.elm.ports.setContentsSub.send([projectDirectory + path.sep, token, selectedIndex, usagesWithChecked, willShowRenamePanel]);
  }

  viewInEditor(usage) {
    return atom.workspace.open(usage.sourcePath, {split: 'left', pending: true}).then((editor) => {
      editor.setCursorBufferPosition(usage.range.start);
      editor.scrollToCursorPosition({center: true});
      helper.flashRange(editor, usage.range, 'elmjutsu-symbol-marker');
    });
  }

  goToNextUsage() {
    this.elm.ports.selectNextUsageSub.send(null);
  }

  goToPreviousUsage() {
    this.elm.ports.selectPreviousUsageSub.send(null);
  }

}
