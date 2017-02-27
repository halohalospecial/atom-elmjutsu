port module Sidekick exposing (..)

import Helper
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
        [ activeTokenHintsChangedSub ActiveHintsChanged
        , activeFileChangedSub ActiveFileChanged
        , docsReadSub (\_ -> DocsRead)
        , docsDownloadedSub (\_ -> DocsDownloaded)
        , downloadDocsFailedSub DownloadDocsFailed
        , readingPackageDocsSub (\_ -> ReadingPackageDocs)
        , downloadingPackageDocsSub (\_ -> DownloadingPackageDocs)
        , configChangedSub ConfigChanged
        ]



-- INCOMING PORTS


port activeTokenHintsChangedSub : (List Hint -> msg) -> Sub msg


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
    , activeTokenHints : List Hint
    , activeFile : Maybe ActiveFile
    , config : Config
    }


type alias Config =
    { showTypes : Bool
    , showTypeCases : Bool
    , showDocComments : Bool
    , showAssociativities : Bool
    , showPrecedences : Bool
    , showSourcePaths : Bool
    , showAliasesOfType : Bool
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
    , activeTokenHints = []
    , activeFile = Nothing
    , config =
        { showTypes = False
        , showTypeCases = False
        , showDocComments = False
        , showAssociativities = False
        , showPrecedences = False
        , showSourcePaths = False
        , showAliasesOfType = False
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
            ( { model | activeTokenHints = hints }
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
view { note, activeTokenHints, activeFile, config } =
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
                        activeTokenHints
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

        formattedName =
            if hint.name == Helper.holeToken then
                hint.name
            else if Helper.isInfix hint.name then
                "(" ++ hint.name ++ ")"
            else
                hint.name

        formattedTipe =
            if hint.tipe == "" then
                if List.length hint.args > 0 then
                    "*" ++ String.join " " hint.args ++ "*"
                else
                    ""
            else if formattedName /= "" then
                ": " ++ hint.tipe
            else
                hint.tipe

        maybeAliasesOfType =
            if config.showAliasesOfType then
                List.map (\tipeAlias -> " *a.k.a.* " ++ tipeAlias) hint.aliasesOfTipe
                    |> String.join ""
            else
                ""

        maybeType =
            if config.showTypes then
                "#### "
                    ++ formattedModuleName
                    ++ (if String.length (String.trim formattedName) > 0 then
                            "**" ++ formattedName ++ "** "
                        else
                            ""
                       )
                    ++ formattedTipe
                    ++ maybeAliasesOfType
            else
                ""

        maybeTypeCases =
            if config.showTypeCases && List.length hint.cases > 0 then
                let
                    caseToString : TipeCase -> String
                    caseToString { name, args } =
                        if List.length args > 0 then
                            name ++ " " ++ String.join " " args
                        else
                            name

                    headCase =
                        List.head hint.cases |> Maybe.withDefault { name = "", args = [] }

                    tailCases =
                        List.tail hint.cases |> Maybe.withDefault []
                in
                    "\n<br>= "
                        ++ caseToString headCase
                        ++ "\n<br>"
                        ++ (List.map (\kase -> "| " ++ (caseToString kase)) tailCases
                                |> String.join "\n<br>"
                           )
                        ++ (if List.length tailCases > 0 then
                                "\n<br>"
                            else
                                ""
                           )
            else
                ""

        maybeComment =
            if config.showDocComments then
                case hint.comment of
                    "" ->
                        ""

                    _ ->
                        "\n<br>"
                            ++ hint.comment
            else
                ""

        maybeAssociativity =
            if config.showAssociativities then
                case hint.associativity of
                    Just associativity ->
                        "\n<br>Associativity: " ++ associativity

                    Nothing ->
                        ""
            else
                ""

        maybePrecedence =
            if config.showPrecedences then
                case hint.precedence of
                    Just precedence ->
                        "\n<br>Precedence: " ++ toString precedence

                    Nothing ->
                        ""
            else
                ""
    in
        maybeType
            ++ maybeTypeCases
            ++ maybeComment
            ++ maybeAssociativity
            ++ maybePrecedence


type alias Hint =
    { name : String
    , moduleName : String
    , sourcePath : String
    , comment : String
    , tipe : String
    , args : List String
    , caseTipe : Maybe String
    , cases : List TipeCase
    , associativity : Maybe String
    , precedence : Maybe Int
    , aliasesOfTipe : List String
    }


type alias TipeCase =
    { name : String
    , args : List String
    }


packageDocsPrefix : String
packageDocsPrefix =
    "http://package.elm-lang.org/packages"


removePrefix : String -> String -> String
removePrefix prefix text =
    text |> Regex.replace (Regex.AtMost 1) (Regex.regex ("^" ++ prefix ++ "[/\\\\]")) (\_ -> "")
