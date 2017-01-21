module ConstructCaseOf exposing (..)


caseMaybe : Maybe String -> Int
caseMaybe aMaybe =
    case aMaybe of
        Just string ->
            1

        Nothing ->
            0


caseBool : Bool -> Int
caseBool aBool =
    case aBool of
        True ->
            1

        False ->
            0


boolFunction : Bool
boolFunction =
    True


caseBoolFunction : Int
caseBoolFunction =
    case boolFunction of
        True ->
            1

        False ->
            0


type alias Record =
    { aMaybe : Maybe String
    }


caseRecord : Record -> Int
caseRecord record =
    case record.aMaybe of
        Just string ->
            1

        Nothing ->
            0


type MyType a
    = MyTypeA a
    | MyTypeB (List Int)
    | MyTypeC ( Int, String )
    | MyTypeD


caseMyType : MyType String -> Int
caseMyType myType =
    case myType of
        MyTypeA string ->
            1

        MyTypeB intList ->
            2

        MyTypeC ( int, string ) ->
            3

        MyTypeD ->
            4


caseTuple : Bool -> Bool -> Int
caseTuple bool bool2 =
    -- Not yet implemented.
    case ( bool, bool2 ) of
        ( True, True ) ->
            1

        ( True, False ) ->
            2

        ( False, True ) ->
            3

        ( False, False ) ->
            4
