'use babel';

import {CompositeDisposable, Emitter} from 'atom';
import {SelectListView} from 'atom-space-pen-views';
import SymbolFinderView from './symbol-finder-view';

export default class FindUsagesView extends SymbolFinderView {

  constructor() {
    super();
  }

  initialize() {
    super.initialize();
    this.addClass('overlay elmjutsu-find-usages');
  }

  setUsages(usages) {
    this.setItems(usages.map((usage) => {
      usage.filterKey = usage.lineText;
      return usage;
    }));
  }

  viewForItem({lineText, sourcePath, range}) {
    return `<li>${lineText.replace(/ /g, '&nbsp;')}<br><span class="source-path">${sourcePath + ' (' + (range.start.row + 1) + ',' + (range.start.column + 1) + ')'}</span></li>`;
  }

}
