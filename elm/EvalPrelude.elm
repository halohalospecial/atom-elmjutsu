module EvalPrelude exposing (..)

import List exposing (drop, filter, head, indexedMap, intersperse, map, range, repeat, reverse, sort, tail, take)
import String exposing (words, lines, toLower, toUpper, split, join, left, right, slice, dropLeft, dropRight, pad, padLeft, padRight, trim, trimLeft, trimRight)


append : String -> String -> String
append textToAppend =
    \s -> s ++ textToAppend


prepend : String -> String -> String
prepend textToPrepend =
    \s -> textToPrepend ++ s


linesToFloat : Float -> List String -> List Float
linesToFloat default =
    List.map (String.toFloat >> Result.withDefault default)


aggregateFloat : (List Float -> Float) -> Float -> List String -> Float
aggregateFloat fun default selectedLines =
    selectedLines
        |> linesToFloat default
        |> fun


sum : List String -> Float
sum =
    aggregateFloat List.sum 0


product : List String -> Float
product =
    aggregateFloat List.product 1


max : List String -> Float
max selectedLines =
    let
        floats =
            linesToFloat 0 selectedLines
    in
        case List.maximum floats of
            Just max ->
                max

            Nothing ->
                0


min : List String -> Float
min selectedLines =
    let
        floats =
            linesToFloat 0 selectedLines
    in
        case List.minimum floats of
            Just min ->
                min

            Nothing ->
                0


strReverse : String -> String
strReverse =
    String.reverse


strRepeat : Int -> String -> String
strRepeat =
    String.repeat


toFloat : String -> Float
toFloat text =
    String.toFloat text
        |> Result.withDefault 0


toInt : String -> Int
toInt text =
    String.toInt text
        |> Result.withDefault 0
