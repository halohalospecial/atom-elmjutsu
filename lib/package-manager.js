'use babel';

import childProcess from 'child_process';
import path from 'path';
import fs from 'fs-extra';
import _ from 'underscore-plus';
import helper from './helper';
import InstallPackageView from './install-package-view';
import UninstallPackageView from './uninstall-package-view';
import Elm from '../elm/package-manager';

export default class PackageManager {

  constructor() {
    this.installPackageView = new InstallPackageView();
    this.uninstallPackageView = new UninstallPackageView();
    this.elm = Elm.PackageManager.worker();
    this.elm.ports.showPackageListCmd.subscribe(([projectDirectory, packages]) => {
      this.installPackageView.setPackages(projectDirectory, packages);
    });
    this.elm.ports.getPackageListFailedCmd.subscribe(() => {
      this.installPackageView.hide();
      atom.notifications.addError('Failed to get list of packages from `http://package.elm-lang.org`', {dismissable: true});
    });
    this.installPackageView.onDidConfirm(({item}) => {
      this.installPackageView.hide();
      atom.notifications.addInfo('Installing `' + item.name + '`' + (item.version === 'Auto' ? '' : ' `' + item.version + '`') + '...');
      const args = item.version === 'Auto' ? ['install', '--yes', item.name] : ['install', '--yes', item.name, item.version];
      runElmPackageInstall(item.projectDirectory, args);
    });
    this.uninstallPackageView.onDidConfirm(({item}) => {
      this.uninstallPackageView.hide();
      const elmPackageJson = readElmPackageJson(item.projectDirectory);
      if (elmPackageJson) {
        atom.notifications.addInfo('Uninstalling `' + item.name + '`...');
        delete elmPackageJson.dependencies[item.name];
        helper.writeJson(path.join(item.projectDirectory, 'elm-package.json'), elmPackageJson);
        runElmPackageInstall(item.projectDirectory, ['install', '--yes']);
      }
    });
  }

  destroy() {
    this.installPackageView.destroy();
    this.installPackageView = null;
    this.uninstallPackageView.destroy();
    this.uninstallPackageView = null;
  }

  installPackageCommand() {
    const editor = atom.workspace.getActiveTextEditor();
    const filePath = editor.getPath && editor.getPath();
    if (filePath) {
      const projectDirectory = helper.getProjectDirectory(filePath);
      if (projectDirectory) {
        this.installPackageView.show();
        this.elm.ports.getPackageListSub.send(projectDirectory);
      }
    }
  }

  uninstallPackageCommand() {
    const editor = atom.workspace.getActiveTextEditor();
    const filePath = editor.getPath && editor.getPath();
    if (filePath) {
      const projectDirectory = helper.getProjectDirectory(filePath);
      if (projectDirectory) {
        const elmPackageJson = readElmPackageJson(projectDirectory);
        if (elmPackageJson) {
          this.uninstallPackageView.show();
          const dependencies = _.pairs(elmPackageJson.dependencies).map(([name, versionRange]) => {
            return {name, versionRange};
          });
          this.uninstallPackageView.setDependencies(projectDirectory, dependencies);
        }
      }
    }
  }
}

function runElmPackageInstall(projectDirectory, args) {
  const proc = childProcess.spawn(atom.config.get('elmjutsu.elmPackageExecPath'), args, {
    cwd: projectDirectory
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
}

function readElmPackageJson(projectDirectory) {
  const filePath = path.join(projectDirectory, 'elm-package.json');
  const elmPackageJson = helper.readJson(filePath);
  if (!elmPackageJson || !elmPackageJson.dependencies || !(elmPackageJson.dependencies instanceof Object)) {
    atom.notifications.addError('Error reading `' + filePath + '`', {dismissable: true});
  }
  return elmPackageJson;
}
