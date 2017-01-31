module Helper exposing (..)

import Regex


isInfix : String -> Bool
isInfix =
    Regex.contains infixRegex


infixRegex : Regex.Regex
infixRegex =
    -- Backtick (`), underscore (_), and semicolon (;) are not allowed in infixes.
    Regex.regex "^[~!@#\\$%\\^&\\*\\-\\+=:\\|\\\\<>\\.\\?\\/]+$"


{-| TODO: Allow unicode.
-}
capitalizedRegex : Regex.Regex
capitalizedRegex =
    Regex.regex "^[A-Z]"


isCapitalized : String -> Bool
isCapitalized =
    Regex.contains capitalizedRegex


argSeparatorRegex : Regex.Regex
argSeparatorRegex =
    Regex.regex "\\s+|\\(|\\)|\\.|,|-|>"


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
