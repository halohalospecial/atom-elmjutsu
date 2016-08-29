port module Sidekick exposing (..)

import Html exposing (..)
import Html.App as Html
import Html.Attributes exposing (href, title, style, src, class)
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
        , docsReadSub (\_ -> DocsRead)
        , docsDownloadedSub (\_ -> DocsDownloaded)
        , downloadDocsFailedSub (\_ -> DownloadDocsFailed)
        , readingPackageDocsSub (\_ -> ReadingPackageDocs)
        , downloadingPackageDocsSub (\_ -> DownloadingPackageDocs)
        ]



-- INCOMING PORTS


port activeHintsChangedSub : (List ActiveHint -> msg) -> Sub msg


port activeFilePathChangedSub : (Maybe String -> msg) -> Sub msg


port docsReadSub : (() -> msg) -> Sub msg


port docsDownloadedSub : (() -> msg) -> Sub msg


port downloadDocsFailedSub : (() -> msg) -> Sub msg


port readingPackageDocsSub : (() -> msg) -> Sub msg


port downloadingPackageDocsSub : (() -> msg) -> Sub msg



-- MODEL


type alias Model =
    { note : String
    , activeHints : List ActiveHint
    , activeFilePath : Maybe String
    }


type alias ActiveHint =
    { name : String
    , moduleName : String
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
    | DocsRead
    | DocsDownloaded
    | DownloadDocsFailed
    | ReadingPackageDocs
    | DownloadingPackageDocs


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
                []

        hintsView =
            List.map
                (\hint ->
                    div [ class "hint" ]
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
        formattedModuleName =
            if hint.moduleName == "" || activeFilePath == (Just hint.sourcePath) then
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
        "##### "
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
    "http://package.elm-lang.org/packages/"
