module CamelizeTest exposing (camelizeClaims)

import String.Extra exposing (..)
import String
import Check exposing (Claim, suite, claim, that, is, for, true)
import Check.Producer exposing (string, filter)


camelizeClaims : Claim
camelizeClaims =
    suite "camelize"
        [ claim "It does not contain dashes"
            `true` (not << String.contains "-" << camelize)
            `for` filter (\arg -> String.contains "-" arg) string
        , claim "It does not contain underscores"
            `true` (not << String.contains "_" << camelize)
            `for` filter (\arg -> String.contains "_" arg) string
        , claim "It is the same lowercased string after removing the dashes and spaces"
            `that` (camelize >> String.toLower)
            `is` (replace "-" "" >> replace "_" "" >> replace " " "" >> String.toLower)
            `for` string
        , claim "The first letter after each dash is capitalized"
            `that` (camelize)
            `is` (camelizeTest "-")
            `for` filter
                    (\arg ->
                        (String.contains "-" arg)
                            && not (String.contains "_" arg)
                            && not (String.contains " " arg)
                    )
                    string
        , claim "The first letter after each underscore is capitalized"
            `that` (camelize)
            `is` (camelizeTest "_")
            `for` filter
                    (\arg ->
                        (String.contains "_" arg)
                            && not (String.contains "-" arg)
                            && not (String.contains " " arg)
                    )
                    string
        , claim "The first letter after each space is capitalized"
            `that` (camelize)
            `is` (camelizeTest " ")
            `for` filter
                    (\arg ->
                        (String.contains " " arg)
                            && not (String.contains "-" arg)
                            && not (String.contains "_" arg)
                    )
                    string
        ]


camelizeTest : String -> String -> String
camelizeTest separator string =
    string
        |> String.trim
        |> replace (separator ++ separator) separator
        |> String.split separator
        |> List.indexedMap capitalizeOdds
        |> String.join ""


capitalizeOdds : Int -> String -> String
capitalizeOdds pos str =
    if pos > 0 then
        toSentenceCase str
    else
        str
