# Elmjutsu

Useful editor tricks for developing with [Elm](http://elm-lang.org).

## Requirements

* [Elm](http://elm-lang.org/install)
* [language-elm](https://atom.io/packages/language-elm)
* [hyperclick](https://atom.io/packages/hyperclick) (optional)

## Features

[Autocomplete](#autocomplete)

[Go To Definition](#elmjutsu-go-to-definition)

[Return From Definition](#elmjutsu-return-from-definition)

[Go To Symbol](#elmjutsu-go-to-symbol)

[Toggle Sidekick](#elmjutsu-toggle-sidekick)

### Autocomplete

Autocomplete is turned off by default.  To turn it on, check the `Enable Autocomplete` option in the package settings.

It's recommended to turn off the autocomplete feature of the [language-elm](https://atom.io/packages/language-elm) package to prevent duplicate suggestions.

You can also turn on `Enable Autocomplete Snippets` if you prefer.

![autocomplete](https://github.com/halohalospecial/atom-elmjutsu/blob/master/images/autocomplete.gif?raw=true)

### `Elmjutsu: Go To Definition`

To make this work with the [hyperclick](https://atom.io/packages/hyperclick) package, check the `Enable Hyperclick` option in the package settings.

![go-to-definition](https://github.com/halohalospecial/atom-elmjutsu/blob/master/images/go-to-definition.gif?raw=true)

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
  'f4': 'elmjutsu:go-to-definition'
  'shift-f4': 'elmjutsu:return-from-definition'
  'ctrl-f4': 'elmjutsu:go-to-symbol'
  'shift-ctrl-f4': 'elmjutsu:toggle-sidekick'
```

## Credits

- The initial code was based on the [source](https://github.com/elm-lang/elm-lang.org) of [Try Elm](http://elm-lang.org/try).
- The [code](https://github.com/edubkendo/atom-elm) for computing snippet tab stops was from [language-elm](https://atom.io/packages/language-elm).


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
