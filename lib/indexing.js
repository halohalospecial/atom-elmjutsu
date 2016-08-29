'use babel';

const Range = require('atom').Range;
import path from 'path';
import fs from 'fs-extra';
const _ = require('underscore-plus');
import helper from './helper';

export default {

  sendFileContentsChanged(indexer, filePath) {
    const text = fs.readFileSync(filePath).toString();
    indexer.ports.fileContentsChangedSub.send([filePath, parseModuleDocs(text, filePath), parseImports(text)]);
  },

  sendActiveFile(indexer, editor) {
    const text = editor.getText();
    const filePath = editor.getPath();
    const projectDirectory = helper.getProjectDirectory(filePath);
    indexer.ports.fileContentsChangedSub.send([filePath, parseModuleDocs(text, filePath), parseImports(text)]);
    indexer.ports.activeFileChangedSub.send({filePath, projectDirectory});
    indexer.ports.activeTokenChangedSub.send(helper.getToken(editor));
  },

  sendActiveTextAndToken(indexer, editor) {
    const text = editor.getText();
    const filePath = editor.getPath();
    indexer.ports.fileContentsChangedSub.send([filePath, parseModuleDocs(text, filePath), parseImports(text)]);
    indexer.ports.activeTokenChangedSub.send(helper.getToken(editor));
  },

  sendActiveToken(indexer, editor) {
    indexer.ports.activeTokenChangedSub.send(helper.getToken(editor));
  },

  sendProjectDependencies(indexer, projectDirectory, workDirectory) {
    // If `exact-dependencies.json` exists in the work directory, get the dependencies from there. (Works with `linter-elm-make`'s temporary work directories.)
    // Otherwise, approximate package versions from `elm-package.json`.
    var updatedDependencies = null;
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

  parseDirectoryFiles(indexer, directory) {
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
          indexer.ports.fileContentsChangedSub.send([filePath, parseModuleDocs(text, filePath), parseImports(text)]);
        });
      }
    });
    nextDirectories.forEach((directory) => {
      this.parseDirectoryFiles(indexer, directory);
    });
  }

};

function parseModuleDocs(text, filePath) {
  const moduleNameRegex = /(?:^|\n)((effect|port)\s+)?(module)\s+(\S+)(\s|$)/;
  var match = moduleNameRegex.exec(text);
  if (match && match.length > 4 && match[4]) {
    const moduleName = match[4];
    const {aliases, tipes, values} = parseModuleValues(text);
    return {
      sourcePath: filePath,
      name: moduleName,
      values: {
        aliases: aliases,
        tipes: tipes,
        values: values
      },
      comment: '' // TODO
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
}

function formatSymbolName(valueName) {
  // Strip parentheses in value name (such as in infix functions).
  return valueName.trim().replace(/\(|\)/g, '');
}

function formatTipe(tipe) {
  return tipe.trim()
    // Replace whitespaces and newlines with single spaces.
    .replace(/( |\n)+/g, ' ')
    // Remove comments.
    .replace(/--.*$|{-[\s\S]*-}/gm, '');
}

// TODO: Handle something like: (width, height) = (100, 200)
// TODO: Handle something like: {width, height} = {width = 100, height = 200}
function parseModuleValues(text) {
  var aliases = [];
  var tipes = [];
  var values = [];
  var valueEntries = {};
  // Remove commented lines and blocks.
  const strippedText = text.replace(/--.*$|{-[\s\S]*-}/gm, '');
  const blockRegex = /^(?!-|{)(\S+)\s(\s*(.|\n)*?(?=\n^\S|$(?![\r\n])))/gm;
  var match = blockRegex.exec(strippedText);
  while (match) {
    const block = match[0];
    if (/^(port module|module|import)\s/.test(block)) {
      // Ignore.

    } else if (/^type alias\s/.test(block)) {
      const parts = block.replace(/^type alias\s+/, '').split('=');
      const aliasName = formatSymbolName(parts.shift().split(/\s/)[0]);
      const tipe = formatTipe(parts.join('='));
      values.push({
        name: aliasName,
        comment: '', // TODO
        tipe: tipe,
        args: []
      });

    } else if (/^type\s/.test(block)) {
      const parts = block.replace(/^type\s+/, '').split('=');
      const tipeName = formatSymbolName(parts.shift().split(/\s/)[0]);
      const tipe = formatTipe(parts.join('='));
      const cases = tipe.split('|').map((rawCase) => {
        return rawCase.trim().split(' ', 1)[0];
      });
      tipes.push({
        name: tipeName,
        comment: '', // TODO
        tipe: tipeName,
        cases: cases,
        args: []
      });

    } else if (/^port\s/.test(block)) {
      const parts = block.replace(/^port\s+/, '').split(':');
      const valueName = formatSymbolName(parts.shift());
      const tipe = formatTipe(parts.join(':'));
      values.push({
        name: valueName,
        comment: '', // TODO
        tipe: tipe,
        args: []
      });

    } else {
      const valueName = formatSymbolName(match[1]);
      const rest = match[2].trim();
      if (rest.startsWith(':')) {
        // Type annotation.
        const tipe = formatTipe(rest.replace(':', ''));
        valueEntries[valueName] = {
          name: valueName,
          comment: '', // TODO
          tipe: tipe,
          args: []
        };

      } else {
        // Arguments.
        const args = formatTipe(rest.split('=', 1)[0]);
        let valueEntry = valueEntries[valueName] ? _.clone(valueEntries[valueName]) : {
          name: valueName,
          comment: '', // TODO
          tipe: args === '' ? '' : '*' + args + '*'
        };
        valueEntry.args = args === '' ? [] : args.split(' ');
        valueEntries[valueName] = valueEntry;
      }
    }
    match = blockRegex.exec(strippedText);
  }
  values = values.concat(_.values(valueEntries));
  return {aliases, tipes, values};
}

function parseImports(text) {
  const regex = /(?:^|\n)import\s([\w\.]+)(?:\sas\s(\w+))?(?:\sexposing\s*\(((?:\s*(?:\w+|\(.+\))\s*,)*)\s*((?:\.\.|\w+|\(.+\)))\s*\))?/g;
  var imports = [];
  var match = regex.exec(text);
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
}
