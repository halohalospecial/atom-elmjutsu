'use babel';

const CompositeDisposable = require('atom').CompositeDisposable;
const _ = require('underscore-plus');
import helper from './helper';

export function provide(indexer) {
  let usedEnterKeyToAutocomplete;
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
      return new Promise(resolve => {
        if (!atom.config.get('elmjutsu.autocompleteEnabled')) {
          return resolve([]);
        }
        let prefix = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
        const getHintsForPartialPromise = new Promise((resolve) => {
          return getHintsForPartial(helper.getToken(editor), indexer, resolve);
        });
        let match;

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
                'let\n' +
                helper.tabSpaces() + '${1:} =\n' +
                helper.tabSpaces() + helper.tabSpaces() + '${2:}\n' +
                'in\n' +
                helper.tabSpaces() + '${3:}',
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
          return Promise.all([
            constructCaseOfPromise,
            getHintsForPartialPromise
          ]).then((suggestions) => {
            return resolve(_.flatten(suggestions, true));
          });
        }

        // Construct "default value for type" replacement.
        // e.g. ` Position ` (there's a space at the end) => `{ x = 0.0, y = 0.0, z = 0.0 }`
        // TODO: Should check if text begins with capital letter after the dot (e.g. `Dict.Dict` will pass, but `Dict.empty` will not).
        match = prefix.match(/(?:\b)([A-Z]\S+)\s$/);
        if (match) {
          return constructDefaultValueForType(match[0], match[1], indexer, resolve);
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

        return resolve(getHintsForPartialPromise);
      });
    },
    onDidInsertSuggestion({editor, triggerPosition, suggestion}) {
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
          // TODO: Change below to `descriptionHTML` when `autocomplete-plus` adds that option.
          description: suggestion.comment,
          descriptionMoreURL: suggestion.sourcePath === '' ? null : suggestion.sourcePath
        };
      }));
  };
  indexer.ports.suggestionsForImportReceivedCmd.subscribe(suggestionsForImportReceived);
  indexer.ports.getSuggestionsForImportSub.send(partial);
}

function getHintsForPartial(partial, indexer, resolve) {
  const autocompleteMinChars = atom.config.get('elmjutsu.autocompleteMinChars');
  if (partial.length < autocompleteMinChars) {
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
        let suggestion = {
          replacementPrefix: partial,
          text: hint.name,
          leftLabelHTML: hint.isImported ? hint.moduleName : specialCompletionIcon() + '<i>Auto import</i>',
          rightLabelHTML: tipeString,
          // TODO: Change below to `descriptionHTML` when `autocomplete-plus` adds that option.
          description: hint.comment,
          descriptionMoreURL: hint.sourcePath
        };
        if (!hint.isImported) {
          suggestion.autoImportData = {moduleName: hint.moduleName, name: null}; // Custom field.
        }
        if (atom.config.get('elmjutsu.autocompleteSnippetsEnabled')) {
          suggestion.snippet = hintToSnippet(hint);
          suggestion.displayText = hint.name;
        }
        return suggestion;
      });
    return resolve(suggestions);
  };
  indexer.ports.hintsForPartialReceivedCmd.subscribe(hintsForPartialReceived);
  indexer.ports.getHintsForPartialSub.send([partial, atom.config.get('elmjutsu.globalAutocompleteEnabled')]);
}

function hintToSnippet(hint) {
  if ((!hint.args || hint.args.length === 0) && !hint.tipe.startsWith('*')) {
    const parts = helper.getTipeParts(hint.tipe);
    const tabStops = parts.slice(0,parts.length-1).map((part, i) => {
      // Replace closing brace with \}.
      return '${' + (i + 1) + ':' + part.replace(/}/g, '\\}') + '}';
    }).join(' ');
    return hint.name + (tabStops.trim() === '' ? '' : ' ' + tabStops);
  }
  const args = hint.args ? hint.args : hint.tipe.startsWith('*') ? hint.tipe.replace(/^\*|\*$/g, '').split(' ') : [];
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
      //   const parts = construction.replace(/ =\n    $/m, '').split(' ');
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
          return part + '${' + (i + 1) + ':}';
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

function constructDefaultValueForType(replacementPrefix, token, indexer, resolve) {
  const defaultValueForTypeConstructed = (construction) => {
    indexer.ports.defaultValueForTypeConstructedCmd.unsubscribe(defaultValueForTypeConstructed);
    if (construction) {
      let suggestion = {
          replacementPrefix: replacementPrefix,
          snippet: construction,
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
