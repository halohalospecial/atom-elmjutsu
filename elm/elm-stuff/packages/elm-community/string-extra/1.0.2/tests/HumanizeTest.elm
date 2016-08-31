module HumanizeTest exposing (humanizeClaims)

import String.Extra exposing (..)
import String
import Check exposing (Claim, suite, claim, that, is, for, true, false)
import Check.Producer exposing (string, filter)
import Char
import Regex


humanizeClaims : Claim
humanizeClaims =
    suite "humanize"
        [ claim "It starts with an uppercase letter after trimming"
            `that` (humanize >> String.uncons >> Maybe.map (fst >> String.fromChar) >> Maybe.withDefault "")
            `is` (String.trim >> toSentenceCase >> String.uncons >> Maybe.map (fst >> String.fromChar) >> Maybe.withDefault "")
            `for` filter (not << Regex.contains (Regex.regex "^[-_]+")) string
        , claim "The tail of the string is lowercased"
            `true` (humanize >> String.uncons >> Maybe.map snd >> Maybe.withDefault "" >> String.all (Char.isLower))
            `for` filter (Regex.contains (Regex.regex "^[a-zA-Z]$")) string
        , claim "It replaces underscores and dashes with a single whitespace"
            `that` (humanize >> String.toLower)
            `is` (replace "-" " " >> replace "_" " " >> replace "  " " " >> String.trim)
            `for` filter (Regex.contains (Regex.regex "^[a-z_-]$")) string
        , claim "It yields the same string after removing underscores, dashes and spaces"
            `that` (humanize >> replace " " "" >> String.toLower)
            `is` (replace " " "" >> replace "-" "" >> replace "_" "" >> String.toLower)
            `for` string
        , claim "It adds a space before each uppercase letter"
            `that` (humanize >> String.toLower)
            `is` (replaceUppercase >> String.toLower >> String.trim)
            `for` filter (Regex.contains (Regex.regex "^[a-zA-Z]$")) string
        , claim "It does not leave double spaces around"
            `false` (humanize >> String.contains "  ")
            `for` string
        , claim "It strips the _id at the end"
            `false` ((flip String.append) "_id" >> humanize >> String.endsWith "id")
            `for` filter (Regex.contains (Regex.regex "^[a-zA-Z_-]$")) string
        ]


replaceUppercase : String -> String
replaceUppercase string =
    string
        |> String.toList
        |> List.map
            (\c ->
                if Char.isUpper c then
                    " " ++ (String.fromChar c)
                else
                    String.fromChar c
            )
        |> String.join ""
