'use babel';

const CompositeDisposable = require('atom').CompositeDisposable;
import Finder from './finder';
// import Hinter from './hinter';
import Sidekick from './sidekick';

export default {

  // config: {
  //   showHints: {
  //     title: 'Show Hints',
  //     description: 'Show hints on the status bar.',
  //     type: 'boolean',
  //     default: true,
  //     order: 1
  //   }
  // },

  activate() {
    this.finder = new Finder();
    // this.hinter = new Hinter();
    // this.hinterTile = null;
    this.sidekick = new Sidekick();
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.commands.add('atom-text-editor:not([mini])[data-grammar^="source elm"]', {
      'elm-fu:find-usages': () => this.finder.findUsages(),
      'elm-fu:find-unused': () => this.finder.findUnused(),
    }));
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      // 'elm-fu:toggle-show-hints': () => this.toggleShowHints(),
      'elm-fu:toggle-sidekick': () => this.sidekick.toggle()
    }));
    // this.subscriptions.add(atom.config.observe('elm-fu.showHints', showHints => {
    //   if (showHints) {
    //     this.addHinterTile();
    //   } else {
    //     this.removeHinterTile();
    //   }
    // }));
  },

  deactivate() {
    this.finder.destroy();
    // this.hinter.destroy();
    // this.removeHinterTile();
    this.sidekick.destroy();
    this.subscriptions.dispose();
  },

  // toggleShowHints() {
  //   const showHints = toggleConfig('elm-fu.showHints');
  //   atom.notifications.addInfo('"Show Hints" is now ' + (showHints ? 'ON' : 'OFF'), {});
  // },
  //
  // addHinterTile() {
  //   if (this.statusBar) {
  //     this.hinterTile =
  //       this.statusBar.addLeftTile({
  //         item: this.hinter.getElement(),
  //         priority: 1
  //       });
  //   }
  // },
  //
  // removeHinterTile() {
  //   if (this.hinterTile) {
  //     this.hinterTile.destroy();
  //   }
  // },
  //
  // consumeStatusBar(statusBar) {
  //   this.statusBar = statusBar;
  //   if (atom.config.get('elm-fu.showHints')) {
  //     this.addHinterTile();
  //   }
  // },

  // Provided by `linter-elm-make`.
  consumeGetWorkDirectory(getWorkDirectory) {
    this.getWorkDirectory = getWorkDirectory;
  }

};

// function toggleConfig(key) {
//   const oldValue = atom.config.get(key);
//   const newValue = !oldValue;
//   atom.config.set(key, newValue);
//   return newValue;
// }
