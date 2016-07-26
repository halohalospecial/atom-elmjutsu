-- Based on https://github.com/elm-lang/elm-lang.org/tree/master/src/editor


port module Sidekick exposing (..)

import Html exposing (..)
import Html.App as Html
import Html.Attributes exposing (href, title)
import Html.Events exposing (onClick)
import String
import Markdown
import Regex


main : Program Never
main =
    Html.program
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.batch
        [ activeHintsChangedSub ActiveHintsChanged
        ]



-- INCOMING PORTS


port activeHintsChangedSub : (List ActiveHint -> msg) -> Sub msg



-- OUTGOING PORTS


port goToDefinitionCmd : String -> Cmd msg



-- MODEL


type alias Model =
    { note : String
    , activeHints : List ActiveHint
    , activeModuleName : String
    }


type alias ActiveHint =
    { name : String
    , uri : String
    , comment : String
    , tipe : String
    }


init : ( Model, Cmd Msg )
init =
    ( emptyModel
    , Cmd.none
    )


emptyModel : Model
emptyModel =
    { note = "Loading..."
    , activeHints = []
    , activeModuleName = ""
    }



-- UPDATE


type Msg
    = ActiveHintsChanged (List ActiveHint)
    | GoToDefinition String


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        ActiveHintsChanged hints ->
            ( { model | activeHints = hints }
            , Cmd.none
            )

        GoToDefinition uri ->
            ( model
            , goToDefinitionCmd uri
            )



-- VIEW


view : Model -> Html Msg
view { note, activeHints, activeModuleName } =
    let
        hintMarkdown hint =
            Markdown.toHtml [] (viewHint activeModuleName hint)

        sourceView hint =
            if String.startsWith packageDocsPrefix hint.uri then
                a [ title hint.uri, href hint.uri ] [ text "View in browser" ]
            else
                a [ title hint.uri, onClick (GoToDefinition hint.uri) ] [ text "Go to Definition" ]

        hintsView =
            List.map
                (\hint ->
                    div []
                        [ hintMarkdown hint
                        , sourceView hint
                        ]
                )
                activeHints
    in
        div [] <| [ text note ] ++ hintsView


viewHint : String -> Hint -> String
viewHint activeModuleName hint =
    let
        ( moduleName, name ) =
            case String.split "." hint.name of
                [] ->
                    ( "", hint.name )

                list ->
                    let
                        reversed =
                            List.reverse list

                        name =
                            case List.head reversed of
                                Just last ->
                                    last

                                Nothing ->
                                    ""

                        moduleName =
                            reversed
                                |> List.drop 1
                                |> List.reverse
                                |> String.join "."
                    in
                        ( moduleName, name )

        formatModule moduleName =
            if activeModuleName == moduleName then
                moduleName ++ "."
            else
                moduleName ++ "."

        formatName name =
            if Regex.contains (Regex.regex "\\w") name then
                name
            else
                "(" ++ name ++ ")"

        formatTipe tipe =
            if String.startsWith "*" tipe then
                tipe
            else if tipe == "" then
                ""
            else
                ": " ++ tipe
    in
        "# "
            ++ formatModule moduleName
            ++ "**"
            ++ name
            ++ "**\n"
            ++ "## **"
            ++ formatName name
            ++ "** "
            ++ formatTipe hint.tipe
            ++ "<br><br>\n"
            ++ hint.comment
            ++ "<br><br>\n"


type alias Hint =
    { name : String
    , uri : String
    , comment : String
    , tipe : String
    }


packageDocsPrefix : String
packageDocsPrefix =
    "http://package.elm-lang.org/packages/"
