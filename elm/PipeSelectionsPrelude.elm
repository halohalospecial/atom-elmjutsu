module PipeSelectionsPrelude exposing (..)

import List as L
import String as S
import String exposing (..)
import String.Extra exposing (..)


enumerate =
    List.indexedMap (\i a -> toString (i + 1) ++ ". " ++ a)


appendAll b =
    List.map (\a -> a ++ b)


prependAll b =
    List.map (\a -> b ++ a)


trimAll =
    List.map String.trim


toFloatList list =
    List.map (String.toFloat >> Result.withDefault 0) list


total list =
    list ++ [ List.sum (toFloatList list) |> toString ]
