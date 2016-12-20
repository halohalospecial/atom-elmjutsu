'use babel';

const Range = require('atom').Range;
import path from 'path';
import fs from 'fs-extra';
const _ = require('underscore-plus');
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
    let aliases = [];
    let tipes = [];
    let values = [];
    let valueEntries = {};
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

      } else if (helper.typeAliasBlockRegex().test(block)) {
        const parts = block.replace(/^type alias\s+/, '').split('=');
        const aliasName = helper.formatSymbolName(parts.shift().split(/\s/)[0]);
        const tipe = formatTipe(parts.join('='));
        values.push({
          name: aliasName,
          comment: comment,
          tipe: tipe,
          args: []
        });

      } else if (helper.typeBlockRegex().test(block)) {
        const parts = block.replace(/^type\s+/, '').split('=');
        const tipeName = helper.formatSymbolName(parts.shift().split(/\s/)[0]);
        const tipe = formatTipe(parts.join('='));
        const cases = tipe.split('|').map((rawCase) => {
          return rawCase.trim().split(' ', 1)[0];
        });
        tipes.push({
          name: tipeName,
          comment: comment,
          tipe: tipeName,
          cases: cases,
          args: []
        });

      } else if (helper.portBlockRegex().test(block)) {
        const parts = block.replace(/^port\s+/, '').split(':');
        const valueName = helper.formatSymbolName(parts.shift());
        const tipe = formatTipe(parts.join(':'));
        values.push({
          name: valueName,
          comment: comment,
          tipe: tipe,
          args: []
        });

      } else {
        // Functions.
        const valueName = helper.formatSymbolName(match[4]);
        const rest = match[5].trim();
        if (rest.startsWith(':')) {
          // Type annotation.
          const tipe = formatTipe(rest.replace(':', ''));
          valueEntries[valueName] = {
            name: valueName,
            comment: comment,
            tipe: tipe,
            args: []
          };

        } else {
          // Arguments.
          const args = formatTipe(rest.split('=', 1)[0]);
          let valueEntry = valueEntries[valueName] ? _.clone(valueEntries[valueName]) : {
            name: valueName,
            comment: comment,
            tipe: args === '' ? '' : '*' + args + '*'
          };
          valueEntry.args = helper.splitArgs(args);
          valueEntries[valueName] = valueEntry;
        }
      }
      match = blockRegex.exec(strippedText);
    }
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

function formatTipe(tipe) {
  return tipe.trim()
    // Replace whitespaces and newlines with single spaces.
    .replace(/( |\n)+/g, ' ')
    // Remove comments.
    .replace(/--.*$|{-[\s\S]*-}/gm, '');
}
