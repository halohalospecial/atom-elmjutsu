'use babel';

import { Range } from 'atom';
import path from 'path';
import fs from 'fs-extra';
import _ from 'underscore-plus';
import helper from './helper';

export default {
  sendFileContentsChanged(indexer, filePath) {
    const startTime = helper.getTimestamp();
    let stats = null;
    try {
      stats = fs.statSync(filePath);
    } catch (e) {}
    if (stats && stats.isFile() && path.extname(filePath) === '.elm') {
      const projectDirectory = helper.getProjectDirectory(filePath);
      if (projectDirectory) {
        const text = fs.readFileSync(filePath).toString();
        indexer.fileContentsChanged([
          filePath,
          projectDirectory,
          this.parseModuleDocs(text, filePath),
          this.parseImports(text),
        ]);
      }
    }
    helper.debugLog(
      'sendFileContentsChanged ' + (helper.getTimestamp() - startTime) + ' ms'
    );
  },

  sendFileContentsRemoved(indexer, filePath, projectDirectory) {
    const startTime = helper.getTimestamp();
    indexer.fileContentsRemoved([filePath, projectDirectory]);
    helper.debugLog(
      'sendFileContentsRemoved ' + (helper.getTimestamp() - startTime) + ' ms'
    );
  },

  sendActiveFile(indexer, editor) {
    const startTime = helper.getTimestamp();
    // if (!helper.isElmEditor(editor)) {
    //   return;
    // }
    const filePath = editor.getPath();
    if (!filePath) {
      return;
    }
    const projectDirectory = helper.getProjectDirectory(filePath);
    if (!projectDirectory) {
      return;
    }
    indexer.updateActiveFile([
      { filePath, projectDirectory },
      helper.getActiveTopLevel(editor),
      helper.getActiveRecordVariable(editor),
      helper.getToken(editor),
    ]);
    helper.debugLog(
      'sendActiveFile ' + (helper.getTimestamp() - startTime) + ' ms'
    );
  },

  sendActiveEditorContents(indexer, editor) {
    const startTime = helper.getTimestamp();
    // if (!helper.isElmEditor(editor)) {
    //   return;
    // }
    const text = editor.getText();
    const filePath = editor.getPath();
    if (!filePath) {
      return;
    }
    const projectDirectory = helper.getProjectDirectory(filePath);
    if (!projectDirectory) {
      return;
    }
    indexer.fileContentsChanged([
      filePath,
      projectDirectory,
      this.parseModuleDocs(text, filePath),
      this.parseImports(text),
    ]);
    indexer.updateActiveFile([
      { filePath, projectDirectory },
      helper.getActiveTopLevel(editor),
      helper.getActiveRecordVariable(editor),
      helper.getToken(editor),
    ]);
    helper.debugLog(
      'sendActiveEditorContents ' + (helper.getTimestamp() - startTime) + ' ms'
    );
  },

  sendActiveTextAndToken(indexer, editor) {
    const startTime = helper.getTimestamp();
    // if (!helper.isElmEditor(editor)) {
    //   return;
    // }
    const text = editor.getText();
    const filePath = editor.getPath();
    const projectDirectory = helper.getProjectDirectory(filePath);
    if (!projectDirectory) {
      return;
    }
    indexer.clearLocalHintsCache(null);
    indexer.fileContentsChanged([
      filePath,
      projectDirectory,
      this.parseModuleDocs(text, filePath),
      this.parseImports(text),
    ]);
    indexer.updateActiveToken([
      helper.getActiveTopLevel(editor),
      helper.getActiveRecordVariable(editor),
      helper.getToken(editor),
    ]);
    helper.debugLog(
      'sendActiveTextAndToken ' + (helper.getTimestamp() - startTime) + ' ms'
    );
  },

  sendActiveToken(indexer, editor) {
    const startTime = helper.getTimestamp();
    indexer.updateActiveToken([
      helper.getActiveTopLevel(editor),
      helper.getActiveRecordVariable(editor),
      helper.getToken(editor),
    ]);
    helper.debugLog(
      'sendActiveToken ' + (helper.getTimestamp() - startTime) + ' ms'
    );
  },

  sendToken(indexer, editor, position, token) {
    const startTime = helper.getTimestamp();
    indexer.updateActiveToken([
      helper.getActiveTopLevel(editor, position),
      helper.getActiveRecordVariable(editor, position),
      token,
    ]);
    helper.debugLog(
      'sendToken ' + token + ' ' + (helper.getTimestamp() - startTime) + ' ms'
    );
  },

  sendEnteredInference(indexer, inference) {
    const startTime = helper.getTimestamp();
    indexer.inferenceEntered(inference);
    helper.debugLog(
      'sendEnteredInference ' +
        inference +
        ' ' +
        (helper.getTimestamp() - startTime) +
        ' ms'
    );
  },

  sendProjectDependencies(indexer, projectDirectory, workDirectory) {
    const startTime = helper.getTimestamp();
    let updatedDependencies = null;
    let elmVersion = null;

    // For Elm version >= 0.19.0:
    let elmJson = null;
    try {
      elmJson = JSON.parse(
        fs.readFileSync(path.join(projectDirectory, 'elm.json')).toString()
      );
    } catch (e) {}
    if (
      elmJson &&
      elmJson instanceof Object &&
      elmJson.dependencies &&
      elmJson.dependencies instanceof Object
    ) {
      if (elmJson.type && elmJson.type === 'package') {
        // Example:
        // "dependencies": {
        //     "elm/core": "1.0.0 <= v < 2.0.0",
        //     "elm/json": "1.0.0 <= v < 2.0.0"
        // }
        // Get approximate package versions.
        // Example: If the version range is "4.0.3 <= v < 5.0.0", return "4.0.3".
        updatedDependencies = _.flatten(
          [elmJson.dependencies, elmJson['test-dependencies']].map(deps => {
            if (!deps) {
              return [];
            }
            return _.pairs(deps).map(([packageName, versionRange]) => {
              return [packageName, versionRange.split(' ')[0]];
            });
          }),
          true
        );
      } else {
        // Example:
        // "dependencies": {
        //     "direct": {
        //         "elm/core": "1.0.0"
        //     },
        //     "indirect": {
        //         "elm/json": "1.0.0"
        //     }
        // }
        updatedDependencies = _.flatten(
          [elmJson.dependencies, elmJson['test-dependencies']].map(deps => {
            if (!deps) {
              return [];
            }
            return _.flatten(
              _.values(deps).map(dependencyMap => {
                return _.pairs(dependencyMap);
              }),
              true
            );
          }),
          true
        );
      }
      elmVersion = elmJson['elm-version'].split(' ').shift();
    } else {
      // For Elm version <= 0.18.0:
      elmVersion = '0.18.0';

      // If `exact-dependencies.json` exists in the work directory, get the dependencies from there. (Works with `linter-elm-make`'s temporary work directories.)
      // Otherwise, approximate package versions from `elm-package.json`.
      let exactDependenciesJson = null;
      try {
        exactDependenciesJson = JSON.parse(
          fs
            .readFileSync(
              path.join(workDirectory, 'elm-stuff', 'exact-dependencies.json')
            )
            .toString()
        );
      } catch (e) {}
      if (exactDependenciesJson && exactDependenciesJson instanceof Object) {
        updatedDependencies = _.pairs(exactDependenciesJson);
      } else {
        // Get approximate package versions from `elm-package.json`.
        // Example: If the version range is "4.0.3 <= v < 5.0.0", return "4.0.3".
        let elmPackageJson = null;
        try {
          elmPackageJson = JSON.parse(
            fs
              .readFileSync(path.join(projectDirectory, 'elm-package.json'))
              .toString()
          );
        } catch (e) {}
        if (
          !elmPackageJson ||
          !elmPackageJson.dependencies ||
          !(elmPackageJson.dependencies instanceof Object)
        ) {
          return;
        }
        updatedDependencies = _.flatten(
          [
            elmPackageJson.dependencies,
            elmPackageJson['test-dependencies'],
          ].map(deps => {
            return _.pairs(deps).map(([packageName, versionRange]) => {
              return [packageName, versionRange.split(' ')[0]];
            });
          }),
          true
        );
      }
    }

    if (updatedDependencies && elmVersion) {
      indexer.projectDependenciesChanged([
        projectDirectory,
        updatedDependencies,
        elmVersion,
      ]);
    }
    helper.debugLog(
      'sendProjectDependencies ' + (helper.getTimestamp() - startTime) + ' ms'
    );
  },

  parseDirectoryFiles(indexer, projectDirectory, directory) {
    if (!fs.existsSync(directory)) {
      helper.debugLog(
        'Error parsing source directory ' +
          directory +
          ' (directory does not exist)',
        'red'
      );
      return false;
    }
    // TODO: Catch fs.readdirSync exceptions.
    // let filenames = [];
    // try {
    //   filenames = fs.readdirSync(directory);
    // } catch (e) {
    //   return false;
    // }
    let filenames = fs.readdirSync(directory);
    const nextDirectories = [];
    filenames.forEach(filename => {
      const filePath = path.join(directory, filename);
      let stats = null;
      try {
        stats = fs.statSync(filePath);
      } catch (e) {}
      if (stats && stats.isDirectory() && filename !== 'elm-stuff') {
        nextDirectories.push(filePath);
      } else if (stats && stats.isFile() && path.extname(filename) === '.elm') {
        helper.debugLog('Parsing ' + filePath);
        const text = fs.readFileSync(filePath).toString();
        setTimeout(() => {
          indexer.fileContentsChanged([
            filePath,
            projectDirectory,
            this.parseModuleDocs(text, filePath),
            this.parseImports(text),
          ]);
        });
      }
    });
    nextDirectories.forEach(directory => {
      this.parseDirectoryFiles(indexer, projectDirectory, directory);
    });
    return true;
  },

  parseModuleDocs(text, filePath) {
    let match = this.parseModuleNameAndComment(text);
    if (match) {
      const { aliases, tipes, values } = this.parseModuleValues(text);
      return {
        sourcePath: filePath,
        name: match.name,
        values: {
          aliases: aliases,
          tipes: tipes,
          values: values,
        },
        comment: match.comment,
      };
    }
    return {
      sourcePath: '',
      name: '',
      values: {
        aliases: [],
        tipes: [],
        values: [],
      },
      comment: '',
    };
  },

  parseModuleNameAndComment(text) {
    const match = helper.moduleNameRegex().exec(text);
    if (match && match.length > 3 && match[3]) {
      return {
        name: match[3],
        comment: match[7] || '',
      };
    }
    return null;
  },

  // TODO: Handle something like: (width, height) = (100, 200)
  // TODO: Handle something like: {width, height} = {width = 100, height = 200}
  parseModuleValues(text) {
    const toTipeCase = rawCase => {
      const tipeCaseParts = rawCase.trim().split(' ');
      const tipeCaseName = tipeCaseParts.shift();
      const tipeCaseArgs = helper.getArgsParts(tipeCaseParts.join(' '));
      return {
        name: tipeCaseName,
        args: tipeCaseArgs,
      };
    };
    let aliases = [];
    let tipes = [];
    let values = [];
    let valueEntries = {};
    let infixes = {};
    const strippedText = text
      // Remove non-documentation comments.
      .replace(/--.*$|{-(?!\|)[\s\S]*?-}/gm, '')
      // Remove module definition.
      .replace(helper.moduleNameRegex(), '');
    const blockRegex = helper.blockRegex();
    let match = blockRegex.exec(strippedText);
    while (match) {
      const comment = match[2] || '';
      const block = match[3];
      if (helper.moduleOrImportBlockRegex().test(block)) {
        // Ignore.
      } else if (helper.infixRegex().test(block)) {
        const [_, prefix, precedence, name] = match[3].match(
          helper.infixRegex()
        );
        let associativity;
        if (prefix === 'infix') {
          associativity = 'non';
        } else if (prefix === 'infixl') {
          associativity = 'left';
        } else if (prefix === 'infixr') {
          associativity = 'right';
        }
        infixes[name] = { associativity, precedence: parseInt(precedence, 10) };
      } else if (helper.typeAliasBlockRegex().test(block)) {
        const parts = block.replace(/^type alias\s+/, '').split('=');
        const parts2 = parts.shift().split(/\s/);
        const aliasName = helper.formatSymbolName(parts2[0]);
        parts2.shift();
        const args = parts2.filter(arg => {
          return arg.trim().length > 0;
        });
        const tipe = helper.formatTipe(parts.join('='));
        aliases.push({
          name: aliasName,
          comment: comment,
          tipe: tipe,
          args: args,
          associativity: null,
          precedence: null,
        });
      } else if (helper.typeBlockRegex().test(block)) {
        const parts = block.replace(/^type\s+/, '').split('=');
        const parts2 = parts.shift().split(/\s/);
        const tipeName = helper.formatSymbolName(parts2[0]);
        parts2.shift();
        const args = parts2.filter(arg => {
          return arg.trim().length > 0;
        });
        const tipe = helper.formatTipe(parts.join('='));
        const cases = tipe.split('|').map(toTipeCase);
        tipes.push({
          name: tipeName,
          comment: comment,
          tipe: tipeName,
          cases: cases,
          args: args,
          associativity: null,
          precedence: null,
        });
      } else if (helper.portBlockRegex().test(block)) {
        const parts = block.replace(/^port\s+/, '').split(':');
        const valueName = helper.formatSymbolName(parts.shift());
        const tipe = helper.formatTipe(parts.join(':'));
        values.push({
          name: valueName,
          comment: comment,
          tipe: tipe,
          args: [],
          associativity: null,
          precedence: null,
        });
      } else {
        // Functions.
        const valueName = helper.formatSymbolName(match[4]);
        const maybeColon = match[5].trim();
        const rest = match[6].trim();
        if (maybeColon === ':') {
          // Type annotation.
          const tipe = helper.formatTipe(rest);
          valueEntries[valueName] = {
            name: valueName,
            comment: comment,
            tipe: tipe,
            args: [],
            associativity: null,
            precedence: null,
          };
        } else {
          // Arguments.
          const args = helper.formatTipe(rest.split('=', 1)[0]);
          let valueEntry = valueEntries.hasOwnProperty(valueName)
            ? _.clone(valueEntries[valueName])
            : {
                name: valueName,
                comment: comment,
                tipe: '',
                associativity: null,
                precedence: null,
              };
          valueEntry.args = helper.getArgsParts(args);
          valueEntries[valueName] = valueEntry;
        }
      }
      match = blockRegex.exec(strippedText);
    }
    // Assign associativity and precedence to each infix operator.
    _.map(infixes, ({ associativity, precedence }, valueName) => {
      if (valueEntries[valueName]) {
        let valueEntry = _.clone(valueEntries[valueName]);
        valueEntry.associativity = associativity;
        valueEntry.precedence = precedence;
        valueEntries[valueName] = valueEntry;
      }
    });
    values = values.concat(_.values(valueEntries));
    return { aliases, tipes, values };
  },

  parseImports(text) {
    const regex = helper.importRegex();
    let imports = [];
    let match = regex.exec(text);
    while (match) {
      const exposedString = match[3] + match[4];
      let exposed = null;
      if (exposedString) {
        exposed = exposedString.split(',').map(function(variable) {
          const trimmed = variable.trim();
          return trimmed[0] === '(' ? trimmed.slice(1, -1).trim() : trimmed;
        });
      }
      imports.push({
        name: match[1],
        alias: match[2] || null,
        exposed: exposed,
      });
      match = regex.exec(text);
    }
    return imports;
  },
};
