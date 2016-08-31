module DasherizeTest exposing (dasherizeClaims)

import String.Extra exposing (..)
import String
import Check exposing (Claim, suite, claim, that, is, for, true)
import Check.Producer exposing (string, filter)
import Char
import Regex


dasherizeClaims : Claim
dasherizeClaims =
    suite "dasherize"
        [ claim "It is a lowercased string"
            `that` (dasherize >> String.toLower)
            `is` (dasherize)
            `for` string
        , claim "It replaces spaces and underscores with a dash"
            `that` (String.toLower >> dasherize)
            `is` (String.toLower >> String.trim >> replace "  " " " >> replace " " "-" >> replace "_" "-" >> replace "--" "-")
            `for` string
        , claim "It puts dash before every single uppercase character"
            `that` (dasherize)
            `is` (replaceUppercase >> String.toLower)
            `for` filter (Regex.contains (Regex.regex "^[a-zA-Z]+$")) string
        ]


replaceUppercase : String -> String
replaceUppercase string =
    string
        |> String.toList
        |> List.map
            (\c ->
                if Char.isUpper c then
                    "-" ++ (String.fromChar c)
                else
                    String.fromChar c
            )
        |> String.join ""
