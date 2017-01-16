# Elmjutsu

A bag of tricks for developing with [Elm](http://elm-lang.org).

https://atom.io/packages/elmjutsu

## Feature Overview

* [Autocomplete](#autocomplete)

* Navigation

  * [Go To Definition](#elmjutsu-go-to-definition)

  * [Go To Symbol](#elmjutsu-go-to-symbol)

  * [Find Usages](#elmjutsu-find-usages)

  * [Go To Next Usage](#elmjutsu-go-to-next-usage)

  * [Go To Previous Usage](#elmjutsu-go-to-previous-usage)

  * [Go Back](#elmjutsu-go-back)

* [Add Import](#elmjutsu-add-import)

* [Toggle Sidekick](#elmjutsu-toggle-sidekick)
  * Show type hints and documentation for the symbol at cursor position.

* Package Management
  * [Install Package](#elmjutsu-install-package)
  * [Uninstall Package](#elmjutsu-uninstall-package)

* Refactoring
  * [Rename Symbol](#elmjutsu-rename-symbol)
  * [Surround with let/in](#elmjutsu-surround-with-let-in)
  * [Lift to let](#elmjutsu-lift-to-let)

## Requirements

* [Elm](http://elm-lang.org/install)
* [language-elm](https://atom.io/packages/language-elm) (no need to install elm-oracle)
* For `Go To Definition`:
  * [hyperclick](https://atom.io/packages/hyperclick) (optional)
* For `Autocomplete`:
  * [autocomplete-plus](https://atom.io/packages/autocomplete-plus) (installed by default)
  * [snippets](https://atom.io/packages/snippets) (optional, installed by default)

## Feature Details

By default, the only thing this package does is parse your project's source files to extract information, and download documentation of 3rd-party Elm packages.  You have to manually enable the features that you need.  The downloaded documentation files will be saved to the path set in `Cache Directory` in the settings view.  If `Cache Directory` is blank, a temporary directory will be used.  Take note that most operating systems delete temporary directories at bootup or at regular intervals.

### Autocomplete

Autocomplete is turned off by default.  To turn it on, check `Enable Autocomplete` in the package settings.

This provides suggestions for imports, project symbols, and 3rd-party package symbols.

* It's recommended to uncheck `Enable autocomplete` of the [language-elm](https://atom.io/packages/language-elm) package to prevent duplicate suggestions.

![autocomplete](https://github.com/halohalospecial/atom-elmjutsu/blob/master/images/autocomplete.gif?raw=true)

* Check `Enable Global Autocomplete` if you want include unimported project symbols.  This will also enable "Auto import" completion (which works like [Add Import](#elmjutsu-add-import)).

![auto-import](https://github.com/halohalospecial/atom-elmjutsu/blob/master/images/auto-import.gif?raw=true)

* You can also check `Enable Autocomplete Snippets` if you prefer.

![autocomplete-snippet](https://github.com/halohalospecial/atom-elmjutsu/blob/master/images/autocomplete-snippet.gif?raw=true)

* Special completions:

Press <kbd>tab</kbd> to go to the next tab stop (similar to how snippets work).

![construct-basic](https://github.com/halohalospecial/atom-elmjutsu/blob/master/images/construct-basic.gif?raw=true)

![construct-case-of](https://github.com/halohalospecial/atom-elmjutsu/blob/master/images/construct-case-of.gif?raw=true)

![construct-default-value-for-type](https://github.com/halohalospecial/atom-elmjutsu/blob/master/images/construct-default-value-for-type.gif?raw=true)

![construct-from-type-annotation-1](https://github.com/halohalospecial/atom-elmjutsu/blob/master/images/construct-from-type-annotation-1.gif?raw=true)

![construct-from-type-annotation-2](https://github.com/halohalospecial/atom-elmjutsu/blob/master/images/construct-from-type-annotation-2.gif?raw=true)

### Navigation

  * #### `Elmjutsu: Go To Definition`

    ![go-to-definition](https://github.com/halohalospecial/atom-elmjutsu/blob/master/images/go-to-definition.gif?raw=true)

    If the [hyperclick](https://atom.io/packages/hyperclick) package is installed, you can also check `Enable Hyperclick` to jump to definition using `Ctrl` + click / `Cmd` + click (Mac).

  * #### `Elmjutsu: Go To Symbol`

    ![go-to-symbol](https://github.com/halohalospecial/atom-elmjutsu/blob/master/images/go-to-symbol.gif?raw=true)

  * #### `Elmjutsu: Find Usages`

    ![find-usages](https://github.com/halohalospecial/atom-elmjutsu/blob/master/images/find-usages.gif?raw=true)

  * #### `Elmjutsu: Go To Next Usage`

    Moves the cursor to the position of the next usage.

  * #### `Elmjutsu: Go To Previous Usage`

    Moves the cursor to the position of the previous usage.

  * #### `Elmjutsu: Go Back`

    The current cursor position is added to a navigation stack before jumping via:
      * `Go To Definition`
      * `Go To Symbol`
      * `Go To Next Usage`
      * `Go To Previous Usage`

    Invoke this command to jump back to the previous position.

  * #### `Elmjutsu: Hide Usages Panel`

    Closes the `Usages` panel (the panel is shown after invoking `Find Usages` or `Rename Symbol`).

### `Elmjutsu: Add Import`

Quickly adds an import without scrolling to the top of the file.  Also sorts the imports, removes duplicates, and removes [defaults](http://package.elm-lang.org/packages/elm-lang/core/latest/) automatically.

![add-import](https://github.com/halohalospecial/atom-elmjutsu/blob/master/images/add-import.gif?raw=true)

### `Elmjutsu: Toggle Sidekick`
Shows the type hints and documentation for the symbol at cursor position.  The size and position of the panel can be modified in the package settings.

* Example #1 (default): `Sidekick Position` = "bottom", `Sidekick Size` = 0 (Automatically resizes to fit content.)

![sidekick1](https://github.com/halohalospecial/atom-elmjutsu/blob/master/images/sidekick1.gif?raw=true)

* Example #2: `Sidekick Position` = "bottom", `Sidekick Size` = 30 (Just shows the type hints.)

![sidekick2](https://github.com/halohalospecial/atom-elmjutsu/blob/master/images/sidekick2.gif?raw=true)

* Example #3: `Sidekick Position` = "right", `Sidekick Size` = 300

![sidekick3](https://github.com/halohalospecial/atom-elmjutsu/blob/master/images/sidekick3.gif?raw=true)

### Package Management

  * #### `Elmjutsu: Install Package`

    Quickly installs a package.

    - This runs `elm-package install --yes <name> <version>` (or `elm-package install --yes <name>` if the selected version is "Auto").
    - Make sure that `Elm Package Path` is properly configured in the package settings.

  * ### `Elmjutsu: Uninstall Package`

    Removes an installed package.

    - This removes the dependency from `elm-package.json`, then runs `elm-package install --yes` to clean up.

### Refactoring

  * #### `Elmjutsu: Rename Symbol`

    Renames the symbol across the whole project.  Take note that this is *not* an undoable operation.

    * Press <kbd>enter</kbd> to rename or <kbd>escape</kbd> to cancel.
    * Uncheck usages to exclude.
    * Modified modules with open editors will *not* be saved automatically.
    * Renaming a module will *not* rename the associated file.
    * Currently, this also modifies the symbol name inside comments.

    ![rename-symbol](https://github.com/halohalospecial/atom-elmjutsu/blob/master/images/rename-symbol.gif?raw=true)


  * #### `Elmjutsu: Surround With Let In`

    ![surround-with-let-in](https://github.com/halohalospecial/atom-elmjutsu/blob/master/images/surround-with-let-in.gif?raw=true)

  * #### `Elmjutsu: Lift To Let`

    ![lift-to-let](https://github.com/halohalospecial/atom-elmjutsu/blob/master/images/lift-to-let.gif?raw=true)


## Keybindings

Here is an example:
```
'atom-text-editor:not([mini])[data-grammar^="source elm"]':
  'f12': 'elmjutsu:go-to-definition'
  'ctrl-r': 'elmjutsu:go-to-symbol'
  'shift-f12': 'elmjutsu:find-usages'
  'f8': 'elmjutsu:go-to-next-usage'
  'shift-f8': 'elmjutsu:go-to-previous-usage'
  'ctrl-f12': 'elmjutsu:go-back'
  'f2': 'elmjutsu:rename-symbol'
  'alt-insert': 'elmjutsu:add-import'

'atom-workspace':
  'f1': 'elmjutsu:toggle-sidekick'
  'ctrl-shift-f12': 'elmjutsu:hide-usages-panel'

'atom-text-editor':
  'alt-enter': 'elmjutsu:eval'
  'ctrl-enter': 'elmjutsu:pipe-selections'

'.elmjutsu-pipe-selections':
  "ctrl-enter": "elmjutsu:apply-pipe-selections"
```

Add them to your `keymap.cson` or bind them from `Settings` > `Keybindings`.

## Notes

* Be sure to check out the [settings](http://flight-manual.atom.io/using-atom/sections/atom-packages/#package-settings) for this package to find out about the available options.
* It's highly recommended to read `CHANGELOG.md` before upgrading to a newer version to check for breaking changes.
* The commands only work for top-level values for now.
* You may encounter weird behaviors if multiple files are using the same module name in your project.
* Major parts of this will be rewritten when a way to get the AST becomes available. Also, more features :)

## Credits

* The initial code was based on the [source](https://github.com/elm-lang/elm-lang.org) of [Try Elm](http://elm-lang.org/try).
