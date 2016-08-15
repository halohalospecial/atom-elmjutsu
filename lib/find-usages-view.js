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
    // Resize pane to 1/3 width.
    this.parents('.pane')[0].style['flex-grow'] = 0.33;
  }

  detached() {
  }

  getURI() {
    return 'elmjutsu-find-usages-view://';
  }

  getTitle() {
    return 'Usages'; // TODO: `Usages for ${symbol}: ${usages.length}`
  }

  setUsages(usages) {
    this.elm.ports.setUsagesSub.send(usages);
  }

  viewInEditor(usage, isPreview) {
    return atom.workspace.open(usage.sourcePath, {pending: isPreview, split: 'left'}).then((editor) => {
      editor.setCursorBufferPosition(usage.range.start);
      editor.scrollToCursorPosition({center: true});
      // if (isPreview) {
      //   this.destroyUsageMarker();
      //   this.symbolMarker = editor.markBufferRange(symbol.range, {invalidate: 'never', persistent: false});
      //   editor.decorateMarker(this.symbolMarker, {type: 'highlight', class: 'elmjutsu-usage-marker'});
      // }
      // if (!isPreview) {
      //   this.closeTemporaryEditors(editor.id);
      // }
    });
  }

  goToNextUsage() {
    this.elm.ports.selectNextUsageSub.send(null);
  }

  goToPreviousUsage() {
    this.elm.ports.selectPreviousUsageSub.send(null);
  }

}
