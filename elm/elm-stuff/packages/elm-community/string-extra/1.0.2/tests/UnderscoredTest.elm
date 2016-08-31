module UnderscoredTest exposing (underscoredClaims)

import String.Extra exposing (..)
import String
import Check exposing (Claim, suite, claim, that, is, for, true)
import Check.Producer exposing (string, filter)
import Char
import Regex


underscoredClaims : Claim
underscoredClaims =
    suite "underscored"
        [ claim "It is a lowercased string"
            `that` (underscored >> String.toLower)
            `is` (underscored)
            `for` string
        , claim "It replaces spaces and dashes with an underscore"
            `that` (String.toLower >> underscored)
            `is` (String.toLower >> String.trim >> replace "  " " " >> replace " " "-" >> replace "-" "_" >> replace "__" "_")
            `for` string
        , claim "It puts an underscore before each uppercase characters group unless it starts with uppercase"
            `that` (underscored)
            `is` (replaceUppercase >> String.toLower)
            `for` filter (Regex.contains (Regex.regex "^[a-zA-Z]+$")) string
        ]


replaceUppercase : String -> String
replaceUppercase string =
    string
        |> String.toList
        |> List.indexedMap (,)
        |> List.foldr recordUpperCasePositions []
        |> List.foldl reduceList []
        |> List.foldl replacePositions string


recordUpperCasePositions : ( Int, Char ) -> List ( Int, Char ) -> List ( Int, Char )
recordUpperCasePositions ( index, char ) acc =
    if Char.isUpper char then
        ( index, char ) :: acc
    else
        acc


reduceList : ( Int, Char ) -> List ( Int, Int, Char ) -> List ( Int, Int, Char )
reduceList ( index, char ) acc =
    case acc of
        ( start, end, c ) :: rest ->
            if index == end + 1 then
                ( start, index, c ) :: rest
            else
                ( index, index, char ) :: acc

        [] ->
            ( index, index, char ) :: acc


replacePositions : ( Int, Int, Char ) -> String -> String
replacePositions ( start, _, c ) string =
    if start == 0 then
        string
    else
        replaceSlice ("_" ++ (String.fromChar c)) start (start + 1) string
