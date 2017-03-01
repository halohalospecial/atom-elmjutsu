port module Indexer exposing (..)

import Helper
import Dict
import Http exposing (encodeUri)
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
        [ activeTokenChangedSub UpdateActiveTokenHints
        , activeFileChangedSub UpdateActiveFile
        , fileContentsChangedSub
            (\( filePath, projectDirectory, encodedModuleDocs, rawImports ) ->
                let
                    decodeValue encoded =
                        { encoded | associativity = decodeAssociativity encoded.associativity }

                    encodedValues =
                        encodedModuleDocs.values

                    moduleDocs =
                        { encodedModuleDocs
                            | values =
                                { encodedValues
                                    | values = List.map decodeValue encodedValues.values
                                    , aliases = List.map decodeValue encodedValues.aliases
                                }
                        }
                in
                    UpdateFileContents filePath projectDirectory (FileContents moduleDocs (toImportDict rawImports))
            )
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
        , constructFromTypeAnnotationSub ConstructFromTypeAnnotation
        , constructCaseOfSub ConstructCaseOf
        , constructDefaultValueForTypeSub ConstructDefaultValueForType
        , constructDefaultArgumentsSub ConstructDefaultArguments
        , inferenceEnteredSub InferenceEntered
        , configChangedSub ConfigChanged
        , getAliasesOfTypeSub GetAliasesOfType
        ]



-- INCOMING PORTS


port activeTokenChangedSub : (( Maybe ActiveTopLevel, Maybe Token ) -> msg) -> Sub msg


port activeFileChangedSub : (( Maybe ActiveFile, Maybe ActiveTopLevel, Maybe Token ) -> msg) -> Sub msg


port fileContentsChangedSub : (( FilePath, ProjectDirectory, EncodedModuleDocs, List RawImport ) -> msg) -> Sub msg


port fileContentsRemovedSub : (( FilePath, ProjectDirectory ) -> msg) -> Sub msg


port projectDependenciesChangedSub : (( String, List Dependency ) -> msg) -> Sub msg


port downloadMissingPackageDocsSub : (List Dependency -> msg) -> Sub msg


port docsReadSub : (List ( Dependency, String ) -> msg) -> Sub msg


port goToDefinitionSub : (( Maybe Token, Maybe ActiveTopLevel ) -> msg) -> Sub msg


port showGoToSymbolViewSub : (( Maybe String, Maybe String ) -> msg) -> Sub msg


port getHintsForPartialSub : (( String, Maybe String, Bool ) -> msg) -> Sub msg


port getSuggestionsForImportSub : (String -> msg) -> Sub msg


port askCanGoToDefinitionSub : (( Token, Maybe ActiveTopLevel ) -> msg) -> Sub msg


port getImportersForTokenSub : (( Maybe ProjectDirectory, Maybe Token, Maybe Bool ) -> msg) -> Sub msg


port showAddImportViewSub : (( FilePath, Maybe Token ) -> msg) -> Sub msg


port addImportSub : (( FilePath, ProjectDirectory, String, Maybe String ) -> msg) -> Sub msg


port constructFromTypeAnnotationSub : (String -> msg) -> Sub msg


port constructCaseOfSub : (Token -> msg) -> Sub msg


port constructDefaultValueForTypeSub : (Token -> msg) -> Sub msg


port constructDefaultArgumentsSub : (Token -> msg) -> Sub msg


port inferenceEnteredSub : (Inference -> msg) -> Sub msg


port configChangedSub : (Config -> msg) -> Sub msg


port getAliasesOfTypeSub : (Token -> msg) -> Sub msg



-- OUTGOING PORTS


port docsReadCmd : () -> Cmd msg


port docsDownloadedCmd : List ( Dependency, String ) -> Cmd msg


port downloadDocsFailedCmd : String -> Cmd msg


port goToDefinitionCmd : ( Maybe ActiveFile, EncodedSymbol ) -> Cmd msg


port showGoToSymbolViewCmd : ( Maybe String, Maybe ActiveFile, List EncodedSymbol ) -> Cmd msg


port activeFileChangedCmd : Maybe ActiveFile -> Cmd msg


port activeTokenHintsChangedCmd : List EncodedHint -> Cmd msg


port readingPackageDocsCmd : () -> Cmd msg


port downloadingPackageDocsCmd : () -> Cmd msg


port readPackageDocsCmd : List Dependency -> Cmd msg


port hintsForPartialReceivedCmd : ( String, List EncodedHint ) -> Cmd msg


port suggestionsForImportReceivedCmd : ( String, List ImportSuggestion ) -> Cmd msg


port canGoToDefinitionRepliedCmd : ( Token, Bool ) -> Cmd msg


port importersForTokenReceivedCmd : ( ProjectDirectory, Token, Bool, Bool, List ( String, Bool, Bool, List String ) ) -> Cmd msg


port showAddImportViewCmd : ( Maybe Token, Maybe ActiveFile, List ( String, Maybe String ) ) -> Cmd msg


port updateImportsCmd : ( FilePath, String ) -> Cmd msg


port fromTypeAnnotationConstructedCmd : String -> Cmd msg


port caseOfConstructedCmd : Maybe Token -> Cmd msg


port defaultValueForTypeConstructedCmd : Maybe String -> Cmd msg


port defaultArgumentsConstructedCmd : Maybe (List String) -> Cmd msg


port aliasesOfTypeReceivedCmd : List TipeString -> Cmd msg



-- MODEL


type alias Model =
    { packageDocs : List ModuleDocs
    , projectFileContentsDict : ProjectFileContentsDict
    , activeTokens : TokenDict
    , activeTokenHints : List Hint
    , activeFile : Maybe ActiveFile
    , activeTopLevel : Maybe ActiveTopLevel
    , projectDependencies : ProjectDependencies
    , config : Config
    }


type alias Config =
    { showAliasesOfType : Bool
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


type alias Inference =
    { name : String
    , tipe : String
    }


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
    , activeTokenHints = []
    , activeFile = Nothing
    , activeTopLevel = Nothing
    , projectDependencies = Dict.empty
    , config = emptyConfig
    }


emptyConfig : Config
emptyConfig =
    { showAliasesOfType = False }


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
    = MaybeDocsDownloaded (List Dependency) (Result Http.Error (List (Result Http.Error ( String, List ModuleDocs ))))
    | DocsRead (List ( Dependency, String ))
    | UpdateActiveTokenHints ( Maybe ActiveTopLevel, Maybe Token )
    | UpdateActiveFile ( Maybe ActiveFile, Maybe ActiveTopLevel, Maybe Token )
    | UpdateFileContents FilePath ProjectDirectory FileContents
    | RemoveFileContents ( FilePath, ProjectDirectory )
    | UpdateProjectDependencies ( String, List Dependency )
    | GoToDefinition ( Maybe Token, Maybe ActiveTopLevel )
    | ShowGoToSymbolView ( Maybe ProjectDirectory, Maybe String )
    | GetHintsForPartial ( String, Maybe String, Bool )
    | GetSuggestionsForImport String
    | AskCanGoToDefinition ( Token, Maybe ActiveTopLevel )
    | GetImporterSourcePathsForToken ( Maybe ProjectDirectory, Maybe Token, Maybe Bool )
    | DownloadMissingPackageDocs (List Dependency)
    | ShowAddImportView ( FilePath, Maybe Token )
    | AddImport ( FilePath, ProjectDirectory, String, Maybe String )
    | ConstructFromTypeAnnotation String
    | ConstructCaseOf Token
    | ConstructDefaultValueForType Token
    | ConstructDefaultArguments Token
    | InferenceEntered Inference
    | ConfigChanged Config
    | GetAliasesOfType Token


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        MaybeDocsDownloaded dependencies (Err result) ->
            ( model
            , downloadDocsFailedCmd (toString result)
            )

        MaybeDocsDownloaded dependencies (Ok result) ->
            let
                ( successes, failures ) =
                    List.foldl
                        (\( dependency, resultForDependency ) ( successes, failures ) ->
                            case resultForDependency of
                                Ok ( jsonString, moduleDocsList ) ->
                                    ( successes ++ [ ( moduleDocsList, ( dependency, jsonString ) ) ], failures )

                                Err message ->
                                    ( successes, failures ++ [ toString message ++ " " ++ toPackageUri dependency ++ "documentation.json" ] )
                        )
                        ( [], [] )
                        (List.map2 (,) dependencies result)

                loadedPackageDocs =
                    successes
                        |> List.concatMap Tuple.first

                loadedDependenciesAndJson =
                    successes
                        |> List.map Tuple.second
            in
                ( addLoadedPackageDocs loadedPackageDocs model
                , Cmd.batch
                    ([ docsDownloadedCmd loadedDependenciesAndJson ]
                        ++ (if List.length failures > 0 then
                                [ downloadDocsFailedCmd (String.join "\n" failures) ]
                            else
                                []
                           )
                    )
                )

        DocsRead result ->
            let
                loadedPackageDocs =
                    List.concatMap (\( dependency, jsonString ) -> toModuleDocs (toPackageUri dependency) jsonString) result
            in
                ( addLoadedPackageDocs loadedPackageDocs model
                , docsReadCmd ()
                )

        UpdateActiveTokenHints ( maybeActiveTopLevel, maybeToken ) ->
            doUpdateActiveTokenHints maybeActiveTopLevel maybeToken model

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

        GoToDefinition ( maybeToken, maybeActiveTopLevel ) ->
            doGoToDefinition maybeToken maybeActiveTopLevel model

        ShowGoToSymbolView ( maybeProjectDirectory, maybeToken ) ->
            doShowGoToSymbolView maybeProjectDirectory maybeToken model

        GetHintsForPartial ( partial, maybeInferredTipe, isGlobal ) ->
            doGetHintsForPartial partial maybeInferredTipe isGlobal model

        GetSuggestionsForImport partial ->
            doGetSuggestionsForImport partial model

        AskCanGoToDefinition ( token, maybeActiveTopLevel ) ->
            doAskCanGoToDefinition token maybeActiveTopLevel model

        GetImporterSourcePathsForToken ( maybeProjectDirectory, maybeToken, maybeIsCursorAtLastPartOfToken ) ->
            doGetImporterSourcePathsForToken maybeProjectDirectory maybeToken maybeIsCursorAtLastPartOfToken model

        ShowAddImportView ( filePath, maybeToken ) ->
            doShowAddImportView filePath maybeToken model

        AddImport ( filePath, projectDirectory, moduleName, maybeSymbolName ) ->
            doAddImport filePath projectDirectory moduleName maybeSymbolName model

        ConstructFromTypeAnnotation typeAnnotation ->
            doConstructFromTypeAnnotation typeAnnotation model

        ConstructCaseOf token ->
            doConstructCaseOf token model

        ConstructDefaultValueForType token ->
            doConstructDefaultValueForType token model

        ConstructDefaultArguments token ->
            doConstructDefaultArguments token model

        InferenceEntered inference ->
            ( model
            , List.map (encodeHint model.config.showAliasesOfType model.activeTokens) (inferenceToHints inference)
                |> activeTokenHintsChangedCmd
            )

        ConfigChanged config ->
            ( { model | config = config }
            , Cmd.none
            )

        GetAliasesOfType token ->
            doGetAliasesOfType token model


inferenceToHints : Inference -> List Hint
inferenceToHints inference =
    [ { emptyHint
        | name = inference.name
        , tipe = inference.tipe
      }
    ]


doUpdateActiveTokenHints : Maybe ActiveTopLevel -> Maybe Token -> Model -> ( Model, Cmd Msg )
doUpdateActiveTokenHints maybeActiveTopLevel maybeToken model =
    let
        updatedActiveTokens =
            getActiveTokens model.activeFile maybeActiveTopLevel model.projectFileContentsDict model.projectDependencies model.packageDocs

        updatedActiveTokenHints =
            getHintsForToken maybeToken updatedActiveTokens
    in
        ( { model
            | activeTopLevel = maybeActiveTopLevel
            , activeTokenHints = updatedActiveTokenHints
          }
        , List.map (encodeHint model.config.showAliasesOfType updatedActiveTokens) updatedActiveTokenHints
            |> activeTokenHintsChangedCmd
        )


doUpdateActiveFile : Maybe ActiveFile -> Maybe ActiveTopLevel -> Maybe Token -> Model -> ( Model, Cmd Msg )
doUpdateActiveFile maybeActiveFile maybeActiveTopLevel maybeToken model =
    let
        updatedActiveTokens =
            getActiveTokens maybeActiveFile maybeActiveTopLevel model.projectFileContentsDict model.projectDependencies model.packageDocs

        updatedActiveTokenHints =
            getHintsForToken maybeToken updatedActiveTokens
    in
        ( { model
            | activeFile = maybeActiveFile
            , activeTopLevel = maybeActiveTopLevel
            , activeTokens = updatedActiveTokens
            , activeTokenHints = updatedActiveTokenHints
          }
        , Cmd.batch
            [ activeFileChangedCmd maybeActiveFile
            , List.map (encodeHint model.config.showAliasesOfType updatedActiveTokens) updatedActiveTokenHints
                |> activeTokenHintsChangedCmd
            ]
        )


doUpdateFileContents : FilePath -> ProjectDirectory -> FileContents -> Model -> ( Model, Cmd Msg )
doUpdateFileContents filePath projectDirectory fileContents model =
    let
        updatedProjectFileContentsDict =
            updateFileContents filePath projectDirectory fileContents model.projectFileContentsDict

        updatedActiveTokens =
            getActiveTokens model.activeFile model.activeTopLevel updatedProjectFileContentsDict model.projectDependencies model.packageDocs
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
            getActiveTokens model.activeFile model.activeTopLevel updatedProjectFileContentsDict model.projectDependencies model.packageDocs
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
        , Task.attempt (MaybeDocsDownloaded dependencies) (downloadPackageDocsList dependencies)
        ]
    )


doGoToDefinition : Maybe Token -> Maybe ActiveTopLevel -> Model -> ( Model, Cmd Msg )
doGoToDefinition maybeToken maybeActiveTopLevel model =
    let
        activeTokens =
            getActiveTokens model.activeFile maybeActiveTopLevel model.projectFileContentsDict model.projectDependencies model.packageDocs

        requests =
            getHintsForToken maybeToken activeTokens
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
        Just projectDirectory ->
            let
                hints =
                    getHintsForToken maybeToken model.activeTokens

                defaultSymbolName =
                    case List.head hints of
                        Just hint ->
                            case model.activeFile of
                                Just activeFile ->
                                    if activeFile.filePath == hint.sourcePath then
                                        Just (getLastName hint.name)
                                    else
                                        Just hint.name

                                Nothing ->
                                    Just hint.name

                        Nothing ->
                            maybeToken
            in
                ( model
                , ( defaultSymbolName, model.activeFile, List.map encodeSymbol (getProjectFileSymbols projectDirectory model.projectFileContentsDict) )
                    |> showGoToSymbolViewCmd
                )

        Nothing ->
            ( model
            , Cmd.none
            )


doGetHintsForPartial : String -> Maybe String -> Bool -> Model -> ( Model, Cmd Msg )
doGetHintsForPartial partial maybeInferredTipe isGlobal model =
    ( model
    , ( partial
      , getHintsForPartial partial maybeInferredTipe isGlobal model.activeFile model.projectFileContentsDict (getProjectPackageDocs model.activeFile model.projectDependencies model.packageDocs) model.activeTokens
            |> List.map (encodeHint model.config.showAliasesOfType model.activeTokens)
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


doAskCanGoToDefinition : Token -> Maybe ActiveTopLevel -> Model -> ( Model, Cmd Msg )
doAskCanGoToDefinition token maybeActiveTopLevel model =
    let
        activeTokens =
            getActiveTokens model.activeFile maybeActiveTopLevel model.projectFileContentsDict model.projectDependencies model.packageDocs
    in
        ( model
        , ( token
          , Dict.member token activeTokens
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
            getActiveTokens model.activeFile model.activeTopLevel model.projectFileContentsDict model.projectDependencies updatedPackageDocs
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
                Just comment ->
                    comment

                Nothing ->
                    ""
    in
        { moduleDocs | comment = truncatedComment }


getProjectPackageDocs : Maybe ActiveFile -> Dict.Dict String (List Dependency) -> List ModuleDocs -> List ModuleDocs
getProjectPackageDocs maybeActiveFile projectDependencies packageDocs =
    case maybeActiveFile of
        Just activeFile ->
            case Dict.get activeFile.projectDirectory projectDependencies of
                Just dependencies ->
                    let
                        packageUris =
                            List.map toPackageUri dependencies
                    in
                        packageDocs
                            |> List.filter
                                (\moduleDocs ->
                                    List.member moduleDocs.sourcePath packageUris
                                )

                Nothing ->
                    []

        Nothing ->
            []


getProjectSymbols : Maybe ActiveFile -> ProjectFileContentsDict -> ProjectDependencies -> List ModuleDocs -> List Symbol
getProjectSymbols maybeActiveFile projectFileContentsDict projectDependencies packageDocs =
    case maybeActiveFile of
        Just { projectDirectory } ->
            List.append
                (getProjectFileSymbols projectDirectory projectFileContentsDict)
                (getProjectDependencySymbols maybeActiveFile projectDependencies packageDocs)

        Nothing ->
            []


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
                    isProjectSourcePath sourcePath
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
                            if Helper.isCapitalized value.name then
                                KindTypeAlias
                            else
                                KindDefault
                    in
                        { fullName = moduleDocs.name ++ "." ++ value.name
                        , sourcePath = formatSourcePath moduleDocs value.name
                        , caseTipe = Nothing
                        , kind = kind
                        }
                )
                values.values

        aliasSymbols =
            List.map
                (\alias ->
                    { fullName = moduleDocs.name ++ "." ++ alias.name
                    , sourcePath = formatSourcePath moduleDocs alias.name
                    , caseTipe = Nothing
                    , kind = KindTypeAlias
                    }
                )
                values.aliases

        tipeSymbols =
            List.map
                (\tipe ->
                    { fullName = moduleDocs.name ++ "." ++ tipe.name
                    , sourcePath = formatSourcePath moduleDocs tipe.name
                    , caseTipe = Nothing
                    , kind = KindType
                    }
                )
                values.tipes

        tipeCaseSymbols =
            List.concatMap
                (\tipe ->
                    List.map
                        (\tipeCase ->
                            { fullName = moduleDocs.name ++ "." ++ tipeCase.name
                            , sourcePath = formatSourcePath moduleDocs tipeCase.name
                            , caseTipe = Just tipe.name
                            , kind = KindTypeCase
                            }
                        )
                        tipe.cases
                )
                values.tipes
    in
        valueSymbols ++ aliasSymbols ++ tipeSymbols ++ tipeCaseSymbols ++ [ moduleDocsSymbol ]


getAliasesOfType : TokenDict -> String -> TipeString -> List TipeString
getAliasesOfType tokens name tipeString =
    -- TODO: Handle type variables.
    if tipeString == "" then
        []
    else
        let
            normalizedTipeString =
                normalizeTipe tokens tipeString
        in
            (primitiveTipes
                |> List.filter
                    (\primitiveTipe ->
                        (tipeString /= primitiveTipe)
                            && (normalizedTipeString == primitiveTipe)
                    )
            )
                ++ (Dict.values tokens
                        |> List.concat
                        |> List.filter
                            (\hint ->
                                let
                                    normalizedHintTipe =
                                        normalizeTipe tokens hint.tipe
                                in
                                    (hint.tipe /= "")
                                        && (hint.kind == KindTypeAlias)
                                        && (tipeString /= hint.name)
                                        -- && (name /= hint.tipe)
                                        &&
                                            (name /= hint.name)
                                        && ((name == normalizedHintTipe)
                                                || (normalizedTipeString == normalizedHintTipe)
                                            -- || (normalizedTipeString == normalizeTipe tokens hint.name)
                                           )
                            )
                        |> List.map .name
                   )


normalizeTipe : TokenDict -> TipeString -> TipeString
normalizeTipe tokens tipeString =
    normalizeTipeRecur tokens Set.empty tipeString


normalizeTipeRecur : TokenDict -> Set.Set TipeString -> TipeString -> TipeString
normalizeTipeRecur tokens visitedTipeAliases tipeString =
    if isPrimitiveTipe tipeString then
        tipeString
    else if isRecordString tipeString then
        let
            fieldAndValues =
                getRecordTipeParts tipeString
                    |> Dict.fromList
                    |> Dict.map
                        (\fieldName fieldTipeString ->
                            fieldName ++ " : " ++ normalizeTipeRecur tokens visitedTipeAliases fieldTipeString
                        )
                    |> Dict.values
                    |> String.join ", "
        in
            "{ " ++ fieldAndValues ++ " }"
    else if isTupleString tipeString then
        let
            parts =
                getTupleParts tipeString
                    |> List.map
                        (\part ->
                            normalizeTipeRecur tokens visitedTipeAliases part
                        )
        in
            getTupleStringFromParts parts
    else
        case getHintsForToken (Just tipeString) tokens |> List.head of
            Just hint ->
                -- Avoid infinite recursion.
                if Set.member hint.tipe visitedTipeAliases then
                    tipeString
                else if hint.kind == KindTypeAlias then
                    normalizeTipeRecur tokens (Set.insert hint.tipe visitedTipeAliases) hint.tipe
                else
                    hint.tipe

            Nothing ->
                tipeString


getHintsForToken : Maybe Token -> TokenDict -> List Hint
getHintsForToken maybeToken tokens =
    case maybeToken of
        Just token ->
            Maybe.withDefault [] (Dict.get token tokens)

        Nothing ->
            []


getHintsForPartial : String -> Maybe String -> Bool -> Maybe ActiveFile -> ProjectFileContentsDict -> List ModuleDocs -> TokenDict -> List Hint
getHintsForPartial partial maybeInferredTipe isGlobal maybeActiveFile projectFileContentsDict projectPackageDocs activeTokens =
    case maybeActiveFile of
        Just { projectDirectory, filePath } ->
            let
                allModuleDocs =
                    projectPackageDocs ++ getProjectModuleDocs projectDirectory projectFileContentsDict

                importsPlusActiveModule =
                    getFileContentsOfProject projectDirectory projectFileContentsDict
                        |> getImportsPlusActiveModuleForActiveFile maybeActiveFile

                activeFileContents =
                    getFileContentsOfProject projectDirectory projectFileContentsDict
                        |> getActiveFileContents maybeActiveFile

                filterByName { name } =
                    case maybeInferredTipe of
                        Just tipeString ->
                            partial == "" || String.startsWith partial name

                        Nothing ->
                            String.startsWith partial name

                argHints =
                    activeTokens
                        |> Dict.values
                        |> List.concat
                        |> List.filter (\hint -> hint.moduleName == "")
                        |> List.filter filterByName

                defaultHints =
                    List.filter filterByName defaultSuggestions

                ( rawExposedHints, rawUnexposedHints ) =
                    if isGlobal then
                        getExposedAndUnexposedHints True filePath importsPlusActiveModule allModuleDocs
                    else
                        let
                            importedModuleDocs =
                                allModuleDocs
                                    |> List.filter
                                        (\moduleDocs ->
                                            List.member moduleDocs.name (Dict.keys importsPlusActiveModule)
                                        )
                        in
                            -- Only check the imported modules.
                            getExposedAndUnexposedHints False filePath importsPlusActiveModule importedModuleDocs

                exposedHints =
                    List.filter filterByName rawExposedHints

                unexposedHints =
                    List.filter filterByName rawUnexposedHints

                sortByName =
                    List.sortBy .name
            in
                case maybeInferredTipe of
                    Just tipeString ->
                        let
                            -- TODO: Handle type variables (e.g. List a)?
                            partitionByTipe { tipe } =
                                case maybeInferredTipe of
                                    Just tipeString ->
                                        getReturnTipe tipeString == getReturnTipe tipe

                                    Nothing ->
                                        True

                            ( argHintsMatchingTipe, argHintsNotMatchingTipe ) =
                                List.partition partitionByTipe argHints

                            ( defaultHintsMatchingTipe, defaultHintsNotMatchingTipe ) =
                                List.partition partitionByTipe defaultHints

                            ( exposedHintsMatchingTipe, exposedHintsNotMatchingTipe ) =
                                List.partition partitionByTipe exposedHints

                            ( unexposedHintsMatchingTipe, unexposedHintsNotMatchingTipe ) =
                                List.partition partitionByTipe unexposedHints

                            filterWithPartial { name } =
                                if partial /= "" then
                                    String.startsWith partial name
                                else
                                    False
                        in
                            sortByName argHintsMatchingTipe
                                ++ sortByName defaultHintsMatchingTipe
                                ++ sortByName exposedHintsMatchingTipe
                                ++ sortByName unexposedHintsMatchingTipe
                                ++ (sortByName
                                        (List.filter filterWithPartial argHintsNotMatchingTipe
                                            ++ List.filter filterWithPartial defaultHintsNotMatchingTipe
                                            ++ List.filter filterWithPartial exposedHintsNotMatchingTipe
                                        )
                                        ++ sortByName (List.filter filterWithPartial unexposedHintsNotMatchingTipe)
                                   )

                    Nothing ->
                        sortByName
                            (argHints
                                ++ defaultHints
                                ++ exposedHints
                            )
                            ++ sortByName unexposedHints

        Nothing ->
            []


getExposedAndUnexposedHints : Bool -> FilePath -> ImportDict -> List ModuleDocs -> ( List Hint, List Hint )
getExposedAndUnexposedHints includeUnexposed activeFilePath importsPlusActiveModule moduleDocs =
    let
        ( exposedLists, unexposedLists ) =
            moduleDocs
                |> List.foldl
                    (\moduleDocs ( accExposedHints, accUnexposedHints ) ->
                        let
                            aliasesTipesAndValues =
                                (moduleDocs.values.aliases
                                    ++ (List.map tipeToValue moduleDocs.values.tipes)
                                    ++ moduleDocs.values.values
                                )

                            tipeCases =
                                List.concatMap .cases moduleDocs.values.tipes

                            allNames =
                                (List.map .name aliasesTipesAndValues)
                                    ++ (List.map .name tipeCases)
                                    |> Set.fromList

                            ( exposedHints, unexposedHints ) =
                                case Dict.get moduleDocs.name importsPlusActiveModule of
                                    Just importData ->
                                        let
                                            exposed =
                                                getFilteredHints activeFilePath moduleDocs importData
                                                    |> List.map
                                                        (\( name, hint ) ->
                                                            let
                                                                moduleNameToShow =
                                                                    if hint.moduleName == "" || activeFilePath == hint.sourcePath then
                                                                        ""
                                                                    else
                                                                        hint.moduleName
                                                            in
                                                                { hint | moduleName = moduleNameToShow, name = name }
                                                        )

                                            exposedNames =
                                                exposed
                                                    |> List.map .name
                                                    |> Set.fromList

                                            unexposedNames =
                                                allNames
                                                    |> Set.filter
                                                        (\name ->
                                                            not (Set.member name exposedNames)
                                                        )
                                        in
                                            ( exposed
                                            , if includeUnexposed then
                                                getHintsForUnexposedNames False moduleDocs unexposedNames
                                              else
                                                []
                                            )

                                    Nothing ->
                                        ( []
                                        , if includeUnexposed then
                                            getHintsForUnexposedNames True moduleDocs allNames
                                          else
                                            []
                                        )
                        in
                            ( exposedHints :: accExposedHints
                            , unexposedHints :: accUnexposedHints
                            )
                    )
                    ( [], [] )
    in
        ( List.concat exposedLists
        , List.concat unexposedLists
        )


getHintsForUnexposedNames : Bool -> ModuleDocs -> Set.Set String -> List Hint
getHintsForUnexposedNames includeQualified moduleDocs unexposedNames =
    let
        qualifiedAndUnqualified hint =
            if includeQualified then
                [ { hint | name = moduleDocs.name ++ "." ++ hint.name }, hint ]
            else
                [ hint ]

        valueToHints kind value =
            { name = value.name
            , moduleName = moduleDocs.name
            , sourcePath = moduleDocs.sourcePath
            , comment = value.comment
            , tipe = value.tipe
            , args = value.args |> Maybe.withDefault []
            , caseTipe = Nothing
            , cases = []
            , associativity = value.associativity
            , precedence = value.precedence
            , kind = kind
            , isImported = False
            }
                |> qualifiedAndUnqualified

        filter { name } =
            Set.member name unexposedNames

        tipeAliasHints =
            moduleDocs.values.aliases
                |> List.filter filter
                |> List.concatMap (valueToHints KindTypeAlias)

        tipeAndTipeCaseHints =
            moduleDocs.values.tipes
                |> List.filter filter
                |> List.concatMap
                    (\tipe ->
                        ({ name = tipe.name
                         , moduleName = moduleDocs.name
                         , sourcePath = moduleDocs.sourcePath
                         , comment = tipe.comment
                         , tipe = tipe.tipe
                         , args = tipe.args
                         , caseTipe = Nothing
                         , cases = tipe.cases
                         , associativity = Nothing
                         , precedence = Nothing
                         , kind = KindType
                         , isImported = False
                         }
                            |> qualifiedAndUnqualified
                        )
                            ++ (tipe.cases
                                    |> List.filter filter
                                    |> List.concatMap
                                        (\tipeCase ->
                                            let
                                                hintTipe =
                                                    getTipeCaseTypeAnnotation tipeCase tipe
                                            in
                                                { name = tipeCase.name
                                                , moduleName = moduleDocs.name
                                                , sourcePath = moduleDocs.sourcePath
                                                , comment = ""
                                                , tipe = hintTipe
                                                , args = tipeCase.args
                                                , caseTipe = Just tipe.name
                                                , cases = []
                                                , associativity = Nothing
                                                , precedence = Nothing
                                                , kind = KindTypeCase
                                                , isImported = False
                                                }
                                                    |> qualifiedAndUnqualified
                                        )
                               )
                    )

        valueHints =
            moduleDocs.values.values
                |> List.filter filter
                |> List.concatMap (valueToHints KindDefault)
    in
        tipeAliasHints
            ++ tipeAndTipeCaseHints
            ++ valueHints


getSuggestionsForImport : String -> Maybe ActiveFile -> ProjectFileContentsDict -> List ModuleDocs -> List ImportSuggestion
getSuggestionsForImport partial maybeActiveFile projectFileContentsDict projectPackageDocs =
    case maybeActiveFile of
        Just { projectDirectory } ->
            let
                suggestions =
                    (getProjectModuleDocs projectDirectory projectFileContentsDict ++ projectPackageDocs)
                        |> List.map
                            (\{ name, comment, sourcePath } ->
                                { name = name
                                , comment = comment
                                , sourcePath =
                                    if isPackageSourcePath sourcePath then
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

        Nothing ->
            []


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
                                                    hint.moduleName == "" && Helper.isCapitalized hint.name

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

                                                        Nothing ->
                                                            let
                                                                isHintInThisModule =
                                                                    hint.moduleName == moduleDocs.name
                                                            in
                                                                if isHintInThisModule then
                                                                    Just ( moduleDocs.sourcePath, False, False, [ hint.name ] )
                                                                else
                                                                    Nothing
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
                            Just _ ->
                                False

                            Nothing ->
                                True
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
                                            Just symbolName ->
                                                " " ++ symbolName

                                            Nothing ->
                                                ""
                                       )
                        in
                            compare (filterKey moduleA symbolA) (filterKey moduleB symbolB)
                    )

        defaultSymbolName =
            case maybeToken of
                Just token ->
                    case getModuleName token of
                        "" ->
                            Just (getLastName token)

                        moduleName ->
                            Just (getModuleName token)

                Nothing ->
                    Nothing
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
                Just moduleImport ->
                    case maybeSymbolName of
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

                        Nothing ->
                            fileContents.imports

                Nothing ->
                    let
                        importToAdd =
                            case maybeSymbolName of
                                Just symbolName ->
                                    { alias = Nothing, exposed = Some (Set.singleton symbolName) }

                                Nothing ->
                                    { alias = Nothing, exposed = None }
                    in
                        Dict.insert moduleName importToAdd fileContents.imports
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
                            Just alias ->
                                "import " ++ moduleName ++ " as " ++ alias

                            Nothing ->
                                "import " ++ moduleName

                    formatExposedSymbol token =
                        let
                            formatSymbol token =
                                if token /= ".." && Helper.isInfix token then
                                    "(" ++ token ++ ")"
                                else
                                    token

                            hints =
                                -- Get all hints, with all hints from target module in the front of the List.
                                getHintsForToken (Just token) tokens
                                    |> List.partition (.moduleName >> (==) moduleName)
                                    |> uncurry (++)
                        in
                            case List.head hints of
                                Just { caseTipe } ->
                                    case caseTipe of
                                        Just caseTipeString ->
                                            caseTipeString ++ "(" ++ formatSymbol token ++ ")"

                                        Nothing ->
                                            formatSymbol token

                                Nothing ->
                                    formatSymbol token

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
                                                        Just { exposed } ->
                                                            case exposed of
                                                                Some defaultExposedSymbols ->
                                                                    not (Set.member exposedSymbolName defaultExposedSymbols)

                                                                _ ->
                                                                    True

                                                        Nothing ->
                                                            True
                                                )
                                in
                                    " exposing (" ++ (Set.toList nonDefaultExposedSymbols |> List.map formatExposedSymbol |> String.join ", ") ++ ")"
                in
                    importPart ++ exposingPart
            )
        |> String.join "\n"


doConstructFromTypeAnnotation : String -> Model -> ( Model, Cmd Msg )
doConstructFromTypeAnnotation typeAnnotation model =
    ( model
    , constructFromTypeAnnotation typeAnnotation model.activeTokens
        |> fromTypeAnnotationConstructedCmd
    )


constructFromTypeAnnotation : String -> TokenDict -> String
constructFromTypeAnnotation typeAnnotation activeTokens =
    let
        parts =
            String.split " :" typeAnnotation

        tipeString =
            List.tail parts
                |> Maybe.withDefault []
                |> String.join " :"
    in
        let
            name =
                List.head parts
                    |> Maybe.withDefault typeAnnotation

            returnTipe =
                getReturnTipe tipeString

            parameterTipes =
                getTipeParts tipeString
                    |> Helper.dropLast

            argNames =
                getDefaultArgNames parameterTipes
        in
            name
                ++ (if List.length argNames > 0 then
                        " "
                    else
                        ""
                   )
                ++ (String.join " " argNames)
                ++ " =\n    "
                ++ getDefaultValueForType activeTokens returnTipe


getDefaultArgNames : List String -> List String
getDefaultArgNames args =
    let
        ( argNames, _ ) =
            args
                |> List.foldl
                    (\part ( args, argNameCounters ) ->
                        let
                            ( partName, updatedArgNameCounters ) =
                                getFunctionArgNameRecur part argNameCounters
                        in
                            ( args ++ [ partName ]
                            , updatedArgNameCounters
                            )
                    )
                    ( [], Dict.empty )
    in
        argNames


isPrimitiveTipe : TipeString -> Bool
isPrimitiveTipe tipeString =
    List.member tipeString
        primitiveTipes


primitiveTipes : List TipeString
primitiveTipes =
    [ "number"
    , "appendable"
    , "comparable"
      -- , "compappend"
    , "Int"
    , "Float"
    , "Bool"
    , "String"
    ]


getDefaultValueForType : TokenDict -> TipeString -> String
getDefaultValueForType activeTokens tipeString =
    getDefaultValueForTypeRecur activeTokens Nothing tipeString


getDefaultValueForTypeRecur : TokenDict -> Maybe TipeString -> TipeString -> String
getDefaultValueForTypeRecur activeTokens maybeRootTipeString tipeString =
    if String.trim tipeString == "" then
        "_"
    else if isRecordString tipeString then
        let
            fieldAndValues =
                getRecordTipeParts tipeString
                    |> List.map
                        (\( field, tipe ) ->
                            field ++ " = " ++ getDefaultValueForTypeRecur activeTokens maybeRootTipeString tipe
                        )
                    |> String.join ", "
        in
            "{ " ++ fieldAndValues ++ " }"
    else if isTupleString tipeString then
        let
            parts =
                getTupleParts tipeString
                    |> List.map
                        (\part ->
                            getDefaultValueForTypeRecur activeTokens maybeRootTipeString part
                        )
        in
            getTupleStringFromParts parts
    else if isFunctionTypeString tipeString then
        let
            arguments =
                getTipeParts tipeString
                    |> Helper.dropLast
                    |> getDefaultArgNames
                    |> String.join " "

            returnValue =
                getReturnTipe tipeString
                    |> getDefaultValueForTypeRecur activeTokens maybeRootTipeString
        in
            "\\" ++ arguments ++ " -> " ++ returnValue
    else
        case List.head (String.split " " tipeString) of
            Just headTipeString ->
                case headTipeString of
                    -- Primitives
                    "number" ->
                        "0"

                    "Int" ->
                        "0"

                    "Float" ->
                        "0.0"

                    "Bool" ->
                        "False"

                    "String" ->
                        "\"\""

                    -- Core
                    "List" ->
                        "[]"

                    "Array.Array" ->
                        "Array.empty"

                    "Cmd" ->
                        "Cmd.none"

                    "Color.Color" ->
                        "Color.black"

                    "Dict.Dict" ->
                        "Dict.empty"

                    "Maybe" ->
                        "Nothing"

                    "Set.Set" ->
                        "Set.empty"

                    "Sub" ->
                        "Sub.none"

                    _ ->
                        case getHintsForToken (Just headTipeString) activeTokens |> List.head of
                            Just hint ->
                                -- Avoid infinite recursion.
                                if
                                    (hint.kind /= KindType)
                                        && (hint.tipe /= headTipeString)
                                        && (hint.kind /= KindTypeAlias || (hint.kind == KindTypeAlias && List.length hint.args == 0))
                                    -- TODO: ^ Make it work with aliases with type variables (e.g. `type alias AliasedType a b = ( a, b )`).
                                then
                                    case maybeRootTipeString of
                                        Just rootTipeString ->
                                            if hint.name /= rootTipeString then
                                                getDefaultValueForTypeRecur activeTokens (Just hint.name) hint.tipe
                                            else
                                                "_"

                                        Nothing ->
                                            getDefaultValueForTypeRecur activeTokens (Just hint.name) hint.tipe
                                else if hint.kind == KindType then
                                    case List.head hint.cases of
                                        Just tipeCase ->
                                            let
                                                ( _, annotatedTipeArgs ) =
                                                    typeConstructorToNameAndArgs tipeString

                                                alignedArgs =
                                                    getTipeCaseAlignedArgTipes hint.args annotatedTipeArgs tipeCase.args
                                            in
                                                tipeCase.name
                                                    ++ (if List.length alignedArgs > 0 then
                                                            " "
                                                        else
                                                            ""
                                                       )
                                                    ++ String.join " " (List.map (getDefaultValueForTypeRecur activeTokens Nothing) alignedArgs)

                                        Nothing ->
                                            "_"
                                else
                                    "_"

                            Nothing ->
                                "_"

            Nothing ->
                "_"


doConstructCaseOf : Token -> Model -> ( Model, Cmd Msg )
doConstructCaseOf token model =
    ( model
    , constructCaseOf token model.activeTokens
        |> caseOfConstructedCmd
    )


doConstructDefaultValueForType : Token -> Model -> ( Model, Cmd Msg )
doConstructDefaultValueForType token model =
    ( model
    , constructDefaultValueForType token model.activeTokens
        |> defaultValueForTypeConstructedCmd
    )


doConstructDefaultArguments : Token -> Model -> ( Model, Cmd Msg )
doConstructDefaultArguments token model =
    ( model
    , constructDefaultArguments token model.activeTokens
        |> defaultArgumentsConstructedCmd
    )


typeConstructorToNameAndArgs : TipeString -> ( String, List String )
typeConstructorToNameAndArgs tipeString =
    let
        tipeParts =
            getArgsParts tipeString

        tipeName =
            tipeParts
                |> List.head
                |> Maybe.withDefault ""

        tipeArgs =
            tipeParts
                |> List.tail
                |> Maybe.withDefault []
    in
        ( tipeName, tipeArgs )


constructCaseOf : Token -> TokenDict -> Maybe String
constructCaseOf token activeTokens =
    case getHintsForToken (Just token) activeTokens |> List.head of
        Just tokenHint ->
            let
                ( tokenTipeName, tokenTipeArgs ) =
                    let
                        ( name, args ) =
                            typeConstructorToNameAndArgs tokenHint.tipe
                    in
                        case List.head args of
                            Just "->" ->
                                ( getReturnTipe tokenHint.tipe
                                , []
                                )

                            Just _ ->
                                ( name, args )

                            Nothing ->
                                ( name, args )

                ( tipeCases, tipeArgs ) =
                    case tokenTipeName of
                        "Bool" ->
                            ( [ { name = "True", args = [] }
                              , { name = "False", args = [] }
                              ]
                            , []
                            )

                        _ ->
                            if List.member tokenTipeName [ "Int", "Float", "number" ] then
                                ( [ { name = "|", args = [] }
                                  , { name = "_", args = [] }
                                  ]
                                , []
                                )
                            else if List.member tokenTipeName [ "String" ] then
                                ( [ { name = "\"|\"", args = [] }
                                  , { name = "_", args = [] }
                                  ]
                                , []
                                )
                            else
                                case
                                    getHintsForToken (Just tokenTipeName) activeTokens
                                        |> List.filter (\hint -> List.length hint.cases > 0)
                                        |> List.head
                                of
                                    Just tipeHint ->
                                        ( tipeHint.cases, tipeHint.args )

                                    Nothing ->
                                        ( [], [] )
            in
                if List.length tipeCases > 0 then
                    tipeCases
                        |> List.map
                            (\tipeCase ->
                                let
                                    alignedArgs =
                                        getTipeCaseAlignedArgTipes tipeArgs tokenTipeArgs tipeCase.args
                                in
                                    tipeCase.name
                                        ++ (if List.length alignedArgs > 0 then
                                                " "
                                            else
                                                ""
                                           )
                                        ++ String.join " " (getDefaultArgNames alignedArgs)
                                        ++ " ->\n    |"
                             -- Vertical bars are placeholders for the tab stops.
                            )
                        |> String.join "\n\n"
                        |> Just
                else
                    Nothing

        Nothing ->
            Nothing


constructDefaultValueForType : Token -> TokenDict -> Maybe String
constructDefaultValueForType token activeTokens =
    if
        -- isPrimitiveTipe token
        --     ||
        (getHintsForToken (Just token) activeTokens
            |> List.filter (\hint -> hint.kind == KindType || hint.kind == KindTypeAlias)
            |> List.length
        )
            > 0
    then
        getDefaultValueForType activeTokens token
            |> Just
    else
        Nothing


constructDefaultArguments : Token -> TokenDict -> Maybe (List String)
constructDefaultArguments token activeTokens =
    case getHintsForToken (Just token) activeTokens |> List.head of
        Just hint ->
            let
                parts =
                    if isRecordString hint.tipe then
                        getRecordTipeFieldTipes hint.tipe
                    else
                        -- Remove return type.
                        getTipeParts hint.tipe
                            |> Helper.dropLast
            in
                parts
                    |> List.map
                        (\tipeString ->
                            let
                                value =
                                    getDefaultValueForType activeTokens tipeString
                            in
                                if
                                    String.contains " " value
                                        && not (isRecordString value)
                                        && not (isTupleString value)
                                then
                                    "(" ++ value ++ ")"
                                else
                                    value
                        )
                    |> Just

        Nothing ->
            Nothing


getTipeCaseAlignedArgTipes : List String -> List String -> List String -> List String
getTipeCaseAlignedArgTipes tipeArgs tipeAnnotationArgs tipeCaseArgs =
    let
        tipeArgsDict =
            List.map2 (,) tipeArgs tipeAnnotationArgs
                |> Dict.fromList
    in
        tipeCaseArgs
            |> List.map
                (\argTipe ->
                    case Dict.get argTipe tipeArgsDict of
                        Just a ->
                            a

                        Nothing ->
                            argTipe
                )


getFunctionArgNameRecur : String -> Dict.Dict String Int -> ( String, Dict.Dict String Int )
getFunctionArgNameRecur argString argNameCounters =
    let
        updatePartNameAndArgNameCounters partName2 argNameCounters2 =
            case Dict.get partName2 argNameCounters2 of
                Just count ->
                    ( partName2 ++ (toString (count + 1))
                    , Dict.update partName2 (always <| Just (count + 1)) argNameCounters2
                    )

                Nothing ->
                    ( partName2
                    , Dict.insert partName2 1 argNameCounters2
                    )
    in
        if isRecordString argString then
            updatePartNameAndArgNameCounters "record" argNameCounters
        else if isTupleString argString then
            let
                ( partNames, updateArgNameCounters ) =
                    getTupleParts argString
                        |> List.foldl
                            (\part ( partNames, argNameCounters2 ) ->
                                let
                                    ( partName, updateArgNameCounters2 ) =
                                        getFunctionArgNameRecur part argNameCounters2
                                in
                                    ( partNames ++ [ partName ]
                                    , updateArgNameCounters2
                                    )
                            )
                            ( [], argNameCounters )
            in
                ( getTupleStringFromParts partNames
                , updateArgNameCounters
                )
        else
            updatePartNameAndArgNameCounters (tipeToVar argString) argNameCounters


doGetAliasesOfType : Token -> Model -> ( Model, Cmd Msg )
doGetAliasesOfType token model =
    ( model
    , getAliasesOfType model.activeTokens "" token
        |> aliasesOfTypeReceivedCmd
    )


tipeToVar : TipeString -> String
tipeToVar tipeString =
    Regex.split Regex.All argSeparatorRegex tipeString
        |> List.reverse
        |> String.concat
        |> Helper.decapitalize


argSeparatorRegex : Regex.Regex
argSeparatorRegex =
    Regex.regex "\\s+|\\(|\\)|\\.|,|-|>"


getTupleStringFromParts : List String -> String
getTupleStringFromParts parts =
    case List.length parts of
        0 ->
            "()"

        1 ->
            String.concat parts

        _ ->
            "( " ++ (String.join ", " parts) ++ " )"


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


getImportsPlusActiveModuleForActiveFile : Maybe ActiveFile -> FileContentsDict -> ImportDict
getImportsPlusActiveModuleForActiveFile maybeActiveFile fileContentsDict =
    getImportsPlusActiveModule (getActiveFileContents maybeActiveFile fileContentsDict)


getImportsPlusActiveModule : FileContents -> ImportDict
getImportsPlusActiveModule fileContents =
    Dict.update fileContents.moduleDocs.name (always <| Just { alias = Nothing, exposed = All }) fileContents.imports


getActiveFileContents : Maybe ActiveFile -> FileContentsDict -> FileContents
getActiveFileContents maybeActiveFile fileContentsDict =
    case maybeActiveFile of
        Just { filePath } ->
            case Dict.get filePath fileContentsDict of
                Just fileContents ->
                    fileContents

                Nothing ->
                    emptyFileContents

        Nothing ->
            emptyFileContents


type alias ModuleDocs =
    { sourcePath : SourcePath
    , name : String
    , values : Values
    , comment : String
    }


type alias SourcePath =
    String


type alias Values =
    { aliases : List Value
    , tipes : List Tipe
    , values : List Value
    }


type alias Tipe =
    { name : String
    , comment : String
    , tipe : TipeString
    , args : List String
    , cases : List TipeCase
    }


type alias TipeString =
    String


type alias TipeCase =
    { name : String
    , args : List String
    }


type alias Value =
    { name : String
    , comment : String
    , tipe : String
    , args : Maybe (List String)
    , associativity : Maybe Associativity
    , precedence : Maybe Int
    }


type Associativity
    = LeftAssociative
    | RightAssociative
    | NonAssociative


type alias EncodedModuleDocs =
    { sourcePath : SourcePath
    , name : String
    , values : EncodedValues
    , comment : String
    }


type alias EncodedValues =
    { aliases : List EncodedValue
    , tipes : List Tipe
    , values : List EncodedValue
    }


type alias EncodedValue =
    { name : String
    , comment : String
    , tipe : String
    , args : Maybe (List String)
    , associativity : Maybe String
    , precedence : Maybe Int
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
        if isPackageSourcePath sourcePath then
            sourcePath ++ dotToHyphen name ++ anchor
        else
            sourcePath


isPackageSourcePath : String -> Bool
isPackageSourcePath sourcePath =
    String.startsWith packageDocsPrefix sourcePath


isProjectSourcePath : String -> Bool
isProjectSourcePath sourcePath =
    not (isPackageSourcePath sourcePath)


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


downloadPackageDocsList : List Dependency -> Task.Task Http.Error (List (Result Http.Error ( String, List ModuleDocs )))
downloadPackageDocsList dependencies =
    dependencies
        |> List.map downloadPackageDocs
        |> optionalTaskSequence


optionalTaskSequence : List (Task.Task error a) -> Task.Task error (List (Result error a))
optionalTaskSequence list =
    -- Modified from `TheSeamau5/elm-task-extra`'s `optional`.
    case list of
        [] ->
            Task.succeed []

        task :: tasks ->
            task
                |> Task.andThen (\value -> Task.map ((::) (Ok value)) (optionalTaskSequence tasks))
                |> Task.onError (\value -> Task.map ((::) (Err value)) (optionalTaskSequence tasks))


downloadPackageDocs : Dependency -> Task.Task Http.Error ( String, List ModuleDocs )
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
                    ( jsonString
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


decodeAssociativity : Maybe String -> Maybe Associativity
decodeAssociativity maybeString =
    case maybeString of
        Just "left" ->
            Just LeftAssociative

        Just "right" ->
            Just RightAssociative

        Just "non" ->
            Just NonAssociative

        _ ->
            Nothing


decodeModuleDocs : SourcePath -> Decode.Decoder ModuleDocs
decodeModuleDocs sourcePath =
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
                (Decode.field "cases"
                    (Decode.list
                        (Decode.map2 TipeCase (Decode.index 0 Decode.string) (Decode.index 1 (Decode.list Decode.string)))
                    )
                )

        value =
            Decode.map6 Value
                name
                comment
                (Decode.field "type" Decode.string)
                (Decode.maybe args)
                (Decode.field "associativity" Decode.string |> Decode.maybe |> Decode.map decodeAssociativity)
                (Decode.field "precedence" Decode.int |> Decode.maybe)

        values =
            Decode.map3 Values
                (Decode.field "aliases" (Decode.list value))
                (Decode.field "types" (Decode.list tipe))
                (Decode.field "values" (Decode.list value))
    in
        Decode.map3 (ModuleDocs sourcePath)
            name
            values
            comment


type alias TokenDict =
    Dict.Dict Token (List Hint)


type SymbolKind
    = KindDefault
    | KindTypeAlias
    | KindType
    | KindTypeCase
    | KindModule
    | KindVariable


type alias Symbol =
    { fullName : String
    , sourcePath : SourcePath
    , caseTipe : Maybe String
    , kind : SymbolKind
    }


type alias EncodedSymbol =
    { fullName : String
    , sourcePath : SourcePath
    , caseTipe : Maybe String
    , kind : String
    }


encodeSymbol : Symbol -> EncodedSymbol
encodeSymbol symbol =
    { fullName = symbol.fullName
    , sourcePath = symbol.sourcePath
    , caseTipe = symbol.caseTipe
    , kind = symbolKindToString symbol.kind
    }


type alias Hint =
    { name : String
    , moduleName : String
    , sourcePath : SourcePath
    , comment : String
    , tipe : TipeString
    , args : List String
    , caseTipe : Maybe String
    , cases : List TipeCase
    , associativity : Maybe Associativity
    , precedence : Maybe Int
    , kind : SymbolKind
    , isImported : Bool
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
    , cases = []
    , associativity = Nothing
    , precedence = Nothing
    , kind = KindDefault
    , isImported = True
    }


type alias EncodedHint =
    { name : String
    , moduleName : String
    , sourcePath : SourcePath
    , comment : String
    , tipe : String
    , args : List String
    , caseTipe : Maybe String
    , cases : List TipeCase
    , associativity : Maybe String
    , precedence : Maybe Int
    , kind : String
    , isImported : Bool
    , aliasesOfTipe : List TipeString
    }


encodeHint : Bool -> TokenDict -> Hint -> EncodedHint
encodeHint showAliasesOfType tokens hint =
    { name = hint.name
    , moduleName = hint.moduleName
    , sourcePath = hint.sourcePath
    , comment = hint.comment
    , tipe = hint.tipe
    , args = hint.args
    , caseTipe = hint.caseTipe
    , cases = hint.cases
    , associativity = encodeAssociativity hint.associativity
    , precedence = hint.precedence
    , kind = symbolKindToString hint.kind
    , isImported = hint.isImported
    , aliasesOfTipe =
        if showAliasesOfType then
            getAliasesOfType tokens hint.name hint.tipe
        else
            []
    }


encodeAssociativity : Maybe Associativity -> Maybe String
encodeAssociativity associativity =
    case associativity of
        Just LeftAssociative ->
            Just "left"

        Just RightAssociative ->
            Just "right"

        Just NonAssociative ->
            Just "non"

        _ ->
            Nothing


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

        KindVariable ->
            "variable"


type alias ImportSuggestion =
    { name : String
    , comment : String
    , sourcePath : SourcePath
    }


getActiveTokens : Maybe ActiveFile -> Maybe ActiveTopLevel -> ProjectFileContentsDict -> ProjectDependencies -> List ModuleDocs -> TokenDict
getActiveTokens maybeActiveFile maybeActiveTopLevel projectFileContentsDict projectDependencies packageDocs =
    case maybeActiveFile of
        Just { projectDirectory, filePath } ->
            let
                projectPackageDocs =
                    getProjectPackageDocs maybeActiveFile projectDependencies packageDocs

                fileContentsDict =
                    getFileContentsOfProject projectDirectory projectFileContentsDict

                getHints moduleDocs =
                    Maybe.map
                        (getFilteredHints filePath moduleDocs)
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
                    case maybeActiveTopLevel of
                        Just activeTopLevel ->
                            List.concatMap
                                (topLevelArgToHints activeTopLevel
                                    filePath
                                    ( maybeActiveFile, projectFileContentsDict, projectDependencies, packageDocs )
                                    topLevelTokens
                                )
                                topLevelArgTipePairs

                        Nothing ->
                            []

                activeTokens =
                    (argHints
                        ++ (defaultSuggestions
                                |> List.filter (\hint -> hint.comment /= "")
                                |> List.map (\hint -> ( hint.name, hint ))
                           )
                    )
                        |> List.foldl insert topLevelTokens

                computeVariableSourcePaths =
                    Dict.map
                        (\_ hints ->
                            hints
                                |> List.map
                                    (\hint ->
                                        if hint.kind == KindVariable then
                                            { hint
                                                | sourcePath =
                                                    getSourcePathOfRecordFieldToken hint.name
                                                        filePath
                                                        maybeActiveTopLevel
                                                        ( maybeActiveFile, projectFileContentsDict, projectDependencies, packageDocs )
                                                        activeTokens
                                            }
                                        else
                                            hint
                                    )
                        )
            in
                activeTokens
                    |> computeVariableSourcePaths

        Nothing ->
            Dict.empty


filePathSeparator : String
filePathSeparator =
    " > "


getSourcePathOfRecordFieldToken : String -> FilePath -> Maybe ActiveTopLevel -> ( Maybe ActiveFile, ProjectFileContentsDict, ProjectDependencies, List ModuleDocs ) -> TokenDict -> SourcePath
getSourcePathOfRecordFieldToken name filePath maybeActiveTopLevel ( maybeActiveFile, projectFileContentsDict, projectDependencies, packageDocs ) tokens =
    let
        parts =
            String.split "." name
    in
        if List.length parts == 1 then
            case maybeActiveTopLevel of
                Just activeTopLevel ->
                    filePath ++ filePathSeparator ++ activeTopLevel

                Nothing ->
                    ""
        else
            case List.head parts of
                Just parentName ->
                    getSourcePathOfRecordFieldTokenRecur
                        parentName
                        parentName
                        filePath
                        (List.tail parts |> Maybe.withDefault [])
                        ( maybeActiveFile, projectFileContentsDict, projectDependencies, packageDocs )
                        tokens
                        tokens

                Nothing ->
                    ""


getSourcePathOfRecordFieldTokenRecur : String -> String -> SourcePath -> List String -> ( Maybe ActiveFile, ProjectFileContentsDict, ProjectDependencies, List ModuleDocs ) -> TokenDict -> TokenDict -> String
getSourcePathOfRecordFieldTokenRecur parentPartName parentName parentSourcePath tailParts ( maybeActiveFile, projectFileContentsDict, projectDependencies, packageDocs ) rootTokens tokens =
    case List.head tailParts of
        Just headName ->
            let
                doDefault parentHint =
                    if parentHint.sourcePath == "" then
                        parentSourcePath ++ filePathSeparator ++ parentHint.tipe
                    else
                        parentHint.sourcePath ++ filePathSeparator ++ parentHint.tipe

                newPrefixSourcePath =
                    case getHintsForToken (Just parentName) tokens |> List.head of
                        Just parentHint ->
                            if isRecordString parentHint.tipe then
                                parentSourcePath ++ filePathSeparator ++ parentPartName
                            else
                                case getHintsForToken (Just parentHint.tipe) tokens |> List.head of
                                    Just tipeHint ->
                                        if tipeHint.sourcePath /= parentSourcePath then
                                            tipeHint.sourcePath ++ filePathSeparator ++ tipeHint.name
                                        else
                                            doDefault parentHint

                                    Nothing ->
                                        doDefault parentHint

                        Nothing ->
                            case getHintsForToken (Just parentName) rootTokens |> List.head of
                                Just parentHint ->
                                    case getHintsForToken (Just parentHint.tipe) tokens |> List.head of
                                        Just tipeHint ->
                                            if tipeHint.sourcePath /= parentSourcePath then
                                                tipeHint.sourcePath ++ filePathSeparator ++ tipeHint.name
                                            else
                                                doDefault parentHint

                                        Nothing ->
                                            doDefault parentHint

                                Nothing ->
                                    parentSourcePath

                ( updatedActiveFile, updatedTokens ) =
                    case ( String.split filePathSeparator parentSourcePath |> List.head, String.split filePathSeparator newPrefixSourcePath |> List.head ) of
                        ( Just parentFilePath, Just prefixFilePath ) ->
                            let
                                maybeNewActiveFile =
                                    case maybeActiveFile of
                                        Just activeFile ->
                                            Just { activeFile | filePath = prefixFilePath }

                                        Nothing ->
                                            Nothing
                            in
                                case maybeNewActiveFile of
                                    Just newActiveFile ->
                                        if parentFilePath /= prefixFilePath && isProjectSourcePath prefixFilePath then
                                            ( maybeNewActiveFile
                                            , getActiveTokens maybeNewActiveFile Nothing projectFileContentsDict projectDependencies packageDocs
                                            )
                                        else
                                            ( maybeActiveFile, tokens )

                                    Nothing ->
                                        ( maybeActiveFile, tokens )

                        _ ->
                            ( maybeActiveFile, tokens )
            in
                getSourcePathOfRecordFieldTokenRecur
                    headName
                    (parentName ++ "." ++ headName)
                    newPrefixSourcePath
                    (List.tail tailParts |> Maybe.withDefault [])
                    ( updatedActiveFile, projectFileContentsDict, projectDependencies, packageDocs )
                    rootTokens
                    updatedTokens

        Nothing ->
            parentSourcePath


{-| Example: getArgsParts "a b c" == [ "a", "b", "c" ]
-}
getArgsParts : String -> List String
getArgsParts argsString =
    case argsString of
        "" ->
            []

        argsString ->
            getArgsPartsRecur argsString "" [] ( 0, 0 )


getArgsPartsRecur : String -> String -> List String -> ( Int, Int ) -> List String
getArgsPartsRecur str acc parts ( openParentheses, openBraces ) =
    case str of
        "" ->
            parts ++ [ String.trim acc ]

        _ ->
            let
                ( thisChar, thisRest ) =
                    getCharAndRest str
            in
                if openParentheses == 0 && openBraces == 0 && thisChar == " " then
                    getArgsPartsRecur thisRest "" (parts ++ [ String.trim acc ]) ( 0, 0 )
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
                        if updatedOpenParentheses < 0 || updatedOpenBraces < 0 then
                            []
                        else
                            getArgsPartsRecur thisRest (acc ++ thisChar) parts ( updatedOpenParentheses, updatedOpenBraces )


getReturnTipe : TipeString -> String
getReturnTipe tipeString =
    getTipeParts tipeString
        |> Helper.last
        |> Maybe.withDefault ""


{-| Example: getTipeParts "Int -> Int -> Int" == [ "Int", "Int" ]
-}
getTipeParts : TipeString -> List String
getTipeParts tipeString =
    case tipeString of
        "" ->
            []

        tipeString ->
            getTipePartsRecur tipeString "" [] ( 0, 0 )


getTipePartsRecur : String -> String -> List String -> ( Int, Int ) -> List String
getTipePartsRecur str acc parts ( openParentheses, openBraces ) =
    if str == "" then
        parts ++ [ String.trim acc ]
    else
        let
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
                    if updatedOpenParentheses < 0 || updatedOpenBraces < 0 then
                        []
                    else
                        getTipePartsRecur thisRest (acc ++ thisChar) parts ( updatedOpenParentheses, updatedOpenBraces )


getCharAndRest : String -> ( String, String )
getCharAndRest str =
    case String.uncons str of
        Just ( ch, rest ) ->
            ( String.fromChar ch, rest )

        Nothing ->
            ( "", "" )


{-| Example: getTupleParts "( Int, String )" == [ "Int", "String" ]
-}
getTupleParts : String -> List String
getTupleParts tupleString =
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
                    getCharAndRest str
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
                        if updatedOpenParentheses < 0 || updatedOpenBraces < 0 then
                            []
                        else
                            getTuplePartsRecur thisRest (acc ++ thisChar) parts ( updatedOpenParentheses, updatedOpenBraces )


{-| Example: getRecordArgParts "{ a, b }" == [ "a", "b" ]
-}
getRecordArgParts : String -> List String
getRecordArgParts recordString =
    -- Remove open and close braces.
    case String.slice 1 -1 recordString of
        "" ->
            []

        recordString ->
            String.split "," recordString
                |> List.map String.trim


{-| Example: getRecordTipeParts "{ a : Int, b : String }" == [ ("a", "Int"), ("b", "String") ]
-}
getRecordTipeParts : TipeString -> List ( String, String )
getRecordTipeParts tipeString =
    -- Remove open and close braces.
    case String.slice 1 -1 tipeString of
        "" ->
            []

        tipeString ->
            getRecordTipePartsRecur tipeString ( "", "" ) False [] ( 0, 0 )


getRecordTipePartsRecur : String -> ( String, String ) -> Bool -> List ( String, String ) -> ( Int, Int ) -> List ( String, String )
getRecordTipePartsRecur str ( fieldAcc, tipeAcc ) lookingForTipe parts ( openParentheses, openBraces ) =
    case str of
        "" ->
            parts ++ [ ( String.trim fieldAcc, String.trim tipeAcc ) ]

        _ ->
            let
                ( thisChar, thisRest ) =
                    getCharAndRest str
            in
                if openParentheses == 0 && openBraces == 0 && thisChar == "," then
                    getRecordTipePartsRecur thisRest ( "", "" ) False (parts ++ [ ( String.trim fieldAcc, String.trim tipeAcc ) ]) ( 0, 0 )
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
                        if updatedOpenParentheses < 0 || updatedOpenBraces < 0 then
                            []
                        else
                            getRecordTipePartsRecur thisRest ( updatedFieldAcc, updatedTipeAcc ) lookingForTipe parts ( updatedOpenParentheses, updatedOpenBraces )


{-| Example: getRecordTipeFieldNames "{ a : Int, b : String }" == [ "a", "b" ]
-}
getRecordTipeFieldNames : TipeString -> List String
getRecordTipeFieldNames tipeString =
    getRecordTipeParts tipeString
        |> List.map Tuple.first


{-| Example: getRecordTipeFieldTipes "{ a : Int, b : String }" == [ "Int", "String" ]
-}
getRecordTipeFieldTipes : TipeString -> List String
getRecordTipeFieldTipes tipeString =
    getRecordTipeParts tipeString
        |> List.map Tuple.second


tipeToValue : Tipe -> Value
tipeToValue { name, comment, tipe, args } =
    { name = name
    , comment = comment
    , tipe = tipe
    , args = Just args
    , associativity = Nothing
    , precedence = Nothing
    }


valueToHintable : Value -> ( Value, List TipeCase )
valueToHintable value =
    ( value, [] )


tipeToHintable : Tipe -> ( Value, List TipeCase )
tipeToHintable tipe =
    ( tipeToValue tipe
    , tipe.cases
    )


getFilteredHints : FilePath -> ModuleDocs -> Import -> List ( String, Hint )
getFilteredHints activeFilePath moduleDocs importData =
    List.concatMap (unionTagsToHints moduleDocs importData activeFilePath) moduleDocs.values.tipes
        ++ List.concatMap (nameToHints moduleDocs importData activeFilePath KindTypeAlias) (List.map valueToHintable moduleDocs.values.aliases)
        ++ List.concatMap (nameToHints moduleDocs importData activeFilePath KindType) (List.map tipeToHintable moduleDocs.values.tipes)
        ++ List.concatMap (nameToHints moduleDocs importData activeFilePath KindDefault) (List.map valueToHintable moduleDocs.values.values)
        ++ moduleToHints moduleDocs importData


topLevelArgToHints : ActiveTopLevel -> SourcePath -> ( Maybe ActiveFile, ProjectFileContentsDict, ProjectDependencies, List ModuleDocs ) -> TokenDict -> ( String, TipeString ) -> List ( String, Hint )
topLevelArgToHints activeTopLevel parentSourcePath ( maybeActiveFile, projectFileContentsDict, projectDependencies, packageDocs ) topLevelTokens ( name, tipeString ) =
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
                    , cases = []
                    , associativity = Nothing
                    , precedence = Nothing
                    , kind = KindVariable
                    , isImported = True
                    }
            in
                [ ( name, hint ) ]

        tipes =
            let
                getRecordFields tipeString =
                    getRecordArgParts name
                        |> List.filterMap
                            (\field ->
                                Dict.get field (getRecordTipeParts tipeString |> Dict.fromList)
                                    |> Maybe.map
                                        (\tipeString ->
                                            getRecordFieldTokensRecur field
                                                tipeString
                                                parentSourcePath
                                                ( maybeActiveFile, projectFileContentsDict, projectDependencies, packageDocs )
                                                topLevelTokens
                                                True
                                                Nothing
                                                Set.empty
                                        )
                            )
                        |> List.concat
            in
                case ( isRecordString name, isRecordString tipeString ) of
                    ( True, True ) ->
                        getRecordFields tipeString

                    ( True, False ) ->
                        case getHintsForToken (Just tipeString) topLevelTokens |> List.head of
                            Just { tipe } ->
                                getRecordFields tipe

                            Nothing ->
                                []

                    ( False, _ ) ->
                        getRecordFieldTokensRecur name
                            tipeString
                            parentSourcePath
                            ( maybeActiveFile, projectFileContentsDict, projectDependencies, packageDocs )
                            topLevelTokens
                            True
                            Nothing
                            Set.empty
    in
        tipes
            |> List.concatMap getHint


getRecordFieldTokensRecur : String -> TipeString -> SourcePath -> ( Maybe ActiveFile, ProjectFileContentsDict, ProjectDependencies, List ModuleDocs ) -> TokenDict -> Bool -> Maybe String -> Set.Set String -> List ( String, TipeString )
getRecordFieldTokensRecur name tipeString parentSourcePath ( maybeActiveFile, projectFileContentsDict, projectDependencies, packageDocs ) topLevelTokens shouldAddSelf maybeRootTipeString visitedSourcePaths =
    (if shouldAddSelf then
        [ ( name, tipeString ) ]
     else
        []
    )
        |> List.append
            (if isRecordString name then
                let
                    getRecordFields tipeString2 =
                        getRecordArgParts name
                            |> List.filterMap
                                (\field ->
                                    Dict.get field (getRecordTipeParts tipeString2 |> Dict.fromList)
                                        |> Maybe.map
                                            (\tipeString ->
                                                getRecordFieldTokensRecur field
                                                    tipeString
                                                    parentSourcePath
                                                    ( maybeActiveFile, projectFileContentsDict, projectDependencies, packageDocs )
                                                    topLevelTokens
                                                    True
                                                    maybeRootTipeString
                                                    visitedSourcePaths
                                            )
                                )
                            |> List.concat
                in
                    if isRecordString tipeString then
                        getRecordFields tipeString
                    else
                        case getHintsForToken (Just tipeString) topLevelTokens |> List.head of
                            Just { tipe } ->
                                getRecordFields tipe

                            Nothing ->
                                []
             else if isRecordString tipeString then
                getRecordTipeParts tipeString
                    |> List.concatMap
                        (\( field, tipeString ) ->
                            getRecordFieldTokensRecur (name ++ "." ++ field)
                                tipeString
                                parentSourcePath
                                ( maybeActiveFile, projectFileContentsDict, projectDependencies, packageDocs )
                                topLevelTokens
                                True
                                maybeRootTipeString
                                visitedSourcePaths
                        )
             else if isTupleString name && isTupleString tipeString then
                List.map2 (,) (getTupleParts name) (getTupleParts tipeString)
                    |> List.map
                        (\( name, tipeString ) ->
                            getRecordFieldTokensRecur name
                                tipeString
                                parentSourcePath
                                ( maybeActiveFile, projectFileContentsDict, projectDependencies, packageDocs )
                                topLevelTokens
                                True
                                maybeRootTipeString
                                visitedSourcePaths
                        )
                    |> List.concat
             else
                case getHintsForToken (Just tipeString) topLevelTokens |> List.head of
                    Just hint ->
                        -- Avoid infinite recursion.
                        if hint.kind /= KindType && hint.tipe /= tipeString && not (Set.member hint.sourcePath visitedSourcePaths) then
                            let
                                maybeNewActiveFile =
                                    case maybeActiveFile of
                                        Just activeFile ->
                                            Just { activeFile | filePath = hint.sourcePath }

                                        Nothing ->
                                            Nothing

                                ( newParentSourcePath, newTokens ) =
                                    ( hint.sourcePath
                                    , if hint.sourcePath /= parentSourcePath && isProjectSourcePath hint.sourcePath then
                                        getActiveTokens maybeNewActiveFile Nothing projectFileContentsDict projectDependencies packageDocs
                                      else
                                        topLevelTokens
                                    )

                                updatedVisitedSourcePaths =
                                    Set.insert
                                        hint.sourcePath
                                        visitedSourcePaths
                            in
                                case maybeRootTipeString of
                                    Just rootTipeString ->
                                        if hint.name /= rootTipeString then
                                            getRecordFieldTokensRecur name
                                                hint.tipe
                                                newParentSourcePath
                                                ( maybeNewActiveFile, projectFileContentsDict, projectDependencies, packageDocs )
                                                newTokens
                                                False
                                                (Just hint.name)
                                                updatedVisitedSourcePaths
                                        else
                                            []

                                    Nothing ->
                                        getRecordFieldTokensRecur name
                                            hint.tipe
                                            newParentSourcePath
                                            ( maybeNewActiveFile, projectFileContentsDict, projectDependencies, packageDocs )
                                            newTokens
                                            False
                                            (Just hint.name)
                                            updatedVisitedSourcePaths
                        else
                            []

                    Nothing ->
                        []
            )


isRecordString : String -> Bool
isRecordString =
    String.startsWith "{"


isTupleString : String -> Bool
isTupleString =
    String.startsWith "("


isFunctionTypeString : String -> Bool
isFunctionTypeString =
    String.contains "->"


getTipeCaseTypeAnnotation : TipeCase -> Tipe -> String
getTipeCaseTypeAnnotation tipeCase tipe =
    tipeCase.args
        ++ [ if List.length tipe.args > 0 then
                tipe.tipe ++ " " ++ String.join " " tipe.args
             else
                tipe.tipe
           ]
        |> String.join " -> "


unionTagsToHints : ModuleDocs -> Import -> FilePath -> Tipe -> List ( String, Hint )
unionTagsToHints moduleDocs { alias, exposed } activeFilePath tipe =
    let
        addHints tipeCase hints =
            let
                tag =
                    tipeCase.name

                hint =
                    let
                        hintTipe =
                            getTipeCaseTypeAnnotation tipeCase tipe
                    in
                        { name = tag
                        , moduleName = moduleDocs.name
                        , sourcePath = formatSourcePath moduleDocs tipe.name
                        , comment = tipe.comment
                        , tipe = hintTipe
                        , args = tipeCase.args
                        , caseTipe = Just tipe.name
                        , cases = []
                        , associativity = Nothing
                        , precedence = Nothing
                        , kind = KindTypeCase
                        , isImported = True
                        }

                moduleLocalName =
                    getModuleLocalName moduleDocs.name alias tag

                isInActiveModule =
                    activeFilePath == hint.sourcePath
            in
                hints
                    ++ (if isInActiveModule then
                            [ ( tag, hint ) ]
                        else if isExposed tag exposed || isExposed tipe.name exposed then
                            [ ( moduleLocalName, hint ), ( tag, hint ) ]
                        else
                            [ ( moduleLocalName, hint ) ]
                       )
    in
        List.foldl addHints [] tipe.cases


nameToHints : ModuleDocs -> Import -> FilePath -> SymbolKind -> ( Value, List TipeCase ) -> List ( String, Hint )
nameToHints moduleDocs { alias, exposed } activeFilePath kind ( { name, comment, tipe, args, associativity, precedence }, tipeCases ) =
    let
        hint =
            { name = name
            , moduleName = moduleDocs.name
            , sourcePath = formatSourcePath moduleDocs name
            , comment = comment
            , tipe = tipe
            , args =
                case args of
                    Just args ->
                        args

                    Nothing ->
                        []
            , caseTipe = Nothing
            , cases = tipeCases
            , associativity = associativity
            , precedence = precedence
            , kind = kind
            , isImported = True
            }

        moduleLocalName =
            getModuleLocalName moduleDocs.name alias name

        isInActiveModule =
            activeFilePath == hint.sourcePath
    in
        if isInActiveModule then
            [ ( name, hint ) ]
        else if isExposed name exposed then
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
            , cases = []
            , associativity = Nothing
            , precedence = Nothing
            , kind = KindModule
            , isImported = True
            }
    in
        case alias of
            Just alias ->
                [ ( name, hint ), ( alias, hint ) ]

            Nothing ->
                [ ( name, hint ) ]


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
    case alias of
        Just alias ->
            alias ++ "." ++ name

        Nothing ->
            moduleName ++ "." ++ name


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
                Just [ ".." ] ->
                    All

                Just vars ->
                    Some (Set.fromList vars)

                Nothing ->
                    None
    in
        ( name, Import alias exposedSet )


(=>) : a -> Exposed -> ( a, Import )
(=>) name exposed =
    ( name, Import Nothing exposed )


defaultImports : ImportDict
defaultImports =
    Dict.fromList
        [ "Basics" => All
        , "Debug" => None
        , "List" => Some (Set.fromList [ "List", "::" ])
        , "Maybe" => Some (Set.singleton "Maybe")
        , "Result" => Some (Set.singleton "Result")
        , "Platform" => Some (Set.singleton "Program")
        , ( "Platform.Cmd", Import (Just "Cmd") (Some (Set.fromList [ "Cmd", "!" ])) )
        , ( "Platform.Sub", Import (Just "Sub") (Some (Set.singleton "Sub")) )
        , "String" => None
        , "Tuple" => None
        ]


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
        , "port"
        , "exposing"
        , "alias"
        , "infixl"
        , "infixr"
        , "infix"
        , "type alias"
          -- , "open"
          -- , "hiding"
          -- , "export"
          -- , "foreign"
          -- , "perform"
          -- , "deriving"
          -- , "compappend"
        ]
        ++ [ { emptyHint
                | name = "number"
                , comment = "`Int` or `Float` depending on usage."
             }
           , { emptyHint
                | name = "appendable"
                , comment = "This includes strings, lists, and text."
             }
           , { emptyHint
                | name = "comparable"
                , comment = "This includes numbers, characters, strings, lists of comparable things, and tuples of comparable things. Note that tuples with 7 or more elements are not comparable."
             }
           ]


getLastName : String -> String
getLastName fullName =
    List.foldl always "" (String.split "." fullName)


getModuleName : String -> String
getModuleName fullName =
    fullName
        |> String.split "."
        |> Helper.dropLast
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
                        Just caseTipe ->
                            Just (caseTipe ++ "(" ++ symbolName ++ ")")

                        Nothing ->
                            Just symbolName
                    )
                  else
                    Nothing
                )



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
