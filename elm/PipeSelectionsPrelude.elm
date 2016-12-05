module PipeSelectionsPrelude exposing (..)

import List as L
import String as S


enumerate : String -> List String
enumerate text =
    String.lines text
        |> List.indexedMap (\i a -> toString (i + 1) ++ ". " ++ a)


linesMap : (String -> String) -> String -> List String
linesMap fn text =
    String.lines text
        |> List.map fn
