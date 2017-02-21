module Helper exposing (holeToken, isInfix, isCapitalized, dropLast, last, decapitalize)

import Regex


holeToken : String
holeToken =
    "?"


isInfix : String -> Bool
isInfix =
    Regex.contains infixRegex


infixRegex : Regex.Regex
infixRegex =
    -- Backtick (`), underscore (_), and semicolon (;) are not allowed in infixes.
    Regex.regex "^[~!@#\\$%\\^&\\*\\-\\+=:\\|\\\\<>\\.\\?\\/]+$"


isCapitalized : String -> Bool
isCapitalized str =
    let
        firstChar =
            String.slice 0 1 str
    in
        if firstChar == "" then
            False
        else
            firstChar == String.slice 0 1 (String.toUpper str)


dropLast : List a -> List a
dropLast list =
    list
        |> List.reverse
        |> List.tail
        |> Maybe.withDefault []
        |> List.reverse


last : List a -> Maybe a
last list =
    list
        |> List.reverse
        |> List.head


decapitalize : String -> String
decapitalize str =
    case String.uncons str of
        Just ( ch, rest ) ->
            (String.toLower <| String.fromChar ch) ++ rest

        Nothing ->
            ""
