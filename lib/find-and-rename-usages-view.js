'use babel';

const ScrollView = require('atom-space-pen-views').ScrollView;
import Elm from '../elm/usages';

export default class FindAndRenameUsagesView extends ScrollView {

  constructor() {
    super();
  }

  static content() {
    return this.div({tabindex: -1});
  }

  attached() {
    const element = document.createElement('div');
    this.html(element);

    this.renamePanel = document.createElement('div');
    element.appendChild(this.renamePanel);

    const renameLabel = document.createTextNode('Rename to: ');
    this.renamePanel.appendChild(renameLabel);

    this.renameEditorView = document.createElement('atom-text-editor');
    this.renameEditorView.classList.add('atom-text-editor', 'elmjutsu-rename-symbol');
    this.renameEditor = this.renameEditorView.getModel();
    this.renameEditor.setMini(true);
    this.renamePanel.appendChild(this.renameEditorView);

    const elmDiv = document.createElement('div');
    elmDiv.classList.add('elmjutsu-usages');
    element.appendChild(elmDiv);

    this.elm = Elm.Usages.embed(elmDiv);
    this.elm.ports.viewInEditorCmd.subscribe((usage) => {
      this.viewInEditor(usage);
    });
    // // Resize pane to 1/3 width.
    // this.parents('.pane')[0].style['flex-grow'] = 0.33;
  }

  detached() {
  }

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

  setUsages(projectDirectory, token, usages, willShowRenamePanel) {
    const usagesWithWillInclude = usages.map((usage) => {
      usage.willInclude = true;
      return usage;
    });
    console.log('usagesWithWillInclude', usagesWithWillInclude); // // //
    this.elm.ports.setUsagesSub.send([projectDirectory, token, usagesWithWillInclude, willShowRenamePanel]);
  }

  viewInEditor(usage) {
    return atom.workspace.open(usage.sourcePath, {split: 'left'}).then((editor) => {
      editor.setCursorBufferPosition(usage.range.start);
      editor.scrollToCursorPosition({center: true});
    });
  }

  goToNextUsage() {
    this.elm.ports.selectNextUsageSub.send(null);
  }

  goToPreviousUsage() {
    this.elm.ports.selectPreviousUsageSub.send(null);
  }

}
