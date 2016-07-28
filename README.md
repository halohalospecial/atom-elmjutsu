# Elm-fu

Useful editor tricks for developing with [Elm](http://elm-lang.org).

## Requirements

* [elm](http://elm-lang.org/install)
* [language-elm](https://atom.io/packages/language-elm)

## Commands

#### `Elm Fu: Go To Definition`

#### `Elm Fu: Return From Definition`

![go-to-definition](https://github.com/halohalospecial/atom-elm-fu/blob/master/images/go-to-definition.gif?raw=true)

#### `Elm Fu: Go To Symbol`

![go-to-symbol](https://github.com/halohalospecial/atom-elm-fu/blob/master/images/go-to-symbol.gif?raw=true)

#### `Elm Fu: Toggle Sidekick`

![sidekick](https://github.com/halohalospecial/atom-elm-fu/blob/master/images/sidekick.gif?raw=true)

## Keybindings

Here is an example:
```
'atom-text-editor:not([mini])[data-grammar^="source elm"]':
  'f4': 'elm-fu:go-to-definition'
  'shift-f4': 'elm-fu:return-from-definition'
  'ctrl-f4': 'elm-fu:go-to-symbol'
  'shift-ctrl-f4': 'elm-fu:toggle-sidekick'
```

<!---
Warning:  Most of these are hacky experiments that may not always work properly.  Use at your own risk! :p

#### `Elm Fu: Find Usages`
Finds all usages of the function under the cursor.

This works by reading the `.elmo` files in `elm-stuff` and generating a JavaScript syntax tree using [Esprima](http://esprima.org/).

For best results, enable `Lint On The Fly` in the [linter-elm-make](https://atom.io/packages/linter-elm-make) settings.

![find-usages](https://github.com/halohalospecial/atom-elm-fu/blob/master/images/find-usages.gif?raw=true)

#### `Elm Fu: Find Unused`
Finds all unused functions in the project.

Uses the same technique as `Elm Fu: Find Usages`.
-->
