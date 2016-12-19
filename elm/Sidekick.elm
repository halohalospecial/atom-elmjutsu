port module Sidekick exposing (..)

import Html exposing (..)
import Html.Attributes exposing (class, href, src, style, title)
import Html.Events exposing (onClick)
import Markdown
import Regex


main : Program Never Model Msg
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
        , activeFileChangedSub ActiveFileChanged
        , docsReadSub (\_ -> DocsRead)
        , docsDownloadedSub (\_ -> DocsDownloaded)
        , downloadDocsFailedSub (\_ -> DownloadDocsFailed)
        , readingPackageDocsSub (\_ -> ReadingPackageDocs)
        , downloadingPackageDocsSub (\_ -> DownloadingPackageDocs)
        ]



-- INCOMING PORTS


port activeHintsChangedSub : (List ActiveHint -> msg) -> Sub msg


port activeFileChangedSub : (Maybe ActiveFile -> msg) -> Sub msg


port docsReadSub : (() -> msg) -> Sub msg


port docsDownloadedSub : (() -> msg) -> Sub msg


port downloadDocsFailedSub : (() -> msg) -> Sub msg


port readingPackageDocsSub : (() -> msg) -> Sub msg


port downloadingPackageDocsSub : (() -> msg) -> Sub msg



-- OUTGOING PORTS


port goToDefinitionCmd : String -> Cmd msg



-- MODEL


type alias Model =
    { note : String
    , activeHints : List ActiveHint
    , activeFile : Maybe ActiveFile
    }


type alias ActiveHint =
    { name : String
    , moduleName : String
    , sourcePath : String
    , comment : String
    , tipe : String
    , caseTipe : Maybe String
    }


type alias ActiveFile =
    { filePath : String
    , projectDirectory : String
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
    , activeFile = Nothing
    }



-- UPDATE


type Msg
    = ActiveHintsChanged (List ActiveHint)
    | ActiveFileChanged (Maybe ActiveFile)
    | DocsRead
    | DocsDownloaded
    | DownloadDocsFailed
    | ReadingPackageDocs
    | DownloadingPackageDocs
    | GoToDefinition String


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

        DownloadDocsFailed ->
            ( { model | note = "Failed to download package docs." }
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



-- VIEW


view : Model -> Html Msg
view { note, activeHints, activeFile } =
    case activeFile of
        Nothing ->
            text ""

        Just { filePath, projectDirectory } ->
            let
                hintMarkdown hint =
                    Markdown.toHtml [] (viewHint filePath hint)

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
                                [ hintMarkdown hint
                                , div [ class "source-path" ] (sourcePathView hint)
                                ]
                        )
                        activeHints
            in
                div [] <| hintsView ++ [ text note ]


viewHint : String -> Hint -> String
viewHint activeFilePath hint =
    let
        formattedModuleName =
            if hint.moduleName == "" || activeFilePath == hint.sourcePath then
                ""
            else
                hint.moduleName ++ "."

        formattedTipe =
            if String.startsWith "*" hint.tipe then
                hint.tipe
            else if hint.tipe == "" then
                ""
            else
                ": " ++ hint.tipe

        formattedComment =
            case hint.comment of
                "" ->
                    ""

                _ ->
                    "\n<br>" ++ hint.comment
    in
        "#### "
            ++ formattedModuleName
            ++ "**"
            ++ hint.name
            ++ "** "
            ++ formattedTipe
            ++ formattedComment


type alias Hint =
    { name : String
    , moduleName : String
    , sourcePath : String
    , comment : String
    , tipe : String
    , caseTipe : Maybe String
    }


packageDocsPrefix : String
packageDocsPrefix =
    "http://package.elm-lang.org/packages"


removePrefix : String -> String -> String
removePrefix prefix text =
    text |> Regex.replace (Regex.AtMost 1) (Regex.regex ("^" ++ prefix ++ "[/\\\\]")) (\_ -> "")
