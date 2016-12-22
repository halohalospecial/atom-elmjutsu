module TestCompleteFromTypeAnnotation exposing (..)

import Dict


type alias Position =
    { x : Int, y : Int, z : Float }


ta1 : Int -> Int -> Int -> Int
ta1 int int2 int3 =
    1


ta2 : List String -> Int
ta2 stringList =
    1


ta3 : Position -> ( Int, Int ) -> Int -> Int
ta3 position ( int, int2 ) int3 =
    1


ta4 : Position -> { a : Int, b : Int } -> { a : Int, b : Int } -> Int
ta4 position record record2 =
    1


ta5 : Position -> ( Int, { a : Int, b : Int } ) -> Int -> Int
ta5 position ( int, { a, b } ) int2 =
    1


ta6 : List (Dict.Dict String Int) -> Int
ta6 intStringDictDictList =
    1


ta7 : ( Int, Int ) -> ( Int, Int ) -> Int -> Int
ta7 ( int, int2 ) ( int3, int4 ) int5 =
    1
