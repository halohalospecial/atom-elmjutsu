'use babel';

import {Range} from 'atom';
import path from 'path';
import fs from 'fs-extra';
import _ from 'underscore-plus';
import helper from './helper';

export default {

  sendFileContentsChanged(indexer, filePath) {
    const projectDirectory = helper.getProjectDirectory(filePath);
    if (!projectDirectory) {
      return;
    }
    const text = fs.readFileSync(filePath).toString();
    indexer.ports.fileContentsChangedSub.send([filePath, projectDirectory, this.parseModuleDocs(text, filePath), this.parseImports(text)]);
  },

  sendActiveFile(indexer, editor) {
    const text = editor.getText();
    const filePath = editor.getPath();
    if (!filePath) {
      return;
    }
    const projectDirectory = helper.getProjectDirectory(filePath);
    if (!projectDirectory) {
      return;
    }
    indexer.ports.fileContentsChangedSub.send([filePath, projectDirectory, this.parseModuleDocs(text, filePath), this.parseImports(text)]);
    indexer.ports.activeFileChangedSub.send([{filePath, projectDirectory}, helper.getActiveTopLevel(editor), helper.getToken(editor)]);
  },

  sendActiveTextAndToken(indexer, editor) {
    const text = editor.getText();
    const filePath = editor.getPath();
    const projectDirectory = helper.getProjectDirectory(filePath);
    if (!projectDirectory) {
      return;
    }
    indexer.ports.fileContentsChangedSub.send([filePath, projectDirectory, this.parseModuleDocs(text, filePath), this.parseImports(text)]);
    indexer.ports.activeTokenChangedSub.send([helper.getActiveTopLevel(editor), helper.getToken(editor)]);
  },

  sendActiveToken(indexer, editor) {
    indexer.ports.activeTokenChangedSub.send([helper.getActiveTopLevel(editor), helper.getToken(editor)]);
  },

  sendClearHintsCache(indexer) {
    indexer.ports.clearHintsCacheSub.send(null);
  },

  sendEnteredInference(indexer, inference) {
    indexer.ports.inferenceEnteredSub.send(inference);
  },

  sendProjectDependencies(indexer, projectDirectory, workDirectory) {
    // If `exact-dependencies.json` exists in the work directory, get the dependencies from there. (Works with `linter-elm-make`'s temporary work directories.)
    // Otherwise, approximate package versions from `elm-package.json`.
    let updatedDependencies = null;
    // Check if `exact-dependencies.json` exists.
    let exactDependenciesJson = null;
    try {
      exactDependenciesJson = JSON.parse(fs.readFileSync(path.join(workDirectory, 'elm-stuff', 'exact-dependencies.json')).toString());
    } catch(e) {
    }
    if (exactDependenciesJson && (exactDependenciesJson instanceof Object)) {
      updatedDependencies = _.pairs(exactDependenciesJson);

    } else {
      // Get approximate package versions from `elm-package.json`.
      // Example: If the version range is "4.0.3 <= v < 5.0.0", return "4.0.3".
      let elmPackageJson = null;
      try {
        elmPackageJson = JSON.parse(fs.readFileSync(path.join(projectDirectory, 'elm-package.json')).toString());
      } catch(e) {
      }
      if (!elmPackageJson || !elmPackageJson.dependencies || !(elmPackageJson.dependencies instanceof Object)) {
        return;
      }
      updatedDependencies = _.pairs(elmPackageJson.dependencies).map(([packageName, versionRange]) => {
        return [packageName, versionRange.split(' ')[0]];
      });
    }
    if (updatedDependencies) {
      indexer.ports.projectDependenciesChangedSub.send([projectDirectory, updatedDependencies]);
    }
  },

  parseDirectoryFiles(indexer, projectDirectory, directory) {
    if (!fs.existsSync(directory)) {
      helper.log('Error parsing source directory ' + directory + ' (directory does not exist)', 'red');
      return;
    }
    const filenames = fs.readdirSync(directory);
    const nextDirectories = [];
    filenames.forEach((filename) => {
      const filePath = path.join(directory, filename);
      const stats = fs.statSync(filePath);
      if (stats.isDirectory() && filename !== 'elm-stuff') {
        nextDirectories.push(filePath);
      } else if (stats.isFile() && path.extname(filename) === '.elm') {
        helper.log('Parsing ' + filePath);
        const text = fs.readFileSync(filePath).toString();
        setTimeout(() => {
          indexer.ports.fileContentsChangedSub.send([filePath, projectDirectory, this.parseModuleDocs(text, filePath), this.parseImports(text)]);
        });
      }
    });
    nextDirectories.forEach((directory) => {
      this.parseDirectoryFiles(indexer, projectDirectory, directory);
    });
  },

  parseModuleDocs(text, filePath) {
    let match = this.parseModuleNameAndComment(text);
    if (match) {
      const {aliases, tipes, values} = this.parseModuleValues(text);
      return {
        sourcePath: filePath,
        name: match.name,
        values: {
          aliases: aliases,
          tipes: tipes,
          values: values
        },
        comment: match.comment
      };
    }
    return {
      sourcePath: '',
      name: '',
      values: {
        aliases: [],
        tipes: [],
        values: []
      },
      comment: ''
    };
  },

  parseModuleNameAndComment(text) {
    const match = helper.moduleNameRegex().exec(text);
    if (match && match.length > 3 && match[3]) {
      return {
        name: match[3],
        comment: match[7] || ''
      };
    }
    return null;
  },

  // TODO: Handle something like: (width, height) = (100, 200)
  // TODO: Handle something like: {width, height} = {width = 100, height = 200}
  parseModuleValues(text) {
    const toTipeCase = (rawCase) => {
      const tipeCaseParts = rawCase.trim().split(' ');
      const tipeCaseName = tipeCaseParts.shift();
      const tipeCaseArgs = helper.getArgsParts(tipeCaseParts.join(' '));
      return {
        name: tipeCaseName,
        args: tipeCaseArgs
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
        const [_, prefix, precedence, name] = match[3].match(helper.infixRegex());
        let associativity;
        if (prefix === 'infix') {
          associativity = 'non';
        } else if (prefix === 'infixl') {
          associativity = 'left';
        } else if (prefix === 'infixr') {
          associativity = 'right';
        }
        infixes[name] = {associativity, precedence: parseInt(precedence, 10)};

      } else if (helper.typeAliasBlockRegex().test(block)) {
        const parts = block.replace(/^type alias\s+/, '').split('=');
        const parts2 = parts.shift().split(/\s/);
        const aliasName = helper.formatSymbolName(parts2[0]);
        parts2.shift();
        const args = parts2.filter((arg) => { return arg.trim().length > 0; } );
        const tipe = helper.formatTipe(parts.join('='));
        aliases.push({
          name: aliasName,
          comment: comment,
          tipe: tipe,
          args: args,
          associativity: null,
          precedence: null
        });

      } else if (helper.typeBlockRegex().test(block)) {
        const parts = block.replace(/^type\s+/, '').split('=');
        const parts2 = parts.shift().split(/\s/);
        const tipeName = helper.formatSymbolName(parts2[0]);
        parts2.shift();
        const args = parts2.filter((arg) => { return arg.trim().length > 0; } );
        const tipe = helper.formatTipe(parts.join('='));
        const cases = tipe.split('|').map(toTipeCase);
        tipes.push({
          name: tipeName,
          comment: comment,
          tipe: tipeName,
          cases: cases,
          args: args,
          associativity: null,
          precedence: null
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
          precedence: null
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
            precedence: null
          };

        } else {
          // Arguments.
          const args = helper.formatTipe(rest.split('=', 1)[0]);
          let valueEntry = valueEntries.hasOwnProperty(valueName) ? _.clone(valueEntries[valueName]) : {
            name: valueName,
            comment: comment,
            tipe: '',
            associativity: null,
            precedence: null
          };
          valueEntry.args = helper.getArgsParts(args);
          valueEntries[valueName] = valueEntry;
        }
      }
      match = blockRegex.exec(strippedText);
    }
    // Assign associativity and precedence to each infix operator.
    _.map(infixes, ({associativity, precedence}, valueName) => {
      if (valueEntries[valueName]) {
        let valueEntry = _.clone(valueEntries[valueName]);
        valueEntry.associativity = associativity;
        valueEntry.precedence = precedence;
        valueEntries[valueName] = valueEntry;
      }
    });
    values = values.concat(_.values(valueEntries));
    return {aliases, tipes, values};
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
          return trimmed[0] === '(' ? trimmed.slice(1,-1).trim() : trimmed;
        });
      }
      imports.push({
        name: match[1],
        alias: match[2] || null,
        exposed: exposed
      });
      match = regex.exec(text);
    }
    return imports;
  },

};
