port module Indexer exposing (..)

import Dict
import Http
import Json.Decode as Json
import Regex
import Set
import Task


main : Program Never Model Msg
main =
    Platform.program
        { init = init
        , update = update
        , subscriptions = subscriptions
        }


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.batch
        [ activeTokenChangedSub UpdateActiveHints
        , activeFileChangedSub UpdateActiveFile
        , fileContentsChangedSub (\( filePath, projectDirectory, moduleDocs, rawImports ) -> UpdateFileContents filePath projectDirectory (FileContents moduleDocs (toImportDict rawImports)))
        , fileContentsRemovedSub RemoveFileContents
        , projectDependenciesChangedSub UpdateProjectDependencies
        , downloadMissingPackageDocsSub DownloadMissingPackageDocs
        , docsReadSub DocsRead
        , goToDefinitionSub GoToDefinition
        , showGoToSymbolViewSub ShowGoToSymbolView
        , getHintsForPartialSub GetHintsForPartial
        , getSuggestionsForImportSub GetSuggestionsForImport
        , askCanGoToDefinitionSub AskCanGoToDefinition
        , getImportersForTokenSub GetImporterSourcePathsForToken
        , showAddImportViewSub ShowAddImportView
        , addImportSub AddImport
        ]



-- INCOMING PORTS


port activeTokenChangedSub : (Maybe Token -> msg) -> Sub msg


port activeFileChangedSub : (Maybe ActiveFile -> msg) -> Sub msg


port fileContentsChangedSub : (( FilePath, ProjectDirectory, ModuleDocs, List RawImport ) -> msg) -> Sub msg


port fileContentsRemovedSub : (( FilePath, ProjectDirectory ) -> msg) -> Sub msg


port projectDependenciesChangedSub : (( String, List Dependency ) -> msg) -> Sub msg


port downloadMissingPackageDocsSub : (List Dependency -> msg) -> Sub msg


port docsReadSub : (List ( Dependency, String ) -> msg) -> Sub msg


port goToDefinitionSub : (Maybe String -> msg) -> Sub msg


port showGoToSymbolViewSub : (( Maybe String, Maybe String ) -> msg) -> Sub msg


port getHintsForPartialSub : (String -> msg) -> Sub msg


port getSuggestionsForImportSub : (String -> msg) -> Sub msg


port askCanGoToDefinitionSub : (Token -> msg) -> Sub msg


port getImportersForTokenSub : (( Maybe ProjectDirectory, Maybe Token, Maybe Bool ) -> msg) -> Sub msg


port showAddImportViewSub : (( FilePath, Maybe Token ) -> msg) -> Sub msg


port addImportSub : (( FilePath, ProjectDirectory, String, Maybe String ) -> msg) -> Sub msg



-- OUTGOING PORTS


port docsReadCmd : () -> Cmd msg


port docsDownloadedCmd : List ( Dependency, String ) -> Cmd msg


port downloadDocsFailedCmd : () -> Cmd msg


port goToDefinitionCmd : ( Maybe ActiveFile, EncodedSymbol ) -> Cmd msg


port showGoToSymbolViewCmd : ( Maybe String, Maybe ActiveFile, List EncodedSymbol ) -> Cmd msg


port activeFileChangedCmd : Maybe ActiveFile -> Cmd msg


port activeHintsChangedCmd : List EncodedHint -> Cmd msg


port readingPackageDocsCmd : () -> Cmd msg


port downloadingPackageDocsCmd : () -> Cmd msg


port readPackageDocsCmd : List Dependency -> Cmd msg


port hintsForPartialReceivedCmd : ( String, List EncodedHint ) -> Cmd msg


port suggestionsForImportReceivedCmd : ( String, List ImportSuggestion ) -> Cmd msg


port canGoToDefinitionRepliedCmd : ( Token, Bool ) -> Cmd msg


port importersForTokenReceivedCmd : ( ProjectDirectory, Token, Bool, Bool, List ( String, Bool, Bool, List String ) ) -> Cmd msg


port showAddImportViewCmd : ( Maybe Token, Maybe ActiveFile, List EncodedSymbol ) -> Cmd msg


port updateImportsCmd : ( FilePath, String ) -> Cmd msg



-- MODEL


type alias Model =
    { packageDocs : List ModuleDocs
    , projectFileContentsDict : ProjectFileContentsDict
    , activeTokens : TokenDict
    , activeHints : List Hint
    , activeFile : Maybe ActiveFile
    , projectDependencies : ProjectDependencies
    }


type alias ActiveFile =
    { filePath : FilePath
    , projectDirectory : ProjectDirectory
    }


type alias ProjectFileContentsDict =
    Dict.Dict ProjectDirectory FileContentsDict


type alias FileContentsDict =
    Dict.Dict FilePath FileContents


type alias FileContents =
    { moduleDocs : ModuleDocs
    , imports : ImportDict
    }


type alias Dependency =
    ( ProjectDirectory, Version )


type alias ProjectDependencies =
    Dict.Dict String (List Dependency)


type alias FilePath =
    String


type alias Token =
    String


type alias ProjectDirectory =
    String


type alias Version =
    String


init : ( Model, Cmd Msg )
init =
    ( emptyModel
    , Cmd.none
    )


emptyModel : Model
emptyModel =
    { packageDocs = []
    , projectFileContentsDict = Dict.empty
    , activeTokens = Dict.empty
    , activeHints = []
    , activeFile = Nothing
    , projectDependencies = Dict.empty
    }


emptyModuleDocs : ModuleDocs
emptyModuleDocs =
    { sourcePath = ""
    , name = ""
    , values =
        { aliases = []
        , tipes = []
        , values = []
        }
    , comment = ""
    }


emptyFileContents : FileContents
emptyFileContents =
    { moduleDocs = emptyModuleDocs
    , imports = defaultImports
    }



-- UPDATE


type Msg
    = MaybeDocsDownloaded (Result Http.Error (List ( Dependency, String, List ModuleDocs )))
    | DocsRead (List ( Dependency, String ))
    | UpdateActiveHints (Maybe Token)
    | UpdateActiveFile (Maybe ActiveFile)
    | UpdateFileContents FilePath ProjectDirectory FileContents
    | RemoveFileContents ( FilePath, ProjectDirectory )
    | UpdateProjectDependencies ( String, List Dependency )
    | GoToDefinition (Maybe Token)
    | ShowGoToSymbolView ( Maybe ProjectDirectory, Maybe String )
    | GetHintsForPartial String
    | GetSuggestionsForImport String
    | AskCanGoToDefinition Token
    | GetImporterSourcePathsForToken ( Maybe ProjectDirectory, Maybe Token, Maybe Bool )
    | DownloadMissingPackageDocs (List Dependency)
    | ShowAddImportView ( FilePath, Maybe Token )
    | AddImport ( FilePath, ProjectDirectory, String, Maybe String )


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        MaybeDocsDownloaded (Err _) ->
            ( model
            , downloadDocsFailedCmd ()
            )

        MaybeDocsDownloaded (Ok result) ->
            let
                loadedPackageDocs =
                    List.concatMap (\( _, _, moduleDocsList ) -> moduleDocsList) result

                loadedDependenciesAndJson =
                    List.map (\( dependency, jsonString, _ ) -> ( dependency, jsonString )) result
            in
                ( addLoadedPackageDocs loadedPackageDocs model
                , docsDownloadedCmd loadedDependenciesAndJson
                )

        DocsRead result ->
            let
                loadedPackageDocs =
                    List.concatMap (\( dependency, jsonString ) -> toModuleDocs (toPackageUri dependency) jsonString) result
            in
                ( addLoadedPackageDocs loadedPackageDocs model
                , docsReadCmd ()
                )

        UpdateActiveHints maybeToken ->
            doUpdateActiveHints maybeToken model

        UpdateActiveFile maybeActiveFile ->
            doUpdateActiveFile maybeActiveFile model

        UpdateFileContents filePath projectDirectory fileContents ->
            doUpdateFileContents filePath projectDirectory fileContents model

        RemoveFileContents ( filePath, projectDirectory ) ->
            doRemoveFileContents filePath projectDirectory model

        UpdateProjectDependencies ( projectDirectory, dependencies ) ->
            doUpdateProjectDependencies projectDirectory dependencies model

        DownloadMissingPackageDocs dependencies ->
            doDownloadMissingPackageDocs dependencies model

        GoToDefinition maybeToken ->
            doGoToDefinition maybeToken model

        ShowGoToSymbolView ( maybeProjectDirectory, maybeToken ) ->
            doShowGoToSymbolView maybeProjectDirectory maybeToken model

        GetHintsForPartial partial ->
            doGetHintsForPartial partial model

        GetSuggestionsForImport partial ->
            doGetSuggestionsForImport partial model

        AskCanGoToDefinition token ->
            doAskCanGoToDefinition token model

        GetImporterSourcePathsForToken ( maybeProjectDirectory, maybeToken, maybeIsCursorAtLastPartOfToken ) ->
            doGetImporterSourcePathsForToken maybeProjectDirectory maybeToken maybeIsCursorAtLastPartOfToken model

        ShowAddImportView ( filePath, maybeToken ) ->
            doShowAddImportView filePath maybeToken model

        AddImport ( filePath, projectDirectory, moduleName, maybeSymbolName ) ->
            doAddImport filePath projectDirectory moduleName maybeSymbolName model


doUpdateActiveHints : Maybe Token -> Model -> ( Model, Cmd Msg )
doUpdateActiveHints maybeToken model =
    let
        updatedActiveHints =
            getHintsForToken maybeToken model.activeTokens
    in
        ( { model | activeHints = updatedActiveHints }
        , List.map encodeHint updatedActiveHints
            |> activeHintsChangedCmd
        )


doUpdateActiveFile : Maybe ActiveFile -> Model -> ( Model, Cmd Msg )
doUpdateActiveFile maybeActiveFile model =
    ( { model
        | activeFile = maybeActiveFile
        , activeTokens = toTokenDict maybeActiveFile model.projectFileContentsDict (getProjectPackageDocs maybeActiveFile model.projectDependencies model.packageDocs)
      }
    , activeFileChangedCmd maybeActiveFile
    )


doUpdateFileContents : FilePath -> ProjectDirectory -> FileContents -> Model -> ( Model, Cmd Msg )
doUpdateFileContents filePath projectDirectory fileContents model =
    let
        updatedProjectFileContentsDict =
            updateFileContents filePath projectDirectory fileContents model.projectFileContentsDict
    in
        ( { model
            | projectFileContentsDict = updatedProjectFileContentsDict
            , activeTokens = toTokenDict model.activeFile updatedProjectFileContentsDict (getProjectPackageDocs model.activeFile model.projectDependencies model.packageDocs)
          }
        , activeFileChangedCmd model.activeFile
        )


updateFileContents : FilePath -> ProjectDirectory -> FileContents -> ProjectFileContentsDict -> ProjectFileContentsDict
updateFileContents filePath projectDirectory fileContents projectFileContentsDict =
    let
        fileContentsDict =
            getFileContentsOfProject projectDirectory projectFileContentsDict

        updatedFileContentsDict =
            Dict.update filePath (always <| Just fileContents) fileContentsDict
    in
        Dict.update projectDirectory (always <| Just updatedFileContentsDict) projectFileContentsDict


doRemoveFileContents : FilePath -> ProjectDirectory -> Model -> ( Model, Cmd Msg )
doRemoveFileContents filePath projectDirectory model =
    let
        updatedProjectFileContentsDict =
            let
                fileContentsDict =
                    getFileContentsOfProject projectDirectory model.projectFileContentsDict

                updatedFileContentsDict =
                    Dict.remove filePath fileContentsDict
            in
                Dict.update projectDirectory (always <| Just updatedFileContentsDict) model.projectFileContentsDict
    in
        ( { model
            | projectFileContentsDict = updatedProjectFileContentsDict
            , activeTokens = toTokenDict model.activeFile updatedProjectFileContentsDict (getProjectPackageDocs model.activeFile model.projectDependencies model.packageDocs)
          }
        , activeFileChangedCmd model.activeFile
        )


doUpdateProjectDependencies : ProjectDirectory -> List Dependency -> Model -> ( Model, Cmd Msg )
doUpdateProjectDependencies projectDirectory dependencies model =
    let
        existingPackages =
            List.map .sourcePath model.packageDocs

        missingDependencies =
            List.filter (\dependency -> not <| List.member (toPackageUri dependency) existingPackages) dependencies
    in
        ( { model | projectDependencies = Dict.update projectDirectory (always <| Just dependencies) model.projectDependencies }
        , Cmd.batch
            [ readingPackageDocsCmd ()
            , readPackageDocsCmd missingDependencies
            ]
        )


doDownloadMissingPackageDocs : List Dependency -> Model -> ( Model, Cmd Msg )
doDownloadMissingPackageDocs dependencies model =
    ( model
    , Cmd.batch
        [ downloadingPackageDocsCmd ()
        , Task.attempt MaybeDocsDownloaded (downloadPackageDocsList dependencies)
        ]
    )


doGoToDefinition : Maybe Token -> Model -> ( Model, Cmd Msg )
doGoToDefinition maybeToken model =
    let
        requests =
            getHintsForToken maybeToken model.activeTokens
                |> List.map
                    (\hint ->
                        let
                            symbol =
                                { fullName = getHintFullName hint
                                , sourcePath = hint.sourcePath
                                , caseTipe = hint.caseTipe
                                , kind = hint.kind
                                }
                        in
                            symbol
                                |> encodeSymbol
                                |> (,) model.activeFile
                                |> goToDefinitionCmd
                    )
    in
        ( model
        , Cmd.batch requests
        )


doShowGoToSymbolView : Maybe ProjectDirectory -> Maybe String -> Model -> ( Model, Cmd Msg )
doShowGoToSymbolView maybeProjectDirectory maybeToken model =
    case maybeProjectDirectory of
        Nothing ->
            ( model
            , Cmd.none
            )

        Just projectDirectory ->
            let
                hints =
                    getHintsForToken maybeToken model.activeTokens

                defaultSymbolName =
                    case List.head hints of
                        Nothing ->
                            maybeToken

                        Just hint ->
                            case model.activeFile of
                                Nothing ->
                                    Just hint.name

                                Just activeFile ->
                                    if activeFile.filePath == hint.sourcePath then
                                        Just (getLastName hint.name)
                                    else
                                        Just hint.name
            in
                ( model
                , ( defaultSymbolName, model.activeFile, List.map encodeSymbol (getProjectFileSymbols projectDirectory model.projectFileContentsDict) )
                    |> showGoToSymbolViewCmd
                )


doGetHintsForPartial : String -> Model -> ( Model, Cmd Msg )
doGetHintsForPartial partial model =
    ( model
    , ( partial
      , getHintsForPartial partial model.activeFile model.projectFileContentsDict (getProjectPackageDocs model.activeFile model.projectDependencies model.packageDocs) model.activeTokens
            |> List.map encodeHint
      )
        |> hintsForPartialReceivedCmd
    )


doGetSuggestionsForImport : String -> Model -> ( Model, Cmd Msg )
doGetSuggestionsForImport partial model =
    ( model
    , ( partial
      , getSuggestionsForImport partial model.activeFile model.projectFileContentsDict (getProjectPackageDocs model.activeFile model.projectDependencies model.packageDocs)
      )
        |> suggestionsForImportReceivedCmd
    )


doAskCanGoToDefinition : Token -> Model -> ( Model, Cmd Msg )
doAskCanGoToDefinition token model =
    ( model
    , ( token
      , Dict.member token model.activeTokens
      )
        |> canGoToDefinitionRepliedCmd
    )


doGetImporterSourcePathsForToken : Maybe ProjectDirectory -> Maybe Token -> Maybe Bool -> Model -> ( Model, Cmd Msg )
doGetImporterSourcePathsForToken maybeProjectDirectory maybeToken maybeIsCursorAtLastPartOfToken model =
    case ( maybeProjectDirectory, maybeToken, maybeIsCursorAtLastPartOfToken ) of
        ( Just projectDirectory, Just rawToken, Just isCursorAtLastPartOfToken ) ->
            let
                fileContentsDict =
                    getFileContentsOfProject projectDirectory model.projectFileContentsDict

                activeFileContents =
                    getActiveFileContents model.activeFile fileContentsDict

                ( token, willUseFullToken ) =
                    if rawToken == activeFileContents.moduleDocs.name then
                        ( rawToken, True )
                    else if Dict.get rawToken activeFileContents.imports /= Nothing then
                        ( rawToken, True )
                    else if isCursorAtLastPartOfToken then
                        ( rawToken, False )
                    else
                        ( getModuleName rawToken, False )
            in
                ( model
                , ( projectDirectory
                  , rawToken
                  , willUseFullToken
                  , isCursorAtLastPartOfToken
                  , getImportersForToken token isCursorAtLastPartOfToken model.activeFile model.activeTokens activeFileContents model.projectFileContentsDict
                  )
                    |> importersForTokenReceivedCmd
                )

        _ ->
            ( model
            , Cmd.none
            )


addLoadedPackageDocs : List ModuleDocs -> Model -> Model
addLoadedPackageDocs loadedPackageDocs model =
    let
        existingPackages =
            List.map .sourcePath model.packageDocs

        missingPackageDocs =
            List.filter
                (\{ sourcePath } -> not (List.member sourcePath existingPackages))
                loadedPackageDocs

        updatedPackageDocs =
            List.map truncateModuleComment missingPackageDocs ++ model.packageDocs
    in
        { model
            | packageDocs = updatedPackageDocs
            , activeTokens = toTokenDict model.activeFile model.projectFileContentsDict (getProjectPackageDocs model.activeFile model.projectDependencies updatedPackageDocs)
        }


truncateModuleComment : ModuleDocs -> ModuleDocs
truncateModuleComment moduleDocs =
    let
        truncatedComment =
            case List.head (String.split "\n\n" moduleDocs.comment) of
                Nothing ->
                    ""

                Just comment ->
                    comment
    in
        { moduleDocs | comment = truncatedComment }


getProjectPackageDocs : Maybe ActiveFile -> Dict.Dict String (List Dependency) -> List ModuleDocs -> List ModuleDocs
getProjectPackageDocs maybeActiveFile projectDependencies packageDocs =
    case maybeActiveFile of
        Nothing ->
            []

        Just activeFile ->
            case Dict.get activeFile.projectDirectory projectDependencies of
                Nothing ->
                    []

                Just dependencies ->
                    let
                        packageUris =
                            List.map toPackageUri dependencies
                    in
                        List.filter
                            (\moduleDocs ->
                                List.member moduleDocs.sourcePath packageUris
                            )
                            packageDocs


getProjectSymbols : Maybe ActiveFile -> ProjectFileContentsDict -> ProjectDependencies -> List ModuleDocs -> List Symbol
getProjectSymbols maybeActiveFile projectFileContentsDict projectDependencies packageDocs =
    case maybeActiveFile of
        Nothing ->
            []

        Just { projectDirectory } ->
            List.append
                (getProjectFileSymbols projectDirectory projectFileContentsDict)
                (getProjectDependencySymbols maybeActiveFile projectDependencies packageDocs)


getProjectFileSymbols : ProjectDirectory -> ProjectFileContentsDict -> List Symbol
getProjectFileSymbols projectDirectory projectFileContentsDict =
    let
        fileContentsDict =
            getFileContentsOfProject projectDirectory projectFileContentsDict

        allFileSymbols =
            Dict.values fileContentsDict
                |> List.concatMap (\{ moduleDocs } -> getModuleSymbols moduleDocs)
    in
        allFileSymbols
            |> List.filter
                (\{ sourcePath } ->
                    not (String.startsWith packageDocsPrefix sourcePath)
                )


getProjectDependencySymbols : Maybe ActiveFile -> ProjectDependencies -> List ModuleDocs -> List Symbol
getProjectDependencySymbols maybeActiveFile projectDependencies packageDocs =
    getProjectPackageDocs maybeActiveFile projectDependencies packageDocs
        |> List.concatMap getModuleSymbols


getModuleSymbols : ModuleDocs -> List Symbol
getModuleSymbols moduleDocs =
    let
        { sourcePath, values } =
            moduleDocs

        moduleDocsSymbol =
            { fullName = moduleDocs.name
            , sourcePath = sourcePath
            , caseTipe = Nothing
            , kind = KindModule
            }

        valueSymbols =
            List.map
                (\value ->
                    let
                        kind =
                            if Regex.contains capitalizedRegex value.name then
                                KindTypeAlias
                            else
                                KindDefault
                    in
                        { fullName = (moduleDocs.name ++ "." ++ value.name)
                        , sourcePath = (formatSourcePath moduleDocs value.name)
                        , caseTipe = Nothing
                        , kind = kind
                        }
                )
                values.values

        tipeSymbols =
            List.map
                (\tipe ->
                    { fullName = (moduleDocs.name ++ "." ++ tipe.name)
                    , sourcePath = (formatSourcePath moduleDocs tipe.name)
                    , caseTipe = Nothing
                    , kind = KindType
                    }
                )
                values.tipes

        tipeCaseSymbols =
            List.concatMap
                (\tipe ->
                    List.map
                        (\caseName ->
                            { fullName = (moduleDocs.name ++ "." ++ caseName)
                            , sourcePath = (formatSourcePath moduleDocs caseName)
                            , caseTipe = (Just tipe.name)
                            , kind = KindTypeCase
                            }
                        )
                        tipe.cases
                )
                values.tipes
    in
        valueSymbols ++ tipeSymbols ++ tipeCaseSymbols ++ [ moduleDocsSymbol ]


getHintsForToken : Maybe String -> TokenDict -> List Hint
getHintsForToken maybeToken tokens =
    case maybeToken of
        Nothing ->
            []

        Just token ->
            Maybe.withDefault [] (Dict.get token tokens)


getHintsForPartial : String -> Maybe ActiveFile -> ProjectFileContentsDict -> List ModuleDocs -> TokenDict -> List Hint
getHintsForPartial partial maybeActiveFile projectFileContentsDict projectPackageDocs tokens =
    case maybeActiveFile of
        Nothing ->
            []

        Just { projectDirectory } ->
            let
                exposedSet =
                    getExposedHints maybeActiveFile projectFileContentsDict projectPackageDocs

                fileContentsDict =
                    getFileContentsOfProject projectDirectory projectFileContentsDict

                exposedNames =
                    Set.map Tuple.second exposedSet

                activeFileContents =
                    getActiveFileContents maybeActiveFile fileContentsDict

                importAliases =
                    Dict.values activeFileContents.imports
                        |> List.filterMap
                            (\{ alias } ->
                                case alias of
                                    Nothing ->
                                        Nothing

                                    Just alias ->
                                        if String.startsWith partial alias then
                                            Just { emptyHint | name = alias }
                                        else
                                            Nothing
                            )

                maybeIncludeHint hint =
                    let
                        isIncluded =
                            if hint.moduleName == "" || Set.member ( hint.moduleName, hint.name ) exposedSet then
                                String.startsWith partial hint.name
                            else
                                True
                    in
                        if not isIncluded then
                            Nothing
                        else
                            let
                                moduleNameToShow =
                                    if hint.moduleName == "" || activeFileContents.moduleDocs.name == hint.moduleName then
                                        ""
                                    else
                                        hint.moduleName

                                nameToShow =
                                    if hint.moduleName == "" then
                                        hint.name
                                    else if Set.member ( hint.moduleName, hint.name ) exposedSet then
                                        hint.name
                                    else
                                        let
                                            moduleNamePrefix =
                                                case Dict.get hint.moduleName activeFileContents.imports of
                                                    Nothing ->
                                                        ""

                                                    Just { alias } ->
                                                        case alias of
                                                            Nothing ->
                                                                hint.moduleName ++ "."

                                                            Just moduleAlias ->
                                                                moduleAlias ++ "."
                                        in
                                            moduleNamePrefix ++ hint.name
                            in
                                Just { hint | name = nameToShow, moduleName = moduleNameToShow }

                hints =
                    tokens
                        |> Dict.map
                            (\token hints ->
                                let
                                    isIncluded =
                                        if Set.member (getLastName token) exposedNames then
                                            String.startsWith partial (getLastName token)
                                                || String.startsWith partial token
                                        else
                                            String.startsWith partial token
                                in
                                    if isIncluded then
                                        List.filterMap maybeIncludeHint hints
                                    else
                                        []
                            )
                        |> Dict.values
                        |> List.concatMap identity

                defaultHints =
                    List.filter
                        (\{ name } ->
                            String.startsWith partial name
                        )
                        defaultSuggestions
            in
                importAliases
                    ++ hints
                    ++ defaultHints
                    |> List.sortBy .name


getSuggestionsForImport : String -> Maybe ActiveFile -> ProjectFileContentsDict -> List ModuleDocs -> List ImportSuggestion
getSuggestionsForImport partial maybeActiveFile projectFileContentsDict projectPackageDocs =
    case maybeActiveFile of
        Nothing ->
            []

        Just { projectDirectory } ->
            let
                suggestions =
                    (getProjectModuleDocs projectDirectory projectFileContentsDict ++ projectPackageDocs)
                        |> List.map
                            (\{ name, comment, sourcePath } ->
                                { name = name
                                , comment = comment
                                , sourcePath =
                                    if String.startsWith packageDocsPrefix sourcePath then
                                        sourcePath ++ dotToHyphen name
                                    else
                                        ""
                                }
                            )
            in
                List.filter
                    (\{ name } ->
                        String.startsWith partial name
                    )
                    suggestions
                    |> List.sortBy .name


getImportersForToken : String -> Bool -> Maybe ActiveFile -> TokenDict -> FileContents -> ProjectFileContentsDict -> List ( String, Bool, Bool, List String )
getImportersForToken token isCursorAtLastPartOfToken maybeActiveFile tokens activeFileContents projectFileContentsDict =
    case maybeActiveFile of
        Just { projectDirectory, filePath } ->
            let
                isImportAlias =
                    List.member token (List.filterMap .alias (Dict.values activeFileContents.imports))
            in
                if isImportAlias then
                    [ ( activeFileContents.moduleDocs.sourcePath, True, True, [ token ] ) ]
                else
                    let
                        hints =
                            getHintsForToken (Just token) tokens

                        fileContentsDict =
                            getFileContentsOfProject projectDirectory projectFileContentsDict
                    in
                        Dict.values fileContentsDict
                            |> List.concatMap
                                (\{ moduleDocs, imports } ->
                                    let
                                        getSourcePathAndLocalNames hint =
                                            let
                                                isHintAModule hint =
                                                    hint.moduleName == "" && Regex.contains capitalizedRegex hint.name

                                                isHintThisModule =
                                                    isHintAModule hint && hint.name == moduleDocs.name

                                                isHintAnImport =
                                                    isHintAModule hint && Dict.get token imports /= Nothing
                                            in
                                                if isHintThisModule then
                                                    Just ( moduleDocs.sourcePath, True, False, [ token ] )
                                                else if isHintAnImport then
                                                    Just ( moduleDocs.sourcePath, True, False, [ hint.name ] )
                                                else
                                                    case Dict.get hint.moduleName imports of
                                                        Nothing ->
                                                            let
                                                                isHintInThisModule =
                                                                    hint.moduleName == moduleDocs.name
                                                            in
                                                                if isHintInThisModule then
                                                                    Just ( moduleDocs.sourcePath, False, False, [ hint.name ] )
                                                                else
                                                                    Nothing

                                                        Just { alias, exposed } ->
                                                            let
                                                                localNames =
                                                                    case ( alias, exposed ) of
                                                                        ( Nothing, None ) ->
                                                                            [ hint.moduleName ++ "." ++ hint.name ]

                                                                        ( Just alias, None ) ->
                                                                            [ alias ++ "." ++ hint.name ]

                                                                        ( _, All ) ->
                                                                            [ hint.name, getLocalName hint.moduleName alias hint.name ]

                                                                        ( _, Some exposedSet ) ->
                                                                            if Set.member hint.name exposedSet then
                                                                                [ hint.name, getLocalName hint.moduleName alias hint.name ]
                                                                            else
                                                                                [ getLocalName hint.moduleName alias hint.name ]

                                                                names =
                                                                    localNames |> Set.fromList |> Set.toList
                                                            in
                                                                case names of
                                                                    [] ->
                                                                        Nothing

                                                                    _ ->
                                                                        Just ( moduleDocs.sourcePath, False, False, names )
                                    in
                                        List.filterMap getSourcePathAndLocalNames hints
                                )

        _ ->
            []


doShowAddImportView : FilePath -> Maybe Token -> Model -> ( Model, Cmd Msg )
doShowAddImportView filePath maybeToken model =
    let
        symbols =
            getProjectSymbols model.activeFile model.projectFileContentsDict model.projectDependencies model.packageDocs
                |> List.sortBy .fullName
                |> -- Do not include symbols in active file.
                   List.filter (\{ sourcePath } -> sourcePath /= filePath)
    in
        ( model
        , ( maybeToken, model.activeFile, List.map encodeSymbol symbols )
            |> showAddImportViewCmd
        )


doAddImport : FilePath -> ProjectDirectory -> String -> Maybe String -> Model -> ( Model, Cmd Msg )
doAddImport filePath projectDirectory moduleName maybeSymbolName model =
    let
        fileContents =
            getFileContentsOfProject projectDirectory model.projectFileContentsDict
                |> getActiveFileContents (Just { filePath = filePath, projectDirectory = projectDirectory })

        imports =
            let
                defaultImportsList =
                    Dict.toList defaultImports
            in
                fileContents.imports
                    |> Dict.filter
                        (\moduleName moduleImport ->
                            not (List.member ( moduleName, moduleImport ) defaultImportsList)
                        )

        updatedImports =
            case Dict.get moduleName imports of
                Nothing ->
                    let
                        importToAdd =
                            case maybeSymbolName of
                                Nothing ->
                                    { alias = Nothing, exposed = None }

                                Just symbolName ->
                                    { alias = Nothing, exposed = Some (Set.singleton symbolName) }
                    in
                        Dict.insert moduleName importToAdd imports

                Just moduleImport ->
                    case maybeSymbolName of
                        Nothing ->
                            imports

                        Just symbolName ->
                            case moduleImport.exposed of
                                All ->
                                    imports

                                Some exposed ->
                                    Dict.update moduleName (always <| Just { moduleImport | exposed = Some (Set.insert symbolName exposed) }) imports

                                None ->
                                    Dict.update moduleName (always <| Just { moduleImport | exposed = Some (Set.singleton symbolName) }) imports

        updatedFileContents =
            { fileContents | imports = updatedImports }
    in
        ( { model | projectFileContentsDict = updateFileContents filePath projectDirectory updatedFileContents model.projectFileContentsDict }
        , ( filePath, importsToString updatedImports model.activeTokens )
            |> updateImportsCmd
        )


importsToString : ImportDict -> TokenDict -> String
importsToString imports tokenDict =
    Dict.toList imports
        |> List.map
            (\( moduleName, { alias, exposed } ) ->
                let
                    importPart =
                        case alias of
                            Nothing ->
                                "import " ++ moduleName

                            Just alias ->
                                "import " ++ moduleName ++ " as " ++ alias

                    formatExposedSymbol token =
                        let
                            formatSymbol token =
                                if Regex.contains alphanumericRegex token then
                                    token
                                else
                                    "(" ++ token ++ ")"

                            hints =
                                getHintsForToken (Just token) tokenDict
                        in
                            case List.head hints of
                                Nothing ->
                                    formatSymbol token

                                Just { caseTipe } ->
                                    case caseTipe of
                                        Nothing ->
                                            formatSymbol token

                                        Just caseTipeString ->
                                            caseTipeString ++ "(" ++ formatSymbol token ++ ")"

                    exposingPart =
                        case exposed of
                            None ->
                                ""

                            All ->
                                " exposing (..)"

                            Some exposedSymbol ->
                                " exposing (" ++ (Set.toList exposedSymbol |> List.map formatExposedSymbol |> String.join ", ") ++ ")"
                in
                    importPart ++ exposingPart
            )
        |> String.join "\n"


getHintFullName : Hint -> String
getHintFullName hint =
    case hint.moduleName of
        "" ->
            hint.name

        _ ->
            hint.moduleName ++ "." ++ hint.name


getProjectModuleDocs : ProjectDirectory -> ProjectFileContentsDict -> List ModuleDocs
getProjectModuleDocs projectDirectory projectFileContentsDict =
    Dict.values (getFileContentsOfProject projectDirectory projectFileContentsDict)
        |> List.map .moduleDocs


getFileContentsOfProject : ProjectDirectory -> ProjectFileContentsDict -> FileContentsDict
getFileContentsOfProject projectDirectory projectFileContentsDict =
    Dict.get projectDirectory projectFileContentsDict
        |> Maybe.withDefault Dict.empty


getExposedHints : Maybe ActiveFile -> ProjectFileContentsDict -> List ModuleDocs -> Set.Set ( String, String )
getExposedHints activeFile projectFileContentsDict projectPackageDocs =
    case activeFile of
        Nothing ->
            Set.empty

        Just { projectDirectory } ->
            let
                fileContentsDict =
                    getFileContentsOfProject projectDirectory projectFileContentsDict

                importsPlusActiveModule =
                    getImportsPlusActiveModuleForActiveFile activeFile fileContentsDict

                importedModuleNames =
                    Dict.keys importsPlusActiveModule

                importedModuleDocs =
                    (projectPackageDocs ++ getProjectModuleDocs projectDirectory projectFileContentsDict)
                        |> List.filter
                            (\moduleDocs ->
                                List.member moduleDocs.name importedModuleNames
                            )

                imports =
                    Dict.values importsPlusActiveModule
            in
                importedModuleDocs
                    |> List.concatMap
                        (\moduleDocs ->
                            let
                                exposed =
                                    case Dict.get moduleDocs.name importsPlusActiveModule of
                                        Nothing ->
                                            None

                                        Just { exposed } ->
                                            exposed
                            in
                                (((moduleDocs.values.aliases
                                    ++ (List.map tipeToValue moduleDocs.values.tipes)
                                    ++ moduleDocs.values.values
                                  )
                                    |> List.filter
                                        (\{ name } ->
                                            isExposed name exposed
                                        )
                                    |> List.map .name
                                 )
                                    ++ (List.concatMap
                                            (\{ name, cases } ->
                                                List.filter
                                                    (\kase ->
                                                        Set.member name defaultTypes || isExposed kase exposed
                                                    )
                                                    cases
                                            )
                                            moduleDocs.values.tipes
                                       )
                                )
                                    |> List.map
                                        (\name ->
                                            ( moduleDocs.name, name )
                                        )
                        )
                    |> Set.fromList


getImportsPlusActiveModuleForActiveFile : Maybe ActiveFile -> FileContentsDict -> ImportDict
getImportsPlusActiveModuleForActiveFile maybeActiveFile fileContentsDict =
    getImportsPlusActiveModule (getActiveFileContents maybeActiveFile fileContentsDict)


getImportsPlusActiveModule : FileContents -> ImportDict
getImportsPlusActiveModule fileContents =
    Dict.update fileContents.moduleDocs.name (always <| Just { alias = Nothing, exposed = All }) fileContents.imports


getActiveFileContents : Maybe ActiveFile -> FileContentsDict -> FileContents
getActiveFileContents maybeActiveFile fileContentsDict =
    case maybeActiveFile of
        Nothing ->
            emptyFileContents

        Just { filePath } ->
            case Dict.get filePath fileContentsDict of
                Just fileContents ->
                    fileContents

                Nothing ->
                    emptyFileContents


type alias ModuleDocs =
    { sourcePath : String
    , name : String
    , values : Values
    , comment : String
    }


type alias Values =
    { aliases : List Value
    , tipes : List Tipe
    , values : List Value
    }


type alias Tipe =
    { name : String
    , comment : String
    , tipe : String
    , cases : List String
    }


type alias Value =
    { name : String
    , comment : String
    , tipe : String
    }


formatSourcePath : ModuleDocs -> String -> String
formatSourcePath { sourcePath, name } valueName =
    let
        anchor =
            if valueName == "" then
                ""
            else
                "#" ++ valueName
    in
        if String.startsWith packageDocsPrefix sourcePath then
            sourcePath ++ dotToHyphen name ++ anchor
        else
            sourcePath


dotToHyphen : String -> String
dotToHyphen string =
    String.map
        (\ch ->
            if ch == '.' then
                '-'
            else
                ch
        )
        string


toPackageUri : ( String, String ) -> String
toPackageUri ( packageName, version ) =
    packageDocsPrefix
        ++ packageName
        ++ "/"
        ++ version
        ++ "/"


packageDocsPrefix : String
packageDocsPrefix =
    "http://package.elm-lang.org/packages/"


downloadPackageDocsList : List Dependency -> Task.Task Http.Error (List ( Dependency, String, List ModuleDocs ))
downloadPackageDocsList dependencies =
    dependencies
        |> List.map downloadPackageDocs
        |> Task.sequence


downloadPackageDocs : Dependency -> Task.Task Http.Error ( Dependency, String, List ModuleDocs )
downloadPackageDocs dependency =
    let
        packageUri =
            toPackageUri dependency

        url =
            packageUri ++ "documentation.json"
    in
        Http.getString url
            |> Http.toTask
            |> Task.map
                (\jsonString ->
                    ( dependency
                    , jsonString
                    , Json.decodeString (Json.list (moduleDocsDecoder packageUri)) jsonString
                        |> Result.toMaybe
                        |> Maybe.withDefault []
                    )
                )


toModuleDocs : String -> String -> List ModuleDocs
toModuleDocs packageUri jsonString =
    Json.decodeString (Json.list (moduleDocsDecoder packageUri)) jsonString
        |> Result.toMaybe
        |> Maybe.withDefault []


moduleDocsDecoder : String -> Json.Decoder ModuleDocs
moduleDocsDecoder packageUri =
    let
        name =
            Json.field "name" Json.string

        tipe =
            Json.map4 Tipe
                (Json.field "name" Json.string)
                (Json.field "comment" Json.string)
                -- type
                (Json.field "name" Json.string)
                (Json.field "cases" (Json.list (Json.index 0 Json.string)))

        value =
            Json.map3 Value
                (Json.field "name" Json.string)
                (Json.field "comment" Json.string)
                (Json.field "type" Json.string)

        values =
            Json.map3 Values
                (Json.field "aliases" (Json.list value))
                (Json.field "types" (Json.list tipe))
                (Json.field "values" (Json.list value))
    in
        Json.map3 (ModuleDocs packageUri)
            name
            values
            (Json.field "comment" Json.string)


type alias TokenDict =
    Dict.Dict String (List Hint)


type SymbolKind
    = KindDefault
    | KindTypeAlias
    | KindType
    | KindTypeCase
    | KindModule


type alias Symbol =
    { fullName : String
    , sourcePath : String
    , caseTipe : Maybe String
    , kind : SymbolKind
    }


type alias EncodedSymbol =
    { fullName : String
    , sourcePath : String
    , caseTipe : Maybe String
    , kind : String
    }


encodeSymbol : Symbol -> EncodedSymbol
encodeSymbol symbol =
    { fullName = symbol.fullName
    , sourcePath = symbol.sourcePath
    , caseTipe = symbol.caseTipe
    , kind = (symbolKindToString symbol.kind)
    }


type alias Hint =
    { name : String
    , moduleName : String
    , sourcePath : String
    , comment : String
    , tipe : String
    , caseTipe : Maybe String
    , kind : SymbolKind
    }


emptyHint : Hint
emptyHint =
    { name = ""
    , moduleName = ""
    , sourcePath = ""
    , comment = ""
    , tipe = ""
    , caseTipe = Nothing
    , kind = KindDefault
    }


type alias EncodedHint =
    { name : String
    , moduleName : String
    , sourcePath : String
    , comment : String
    , tipe : String
    , caseTipe : Maybe String
    , kind : String
    }


encodeHint : Hint -> EncodedHint
encodeHint hint =
    { name = hint.name
    , moduleName = hint.moduleName
    , sourcePath = hint.sourcePath
    , comment = hint.comment
    , tipe = hint.tipe
    , caseTipe = hint.caseTipe
    , kind = (symbolKindToString hint.kind)
    }


symbolKindToString : SymbolKind -> String
symbolKindToString kind =
    case kind of
        KindDefault ->
            "default"

        KindTypeAlias ->
            "type alias"

        KindType ->
            "type"

        KindTypeCase ->
            "type case"

        KindModule ->
            "module"


type alias ImportSuggestion =
    { name : String
    , comment : String
    , sourcePath : String
    }


toTokenDict : Maybe ActiveFile -> ProjectFileContentsDict -> List ModuleDocs -> TokenDict
toTokenDict maybeActiveFile projectFileContentsDict projectPackageDocs =
    case maybeActiveFile of
        Nothing ->
            Dict.empty

        Just { projectDirectory } ->
            let
                fileContentsDict =
                    getFileContentsOfProject projectDirectory projectFileContentsDict

                getMaybeHints moduleDocs =
                    Maybe.map
                        (filteredHints moduleDocs)
                        (Dict.get moduleDocs.name (getImportsPlusActiveModuleForActiveFile maybeActiveFile fileContentsDict))

                insert ( token, hint ) dict =
                    Dict.update token (\value -> Just (hint :: Maybe.withDefault [] value)) dict
            in
                (projectPackageDocs ++ getProjectModuleDocs projectDirectory projectFileContentsDict)
                    |> List.filterMap getMaybeHints
                    |> List.concat
                    |> List.foldl insert Dict.empty


tipeToValue : Tipe -> Value
tipeToValue { name, comment, tipe } =
    { name = name
    , comment = comment
    , tipe = tipe
    }


filteredHints : ModuleDocs -> Import -> List ( String, Hint )
filteredHints moduleDocs importData =
    List.concatMap (unionTagsToHints moduleDocs importData) moduleDocs.values.tipes
        ++ List.concatMap (nameToHints moduleDocs importData KindTypeAlias) moduleDocs.values.aliases
        ++ List.concatMap (nameToHints moduleDocs importData KindType) (List.map tipeToValue moduleDocs.values.tipes)
        ++ List.concatMap (nameToHints moduleDocs importData KindDefault) moduleDocs.values.values
        ++ moduleToHints moduleDocs importData


nameToHints : ModuleDocs -> Import -> SymbolKind -> Value -> List ( String, Hint )
nameToHints moduleDocs { alias, exposed } kind { name, comment, tipe } =
    let
        hint =
            { name = name
            , moduleName = moduleDocs.name
            , sourcePath = (formatSourcePath moduleDocs name)
            , comment = comment
            , tipe = tipe
            , caseTipe = Nothing
            , kind = kind
            }

        localName =
            getLocalName moduleDocs.name alias name
    in
        if isExposed name exposed then
            [ ( name, hint ), ( localName, hint ) ]
        else
            [ ( localName, hint ) ]


unionTagsToHints : ModuleDocs -> Import -> Tipe -> List ( String, Hint )
unionTagsToHints moduleDocs { alias, exposed } { name, cases, comment, tipe } =
    let
        addHints tag hints =
            let
                fullName =
                    moduleDocs.name ++ "." ++ tag

                hint =
                    { name = tag
                    , moduleName = moduleDocs.name
                    , sourcePath = (formatSourcePath moduleDocs name)
                    , comment = comment
                    , tipe = tipe
                    , caseTipe = (Just name)
                    , kind = KindTypeCase
                    }

                localName =
                    getLocalName moduleDocs.name alias tag
            in
                if Set.member name defaultTypes || isExposed tag exposed then
                    ( tag, hint ) :: ( localName, hint ) :: ( fullName, hint ) :: hints
                else
                    ( localName, hint ) :: ( fullName, hint ) :: hints
    in
        List.foldl addHints [] cases


moduleToHints : ModuleDocs -> Import -> List ( String, Hint )
moduleToHints moduleDocs { alias, exposed } =
    let
        { name, comment, sourcePath } =
            moduleDocs

        hint =
            { name = name
            , moduleName = ""
            , sourcePath = formatSourcePath moduleDocs ""
            , comment = comment
            , tipe = ""
            , caseTipe = Nothing
            , kind = KindModule
            }
    in
        case alias of
            Nothing ->
                [ ( name, hint ) ]

            Just alias ->
                [ ( name, hint ), ( alias, hint ) ]


type alias RawImport =
    { name : String
    , alias : Maybe String
    , exposed : Maybe (List String)
    }


type alias ImportDict =
    Dict.Dict String Import


type alias Import =
    { alias : Maybe String
    , exposed : Exposed
    }


type Exposed
    = None
    | Some (Set.Set String)
    | All


getLocalName : String -> Maybe String -> String -> String
getLocalName moduleName alias name =
    (Maybe.withDefault moduleName alias) ++ "." ++ name


isExposed : String -> Exposed -> Bool
isExposed name exposed =
    case exposed of
        None ->
            False

        Some set ->
            Set.member name set

        All ->
            True


toImportDict : List RawImport -> ImportDict
toImportDict rawImports =
    Dict.union (List.map toImport rawImports |> Dict.fromList) defaultImports


toImport : RawImport -> ( String, Import )
toImport { name, alias, exposed } =
    let
        exposedSet =
            case exposed of
                Nothing ->
                    None

                Just [ ".." ] ->
                    All

                Just vars ->
                    Some (Set.fromList vars)
    in
        ( name, Import alias exposedSet )


(=>) : a -> Exposed -> ( a, Import )
(=>) name exposed =
    ( name, Import Nothing exposed )


defaultImports : ImportDict
defaultImports =
    Dict.fromList
        [ "Basics" => All
        , "List" => Some (Set.fromList [ "List", "::" ])
        , "Maybe" => Some (Set.singleton "Maybe")
          -- Just, Nothing
        , "Result" => Some (Set.singleton "Result")
          -- Ok, Err
        , "String" => None
        , "Tuple" => None
        , "Debug" => None
        , "Platform" => Some (Set.singleton "Program")
        , ( "Platform.Cmd", Import (Just "Cmd") (Some (Set.fromList [ "Cmd", "!" ])) )
        , ( "Platform.Sub", Import (Just "Sub") (Some (Set.singleton "Sub")) )
        ]


defaultTypes : Set.Set String
defaultTypes =
    [ "Maybe"
    , "Result"
    ]
        |> Set.fromList


defaultSuggestions : List Hint
defaultSuggestions =
    List.map
        (\suggestion ->
            { emptyHint | name = suggestion }
        )
        [ "="
        , "->"
        , "True"
        , "False"
        , "number"
        , "Int"
        , "Float"
        , "Char"
        , "String"
        , "Bool"
        , "List"
        , "if"
        , "then"
        , "else"
        , "type"
        , "case"
        , "of"
        , "let"
        , "in"
        , "as"
        , "import"
        , "open"
        , "port"
        , "exposing"
        , "alias"
        , "infixl"
        , "infixr"
        , "infix"
        , "hiding"
        , "export"
        , "foreign"
        , "perform"
        , "deriving"
        ]


getLastName : String -> String
getLastName fullName =
    List.foldl always "" (String.split "." fullName)


getModuleName : String -> String
getModuleName fullName =
    fullName
        |> String.split "."
        |> List.reverse
        |> List.tail
        |> Maybe.withDefault []
        |> List.reverse
        |> String.join "."


capitalizedRegex : Regex.Regex
capitalizedRegex =
    Regex.regex "^[A-Z]"


alphanumericRegex : Regex.Regex
alphanumericRegex =
    Regex.regex "[a-zA-Z0-9]"



-- Based on https://github.com/elm-lang/elm-lang.org/tree/master/src/editor
{-
   Copyright (c) 2012-2015 Evan Czaplicki

   All rights reserved.

   Redistribution and use in source and binary forms, with or without
   modification, are permitted provided that the following conditions are met:

       * Redistributions of source code must retain the above copyright
         notice, this list of conditions and the following disclaimer.

       * Redistributions in binary form must reproduce the above
         copyright notice, this list of conditions and the following
         disclaimer in the documentation and/or other materials provided
         with the distribution.

       * Neither the name of Evan Czaplicki nor the names of other
         contributors may be used to endorse or promote products derived
         from this software without specific prior written permission.

   THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
   "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
   LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
   A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
   OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
   SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
   LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
   DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
   THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
   (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
   OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
-}
