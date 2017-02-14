'use babel';

import {CompositeDisposable} from 'atom';
import _ from 'underscore-plus';
import helper from './helper';

export function provide(indexer, shouldGetSuggestionsFunction, getInferenceAtCursorPositionFunction, clearCursorInferenceFunction) {
  let usedEnterKeyToAutocomplete = false;
  let inferredType = null;
  let subscriptions = new CompositeDisposable();
  subscriptions.add(atom.commands.onWillDispatch((event) => {
    // Determine if <kbd>enter</kbd> was used to choose a suggestion.
    if (event.type === 'autocomplete-plus:confirm' && event.originalEvent &&
      event.target.getModel && helper.isElmEditor(event.target.getModel())) {
        usedEnterKeyToAutocomplete = (event.originalEvent.keyCode === 13);
    }
  }));
  return {
    selector: '.source.elm',
    disableForSelector: '.source.elm .string, .source.elm .comment',
    inclusionPriority: 1,
    excludeLowerPriority: false,
    getSuggestions({editor, bufferPosition}) {
      if (!shouldGetSuggestionsFunction()) {
        return;
      }
      // Abort if something is selected.
      if (!editor.getSelectedBufferRange().isEmpty()) {
        return;
      }
      return new Promise(resolve => {
        if (!atom.config.get('elmjutsu.autocompleteEnabled')) {
          return resolve([]);
        }
        const prefixRange = [[bufferPosition.row, 0], bufferPosition];
        let prefix = editor.getTextInRange(prefixRange);
        let match;
        const activeToken = helper.getToken(editor);

        if (atom.config.get('elmjutsu.typeAwareAutocompleteEnabled')) {
          const inference = getInferenceAtCursorPositionFunction(editor);
          inferredType = inference ? inference.tipe : null;
        } else {
          inferredType = null;
        }

        const getHintsForPartialPromise = new Promise((resolve) => {
          let preceedingToken = null;
          let succeedingToken = null;
          if (atom.config.get('elmjutsu.autocompleteSnippetsEnabled')) {
            // Get preceeding token.
            editor.backwardsScanInBufferRange(/(\S+)\s/, prefixRange, ({match, stop}) => {
              stop();
              if (helper.tokenRegex().test(match[1])) {
                preceedingToken = match[1];
              }
            });
            // Get succeeding token.
            const suffixRange = [bufferPosition, [bufferPosition.row, editor.getBuffer().lineLengthForRow(bufferPosition.row)]];
            editor.scanInBufferRange(/\s(\S+)/, suffixRange, ({match, stop}) => {
              stop();
              if (helper.tokenRegex().test(match[1])) {
                succeedingToken = match[1];
              }
            });
          }
          return getHintsForPartial(activeToken, inferredType, preceedingToken, succeedingToken, indexer, editor, bufferPosition, resolve);
        });

        const getInferredTypePromise = new Promise((resolve) => {
          if (inferredType && (activeToken.length === 0 || inferredType.startsWith(activeToken)) ) {
            return resolve([{
              replacementPrefix: activeToken,
              text: inferredType,
              rightLabelHTML: specialCompletionIcon() + '<i>Replace with inferred type</i>',
            }]);
          }
          return resolve([]);
        });

        // Construct if/then/else:
        match = prefix.match(/\s+if\s*$/);
        if (match) {
          const constructIfThenPromise = new Promise((resolve) => {
            return resolve([{
              replacementPrefix: match[0],
              snippet: getLeadingSpaces(match[0]) +
                'if ${1:} then\n' +
                helper.tabSpaces() + '${2:}\n' +
                'else\n' +
                helper.tabSpaces() + '${3:}',
              rightLabelHTML: specialCompletionIcon() + '<i>Insert if/then/else</i>'
            }]);
          });
          return Promise.all([
            constructIfThenPromise,
            getHintsForPartialPromise
          ]).then((suggestions) => {
            return resolve(_.flatten(suggestions, true));
          });
        }

        // Construct let/in:
        match = prefix.match(/\s+let\s*$/);
        if (match) {
          const constructLetInPromise = new Promise((resolve) => {
            return resolve([{
              replacementPrefix: match[0],
              snippet: getLeadingSpaces(match[0]) +
                // 'let\n' +
                // helper.tabSpaces() + '${1:} =\n' +
                // helper.tabSpaces() + helper.tabSpaces() + '${2:}\n' +
                // 'in\n' +
                // helper.tabSpaces() + '${3:}',
                'let\n' +
                helper.tabSpaces() + '${1:}\n' +
                'in\n' +
                helper.tabSpaces() + '${2:}',
              rightLabelHTML: specialCompletionIcon() + '<i>Insert let/in</i>'
            }]);
          });
          return Promise.all([
            constructLetInPromise,
            getHintsForPartialPromise
          ]).then((suggestions) => {
            return resolve(_.flatten(suggestions, true));
          });
        }

        // Construct from type annotation (when cursor is below a type annotation):
        // e.g. `update : Msg -> Model -> ( Model, Cmd Msg )` will suggest `update msg model =`
        // e.g. `add3 : Int -> Int -> Int -> Int` will suggest `add3 int1 int2 int3 =`
        // e.g. `funWithInt : Int -> Int` will suggest `funWithInt int =`
        // e.g. `funWithTuple : (Int, Int) -> Int` will suggest `funWithTuple (int1, int2) =`
        // e.g. `funWithRecord : {a : Int, b : Int, c: Int} -> Int` will suggest `funWithRecord record =`
        // e.g. `funWithRecord2 : {a : Int, b : Int, c: Int} -> {a : Int, b : Int, c: Int} -> Int` will suggest `funWithRecord record1 record2 =`
        const typeAnnotation = helper.getTypeAnnotationAbove(editor);
        if (typeAnnotation) {
          const constructFromTypeAnnotationPromise = new Promise((resolve) => {
            return constructFromTypeAnnotation(prefix, typeAnnotation, indexer, resolve);
          });
          return Promise.all([
            constructFromTypeAnnotationPromise,
            getHintsForPartialPromise
          ]).then((suggestions) => {
            return resolve(_.flatten(suggestions, true));
          });
        }

        // e.g. `import ` (there's a space at the end)
        // e.g. `import Dict`
        match = prefix.match(/(?:^|\n)import\s([\w\S]*)$/);
        if (match) {
          return getSuggestionsForImport(prefix, match[1], indexer, resolve);
        }

        // e.g. `import Dict ` (there's a space at the end)
        match = prefix.match(/(?:^|\n)import\s([\w\.]+)\s$/);
        if (match) {
          return resolve([{text: 'exposing (..)'}, {text: 'exposing ('}, {text: 'as '}]);
        }

        // e.g. `import Dict exposing ` (there's a space at the end)
        match = prefix.match(/(?:^|\n)import\s([\w\.]+)(?:\s+as\s+(\w+))?\s+exposing\s$/);
        if (match) {
          return resolve([{text: '(..)'}]);
        }

        // Construct module:
        match = prefix.match(/(?:^|\n)((effect|port)\s+)?module(\s+)?$/);
        if (match) {
          return resolve([{
            replacementPrefix: prefix,
            snippet: (match[1] || '') + 'module ${1:Main} exposing (${2:..})\n\n${3:}',
            rightLabelHTML: specialCompletionIcon() + '<i>Insert module</i>'
          }]);
        }

        // Ending with space:
        match = prefix.match(/(?:\b)(\S+)\s$/);
        if (match) {
          const replacementPrefix = match[0];
          const token = match[1];

          // Construct default arguments:
          const constructDefaultArgumentsPromise = new Promise((resolve) => {
            return constructDefaultArguments(token, indexer, resolve);
          });
          let promises = [constructDefaultArgumentsPromise];

          // Construct "default value for type" replacement:
          // e.g. ` Position ` (there's a space at the end) => `{ x = 0.0, y = 0.0, z = 0.0 }`
          // TODO: Should check if text begins with capital letter after the dot (e.g. `Dict.Dict` will pass, but `Dict.empty` will not).
          const defaultValueForTypeRegex = /[A-Z]\S+/;
          if (defaultValueForTypeRegex.test(replacementPrefix)) {
            const constructDefaultValueForTypePromise = new Promise((resolve) => {
              return constructDefaultValueForType(replacementPrefix, token, indexer, resolve);
            });
            promises.push(constructDefaultValueForTypePromise);
          }

          // Construct case/of:
          // e.g. `    case aBool `
          // e.g. `    case aMaybe `
          // e.g. `    case aMsg `
          // e.g. `    case aMsg of`
          match = prefix.match(/\s+case\s(.+)\s+(|of)$/);
          if (match) {
            const constructCaseOfPromise = new Promise((resolve) => {
              return constructCaseOf(match[0], match[1], indexer, resolve);
            });
            promises.unshift(constructCaseOfPromise);
          }

          if (inferredType) {
            promises.push(getInferredTypePromise);
            promises.push(getHintsForPartialPromise);
          }

          return Promise.all(promises).then((suggestions) => {
            return resolve(_.flatten(suggestions, true));
          });
        }

        let promises = [getHintsForPartialPromise];
        if (inferredType) {
          promises.unshift(getInferredTypePromise);
        }
        return Promise.all(promises).then((suggestions) => {
          return resolve(_.flatten(suggestions, true));
        });
      });
    },
    onDidInsertSuggestion({editor, triggerPosition, suggestion}) {
      if (inferredType) {
        clearCursorInferenceFunction();
      }
      // HACK: If the typed text is equal to the chosen suggestion and <kbd>enter</kbd> was used, insert a newline.
      if (usedEnterKeyToAutocomplete &&
        suggestion.replacementPrefix === suggestion.text &&
        atom.config.get('autocomplete-plus.confirmCompletion') !== 'tab') {
        // `Keymap For Confirming A Suggestion` should be 'enter', 'tab and enter', or 'tab always, enter when suggestion explicitly selected'.
        editor.insertText('\n');
      }
      if (suggestion.fromTypeAnnotationConstructed && editor.lineTextForBufferRow(editor.getCursorBufferPosition().row).trim() !== '') {
        editor.selectToFirstCharacterOfLine();
      }
      if (suggestion.autoImportData) {
        // Replace inserted text (see notes in `getHintsForPartial`).
        const position = editor.getCursorBufferPosition();
        editor.setTextInBufferRange([triggerPosition.translate([0, -suggestion.autoImportData.partial.length]), position], suggestion.autoImportData.text);
        editor.groupChangesSinceCheckpoint(suggestion.autoImportData.checkpoint);
        const filePath = editor.getPath();
        const projectDirectory = helper.getProjectDirectory(filePath);
        indexer.ports.addImportSub.send([filePath, projectDirectory, suggestion.autoImportData.moduleName, suggestion.autoImportData.name]);
      }
    },
    dispose() {
      subscriptions.dispose();
      subscriptions = null;
    }
  };
}

function getSuggestionsForImport(prefix, partial, indexer, resolve) {
  const suggestionsForImportReceived = ([partial, suggestions]) => {
    indexer.ports.suggestionsForImportReceivedCmd.unsubscribe(suggestionsForImportReceived);
      return resolve(_.sortBy(suggestions, 'name').map((suggestion) => {
        return {
          text: 'import ' + suggestion.name,
          replacementPrefix: prefix,
          // TODO: Change below to `descriptionMarkdown` when `autocomplete-plus` adds that option.
          description: suggestion.comment,
          descriptionMoreURL: suggestion.sourcePath === '' ? null : suggestion.sourcePath
        };
      }));
  };
  indexer.ports.suggestionsForImportReceivedCmd.subscribe(suggestionsForImportReceived);
  indexer.ports.getSuggestionsForImportSub.send(partial);
}

function getHintsForPartial(partial, inferredType, preceedingToken, succeedingToken, indexer, editor, triggerPosition, resolve) {
  const autocompleteMinChars = atom.config.get('elmjutsu.autocompleteMinChars');
  if (!inferredType && partial.length < autocompleteMinChars) {
    return resolve([]);
  }
  const hintsForPartialReceived = ([partial, hints]) => {
    indexer.ports.hintsForPartialReceivedCmd.unsubscribe(hintsForPartialReceived);
    const suggestions =
      hints
      .filter(({name}) => {
        return name.length >= autocompleteMinChars;
      })
      .map((hint) => {
        const tipeString = hint.tipe && hint.tipe.trim() !== '' ? hint.tipe : '<i>' + hint.args.join(' ') + '</i>';
        // `autocomplete-plus` (as of v2.33.1) uniquifies based on `suggestion.text`.
        // For example, if the typed text is "empty" and it's not yet imported (from either `Dict` or `Array`), only the first suggestion will be shown (from `Array`).
        // As a workaround, we're adding the module name to `suggestion.text` here, then replacing it with just the name in `onDidInsertSuggestion`.
        const text = hint.isImported ? hint.name : hint.name + ' (' + hint.moduleName + ')';
        let suggestion = {
          replacementPrefix: partial,
          text: text,
          leftLabelHTML: hint.isImported ? hint.moduleName : specialCompletionIcon() + '<i>Auto import</i>',
          rightLabelHTML: tipeString,
          // TODO: Change below to `descriptionMarkdown` when `autocomplete-plus` adds that option.
          description: hint.comment,
          descriptionMoreURL: hint.sourcePath
        };
        if (!hint.isImported) {
          const parts = hint.name.split('.');
          const name = parts.pop();
          suggestion.autoImportData = {
            moduleName: hint.moduleName,
            name: parts.length > 0 ? null : name,
            partial: partial,
            text: hint.name,
            checkpoint: editor.createCheckpoint()
          }; // Custom field.
          // suggestion.displayText = hint.name + ' (' + hint.moduleName + ')';
        }
        if (atom.config.get('elmjutsu.autocompleteSnippetsEnabled')) {
          // TODO: Also consider other infix functions (?).
          let shouldRemoveLastArg =
            ['|>', '>>', '<<'].indexOf(preceedingToken) > -1 ||
            ['<|', '>>', '<<'].indexOf(succeedingToken) > -1;
          suggestion.snippet = hintToSnippet(hint, shouldRemoveLastArg);
          if (hint.isImported) {
            suggestion.displayText = hint.name;
          }
        }
        return suggestion;
      });
    return resolve(suggestions);
  };
  indexer.ports.hintsForPartialReceivedCmd.subscribe(hintsForPartialReceived);
  indexer.ports.getHintsForPartialSub.send([partial, inferredType, atom.config.get('elmjutsu.globalAutocompleteEnabled')]);
}

function hintToSnippet(hint, shouldRemoveLastArg) {
  // If has type annotation:
  if (hint.tipe.trim().length > 0) {
    let parts = helper.getTipeParts(hint.tipe);
    if (shouldRemoveLastArg) {
      parts.pop();
    }
    const tabStops = parts.slice(0, parts.length - 1).map((part, i) => {
      // Replace closing brace with \}.
      return '${' + (i + 1) + ':' + part.replace(/}/g, '\\}') + '}';
    }).join(' ');
    return hint.name + (tabStops.trim() === '' ? '' : ' ' + tabStops);
  }
  // If has no type annotation:
  const args = hint.args;
  if (shouldRemoveLastArg) {
    args.pop();
  }
  return hint.name + args.reduce((acc, arg, i) => {
    return acc + ' ${' + (i + 1) + ':' + arg + '}';
  }, '');
}

function constructFromTypeAnnotation(prefix, typeAnnotation, indexer, resolve) {
  const fromTypeAnnotationConstructed = (construction) => {
    indexer.ports.fromTypeAnnotationConstructedCmd.unsubscribe(fromTypeAnnotationConstructed);
    if (construction.startsWith(prefix)) {
      let suggestion = {
          replacementPrefix: prefix,
          text: construction,
          rightLabelHTML: specialCompletionIcon() + '<i>Define from type annotation</i>',
          fromTypeAnnotationConstructed: true // Custom field.
        };
      // if (atom.config.get('elmjutsu.autocompleteSnippetsEnabled')) {
      //   const parts = construction.replace(new RegExp(' =\n' + helper.tabSpaces() + '$', 'm'), '').split(' ');
      //   if (parts.length > 1) {
      //     const functionName = parts.shift();
      //     const functionArgs = parts.join(' ');
      //     const argsParts = helper.getArgsParts(functionArgs);
      //     const tabStops = argsParts.map((part, i) => {
      //       // Replace closing brace with \}.
      //       return '${' + (i + 1) + ':' + part.replace(/}/g, '\\}') + '}';
      //     }).join(' ');
      //     suggestion.snippet = functionName + (tabStops.trim() === '' ? '' : ' ' + tabStops) + ' =\n' + helper.tabSpaces() + '${' + (argsParts.length+1) + ':}';
      //     suggestion.displayText = construction;
      //   }
      // }
      return resolve([suggestion]);
    }
    return resolve([]);
  };
  indexer.ports.fromTypeAnnotationConstructedCmd.subscribe(fromTypeAnnotationConstructed);
  indexer.ports.constructFromTypeAnnotationSub.send(typeAnnotation);
}

function constructCaseOf(replacementPrefix, token, indexer, resolve) {
  const caseOfConstructed = (construction) => {
    indexer.ports.caseOfConstructedCmd.unsubscribe(caseOfConstructed);
    if (construction) {
      const text = getLeadingSpaces(replacementPrefix) + 'case ' + token + ' of\n' +
        construction
        // Insert tab stops.
        .split('|')
        .map((part, i) => {
          if (part.trim().length > 0) {
            return part + '${' + (i + 1) + ':}';
          }
          return '';
        })
        .join('')
        // Insert leading spaces.
        .split('\n')
        .map((line) => {
          return helper.tabSpaces() + line;
        })
        .join('\n');
      let suggestion = {
          replacementPrefix: replacementPrefix,
          snippet: text,
          rightLabelHTML: specialCompletionIcon() + '<i>Insert case/of</i>'
        };
      return resolve([suggestion]);
    }
    return resolve([]);
  };
  indexer.ports.caseOfConstructedCmd.subscribe(caseOfConstructed);
  indexer.ports.constructCaseOfSub.send(token);
}

function constructDefaultArguments(token, indexer, resolve) {
  const defaultArgumentsConstructed = (args) => {
    indexer.ports.defaultArgumentsConstructedCmd.unsubscribe(defaultArgumentsConstructed);
    if (args) {
      let suggestion = {
        replacementPrefix: '',
        rightLabelHTML: specialCompletionIcon() + '<i>Insert default arguments</i>'
      };
      if (atom.config.get('elmjutsu.autocompleteSnippetsEnabled')) {
        suggestion.snippet = args.map((arg, i) => { return '${' + (i + 1) + ':' + arg.replace(/}/g, '\\}') + '}'; }).join(' ');
      } else {
        suggestion.text = args.join(' ');
      }
      return resolve([suggestion]);
    }
    return resolve([]);
  };
  indexer.ports.defaultArgumentsConstructedCmd.subscribe(defaultArgumentsConstructed);
  indexer.ports.constructDefaultArgumentsSub.send(token);
}

function constructDefaultValueForType(replacementPrefix, token, indexer, resolve) {
  const defaultValueForTypeConstructed = (value) => {
    indexer.ports.defaultValueForTypeConstructedCmd.unsubscribe(defaultValueForTypeConstructed);
    if (value) {
      let suggestion = {
          replacementPrefix: replacementPrefix,
          text: value,
          rightLabelHTML: specialCompletionIcon() + '<i>Replace type with default</i>'
        };
      return resolve([suggestion]);
    }
    return resolve([]);
  };
  indexer.ports.defaultValueForTypeConstructedCmd.subscribe(defaultValueForTypeConstructed);
  indexer.ports.constructDefaultValueForTypeSub.send(token);
}

function specialCompletionIcon() {
  return '<span class="icon-zap"></span>';
}

function getLeadingSpaces(text) {
  const numLeadingSpaces = text.search(/\S|$/) + 1;
  return new Array(numLeadingSpaces).join(' ');
}
