'use babel';

import path from 'path';
import fs from 'fs';
const _ = require('underscore-plus');
const linter = require('atom-linter'); // TODO Use BufferedProcess instead

export default {

  isElmEditor(editor) {
    return editor && editor.getPath && editor.getPath() && path.extname(editor.getPath()) === '.elm';
  },

  symbolDefinitionRegex(symbolName) {
    return new RegExp('^(?:port module |module |import |type alias |type |port )(' + _.escapeRegExp(symbolName) + ')(?:\\s|$)|^(\\(?' + _.escapeRegExp(symbolName) + '\\)?)(?:\\s(?!:.*))', 'm');
  },

  // Copied from `linter-elm-make`.
  getProjectDirectory(directory) {
    if (fs.existsSync(path.join(directory, 'elm-package.json'))) {
      return directory;
    } else {
      const parentDirectory = path.join(directory, '..');
      if (parentDirectory === directory) {
        atom.notifications.addError('Could not find `elm-package.json`.', {
          dismissable: true
        });
        return null;
      } else {
        return this.getProjectDirectory(parentDirectory);
      }
    }
  },

  // Copied from `linter-elm-make`.
  getProjectBuildArtifactsDirectory(filePath) {
    if (filePath) {
      const projectDirectory = this.getProjectDirectory(path.dirname(filePath));
      if (projectDirectory === null) {
        return null;
      }
      const elmMakePath = atom.config.get('linter-elm-make.elmMakeExecutablePath');
      return linter.exec(elmMakePath, ['--help'], {
        stream: 'stdout',
        cwd: projectDirectory,
        env: process.env
      })
      .then(data => {
        var elmPlatformVersion = data.split('\n')[0].match(/\(Elm Platform (.*)\)$/)[1];
        let json = (() => {
          try {
            return JSON.parse(fs.readFileSync(path.join(projectDirectory, 'elm-package.json')).toString());
          } catch (error) {
          }
        })();
        if (json) {
          if (json.repository && json.version) {
            const matches = json.repository.match(/^(.+)\/(.+)\/(.+)\.git$/);
            const user = matches[2];
            const project = matches[3];
            if (user && project) {
              return path.join(projectDirectory, 'elm-stuff', 'build-artifacts', elmPlatformVersion, user, project, json.version);
            } else {
              atom.notifications.addError('Could not determine the value of "user" and/or "project"', {
                dismissable: true
              });
            }
          } else {
            atom.notifications.addError('Field "repository" and/or "version" not found in elm-package.json', {
              dismissable: true
            });
          }
        } else {
          atom.notifications.addError('Error parsing elm-package.json', {
            dismissable: true
          });
        }
      })
      .catch(errorMessage => {
        atom.notifications.addError('Failed to run ' + elmMakePath, {
          detail: errorMessage,
          dismissable: true
        });
        return null;
      });
    }
    return null;
  }

};
