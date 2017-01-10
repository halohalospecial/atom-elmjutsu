module EvalPrelude exposing (..)

import List as L
import String as S


enumerate : String -> List String
enumerate text =
    String.lines text
        |> List.indexedMap (\i a -> toString (i + 1) ++ ". " ++ a)


mapLines : (String -> String) -> String -> List String
mapLines fn text =
    String.lines text
        |> List.map fn
