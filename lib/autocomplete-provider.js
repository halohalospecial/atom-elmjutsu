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
        // e.g. `import ` (there's a space at the end)
        // e.g. `import Dict`
        let match = prefix.match(/(?:^|\n)import\s([\w\S]*)$/);
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
        const getHintsForPartialPromise = new Promise((resolve) => {
          return getHintsForPartial(helper.getToken(editor), indexer, resolve);
        });
        // e.g. `    case aBool `
        // e.g. `    case aMaybe `
        // e.g. `    case aMsg `
        // e.g. `    case aMsg o`
        // e.g. `    case aMsg of`
        match = prefix.match(/\s+case\s(.+)\s+(|of)$/);
        if (match) {
          const constructCaseOfPromise = new Promise((resolve) => {
            return constructCaseOf(prefix, match[1], indexer, resolve);
          });
          return Promise.all([
            constructCaseOfPromise,
            getHintsForPartialPromise
          ]).then((suggestions) => {
            return resolve(_.flatten(suggestions, true));
          });
        }
        // When cursor is below a type annotation:
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
        let suggestion = {
          replacementPrefix: partial,
          text: hint.name,
          leftLabel: hint.moduleName,
          rightLabelHTML: hint.tipe.replace(/^\*(.*)\*$/, '<i>$1</i>'),
          // TODO: Change below to `descriptionHTML` when `autocomplete-plus` adds that option.
          description: hint.comment,
          descriptionMoreURL: hint.sourcePath
        };
        if (atom.config.get('elmjutsu.autocompleteSnippetsEnabled')) {
          suggestion.snippet = hintToSnippet(hint);
          suggestion.displayText = hint.name;
        }
        return suggestion;
      });
    return resolve(suggestions);
  };
  indexer.ports.hintsForPartialReceivedCmd.subscribe(hintsForPartialReceived);
  indexer.ports.getHintsForPartialSub.send(partial);
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
          rightLabelHTML: '<i>* construct from type annotation *</i>',
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
      //     suggestion.snippet = functionName + (tabStops.trim() === '' ? '' : ' ' + tabStops) + ' =\n    ' + '${' + (argsParts.length+1) + ':}';
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

function constructCaseOf(prefix, token, indexer, resolve) {
  const caseOfConstructed = (construction) => {
    indexer.ports.caseOfConstructedCmd.unsubscribe(caseOfConstructed);
    if (construction) {
      const numLeadingSpaces = prefix.search(/\S|$/) + 1;
      const leadingSpaces = new Array(numLeadingSpaces).join(' ');
      const text = leadingSpaces + 'case ' + token + ' of\n' +
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
          return '    ' + line;
        })
        .join('\n');
      let suggestion = {
          replacementPrefix: prefix,
          snippet: text,
          rightLabelHTML: '<i>* construct case-of *</i>'
        };
      return resolve([suggestion]);
    }
    return resolve([]);
  };
  indexer.ports.caseOfConstructedCmd.subscribe(caseOfConstructed);
  indexer.ports.constructCaseOfSub.send(token);
}
