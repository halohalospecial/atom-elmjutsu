'use babel';

import { CompositeDisposable } from 'atom';
import _ from 'underscore-plus';
import fuzzaldrin from 'fuzzaldrin-plus';
import helper from './helper';

export function provide(
  indexer,
  shouldGetSuggestionsFunction,
  getInferenceAtCursorPositionFunction,
  clearCursorInferenceFunction,
  setAutocompleteActiveFunction
) {
  let subscriptions = new CompositeDisposable();
  let usedEnterKeyToAutocomplete = false;
  let inferredType = null;

  setTimeout(() => {
    // If `elmjutsu`'s and `language-elm`'s autocomplete features are both enabled, offer to disable `language-elm`'s.
    subscriptions.add(
      atom.config.observe('elmjutsu.autocompleteEnabled', enabled => {
        if (enabled && atom.config.get('language-elm.autocompleteEnabled')) {
          const notification = atom.notifications.addInfo(
            "It's recommended to disable `language-elm`'s autocomplete feature",
            {
              description:
                "Since `elmjutsu`'s autocomplete feature is enabled, it's recommended to disable the autocomplete feature of `language-elm`.<br><br>" +
                "Do you want me to disable `language-elm`'s autocomplete?",
              dismissable: true,
              buttons: [
                {
                  text: 'Yes, disable it',
                  onDidClick: () => {
                    atom.config.set('language-elm.autocompleteEnabled', false);
                    notification.dismiss();
                  },
                },
                {
                  text: 'No, I want both',
                  onDidClick: () => {
                    notification.dismiss();
                  },
                },
              ],
            }
          );
        }
      })
    );

    const autocompletePackage = atom.packages.getActivePackage(
      'autocomplete-plus'
    );
    if (autocompletePackage) {
      const autocompleteManager =
        autocompletePackage.mainModule.autocompleteManager ||
        autocompletePackage.mainModule.getAutocompleteManager();
      subscriptions.add(
        autocompleteManager.suggestionList.onDidChangeItems(items => {
          const editor = atom.workspace.getActiveTextEditor();
          if (helper.isElmEditor(editor)) {
            const hasItems = items !== null;
            if (!hasItems) {
              setAutocompleteActiveFunction(editor, false);
            }
          }
        })
      );
      subscriptions.add(
        atom.commands.onWillDispatch(event => {
          // `event.target.getModel` does exist in Atom v1.19.1 and above.
          const editor =
            (event.target.getModel && event.target.getModel()) ||
            atom.workspace.getActiveTextEditor();
          // Determine if <kbd>enter</kbd> was used to choose a suggestion.
          if (
            event.type === 'autocomplete-plus:confirm' &&
            event.originalEvent &&
            helper.isElmEditor(editor)
          ) {
            usedEnterKeyToAutocomplete = event.originalEvent.keyCode === 13;
          }
        })
      );
    }
  }, 0);

  return {
    selector: '.source.elm',
    disableForSelector: '.source.elm .string, .source.elm .comment',
    inclusionPriority: 1,
    excludeLowerPriority: false,
    suggestionPriority: 2,
    getSuggestions({ editor, bufferPosition }) {
      setAutocompleteActiveFunction(editor, true);
      if (
        !helper.isElmEditor(editor) ||
        !shouldGetSuggestionsFunction() ||
        !editor.getSelectedBufferRange().isEmpty()
      ) {
        return;
      }
      return new Promise(resolve => {
        if (!atom.config.get('elmjutsu.autocompleteEnabled')) {
          return resolve([]);
        }

        const prefix = editor.getTextInRange([
          [bufferPosition.row, 0],
          bufferPosition,
        ]);
        let match;
        const activeToken = helper.getToken(editor) || '';

        const typeAwareAutocompleteEnabled = atom.config.get(
          'elmjutsu.typeAwareAutocompleteEnabled'
        );
        const replaceWithInferredTypeCompletionEnabled = atom.config.get(
          'elmjutsu.replaceWithInferredTypeCompletionEnabled'
        );

        // Get fields for record variable.
        // e.g. `{ model | `
        // e.g. `{ model | a`
        const activeRecordVariable = helper.getActiveRecordVariable(editor);
        if (activeRecordVariable) {
          return getFieldsForRecordVariable(
            prefix,
            activeRecordVariable,
            activeToken,
            indexer,
            resolve
          );
        }

        // Get inferred type at cursor position.
        if (
          typeAwareAutocompleteEnabled ||
          replaceWithInferredTypeCompletionEnabled
        ) {
          const inference = getInferenceAtCursorPositionFunction(editor);
          inferredType = inference ? inference.tipe : null;
        } else {
          inferredType = null;
        }

        const getHintsForPartialPromise = new Promise(resolve => {
          let preceedingToken = null;
          let succeedingToken = null;
          if (
            atom.config.get('elmjutsu.autocompleteSnippetsEnabled') ||
            typeAwareAutocompleteEnabled
          ) {
            [
              preceedingToken,
              succeedingToken,
            ] = getPreceedingAndSucceedingTokens(
              editor,
              bufferPosition,
              /(\S+)\s/,
              /\s(\S+)/
            );
          }

          let suffix = '';
          const suffixRange = [
            bufferPosition,
            [
              bufferPosition.row,
              editor.getBuffer().lineLengthForRow(bufferPosition.row),
            ],
          ];
          editor.scanInBufferRange(/(\S*)/, suffixRange, ({ match, stop }) => {
            if (match && match.length > 1) {
              stop();
              suffix = match[1];
            }
          });

          // Check if filtering by regex (prefix starts with a slash (/)).
          const regexMatch = (prefix + suffix).match(/\s*(\/\S*)$/);
          let isRegex = false;
          if (regexMatch && regexMatch[1]) {
            try {
              // Validate regex expression.
              new RegExp(regexMatch[1]);
              isRegex = true;
            } catch (e) {}
          }

          // Check if filtering by type signature (prefix starts with a colon (:)).
          const typeSignatureMatch = (prefix + suffix).match(/\s*(:\S*)$/);
          let isTypeSignature = false;
          if (
            typeSignatureMatch &&
            typeSignatureMatch.length > 1 &&
            typeSignatureMatch[1]
          ) {
            try {
              // Validate regex expressions.
              const parts = typeSignatureMatch[1].split('__');
              parts.forEach(part => {
                new RegExp(part);
              });
              isTypeSignature = true;
            } catch (e) {}
          }

          const partial = isTypeSignature
            ? typeSignatureMatch[1]
            : isRegex
            ? regexMatch[1]
            : activeToken;
          return getHintsForPartial(
            partial,
            suffix,
            typeAwareAutocompleteEnabled && inferredType ? inferredType : null,
            preceedingToken,
            succeedingToken,
            isRegex,
            isTypeSignature,
            indexer,
            editor,
            bufferPosition,
            resolve
          );
        });

        // Replace with inferred type:
        const getInferredTypePromise = new Promise(resolve => {
          if (
            inferredType &&
            (activeToken.length === 0 || inferredType.startsWith(activeToken))
          ) {
            return resolve([
              {
                replacementPrefix: activeToken,
                text: inferredType,
                rightLabelHTML:
                  specialCompletionIcon() + '<i>Replace with inferred type</i>',
              },
            ]);
          }
          return resolve([]);
        });

        // Construct if/then/else:
        if (atom.config.get('elmjutsu.insertIfThenElseCompletionEnabled')) {
          match = prefix.match(/\s+if\s*$/);
          if (match) {
            const constructIfThenPromise = new Promise(resolve => {
              return resolve([
                {
                  replacementPrefix: match[0],
                  snippet:
                    helper.getLeadingSpaces(match[0]) +
                    'if ${1:} then\n' +
                    helper.tabSpaces() +
                    '${2:}\n' +
                    'else\n' +
                    helper.tabSpaces() +
                    '${3:}',
                  rightLabelHTML:
                    specialCompletionIcon() + '<i>Insert if/then/else</i>',
                },
              ]);
            });
            return Promise.all([
              constructIfThenPromise,
              getHintsForPartialPromise,
            ]).then(suggestions => {
              return resolve(_.flatten(suggestions, true));
            });
          }
        }

        // Construct let/in:
        if (atom.config.get('elmjutsu.insertLetInCompletionEnabled')) {
          match = prefix.match(/\s+let\s*$/);
          if (match) {
            const constructLetInPromise = new Promise(resolve => {
              return resolve([
                {
                  replacementPrefix: match[0],
                  snippet:
                    helper.getLeadingSpaces(match[0]) +
                    // 'let\n' +
                    // helper.tabSpaces() + '${1:} =\n' +
                    // helper.tabSpaces() + helper.tabSpaces() + '${2:}\n' +
                    // 'in\n' +
                    // helper.tabSpaces() + '${3:}',
                    'let\n' +
                    helper.tabSpaces() +
                    '${1:}\n' +
                    'in\n' +
                    helper.tabSpaces() +
                    '${2:}',
                  rightLabelHTML:
                    specialCompletionIcon() + '<i>Insert let/in</i>',
                },
              ]);
            });
            return Promise.all([
              constructLetInPromise,
              getHintsForPartialPromise,
            ]).then(suggestions => {
              return resolve(_.flatten(suggestions, true));
            });
          }
        }

        // Construct from type annotation (when cursor is below a type annotation):
        // e.g. `update : Msg -> Model -> ( Model, Cmd Msg )` will suggest `update msg model =`
        // e.g. `add3 : Int -> Int -> Int -> Int` will suggest `add3 int int2 int3 =`
        // e.g. `funWithInt : Int -> Int` will suggest `funWithInt int =`
        // e.g. `funWithTuple : (Int, Int) -> Int` will suggest `funWithTuple (int, int2) =`
        // e.g. `funWithRecord : {a : Int, b : Int, c: Int} -> Int` will suggest `funWithRecord record =`
        // e.g. `funWithRecord2 : {a : Int, b : Int, c: Int} -> {a : Int, b : Int, c: Int} -> Int` will suggest `funWithRecord record record2 =`
        if (
          atom.config.get('elmjutsu.defineFromTypeAnnotationCompletionEnabled')
        ) {
          const typeAnnotation = helper.getTypeAnnotationAbove(editor);
          if (typeAnnotation) {
            const constructFromTypeAnnotationPromise = new Promise(resolve => {
              return constructFromTypeAnnotation(
                prefix,
                typeAnnotation,
                indexer,
                resolve
              );
            });
            return Promise.all([
              constructFromTypeAnnotationPromise,
              getHintsForPartialPromise,
            ]).then(suggestions => {
              return resolve(_.flatten(suggestions, true));
            });
          }
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
          return resolve([
            { text: 'exposing (..)' },
            { text: 'exposing (' },
            { text: 'as ' },
          ]);
        }

        // e.g. `import Dict exposing ` (there's a space at the end)
        match = prefix.match(
          /(?:^|\n)import\s([\w\.]+)(?:\s+as\s+(\w+))?\s+exposing\s$/
        );
        if (match) {
          return resolve([{ text: '(..)' }]);
        }

        // Construct module:
        if (atom.config.get('elmjutsu.insertModuleCompletionEnabled')) {
          match = prefix.match(/(?:^|\n)((effect|port)\s+)?module(\s+)?$/);
          if (match) {
            return resolve([
              {
                replacementPrefix: prefix,
                snippet:
                  (match[1] || '') +
                  'module ${1:Main} exposing (${2:..})\n\n${3:}',
                rightLabelHTML:
                  specialCompletionIcon() + '<i>Insert module</i>',
              },
            ]);
          }
        }

        // Construct program skeleton:
        if (atom.config.get('elmjutsu.insertProgramCompletionEnabled')) {
          // Html.program
          match = editor
            .getText()
            .match(/^\s*(html|[Hh]tml\.program|[Hh]tmlprogram)\s*$/);
          if (match) {
            return resolve([
              {
                replacementPrefix: prefix,
                snippet: htmlProgramSnippet.replace(
                  'module Main',
                  'module ${1:Main}'
                ),
                rightLabelHTML:
                  specialCompletionIcon() + '<i>Insert Html program</i>',
              },
            ]);
          }
          // Platform.program
          match = editor
            .getText()
            .match(
              /^\s*(platform|[Pp]latform\.program|[Pp]latformprogram)\s*$/
            );
          if (match) {
            return resolve([
              {
                replacementPrefix: prefix,
                snippet: platformProgramSnippet.replace(
                  'module Main',
                  'module ${1:Main}'
                ),
                rightLabelHTML:
                  specialCompletionIcon() + '<i>Insert Platform program</i>',
              },
            ]);
          }
        }

        let promises = [];

        // Construct case/of:
        // e.g. `    case aBool `
        // e.g. `    case aMaybe `
        // e.g. `    case aMsg `
        // e.g. `    case aMsg of`
        if (atom.config.get('elmjutsu.insertCaseOfCompletionEnabled')) {
          match = prefix.match(/\s+case\s(.+)\s+(|of)$/);
          if (match) {
            const constructCaseOfPromise = new Promise(resolve => {
              return constructCaseOf(match[0], match[1], indexer, resolve);
            });
            promises.unshift(constructCaseOfPromise);
          }
        }

        // Ending with space:
        match = prefix.match(/(?:\b)(\S+)\s$/);
        const endingWithSpace = match ? true : false;
        if (endingWithSpace) {
          const replacementPrefix = match[0];
          const token = match[1];

          // Construct default arguments:
          if (
            atom.config.get('elmjutsu.insertDefaultArgumentsCompletionEnabled')
          ) {
            const constructDefaultArgumentsPromise = new Promise(resolve => {
              const [
                preceedingToken,
                succeedingToken,
              ] = getPreceedingAndSucceedingTokens(
                editor,
                bufferPosition,
                /\s+(\S+)\s/,
                /\s(\S+)/
              );
              return constructDefaultArguments(
                token,
                shouldRemoveLastArgument(preceedingToken, succeedingToken),
                indexer,
                resolve
              );
            });
            promises.push(constructDefaultArgumentsPromise);
          }

          // Construct "default value for type" replacement:
          // e.g. ` Position ` (there's a space at the end) => `{ x = 0.0, y = 0.0, z = 0.0 }`
          // TODO: Should check if text begins with capital letter after the dot (e.g. `Dict.Dict` will pass, but `Dict.empty` will not).
          if (
            atom.config.get('elmjutsu.replaceTypeWithDefaultCompletionEnabled')
          ) {
            if (/[A-Z]\S+/.test(replacementPrefix)) {
              const constructDefaultValueForTypePromise = new Promise(
                resolve => {
                  return constructDefaultValueForType(
                    replacementPrefix,
                    token,
                    indexer,
                    resolve
                  );
                }
              );
              promises.push(constructDefaultValueForTypePromise);
            }
          }

          // // Get aliases of type:
          // // e.g. ` String ` (there's a space at the end) => `StringAlias`
          // // TODO: Should check if text begins with capital letter after the dot (e.g. `Dict.Dict` will pass, but `Dict.empty` will not).
          // if (atom.config.get('elmjutsu.replaceTypeWithAliasCompletionEnabled')) {
          //   if (/[A-Z]\S+/.test(replacementPrefix)) {
          //     const getAliasesOfTypePromise = new Promise((resolve) => {
          //       return getAliasesOfType(replacementPrefix, token, indexer, resolve);
          //     });
          //     promises.push(getAliasesOfTypePromise);
          //   }
          // }

          if (inferredType) {
            if (replaceWithInferredTypeCompletionEnabled) {
              promises.push(getInferredTypePromise);
            }
            promises.push(getHintsForPartialPromise);
          }
        }

        if (!endingWithSpace) {
          promises.push(getHintsForPartialPromise);
          if (inferredType && replaceWithInferredTypeCompletionEnabled) {
            promises.unshift(getInferredTypePromise);
          }
        }

        return Promise.all(promises).then(suggestions => {
          return resolve(_.flatten(suggestions, true));
        });
      });
    },
    onDidInsertSuggestion({ editor, triggerPosition, suggestion }) {
      if (inferredType) {
        clearCursorInferenceFunction();
      }
      // HACK: If the typed text is equal to the chosen suggestion and <kbd>enter</kbd> was used, insert a newline.
      if (
        usedEnterKeyToAutocomplete &&
        suggestion.replacementPrefix === suggestion.text &&
        atom.config.get('autocomplete-plus.confirmCompletion') !== 'tab'
      ) {
        // `Keymap For Confirming A Suggestion` should be 'enter', 'tab and enter', or 'tab always, enter when suggestion explicitly selected'.
        editor.insertText('\n');
      }
      if (
        suggestion.fromTypeAnnotationConstructed &&
        editor
          .lineTextForBufferRow(editor.getCursorBufferPosition().row)
          .trim() !== ''
      ) {
        const linesToSelect = suggestion.text.split('\n').length - 2;
        const position = editor.getCursorBufferPosition();
        editor.setSelectedBufferRange(
          [[position.row - linesToSelect, helper.tabSpaces().length], position],
          { reversed: true }
        );
      }
      if (suggestion.autoImportData) {
        // Replace inserted text (see notes in `getHintsForPartial`).
        const position = editor.getCursorBufferPosition();
        editor.setTextInBufferRange(
          [
            triggerPosition.translate([
              0,
              -suggestion.autoImportData.partial.length,
            ]),
            position,
          ],
          suggestion.autoImportData.text
        );
        editor.groupChangesSinceCheckpoint(
          suggestion.autoImportData.checkpoint
        );
        const filePath = editor.getPath();
        const projectDirectory = helper.getProjectDirectory(filePath);
        const alias = null;
        indexer.addImport([
          filePath,
          projectDirectory,
          suggestion.autoImportData.moduleName,
          suggestion.autoImportData.name,
          alias,
        ]);
      }
      if (suggestion.deleteSuffixData) {
        // See `getHintsForPartial`.
        const bufferPosition = editor.getCursorBufferPosition();
        if (suggestion.deleteSuffixData.suffix.length > 0) {
          editor.scanInBufferRange(
            new RegExp(_.escapeRegExp(suggestion.deleteSuffixData.suffix)),
            [
              bufferPosition,
              [
                bufferPosition.row,
                editor.getBuffer().lineLengthForRow(bufferPosition.row),
              ],
            ],
            ({ stop, replace }) => {
              stop();
              replace('');
            }
          );
        }
        editor.groupChangesSinceCheckpoint(
          suggestion.deleteSuffixData.checkpoint
        );
      }
    },
    dispose() {
      subscriptions.dispose();
      subscriptions = null;
    },
  };
}

function updateDescription(suggestion, entry) {
  const format = atom.config.get('elmjutsu.autocompleteDescriptionDisplay');
  if (format === 'markdown') {
    entry.descriptionMarkdown = suggestion.comment;
  } else if (format === 'text') {
    entry.description = suggestion.comment;
  }
  entry.descriptionMoreURL =
    suggestion.sourcePath === '' ? null : suggestion.sourcePath;
  return entry;
}

function getSuggestionsForImport(prefix, partial, indexer, resolve) {
  const isFiltered = !atom.config.get(
    'elmjutsu.autocompleteFuzzyFilteringEnabled'
  );
  const suggestionsForImportReceived = indexer.onSuggestionsForImportReceived(
    ([partial, suggestions]) => {
      suggestionsForImportReceived.dispose();
      if (!isFiltered && partial.length > 0) {
        suggestions = fuzzaldrin.filter(suggestions, partial, { key: 'name' });
      }
      return resolve(
        _.sortBy(suggestions, 'name').map(suggestion => {
          return updateDescription(suggestion, {
            text: 'import ' + suggestion.name,
            replacementPrefix: prefix,
          });
        })
      );
    }
  );
  indexer.getSuggestionsForImport([partial, isFiltered]);
}

function getHintsForPartial(
  partial,
  suffix,
  inferredType,
  preceedingToken,
  succeedingToken,
  isRegex,
  isTypeSignature,
  indexer,
  editor,
  triggerPosition,
  resolve
) {
  const removeLastArgument = shouldRemoveLastArgument(
    preceedingToken,
    succeedingToken
  );
  const autocompleteMinChars = atom.config.get('elmjutsu.autocompleteMinChars');
  if (!inferredType && partial.length < autocompleteMinChars) {
    return resolve([]);
  }
  const isGlobal = atom.config.get('elmjutsu.globalAutocompleteEnabled');
  const autocompleteFuzzyFilteringEnabled = atom.config.get(
    'elmjutsu.autocompleteFuzzyFilteringEnabled'
  );
  const hintsForPartialReceived = indexer.onHintsForPartialReceived(
    ([partial, hints]) => {
      hintsForPartialReceived.dispose();
      const autocompleteMaxSuggestions = atom.config.get(
        'elmjutsu.autocompleteMaxSuggestions'
      );
      if (
        autocompleteFuzzyFilteringEnabled &&
        !isRegex &&
        !isTypeSignature &&
        (!inferredType || (inferredType && partial !== ''))
      ) {
        let options = { key: 'name' };
        if (autocompleteMaxSuggestions && autocompleteMaxSuggestions > 0) {
          options.maxResults = autocompleteMaxSuggestions;
        }
        hints = fuzzaldrin.filter(hints, partial, options);
      } else {
        if (autocompleteMaxSuggestions && autocompleteMaxSuggestions > 0) {
          hints = hints.slice(0, autocompleteMaxSuggestions);
        }
      }
      // Sort identically-named suggestions by their module names.
      if (isGlobal) {
        hints = _.chain(hints)
          .groupBy('name')
          .map(hints => {
            return _.sortBy(hints, 'moduleName');
          })
          .flatten(true)
          .value();
      }
      const suggestions = hints
        .filter(({ name }) => {
          return name.length >= autocompleteMinChars;
        })
        .map(hint => {
          const autoImportCompletionEnabled = atom.config.get(
            'elmjutsu.autoImportCompletionEnabled'
          );
          const tipeString =
            hint.tipe && hint.tipe.trim() !== ''
              ? hint.tipe
              : '<i>' + hint.args.join(' ') + '</i>';
          // `autocomplete-plus` (as of v2.33.1) uniquifies based on `suggestion.text`.
          // For example, if the typed text is "empty" and it's not yet imported (from either `Dict` or `Array`), only the first suggestion will be shown (from `Array`).
          // As a workaround, we're adding the module name to `suggestion.text` here, then replacing it with just the name in `onDidInsertSuggestion`.
          const text =
            hint.isImported || !autoImportCompletionEnabled
              ? hint.name
              : hint.name + ' (' + hint.moduleName + ')';
          let suggestion = updateDescription(hint, {
            replacementPrefix:
              isRegex || isTypeSignature
                ? partial.slice(0, partial.length - suffix.length)
                : partial,
            text,
            leftLabelHTML:
              hint.isImported || !autoImportCompletionEnabled
                ? hint.moduleName
                : specialCompletionIcon() + '<i>Auto import</i>',
            rightLabelHTML: tipeString,
          });
          if (isRegex || isTypeSignature) {
            suggestion.deleteSuffixData = {
              suffix: suffix,
              checkpoint: editor.createCheckpoint(),
            };
          }
          if (!hint.isImported && autoImportCompletionEnabled) {
            const parts = hint.name.split('.');
            const name = parts.pop();
            // Custom field.
            suggestion.autoImportData = {
              moduleName: hint.moduleName,
              name: parts.length > 0 ? null : name,
              partial: partial,
              text: hint.name,
              checkpoint: editor.createCheckpoint(),
            };
          }
          if (atom.config.get('elmjutsu.autocompleteSnippetsEnabled')) {
            suggestion.snippet = hintToSnippet(hint, removeLastArgument);
            if (hint.isImported) {
              suggestion.displayText = hint.name;
            }
          }
          return suggestion;
        });
      helper.debugLog(
        'getHintsForPartial ' +
          partial +
          ' (Suggestions: ' +
          suggestions.length +
          ') ' +
          (helper.getTimestamp() - startTime) +
          ' ms'
      );
      return resolve(suggestions);
    }
  );
  const isFiltered = !autocompleteFuzzyFilteringEnabled;
  const startTime = helper.getTimestamp();
  indexer.getHintsForPartial([
    partial,
    inferredType,
    preceedingToken,
    isRegex,
    isTypeSignature,
    isFiltered,
    isGlobal,
  ]);
}

function getFieldsForRecordVariable(
  prefix,
  activeRecordVariable,
  partial,
  indexer,
  resolve
) {
  const isFiltered = !atom.config.get(
    'elmjutsu.autocompleteFuzzyFilteringEnabled'
  );
  const fieldsForRecordVariableReceived = indexer.onFieldsForRecordVariableReceived(
    ([partial, hints]) => {
      fieldsForRecordVariableReceived.dispose();
      let suggestions = hints.map(hint => {
        const fieldName = hint.name.replace(activeRecordVariable + '.', '');
        const tipeString =
          hint.tipe && hint.tipe.trim() !== ''
            ? hint.tipe
            : '<i>' + hint.args.join(' ') + '</i>';
        let suggestion = updateDescription(hint, {
          replacementPrefix: partial,
          text: fieldName,
          leftLabelHTML: activeRecordVariable + ' | ',
          rightLabelHTML: tipeString,
        });
        return suggestion;
      });
      if (!isFiltered && partial.trim().length > 0) {
        suggestions = fuzzaldrin.filter(suggestions, partial, {
          key: 'text',
        });
      }
      return resolve(suggestions);
    }
  );
  indexer.getFieldsForRecordVariable([
    activeRecordVariable,
    partial,
    isFiltered,
  ]);
}

function hintToSnippet(hint, removeLastArgument) {
  // If has type annotation:
  if (hint.tipe.trim().length > 0) {
    let parts = helper.getTipeParts(hint.tipe);
    if (removeLastArgument) {
      parts.pop();
    }
    const tabStops = parts
      .slice(0, parts.length - 1)
      .map((part, i) => {
        // Replace closing brace with \}.
        part = part.replace(/}/g, '\\}');
        // If part contains spaces and is not a record or a tuple, enclose it with parentheses.
        if (
          part.indexOf(' ') > -1 &&
          !part.startsWith('(') &&
          !part.startsWith('{')
        ) {
          part = '(' + part + ')';
        }
        return '${' + (i + 1) + ':' + part + '}';
      })
      .join(' ');
    return hint.name + (tabStops.trim() === '' ? '' : ' ' + tabStops);
  }
  // If has no type annotation:
  const args = hint.args;
  if (removeLastArgument) {
    args.pop();
  }
  return (
    hint.name +
    args.reduce((acc, arg, i) => {
      return acc + ' ${' + (i + 1) + ':' + arg + '}';
    }, '')
  );
}

function constructFromTypeAnnotation(prefix, typeAnnotation, indexer, resolve) {
  const fromTypeAnnotationConstructed = indexer.onFromTypeAnnotationConstructed(
    construction => {
      fromTypeAnnotationConstructed.dispose();
      if (construction.startsWith(prefix)) {
        let suggestion = {
          replacementPrefix: prefix,
          text: construction,
          rightLabelHTML:
            specialCompletionIcon() + '<i>Define from type annotation</i>',
          fromTypeAnnotationConstructed: true, // Custom field.
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
    }
  );
  indexer.constructFromTypeAnnotation(typeAnnotation);
}

function constructCaseOf(replacementPrefix, token, indexer, resolve) {
  const caseOfConstructed = indexer.onCaseOfConstructed(construction => {
    caseOfConstructed.dispose();
    if (construction) {
      const text =
        helper.getLeadingSpaces(replacementPrefix) +
        'case ' +
        token +
        ' of\n' +
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
          .map(line => {
            return helper.tabSpaces() + line;
          })
          .join('\n');
      let suggestion = {
        replacementPrefix: replacementPrefix,
        snippet: text,
        rightLabelHTML: specialCompletionIcon() + '<i>Insert case/of</i>',
      };
      return resolve([suggestion]);
    }
    return resolve([]);
  });
  indexer.constructCaseOf(token);
}

function constructDefaultArguments(
  token,
  removeLastArgument,
  indexer,
  resolve
) {
  const defaultArgumentsConstructed = indexer.onDefaultArgumentsConstructed(
    args => {
      defaultArgumentsConstructed.dispose();

      if (args) {
        if (removeLastArgument) {
          args.pop();
        }
        const argsString = args.join(' ');
        if (argsString === '_') {
          return resolve([]);
        }
        let suggestion = {
          replacementPrefix: '',
          rightLabelHTML:
            specialCompletionIcon() + '<i>Insert default arguments</i>',
        };
        if (atom.config.get('elmjutsu.autocompleteSnippetsEnabled')) {
          suggestion.snippet = args
            .map((arg, i) => {
              return '${' + (i + 1) + ':' + arg.replace(/}/g, '\\}') + '}';
            })
            .join(' ');
        } else {
          suggestion.text = argsString;
        }
        return resolve([suggestion]);
      }
      return resolve([]);
    }
  );
  indexer.constructDefaultArguments(token);
}

function constructDefaultValueForType(
  replacementPrefix,
  token,
  indexer,
  resolve
) {
  const defaultValueForTypeConstructed = indexer.onDefaultValueForTypeConstructed(
    value => {
      defaultValueForTypeConstructed.dispose();

      if (value) {
        let suggestion = {
          replacementPrefix: replacementPrefix,
          text: value,
          rightLabelHTML:
            specialCompletionIcon() + '<i>Replace type with default</i>',
        };
        return resolve([suggestion]);
      }
      return resolve([]);
    }
  );
  indexer.constructDefaultValueForType(token);
}

// function getAliasesOfType(replacementPrefix, token, indexer, resolve) {
//   const aliasesOfTypeReceived = indexer.onAliasesOfTypeReceived(aliases => {
//     aliasesOfTypeReceived.dispose();
//     const suggestions = aliases.map(alias => {
//       return {
//         replacementPrefix: replacementPrefix,
//         text: alias,
//         rightLabelHTML:
//           specialCompletionIcon() + '<i>Replace type with alias</i>',
//       };
//     });
//     return resolve(suggestions);
//   });
//   indexer.getAliasesOfType(token);
// }

function specialCompletionIcon() {
  return '<span class="icon-zap"></span>';
}

function shouldRemoveLastArgument(preceedingToken, succeedingToken) {
  // TODO: Also consider other infix functions?
  return (
    ['|>', '>>', '<<'].indexOf(preceedingToken) > -1 ||
    ['<|', '>>', '<<'].indexOf(succeedingToken) > -1
  );
}

function getPreceedingAndSucceedingTokens(
  editor,
  bufferPosition,
  preceedingTokenRegex,
  succeedingTokenRegex
) {
  let preceedingToken = null;
  let succeedingToken = null;
  // Get preceeding token.
  const prefixRange = [[bufferPosition.row, 0], bufferPosition];
  editor.backwardsScanInBufferRange(
    preceedingTokenRegex,
    prefixRange,
    ({ match, stop }) => {
      if (match && match.length > 1) {
        stop();
        if (helper.tokenRegex().test(match[1])) {
          preceedingToken = match[1];
        }
      }
    }
  );
  // Get succeeding token.
  const suffixRange = [
    bufferPosition,
    [
      bufferPosition.row,
      editor.getBuffer().lineLengthForRow(bufferPosition.row),
    ],
  ];
  editor.scanInBufferRange(
    succeedingTokenRegex,
    suffixRange,
    ({ match, stop }) => {
      if (match && match.length > 1) {
        stop();
        if (helper.tokenRegex().test(match[1])) {
          succeedingToken = match[1];
        }
      }
    }
  );
  return [preceedingToken, succeedingToken];
}

const htmlProgramSnippet = `module Main exposing (..)

import Html


main : Program Never Model Msg
main =
    Html.program
        { init = init
        , view = view
        , update = update
        , subscriptions = \\\\_ -> Sub.none
        }


init : ( Model, Cmd Msg )
init =
    ( emptyModel, Cmd.none )



-- MODEL


type alias Model =
    {}


emptyModel : Model
emptyModel =
    {}



-- UPDATE


type Msg
    = NoOp


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        NoOp ->
            ( model, Cmd.none )



-- VIEW


view : Model -> Html.Html Msg
view model =
    Html.text ""
`;

const platformProgramSnippet = `module Main exposing (..)

import Platform


main : Program Never Model Msg
main =
    Platform.program
        { init = init
        , update = update
        , subscriptions = \\\\_ -> Sub.none
        }


init : ( Model, Cmd Msg )
init =
    ( emptyModel, Cmd.none )



-- MODEL


type alias Model =
    {}


emptyModel : Model
emptyModel =
    {}



-- UPDATE


type Msg
    = NoOp


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        NoOp ->
            ( model, Cmd.none )
`;
