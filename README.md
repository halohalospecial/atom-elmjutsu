# Elmjutsu

Useful editor tricks for developing with [Elm](http://elm-lang.org).

## Features

* [Autocomplete](#autocomplete)

* [Go To Definition](#elmjutsu-go-to-definition)

* [Return From Definition](#elmjutsu-return-from-definition)

* [Go To Symbol](#elmjutsu-go-to-symbol)

* [Toggle Sidekick](#elmjutsu-toggle-sidekick)

## Requirements

* [Elm](http://elm-lang.org/install)
* [language-elm](https://atom.io/packages/language-elm)
* For `Go To Definition`:
  * [hyperclick](https://atom.io/packages/hyperclick) (optional)
* For `Autocomplete`:
  * [autocomplete-plus](https://atom.io/packages/autocomplete-plus) (installed by default)
  * [snippets](https://atom.io/packages/snippets) (installed by default)

### Autocomplete

Autocomplete is turned off by default.  To turn it on, check the `Enable Autocomplete` option in the package settings.

It's recommended to turn off the autocomplete feature of the [language-elm](https://atom.io/packages/language-elm) package to prevent duplicate suggestions.

![autocomplete](https://github.com/halohalospecial/atom-elmjutsu/blob/master/images/autocomplete.gif?raw=true)

You can also turn on `Enable Autocomplete Snippets` if you prefer.

![autocomplete-snippet](https://github.com/halohalospecial/atom-elmjutsu/blob/master/images/autocomplete-snippet.gif?raw=true)

### `Elmjutsu: Go To Definition`

![go-to-definition](https://github.com/halohalospecial/atom-elmjutsu/blob/master/images/go-to-definition.gif?raw=true)

If the [hyperclick](https://atom.io/packages/hyperclick) package is installed, you can also check the `Enable Hyperclick` option to jump to definition using `Ctrl` + click / `Cmd` + click (Mac).

### `Elmjutsu: Return From Definition`

![return-from-definition](https://github.com/halohalospecial/atom-elmjutsu/blob/master/images/return-from-definition.gif?raw=true)

### `Elmjutsu: Go To Symbol`

![go-to-symbol](https://github.com/halohalospecial/atom-elmjutsu/blob/master/images/go-to-symbol.gif?raw=true)

### `Elmjutsu: Toggle Sidekick`
Shows the type hints and documentation for the symbol at cursor position.  The size and position of the panel can be modified in the package settings.

Example #1 (default): `Sidekick Position` = "bottom", `Sidekick Size` = 0 (Automatically resizes to fit content.)

![sidekick1](https://github.com/halohalospecial/atom-elmjutsu/blob/master/images/sidekick1.gif?raw=true)

Example #2: `Sidekick Position` = "bottom", `Sidekick Size` = 30 (Just shows the type hints.)

![sidekick2](https://github.com/halohalospecial/atom-elmjutsu/blob/master/images/sidekick2.gif?raw=true)

Example #3: `Sidekick Position` = "right", `Sidekick Size` = 300

![sidekick3](https://github.com/halohalospecial/atom-elmjutsu/blob/master/images/sidekick3.gif?raw=true)

## Keybindings

Here is an example:
```
'atom-text-editor:not([mini])[data-grammar^="source elm"]':
  'f12': 'elmjutsu:go-to-definition'
  'shift-f12': 'elmjutsu:return-from-definition'
  'ctrl-r': 'elmjutsu:go-to-symbol'
  'f1': 'elmjutsu:toggle-sidekick'
```

Add above to your `keymap.cson` or bind them from `Settings` > `Keybindings`.

## Notes

* The commands only work for top-level values for now.
* If you find yourself always autocompleting "==" for "=" when you press <kbd>enter</kbd>, you can do one of the following:
  * Press <kbd>escape</kbd> to cancel autocomplete before pressing <kbd>enter</kbd>.
  * Set the value of `Autocomplete Min Chars` in the package settings to a higher number, let's say `2`.
  * Set the value of `Keymap For Confirming A Suggestion` in the package settings of `autocomplete-plus` to `tab always, enter when suggestion explicitly selected`, instead of the default `tab and enter`.

## Credits

* The initial code was based on the [source](https://github.com/elm-lang/elm-lang.org) of [Try Elm](http://elm-lang.org/try).
* The [code](https://github.com/edubkendo/atom-elm) for computing snippet tab stops was from [language-elm](https://atom.io/packages/language-elm).


<!---
Warning:  Most of these are hacky experiments that may not always work properly.  Use at your own risk! :p

#### `Elmjutsu: Find Usages`
Finds all usages of the symbol under the cursor.

This works by reading the `.elmo` files in `elm-stuff` and generating a JavaScript syntax tree using [Esprima](http://esprima.org/).

For best results, enable `Lint On The Fly` in the [linter-elm-make](https://atom.io/packages/linter-elm-make) settings.

![find-usages](https://github.com/halohalospecial/atom-elmjutsu/blob/master/images/find-usages.gif?raw=true)

#### `Elmjutsu: Find Unused`
Finds all unused symbols in the project.

Uses the same technique as `Elmjutsu: Find Usages`.
-->
