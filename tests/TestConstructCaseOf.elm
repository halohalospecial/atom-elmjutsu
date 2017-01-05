module TestConstructCaseOf exposing (..)


caseMaybe : Maybe a -> Int
caseMaybe aMaybe =
    case aMaybe of
        Just a ->
            1

        Nothing ->
            0


type MyType
    = TypeA
    | TypeB (List Int)


caseMyType : MyType -> Int
caseMyType myType =
    case myType of
        TypeA ->
            1

        TypeB intList ->
            0
