'use babel';

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

  setPackages(projectDirectory, packages) {
    this.projectDirectory = projectDirectory;
    this.selectedPackageName = null;
    this.setItems(packages.map((pkg) => {
      pkg.filterKey = pkg.name;
      pkg.versions.unshift('Auto');
      return pkg;
    }));
  }

  viewForItem(item) {
    if (!this.selectedPackageName) {
      // Choosing package name.
      return `<li><div class="name">${item.name}</div><div class="summary">${item.summary}</div></li>`;
    } else {
      // Choosing package version.
      return `<li><div class="version">${item}</div></li>`;
    }
  }

  confirmed(item) {
    if (!this.selectedPackageName) {
      // Choosing package name.
      this.selectedPackageName = item.name;
      this.filterEditorView.getModel().setText('');
      this.setItems(item.versions);
    } else {
      // Choosing package version.
      super.confirmed({
        projectDirectory: this.projectDirectory,
        name: this.selectedPackageName,
        version: item
      });
    }
  }

}
