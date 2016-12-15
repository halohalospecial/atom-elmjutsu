'use babel';

const CompositeDisposable = require('atom').CompositeDisposable;
import helper from './helper';
import SidekickView from './sidekick-view';

export default class Sidekick {

  constructor(indexer) {
    this.indexer = indexer;
    this.view = new SidekickView(this.indexer);
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.config.observe('elmjutsu.showSidekick', showSidekick => {
      if (showSidekick) {
        this.show(atom.config.get('elmjutsu.sidekickPosition'), atom.config.get('elmjutsu.sidekickSize'));
      } else {
        this.hide();
      }
    }));
    this.subscriptions.add(atom.config.observe('elmjutsu.sidekickPosition', sidekickPosition => {
      if (atom.config.get('elmjutsu.showSidekick')) {
        this.hide();
        this.show(sidekickPosition, atom.config.get('elmjutsu.sidekickSize'));
      }
    }));
    this.subscriptions.add(atom.config.observe('elmjutsu.sidekickSize', sidekickSize => {
      if (atom.config.get('elmjutsu.showSidekick')) {
        this.updateSize(sidekickSize, atom.config.get('elmjutsu.sidekickPosition'));
      }
    }));
    this.subscriptions.add(atom.workspace.observeActivePaneItem((item) => {
      if (item && helper.isElmEditor(item)) {
        if (!this.panel && atom.config.get('elmjutsu.showSidekick')) {
          this.show(atom.config.get('elmjutsu.sidekickPosition'), atom.config.get('elmjutsu.sidekickSize'));
        }
      } else {
        this.hide();
      }
    }));
  }

  destroy() {
    this.subscriptions.dispose();
    this.subscriptions = null;
    this.hide();
    this.view.destroy();
    this.view = null;
  }

  toggleCommand() {
    helper.toggleConfig('elmjutsu.showSidekick');
  }

  show(sidekickPosition, sidekickSize) {
    const options = {
      item: this.view.getElement(),
      visible: true,
      priority: Number.MAX_SAFE_INTEGER * (sidekickPosition === 'bottom' ? -1 : 1)
    };
    if (sidekickPosition === 'top') {
      this.panel = atom.workspace.addHeaderPanel(options);
    } else if (sidekickPosition === 'right') {
      this.panel = atom.workspace.addRightPanel(options);
    } else if (sidekickPosition === 'bottom') {
      this.panel = atom.workspace.addFooterPanel(options);
    } else if (sidekickPosition === 'left') {
      this.panel = atom.workspace.addLeftPanel(options);
    }
    this.updateSize(sidekickSize, sidekickPosition);
    this.panel.show();
  }

  hide() {
    if (this.panel) {
      this.panel.destroy();
      this.panel = null;
    }
  }

  updateSize(sidekickSize, sidekickPosition) {
    if (this.panel) {
      const elmDiv = this.panel.getItem();
      let height = null;
      let width = null;
      if (sidekickSize > 0) {
        if (sidekickPosition === 'top' || sidekickPosition === 'bottom') {
          height = sidekickSize + 'px';
          width = null;
        } else if (sidekickPosition === 'left' || sidekickPosition === 'right') {
          height = null;
          width = sidekickSize + 'px';
        }
      }
      elmDiv.style.height = height;
      elmDiv.style.width = width;
    }
  }

}
