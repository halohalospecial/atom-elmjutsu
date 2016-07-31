# Elmjutsu

Useful editor tricks for developing with [Elm](http://elm-lang.org).

## Requirements

* [elm](http://elm-lang.org/install)
* [language-elm](https://atom.io/packages/language-elm)

## Commands

#### `Elmjutsu: Go To Definition`

![go-to-definition](https://github.com/halohalospecial/atom-elmjutsu/blob/master/images/go-to-definition.gif?raw=true)

#### `Elmjutsu: Return From Definition`

![return-from-definition](https://github.com/halohalospecial/atom-elmjutsu/blob/master/images/return-from-definition.gif?raw=true)

#### `Elmjutsu: Go To Symbol`

![go-to-symbol](https://github.com/halohalospecial/atom-elmjutsu/blob/master/images/go-to-symbol.gif?raw=true)

#### `Elmjutsu: Toggle Sidekick`

![sidekick](https://github.com/halohalospecial/atom-elmjutsu/blob/master/images/sidekick.gif?raw=true)

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

The initial code was based on the [Try Elm](http://elm-lang.org/try) [source](https://github.com/elm-lang/elm-lang.org/tree/master/src/editor).

<!---
Warning:  Most of these are hacky experiments that may not always work properly.  Use at your own risk! :p

#### `Elmjutsu: Find Usages`
Finds all usages of the function under the cursor.

This works by reading the `.elmo` files in `elm-stuff` and generating a JavaScript syntax tree using [Esprima](http://esprima.org/).

For best results, enable `Lint On The Fly` in the [linter-elm-make](https://atom.io/packages/linter-elm-make) settings.

![find-usages](https://github.com/halohalospecial/atom-elmjutsu/blob/master/images/find-usages.gif?raw=true)

#### `Elmjutsu: Find Unused`
Finds all unused functions in the project.

Uses the same technique as `Elmjutsu: Find Usages`.
-->
