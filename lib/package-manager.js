'use babel';

import childProcess from 'child_process';
import path from 'path';
import os from 'os';
import fs from 'fs-extra';
import _ from 'underscore-plus';
import helper from './helper';
import InstallPackageView from './install-package-view';
import UninstallPackageView from './uninstall-package-view';
import Elm from '../elm/package-manager';

export default class PackageManager {
  constructor() {
    const self = this;
    this.installPackageView = new InstallPackageView();
    this.uninstallPackageView = new UninstallPackageView();
    this.elm = Elm.PackageManager.worker();
    this.elm.ports.showPackageListCmd.subscribe(
      ([projectDirectory, usingPre0_19ElmVersion, packages]) => {
        this.installPackageView.setPackages(
          projectDirectory,
          usingPre0_19ElmVersion,
          packages
        );
      }
    );
    this.elm.ports.getPackageListFailedCmd.subscribe(() => {
      this.installPackageView.hide();
      atom.notifications.addError(
        'Failed to get list of packages from `http://package.elm-lang.org`',
        { dismissable: true }
      );
    });
    this.installPackageView.onDidConfirm(({ item }) => {
      this.installPackageView.hide();
      atom.notifications.addInfo(
        'Installing `' +
          item.name +
          '`' +
          (item.version === 'Auto' ? '' : ' `' + item.version + '`') +
          '...',
        { dismissable: true }
      );
      if (item.usingPre0_19ElmVersion) {
        const args =
          item.version === 'Auto'
            ? ['install', '--yes', item.name]
            : ['install', '--yes', item.name, item.version];
        executeElmPackageInstall(item.projectDirectory, args);
      } else {
        const args =
          item.version === 'Auto'
            ? ['install', item.name]
            : ['install', item.name, item.version];
        // NOTE: `elm install <package> <version>` is not yet supported in Elm 0.19.
        self.executeElmInstall(item.projectDirectory, args);
      }
    });
    this.uninstallPackageView.onDidConfirm(({ item }) => {
      this.uninstallPackageView.hide();
      const elmPackageJson = readElmPackageJson(item.projectDirectory);
      if (elmPackageJson) {
        atom.notifications.addInfo('Uninstalling `' + item.name + '`...', {
          dismissable,
        });
        delete elmPackageJson.dependencies[item.name];
        helper.writeJson(
          path.join(item.projectDirectory, 'elm-package.json'),
          elmPackageJson
        );
        executeElmPackageInstall(item.projectDirectory, ['install', '--yes']);
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
        const usingPre0_19ElmVersion = helper.isPre0_19ElmVersion(
          helper.getElmVersion(projectDirectory)
        );
        this.elm.ports.getPackageListSub.send([
          projectDirectory,
          usingPre0_19ElmVersion,
        ]);
      }
    }
  }

  uninstallPackageCommand() {
    const editor = atom.workspace.getActiveTextEditor();
    const filePath = editor.getPath && editor.getPath();
    if (filePath) {
      const projectDirectory = helper.getProjectDirectory(filePath);
      if (projectDirectory) {
        const elmVersion = helper.getElmVersion(projectDirectory);
        const usingPre0_19ElmVersion = helper.isPre0_19ElmVersion(elmVersion);
        if (usingPre0_19ElmVersion) {
          const elmPackageJson = readElmPackageJson(projectDirectory);
          if (elmPackageJson) {
            this.uninstallPackageView.show();
            const dependencies = _.pairs(elmPackageJson.dependencies).map(
              ([name, versionRange]) => {
                return { name, versionRange };
              }
            );
            this.uninstallPackageView.setDependencies(
              projectDirectory,
              dependencies
            );
          }
        } else {
          // TODO
          atom.notifications.addError(
            '`Uninstall Package` does not support Elm ' + elmVersion + ' yet.'
          );
        }
      }
    }
  }

  executeElmInstall(projectDirectory, args) {
    const elmExecPath = helper.getAbsoluteExecutablePath(
      projectDirectory,
      atom.config.get('elmjutsu.elmExecPath')
    );
    const proc = childProcess.spawn(elmExecPath, args, {
      cwd: projectDirectory,
    });
    let outString = '';
    let errString = '';
    proc.stdout.on('data', data => {
      outString = data.toString();
      if (outString.endsWith('[Y/n]: ')) {
        proc.stdin.write('Y' + os.EOL);
        proc.stdin.end();
        outString += ' Y';
        const notification = atom.notifications.addSuccess(
          outString.replace(/\n/g, '<br>'),
          {
            dismissable: true,
          }
        );
      }
    });
    proc.stderr.on('data', data => {
      errString += data.toString();
    });
    proc.on('error', err => {
      errString = err.toString();
    });
    proc.on('close', (code, signal) => {
      if (code === 0) {
        atom.notifications.addSuccess(outString.replace(/\n/g, '<br>'), {
          dismissable: true,
        });
      } else {
        atom.notifications.addError(errString.replace(/\n/g, '<br>'), {
          dismissable: true,
        });
      }
    });
  }
}

function executeElmPackageInstall(projectDirectory, args) {
  const proc = childProcess.spawn(
    atom.config.get('elmjutsu.elmPackageExecPath'),
    args,
    {
      cwd: projectDirectory,
    }
  );
  let outString = '';
  let errString = '';
  proc.stdout.on('data', data => {
    outString = data.toString();
  });
  proc.stderr.on('data', data => {
    errString += data.toString();
  });
  proc.on('error', err => {
    errString = err.toString();
  });
  proc.on('close', (code, signal) => {
    if (code === 0) {
      atom.notifications.addSuccess(outString.replace(/\n/g, '<br>'), {
        dismissable: true,
      });
    } else {
      atom.notifications.addError(errString.replace(/\n/g, '<br>'), {
        dismissable: true,
      });
    }
  });
}

function readElmPackageJson(projectDirectory) {
  const filePath = path.join(projectDirectory, 'elm-package.json');
  const elmPackageJson = helper.readJson(filePath);
  if (
    !elmPackageJson ||
    !elmPackageJson.dependencies ||
    !(elmPackageJson.dependencies instanceof Object)
  ) {
    atom.notifications.addError('Error reading `' + filePath + '`', {
      dismissable: true,
    });
  }
  return elmPackageJson;
}
