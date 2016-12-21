port module Indexer exposing (..)

import Dict
import Http
import Json.Decode as Decode
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


port activeTokenChangedSub : (( Maybe ActiveTopLevel, Maybe Token ) -> msg) -> Sub msg


port activeFileChangedSub : (( Maybe ActiveFile, Maybe ActiveTopLevel, Maybe Token ) -> msg) -> Sub msg


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


port showAddImportViewCmd : ( Maybe Token, Maybe ActiveFile, List ( String, Maybe String ) ) -> Cmd msg


port updateImportsCmd : ( FilePath, String ) -> Cmd msg



-- MODEL


type alias Model =
    { packageDocs : List ModuleDocs
    , projectFileContentsDict : ProjectFileContentsDict
    , activeTokens : TokenDict
    , activeHints : List Hint
    , activeFile : Maybe ActiveFile
    , activeTopLevel : Maybe ActiveTopLevel
    , projectDependencies : ProjectDependencies
    }


type alias ActiveFile =
    { filePath : FilePath
    , projectDirectory : ProjectDirectory
    }


type alias ActiveTopLevel =
    String


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
    , activeTopLevel = Nothing
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
    | UpdateActiveHints ( Maybe ActiveTopLevel, Maybe Token )
    | UpdateActiveFile ( Maybe ActiveFile, Maybe ActiveTopLevel, Maybe Token )
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

        UpdateActiveHints ( maybeActiveTopLevel, maybeToken ) ->
            doUpdateActiveHints maybeActiveTopLevel maybeToken model

        UpdateActiveFile ( maybeActiveFile, maybeActiveTopLevel, maybeToken ) ->
            doUpdateActiveFile maybeActiveFile maybeActiveTopLevel maybeToken model

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


doUpdateActiveHints : Maybe ActiveTopLevel -> Maybe Token -> Model -> ( Model, Cmd Msg )
doUpdateActiveHints maybeActiveTopLevel maybeToken model =
    let
        updatedActiveTokens =
            getActiveTokens model.activeFile maybeActiveTopLevel model.projectFileContentsDict (getProjectPackageDocs model.activeFile model.projectDependencies model.packageDocs)

        updatedActiveHints =
            getHintsForToken maybeToken updatedActiveTokens
    in
        ( { model
            | activeTopLevel = maybeActiveTopLevel
            , activeHints = updatedActiveHints
          }
        , List.map encodeHint updatedActiveHints
            |> activeHintsChangedCmd
        )


doUpdateActiveFile : Maybe ActiveFile -> Maybe ActiveTopLevel -> Maybe Token -> Model -> ( Model, Cmd Msg )
doUpdateActiveFile maybeActiveFile maybeActiveTopLevel maybeToken model =
    let
        updatedActiveTokens =
            getActiveTokens maybeActiveFile maybeActiveTopLevel model.projectFileContentsDict (getProjectPackageDocs maybeActiveFile model.projectDependencies model.packageDocs)

        updatedActiveHints =
            getHintsForToken maybeToken updatedActiveTokens
    in
        ( { model
            | activeFile = maybeActiveFile
            , activeTopLevel = maybeActiveTopLevel
            , activeTokens = updatedActiveTokens
            , activeHints = updatedActiveHints
          }
        , Cmd.batch
            [ activeFileChangedCmd maybeActiveFile
            , List.map encodeHint updatedActiveHints |> activeHintsChangedCmd
            ]
        )


doUpdateFileContents : FilePath -> ProjectDirectory -> FileContents -> Model -> ( Model, Cmd Msg )
doUpdateFileContents filePath projectDirectory fileContents model =
    let
        updatedProjectFileContentsDict =
            updateFileContents filePath projectDirectory fileContents model.projectFileContentsDict

        updatedActiveTokens =
            getActiveTokens model.activeFile model.activeTopLevel updatedProjectFileContentsDict (getProjectPackageDocs model.activeFile model.projectDependencies model.packageDocs)
    in
        ( { model
            | projectFileContentsDict = updatedProjectFileContentsDict
            , activeTokens = updatedActiveTokens
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

        updatedActiveTokens =
            getActiveTokens model.activeFile model.activeTopLevel updatedProjectFileContentsDict (getProjectPackageDocs model.activeFile model.projectDependencies model.packageDocs)
    in
        ( { model
            | projectFileContentsDict = updatedProjectFileContentsDict
            , activeTokens = updatedActiveTokens
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

        updatedActiveTokens =
            getActiveTokens model.activeFile model.activeTopLevel model.projectFileContentsDict (getProjectPackageDocs model.activeFile model.projectDependencies updatedPackageDocs)
    in
        { model
            | packageDocs = updatedPackageDocs
            , activeTokens = updatedActiveTokens
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

        aliasSymbols =
            List.map
                (\alias ->
                    { fullName = (moduleDocs.name ++ "." ++ alias.name)
                    , sourcePath = (formatSourcePath moduleDocs alias.name)
                    , caseTipe = Nothing
                    , kind = KindTypeAlias
                    }
                )
                values.aliases

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
        valueSymbols ++ aliasSymbols ++ tipeSymbols ++ tipeCaseSymbols ++ [ moduleDocsSymbol ]


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
                                                                            [ hint.name, getModuleLocalName hint.moduleName alias hint.name ]

                                                                        ( _, Some exposedSet ) ->
                                                                            if Set.member hint.name exposedSet then
                                                                                [ hint.name, getModuleLocalName hint.moduleName alias hint.name ]
                                                                            else
                                                                                [ getModuleLocalName hint.moduleName alias hint.name ]

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
        moduleAndSymbols =
            getProjectSymbols model.activeFile model.projectFileContentsDict model.projectDependencies model.packageDocs
                |> -- Do not include symbols in active file and those not inside a module.
                   List.filter
                    (\{ sourcePath, fullName } ->
                        sourcePath /= filePath && getLastName fullName /= ""
                    )
                |> List.map getModuleAndSymbolName

        modulesOnly =
            moduleAndSymbols
                |> List.filter
                    (\( _, symbolName ) ->
                        case symbolName of
                            Nothing ->
                                True

                            _ ->
                                False
                    )

        moduleAndSymbolsAndAllExposed =
            List.append
                moduleAndSymbols
                -- TODO: Add imports like `import Regex exposing (HowMany(..))`
                (modulesOnly
                    |> List.map (\( moduleName, _ ) -> ( moduleName, Just ".." ))
                )
                |> List.sortWith
                    (\( moduleA, symbolA ) ( moduleB, symbolB ) ->
                        let
                            filterKey moduleName symbolName =
                                moduleName
                                    ++ (case symbolName of
                                            Nothing ->
                                                ""

                                            Just symbolName ->
                                                " " ++ symbolName
                                       )
                        in
                            compare (filterKey moduleA symbolA) (filterKey moduleB symbolB)
                    )

        defaultSymbolName =
            case maybeToken of
                Nothing ->
                    Nothing

                Just token ->
                    case getModuleName token of
                        "" ->
                            Just (getLastName token)

                        moduleName ->
                            Just (getModuleName token)
    in
        ( model
        , ( defaultSymbolName, model.activeFile, moduleAndSymbolsAndAllExposed )
            |> showAddImportViewCmd
        )


doAddImport : FilePath -> ProjectDirectory -> String -> Maybe String -> Model -> ( Model, Cmd Msg )
doAddImport filePath projectDirectory moduleName maybeSymbolName model =
    let
        fileContents =
            getFileContentsOfProject projectDirectory model.projectFileContentsDict
                |> getActiveFileContents (Just { filePath = filePath, projectDirectory = projectDirectory })

        updatedImports =
            (case Dict.get moduleName fileContents.imports of
                Nothing ->
                    let
                        importToAdd =
                            case maybeSymbolName of
                                Nothing ->
                                    { alias = Nothing, exposed = None }

                                Just symbolName ->
                                    { alias = Nothing, exposed = Some (Set.singleton symbolName) }
                    in
                        Dict.insert moduleName importToAdd fileContents.imports

                Just moduleImport ->
                    case maybeSymbolName of
                        Nothing ->
                            fileContents.imports

                        Just symbolName ->
                            case moduleImport.exposed of
                                All ->
                                    fileContents.imports

                                Some exposed ->
                                    if symbolName == ".." then
                                        Dict.update moduleName (always <| Just { moduleImport | exposed = All }) fileContents.imports
                                    else
                                        Dict.update moduleName (always <| Just { moduleImport | exposed = Some (Set.insert symbolName exposed) }) fileContents.imports

                                None ->
                                    Dict.update moduleName (always <| Just { moduleImport | exposed = Some (Set.singleton symbolName) }) fileContents.imports
            )
                -- Remove default imports.
                |>
                    Dict.filter
                        (\moduleName moduleImport ->
                            not (List.member ( moduleName, moduleImport ) (Dict.toList defaultImports))
                        )

        updatedFileContents =
            { fileContents | imports = updatedImports }
    in
        ( { model | projectFileContentsDict = updateFileContents filePath projectDirectory updatedFileContents model.projectFileContentsDict }
        , ( filePath, importsToString updatedImports model.activeTokens )
            |> updateImportsCmd
        )


importsToString : ImportDict -> TokenDict -> String
importsToString imports tokens =
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
                                if token /= ".." && isInfix token then
                                    "(" ++ token ++ ")"
                                else
                                    token

                            hints =
                                getHintsForToken (Just token) tokens
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

                            Some exposedSymbols ->
                                let
                                    -- Do not include symbols exposed by default.
                                    -- If importing `map`, for example, the result should be `import List exposing (map)` and not `import List exposing ((::), List, map)`.
                                    nonDefaultExposedSymbols =
                                        exposedSymbols
                                            |> Set.filter
                                                (\exposedSymbolName ->
                                                    case Dict.get moduleName defaultImports of
                                                        Nothing ->
                                                            True

                                                        Just { exposed } ->
                                                            case exposed of
                                                                Some defaultExposedSymbols ->
                                                                    not (Set.member exposedSymbolName defaultExposedSymbols)

                                                                _ ->
                                                                    True
                                                )
                                in
                                    " exposing (" ++ (Set.toList nonDefaultExposedSymbols |> List.map formatExposedSymbol |> String.join ", ") ++ ")"
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
getExposedHints maybeActiveFile projectFileContentsDict projectPackageDocs =
    case maybeActiveFile of
        Nothing ->
            Set.empty

        Just { projectDirectory } ->
            let
                fileContentsDict =
                    getFileContentsOfProject projectDirectory projectFileContentsDict

                importsPlusActiveModule =
                    getImportsPlusActiveModuleForActiveFile maybeActiveFile fileContentsDict

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
    , args : List String
    , cases : List String
    }


type alias Value =
    { name : String
    , comment : String
    , tipe : String
    , args : Maybe (List String)
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
        |> optionalTaskSequence


optionalTaskSequence : List (Task.Task a value) -> Task.Task b (List value)
optionalTaskSequence list =
    -- Modified from `TheSeamau5/elm-task-extra`'s `optional`.
    case list of
        [] ->
            Task.succeed []

        task :: tasks ->
            task
                |> Task.andThen (\value -> Task.map ((::) value) (optionalTaskSequence tasks))
                |> Task.onError (\_ -> optionalTaskSequence tasks)


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
                    , Decode.decodeString (Decode.list (decodeModuleDocs packageUri)) jsonString
                        |> Result.toMaybe
                        |> Maybe.withDefault []
                    )
                )


toModuleDocs : String -> String -> List ModuleDocs
toModuleDocs packageUri jsonString =
    Decode.decodeString (Decode.list (decodeModuleDocs packageUri)) jsonString
        |> Result.toMaybe
        |> Maybe.withDefault []


decodeModuleDocs : String -> Decode.Decoder ModuleDocs
decodeModuleDocs packageUri =
    let
        name =
            Decode.field "name" Decode.string

        comment =
            Decode.field "comment" Decode.string

        args =
            Decode.field "args" (Decode.list Decode.string)

        tipe =
            Decode.map5 Tipe
                name
                comment
                name
                -- ^ type
                args
                (Decode.field "cases" (Decode.list (Decode.index 0 Decode.string)))

        value =
            Decode.map4 Value
                name
                comment
                (Decode.field "type" Decode.string)
                (Decode.maybe args)

        values =
            Decode.map3 Values
                (Decode.field "aliases" (Decode.list value))
                (Decode.field "types" (Decode.list tipe))
                (Decode.field "values" (Decode.list value))
    in
        Decode.map3 (ModuleDocs packageUri)
            name
            values
            comment


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
    , args : List String
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
    , args = []
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


getActiveTokens : Maybe ActiveFile -> Maybe ActiveTopLevel -> ProjectFileContentsDict -> List ModuleDocs -> TokenDict
getActiveTokens maybeActiveFile maybeActiveTopLevel projectFileContentsDict projectPackageDocs =
    case maybeActiveFile of
        Nothing ->
            Dict.empty

        Just { projectDirectory } ->
            let
                fileContentsDict =
                    getFileContentsOfProject projectDirectory projectFileContentsDict

                getHints moduleDocs =
                    Maybe.map
                        (getFilteredHints moduleDocs maybeActiveTopLevel)
                        (Dict.get moduleDocs.name (getImportsPlusActiveModuleForActiveFile maybeActiveFile fileContentsDict))

                insert ( token, hint ) dict =
                    Dict.update token (\value -> Just (hint :: Maybe.withDefault [] value)) dict

                topLevelTokens =
                    projectPackageDocs
                        ++ getProjectModuleDocs projectDirectory projectFileContentsDict
                        |> List.filterMap getHints
                        |> List.concat
                        |> List.foldl insert Dict.empty

                topLevelArgTipePairs =
                    getHintsForToken maybeActiveTopLevel topLevelTokens
                        |> List.concatMap
                            (\{ args, tipe } ->
                                List.map2 (,) args (getTipeParts tipe)
                            )

                argHints =
                    List.concatMap (topLevelArgToHints maybeActiveTopLevel topLevelTokens) topLevelArgTipePairs
            in
                List.foldl insert topLevelTokens argHints


getTipeParts : String -> List String
getTipeParts tipeString =
    case tipeString of
        "" ->
            []

        tipeString ->
            getTipePartsRecur tipeString "" [] ( 0, 0 )


getTipePartsRecur : String -> String -> List String -> ( Int, Int ) -> List String
getTipePartsRecur str acc parts ( openParentheses, openBraces ) =
    case str of
        "" ->
            parts ++ [ String.trim acc ]

        _ ->
            let
                getCharAndRest s =
                    case String.uncons s of
                        Nothing ->
                            ( "", s )

                        Just ( ch, rest ) ->
                            ( String.fromChar ch, rest )

                ( thisChar, thisRest ) =
                    getCharAndRest str

                ( nextChar, nextRest ) =
                    getCharAndRest thisRest
            in
                if openParentheses == 0 && openBraces == 0 && thisChar == "-" && nextChar == ">" then
                    getTipePartsRecur nextRest "" (parts ++ [ String.trim acc ]) ( 0, 0 )
                else
                    let
                        ( updatedOpenParentheses, updatedOpenBraces ) =
                            case thisChar of
                                "(" ->
                                    ( openParentheses + 1, openBraces )

                                ")" ->
                                    ( openParentheses - 1, openBraces )

                                "{" ->
                                    ( openParentheses, openBraces + 1 )

                                "}" ->
                                    ( openParentheses, openBraces - 1 )

                                _ ->
                                    ( openParentheses, openBraces )
                    in
                        getTipePartsRecur thisRest (acc ++ thisChar) parts ( updatedOpenParentheses, updatedOpenBraces )


getTupleArgParts : String -> List String
getTupleArgParts tupleString =
    -- Remove open and close parentheses.
    case String.slice 1 -1 tupleString of
        "" ->
            []

        str ->
            getTuplePartsRecur str "" [] ( 0, 0 )


getTuplePartsRecur : String -> String -> List String -> ( Int, Int ) -> List String
getTuplePartsRecur str acc parts ( openParentheses, openBraces ) =
    case str of
        "" ->
            parts ++ [ String.trim acc ]

        _ ->
            let
                ( thisChar, thisRest ) =
                    case String.uncons str of
                        Nothing ->
                            ( "", str )

                        Just ( ch, rest ) ->
                            ( String.fromChar ch, rest )
            in
                if openParentheses == 0 && openBraces == 0 && thisChar == "," then
                    getTuplePartsRecur thisRest "" (parts ++ [ String.trim acc ]) ( 0, 0 )
                else
                    let
                        ( updatedOpenParentheses, updatedOpenBraces ) =
                            case thisChar of
                                "(" ->
                                    ( openParentheses + 1, openBraces )

                                ")" ->
                                    ( openParentheses - 1, openBraces )

                                "{" ->
                                    ( openParentheses, openBraces + 1 )

                                "}" ->
                                    ( openParentheses, openBraces - 1 )

                                _ ->
                                    ( openParentheses, openBraces )
                    in
                        getTuplePartsRecur thisRest (acc ++ thisChar) parts ( updatedOpenParentheses, updatedOpenBraces )


getRecordArgParts : String -> List String
getRecordArgParts recordString =
    -- Remove open and close braces.
    case String.slice 1 -1 recordString of
        "" ->
            []

        recordString ->
            String.split "," recordString
                |> List.map String.trim


getRecordTipeParts : String -> Dict.Dict String String
getRecordTipeParts tipeString =
    -- Remove open and close braces.
    case String.slice 1 -1 tipeString of
        "" ->
            Dict.empty

        tipeString ->
            getRecordTipePartsRecur tipeString ( "", "" ) False Dict.empty ( 0, 0 )


getRecordTipePartsRecur : String -> ( String, String ) -> Bool -> Dict.Dict String String -> ( Int, Int ) -> Dict.Dict String String
getRecordTipePartsRecur str ( fieldAcc, tipeAcc ) lookingForTipe parts ( openParentheses, openBraces ) =
    case str of
        "" ->
            Dict.insert (String.trim fieldAcc) (String.trim tipeAcc) parts

        _ ->
            let
                ( thisChar, thisRest ) =
                    case String.uncons str of
                        Nothing ->
                            ( "", str )

                        Just ( ch, rest ) ->
                            ( String.fromChar ch, rest )
            in
                if openParentheses == 0 && openBraces == 0 && thisChar == "," then
                    getRecordTipePartsRecur thisRest ( "", "" ) False (Dict.insert (String.trim fieldAcc) (String.trim tipeAcc) parts) ( 0, 0 )
                else if openParentheses == 0 && openBraces == 0 && thisChar == ":" then
                    getRecordTipePartsRecur thisRest ( fieldAcc, "" ) True parts ( 0, 0 )
                else
                    let
                        ( updatedOpenParentheses, updatedOpenBraces ) =
                            case thisChar of
                                "(" ->
                                    ( openParentheses + 1, openBraces )

                                ")" ->
                                    ( openParentheses - 1, openBraces )

                                "{" ->
                                    ( openParentheses, openBraces + 1 )

                                "}" ->
                                    ( openParentheses, openBraces - 1 )

                                _ ->
                                    ( openParentheses, openBraces )

                        ( updatedFieldAcc, updatedTipeAcc ) =
                            if lookingForTipe then
                                ( fieldAcc, tipeAcc ++ thisChar )
                            else
                                ( fieldAcc ++ thisChar, tipeAcc )
                    in
                        getRecordTipePartsRecur thisRest ( updatedFieldAcc, updatedTipeAcc ) lookingForTipe parts ( updatedOpenParentheses, updatedOpenBraces )


tipeToValue : Tipe -> Value
tipeToValue { name, comment, tipe, args } =
    -- Exclude `cases`.
    { name = name
    , comment = comment
    , tipe = tipe
    , args = Just args
    }


getFilteredHints : ModuleDocs -> Maybe ActiveTopLevel -> Import -> List ( String, Hint )
getFilteredHints moduleDocs maybeActiveTopLevel importData =
    List.concatMap (unionTagsToHints moduleDocs importData) moduleDocs.values.tipes
        ++ List.concatMap (nameToHints moduleDocs importData KindTypeAlias) moduleDocs.values.aliases
        ++ List.concatMap (nameToHints moduleDocs importData KindType) (List.map tipeToValue moduleDocs.values.tipes)
        ++ List.concatMap (nameToHints moduleDocs importData KindDefault) moduleDocs.values.values
        ++ moduleToHints moduleDocs importData


topLevelArgToHints : Maybe ActiveTopLevel -> TokenDict -> ( String, String ) -> List ( String, Hint )
topLevelArgToHints maybeActiveTopLevel topLevelTokens ( name, tipeString ) =
    let
        getHint ( name, tipeString ) =
            let
                hint =
                    { name = name
                    , moduleName = ""
                    , sourcePath = ""
                    , comment = ""
                    , tipe = tipeString
                    , args = []
                    , caseTipe = Nothing
                    , kind = KindDefault
                    }
            in
                [ ( name, hint ) ]

        tipes =
            let
                getRecordFields tipeString =
                    getRecordArgParts name
                        |> List.filterMap
                            (\field ->
                                Dict.get field (getRecordTipeParts tipeString)
                                    |> Maybe.map
                                        (\tipeString ->
                                            getRecordFieldTokens field tipeString topLevelTokens True Nothing
                                        )
                            )
                        |> List.concat
            in
                case ( isRecordString name, isRecordString tipeString ) of
                    ( True, True ) ->
                        getRecordFields tipeString

                    ( True, False ) ->
                        case getHintsForToken (Just tipeString) topLevelTokens |> List.head of
                            Nothing ->
                                []

                            Just { tipe } ->
                                getRecordFields tipe

                    ( False, _ ) ->
                        getRecordFieldTokens name tipeString topLevelTokens True Nothing
    in
        tipes
            |> List.concatMap getHint


isTupleString : String -> Bool
isTupleString str =
    String.startsWith "(" str


isRecordString : String -> Bool
isRecordString str =
    String.startsWith "{" str


getRecordFieldTokens : String -> String -> TokenDict -> Bool -> Maybe String -> List ( String, String )
getRecordFieldTokens name tipeString topLevelTokens shouldAddSelf maybeRootTipeString =
    (if shouldAddSelf then
        [ ( name, tipeString ) ]
     else
        []
    )
        |> List.append
            (if isRecordString name then
                let
                    getRecordFields tipeString1 =
                        getRecordArgParts name
                            |> List.filterMap
                                (\field ->
                                    Dict.get field (getRecordTipeParts tipeString1)
                                        |> Maybe.map
                                            (\tipeString ->
                                                getRecordFieldTokens field tipeString topLevelTokens True maybeRootTipeString
                                            )
                                )
                            |> List.concat
                in
                    if isRecordString tipeString then
                        getRecordFields tipeString
                    else
                        case getHintsForToken (Just tipeString) topLevelTokens |> List.head of
                            Nothing ->
                                []

                            Just { tipe } ->
                                getRecordFields tipe
             else if isRecordString tipeString then
                getRecordTipeParts tipeString
                    |> Dict.toList
                    |> List.concatMap
                        (\( field, tipeString ) ->
                            getRecordFieldTokens (name ++ "." ++ field) tipeString topLevelTokens True maybeRootTipeString
                        )
             else if isTupleString name && isTupleString tipeString then
                List.map2 (,) (getTupleArgParts name) (getTupleArgParts tipeString)
                    |> List.map
                        (\( name, tipeString ) ->
                            getRecordFieldTokens name tipeString topLevelTokens True maybeRootTipeString
                        )
                    |> List.concat
             else
                case getHintsForToken (Just tipeString) topLevelTokens |> List.head of
                    Nothing ->
                        []

                    Just hint ->
                        let
                            _ =
                                Debug.log "maybeRootTipeString" ( hint, tipeString, maybeRootTipeString )
                        in
                            if hint.kind /= KindType && hint.tipe /= tipeString then
                                case maybeRootTipeString of
                                    Nothing ->
                                        getRecordFieldTokens name hint.tipe topLevelTokens False (Just hint.name)

                                    Just rootTipeString ->
                                        if hint.name /= rootTipeString then
                                            getRecordFieldTokens name hint.tipe topLevelTokens False (Just hint.name)
                                        else
                                            []
                            else
                                []
            )


unionTagsToHints : ModuleDocs -> Import -> Tipe -> List ( String, Hint )
unionTagsToHints moduleDocs { alias, exposed } { name, comment, tipe, args, cases } =
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
                    , args = args
                    , caseTipe = (Just name)
                    , kind = KindTypeCase
                    }

                moduleLocalName =
                    getModuleLocalName moduleDocs.name alias tag
            in
                if Set.member name defaultTypes || isExposed tag exposed then
                    ( tag, hint ) :: ( moduleLocalName, hint ) :: ( fullName, hint ) :: hints
                else
                    ( moduleLocalName, hint ) :: ( fullName, hint ) :: hints
    in
        List.foldl addHints [] cases


nameToHints : ModuleDocs -> Import -> SymbolKind -> Value -> List ( String, Hint )
nameToHints moduleDocs { alias, exposed } kind { name, comment, tipe, args } =
    let
        hint =
            { name = name
            , moduleName = moduleDocs.name
            , sourcePath = (formatSourcePath moduleDocs name)
            , comment = comment
            , tipe = tipe
            , args =
                case args of
                    Nothing ->
                        []

                    Just args ->
                        args
            , caseTipe = Nothing
            , kind = kind
            }

        moduleLocalName =
            getModuleLocalName moduleDocs.name alias name
    in
        if isExposed name exposed then
            [ ( name, hint ), ( moduleLocalName, hint ) ]
        else
            [ ( moduleLocalName, hint ) ]


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
            , args = []
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


getModuleLocalName : String -> Maybe String -> String -> String
getModuleLocalName moduleName alias name =
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


getModuleAndSymbolName : Symbol -> ( String, Maybe String )
getModuleAndSymbolName { fullName, caseTipe, kind } =
    case kind of
        KindModule ->
            ( fullName, Nothing )

        _ ->
            let
                parts =
                    String.split "." fullName |> List.reverse

                symbolName =
                    List.head parts |> Maybe.withDefault ""

                moduleName =
                    List.tail parts |> Maybe.withDefault [] |> List.reverse |> String.join "."
            in
                ( if moduleName /= "" then
                    moduleName
                  else
                    symbolName
                , if moduleName /= "" then
                    (case caseTipe of
                        Nothing ->
                            Just symbolName

                        Just caseTipe ->
                            Just (caseTipe ++ "(" ++ symbolName ++ ")")
                    )
                  else
                    Nothing
                )



{- TODO: Allow unicode. -}


capitalizedRegex : Regex.Regex
capitalizedRegex =
    Regex.regex "^[A-Z]"


isInfix : String -> Bool
isInfix token =
    Regex.contains infixRegex token


infixRegex : Regex.Regex
infixRegex =
    Regex.regex "^[~!@#$%^&*\\-+=:|<>.?/]+$"



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
