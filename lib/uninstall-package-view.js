'use babel';

import helper from './helper';
import ModalListView from './modal-list-view';

export default class UninstallPackageView extends ModalListView {

  constructor() {
    super();
  }

  initialize() {
    super.initialize();
    this.addClass('overlay elmjutsu-uninstall-package');
  }

  setDependencies(projectDirectory, dependencies) {
    this.projectDirectory = projectDirectory;
    this.setItems(dependencies.map((dependency) => {
      dependency.filterKey = dependency.name + ' ' + dependency.versionRange;
      return dependency;
    }));
  }

  viewForItem({name, versionRange}) {
    return `<li><span class="name">${name}</span> <span class="version-range">${versionRange}</span></li>`;
  }

  confirmed(item) {
    super.confirmed({
      projectDirectory: this.projectDirectory,
      name: item.name
    });
  }

}
