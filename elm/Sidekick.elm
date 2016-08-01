port module Sidekick exposing (..)

import Html exposing (..)
import Html.App as Html
import Html.Attributes exposing (href, title, style, src)
import String
import Markdown


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
        , activeFilePathChangedSub ActiveFilePathChanged
        , docsLoadedSub (\_ -> DocsLoaded)
        , docsFailedSub (\_ -> DocsFailed)
        , updatingPackageDocsSub (\_ -> UpdatingPackageDocs)
        ]



-- INCOMING PORTS


port activeHintsChangedSub : (List ActiveHint -> msg) -> Sub msg


port activeFilePathChangedSub : (Maybe String -> msg) -> Sub msg


port docsLoadedSub : (() -> msg) -> Sub msg


port docsFailedSub : (() -> msg) -> Sub msg


port updatingPackageDocsSub : (() -> msg) -> Sub msg



-- OUTGOING PORTS


port goToDefinitionCmd : String -> Cmd msg



-- MODEL


type alias Model =
    { note : String
    , activeHints : List ActiveHint
    , activeFilePath : Maybe String
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
    , activeFilePath = Nothing
    }



-- UPDATE


type Msg
    = ActiveHintsChanged (List ActiveHint)
    | ActiveFilePathChanged (Maybe String)
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

        ActiveFilePathChanged filePath ->
            ( { model | activeFilePath = filePath }
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
view { note, activeHints, activeFilePath } =
    let
        hintMarkdown hint =
            Markdown.toHtml [] (viewHint activeFilePath hint)

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
                        ([ hintMarkdown hint
                         ]
                            ++ sourceView hint
                        )
                )
                activeHints
    in
        div [] <| [ text note ] ++ hintsView


viewHint : Maybe String -> Hint -> String
viewHint activeFilePath hint =
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
            if activeFilePath == (Just hint.sourcePath) then
                ""
            else
                moduleName ++ "."

        -- formatName name =
        --     if Regex.contains (Regex.regex "\\w") name then
        --         name
        --     else
        --         "(" ++ name ++ ")"
        formatTipe tipe =
            if String.startsWith "*" tipe then
                tipe
            else if tipe == "" then
                ""
            else
                ": " ++ tipe

        formatComment comment =
            case comment of
                "" ->
                    ""

                _ ->
                    "\n<br>" ++ comment
    in
        "##### "
            ++ formatModule moduleName
            ++ "**"
            ++ name
            ++ "** "
            ++ formatTipe hint.tipe
            ++ formatComment hint.comment


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
