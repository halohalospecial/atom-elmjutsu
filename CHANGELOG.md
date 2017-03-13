## 5.3.2
* Add basic caching for autocomplete suggestions to improve performance (should be a lot faster than before).

## 5.3.1
* Change default value of `Max Number of Autocomplete Suggestions` to `0` (no limit).

## 5.3.0
* Add autocomplete fuzzy filtering (`Enable Autocomplete Fuzzy Filtering` option).  Thanks to @splodingsocks for the suggestion!
* For performance reasons, put a limit on the number of autocomplete suggestions to return (50 by default).  This can be changed by setting the `Max Number of Autocomplete Suggestions` option.
* Other minor optimizations.

## 5.2.1
* Fix infinite recursion bugs related to computing default values (#56).  Thanks to @pacbeckh for reporting and providing reproduction steps!

## 5.2.0
* Optimization: Only compute source paths of record fields when needed (e.g. for `Go To Definition`).
* Type-aware autocomplete: Sort suggestions based on "distance" from expected type.
* Regex autocomplete filtering: If the typed text starts with a slash (`/`), use the rest of the characters as a regular expression to filter the suggestions.

## 5.1.8
* Fix `Infer Type` error caused by elm-make returning a relative source path.  Thanks to @splodingsocks for reporting!

## 5.1.7
* Fix #62.  Thanks to @AkosLukacs for reporting!
* Fix infinite recursion bugs caused by mismatched parens.

## 5.1.6
* Fix `Go To Definition` bug.
* Fix infinite recursion when constructing definition from type annotation.  Thanks to @splodingsocks for reporting!
* Add comments for `number`, `appendable`, and `comparable`.

## 5.1.4, 5.1.5
* These versions were not released due to publish failures.

## 5.1.3
* Fix activation crash (2nd attempt).

## 5.1.2
* Fix activation crash.

## 5.1.1
* Make `Infer Type` work with if expressions, case expressions, functions (top-level or anonymous), arguments, and let variables.
* If `Enable Autocomplete Snippets` is checked and an argument type contains a space, enclose it with parentheses (#60).  Thanks to @aravantv for the suggestion!
* If `Insert default arguments` is checked and the symbol is preceeded by `|>`, succeeded by `<|`, or preceeded/succeeded by `<<` or `>>`, do no include the last argument.
* Compute default values of anonymous functions (for `Insert default arguments`, `Replace type with default`, and `Define from type annotation`).

## 5.1.0
* Allow `Go To Definition` and Hyperclick on top-level arguments and record fields (#58).  Thanks to @jespersm for the suggestion!
* Store jump point when using for `Go To Definition` via Hyperclick.
* Fix `Go To Symbol` regression bug (#59). Thanks to @dillonkearns for reporting!
* Get token based on cursor position in dotted symbol.

## 5.0.3
* Fix issue where the text of the types tooltip is not visible when using some UI themes.  Thanks to @AntouanK for reporting!

## 5.0.2
* Fix `Add Import` regression bug. Thanks to @stil4m for reporting!

## 5.0.1
* Support non-ASCII names (#57).  Thanks to @jespersm for reporting!
* Change the direction of the arrow in the types tooltip based on tooltip placement.
* `Infer Type` command: Select the word at cursor when nothing is selected.

## 5.0.0
* BREAKING CHANGE: Rename `Infer Expression Type` to `Infer Type`.
* BREAKING CHANGE: Remove the `Infer Hole Types` command and `Infer Hole Types On The Fly` option since we can usually achieve similar results by just using `Infer Expression Type` (renamed to `Infer Type`) and friends.
* Add `Types Tooltip Position` option.
* Add settings option for each special completion so that they can be disabled individually.
* Fix issue causing extra infer type tasks.
* Better infer type task queuing.
* Fix Sidekick display bugs.

## 4.0.0
* BREAKING CHANGE: Remove `Infer Expression Type On The Fly`. Add `Infer Expected Type At Cursor On The Fly` and `Infer Type Of Selection On The Fly`.
* Add `Enable Type-Aware Autocomplete` option.
* Fix `Define from type annotation` bug.

## 3.5.1
* Fix `Add Import` issue (#51).  Thanks to @mandrolic for reporting!
* Fix infinite recursion bug (#54).  Thanks to @rubedojr for reporting!

## 3.5.0
* Add `Infer Hole Types On The Fly` and `Infer Expression Type On The Fly` options.

## 3.4.0
* Add `Infer Hole Types` and `Infer Expression Type` commands.

## 3.3.2
* Add `Show Types in Tooltip` image.

## 3.3.1
* This version was not released due to publish failure.

## 3.3.0
* Add `Show Types in Tooltip` option.

## 3.2.1
* Fix crash that occurs when a function name is the same as that of one of the built-in functions of a JS object (such as `toString` or `hasOwnProperty`) (still related to #39). Thanks again to @gothy for the help in debugging! :+1:

## 3.2.0
* Fix #39.  Thanks to @pauldijou for reporting and @gothy for providing a sample project and tracing the cause!
* If autocomplete snippets are enabled and the preceeding token is `|>` or the succeeding token is `<|`, do not include the last argument in the snippet.  Will also behave this way if the preceeding or succeeding token is `<<` or `>>`.  Thanks to @mandrolic for the suggestion!
* Add `Show Associativities in Sidekick`, `Show Precedences in Sidekick`, and `Show Tags of Union Types in Sidekick` options.

## 3.1.1
* Fix `Lift To Let` crash (#50).  Thanks to @mandrolic for reporting!
* Add notification when `Lift To Let` fails.  Thanks to @mandrolic for the suggestion!

## 3.1.0
* Add `Insert default arguments` autocompletion.
* Add `Show Types in Sidekick`, `Show Doc Comments in Sidekick`, and `Show Source Paths in Sidekick` options (#45).  Thanks to @mandrolic for the suggestion!
* Fix `Define from type annotation` bug when there's a doc comment above the annotation.
* Fix `Insert case/of` bug with functions.
* Make autocomplete snippets insert type parts instead of argument names (regression).
* Make Sidekick work with `Pipe Selections`.
* Improve `Eval`.

## 3.0.4
* Fix `Lift To Let` bugs.

## 3.0.3
* Put a try/catch when checking if a file exists.

## 3.0.2
* Eval: Evaluate the whole line if nothing is selected.

## 3.0.1
* Revert autocomplete sorting approach (the unimported symbols will still be last).  Also remove import aliases from suggestions.

## 3.0.0
* BREAKING CHANGE: Rename `Surround With Let In` to `Surround With Let` (sorry).
* Remove "=" in `let/in` autocompletion.
* Update outdated screen caps.

## 2.20.0
* Add `Lift To Top Level`.

## 2.19.3
* Modify `Lift To Let` behavior yet again.

## 2.19.2
* More useful behavior for `Lift To Let`.  Thanks to @stil4m for the suggestion!

## 2.19.1
* Better formatting and exit behavior for `Surround With Let In` and `Lift To Let` command.

## 2.19.0
* Add `Surround With Let In` command.
* Add `Lift To Let` command.

## 2.18.5
* Fix global autocomplete bug where imported symbols are still included in the list of suggestions.

## 2.18.4
* Add workaround for `autocomplete-plus` limitation where only the first will be shown for suggestions having the same text.

## 2.18.3
* Fix `Add Import` bug (#41).  Thanks to @stil4m for the PR!

## 2.18.2
* Fix hyperclick provider implementation overriding other packages (#40).  Thanks a lot to @markogresak and @AsaAyers for debugging and providing a fix!

## 2.18.1
* Include unqualified name in global autocomplete.

## 2.18.0
* Add `Enable Global Autocomplete` option.
* Add "Auto import" autocompletion (inspired by [Elm Light](https://github.com/rundis/elm-light)).
* Sort autocomplete suggestions by scope (primitives first, then args, then imported values, then unimported values).

## 2.17.2
* "Failed to download" message should not be displayed if there are no errors.
* Fix parsing regex for Windows.  Thanks to @mandrolic for reporting and debugging!

## 2.17.1
* Detect qualified symbols from aliased imports.
* Properly categorize project type aliases (also fixes broken "Replace type with default" autocompletion case).

## 2.17.0
* Sidekick: Fix display bug for functions without type annotations.
* Fix bug with Sidekick not displaying download errors.
* Allow more cases for "Replace type with default" autocompletion.
* Experimental commands: `Eval` and `Pipe Selections`.

## 2.16.2
* Fix token regex bug which causes symbols like `*` to be ignored.

## 2.16.1
* Add screen capture for "Replace type with default" autocompletion.

## 2.16.0
* Add autocompletion for "Replace type with default".
* Fix insertion bugs for case/of and let/in.
* Fix type info display.
* Set default value of union type to first case.

## 2.15.4
* Fix "Cannot find module 'underscore'" error (#36).  Thanks to @brian-carroll for reporting!

## 2.15.3
* Allow nested if/then/else autocompletion.

## 2.15.1, 2.15.2
* These versions were not released due to publish failures.

## 2.15.0
* Add autocompletions for if/then/else, let/in, and module.

## 2.14.0
* Add autocompletion for case/of.
* Fix type info display (#27).  Thanks to @refried for reporting!

## 2.13.2
* When autocompleting from type annotation, also provide default function body.

## 2.13.1
* When autocompleting function head from type annotation, remove space after function name when there are no arguments.

## 2.13.0
* Add autocomplete function head from type annotation (Resolve #2).  Thanks to @brasilikum for the suggestion!
* Remove `Debug.log`s.

## 2.12.1
* Prevent "Maximum call stack size exceeded" for recursive type alias (infinite type).
* Install Package: Add "Auto" version, which is equivalent to `elm-package install --yes <name>`.

## 2.12.0
* Add `Install Package` and `Uninstall Package`.
* Fix #31.

## 2.11.1
* Failing to download a package's documentation should not cause others to fail (Fix #29).

## 2.11.0
* Autocomplete & Sidekick: Handle function args (even nested tuples and records).
* Sidekick: Hide when active pane item is not an Elm editor.

## 2.10.5
* Add Import: Copy syntax highlighting of import statements.
* Rename Symbol: Fix error.

## 2.10.4
* Autocomplete Snippets: Fix tab stops bug.

## 2.10.3
* Add Import: Fix bugs regarding union types.
* Autocomplete: Allow ` as <alias> ` before `exposing`.
* Fix import regex bug.

## 2.10.2
* Add Import: Fix bugs regarding dotted module names and infixes.

## 2.10.1
* Add Import: Add `exposing (..)`.

## 2.10.0
* Add `Add Import`.  Thanks to @splodingsocks for the concept and proof of concept! :tada:

## 2.9.0
* Upgrade to Elm 0.18.  Add `String` and `Tuple` to default imports.

## 2.8.4
* Only register the `Pipe Selections` editor the first time it's shown to avoid watching its project directory on package activate.

## 2.8.3
* Remove unneccessary addition of `SymbolFinderView` emitter events to `CompositeDisposable` (causes an error when disabling the package).

## 2.8.2
* Fix #20.  Thanks to @chalmagean for reporting!

## 2.8.1
* Fix regex bug where a usage is not included in the results.

## 2.8.0
* Go To Next Usage / Go To Previous Usage: Won't automatically open the `Usages` panel anymore.

## 2.7.0
* Find Usages: Select usage at cursor position.
* Go To Next Usage / Go To Previous Usage: Now works without invoking `Find Usages` first.
* Reorganized menu and context menu items.

## 2.6.0
* Go To Definition: Now works for 3rd-party packages (Fix #15).  Thanks to @abhinavzspace for the suggestion!

## 2.5.6
* Check if source directory exists first before parsing (Fix #13).  Thanks to @note89 for reporting!

## 2.5.5
* Do not use `@text-color-added` and `@text-color-removed` because not all themes support them.  Thanks to @otijhuis for reporting!

## 2.5.4
* Parse docs of project files.
* Go To Definition: Fix bug where it could not find definition with comments.
* Sidekick: Add link to project symbol source.
* View in browser: Fix module URLs.
* Autocomplete: Increase max width of popup.
* Rename Symbol: Remove flicker after renaming.

## 2.5.3
* Fix `Rename Symbol`, `Find Usages` crash accidentally caused by v2.5.2.

## 2.5.2
* Sidekick: Fix loading messages.

## 2.5.1
* Add additional check for `getWorkDirectory` (Fix #11).  Thanks to @Ryan1729 for reporting!
* Remove extra log messages.

## 2.5.0
* Use `elm-stuff/exact-dependencies.json` (if it exists) to get the project dependency versions.  Use `elm-package.json` as fallback.
* Downloaded package docs are saved in the `Cache Directory`.  User can specify the directory in the package settings.

## 2.3.0, 2.4.0
* These versions were not released due to publish failures.

## 2.2.0
* Use `elm-package.json` to approximate project dependency versions.

## 2.1.1
* Autocomplete: Fix bug when snippets are enabled.

## 2.1.0
* Autocomplete: Insert a newline if the typed text is equal to the chosen suggestion.
* Go To Symbol: Fix highlighting module names with dots.
* Rename Symbol: Allow scrolling.
* Remove `atom-linter` dependency.

## 2.0.1
* Do not crash if `linter-elm-make` is not installed.

## 2.0.0
* BREAKING CHANGE: Replace `Cancel Find Usages` with `Hide Usages Panel`.
* Add `Rename Symbol`.

## 1.1.0
* Add `Find Usages`

## 1.0.0
* BREAKING CHANGE:  Remove `Return From Definition` and added the `Go Back` command.
* Each invocation of `Go To Definition` and `Go To Symbol` will add the current cursor position to a navigation stack.  Invoking `Go Back` pops from the stack.

## 0.4.2
* Allow args in type.
* Fix `Go To Symbol` marker bug.

## 0.4.1
* Add default suggestions to autocomplete.
* Allow args in type alias.

## 0.4.0
* Fix autocomplete bug.
* Sort autocomplete suggestions.
* Add autocomplete snippets.

## 0.3.0
* Add autocomplete for file symbols and imports.

## 0.2.0
* Add [hyperclick](https://atom.io/packages/hyperclick) integration.

## 0.1.4
* Make Sidekick position and size configurable.

## 0.1.3
* Rename package from `elm-fu` to `elmjutsu` :-)

## 0.1.2
* Exclude `elm-stuff` from the watched directories.  Thanks to @smerchek for reporting!

## 0.1.1
* Tweak file watcher config to lessen CPU load.

## 0.1.0 - First Release
