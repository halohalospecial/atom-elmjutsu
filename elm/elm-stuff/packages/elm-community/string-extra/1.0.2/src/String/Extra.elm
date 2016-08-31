module String.Extra
    exposing
        ( toSentenceCase
        , toTitleCase
        , decapitalize
        , replace
        , replaceSlice
        , insertAt
        , break
        , softBreak
        , clean
        , isBlank
        , camelize
        , underscored
        , dasherize
        , classify
        , humanize
        , quote
        , unquote
        , surround
        , unsurround
        , wrap
        , wrapWith
        , softWrap
        , softWrapWith
        , unindent
        , countOccurrences
        , ellipsis
        , softEllipsis
        , ellipsisWith
        , toSentence
        , toSentenceOxford
        , stripTags
        , rightOf
        , leftOf
        , rightOfBack
        , leftOfBack
        )

{-| Additional functions for working with Strings

## Change words casing

@docs toSentenceCase, toTitleCase, decapitalize

## Inflector functions

Functions borrowed from the Rails Inflector class

@docs camelize, classify, underscored, dasherize, humanize

## Replace and Splice

@docs replace, replaceSlice, insertAt, clean

## Splitting

@docs break, softBreak

## Wrapping

@docs wrap, wrapWith, softWrap, softWrapWith, quote, surround

## Checks

@docs isBlank, countOccurrences

## Formatting

@docs clean, unquote, unsurround, unindent, ellipsis, softEllipsis, ellipsisWith, stripTags

## Converting Lists

@docs toSentence, toSentenceOxford

## Finding

@docs rightOf, leftOf, rightOfBack, leftOfBack

-}

import String exposing (uncons, cons, words, join)
import Char exposing (toUpper, toLower)
import Regex exposing (regex, escape, HowMany(..))
import Maybe exposing (Maybe(..))
import List


{-| Changes the case of the first letter of a string to either Uppercase of
    lowercase, depending of the value of `wantedCase`. This is an internal
    function for use in `toSencenceCase` and `decapitalize`.

-}
changeCase : (Char -> Char) -> String -> String
changeCase mutator word =
    uncons word
        |> Maybe.map (\( head, tail ) -> (cons (mutator head) tail))
        |> Maybe.withDefault ""


{-| Make a string's first character uppercase

    toSentenceCase "this is a phrase" == "This is a phrase"
    toSentenceCase "hello, world" == "Hello, world"

-}
toSentenceCase : String -> String
toSentenceCase word =
    changeCase (toUpper) word


{-| Make a string's first character lowercase.

    decapitalize "This is a phrase" == "this is a phrase"
    decapitalize "Hello, World" == "hello, World"

-}
decapitalize : String -> String
decapitalize word =
    changeCase (toLower) word


{-| Uppercase the first character of each word in a string

    toTitleCase "this is a phrase" == "This Is A Phrase"
    toTitleCase "hello, world" == "Hello, World"

-}
toTitleCase : String -> String
toTitleCase ws =
    let
        uppercaseMatch =
            Regex.replace All (regex "\\w+") (.match >> toSentenceCase)
    in
        ws
            |> Regex.replace All
                (regex "^([a-z])|\\s+([a-z])")
                (.match >> uppercaseMatch)


{-| Replace all occurrences of the search string with the substitution string.

    replace "Mary" "Sue" "Hello, Mary" == "Hello, Sue"

-}
replace : String -> String -> String -> String
replace search substitution string =
    string
        |> Regex.replace All (regex (escape search)) (\_ -> substitution)


{-| Replace text within a portion of a string given a substitution
string, a start index and an end index.

    replaceSlice "Sue" 4 6 "Hi, Bob" == "Hi, Sue"
    replaceSlice "elephants" 0  6 "snakes on a plane!" == "elephants on a plane!"
    replaceSlice "under" 7  9 "snakes on a plane!" == "snakes under a plane!"

-}
replaceSlice : String -> Int -> Int -> String -> String
replaceSlice substitution start end string =
    (String.slice 0 start string) ++ substitution ++ (String.slice end (String.length string) string)


{-| Inserts a substring at the specified index.

    insertAt "world" 6 "Hello " == "Hello world"
-}
insertAt : String -> Int -> String -> String
insertAt insert pos string =
    replaceSlice insert pos pos string


{-| Breaks a string into a list of strings of maximum the provided size.

    break 10 "The quick brown fox" == ["The quick ", "brown fox"]
    break 2 "" == [""]

-}
break : Int -> String -> List String
break width string =
    if width == 0 || string == "" then
        [ string ]
    else
        breaker width string []


breaker : Int -> String -> List String -> List String
breaker width string acc =
    case string of
        "" ->
            List.reverse acc

        _ ->
            breaker width
                (String.dropLeft width string)
                ((String.slice 0 width string) :: acc)


{-| Breaks a string into a list of strings of maximum the provided size,
without cutting words at the edge.

    softBreak 6 "The quick brown fox" == ["The quick", " brown", " fox"]

-}
softBreak : Int -> String -> List String
softBreak width string =
    if width <= 0 then
        []
    else
        string
            |> Regex.find All (softBreakRegexp width)
            |> List.map (.match)


softBreakRegexp : Int -> Regex.Regex
softBreakRegexp width =
    regex <| ".{1," ++ (toString width) ++ "}(\\s|$)|\\S+?(\\s|$)"


{-| Trims the whitespace of both sides of the string and compresses
reapeated whitespace internally to a single whitespace char.

    clean " The   quick brown   fox    " == "The quick brown fox"

-}
clean : String -> String
clean string =
    string
        |> Regex.replace All (regex "\\s\\s+") (always " ")
        |> String.trim


{-| Tests if a string is empty or only contains whitespace

    isBlank "" == True
    isBlank "\n" == True
    isBlank "  " == True
    isBlank " a" == False

-}
isBlank : String -> Bool
isBlank string =
    Regex.contains (regex "^\\s*$") string


{-| Converts underscored or dasherized string to a camelized one.

   camelize "-moz-transform" == "MozTransform"

-}
camelize : String -> String
camelize string =
    Regex.replace All
        (regex "[-_\\s]+(.)?")
        (\{ submatches } ->
            case submatches of
                (Just match) :: _ ->
                    String.toUpper match

                _ ->
                    ""
        )
        (String.trim string)


{-| Converts string to camelized string starting with an uppercase.
All non word characters will be stripped out of the original string.

    classify "some_class_name" == "SomeClassName"
    classify "myLittleCamel.class.name" == "MyLittleCamelClassName"

-}
classify : String -> String
classify string =
    string
        |> Regex.replace All (regex "[\\W_]") (always " ")
        |> camelize
        |> replace " " ""
        |> toSentenceCase


{-| Surrounds a string with another string.

    surround "bar" "foo" == "barfoobar"

-}
surround : String -> String -> String
surround wrap string =
    wrap ++ string ++ wrap


{-| Removes surrounding strings from another string.

    unsurround "foo" "foobarfoo" == "bar"

-}
unsurround : String -> String -> String
unsurround wrap string =
    if String.startsWith wrap string && String.endsWith wrap string then
        let
            length =
                String.length wrap
        in
            string
                |> String.dropLeft length
                |> String.dropRight length
    else
        string


{-| Adds quotes to a string.

    quote "foo" == "\"barfoobar\""

-}
quote : String -> String
quote string =
    surround "\"" string


{-| Removes quotes that surround a string.

    unquote "\"foo\"" == "foo"
    unquote "\"foo\"bar\""

-}
unquote : String -> String
unquote string =
    unsurround "\"" string


{-| Returns a string joined by underscores after separating it by its uppercase characters.
Any sequence of spaces or dashes will also be converted to a single underscore.
The final string will be lowercased

    underscore "SomeClassName" == "some_class_name"
    underscore "some-class-name" == "some_class_name"
    underscore "SomeClass name" == "some_class_name

-}
underscored : String -> String
underscored string =
    string
        |> String.trim
        |> Regex.replace All (regex "([a-z\\d])([A-Z]+)") (.submatches >> List.filterMap identity >> String.join "_")
        |> Regex.replace All (regex "[_-\\s]+") (always "_")
        |> String.toLower


{-| Returns a string joined by dashes after separating it by its uppercase characters.
Any sequence of spaces or underscored will also be converted to a single dash.
The final string will be lowercased

    dasherize "SomeClassName" == "-some-class-name"
    dasherize "some_class_name" = "some-class-name"
    dasherize "someClass name" = "some-class-name"

-}
dasherize : String -> String
dasherize string =
    string
        |> String.trim
        |> Regex.replace All (regex "([A-Z])") (.match >> String.append "-")
        |> Regex.replace All (regex "[_-\\s]+") (always "-")
        |> String.toLower


{-| Separates a string into parts of a given width, using a given seperator.

Look at `wrap` if you just want to wrap using newlines.

    wrapWith 7 "\n" "My very long text" === "My very\nlong text"
    wrapWith 100 "\n" "Too short" === "Too short"

-}
wrapWith : Int -> String -> String -> String
wrapWith width separator string =
    string
        |> break width
        |> String.join separator


{-| Chops a given string into parts of a given width, seperating them using a
new line.

    wrap 7 "My very long text" === "My very\nlong te\nxt"
    wrap 100 "Too short" === "Too short"

-}
wrap : Int -> String -> String
wrap width string =
    wrapWith width "\n" string


{-| Chops a given string into parts of a given width without breaking works apart,
and then seperating them using a new line.

    softWrap 7 "My very long text" === "My very\nlong text"
    softWrap 3 "Hello World" === "Hello \nWorld"
    softWrap 100 "Too short" === "Too short"

-}
softWrap : Int -> String -> String
softWrap width string =
    softWrapWith width "\n" string


{-| Chops a given string into parts of a given width without breaking works apart,
and then seperating them using the given separator.

    softWrapWith 7 "..." "My very long text" === "My very...long text"
    softWrapWith 3 "\n" "Hello World" === "Hello \nWorld"
    softWrapWith 100 "\t" "Too short" === "Too short"

-}
softWrapWith : Int -> String -> String -> String
softWrapWith width separator string =
    string
        |> softBreak width
        |> String.join separator


{-| Converts an underscored, camelized, or dasherized string into one that can be read by humans.
Also removes beginning and ending whitespace, and removes the postfix '_id'.
The first character will be capitalized

    humanize "this_is_great" == "This is great"
    humanize "ThisIsGreat" = "This is great"
    humanize "this-is-great" = "This is great"
    humanize "author_id" = "Author"

-}
humanize : String -> String
humanize string =
    string
        |> Regex.replace All (regex "[A-Z]") (.match >> String.append "-")
        |> Regex.replace All (regex "_id$|[-_\\s]+") (always " ")
        |> String.trim
        |> String.toLower
        |> toSentenceCase


{-| Removes the least sequence of leading spaces or tabs on each line
of the string, so that at least one of the lines will not have any
leading spaces nor tabs and the rest of the lines will have the same
amount of indentation removed.

    unindent "  Hello\n    World " == "Hello\n  World"
    unindent "\t\tHello\n\t\t\t\tWorld" == "Hello\n\t\tWorld"

-}
unindent : String -> String
unindent multilineSting =
    let
        lines =
            String.lines multilineSting

        countLeadingWhitespace count line =
            case String.uncons line of
                Nothing ->
                    count

                Just ( char, rest ) ->
                    case char of
                        ' ' ->
                            countLeadingWhitespace (count + 1) rest

                        '\t' ->
                            countLeadingWhitespace (count + 1) rest

                        _ ->
                            count

        isNotWhitespace char =
            char /= ' ' && char /= '\t'

        minLead =
            lines
                |> List.filter (String.any isNotWhitespace)
                |> List.map (countLeadingWhitespace 0)
                |> List.minimum
                |> Maybe.withDefault 0
    in
        lines
            |> List.map (String.dropLeft minLead)
            |> String.join "\n"


{-| Returns the number of occurrences of a substring in another string

    countOccurrences "Hello" "Hello World" == 1
    countOccurrences "o" "Hello World" == 2
-}
countOccurrences : String -> String -> Int
countOccurrences needle haystack =
    if (String.length needle) == 0 || (String.length haystack) == 0 then
        0
    else
        haystack
            |> String.indexes needle
            |> List.length


{-| Truncates the string at the specified lenght and adds the append
string only if the combined lenght of the truncated string and the append
string have exactly the desired lenght.

The resulting string will have at most the specified lenght

    ellipsisWith 5 " .." "Hello World" == "Hello .."
    ellipsisWith 10 " .."  "Hello World" == "Hello W..."
    ellipsisWith 10 " .." "Hello" == "Hello"
    ellipsisWith 8 " .." "Hello World" == "Hello World"

-}
ellipsisWith : Int -> String -> String -> String
ellipsisWith howLong append string =
    if String.length string <= howLong then
        string
    else
        (String.left (howLong - (String.length append)) string) ++ append


{-| Truncates the string at the specified length and appends
three dots only if the tructated string + the 3 dots have exactly
the desired lenght.

The resulting string will have at most the specified lenght

    ellipsis 5 "Hello World" == "Hello..."
    ellipsis 10 "Hello World" == "Hello W..."
    ellipsis 10 "Hello" == "Hello"
    ellipsis 8 "Hello World" == "Hello World"

-}
ellipsis : Int -> String -> String
ellipsis howLong string =
    ellipsisWith howLong "..." string


{-| Truncates the string at the specified length and appends
three dots only if the tructated string + the 3 dots have exactly
the desired lenght.

In constrast to `ellipsis`, this method will produced unfinished words,
instead, it will find the closest complete word and apply the ellipsis from
there.

Additionally, it will remove any trailing whitespace and punctuation characters
at the end of the truncated string.

The resulting stirng can in some cases exceed the specifed lenght, by at most
three characters.

    softEllipsis 5 "Hello, World" == "Hello..."
    softEllipsis 8 "Hello, World" == "Hello..."
    softEllipsis 15 "Hello, cruel world" == "Hello, cruel..."
    softEllipsis 10 "Hello" == "Hello"

-}
softEllipsis : Int -> String -> String
softEllipsis howLong string =
    if String.length string <= howLong then
        string
    else
        string
            |> Regex.find (AtMost 1) (softBreakRegexp howLong)
            |> List.map .match
            |> String.join ""
            |> Regex.replace All (regex "([\\.,;:\\s])+$") (always "")
            |> flip String.append "..."


{-| Converts a list of strings into a human formatted readable list

    toSentence [] == ""
    toSentence ["lions"] == "lions"
    toSentence ["lions", "tigers"] == "lions and tigers"
    toSentence ["lions", "tigers", "bears"] == "lions, tigers and bears"

-}
toSentence : List String -> String
toSentence list =
    case list of
        x :: y :: z :: more ->
            toSentenceHelper " and " (x ++ ", " ++ y) (z :: more)

        _ ->
            toSentenceBaseCase list


{-| Converts a list of strings into a human formatted readable list using an oxford comma

    toSentenceOxford [] == ""
    toSentenceOxford ["lions"] == "lions"
    toSentenceOxford ["lions", "tigers"] == "lions and tigers"
    toSentenceOxford ["lions", "tigers", "bears"] == "lions, tigers, and bears"

-}
toSentenceOxford : List String -> String
toSentenceOxford list =
    case list of
        x :: y :: z :: more ->
            toSentenceHelper ", and " (x ++ ", " ++ y) (z :: more)

        _ ->
            toSentenceBaseCase list


toSentenceBaseCase : List String -> String
toSentenceBaseCase list =
    case list of
        x :: [] ->
            x

        x :: y :: [] ->
            x ++ " and " ++ y

        _ ->
            ""


toSentenceHelper : String -> String -> List String -> String
toSentenceHelper lastPart sentence list =
    case list of
        [] ->
            sentence

        x :: [] ->
            sentence ++ lastPart ++ x

        x :: xs ->
            toSentenceHelper lastPart (sentence ++ ", " ++ x) xs


{-| Removes all HTML tags from the string, preserving the text inside them.

    stripTags "a <a href=\"#\">link</a>" == "a link"
    stripTags "<script>alert('hello world!')</script> == "alert('hello world!')"

-}
stripTags : String -> String
stripTags string =
    string
        |> Regex.replace All (regex "<\\/?[^>]+>") (always "")


{-| Searches a string from left to right for a pattern and returns a substring
consisting of the characters in the string that are to the right of the pattern.

    rightOf "_" "This_is_a_test_string" == "is_a_test_string"
-}
rightOf : String -> String -> String
rightOf pattern string =
    string
        |> Regex.find (AtMost 1) (regex <| (escape pattern) ++ "(.*)$")
        |> List.map (.submatches >> Maybe.oneOf >> Maybe.withDefault "")
        |> String.join ""


{-| Searches a string from left to right for a pattern and returns a substring
consisting of the characters in the string that are to the left of the pattern.

    leftOf "_" "This_is_a_test_string" == "This"
-}
leftOf : String -> String -> String
leftOf pattern string =
    string
        |> Regex.find (AtMost 1) (regex <| "^(.*?)" ++ (escape pattern))
        |> List.map (.submatches >> Maybe.oneOf >> Maybe.withDefault "")
        |> String.join ""


{-| Searches a string from right to left for a pattern and returns a substring
consisting of the characters in the string that are to the right of the pattern.

    rightOfBack "_" "This_is_a_test_string" == "string"
-}
rightOfBack : String -> String -> String
rightOfBack pattern string =
    string
        |> String.indexes pattern
        |> List.reverse
        |> List.head
        |> Maybe.map ((+) (String.length pattern) >> flip String.dropLeft string)
        |> Maybe.withDefault ""


{-| Searches a string from right to left for a pattern and returns a substring
consisting of the characters in the string that are to the right of the pattern.

    leftOfBack "_" "This_is_a_test_string" == "This_is_a_test"
-}
leftOfBack : String -> String -> String
leftOfBack pattern string =
    string
        |> String.indexes pattern
        |> List.reverse
        |> List.head
        |> Maybe.map (flip String.left string)
        |> Maybe.withDefault ""
