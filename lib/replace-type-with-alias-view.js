'use babel';

import helper from './helper';
import ModalListView from './modal-list-view';

export default class ReplaceTypeWithAliasView extends ModalListView {

  constructor() {
    super();
  }

  initialize() {
    super.initialize();
    this.addClass('overlay elmjutsu-replace-type-with-alias');
  }

  setAliases(editor, aliases) {
    this.setItems(aliases.map((alias) => {
      return {
        editor,
        alias,
        filterKey: alias
      };
    }));
  }

  viewForItem({alias}) {
    return `<li><span class="alias">${alias}</span></li>`;
  }

}
