module Test exposing (..)

import String.Extra exposing (..)
import String exposing (uncons, fromChar, toUpper, toLower)
import Check exposing (Claim, Evidence, suite, claim, that, is, for, true, false, quickCheck)
import Check.Producer exposing (string, list, tuple, filter, rangeInt, tuple3, tuple4, map)
import Check.Test
import Check.Producer exposing (Producer)
import Regex
import ElmTest
import CamelizeTest exposing (camelizeClaims)
import UnderscoredTest exposing (underscoredClaims)
import DasherizeTest exposing (dasherizeClaims)
import HumanizeTest exposing (humanizeClaims)
import UnindentTest exposing (unindentClaims)


toSentenceCaseClaims : Claim
toSentenceCaseClaims =
    suite "toSentenceCase"
        [ claim "It only converts to uppercase the first char in the string"
            `that` (toSentenceCase >> uncons >> Maybe.map (fst >> fromChar) >> Maybe.withDefault "")
            `is` (uncons >> Maybe.map (fst >> fromChar >> toUpper) >> Maybe.withDefault "")
            `for` string
        , claim "The tail of the string remains untouched"
            `that` (toSentenceCase >> uncons >> Maybe.map snd >> Maybe.withDefault "")
            `is` (uncons >> Maybe.map snd >> Maybe.withDefault "")
            `for` string
        ]


decapitalizeClaims : Claim
decapitalizeClaims =
    suite "decapitalize"
        [ claim "It only converts to lowercase the first char in the string"
            `that` (decapitalize >> uncons >> Maybe.map (fst >> fromChar) >> Maybe.withDefault "")
            `is` (uncons >> Maybe.map (fst >> fromChar >> toLower) >> Maybe.withDefault "")
            `for` string
        , claim "The tail of the string remains untouched"
            `that` (decapitalize >> uncons >> Maybe.map snd >> Maybe.withDefault "")
            `is` (uncons >> Maybe.map snd >> Maybe.withDefault "")
            `for` string
        ]


toTitleCaseClaims : Claim
toTitleCaseClaims =
    suite "toTitleCase"
        [ claim "It converts the first letter of each word to uppercase"
            `that` (String.join " " >> toTitleCase >> String.words)
            `is` (String.join " " >> String.words >> List.map toSentenceCase)
            `for` list string
        , claim "It does not change the length of the string"
            `that` (String.join " " >> toTitleCase >> String.length)
            `is` (String.join " " >> String.length)
            `for` list string
        ]


replaceClaims : Claim
replaceClaims =
    suite "replace"
        [ claim "It substitutes all occurences of the same sequence"
            `that` (\( string, substitute ) -> replace string substitute string)
            `is` (\( string, substitute ) -> substitute)
            `for` tuple ( string, string )
        , claim "It substitutes multiple occurances"
            `false` (\string -> replace "a" "b" string |> String.contains "a")
            `for` filter (\arg -> String.contains "a" arg) string
        , claim "It accepts special characters"
            `true` (\string -> replace "\\" "bbbbb" string |> String.contains "bbbb")
            `for` filter (\arg -> String.contains "\\" arg) string
        ]


replaceSliceClaims : Claim
replaceSliceClaims =
    suite "replace"
        [ claim "Result contains the substitution string"
            `true`
                (\( string, sub, start, end ) ->
                    replaceSlice sub start end string |> String.contains sub
                )
            `for` replaceSliceProducer
        , claim "Result string has the length of the substitution + string after removing the slice"
            `that`
                (\( string, sub, start, end ) ->
                    replaceSlice sub start end string |> String.length
                )
            `is`
                (\( string, sub, start, end ) ->
                    (String.length string - (end - start)) + (String.length sub)
                )
            `for` replaceSliceProducer
        , claim "Start of the original string remains the same"
            `that`
                (\( string, sub, start, end ) ->
                    replaceSlice sub start end string |> String.slice 0 start
                )
            `is`
                (\( string, _, start, _ ) ->
                    String.slice 0 start string
                )
            `for` replaceSliceProducer
        , claim "End of the original string remains the same"
            `that`
                (\( string, sub, start, end ) ->
                    let
                        replaced =
                            replaceSlice sub start end string
                    in
                        replaced |> String.slice (start + (String.length sub)) (String.length replaced)
                )
            `is`
                (\( string, _, _, end ) ->
                    String.slice end (String.length string) string
                )
            `for` replaceSliceProducer
        ]


replaceSliceProducer : Producer ( String, String, Int, Int )
replaceSliceProducer =
    filter
        (\( string, sub, start, end ) ->
            (start < end)
                && (String.length string >= end)
                && (not <| String.isEmpty sub)
        )
        (tuple4 ( string, string, (rangeInt 0 10), (rangeInt 0 10) ))


breakClaims : Claim
breakClaims =
    suite "break"
        [ claim "The list should have as many elements as the ceil division of the length"
            `that` (\( string, width ) -> break width string |> List.length)
            `is`
                (\( string, width ) ->
                    let
                        b =
                            toFloat (String.length string)

                        r =
                            ceiling (b / (toFloat width))
                    in
                        clamp 1 10 r
                )
            `for` tuple ( string, (rangeInt 1 10) )
        , claim "Concatenating the result yields the original string"
            `that` (\( string, width ) -> break width string |> String.concat)
            `is` (\( string, _ ) -> string)
            `for` tuple ( string, (rangeInt 1 10) )
        , claim "No element in the list should have more than `width` chars"
            `true`
                (\( string, width ) ->
                    break width string
                        |> List.map (String.length)
                        |> List.filter ((<) width)
                        |> List.isEmpty
                )
            `for` tuple ( string, (rangeInt 1 10) )
        ]


softBreakClaims : Claim
softBreakClaims =
    suite "softBreak"
        [ claim "Concatenating the result yields the original string"
            `that` (\( string, width ) -> softBreak width string |> String.concat)
            `is` (\( string, _ ) -> string)
            `for` tuple ( string, (rangeInt 1 10) )
        , claim "The list should not have more elements than words"
            `true`
                (\( string, width ) ->
                    let
                        broken =
                            softBreak width string |> List.length

                        words =
                            String.words string |> List.length
                    in
                        broken <= words
                )
            `for` tuple ( string, (rangeInt 1 10) )
        ]


cleanClaims : Claim
cleanClaims =
    suite "clean"
        [ claim "The String.split result is the same as String.words"
            `that` (clean >> String.split " ")
            `is` (String.words)
            `for` string
        , claim "It trims the string on the left side"
            `true` (not << String.startsWith " " << clean)
            `for` string
        , claim "It trims the string on the right side"
            `true` (not << String.endsWith " " << clean)
            `for` string
        ]


insertAtClaims : Claim
insertAtClaims =
    suite "insertAt"
        [ claim "Result contains the substitution string"
            `true`
                (\( sub, at, string ) ->
                    string
                        |> insertAt sub at
                        |> String.contains sub
                )
            `for` insertAtProducer
        , claim "Resulting string has length as the sum of both arguments"
            `that`
                (\( sub, at, string ) ->
                    (String.length sub) + (String.length string)
                )
            `is`
                (\( sub, at, string ) ->
                    insertAt sub at string
                        |> String.length
                )
            `for` insertAtProducer
        , claim "Start of the string remains the same"
            `that`
                (\( sub, at, string ) ->
                    String.slice 0 at string
                )
            `is`
                (\( sub, at, string ) ->
                    insertAt sub at string
                        |> String.slice 0 at
                )
            `for` insertAtProducer
        , claim "End of the string remains the same"
            `that`
                (\( sub, at, string ) ->
                    String.slice at (String.length string) string
                )
            `is`
                (\( sub, at, string ) ->
                    insertAt sub at string
                        |> String.slice (at + (String.length sub))
                            ((String.length string) + String.length sub)
                )
            `for` insertAtProducer
        ]


insertAtProducer : Producer ( String, Int, String )
insertAtProducer =
    filter
        (\( sub, at, string ) ->
            (String.length string >= at)
                && (not <| String.isEmpty sub)
        )
        (tuple3 ( string, (rangeInt 0 10), string ))


isBlankClaims : Claim
isBlankClaims =
    suite "isBlank"
        [ claim "Returns false if there are non whitespace characters"
            `that` (isBlank)
            `is` (Regex.contains (Regex.regex "^\\s*$"))
            `for` string
        ]


classifyClaims : Claim
classifyClaims =
    suite "classify"
        [ claim "It does not contain non-word characters"
            `false` (classify >> Regex.contains (Regex.regex "[\\W]"))
            `for` string
        , claim "It starts with an uppercase letter"
            `that` (classify >> uncons >> Maybe.map fst)
            `is` (String.trim >> String.toUpper >> uncons >> Maybe.map fst)
            `for` filter (not << Regex.contains (Regex.regex "[\\W_]")) string
        , claim "It is camelized once replaced non word charactes with a compatible string"
            `that` (classify >> uncons >> Maybe.map snd)
            `is` (replace "." "-" >> camelize >> uncons >> Maybe.map snd)
            `for` filter (Regex.contains (Regex.regex "^[a-zA-Z\\s\\.\\-\\_]+$")) string
        ]


surroundClaims : Claim
surroundClaims =
    suite "surround"
        [ claim "It starts with the wrapping string"
            `true` (\( string, wrap ) -> surround wrap string |> String.startsWith wrap)
            `for` tuple ( string, string )
        , claim "It ends with the wrapping string"
            `true` (\( string, wrap ) -> surround wrap string |> String.endsWith wrap)
            `for` tuple ( string, string )
        , claim "It contains the original string"
            `true` (\( string, wrap ) -> surround wrap string |> String.contains string)
            `for` tuple ( string, string )
        , claim "It does not have anythig else inside"
            `true`
                (\( string, wrap ) ->
                    surround wrap string
                        |> String.length
                        |> (==) ((String.length string) + (2 * String.length wrap))
                )
            `for` tuple ( string, string )
        ]


countOccurrencesClaims : Claim
countOccurrencesClaims =
    suite "countOccurrences"
        [ claim "Removing the occurrences should yield the right length"
            `true`
                (\( needle, haystack ) ->
                    let
                        replacedLength =
                            replace needle "" haystack |> String.length

                        times =
                            countOccurrences needle haystack
                    in
                        replacedLength == (String.length haystack - (times * (String.length needle)))
                )
            `for`
                filter (\( needle, haystack ) -> String.contains needle haystack)
                    (tuple ( string, string ))
        ]


ellipsisClaims : Claim
ellipsisClaims =
    suite "ellipsis"
        [ claim "The resulting string lenght does not exceed the specified length"
            `true`
                (\( howLong, string ) ->
                    ellipsis howLong string
                        |> String.length
                        |> (>=) howLong
                )
            `for` (tuple ( rangeInt 3 20, string ))
        , claim "The resulting string contains three dots and the end if necessary"
            `true`
                (\( howLong, string ) ->
                    ellipsis howLong string
                        |> String.endsWith "..."
                )
            `for`
                filter
                    (\( howLong, string ) -> String.length string >= howLong + 3)
                    (tuple ( rangeInt 0 20, string ))
        , claim "It starts with the left of the original string"
            `true`
                (\( howLong, string ) ->
                    string
                        |> String.startsWith (ellipsis howLong string |> String.dropRight 3)
                )
            `for`
                filter
                    (\( howLong, string ) -> String.length string >= howLong + 3)
                    (tuple ( rangeInt 0 20, string ))
        , claim "The resulting string does not contain three dots if it is short enough"
            `false`
                (\( howLong, string ) ->
                    ellipsis howLong string
                        |> String.endsWith "..."
                )
            `for`
                filter
                    (\( howLong, string ) -> String.length string <= howLong)
                    (tuple ( rangeInt 0 20, string ))
        ]


unquoteClaims : Claim
unquoteClaims =
    suite "unquote"
        [ claim "Removes quotes the start and end of all strings"
            `false`
                (\string ->
                    let
                        unquoted =
                            unquote string
                    in
                        String.startsWith "\"" unquoted && String.endsWith "\"" unquoted
                )
            `for` string
        ]


wrapClaims : Claim
wrapClaims =
    suite "wrap"
        [ claim "Wraps given string at the requested length"
            `true`
                (\( howLong, string ) ->
                    wrap howLong string
                        |> String.split "\n"
                        |> List.map (\str -> String.length str <= howLong)
                        |> List.all ((==) True)
                )
            `for` tuple ( rangeInt 1 20, string )
        , claim "Does not wrap strings that are shorter than the requested length"
            `false`
                (\( howLong, string ) ->
                    wrap howLong string
                        |> String.contains "\n"
                )
            `for`
                filter
                    (\( howLong, string ) -> String.length string <= howLong)
                    (tuple ( rangeInt 1 20, string ))
        ]


evidence : Evidence
evidence =
    suite "String.Extra"
        [ toSentenceCaseClaims
        , toTitleCaseClaims
        , decapitalizeClaims
        , replaceClaims
        , replaceSliceClaims
        , breakClaims
        , softBreakClaims
        , cleanClaims
        , insertAtClaims
        , isBlankClaims
        , camelizeClaims
        , classifyClaims
        , surroundClaims
        , underscoredClaims
        , dasherizeClaims
        , humanizeClaims
        , unindentClaims
        , countOccurrencesClaims
        , ellipsisClaims
        , unquoteClaims
        , wrapClaims
        ]
        |> quickCheck


main : Program Never
main =
    ElmTest.runSuite (Check.Test.evidenceToTest evidence)
