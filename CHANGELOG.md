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
* Add additional check for `getWorkDirectory` (Fix #11).
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
* Exclude `elm-stuff` from the watched directories.  Thanks @smerchek!

## 0.1.1
* Tweak file watcher config to lessen CPU load.

## 0.1.0 - First Release
