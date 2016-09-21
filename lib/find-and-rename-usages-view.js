'use babel';

import {ScrollView} from 'atom-space-pen-views';
import path from 'path';
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
    this.destroyUsageMarker();
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

  // Must the same as in `find-and-rename-usages.js`.
  getURI() {
    return 'elmjutsu-usages-view://';
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

      this.destroyUsageMarker();
      this.usageMarker = editor.markBufferRange(usage.range, {invalidate: 'touch', persistent: false});
      editor.decorateMarker(this.usageMarker, {type: 'highlight', class: 'elmjutsu-symbol-marker'});
      this.usageMarkerFlashTimer = setTimeout(() => {
        this.destroyUsageMarker();
      }, 300);
    });
  }

  destroyUsageMarker() {
    if (this.usageMarkerFlashTimer) {
      clearTimeout(this.usageMarkerFlashTimer);
      this.usageMarkerFlashTimer = null;
    }
    if (this.usageMarker) {
      this.usageMarker.destroy();
      this.usageMarker = null;
    }
  }

  goToNextUsage() {
    this.elm.ports.selectNextUsageSub.send(null);
  }

  goToPreviousUsage() {
    this.elm.ports.selectPreviousUsageSub.send(null);
  }

}
