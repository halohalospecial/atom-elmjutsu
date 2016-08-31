module UnindentTest exposing (unindentClaims)

import String.Extra exposing (..)
import String
import Check exposing (Claim, suite, claim, that, is, for, true)
import Check.Producer exposing (Producer, tuple3, rangeInt, map)


unindentClaims : Claim
unindentClaims =
    suite "unindent"
        [ claim "It produces the same trimmed string"
            `that` (unindent >> String.lines >> List.map (String.trimLeft))
            `is` (String.lines >> List.map (String.trimLeft))
            `for` multilineProducerString
        , claim "It produces at least one line with no leading whitespace"
            `true` (unindent >> String.lines >> List.map (not << String.startsWith " ") >> List.any ((==) True))
            `for` multilineProducerString
        , claim "All lines' length have been reduced by exactly the minimum indentation"
            `that` (fst >> unindent >> String.lines >> List.map String.length)
            `is` (\( string, spaces ) -> string |> String.lines |> List.map (String.length) |> List.map (\i -> i - spaces))
            `for` multilineProducer
        ]


multilineProducerString : Producer String
multilineProducerString =
    map (convertToMultiline >> fst)
        (tuple3 ( rangeInt 0 10, rangeInt 0 10, rangeInt 0 10 ))


multilineProducer : Producer ( String, Int )
multilineProducer =
    map (convertToMultiline)
        (tuple3 ( rangeInt 0 10, rangeInt 0 10, rangeInt 0 10 ))


convertToMultiline : ( Int, Int, Int ) -> ( String, Int )
convertToMultiline ( a, b, c ) =
    ( [ (String.repeat a " ") ++ "aaaa aaa "
      , (String.repeat b " ") ++ "aaaa aaa"
      , (String.repeat c " ") ++ "ccc  "
      ]
        |> String.join "\n"
    , min (min a b) c
    )
