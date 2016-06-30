'use babel';

import { CompositeDisposable } from 'atom';
import path from 'path';
import fs from 'fs';
const helpers = require('atom-linter');
const esprima = require('esprima');
const traverse = require('ast-traverse');
const _ = require('underscore-plus');
const FindUsagesView = require('./find-usages-view');
const FindUnusedView = require('./find-unused-view');

export default {

  activate() {
    const self = this;
    this.stateBeforeFind = null;
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.commands.add('atom-text-editor:not([mini])[data-grammar^="source elm"]', {
      'elm-fu:find-usages': () => this.findUsages(),
      'elm-fu:find-unused': () => this.findUnused()
    }));
    this.findUsagesView = new FindUsagesView();
    this.findUsagesView.onDidSelect(({projectDirectory, rangeText, moduleName, functionName, index}) => {
      self.findUsagesView.cancelling = true;
      self.viewElmFile(projectDirectory, rangeText, moduleName, functionName, index, true).then(() => {
        self.findUsagesView.cancelling = false;
        self.findUsagesView.focusFilterEditor();
      });
    });
    this.findUsagesView.onDidConfirm(({projectDirectory, rangeText, moduleName, functionName, index}) => {
      self.viewElmFile(projectDirectory, rangeText, moduleName, functionName, index, false);
      self.destroyUsageMarker();
    });
    this.findUsagesView.onDidCancel(() => {
      self.revertToStateBeforeFind();
    });
    this.findUnusedView = new FindUnusedView();
    this.findUnusedView.onDidSelect(({projectDirectory, moduleName, functionName}) => {
      self.findUnusedView.cancelling = true;
      self.viewElmFile(projectDirectory, null, moduleName, functionName, null, true).then(() => {
        self.findUnusedView.cancelling = false;
        self.findUnusedView.focusFilterEditor();
      });
    });
    this.findUnusedView.onDidConfirm(({projectDirectory, moduleName, functionName}) => {
      self.viewElmFile(projectDirectory, null, moduleName, functionName, null, false);
      self.destroyUsageMarker();
    });
    this.findUnusedView.onDidCancel(() => {
      self.revertToStateBeforeFind();
    });
  },

  deactivate() {
    this.stateBeforeFind = null;
    this.findUsagesView.destroy();
    this.findUnusedView.destroy();
    this.subscriptions.dispose();
  },

  storeStateBeforeFind(editor) {
    const editorView = atom.views.getView(editor);
    this.stateBeforeFind = {
      existingEditorIds: new Set(atom.workspace.getTextEditors().map(({id}) => id)),
      pane: atom.workspace.getActivePane(),
      editor: editor,
      cursorPosition: editor.getCursorBufferPosition(),
      scrollTop: editorView.getScrollTop(),
      scrollLeft: editorView.getScrollLeft()
    };
  },

  revertToStateBeforeFind() {
    const pane = this.stateBeforeFind.pane;
    const editor = this.stateBeforeFind.editor;
    pane.activateItem(editor);
    const editorView = atom.views.getView(editor);
    editor.setCursorBufferPosition(this.stateBeforeFind.cursorPosition);
    editorView.setScrollTop(this.stateBeforeFind.scrollTop);
    editorView.setScrollLeft(this.stateBeforeFind.scrollLeft);
    this.closeTemporaryEditors();
    this.destroyUsageMarker();
  },

  closeTemporaryEditors(exceptEditorId) {
    atom.workspace.getTextEditors().forEach((textEditor) => {
      if ((!exceptEditorId || (exceptEditorId && textEditor.id !== exceptEditorId)) && !this.stateBeforeFind.existingEditorIds.has(textEditor.id)) {
        textEditor.destroy();
      }
    });
  },

  viewElmFile(projectDirectory, rangeText, moduleName, functionName, index, isPreview) {
    const self = this;
    const filePath = path.join(projectDirectory, moduleName.replace(/\./g, path.sep) + '.elm');
    // Open file containing function.
    return atom.workspace.open(filePath, {pending: isPreview}).then((editor) => {
      var usageRange = editor.getSelectedBufferRange();
      // Move the cursor to the function definition's position.
      const regex = new RegExp('^(' + _.escapeRegExp(functionName) + ')((?![:=]).|\n)*?=');
      // Look for top-level function.
      editor.scanInBufferRange(regex, [[0, 0], editor.getEofBufferPosition()], ({match, range, stop}) => {
        const diff = match[1].length - match[0].length;
        usageRange = range.translate([0, 0], [0, diff]);
        stop();
      });
      if (rangeText) {
        // Look for instance of rangeText inside top-level function.
        var matchIndex = 0;
        editor.scanInBufferRange(new RegExp(_.escapeRegExp(rangeText), 'g'), [usageRange.start, editor.getEofBufferPosition()], ({range, stop}) => {
          if (matchIndex === index) {
            usageRange = range;
            stop();
          }
          matchIndex = matchIndex + 1;
        });
      }
      if (isPreview) {
        self.destroyUsageMarker();
        self.usageMarker = editor.markBufferRange(usageRange, {invalidate: 'never', persistent: false});
        editor.decorateMarker(self.usageMarker, {type: 'highlight', class: 'elm-fu-usage-highlight'});
      }
      editor.setCursorBufferPosition(usageRange.start);
      editor.scrollToCursorPosition({center: true});
      if (!isPreview) {
        self.closeTemporaryEditors(editor.id);
      }
    });
  },

  destroyUsageMarker() {
    if (this.usageMarker) {
      this.usageMarker.destroy();
      this.usageMarker = null;
    }
  },

  findUsages() {
    const editor = atom.workspace.getActiveTextEditor();
    this.storeStateBeforeFind(editor);
    this.findUsagesView.show();
    const cancel = () => {
      this.findUsagesView.hide();
    };
    const editorFilePath = editor.getPath();
    if (!editorFilePath) {
      return cancel();
    }
    const range = editor.bufferRangeForScopeAtCursor('entity.name.function.elm');
    const rangeText = (range && editor.getTextInBufferRange(range)) || editor.getWordUnderCursor();
    if (!rangeText || rangeText.trim() === '') {
      return cancel();
    }
    let moduleName = null;
    // Get module name.
    editor.scanInBufferRange(/^\b((effect|port)\s+)?(module)\s+(\S+)(\s|$)/, [[0, 0], editor.getEofBufferPosition()], ({match, stop}) => {
      moduleName = match[4];
      stop();
    });
    if (!moduleName) {
      return cancel();
    }
    this.getProjectBuildArtifactsDirectory(editorFilePath).then((buildArtifactsDirectory) => {
      if (!buildArtifactsDirectory) {
        return cancel();
      }
      const projectDirectory = this.getProjectDirectory(path.dirname(editorFilePath));
      if (projectDirectory === null) {
        return cancel();
      }
      const workDirectory = this.getWorkDirectory(editorFilePath) || projectDirectory;
      if (workDirectory !== projectDirectory) {
        buildArtifactsDirectory = path.join(workDirectory, buildArtifactsDirectory.replace(projectDirectory, ''));
      }
      const matches = buildArtifactsDirectory.match('.*\\' + path.sep + '(.+)\\' + path.sep + '(.+)\\' + path.sep + '(.+)$');
      const user = matches[1];
      const project = matches[2];
      const callee = '_' + user + '$' + project + '$' + moduleName.replace(/\./g, '_') + '$' + rangeText.trim();

      const outputJSString = this.getOutputJSString(buildArtifactsDirectory);
      const ast = esprima.parse(outputJSString, {sourceType: 'script'});
      var calleesLookup = {}; // key = callee's node.name, value = array of callers (node.name)
      const self = this;
      traverse(ast, {pre: function(node, parent, prop, idx) {
        if (node.type === 'Identifier') {
          // Only get top-level functions.
          if (parent.type === 'VariableDeclarator' && prop === 'id' && node.name.startsWith('_' + user + '$' + project + '$')) {
            self.getCallees(parent.init, node.name, calleesLookup);
          }
        }
      }});
      // TODO Cache `calleesLookup`.
      // TODO Only update `calleesLookup` when a .elmo file gets updated.
      if (!calleesLookup[callee]) {
        this.findUsagesView.setError('Nothing');
        return;
      }
      const callers = calleesLookup[callee].map((caller) => {
        const matches = caller.match(/^_.+\$.+\$(.+)\$(.+)$/);
        const moduleName = matches[1].replace(/_/g, '.');
        const functionName = matches[2];
        return {moduleName: moduleName, functionName: functionName, fullName: moduleName + '.' + functionName};
      });
      console.log('callers', callers); // // //
      console.log('groupBy1', _.chain(callers).groupBy(callers, 'fullName').value()); // // //
      console.log('groupBy2', _.groupBy(callers, 'fullName')); // // //
      const groupedCallers =
        _.chain(callers)
        .groupBy('fullName')
        .values()
        .map((group) => {
          console.log('group', group); // // //
          return group.map((caller, index) => {
            caller.index = index;
            return caller;
          });
        })
        .flatten(true)
        .value();
      this.findUsagesView.setCallers(projectDirectory, rangeText.trim(), groupedCallers);
    });
  },

  getOutputJSString(buildArtifactsDirectory) {
    var elmoString = '';
    fs.readdirSync(buildArtifactsDirectory).forEach((filename) => {
      const ext = path.extname(filename);
      if (ext === '.elmo') {
        elmoString += fs.readFileSync(path.join(buildArtifactsDirectory, filename));
      }
    });
    return elmoString;
  },

  getCallees(node, caller, calleesLookup) {
    if (!node) {
      return;
    }
    if (node.type === 'Identifier') {
      const newCalleesLookup = calleesLookup[node.name] || [];
      newCalleesLookup.push(caller);
      calleesLookup[node.name] = newCalleesLookup;

    } else if (node.type === 'CallExpression') {
      this.getCallees(node.callee, caller, calleesLookup);
      node.arguments.forEach((argument) => {
        this.getCallees(argument, caller, calleesLookup);
      });

    } else if (node.type === 'ArrayExpression') {
      node.elements.forEach((element) => {
        this.getCallees(element, caller, calleesLookup);
      });

    } else if (node.type === 'FunctionExpression') {
      this.getCallees(node.body, caller, calleesLookup);

    } else if (node.type === 'BlockStatement') {
      node.body.forEach((body) => {
        this.getCallees(body, caller, calleesLookup);
      });

    } else if (node.type === 'ReturnStatement') {
      this.getCallees(node.argument, caller, calleesLookup);

    } else if (node.type === 'ConditionalExpression') {
      this.getCallees(node.test, caller, calleesLookup);
      this.getCallees(node.consequent, caller, calleesLookup);
      this.getCallees(node.alternate, caller, calleesLookup);

    } else if (node.type === 'ObjectExpression') {
      node.properties.forEach((property) => {
        this.getCallees(property, caller, calleesLookup);
      });

    } else if (node.type === 'Property') {
      this.getCallees(node.value, caller, calleesLookup);

    } else if (node.type === 'SwitchStatement') {
      this.getCallees(node.discriminant, caller, calleesLookup);
      node.cases.forEach((case_) => {
        this.getCallees(case_, caller, calleesLookup);
      });

    } else if (node.type === 'SwitchCase') {
      this.getCallees(node.test, caller, calleesLookup);
      node.consequent.forEach((consequent) => {
        this.getCallees(consequent, caller, calleesLookup);
      });

    } else if (node.type === 'VariableDeclaration') {
      node.declarations.forEach((declaration) => {
        this.getCallees(declaration, caller, calleesLookup);
      });

    } else if (node.type === 'VariableDeclarator') {
      this.getCallees(node.init, caller, calleesLookup);

    }
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
      return helpers.exec(elmMakePath, ['--help'], {
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
  },

  // Provided by `linter-elm-make`.
  consumeGetWorkDirectory(getWorkDirectory) {
    this.getWorkDirectory = getWorkDirectory;
  },

  findUnused() {
    const editor = atom.workspace.getActiveTextEditor();
    this.storeStateBeforeFind(editor);
    this.findUnusedView.show();
    const cancel = () => {
      this.findUnusedView.hide();
    };
    const editorFilePath = editor.getPath();
    if (!editorFilePath) {
      return cancel();
    }
    const projectDirectory = this.getProjectDirectory(path.dirname(editorFilePath));
    if (projectDirectory === null) {
      return cancel();
    }
    this.getProjectBuildArtifactsDirectory(editorFilePath).then((buildArtifactsDirectory) => {
      if (!buildArtifactsDirectory) {
        return cancel();
      }
      const workDirectory = this.getWorkDirectory(editorFilePath) || projectDirectory;
      if (workDirectory !== projectDirectory) {
        buildArtifactsDirectory = path.join(workDirectory, buildArtifactsDirectory.replace(projectDirectory, ''));
      }
      const matches = buildArtifactsDirectory.match('.*\\' + path.sep + '(.+)\\' + path.sep + '(.+)\\' + path.sep + '(.+)$');
      const user = matches[1];
      const project = matches[2];
      const outputJSString = this.getOutputJSString(buildArtifactsDirectory);
      const ast = esprima.parse(outputJSString, {sourceType: 'script'});
      var symbols = [];
      var calleesLookup = {};
      const self = this;
      traverse(ast, {pre: function(node, parent, prop, idx) {
        if (node.type === 'Identifier') {
          // Only get top-level functions.
          if (parent.type === 'VariableDeclarator' && prop === 'id' && node.name.startsWith('_' + user + '$' + project + '$')) {
            symbols.push(node.name);
            self.getCallees(parent.init, node.name, calleesLookup);
          }
        }
      }});
      const unusedSymbols = symbols.map((symbol) => {
        const matches = symbol.match(/^_.+\$.+\$(.+)\$(.+)$/);
        const moduleName = matches[1].replace(/_/g, '.');
        const functionName = matches[2];
        return {moduleName: moduleName, functionName: functionName, rawName: symbol};
      }).filter(({functionName, rawName}) => {
        return (!calleesLookup[rawName] || calleesLookup[rawName].length === 0) &&
          functionName !== 'main' && functionName[0] !== functionName[0].toUpperCase();
      });
      if (unusedSymbols.length > 0) {
        this.findUnusedView.setSymbols(projectDirectory, unusedSymbols);
      } else {
        this.findUnusedView.setError('Nothing');
      }
    });
  },
};
