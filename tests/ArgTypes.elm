module ArgTypes exposing (..)


type alias Position =
    { x : Int, y : Int, z : Float }


type alias Position2 =
    { a : Int, b : Int, pos : Position }


f1 : Position -> Int
f1 pos =
    pos.x + pos.y


f2 : Position -> Int
f2 { z, x, y } =
    x


f3 : Position2 -> Int
f3 pos2 =
    pos2.a + pos2.b + pos2.pos.y


f4 : { a : Int, b : Int } -> (Int -> ( Int, Int )) -> Int
f4 ab fn =
    ab.a + ab.b


f5 : { a : Int, b : Int, c : { x : Int, y : Int } } -> (Int -> ( Int, Int )) -> Int
f5 ab fn =
    let
        _ =
            ab.c
    in
        ab.a + ab.b + ab.c.x


f6 : { a : { aa : Int, ab : Int }, b : Int } -> Int
f6 { a, b } =
    a.aa + a.ab + b


f7 : ( Int, Position ) -> Int
f7 ( a, pos ) =
    pos.x + pos.y


f8 : { a : Int, b : String } -> Int
f8 { b, a } =
    1 + 1 + 2


f9 : ( Int, String ) -> Int
f9 ( a, b ) =
    1


f10 : ( Int, ( Float, String ) ) -> Int
f10 ( a, ( b, c ) ) =
    1


f11 : ( Int, ( Float, String ) ) -> Int
f11 ( a, bc ) =
    1


f12 : ( Int, { a : Int, b : Int } ) -> Int
f12 ( i, { a, b } ) =
    i + a * b


f13 : Position -> Int
f13 ({ x, y } as position) =
    -- Not yet supported.
    x + y + position.x + position.y


type alias RecursiveTypeAlias =
    { recursive : RecursiveTypeAlias
    }


noMaxCallStackSizeExceeded : RecursiveTypeAlias -> Int
noMaxCallStackSizeExceeded recursive =
    recursive.recursive
