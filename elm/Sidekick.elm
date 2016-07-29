port module Sidekick exposing (..)

import Html exposing (..)
import Html.App as Html
import Html.Attributes exposing (href, title)
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
        , activeModuleNameChangedSub ActiveModuleNameChanged
        , docsLoadedSub (\_ -> DocsLoaded)
        , docsFailedSub (\_ -> DocsFailed)
        , updatingPackageDocsSub (\_ -> UpdatingPackageDocs)
        ]



-- INCOMING PORTS


port activeHintsChangedSub : (List ActiveHint -> msg) -> Sub msg


port activeModuleNameChangedSub : (String -> msg) -> Sub msg


port docsLoadedSub : (() -> msg) -> Sub msg


port docsFailedSub : (() -> msg) -> Sub msg


port updatingPackageDocsSub : (() -> msg) -> Sub msg



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
    , sourcePath : String
    , comment : String
    , tipe : String
    , caseTipe : Maybe String
    }


init : ( Model, Cmd Msg )
init =
    ( emptyModel
    , Cmd.none
    )


emptyModel : Model
emptyModel =
    { note = ""
    , activeHints = []
    , activeModuleName = ""
    }



-- UPDATE


type Msg
    = ActiveHintsChanged (List ActiveHint)
    | ActiveModuleNameChanged String
    | DocsLoaded
    | DocsFailed
    | UpdatingPackageDocs



-- | GoToDefinition String


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        ActiveHintsChanged hints ->
            ( { model | activeHints = hints }
            , Cmd.none
            )

        ActiveModuleNameChanged moduleName ->
            ( { model | activeModuleName = moduleName }
            , Cmd.none
            )

        DocsLoaded ->
            ( { model | note = "" }
            , Cmd.none
            )

        DocsFailed ->
            ( { model | note = "Failed to load -_-" }
            , Cmd.none
            )

        UpdatingPackageDocs ->
            ( { model | note = "Loading..." }
            , Cmd.none
            )



-- GoToDefinition name ->
--     ( model
--     , goToDefinitionCmd name
--     )
-- VIEW


view : Model -> Html Msg
view { note, activeHints, activeModuleName } =
    let
        hintMarkdown hint =
            Markdown.toHtml [] (viewHint activeModuleName hint)

        sourceView hint =
            if String.startsWith packageDocsPrefix hint.sourcePath then
                [ a [ title hint.sourcePath, href hint.sourcePath ] [ text "View in browser" ] ]
            else
                -- a [ title hint.sourcePath, onClick (GoToDefinition hint.name) ] [ text "Go to Definition" ]
                []

        hintsView =
            List.map
                (\hint ->
                    div []
                        ([ hintMarkdown hint ]
                            ++ sourceView hint
                        )
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
                ""
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
            ++ "<br>\n"


type alias Hint =
    { name : String
    , sourcePath : String
    , comment : String
    , tipe : String
    , caseTipe : Maybe String
    }


packageDocsPrefix : String
packageDocsPrefix =
    "http://package.elm-lang.org/packages/"
