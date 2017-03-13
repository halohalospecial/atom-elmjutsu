# Elmjutsu

A bag of tricks for developing with [Elm](http://elm-lang.org).

https://atom.io/packages/elmjutsu

## Setup

* Install [Elm](http://elm-lang.org/install).
* Install [language-elm](https://atom.io/packages/language-elm) (no need to install `elm-oracle` or `goto`).
* For `Go to Definition`:
  * Install [hyperclick](https://atom.io/packages/hyperclick) (optional).
* For `Autocomplete`:
  * Install [autocomplete-plus](https://atom.io/packages/autocomplete-plus) (installed by default).
  * Install [snippets](https://atom.io/packages/snippets) (optional, installed by default).
* Add your [keybindings](#keybindings).

Related Atom packages:
- [linter-elm-make](https://atom.io/packages/linter-elm-make) for error highlighting and quick fixes
- [elm-format](https://atom.io/packages/elm-format) to format your Elm source code on save
- More here: https://atom.io/packages/search?q=elm

## Features Overview

* [Autocomplete](#autocomplete)
  * [Global Autocomplete](#global-autocomplete)
  * [Type-Aware Autocomplete](#type-aware-autocomplete)
  * [Autocomplete Snippets](#autocomplete-snippets)
  * [Special completions](#special-completions)
  * [Filtering suggestions](#autocomplete-filtering)
  * [Performance tuning](#autocomplete-performance-tuning)

* Navigation
  * [Go to Definition](#go-to-definition)
  * [Go to Symbol](#go-to-symbol)
  * [Find Usages](#find-usages)
  * [Go to Next Usage](#go-to-next-usage)
  * [Go to Previous Usage](#go-to-previous-usage)
  * [Go Back](#go-back)

* Information
  * [Show Types in Tooltip](#show-types-in-tooltip)
  * [Toggle Sidekick](#toggle-sidekick)
    * Show the type and documentation for the symbol at cursor position in a panel.
  * [Infer Type](#infer-type)

* Imports Management
  * [Add Import](#add-import)

* Package Management
  * [Install Package](#install-package)
  * [Uninstall Package](#uninstall-package)

* Refactoring
  * [Rename Symbol](#rename-symbol)
  * [Surround with `let`](#surround-with-let)
  * [Lift to `let`](#lift-to-let)
  * [Lift to top-level](#lift-to-top-level)

## Feature Details

By default, the only thing this package does is parse your project's source files to extract information, and download documentation of 3rd-party Elm packages.  You have to manually enable the features that you need.  The downloaded documentation files will be saved to the path set in `Cache Directory` in the settings view.  If `Cache Directory` is blank, a temporary directory will be used.  Take note that most operating systems delete temporary directories at bootup or at regular intervals.

### <a name="autocomplete"></a>Autocomplete

Autocomplete is turned off by default.  To turn it on, check `Enable Autocomplete` in the package settings.

This provides suggestions for imports, project symbols, and 3rd-party package symbols.

* It's recommended to uncheck `Enable autocomplete` of the [language-elm](https://atom.io/packages/language-elm) package to prevent duplicate suggestions.

![autocomplete](https://github.com/halohalospecial/atom-elmjutsu/blob/master/images/autocomplete.gif?raw=true)

#### <a name="global-autocomplete"></a>Global Autocomplete
* Check `Enable Global Autocomplete` if you want to include unimported project symbols.
  * This will also allow :zap:`Auto import` completion (which works like [Add Import](#elmjutsu-add-import)).
  * Take note that you may experience lag if you have a large project.

![auto-import](https://github.com/halohalospecial/atom-elmjutsu/blob/master/images/auto-import.gif?raw=true)

#### <a name="type-aware-autocomplete"></a>Type-Aware Autocomplete
* Check `Enable Type-Aware Autocomplete` if you want to prioritize suggestions matching the expected type at cursor position.
  * The type can be inferred via the `Infer Type` command, but it's recommended to check `Infer Expected Type At Cursor On The Fly` in the package settings instead.
  * This will also allow :zap:`Replace with inferred type` completion.
  * WARNING: This is highly experimental and may cause lag, especially if `Enable Global Autocomplete` is also checked.

![type-aware-autocomplete](https://github.com/halohalospecial/atom-elmjutsu/blob/master/images/type-aware-autocomplete.gif?raw=true)

#### <a name="autocomplete-snippets"></a>Autocomplete Snippets
* You can also check `Enable Autocomplete Snippets` if you prefer.

![autocomplete-snippet](https://github.com/halohalospecial/atom-elmjutsu/blob/master/images/autocomplete-snippet.gif?raw=true)

#### <a name="special-completions"></a>Special completions :zap:

Press <kbd>tab</kbd> to go to the next tab stop (similar to how snippets work).  Special completions can be disabled individually in the package settings.

* :zap:`Insert module`
* :zap:`Insert let/in`
* :zap:`Insert if/then/else`

![construct-basic](https://github.com/halohalospecial/atom-elmjutsu/blob/master/images/construct-basic.gif?raw=true)

* :zap:`Insert case/of`

![construct-case-of](https://github.com/halohalospecial/atom-elmjutsu/blob/master/images/construct-case-of.gif?raw=true)

* :zap:`Insert default arguments`

![construct-default-arguments](https://github.com/halohalospecial/atom-elmjutsu/blob/master/images/construct-default-arguments.gif?raw=true)

* :zap:`Replace type with default`

![construct-default-value-for-type](https://github.com/halohalospecial/atom-elmjutsu/blob/master/images/construct-default-value-for-type.gif?raw=true)

* :zap:`Define from type annotation`

![construct-from-type-annotation-1](https://github.com/halohalospecial/atom-elmjutsu/blob/master/images/construct-from-type-annotation-1.gif?raw=true)

![construct-from-type-annotation-2](https://github.com/halohalospecial/atom-elmjutsu/blob/master/images/construct-from-type-annotation-2.gif?raw=true)

* :zap:`Auto import`

  See [Global Autocomplete](#global-autocomplete).

* :zap:`Replace with inferred type`

  See [Type-Aware Autocomplete](#type-aware-autocomplete).

#### <a name="autocomplete-filtering"></a>Filtering suggestions

* <a name="autocomplete-fuzzy-filtering"></a>Fuzzy filtering

  You can check `Enable Autocomplete Fuzzy Filtering` to filter suggestions using [fuzz-aldrin-plus](https://github.com/jeancroy/fuzz-aldrin-plus).

  ![autocomplete-fuzzy-filtering](https://github.com/halohalospecial/atom-elmjutsu/blob/master/images/autocomplete-fuzzy-filtering.gif?raw=true)

* <a name="autocomplete-regex-filtering"></a>Regex filtering

  If the typed text starts with a slash (`/`), the rest of the characters will be used as a regular expression to filter the suggestions.

  ![autocomplete-regex-filtering](https://github.com/halohalospecial/atom-elmjutsu/blob/master/images/autocomplete-regex-filtering.gif?raw=true)

#### <a name="autocomplete-performance-tuning"></a>Performance tuning

  * If you are experiencing lag while typing, you can set the value of `Max Number of Autocomplete Suggestions` to a small number such as `50` so that Atom will have less items to render.

  * Enabling <b>both</b> [Global Autocomplete](#global-autocomplete) and [Type-Aware Autocomplete](#type-aware-autocomplete) will usually result to lag because there will be lots of computations involved.  This may be improved in the future.

### Navigation

  * #### <a name="go-to-definition"></a>`Elmjutsu: Go To Definition`

    ![go-to-definition](https://github.com/halohalospecial/atom-elmjutsu/blob/master/images/go-to-definition.gif?raw=true)

    If the [hyperclick](https://atom.io/packages/hyperclick) package is installed, you can also check `Enable Hyperclick` to jump to definition using `Ctrl` + click / `Cmd` + click (Mac).

  * #### <a name="go-to-symbol"></a>`Elmjutsu: Go To Symbol`

    ![go-to-symbol](https://github.com/halohalospecial/atom-elmjutsu/blob/master/images/go-to-symbol.gif?raw=true)

  * #### <a name="find-usages"></a>`Elmjutsu: Find Usages`

    ![find-usages](https://github.com/halohalospecial/atom-elmjutsu/blob/master/images/find-usages.gif?raw=true)

  * #### <a name="go-to-next-usage"></a>`Elmjutsu: Go To Next Usage`

    Moves the cursor to the position of the next usage.

  * #### <a name="go-to-previous-usage"></a>`Elmjutsu: Go To Previous Usage`

    Moves the cursor to the position of the previous usage.

  * #### <a name="go-back"></a>`Elmjutsu: Go Back`

    The current cursor position is added to a navigation stack before jumping via:
      * `Go To Definition`
      * `Go To Symbol`
      * `Go To Next Usage`
      * `Go To Previous Usage`

    Invoke this command to jump back to the previous position.

  * #### <a name="hide-usages-panel"></a>`Elmjutsu: Hide Usages Panel`

    Closes the `Usages` panel (the panel is shown after invoking `Find Usages` or `Rename Symbol`).

### <a name="show-types-in-tooltip"></a>Show Types in Tooltip
This is disabled by default.  To turn it on, check `Show Types in Tooltip` in the package settings.  You can also change the placement of the tooltip (`Types Tooltip Position`).

![show-types-in-tooltip](https://github.com/halohalospecial/atom-elmjutsu/blob/master/images/show-types-in-tooltip.gif?raw=true)

### <a name="toggle-sidekick"></a>`Elmjutsu: Toggle Sidekick`
Shows the type hints and documentation for the symbol at cursor position.  The size, position of the panel, and amount of information to show can be modified in the package settings.

* Example #1 (default): `Sidekick Position` = "bottom", `Sidekick Size` = 0 (Automatically resizes to fit content.)

![sidekick1](https://github.com/halohalospecial/atom-elmjutsu/blob/master/images/sidekick1.gif?raw=true)

* Example #2: `Sidekick Position` = "right", `Sidekick Size` = 300

![sidekick3](https://github.com/halohalospecial/atom-elmjutsu/blob/master/images/sidekick3.gif?raw=true)

* Example #3: `Sidekick Position` = "bottom", `Show Types in Sidekick` is checked, `Show Doc Comments in Sidekick` and `Show Source Paths in Sidekick` are unchecked.

![sidekick2](https://github.com/halohalospecial/atom-elmjutsu/blob/master/images/sidekick2.gif?raw=true)

### <a name="infer-type"></a>`Elmjutsu: Infer Type`
* Select some text or make sure that the cursor is between whitespaces or before a closing parenthesis before invoking this command.  If nothing is selected and the cursor is not between whitespaces, the word under the cursor will be selected.
* Make sure that `Elm Make Path` is properly configured in the package settings.  The default works for most cases.
* You should also have `Show Types in Tooltip` checked in the package settings (or the Sidekick panel visible) to be able to see the inferred types.
* This uses similar tricks as those described in [Type Bombs in Elm](http://blog.jenkster.com/2016/11/type-bombs-in-elm.html), which may sometimes fail or give incorrect results.

### <a name="infer-types-on-the-fly"></a>Infer types on the fly
* You can also check the `Infer Expected Type At Cursor On The Fly` and `Infer Type Of Selection On The Fly` options in the package settings.
* WARNING: `Infer Type Of Selection On The Fly` currently has bad interactions with some packages that decorate the markers (e.g. `Find And Replace`) :cry: This will be fixed in the future.

![infer-types-on-the-fly](https://github.com/halohalospecial/atom-elmjutsu/blob/master/images/infer-types-on-the-fly.gif?raw=true)

<!-- ### <a name="infer-hole-types"></a>`Elmjutsu: Infer Hole Types`
* Use question marks (`?`) to represent the type holes.
* Make sure that `Elm Make Path` is properly configured in the package settings.  The default works for most cases.
* You should also have `Show Types in Tooltip` checked in the package settings (or the Sidekick panel visible) to be able to see the inferred types.
* You can also check the `Infer Hole Types On The Fly` option in the package settings.
* This uses the trick described in [Type Bombs in Elm](http://blog.jenkster.com/2016/11/type-bombs-in-elm.html) and may sometimes fail.

![infer-hole-types](https://github.com/halohalospecial/atom-elmjutsu/blob/master/images/infer-hole-types.gif?raw=true)

![infer-hole-types-2](https://github.com/halohalospecial/atom-elmjutsu/blob/master/images/infer-hole-types-2.gif?raw=true)
-->
### <a name="add-import"></a>`Elmjutsu: Add Import`

Quickly adds an import without scrolling to the top of the file.  Also sorts the imports, removes duplicates, and removes [defaults](http://package.elm-lang.org/packages/elm-lang/core/latest/) automatically.

* ProTip: There's no "Sort Imports" command, but you can achieve the same result by invoking `Add Import` and choosing an already imported symbol (like `+`, for example).

![add-import](https://github.com/halohalospecial/atom-elmjutsu/blob/master/images/add-import.gif?raw=true)

### Package Management

  * #### <a name="install-package"></a>`Elmjutsu: Install Package`

    Quickly installs a package.

    - This runs `elm-package install --yes <name> <version>` (or `elm-package install --yes <name>` if the selected version is "Auto").
    - Make sure that `Elm Package Path` is properly configured in the package settings.  The default works for most cases.

  * ### <a name="uninstall-package"></a>`Elmjutsu: Uninstall Package`

    Removes an installed package.

    - This removes the dependency from `elm-package.json`, then runs `elm-package install --yes` to clean up.

### Refactoring

  * #### <a name="rename-symbol"></a>`Elmjutsu: Rename Symbol`

    Renames the symbol across the whole project.  Take note that this is *not* an undoable operation.

    * Press <kbd>enter</kbd> to rename or <kbd>escape</kbd> to cancel.
    * Uncheck usages to exclude.
    * Modified modules with open editors will *not* be saved automatically.
    * Renaming a module will *not* rename the associated file.
    * Currently, this also modifies the symbol name inside comments.

    ![rename-symbol](https://github.com/halohalospecial/atom-elmjutsu/blob/master/images/rename-symbol.gif?raw=true)

  * #### <a name="surround-with-let"></a>`Elmjutsu: Surround With Let`

    * Press <kbd>escape</kbd> when you're done naming your variable.

    ![surround-with-let](https://github.com/halohalospecial/atom-elmjutsu/blob/master/images/surround-with-let-in.gif?raw=true)

  * #### <a name="lift-to-let"></a>`Elmjutsu: Lift To Let`

    * Press <kbd>escape</kbd> when you're done naming your variable.
    * There are still cases where this will not work properly.  There will be a better implementation in the future.

    ![lift-to-let](https://github.com/halohalospecial/atom-elmjutsu/blob/master/images/lift-to-let.gif?raw=true)

  * #### <a name="lift-to-top-level"></a>`Elmjutsu: Lift To Top Level`

    * Press <kbd>escape</kbd> when you're done naming your function.
    * This does not compute the needed function arguments (yet?), so you also have to type those in with the function name.

    ![lift-to-top-level](https://github.com/halohalospecial/atom-elmjutsu/blob/master/images/lift-to-top-level.gif?raw=true)


## <a name="keybindings"></a>Keybindings

Here is an example:
```
'atom-text-editor:not([mini])[data-grammar^="source elm"]':
  'f12': 'elmjutsu:go-to-definition'
  'ctrl-r': 'elmjutsu:go-to-symbol'
  'shift-f12': 'elmjutsu:find-usages'
  'f8': 'elmjutsu:go-to-next-usage'
  'shift-f8': 'elmjutsu:go-to-previous-usage'
  'ctrl-f12': 'elmjutsu:go-back'
  'alt-insert': 'elmjutsu:add-import'
  'f2': 'elmjutsu:rename-symbol'
  'alt-shift-l': 'elmjutsu:surround-with-let'
  'alt-l': 'elmjutsu:lift-to-let'
  'alt-t': 'elmjutsu:lift-to-top-level'
  'alt-i': 'elmjutsu:infer-type'

'atom-workspace':
  'f1': 'elmjutsu:toggle-sidekick'
  'ctrl-shift-f12': 'elmjutsu:hide-usages-panel'
```
<!--
'atom-text-editor':
  'alt-enter': 'elmjutsu:eval'
  'ctrl-enter': 'elmjutsu:pipe-selections'

'.elmjutsu-pipe-selections':
  "ctrl-enter": "elmjutsu:apply-pipe-selections"
```
-->

Add them to your `keymap.cson` or bind them from `Settings` > `Keybindings`.

## Notes

* Be sure to check out the [settings](http://flight-manual.atom.io/using-atom/sections/atom-packages/#package-settings) for this package to find out about the available options.
* It's highly recommended to read `CHANGELOG.md` before upgrading to a newer version to check for breaking changes.
* The commands only work for top-level values for now.
* You may encounter weird behaviors if multiple files are using the same module name in your project.
* Major parts of this will be rewritten when a way to get the AST becomes available. Also, more features :)

## Credits

* The initial code was based on the [source](https://github.com/elm-lang/elm-lang.org) of [Try Elm](http://elm-lang.org/try).
