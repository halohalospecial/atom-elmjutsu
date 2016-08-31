import List as L
import String as S
import String exposing (..)
import String.Extra exposing (..)


enumerate =
    L.indexedMap (\i s -> toString (i + 1) ++ ". " ++ s)
