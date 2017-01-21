port module Sidekick exposing (..)

import Html exposing (..)
import Html.Attributes exposing (class, href, src, style, title)
import Html.Events exposing (onClick)
import Markdown
import Regex


main : Program Config Model Msg
main =
    Html.programWithFlags
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.batch
        [ activeHintsChangedSub ActiveHintsChanged
        , activeFileChangedSub ActiveFileChanged
        , docsReadSub (\_ -> DocsRead)
        , docsDownloadedSub (\_ -> DocsDownloaded)
        , downloadDocsFailedSub DownloadDocsFailed
        , readingPackageDocsSub (\_ -> ReadingPackageDocs)
        , downloadingPackageDocsSub (\_ -> DownloadingPackageDocs)
        , configChangedSub ConfigChanged
        ]



-- INCOMING PORTS


port activeHintsChangedSub : (List Hint -> msg) -> Sub msg


port activeFileChangedSub : (Maybe ActiveFile -> msg) -> Sub msg


port docsReadSub : (() -> msg) -> Sub msg


port docsDownloadedSub : (() -> msg) -> Sub msg


port downloadDocsFailedSub : (String -> msg) -> Sub msg


port readingPackageDocsSub : (() -> msg) -> Sub msg


port downloadingPackageDocsSub : (() -> msg) -> Sub msg


port configChangedSub : (Config -> msg) -> Sub msg



-- OUTGOING PORTS


port goToDefinitionCmd : String -> Cmd msg



-- MODEL


type alias Model =
    { note : String
    , activeHints : List Hint
    , activeFile : Maybe ActiveFile
    , config : Config
    }


type alias Config =
    { showTypes : Bool
    , showDocComments : Bool
    , showSourcePaths : Bool
    }


type alias ActiveFile =
    { filePath : String
    , projectDirectory : String
    }


init : Config -> ( Model, Cmd Msg )
init config =
    ( { emptyModel | config = config }
    , Cmd.none
    )


emptyModel : Model
emptyModel =
    { note = ""
    , activeHints = []
    , activeFile = Nothing
    , config =
        { showTypes = False
        , showDocComments = False
        , showSourcePaths = False
        }
    }



-- UPDATE


type Msg
    = ActiveHintsChanged (List Hint)
    | ActiveFileChanged (Maybe ActiveFile)
    | DocsRead
    | DocsDownloaded
    | DownloadDocsFailed String
    | ReadingPackageDocs
    | DownloadingPackageDocs
    | GoToDefinition String
    | ConfigChanged Config


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        ActiveHintsChanged hints ->
            ( { model | activeHints = hints }
            , Cmd.none
            )

        ActiveFileChanged activeFile ->
            ( { model | activeFile = activeFile }
            , Cmd.none
            )

        DocsRead ->
            ( { model | note = "" }
            , Cmd.none
            )

        DocsDownloaded ->
            ( { model | note = "" }
            , Cmd.none
            )

        DownloadDocsFailed message ->
            ( { model | note = "Failed to download package docs:\n" ++ message }
            , Cmd.none
            )

        ReadingPackageDocs ->
            ( { model | note = "Reading package docs..." }
            , Cmd.none
            )

        DownloadingPackageDocs ->
            ( { model | note = "Downloading package docs..." }
            , Cmd.none
            )

        GoToDefinition name ->
            ( model
            , goToDefinitionCmd name
            )

        ConfigChanged config ->
            ( { model | config = config }
            , Cmd.none
            )



-- VIEW


view : Model -> Html Msg
view { note, activeHints, activeFile, config } =
    case activeFile of
        Nothing ->
            text ""

        Just { filePath, projectDirectory } ->
            let
                hintMarkdown hint =
                    Markdown.toHtml [] (viewHint config filePath hint)

                sourcePathView hint =
                    if String.startsWith (packageDocsPrefix ++ "/") hint.sourcePath then
                        [ span [ class "icon-link-external" ] []
                        , a [ title hint.sourcePath, href hint.sourcePath ] [ text (removePrefix packageDocsPrefix hint.sourcePath) ]
                        ]
                    else
                        [ a
                            [ title hint.sourcePath
                            , onClick (GoToDefinition hint.name)
                            ]
                            [ text (removePrefix projectDirectory hint.sourcePath) ]
                        ]

                hintsView =
                    List.map
                        (\hint ->
                            div [ class "hint" ]
                                ([ hintMarkdown hint
                                 ]
                                    ++ (if config.showSourcePaths then
                                            [ div [ class "source-path" ] (sourcePathView hint) ]
                                        else
                                            []
                                       )
                                )
                        )
                        activeHints
            in
                div [] <| hintsView ++ [ span [ class "note" ] [ text note ] ]


viewHint : Config -> String -> Hint -> String
viewHint config activeFilePath hint =
    let
        formattedModuleName =
            if hint.moduleName == "" || activeFilePath == hint.sourcePath then
                ""
            else
                hint.moduleName ++ "."

        formattedTipe =
            if hint.tipe == "" then
                if List.length hint.args > 0 then
                    "*" ++ String.join " " hint.args ++ "*"
                else
                    ""
            else
                ": " ++ hint.tipe

        maybeType =
            if config.showTypes then
                "#### "
                    ++ formattedModuleName
                    ++ "**"
                    ++ hint.name
                    ++ "** "
                    ++ formattedTipe
            else
                ""

        maybeComment =
            if config.showDocComments then
                case hint.comment of
                    "" ->
                        ""

                    _ ->
                        "\n<br>" ++ hint.comment
            else
                ""
    in
        maybeType ++ maybeComment


type alias Hint =
    { name : String
    , moduleName : String
    , sourcePath : String
    , comment : String
    , tipe : String
    , args : List String
    , caseTipe : Maybe String
    }


packageDocsPrefix : String
packageDocsPrefix =
    "http://package.elm-lang.org/packages"


removePrefix : String -> String -> String
removePrefix prefix text =
    text |> Regex.replace (Regex.AtMost 1) (Regex.regex ("^" ++ prefix ++ "[/\\\\]")) (\_ -> "")
