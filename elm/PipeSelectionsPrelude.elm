module PipeSelectionsPrelude exposing (..)

import List as L
import String as S
import String exposing (..)
import String.Extra exposing (..)


enumerate =
    L.indexedMap (\i a -> toString (i + 1) ++ ". " ++ a)


append b =
    L.map (\a -> a ++ b)


prepend b =
    L.map (\a -> b ++ a)
