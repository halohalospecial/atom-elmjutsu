'use babel';

const ScrollView = require('atom-space-pen-views').ScrollView;
import Elm from '../elm/findUsages';

export default class FindUsagesView extends ScrollView {

  constructor() {
    super();
  }

  static content() {
    return this.div({tabindex: -1});
  }

  attached() {
    const elmDiv = document.createElement('div');
    elmDiv.classList.add('elmjutsu-find-usages');
    this.html(elmDiv);
    this.elm = Elm.FindUsages.embed(elmDiv);
    this.elm.ports.viewInEditorCmd.subscribe((usage) => {
      this.viewInEditor(usage);
    });
    // // Resize pane to 1/3 width.
    // this.parents('.pane')[0].style['flex-grow'] = 0.33;
  }

  detached() {
  }

  getURI() {
    return 'elmjutsu-find-usages-view://';
  }

  getTitle() {
    return 'Usages';
  }

  setUsages(projectDirectory, token, usages) {
    this.elm.ports.setUsagesSub.send([projectDirectory, token, usages]);
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
