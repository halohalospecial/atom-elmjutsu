module ConstructFromTypeAnnotation exposing (..)

-- import Set as S

import Dict exposing (Dict)
import Array
import Color


type alias Position2D =
    ( Int, Int )


type alias Position3D =
    { x : Float, y : Float, z : Float }


aBool : Bool
aBool =
    False


aNumber : number
aNumber =
    0


anInt : Int
anInt =
    0


aFloat : Float
aFloat =
    0.0


aString : String
aString =
    ""


{-| A doc comment.
-}
withDocComment : String
withDocComment =
    ""



-- aChar : Char
-- aChar =
--     ''


aList : List String
aList =
    []


anArray : Array.Array Int
anArray =
    Array.empty


aDict : Dict.Dict String String
aDict =
    Dict.empty


aDict2 : Dict String String
aDict2 =
    -- Not yet supported.
    Dict.empty


aCmd : Cmd msg
aCmd =
    Cmd.none


aColor : Color.Color
aColor =
    Color.black


aMaybe : Maybe String
aMaybe =
    Nothing



-- aResult : Result String String
-- aResult =
--     Ok ""


aSub : Sub msg
aSub =
    Sub.none



-- aSetAliased : S.Set String
-- aSetAliased =
--     S.empty


a2DPosition : ( Float, Float )
a2DPosition =
    ( 0.0, 0.0 )


aStringTuple : ( String, String )
aStringTuple =
    ( "", "" )


aListTuple : ( List String, List String )
aListTuple =
    ( [], [] )


a3DPosition : Position3D
a3DPosition =
    { x = 0.0, y = 0.0, z = 0.0 }


a3DPosition2 : { x : Float, y : Float, z : Float }
a3DPosition2 =
    { x = 0.0, y = 0.0, z = 0.0 }



-- a3DPosition2 =
--     { x = 0.0
--     , y = 0.0
--     , z = 0.0
--     }


mixedPositions : ( ( Float, Float ), Position3D )
mixedPositions =
    ( ( 0.0, 0.0 ), { x = 0.0, y = 0.0, z = 0.0 } )


mixedPositions2 : ( ( Float, Float ), { x : Float, y : Float, pos : Position2D } )
mixedPositions2 =
    ( ( 0.0, 0.0 ), { x = 0.0, y = 0.0, pos = ( 0, 0 ) } )


ta1 : Int -> Int -> Int -> Int
ta1 int int2 int3 =
    0


ta2 : List String -> Int
ta2 stringList =
    0


ta3 : Position2D -> ( Int, Int ) -> Int -> Int
ta3 position2D ( int, int2 ) int3 =
    0


ta4 : Position2D -> { a : Int, b : Int } -> { a : Int, b : Int } -> Int
ta4 position2D record record2 =
    0


ta5 : Position2D -> ( Int, { a : Int, b : Int } ) -> Int -> Int
ta5 position2D ( int, record ) int2 =
    0


ta6 : List (Dict.Dict String Int) -> Int
ta6 intStringDictDictList =
    0


ta7 : List ( String, Int ) -> Int
ta7 intStringList =
    -- Should be `stringIntTupleList`?
    0


ta8 : ( Int, Int ) -> ( Int, Int ) -> Int -> Int
ta8 ( int, int2 ) ( int3, int4 ) int5 =
    0


type MyType a
    = MyTypeA a
    | MyTypeB


ta9 : MyType String -> MyType String
ta9 stringMyType =
    MyTypeA ""


ta10 : (a -> b) -> (a -> b) -> List a -> List b
ta10 function function2 aList =
    []



-- withType : { a : Int, b : MyType }
-- withType =
--     { a = 0, b = { a =  } }
--
-- type alias MyType =
--     { a : MyType
--     }
--
-- withRecursiveTypeAlias : { a : Int, b : MyType }
-- withRecursiveTypeAlias =
--     { a = 0, b = { a =  } }
-- ----------
