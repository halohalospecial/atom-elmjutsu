'use babel';

import childProcess from 'child_process';
import helper from './helper';
import InstallPackageView from './install-package-view';
import Elm from '../elm/package-manager';

export default class PackageManager {

  constructor() {
    this.view = new InstallPackageView();
    this.elm = Elm.PackageManager.worker();
    this.elm.ports.showPackageListCmd.subscribe(([projectDirectory, packages]) => {
      this.view.show();
      this.view.setPackages(projectDirectory, packages);
    });
    this.view.onDidConfirm(({item}) => {
      this.view.hide();
      atom.notifications.addInfo('Installing `' + item.name + '` `' + item.version + '`...');
      const proc = childProcess.spawn(
        atom.config.get('elmjutsu.elmPackageExecPath'),
        ['install', '--yes', item.name, item.version], {
          cwd: item.projectDirectory
        });
      let outString = '';
      let errString = '';
      proc.stdout.on('data', (data) => {
        outString = data.toString();
      });
      proc.stderr.on('data', (data) => {
        errString += data.toString();
      });
      proc.on('error', (err) => {
        errString = err.toString();
      });
      proc.on('close', (code, signal) => {
        if (code === 0) {
          atom.notifications.addSuccess(outString.replace(/\n/g, '<br>'), {dismissable: true});
        } else {
          atom.notifications.addError(errString.replace(/\n/g, '<br>'), {dismissable: true});
        }
      });
    });
  }

  destroy() {
    this.view.destroy();
    this.view = null;
  }

  installPackageCommand() {
    const editor = atom.workspace.getActiveTextEditor();
    const filePath = editor.getPath && editor.getPath();
    if (filePath) {
      const projectDirectory = helper.getProjectDirectory(filePath);
      if (projectDirectory) {
        this.elm.ports.getPackageListSub.send(projectDirectory);
      }
    }
  }

  uninstallPackageCommand() {
    // // // TODO
  }
}
