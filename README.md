# elm-fu

A set of editor commands for developing with [elm](http://elm-lang.org).

Warning:  Most of these are hacky experiments that may not always work properly.  Use at your own risk! :p

## Requirements

* [elm](http://elm-lang.org/install)
* [linter-elm-make](https://atom.io/packages/linter-elm-make) for the following:
  - `Elm Fu: Find Usages`
  - `Elm Fu: Find Unused`

## Features

#### `Elm Fu: Find Usages`
Finds all usages of the function under the cursor.

This works by reading the `.elmo` files in `elm-stuff` and generating a JavaScript syntax tree using [Esprima](http://esprima.org/).

For best results, enable `Lint On The Fly` in the [linter-elm-make](https://atom.io/packages/linter-elm-make) settings.

![find-usages](https://github.com/halohalospecial/atom-elm-fu/blob/master/images/find-usages.gif?raw=true)

#### `Elm Fu: Find Unused`
Finds all unused functions in the project.

Uses the same technique as `Elm Fu: Find Usages`.
