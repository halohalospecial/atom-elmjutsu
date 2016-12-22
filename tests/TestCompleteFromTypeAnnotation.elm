module TestCompleteFromTypeAnnotation exposing (..)

import Dict


type alias Position =
    { x : Int, y : Int, z : Float }


ta1 : Int
ta1 =
    1


ta2 : Int -> Int -> Int -> Int
ta2 int int2 int3 =
    1


ta3 : List String -> Int
ta3 stringList =
    1


ta4 : Position -> ( Int, Int ) -> Int -> Int
ta4 position ( int, int2 ) int3 =
    1


ta5 : Position -> { a : Int, b : Int } -> { a : Int, b : Int } -> Int
ta5 position record record2 =
    1


ta6 : Position -> ( Int, { a : Int, b : Int } ) -> Int -> Int
ta6 position ( int, { a, b } ) int2 =
    1


ta7 : List (Dict.Dict String Int) -> Int
ta7 intStringDictDictList =
    1


ta8 : ( Int, Int ) -> ( Int, Int ) -> Int -> Int
ta8 ( int, int2 ) ( int3, int4 ) int5 =
    1
