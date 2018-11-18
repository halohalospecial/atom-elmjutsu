'use babel';

// See also `package-manager.js`.

import helper from './helper';
import ModalListView from './modal-list-view';

export default class InstallPackageView extends ModalListView {
  constructor() {
    super();
  }

  initialize() {
    super.initialize();
    this.addClass('overlay elmjutsu-install-package');
  }

  setPackages(projectDirectory, usingPre0_19ElmVersion, packages) {
    this.projectDirectory = projectDirectory;
    this.usingPre0_19ElmVersion = usingPre0_19ElmVersion;
    this.selectedPackageName = null;
    this.setItems(
      packages.map(pkg => {
        pkg.filterKey = pkg.name;
        pkg.versions.unshift('Auto');
        return pkg;
      })
    );
  }

  viewForItem(item) {
    if (!this.selectedPackageName) {
      // Choosing package name.
      return `<li><div class="name">${item.name}</div><div class="summary">${
        item.summary
      }</div></li>`;
    } else {
      // Choosing package version.
      return `<li><div class="version">${item}</div></li>`;
    }
  }

  confirmed(item) {
    if (this.usingPre0_19ElmVersion) {
      if (!this.selectedPackageName) {
        // Choosing package name.
        this.selectedPackageName = item.name;
        this.filterEditorView.getModel().setText('');
        this.setItems(item.versions);
      } else {
        // Choosing package version.
        super.confirmed({
          projectDirectory: this.projectDirectory,
          usingPre0_19ElmVersion: this.usingPre0_19ElmVersion,
          name: this.selectedPackageName,
          version: item,
        });
      }
    } else {
      // Choosing package name.
      super.confirmed({
        projectDirectory: this.projectDirectory,
        usingPre0_19ElmVersion: this.usingPre0_19ElmVersion,
        name: item.name,
        version: 'Auto',
      });
    }
  }
}
