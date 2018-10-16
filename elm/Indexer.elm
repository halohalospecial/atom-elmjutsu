port module Indexer exposing (ActiveFile, ActiveRecordVariable, ActiveTopLevel, Associativity(..), Config, Dependency, ElmVersion, EncodedHint, EncodedModuleDocs, EncodedSymbol, EncodedValue, EncodedValues, Exposed(..), ExternalHints, FileContents, FileContentsDict, FilePath, Hint, HintsCache, Import, ImportDict, ImportSuggestion, Inference, LocalHints, Model, ModuleDocs, Msg(..), ProjectDependencies, ProjectDirectory, ProjectFileContentsDict, RawImport, SourcePath, Symbol, SymbolKind(..), Tipe, TipeCase, TipeString, Token, TokenDict, Value, Values, Version, activeFileChangedCmd, activeTokenHintsChangedCmd, addImportSub, addLoadedPackageDocs, aliasesOfTypeReceivedCmd, areMatchingTypes, areMatchingTypesRecur, areTipesCompatibleRecur, argSeparatorRegex, askCanGoToDefinitionSub, canGoToDefinitionRepliedCmd, caseOfConstructedCmd, clearLocalHintsCacheSub, compressTipeRegex, compressTipeString, computeHintSourcePath, configChangedSub, constructCaseOf, constructCaseOfSub, constructDefaultArguments, constructDefaultArgumentsSub, constructDefaultValueForType, constructDefaultValueForTypeSub, constructFromTypeAnnotation, constructFromTypeAnnotationSub, decodeAssociativity, decodeModuleDocs, defaultArgumentsConstructedCmd, defaultImports, defaultSuggestions, defaultValueForTypeConstructedCmd, dependenciesNotFoundCmd, dictGroupBy, doAddImport, doAskCanGoToDefinition, doConstructCaseOf, doConstructDefaultArguments, doConstructDefaultValueForType, doConstructFromTypeAnnotation, doDownloadMissingPackageDocs, doGetAliasesOfType, doGetFieldsForRecordVariable, doGetFunctionsMatchingType, doGetHintsForPartial, doGetImporterSourcePathsForToken, doGetSignatureHelp, doGetSuggestionsForImport, doGetTokenInfo, doGoToDefinition, doRemoveFileContents, doShowAddImportView, doShowGoToSymbolView, doUpdateActiveFile, doUpdateActiveTokenHints, doUpdateFileContents, doUpdateProjectDependencies, docsDownloadedCmd, docsReadCmd, docsReadSub, dotToHyphen, downloadDocsFailedCmd, downloadMissingPackageDocsSub, downloadPackageDocs, downloadPackageDocsList, downloadingPackageDocsCmd, emptyConfig, emptyFileContents, emptyHint, emptyModel, emptyModuleDocs, encodeAssociativity, encodeHint, encodeHints, encodeSymbol, fieldsForRecordVariableReceivedCmd, fileContentsChangedSub, fileContentsRemovedSub, filePathSeparator, filterHintsByPartial, filterHintsFunction, filterTypeIncompatibleHints, formatDecoderEncoderFunctionBody, formatSourcePath, fromTypeAnnotationConstructedCmd, functionsMatchingTypeReceivedCmd, getActiveFileContents, getActiveFileTokens, getAliasesOfType, getAliasesOfTypeSub, getArgsParts, getArgsPartsRecur, getCharAndRest, getDefaultArgNames, getDefaultDecoderRecur, getDefaultEncoderRecur, getDefaultValueForType, getDefaultValueForTypeRecur, getExposedAndUnexposedHints, getExternalAndLocalHints, getExternalHints, getFieldsForRecordVariableSub, getFileContentsOfProject, getFilteredHints, getFunctionArgNameRecur, getFunctionsMatchingType, getFunctionsMatchingTypeSub, getHintFullName, getHintsForPartial, getHintsForPartialSub, getHintsForToken, getHintsForUnexposedNames, getImportersForToken, getImportersForTokenSub, getImportsPlusActiveModule, getImportsPlusActiveModuleForActiveFile, getLastName, getLocalHints, getModuleAndSymbolName, getModuleLocalName, getModuleName, getModuleSymbols, getParameterTipes, getProjectDependencySymbols, getProjectFileSymbols, getProjectModuleDocs, getProjectPackageDocs, getProjectSymbols, getRecordArgParts, getRecordFieldTokens, getRecordFieldTokensRecur, getRecordTipeFieldNames, getRecordTipeFieldTipes, getRecordTipeParts, getRecordTipePartsRecur, getReturnTipe, getSignatureHelpSub, getSourcePathOfRecordFieldToken, getSourcePathOfRecordFieldTokenRecur, getSuggestionsForImport, getSuggestionsForImportSub, getTipeCaseAlignedArgTipes, getTipeCaseTypeAnnotation, getTipeDistance, getTipeParts, getTipePartsRecur, getTokenAndActiveFileTokensForGoToDefinition, getTokenInfoSub, getTupleParts, getTuplePartsRecur, getTupleStringFromParts, goToDefinitionCmd, goToDefinitionSub, hintsForPartialReceivedCmd, importersForTokenReceivedCmd, importsToString, inferenceEnteredSub, inferenceToHints, init, isAppendableTipe, isComparableTipe, isDecoderTipe, isEncoderTipe, isExposed, isFunctionTipe, isNumberTipe, isPackageSourcePath, isPrimitiveTipe, isProjectSourcePath, isRecordString, isTipeVariable, isTupleString, isTypeClass, lastParameterTipe, main, moduleToHints, nameToHints, normalizeTipe, normalizeTipeRecur, optionalTaskSequence, packageDocsPrefix, parseTipeString, partitionByTipe, prefixRecordVariableToToken, primitiveTipes, projectDependenciesChangedSub, readPackageDocsCmd, readingPackageDocsCmd, showAddImportViewCmd, showAddImportViewSub, showGoToSymbolViewCmd, showGoToSymbolViewSub, signatureHelpReceivedCmd, sortHintsByName, sortHintsByScore, subscriptions, suggestionsForImportReceivedCmd, superTipes, symbolKindToString, tipeToHintable, tipeToValue, tipeToVar, toImport, toImportDict, toModuleDocs, toPackageUri, tokenInfoReceivedCmd, topLevelArgToHints, truncateModuleComment, typeConstructorToNameAndArgs, unencloseParentheses, unionTagsToHints, update, updateActiveFileSub, updateActiveTokenSub, updateFileContents, updateImportsCmd, valueToHintable)

import Ast
import Ast.Statement exposing (..)
import Dict
import Helper
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
        [ updateActiveTokenSub UpdateActiveTokenHints
        , updateActiveFileSub UpdateActiveFile
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
        , askCanGoToDefinitionSub AskCanGoToDefinition
        , showGoToSymbolViewSub ShowGoToSymbolView
        , getHintsForPartialSub GetHintsForPartial
        , getFieldsForRecordVariableSub GetFieldsForRecordVariable
        , getSuggestionsForImportSub GetSuggestionsForImport
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
        , clearLocalHintsCacheSub (\_ -> ClearLocalHintsCache)
        , getTokenInfoSub GetTokenInfo
        , getFunctionsMatchingTypeSub GetFunctionsMatchingType
        , getSignatureHelpSub GetSignatureHelp
        ]



-- INCOMING PORTS


port updateActiveTokenSub : (( Maybe ActiveTopLevel, Maybe ActiveRecordVariable, Maybe Token ) -> msg) -> Sub msg


port updateActiveFileSub : (( Maybe ActiveFile, Maybe ActiveTopLevel, Maybe ActiveRecordVariable, Maybe Token ) -> msg) -> Sub msg


port fileContentsChangedSub : (( FilePath, ProjectDirectory, EncodedModuleDocs, List RawImport ) -> msg) -> Sub msg


port fileContentsRemovedSub : (( FilePath, ProjectDirectory ) -> msg) -> Sub msg


port projectDependenciesChangedSub : (( String, List Dependency, ElmVersion ) -> msg) -> Sub msg


port downloadMissingPackageDocsSub : (List Dependency -> msg) -> Sub msg


port docsReadSub : (( List ( Dependency, String ), ElmVersion ) -> msg) -> Sub msg


port goToDefinitionSub : (( Maybe ActiveTopLevel, Maybe ActiveRecordVariable, Maybe Token ) -> msg) -> Sub msg


port askCanGoToDefinitionSub : (( Maybe ActiveTopLevel, Maybe ActiveRecordVariable, Token ) -> msg) -> Sub msg


port showGoToSymbolViewSub : (( Maybe String, Maybe String ) -> msg) -> Sub msg


port getHintsForPartialSub : (( String, Maybe TipeString, Maybe Token, Bool, Bool, Bool, Bool ) -> msg) -> Sub msg


port getFieldsForRecordVariableSub : (( ActiveRecordVariable, String, Bool ) -> msg) -> Sub msg


port getSuggestionsForImportSub : (( String, Bool ) -> msg) -> Sub msg


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


port clearLocalHintsCacheSub : (() -> msg) -> Sub msg


port getTokenInfoSub : (( Maybe ProjectDirectory, Maybe FilePath, Maybe ActiveTopLevel, Maybe ActiveRecordVariable, Maybe Token ) -> msg) -> Sub msg


port getFunctionsMatchingTypeSub : (( TipeString, Maybe ProjectDirectory, Maybe FilePath ) -> msg) -> Sub msg


port getSignatureHelpSub : (( Maybe ActiveTopLevel, Token ) -> msg) -> Sub msg



-- OUTGOING PORTS


port docsReadCmd : () -> Cmd msg


port docsDownloadedCmd : List ( Dependency, String ) -> Cmd msg


port downloadDocsFailedCmd : String -> Cmd msg


port dependenciesNotFoundCmd : ( List ProjectDirectory, List Dependency ) -> Cmd msg


port goToDefinitionCmd : ( Maybe ActiveFile, EncodedSymbol ) -> Cmd msg


port canGoToDefinitionRepliedCmd : ( Token, Bool ) -> Cmd msg


port showGoToSymbolViewCmd : ( Maybe String, Maybe ActiveFile, List EncodedSymbol ) -> Cmd msg


port activeFileChangedCmd : Maybe ActiveFile -> Cmd msg


port activeTokenHintsChangedCmd : ( Token, List EncodedHint ) -> Cmd msg


port readingPackageDocsCmd : () -> Cmd msg


port downloadingPackageDocsCmd : () -> Cmd msg


port readPackageDocsCmd : ( List Dependency, ElmVersion ) -> Cmd msg


port hintsForPartialReceivedCmd : ( String, List EncodedHint ) -> Cmd msg


port fieldsForRecordVariableReceivedCmd : ( String, List EncodedHint ) -> Cmd msg


port suggestionsForImportReceivedCmd : ( String, List ImportSuggestion ) -> Cmd msg


port importersForTokenReceivedCmd : ( ProjectDirectory, Token, Bool, Bool, List ( String, Bool, Bool, List String ) ) -> Cmd msg


port showAddImportViewCmd : ( Maybe Token, Maybe ActiveFile, List ( String, Maybe String ) ) -> Cmd msg


port updateImportsCmd : ( FilePath, String ) -> Cmd msg


port fromTypeAnnotationConstructedCmd : String -> Cmd msg


port caseOfConstructedCmd : Maybe Token -> Cmd msg


port defaultValueForTypeConstructedCmd : Maybe String -> Cmd msg


port defaultArgumentsConstructedCmd : Maybe (List String) -> Cmd msg


port aliasesOfTypeReceivedCmd : List TipeString -> Cmd msg


port tokenInfoReceivedCmd : List EncodedHint -> Cmd msg


port functionsMatchingTypeReceivedCmd : List EncodedHint -> Cmd msg


port signatureHelpReceivedCmd : List (List String) -> Cmd msg



-- MODEL


type alias Model =
    { packageDocs : List ModuleDocs
    , projectFileContentsDict : ProjectFileContentsDict
    , projectDependencies : ProjectDependencies
    , activeFile : Maybe ActiveFile
    , activeFileTokens : TokenDict
    , activeToken : Maybe Token
    , activeTokenHints : List Hint
    , activeTopLevel : Maybe ActiveTopLevel
    , config : Config
    , hintsCache : Maybe HintsCache
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


type alias ActiveRecordVariable =
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


type alias HintsCache =
    { external : Maybe ExternalHints
    , local : Maybe LocalHints
    }


type alias ExternalHints =
    { importedHints : List Hint
    , unimportedHints : List Hint
    }


type alias LocalHints =
    { topLevelHints : List Hint
    , variableHints : List Hint
    }


type alias ElmVersion =
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
    , activeFile = Nothing
    , activeFileTokens = Dict.empty
    , activeToken = Nothing
    , activeTokenHints = []
    , activeTopLevel = Nothing
    , projectDependencies = Dict.empty
    , config = emptyConfig
    , hintsCache = Nothing
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
    | DocsRead ( List ( Dependency, String ), ElmVersion )
    | UpdateActiveTokenHints ( Maybe ActiveTopLevel, Maybe ActiveRecordVariable, Maybe Token )
    | UpdateActiveFile ( Maybe ActiveFile, Maybe ActiveTopLevel, Maybe ActiveRecordVariable, Maybe Token )
    | UpdateFileContents FilePath ProjectDirectory FileContents
    | RemoveFileContents ( FilePath, ProjectDirectory )
    | UpdateProjectDependencies ( String, List Dependency, ElmVersion )
    | GoToDefinition ( Maybe ActiveTopLevel, Maybe ActiveRecordVariable, Maybe Token )
    | AskCanGoToDefinition ( Maybe ActiveTopLevel, Maybe ActiveRecordVariable, Token )
    | ShowGoToSymbolView ( Maybe ProjectDirectory, Maybe String )
    | GetHintsForPartial ( String, Maybe TipeString, Maybe Token, Bool, Bool, Bool, Bool )
    | GetFieldsForRecordVariable ( ActiveRecordVariable, String, Bool )
    | GetSuggestionsForImport ( String, Bool )
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
    | ClearLocalHintsCache
    | GetTokenInfo ( Maybe ProjectDirectory, Maybe FilePath, Maybe ActiveTopLevel, Maybe ActiveRecordVariable, Maybe Token )
    | GetFunctionsMatchingType ( TipeString, Maybe ProjectDirectory, Maybe FilePath )
    | GetSignatureHelp ( Maybe ActiveTopLevel, Token )


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
                                    let
                                        errorDetails =
                                            case message of
                                                Http.BadUrl string ->
                                                    "BadUrl " ++ string

                                                Http.Timeout ->
                                                    "Timeout"

                                                Http.NetworkError ->
                                                    "NetworkError"

                                                Http.BadStatus { status } ->
                                                    "BadStatus " ++ toString status.code ++ " " ++ status.message

                                                Http.BadPayload _ { status } ->
                                                    "BadPayload " ++ toString status.code ++ " " ++ status.message
                                    in
                                    ( successes, failures ++ [ ( dependency, errorDetails ) ] )
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
                            [ downloadDocsFailedCmd
                                (failures
                                    |> List.map
                                        (\( dependency, errorDetails ) ->
                                            toPackageUri dependency ++ "docs.json (" ++ errorDetails ++ ")"
                                        )
                                    |> String.join "\n"
                                )
                            ]
                                ++ (let
                                        notFoundDependencies =
                                            failures
                                                |> List.filter
                                                    (\( _, errorDetails ) ->
                                                        errorDetails == "BadStatus 404 Not found"
                                                    )
                                                |> List.map Tuple.first

                                        projectDirectories =
                                            Dict.keys model.projectFileContentsDict
                                    in
                                    if List.length notFoundDependencies > 0 then
                                        [ dependenciesNotFoundCmd ( projectDirectories, notFoundDependencies ) ]

                                    else
                                        []
                                   )

                        else
                            []
                       )
                )
            )

        DocsRead ( result, elmVersion ) ->
            let
                loadedPackageDocs =
                    result
                        |> List.concatMap (\( dependency, jsonString ) -> toModuleDocs (toPackageUri dependency) jsonString)
            in
            ( addLoadedPackageDocs loadedPackageDocs model
            , docsReadCmd ()
            )

        UpdateActiveTokenHints ( maybeActiveTopLevel, maybeActiveRecordVariable, maybeToken ) ->
            doUpdateActiveTokenHints maybeActiveTopLevel maybeActiveRecordVariable maybeToken model

        UpdateActiveFile ( maybeActiveFile, maybeActiveTopLevel, maybeActiveRecordVariable, maybeToken ) ->
            doUpdateActiveFile maybeActiveFile maybeActiveTopLevel maybeActiveRecordVariable maybeToken model

        UpdateFileContents filePath projectDirectory fileContents ->
            doUpdateFileContents filePath projectDirectory fileContents model

        RemoveFileContents ( filePath, projectDirectory ) ->
            doRemoveFileContents filePath projectDirectory model

        UpdateProjectDependencies ( projectDirectory, dependencies, elmVersion ) ->
            doUpdateProjectDependencies projectDirectory dependencies elmVersion model

        DownloadMissingPackageDocs dependencies ->
            doDownloadMissingPackageDocs dependencies model

        GoToDefinition ( maybeActiveTopLevel, maybeActiveRecordVariable, maybeToken ) ->
            doGoToDefinition maybeActiveTopLevel maybeActiveRecordVariable maybeToken model

        AskCanGoToDefinition ( maybeActiveTopLevel, maybeActiveRecordVariable, token ) ->
            doAskCanGoToDefinition maybeActiveTopLevel maybeActiveRecordVariable token model

        ShowGoToSymbolView ( maybeProjectDirectory, maybeToken ) ->
            doShowGoToSymbolView maybeProjectDirectory maybeToken model

        GetHintsForPartial ( partial, maybeInferredTipe, preceedingToken, isRegex, isTypeSignature, isFiltered, isGlobal ) ->
            doGetHintsForPartial partial maybeInferredTipe preceedingToken isRegex isTypeSignature isFiltered isGlobal model

        GetFieldsForRecordVariable ( activeRecordVariable, partial, isFiltered ) ->
            doGetFieldsForRecordVariable activeRecordVariable partial isFiltered model

        GetSuggestionsForImport ( partial, isFiltered ) ->
            doGetSuggestionsForImport partial isFiltered model

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
            , activeTokenHintsChangedCmd
                ( inference.name
                , inferenceToHints inference
                    |> encodeHints model.config.showAliasesOfType model.activeFileTokens
                )
            )

        ConfigChanged config ->
            ( { model | config = config, activeFile = Nothing }
            , Cmd.none
            )

        GetAliasesOfType token ->
            doGetAliasesOfType token model

        ClearLocalHintsCache ->
            ( { model
                | hintsCache =
                    case model.hintsCache of
                        Just hintsCache ->
                            Just { hintsCache | local = Nothing }

                        Nothing ->
                            Nothing
              }
            , Cmd.none
            )

        GetTokenInfo ( maybeProjectDirectory, maybeFilePath, maybeActiveTopLevel, maybeActiveRecordVariable, maybeToken ) ->
            doGetTokenInfo maybeProjectDirectory maybeFilePath maybeActiveTopLevel maybeActiveRecordVariable maybeToken model

        GetFunctionsMatchingType ( tipeString, maybeProjectDirectory, maybeFilePath ) ->
            doGetFunctionsMatchingType tipeString maybeProjectDirectory maybeFilePath model

        GetSignatureHelp ( maybeActiveTopLevel, token ) ->
            doGetSignatureHelp maybeActiveTopLevel token model


doGetFunctionsMatchingType : TipeString -> Maybe ProjectDirectory -> Maybe FilePath -> Model -> ( Model, Cmd msg )
doGetFunctionsMatchingType tipeString maybeProjectDirectory maybeFilePath model =
    ( model
    , getFunctionsMatchingType tipeString maybeProjectDirectory maybeFilePath model.projectFileContentsDict model.projectDependencies model.packageDocs
        |> encodeHints model.config.showAliasesOfType Dict.empty
        |> functionsMatchingTypeReceivedCmd
    )


doGetSignatureHelp : Maybe ActiveTopLevel -> Token -> Model -> ( Model, Cmd msg )
doGetSignatureHelp maybeActiveTopLevel token model =
    ( model
    , getHintsForToken (Just token) model.activeFileTokens
        |> List.map (\hint -> getTipeParts hint.tipe)
        |> List.filter (\parts -> parts /= [])
        |> signatureHelpReceivedCmd
    )


inferenceToHints : Inference -> List Hint
inferenceToHints inference =
    [ { emptyHint
        | name = inference.name
        , tipe = inference.tipe
      }
    ]


prefixRecordVariableToToken : Maybe ActiveRecordVariable -> Maybe Token -> Maybe Token
prefixRecordVariableToToken maybeActiveRecordVariable maybeToken =
    case maybeActiveRecordVariable of
        Just activeRecordVariable ->
            Maybe.map (\token -> activeRecordVariable ++ "." ++ token) maybeToken

        Nothing ->
            maybeToken


doUpdateActiveTokenHints : Maybe ActiveTopLevel -> Maybe ActiveRecordVariable -> Maybe Token -> Model -> ( Model, Cmd Msg )
doUpdateActiveTokenHints maybeActiveTopLevel maybeActiveRecordVariable maybeToken model =
    let
        prefixedToken =
            prefixRecordVariableToToken maybeActiveRecordVariable maybeToken

        updatedActiveFileTokens =
            case prefixedToken of
                Nothing ->
                    model.activeFileTokens

                Just "" ->
                    model.activeFileTokens

                Just token ->
                    if model.activeTopLevel /= maybeActiveTopLevel then
                        getActiveFileTokens model.activeFile maybeActiveTopLevel model.projectFileContentsDict model.projectDependencies model.packageDocs

                    else
                        model.activeFileTokens

        updatedActiveTokenHints =
            case prefixedToken of
                Nothing ->
                    []

                Just "" ->
                    []

                Just token ->
                    getHintsForToken prefixedToken updatedActiveFileTokens
    in
    ( { model
        | activeTopLevel = maybeActiveTopLevel
        , activeFileTokens = updatedActiveFileTokens
        , activeToken = prefixedToken
        , activeTokenHints = updatedActiveTokenHints
      }
    , activeTokenHintsChangedCmd
        ( Maybe.withDefault "" prefixedToken
        , updatedActiveTokenHints
            |> encodeHints model.config.showAliasesOfType updatedActiveFileTokens
        )
    )


doGetTokenInfo : Maybe ProjectDirectory -> Maybe FilePath -> Maybe ActiveTopLevel -> Maybe ActiveTopLevel -> Maybe Token -> Model -> ( Model, Cmd Msg )
doGetTokenInfo maybeProjectDirectory maybeFilePath maybeActiveTopLevel maybeActiveRecordVariable maybeToken model =
    case ( maybeProjectDirectory, maybeFilePath ) of
        ( Just projectDirectory, Just filePath ) ->
            let
                prefixedToken =
                    prefixRecordVariableToToken maybeActiveRecordVariable maybeToken

                fileTokens =
                    case model.activeFile of
                        Just activeFile ->
                            if activeFile.filePath == filePath && model.activeTopLevel == maybeActiveTopLevel then
                                model.activeFileTokens

                            else
                                getActiveFileTokens (Just { filePath = filePath, projectDirectory = projectDirectory }) maybeActiveTopLevel model.projectFileContentsDict model.projectDependencies model.packageDocs

                        Nothing ->
                            getActiveFileTokens (Just { filePath = filePath, projectDirectory = projectDirectory }) maybeActiveTopLevel model.projectFileContentsDict model.projectDependencies model.packageDocs

                tokenHints =
                    getHintsForToken prefixedToken fileTokens
            in
            ( model
            , tokenHints
                |> encodeHints model.config.showAliasesOfType fileTokens
                |> tokenInfoReceivedCmd
            )

        _ ->
            ( model
            , tokenInfoReceivedCmd []
            )


doUpdateActiveFile : Maybe ActiveFile -> Maybe ActiveTopLevel -> Maybe ActiveRecordVariable -> Maybe Token -> Model -> ( Model, Cmd Msg )
doUpdateActiveFile maybeActiveFile maybeActiveTopLevel maybeActiveRecordVariable maybeToken model =
    let
        prefixedToken =
            prefixRecordVariableToToken maybeActiveRecordVariable maybeToken

        updatedActiveFileTokens =
            if model.activeFile /= maybeActiveFile || model.activeTopLevel /= maybeActiveTopLevel then
                getActiveFileTokens maybeActiveFile maybeActiveTopLevel model.projectFileContentsDict model.projectDependencies model.packageDocs

            else
                model.activeFileTokens

        updatedActiveTokenHints =
            getHintsForToken prefixedToken updatedActiveFileTokens
    in
    ( { model
        | activeFile = maybeActiveFile
        , activeTopLevel = maybeActiveTopLevel
        , activeFileTokens = updatedActiveFileTokens
        , activeToken = prefixedToken
        , activeTokenHints = updatedActiveTokenHints
        , hintsCache = Nothing
      }
    , Cmd.batch
        [ activeFileChangedCmd maybeActiveFile
        , activeTokenHintsChangedCmd
            ( Maybe.withDefault "" prefixedToken
            , updatedActiveTokenHints
                |> encodeHints model.config.showAliasesOfType updatedActiveFileTokens
            )
        ]
    )


doUpdateFileContents : FilePath -> ProjectDirectory -> FileContents -> Model -> ( Model, Cmd Msg )
doUpdateFileContents filePath projectDirectory fileContents model =
    let
        updatedProjectFileContentsDict =
            updateFileContents filePath projectDirectory fileContents model.projectFileContentsDict

        updatedActiveFileTokens =
            getActiveFileTokens model.activeFile model.activeTopLevel updatedProjectFileContentsDict model.projectDependencies model.packageDocs

        updatedHintsCache =
            case model.hintsCache of
                Just hintsCache ->
                    case hintsCache.external of
                        Just _ ->
                            case model.activeFile of
                                Just activeFile ->
                                    let
                                        oldFileContentsDict =
                                            getFileContentsOfProject activeFile.projectDirectory model.projectFileContentsDict

                                        oldActiveFileContents =
                                            getActiveFileContents model.activeFile oldFileContentsDict

                                        newFileContentsDict =
                                            getFileContentsOfProject activeFile.projectDirectory updatedProjectFileContentsDict

                                        newActiveFileContents =
                                            getActiveFileContents model.activeFile newFileContentsDict
                                    in
                                    if activeFile.filePath == filePath && oldActiveFileContents.imports /= newActiveFileContents.imports then
                                        Just { hintsCache | external = Nothing }

                                    else
                                        model.hintsCache

                                Nothing ->
                                    model.hintsCache

                        Nothing ->
                            model.hintsCache

                Nothing ->
                    model.hintsCache
    in
    ( { model
        | projectFileContentsDict = updatedProjectFileContentsDict
        , activeFileTokens = updatedActiveFileTokens
        , hintsCache = updatedHintsCache
      }
    , activeFileChangedCmd model.activeFile
    )


updateFileContents : FilePath -> ProjectDirectory -> FileContents -> ProjectFileContentsDict -> ProjectFileContentsDict
updateFileContents filePath projectDirectory fileContents projectFileContentsDict =
    let
        fileContentsDict =
            getFileContentsOfProject projectDirectory projectFileContentsDict

        updatedFileContentsDict =
            Dict.update filePath (\_ -> Just fileContents) fileContentsDict
    in
    Dict.update projectDirectory (\_ -> Just updatedFileContentsDict) projectFileContentsDict


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
            Dict.update projectDirectory (\_ -> Just updatedFileContentsDict) model.projectFileContentsDict

        updatedActiveFileTokens =
            getActiveFileTokens model.activeFile model.activeTopLevel updatedProjectFileContentsDict model.projectDependencies model.packageDocs
    in
    ( { model
        | projectFileContentsDict = updatedProjectFileContentsDict
        , activeFileTokens = updatedActiveFileTokens
        , hintsCache = Nothing
      }
    , activeFileChangedCmd model.activeFile
    )


doUpdateProjectDependencies : ProjectDirectory -> List Dependency -> ElmVersion -> Model -> ( Model, Cmd Msg )
doUpdateProjectDependencies projectDirectory dependencies elmVersion model =
    let
        existingPackages =
            List.map .sourcePath model.packageDocs

        missingDependencies =
            List.filter (\dependency -> not <| List.member (toPackageUri dependency) existingPackages) dependencies
    in
    ( { model
        | projectDependencies = Dict.update projectDirectory (\_ -> Just dependencies) model.projectDependencies
        , hintsCache = Nothing
      }
    , Cmd.batch
        [ readingPackageDocsCmd ()
        , readPackageDocsCmd ( missingDependencies, elmVersion )
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


doGoToDefinition : Maybe ActiveTopLevel -> Maybe ActiveRecordVariable -> Maybe Token -> Model -> ( Model, Cmd Msg )
doGoToDefinition maybeActiveTopLevel maybeActiveRecordVariable maybeToken model =
    let
        ( tokenToCheck, activeFileTokens ) =
            getTokenAndActiveFileTokensForGoToDefinition maybeActiveTopLevel maybeActiveRecordVariable maybeToken model

        requests =
            getHintsForToken tokenToCheck activeFileTokens
                |> List.map
                    (\hint ->
                        let
                            symbol =
                                { fullName = getHintFullName hint
                                , sourcePath = computeHintSourcePath ( model.activeFile, maybeActiveTopLevel, model.projectFileContentsDict, model.projectDependencies, model.packageDocs ) activeFileTokens hint
                                , tipe = hint.tipe
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


doAskCanGoToDefinition : Maybe ActiveTopLevel -> Maybe ActiveRecordVariable -> Token -> Model -> ( Model, Cmd Msg )
doAskCanGoToDefinition maybeActiveTopLevel maybeActiveRecordVariable token model =
    let
        ( tokenToCheck, activeFileTokens ) =
            getTokenAndActiveFileTokensForGoToDefinition maybeActiveTopLevel maybeActiveRecordVariable (Just token) model
    in
    case tokenToCheck of
        Nothing ->
            ( model
            , ( token, False ) |> canGoToDefinitionRepliedCmd
            )

        Just token2 ->
            ( model
            , ( token
              , Dict.member token2 activeFileTokens
              )
                |> canGoToDefinitionRepliedCmd
            )


getTokenAndActiveFileTokensForGoToDefinition : Maybe ActiveTopLevel -> Maybe ActiveRecordVariable -> Maybe Token -> Model -> ( Maybe Token, TokenDict )
getTokenAndActiveFileTokensForGoToDefinition maybeActiveTopLevel maybeActiveRecordVariable maybeToken model =
    let
        tokenToCheck =
            case ( maybeToken, model.activeFile ) of
                ( Just token, Just { projectDirectory } ) ->
                    let
                        token2 =
                            case maybeActiveRecordVariable of
                                Just activeRecordVariable ->
                                    activeRecordVariable ++ "." ++ token

                                Nothing ->
                                    token

                        fileContentsDict =
                            getFileContentsOfProject projectDirectory model.projectFileContentsDict

                        activeFileContents =
                            getActiveFileContents model.activeFile fileContentsDict
                    in
                    if activeFileContents.moduleDocs.name == getModuleName token2 then
                        Just (getLastName token2)

                    else
                        Just token2

                ( Just token, Nothing ) ->
                    Just token

                ( Nothing, _ ) ->
                    Nothing

        activeFileTokens =
            getActiveFileTokens model.activeFile maybeActiveTopLevel model.projectFileContentsDict model.projectDependencies model.packageDocs
    in
    ( tokenToCheck, activeFileTokens )


doShowGoToSymbolView : Maybe ProjectDirectory -> Maybe String -> Model -> ( Model, Cmd Msg )
doShowGoToSymbolView maybeProjectDirectory maybeToken model =
    case maybeProjectDirectory of
        Just projectDirectory ->
            let
                hints =
                    getHintsForToken maybeToken model.activeFileTokens

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


encodeHints : Bool -> TokenDict -> List Hint -> List EncodedHint
encodeHints showAliasesOfType activeFileTokens hints =
    List.map (encodeHint showAliasesOfType activeFileTokens) hints


doGetHintsForPartial : String -> Maybe TipeString -> Maybe Token -> Bool -> Bool -> Bool -> Bool -> Model -> ( Model, Cmd Msg )
doGetHintsForPartial partial maybeInferredTipe preceedingToken isRegex isTypeSignature isFiltered isGlobal model =
    let
        ( hints, updatedHintsCache ) =
            getHintsForPartial partial maybeInferredTipe preceedingToken isRegex isTypeSignature isFiltered isGlobal model.activeFile model.projectFileContentsDict model.projectDependencies model.packageDocs model.hintsCache model.activeFileTokens
    in
    ( { model | hintsCache = updatedHintsCache }
    , ( partial
      , hints
            |> encodeHints model.config.showAliasesOfType model.activeFileTokens
      )
        |> hintsForPartialReceivedCmd
    )


doGetFieldsForRecordVariable : ActiveRecordVariable -> String -> Bool -> Model -> ( Model, Cmd Msg )
doGetFieldsForRecordVariable activeRecordVariable partial isFiltered model =
    -- TODO: Do not use `getHintsForPartial`.  Get the fields of the record instead.
    let
        prefixedPartial =
            prefixRecordVariableToToken (Just activeRecordVariable) (Just partial)
                |> Maybe.withDefault ""

        ( hints, updatedHintsCache ) =
            getHintsForPartial prefixedPartial Nothing Nothing False False isFiltered False model.activeFile model.projectFileContentsDict model.projectDependencies model.packageDocs model.hintsCache model.activeFileTokens

        fieldsHints =
            hints
                |> List.filter
                    (\hint ->
                        String.startsWith (activeRecordVariable ++ ".") hint.name
                    )
                |> List.filter
                    (\hint ->
                        String.dropLeft (String.length <| activeRecordVariable ++ ".") hint.name
                            |> String.contains "."
                            |> not
                    )
    in
    ( -- { model | hintsCache = updatedHintsCache }
      model
    , ( partial
      , fieldsHints
            |> encodeHints model.config.showAliasesOfType model.activeFileTokens
      )
        |> fieldsForRecordVariableReceivedCmd
    )


doGetSuggestionsForImport : String -> Bool -> Model -> ( Model, Cmd Msg )
doGetSuggestionsForImport partial isFiltered model =
    ( model
    , ( partial
      , getSuggestionsForImport partial isFiltered model.activeFile model.projectFileContentsDict (getProjectPackageDocs model.activeFile model.projectDependencies model.packageDocs)
      )
        |> suggestionsForImportReceivedCmd
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
              , getImportersForToken token isCursorAtLastPartOfToken model.activeFile model.activeFileTokens activeFileContents model.projectFileContentsDict
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

        updatedActiveFileTokens =
            getActiveFileTokens model.activeFile model.activeTopLevel model.projectFileContentsDict model.projectDependencies updatedPackageDocs
    in
    { model
        | packageDocs = updatedPackageDocs
        , activeFileTokens = updatedActiveFileTokens
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
                                |> Set.fromList
                    in
                    packageDocs
                        |> List.filter
                            (\moduleDocs ->
                                Set.member moduleDocs.sourcePath packageUris
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
            , tipe = ""
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
                    , tipe = value.tipe
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
                    , tipe = alias.tipe
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
                    , tipe = tipe.tipe
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
                            , tipe = getTipeCaseTypeAnnotation tipeCase tipe
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
                                && (name /= hint.name)
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
            fieldsAndValues =
                getRecordTipeParts tipeString
                    |> Dict.fromList
                    |> Dict.map
                        (\fieldName fieldTipeString ->
                            fieldName ++ " : " ++ normalizeTipeRecur tokens visitedTipeAliases fieldTipeString
                        )
                    |> Dict.values
                    |> String.join ", "
        in
        "{ " ++ fieldsAndValues ++ " }"

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


{-|

    ```
    isTipeVariable "a" == True
    isTipeVariable "number" == True
    isTipeVariable "appendable" == True
    isTipeVariable "comparable" == True

    isTipeVariable "MyType" == False
    ```

-}
isTipeVariable : String -> Bool
isTipeVariable tipeString =
    not (Helper.isCapitalized tipeString)


{-|

    ```
    isNumberTipe "number" == True
    isNumberTipe "Int" == True
    isNumberTipe "Float" == True

    isNumberTipe "a" == False
    ```

-}
isNumberTipe : String -> Bool
isNumberTipe tipeString =
    List.member tipeString [ "Int", "Float", "number" ]


{-|

    ```
    isAppendableTipe "appendable" == True
    isAppendableTipe "String" == True
    isAppendableTipe "List" == True
    isAppendableTipe "List a" == True
    isAppendableTipe "List Int" == True

    isAppendableTipe "number" == False
    ```

-}
isAppendableTipe : String -> Bool
isAppendableTipe tipeString =
    List.member (getArgsParts tipeString |> List.head) [ Just "appendable", Just "String", Just "List" ]


isComparableTipe : String -> Bool
isComparableTipe tipeString =
    -- TODO
    False


{-|

    ```
    areTipesCompatibleRecur "a" "b" == True
    areTipesCompatibleRecur "number" "a" == True
    areTipesCompatibleRecur "appendable" "a" == True
    areTipesCompatibleRecur "comparable" "a" == True

    areTipesCompatibleRecur "MyType" "a" == True
    areTipesCompatibleRecur "MyType" "MyType" == True

    areTipesCompatibleRecur "number" "number" == True
    areTipesCompatibleRecur "Int" "number" == True
    areTipesCompatibleRecur "Float" "number" == True
    areTipesCompatibleRecur "List MyType" "List number" == False

    areTipesCompatibleRecur "appendable" "appendable" == True
    areTipesCompatibleRecur "String" "appendable" == True
    areTipesCompatibleRecur "List a" "appendable" == True
    areTipesCompatibleRecur "List Int" "appendable" == True

    areTipesCompatibleRecur "List a" "a" == True
    areTipesCompatibleRecur "List Int" "List a" == True
    areTipesCompatibleRecur "List Int" "List Float" == False

    areTipesCompatibleRecur "" "Int" == False
    areTipesCompatibleRecur "Int" "" == False
    ```

-}
areTipesCompatibleRecur : String -> String -> Bool
areTipesCompatibleRecur tipe1 tipe2 =
    if tipe1 == tipe2 then
        True

    else if tipe1 == "" || tipe2 == "" then
        False

    else
        let
            parts1 =
                getArgsParts tipe1

            parts2 =
                getArgsParts tipe2

            numParts1 =
                List.length parts1

            numParts2 =
                List.length parts2
        in
        if (isFunctionTipe tipe1 && not (isFunctionTipe tipe2)) || (isFunctionTipe tipe2 && not (isFunctionTipe tipe1)) then
            False

        else if numParts1 == 1 && numParts2 == 1 then
            (isTipeVariable tipe1 && isTipeVariable tipe2)
                || (Helper.isCapitalized tipe1 && isTipeVariable tipe2 && not (isTypeClass tipe2))
                || (isNumberTipe tipe1 && tipe2 == "number")
                || (isAppendableTipe tipe1 && tipe2 == "appendable")
                || (isComparableTipe tipe1 && tipe2 == "comparable")

        else if numParts2 == 1 && isTipeVariable tipe2 && not (isTypeClass tipe2) then
            True

        else
            case ( List.head parts1, List.head parts2 ) of
                ( Just head1, Just head2 ) ->
                    if head1 == head2 then
                        areTipesCompatibleRecur
                            (List.tail parts1 |> Maybe.withDefault [] |> String.join "")
                            (List.tail parts2 |> Maybe.withDefault [] |> String.join "")

                    else
                        False

                _ ->
                    False


getFunctionsMatchingType : TipeString -> Maybe ProjectDirectory -> Maybe FilePath -> ProjectFileContentsDict -> ProjectDependencies -> List ModuleDocs -> List Hint
getFunctionsMatchingType tipeString maybeProjectDirectory maybeFilePath projectFileContentsDict projectDependencies packageDocs =
    case ( maybeProjectDirectory, maybeFilePath ) of
        ( Just projectDirectory, Just filePath ) ->
            let
                activeFile =
                    Just { projectDirectory = projectDirectory, filePath = filePath }

                activeFileTokens =
                    getActiveFileTokens activeFile Nothing projectFileContentsDict projectDependencies packageDocs

                { external, local } =
                    getExternalAndLocalHints True activeFile projectFileContentsDict projectDependencies packageDocs Nothing Nothing activeFileTokens

                ( exposedAndTopLevelHints, unexposedHints, variableHints ) =
                    case ( external, local ) of
                        ( Just external, Just local ) ->
                            ( external.importedHints ++ local.topLevelHints, external.unimportedHints, local.variableHints )

                        _ ->
                            ( [], [], [] )
            in
            (exposedAndTopLevelHints
                ++ unexposedHints
                ++ variableHints
            )
                |> List.filter (\hint -> areMatchingTypes tipeString hint.tipe)

        _ ->
            []


parseTipeString : String -> Maybe Type
parseTipeString tipeString =
    case Ast.parseStatement Dict.empty ("x : " ++ tipeString) of
        Ok ( (), _, FunctionTypeDeclaration "x" typeAnnotation ) ->
            Just typeAnnotation

        _ ->
            Nothing


{-|

    ```
    areMatchingTypes "a" "b" == True
    areMatchingTypes "number" "a" == True
    areMatchingTypes "appendable" "a" == True
    areMatchingTypes "comparable" "a" == True

    areMatchingTypes "MyType" "a" == True
    areMatchingTypes "MyType" "MyType" == True

    areMatchingTypes "number" "number" == True
    areMatchingTypes "Int" "number" == True
    areMatchingTypes "Float" "number" == True
    areMatchingTypes "List MyType" "List number" == False

    areMatchingTypes "appendable" "appendable" == True
    areMatchingTypes "String" "appendable" == True
    areMatchingTypes "List a" "appendable" == True
    areMatchingTypes "List Int" "appendable" == True

    areMatchingTypes "List a" "a" == True
    areMatchingTypes "List Int" "List a" == True
    areMatchingTypes "List Int" "List Float" == False

    areMatchingTypes "" "Int" == False
    areMatchingTypes "Int" "" == False

    areMatchingTypes "List String -> Int" "List a -> Int" == True
    areMatchingTypes "List String -> Int" "a -> a" == False

    areMatchingTypes "number -> String" "number" == False
    areMatchingTypes "number -> String" "a -> String" == False

    areMatchingTypes "String -> a" "appendable -> appendable -> appendable" == False
    ```

-}
areMatchingTypes : String -> String -> Bool
areMatchingTypes tipeString1 tipeString2 =
    case ( parseTipeString tipeString1, parseTipeString tipeString2 ) of
        ( Nothing, _ ) ->
            False

        ( _, Nothing ) ->
            False

        ( Just annotation1, Just annotation2 ) ->
            let
                ( result, typeVariables1, typeVariables2 ) =
                    areMatchingTypesRecur annotation1 annotation2 Dict.empty Dict.empty []
            in
            result


areMatchingTypesRecur : Type -> Type -> Dict.Dict String Type -> Dict.Dict String Type -> List ( Type, Type ) -> ( Bool, Dict.Dict String Type, Dict.Dict String Type )
areMatchingTypesRecur annotation1 annotation2 typeVariables1 typeVariables2 nextAnnotations =
    -- TODO: The code below is not yet finished and commented out for now since it causes long compile times.
    ( False, Dict.empty, Dict.empty )



-- let
--     checkTypeVariables1 variable annotation =
--         case Dict.get variable typeVariables1 of
--             Nothing ->
--                 ( True, Dict.insert variable annotation typeVariables1, typeVariables2, nextAnnotations )
--
--             Just variableAnnotation ->
--                 ( True, typeVariables1, typeVariables2, [ ( variableAnnotation, annotation ) ] ++ nextAnnotations )
--
--     checkTypeVariables2 variable annotation =
--         case Dict.get variable typeVariables2 of
--             Nothing ->
--                 ( True, typeVariables1, Dict.insert variable annotation typeVariables2, nextAnnotations )
--
--             Just variableAnnotation ->
--                 ( True, typeVariables1, typeVariables2, [ ( annotation, variableAnnotation ) ] ++ nextAnnotations )
--
--     ( continueChecking, updatedTypeVariables1, updatedTypeVariables2, updatedNextAnnotations ) =
--         if annotation1 == annotation2 then
--             ( True, typeVariables1, typeVariables2, nextAnnotations )
--         else
--             case ( annotation1, annotation2 ) of
--                 -- number (Int, Float)
--                 ( TypeVariable "number", TypeConstructor [ "Int" ] [] ) ->
--                     ( True, typeVariables1, typeVariables2, nextAnnotations )
--
--                 ( TypeVariable "number", TypeConstructor [ "Float" ] [] ) ->
--                     ( True, typeVariables1, typeVariables2, nextAnnotations )
--
--                 ( TypeVariable "number", TypeVariable variable ) ->
--                     checkTypeVariables2 variable (TypeVariable "number")
--
--                 ( TypeConstructor [ "Int" ] [], TypeVariable "number" ) ->
--                     ( True, typeVariables1, typeVariables2, nextAnnotations )
--
--                 ( TypeConstructor [ "Float" ] [], TypeVariable "number" ) ->
--                     ( True, typeVariables1, typeVariables2, nextAnnotations )
--
--                 ( TypeVariable variable, TypeVariable "number" ) ->
--                     checkTypeVariables1 variable (TypeVariable "number")
--
--                 -- appendable (String, List)
--                 ( TypeVariable "appendable", TypeConstructor [ "String" ] [] ) ->
--                     ( True, typeVariables1, typeVariables2, nextAnnotations )
--
--                 ( TypeVariable "appendable", TypeConstructor [ "List" ] anyType ) ->
--                     ( True, typeVariables1, typeVariables2, nextAnnotations )
--
--                 ( TypeConstructor [ "String" ] [], TypeVariable "appendable" ) ->
--                     ( True, typeVariables1, typeVariables2, nextAnnotations )
--
--                 ( TypeConstructor [ "List" ] anyType, TypeVariable "appendable" ) ->
--                     ( True, typeVariables1, typeVariables2, nextAnnotations )
--
--                 -- generic type (e.g. a, b, c)
--                 ( TypeVariable variable, TypeApplication _ _ ) ->
--                     ( False, typeVariables1, typeVariables2, nextAnnotations )
--
--                 ( TypeApplication _ _, TypeVariable variable ) ->
--                     ( False, typeVariables1, typeVariables2, nextAnnotations )
--
--                 ( TypeVariable variable, anyType ) ->
--                     if isTypeClass variable then
--                         ( False, typeVariables1, typeVariables2, nextAnnotations )
--                     else
--                         checkTypeVariables1 variable anyType
--
--                 ( anyType, TypeVariable variable ) ->
--                     if isTypeClass variable then
--                         ( False, typeVariables1, typeVariables2, nextAnnotations )
--                     else
--                         checkTypeVariables2 variable anyType
--
--                 -- type application (e.g. String -> Int)
--                 ( TypeApplication typeA1 typeB1, TypeApplication typeA2 typeB2 ) ->
--                     ( True, typeVariables1, typeVariables2, [ ( typeA1, typeA2 ), ( typeB1, typeB2 ) ] ++ nextAnnotations )
--
--                 -- type constructor (e.g. MyType String)
--                 ( TypeConstructor constructor1 children1, TypeConstructor constructor2 children2 ) ->
--                     if constructor1 == constructor2 then
--                         if List.length children1 == List.length children2 then
--                             ( True, typeVariables1, typeVariables2, (List.map2 (,) children1 children2) ++ nextAnnotations )
--                         else
--                             ( False, typeVariables1, typeVariables2, nextAnnotations )
--                     else
--                         ( False, typeVariables1, typeVariables2, nextAnnotations )
--
--                 -- TODO
--                 -- Comparable types includes numbers, characters, strings, lists of comparable things, and tuples of comparable things.
--                 -- Note that tuples with 7 or more elements are not comparable.
--                 _ ->
--                     ( False, typeVariables1, typeVariables2, nextAnnotations )
-- in
--     if continueChecking then
--         case updatedNextAnnotations of
--             ( head1, head2 ) :: tails ->
--                 areMatchingTypesRecur head1 head2 updatedTypeVariables1 updatedTypeVariables2 tails
--
--             [] ->
--                 ( True, updatedTypeVariables1, updatedTypeVariables2 )
--     else
--         ( False, updatedTypeVariables1, updatedTypeVariables2 )


getExternalHints : Bool -> FilePath -> FileContents -> List ModuleDocs -> ExternalHints
getExternalHints isGlobal filePath activeFileContents allModuleDocs =
    let
        moduleDocsToCheck =
            if isGlobal then
                allModuleDocs
                    |> List.filter
                        (\moduleDocs ->
                            moduleDocs.sourcePath /= filePath
                        )

            else
                allModuleDocs
                    |> List.filter
                        (\moduleDocs ->
                            List.member moduleDocs.name (Dict.keys activeFileContents.imports)
                                && (moduleDocs.sourcePath /= filePath)
                        )

        ( importedHints, unimportedHints ) =
            getExposedAndUnexposedHints isGlobal filePath activeFileContents.imports moduleDocsToCheck
    in
    { importedHints = importedHints
    , unimportedHints = unimportedHints
    }


getLocalHints : FilePath -> FileContents -> TokenDict -> LocalHints
getLocalHints filePath activeFileContents activeFileTokens =
    let
        selfImport =
            Dict.singleton activeFileContents.moduleDocs.name { alias = Nothing, exposed = All }
    in
    { topLevelHints =
        getExposedAndUnexposedHints False filePath selfImport [ activeFileContents.moduleDocs ]
            |> Tuple.first
    , variableHints =
        activeFileTokens
            |> Dict.values
            |> List.concat
            |> List.filter (\hint -> hint.moduleName == "")
    }


getExternalAndLocalHints : Bool -> Maybe ActiveFile -> ProjectFileContentsDict -> ProjectDependencies -> List ModuleDocs -> Maybe ExternalHints -> Maybe LocalHints -> TokenDict -> HintsCache
getExternalAndLocalHints isGlobal maybeActiveFile projectFileContentsDict projectDependencies packageDocs maybeCachedExternal maybeCachedLocal activeFileTokens =
    case maybeActiveFile of
        Just { projectDirectory, filePath } ->
            let
                projectPackageDocs =
                    getProjectPackageDocs maybeActiveFile projectDependencies packageDocs

                allModuleDocs =
                    projectPackageDocs ++ getProjectModuleDocs projectDirectory projectFileContentsDict

                fileContentsDict =
                    getFileContentsOfProject projectDirectory projectFileContentsDict

                activeFileContents =
                    getActiveFileContents maybeActiveFile fileContentsDict

                local =
                    case maybeCachedLocal of
                        Just cachedLocal ->
                            cachedLocal

                        Nothing ->
                            getLocalHints filePath activeFileContents activeFileTokens

                external =
                    case maybeCachedExternal of
                        Just cachedExternal ->
                            cachedExternal

                        Nothing ->
                            getExternalHints isGlobal filePath activeFileContents allModuleDocs
            in
            { external = Just external, local = Just local }

        Nothing ->
            { external = Just { importedHints = [], unimportedHints = [] }
            , local = Just { topLevelHints = [], variableHints = [] }
            }


getHintsForPartial : String -> Maybe TipeString -> Maybe Token -> Bool -> Bool -> Bool -> Bool -> Maybe ActiveFile -> ProjectFileContentsDict -> ProjectDependencies -> List ModuleDocs -> Maybe HintsCache -> TokenDict -> ( List Hint, Maybe HintsCache )
getHintsForPartial partial maybeInferredTipe preceedingToken isRegex isTypeSignature isFiltered isGlobal maybeActiveFile projectFileContentsDict projectDependencies packageDocs maybeHintsCache activeFileTokens =
    case maybeActiveFile of
        Just { projectDirectory, filePath } ->
            let
                { external, local } =
                    case maybeHintsCache of
                        Just hintsCache ->
                            case ( hintsCache.external, hintsCache.local ) of
                                ( Just external, Just local ) ->
                                    hintsCache

                                ( maybeCachedExternal, maybeCachedLocal ) ->
                                    getExternalAndLocalHints isGlobal maybeActiveFile projectFileContentsDict projectDependencies packageDocs maybeCachedExternal maybeCachedLocal activeFileTokens

                        Nothing ->
                            getExternalAndLocalHints isGlobal maybeActiveFile projectFileContentsDict projectDependencies packageDocs Nothing Nothing activeFileTokens

                ( exposedAndTopLevelHints, unexposedHints, variableHints ) =
                    case ( external, local ) of
                        ( Just external, Just local ) ->
                            ( external.importedHints ++ local.topLevelHints, external.unimportedHints, local.variableHints )

                        _ ->
                            ( [], [], [] )

                filterByPartial =
                    filterHintsByPartial partial maybeInferredTipe isFiltered isRegex isTypeSignature

                filteredDefaultHints =
                    filterByPartial defaultSuggestions

                filteredExposedHints =
                    filterByPartial exposedAndTopLevelHints

                filteredUnexposedHints =
                    filterByPartial unexposedHints

                filteredVariableHints =
                    filterByPartial variableHints

                hints =
                    case maybeInferredTipe of
                        Just tipeString ->
                            let
                                partitionHints hints =
                                    List.partition (partitionByTipe tipeString preceedingToken) hints

                                ( variableHintsCompatible, variableHintsNotCompatible ) =
                                    partitionHints filteredVariableHints

                                ( defaultHintsCompatible, defaultHintsNotCompatible ) =
                                    partitionHints filteredDefaultHints

                                ( exposedHintsCompatible, exposedHintsNotCompatible ) =
                                    partitionHints filteredExposedHints

                                ( unexposedHintsCompatible, unexposedHintsNotCompatible ) =
                                    partitionHints filteredUnexposedHints
                            in
                            sortHintsByScore tipeString preceedingToken variableHintsCompatible
                                ++ sortHintsByScore tipeString preceedingToken defaultHintsCompatible
                                ++ sortHintsByScore tipeString preceedingToken exposedHintsCompatible
                                ++ sortHintsByScore tipeString preceedingToken unexposedHintsCompatible
                                ++ (sortHintsByName
                                        (filterTypeIncompatibleHints partial isFiltered isRegex variableHintsNotCompatible
                                            ++ filterTypeIncompatibleHints partial isFiltered isRegex defaultHintsNotCompatible
                                            ++ filterTypeIncompatibleHints partial isFiltered isRegex exposedHintsNotCompatible
                                        )
                                        ++ sortHintsByName (filterTypeIncompatibleHints partial isFiltered isRegex unexposedHintsNotCompatible)
                                   )

                        Nothing ->
                            (filteredVariableHints
                                ++ filteredDefaultHints
                                ++ filteredExposedHints
                                ++ filteredUnexposedHints
                            )
                                |> (\hints ->
                                        if isFiltered then
                                            sortHintsByName hints

                                        else
                                            hints
                                   )
            in
            ( hints, Just { external = external, local = local } )

        Nothing ->
            ( [], maybeHintsCache )


filterHintsByPartial : String -> Maybe TipeString -> Bool -> Bool -> Bool -> List Hint -> List Hint
filterHintsByPartial partial maybeInferredTipe isFiltered isRegex isTypeSignature hints =
    if isFiltered || isRegex || isTypeSignature then
        let
            filter =
                List.filter
                    (\hint ->
                        let
                            fieldValue =
                                if isTypeSignature then
                                    hint.tipe

                                else
                                    hint.name
                        in
                        filterHintsFunction isRegex isTypeSignature partial hint.name fieldValue
                    )
        in
        case maybeInferredTipe of
            Just _ ->
                if partial == "" then
                    hints

                else
                    filter hints

            Nothing ->
                filter hints

    else
        hints


compressTipeRegex : Regex.Regex
compressTipeRegex =
    Regex.regex "\\s*(->|:|,)\\s*|(\\{|\\()\\s*|\\s*(\\}|\\))"


compressTipeString : String -> String
compressTipeString =
    Regex.replace Regex.All compressTipeRegex (\{ match } -> String.trim match)


filterHintsFunction : Bool -> Bool -> String -> String -> String -> Bool
filterHintsFunction isRegex isTypeSignature testString name fieldValue =
    let
        startsWithName =
            -- -- Case-insensitive comparison
            -- String.startsWith (String.toLower testString) (String.toLower name)
            String.startsWith testString name
    in
    if (isRegex && String.startsWith "/" testString) || (isTypeSignature && String.startsWith ":" testString) then
        let
            strippedTestString =
                testString
                    |> String.dropLeft 1

            -- NOTE: The regex expressions should be pre-validated outside of Elm to prevent crashing.
            ( fieldValueExpression, nameExpression ) =
                if isTypeSignature then
                    let
                        ( testString1, maybeTestString2 ) =
                            case String.split "__" strippedTestString of
                                [ namePart, typeSignaturePart ] ->
                                    ( typeSignaturePart, Just namePart )

                                _ ->
                                    ( strippedTestString, Nothing )
                    in
                    ( testString1
                        |> Regex.replace Regex.All (Regex.regex "_") (\_ -> " ")
                        |> compressTipeString
                    , maybeTestString2
                    )

                else
                    ( strippedTestString, Nothing )

            formattedFieldValue =
                if isTypeSignature then
                    compressTipeString fieldValue

                else
                    fieldValue
        in
        if fieldValueExpression == "" then
            startsWithName

        else
            startsWithName
                || (Regex.contains (Regex.regex fieldValueExpression) formattedFieldValue
                        && (nameExpression == Nothing || Regex.contains (Regex.regex (Maybe.withDefault "" nameExpression)) name)
                   )

    else
        startsWithName


filterTypeIncompatibleHints : String -> Bool -> Bool -> List Hint -> List Hint
filterTypeIncompatibleHints partial isFiltered isRegex hints =
    if partial == "" then
        []

    else if isFiltered || isRegex then
        hints
            |> List.filter
                (\{ name } ->
                    filterHintsFunction isRegex False partial name name
                )

    else
        hints


getTipeDistance : String -> String -> Int
getTipeDistance tipe1 tipe2 =
    if tipe1 == tipe2 then
        0

    else
        let
            parts1 =
                getArgsParts tipe1

            numParts1 =
                List.length parts1

            parts2 =
                getArgsParts tipe2

            numParts2 =
                List.length parts2

            genericTipePenalty =
                if numParts2 == 1 && isTipeVariable tipe2 && not (isTypeClass tipe2) then
                    numParts1

                else
                    0
        in
        (if numParts1 == numParts2 then
            List.map2
                (\part1 part2 ->
                    if part1 == part2 then
                        0

                    else
                        1
                )
                parts1
                parts2
                |> List.sum

         else
            max numParts1 numParts2
        )
            + genericTipePenalty


sortHintsByScore : TipeString -> Maybe String -> List Hint -> List Hint
sortHintsByScore tipeString preceedingToken hints =
    hints
        |> List.map
            (\hint ->
                { hint = hint
                , distance =
                    getTipeDistance (getReturnTipe tipeString) (getReturnTipe hint.tipe)
                        + (case preceedingToken of
                            Just token ->
                                case token of
                                    "|>" ->
                                        getTipeDistance (lastParameterTipe tipeString) (lastParameterTipe hint.tipe)

                                    _ ->
                                        0

                            Nothing ->
                                0
                          )
                }
            )
        |> dictGroupBy .distance
        |> Dict.toList
        |> List.sortWith
            (\a b ->
                compare (Tuple.first a) (Tuple.first b)
            )
        |> List.map Tuple.second
        |> List.concatMap
            (\group ->
                sortHintsByName (List.map .hint group)
            )


sortHintsByName : List Hint -> List Hint
sortHintsByName =
    List.sortBy .name


partitionByTipe : TipeString -> Maybe String -> Hint -> Bool
partitionByTipe tipeString preceedingToken hint =
    let
        returnTipe1 =
            getReturnTipe tipeString

        returnTipe2 =
            getReturnTipe hint.tipe
    in
    (List.length (getTipeParts tipeString) <= List.length (getTipeParts hint.tipe))
        && (areTipesCompatibleRecur returnTipe1 returnTipe2
                || areTipesCompatibleRecur returnTipe2 returnTipe1
           )
        && (case preceedingToken of
                Just token ->
                    case token of
                        "|>" ->
                            let
                                parameterTipe1 =
                                    lastParameterTipe tipeString

                                parameterTipe2 =
                                    lastParameterTipe hint.tipe
                            in
                            areTipesCompatibleRecur parameterTipe1 parameterTipe2
                                || areTipesCompatibleRecur parameterTipe2 parameterTipe1

                        _ ->
                            True

                Nothing ->
                    True
           )


lastParameterTipe : TipeString -> String
lastParameterTipe tipeString =
    let
        parts =
            getTipeParts tipeString
    in
    case List.tail parts of
        Just _ ->
            parts
                |> Helper.dropLast
                |> Helper.last
                |> Maybe.withDefault ""

        Nothing ->
            ""


getExposedAndUnexposedHints : Bool -> FilePath -> ImportDict -> List ModuleDocs -> ( List Hint, List Hint )
getExposedAndUnexposedHints includeUnexposed activeFilePath imports moduleDocsList =
    let
        ( exposedLists, unexposedLists ) =
            moduleDocsList
                |> List.foldl
                    (\moduleDocs ( accExposedHints, accUnexposedHints ) ->
                        let
                            aliasesTipesAndValues =
                                moduleDocs.values.aliases
                                    ++ List.map tipeToValue moduleDocs.values.tipes
                                    ++ moduleDocs.values.values

                            tipeCases =
                                List.concatMap .cases moduleDocs.values.tipes

                            allNames =
                                List.map .name aliasesTipesAndValues
                                    ++ List.map .name tipeCases

                            ( exposedHints, unexposedHints ) =
                                case Dict.get moduleDocs.name imports of
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
                                                    |> List.filter
                                                        (\name ->
                                                            not (Set.member name exposedNames)
                                                        )
                                                    |> Set.fromList
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
                                            getHintsForUnexposedNames True moduleDocs (Set.fromList allNames)

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


getSuggestionsForImport : String -> Bool -> Maybe ActiveFile -> ProjectFileContentsDict -> List ModuleDocs -> List ImportSuggestion
getSuggestionsForImport partial isFiltered maybeActiveFile projectFileContentsDict projectPackageDocs =
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
            if isFiltered then
                suggestions
                    |> List.filter
                        (\{ name } ->
                            String.startsWith partial name
                        )
                    |> List.sortBy .name

            else
                suggestions

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
                                        Dict.update moduleName (\_ -> Just { moduleImport | exposed = All }) fileContents.imports

                                    else
                                        Dict.update moduleName (\_ -> Just { moduleImport | exposed = Some (Set.insert symbolName exposed) }) fileContents.imports

                                None ->
                                    Dict.update moduleName (\_ -> Just { moduleImport | exposed = Some (Set.singleton symbolName) }) fileContents.imports

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
                |> Dict.filter
                    (\moduleName moduleImport ->
                        not (List.member ( moduleName, moduleImport ) (Dict.toList defaultImports))
                    )

        updatedFileContents =
            { fileContents | imports = updatedImports }
    in
    ( { model | projectFileContentsDict = updateFileContents filePath projectDirectory updatedFileContents model.projectFileContentsDict }
    , ( filePath, importsToString updatedImports model.activeFileTokens )
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
    , constructFromTypeAnnotation typeAnnotation model.activeFileTokens
        |> fromTypeAnnotationConstructedCmd
    )


constructFromTypeAnnotation : String -> TokenDict -> String
constructFromTypeAnnotation typeAnnotation activeFileTokens =
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
            getParameterTipes tipeString

        argNames =
            getDefaultArgNames parameterTipes
    in
    if isEncoderTipe tipeString then
        name
            ++ " "
            -- ++ (String.join "" argNames)
            ++ "v"
            ++ " =\n"
            ++ Helper.indentLines 1
                (case List.head parameterTipes of
                    Just tipeSansValue ->
                        let
                            encoderModuleName =
                                getModuleName returnTipe

                            encoderValue =
                                getDefaultEncoderRecur activeFileTokens
                                    Set.empty
                                    (if encoderModuleName == "" then
                                        ""

                                     else
                                        encoderModuleName ++ "."
                                    )
                                    (Just "v")
                                    0
                                    tipeSansValue
                        in
                        formatDecoderEncoderFunctionBody encoderValue
                            |> String.trim

                    Nothing ->
                        "_"
                )

    else
        name
            ++ (if List.length argNames > 0 then
                    " "

                else
                    ""
               )
            ++ String.join " " argNames
            ++ " =\n"
            ++ Helper.indentLines 1 (getDefaultValueForType activeFileTokens returnTipe)


getParameterTipes : TipeString -> List String
getParameterTipes tipeString =
    getTipeParts tipeString
        |> Helper.dropLast


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
    superTipes
        ++ [ "Int"
           , "Float"
           , "Bool"
           , "String"
           ]


superTipes : List TipeString
superTipes =
    [ "number"
    , "appendable"
    , "comparable"

    -- , "compappend"
    ]


isTypeClass : TipeString -> Bool
isTypeClass tipeString =
    List.member tipeString superTipes


getDefaultValueForType : TokenDict -> TipeString -> String
getDefaultValueForType activeFileTokens tipeString =
    getDefaultValueForTypeRecur activeFileTokens Set.empty tipeString


getDefaultValueForTypeRecur : TokenDict -> Set.Set String -> TipeString -> String
getDefaultValueForTypeRecur activeFileTokens visitedTypes tipeString =
    if String.trim tipeString == "" then
        "_"

    else if isDecoderTipe tipeString then
        let
            tipeParts =
                tipeString
                    |> String.split " "
        in
        case List.head tipeParts of
            Just decoderTipe ->
                let
                    tipeSansDecoder =
                        tipeParts
                            |> List.tail
                            |> Maybe.withDefault []
                            |> String.join " "

                    decoderModuleName =
                        getModuleName decoderTipe

                    decoderValue =
                        getDefaultDecoderRecur activeFileTokens
                            Set.empty
                            (if decoderModuleName == "" then
                                ""

                             else
                                decoderModuleName ++ "."
                            )
                            Nothing
                            0
                            tipeSansDecoder
                in
                formatDecoderEncoderFunctionBody decoderValue

            Nothing ->
                "_"

    else if isRecordString tipeString then
        let
            fieldsAndValues =
                getRecordTipeParts tipeString
                    |> List.map
                        (\( field, tipe ) ->
                            field ++ " = " ++ getDefaultValueForTypeRecur activeFileTokens visitedTypes tipe
                        )
                    |> String.join ", "
        in
        "{ " ++ fieldsAndValues ++ " }"

    else if isTupleString tipeString then
        let
            parts =
                getTupleParts tipeString
                    |> List.map
                        (\part ->
                            getDefaultValueForTypeRecur activeFileTokens visitedTypes part
                        )
        in
        getTupleStringFromParts parts

    else if isFunctionTipe tipeString then
        let
            arguments =
                getTipeParts tipeString
                    |> Helper.dropLast
                    |> getDefaultArgNames
                    |> String.join " "

            returnValue =
                getReturnTipe tipeString
                    |> getDefaultValueForTypeRecur activeFileTokens visitedTypes
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
                        case getHintsForToken (Just headTipeString) activeFileTokens |> List.head of
                            Just hint ->
                                -- Avoid infinite recursion.
                                if
                                    (hint.kind /= KindType)
                                        && (hint.tipe /= headTipeString)
                                        && (hint.kind /= KindTypeAlias || (hint.kind == KindTypeAlias && List.length hint.args == 0))
                                    -- TODO: ^ Make it work with aliases with type variables (e.g. `type alias AliasedType a b = ( a, b )`).
                                then
                                    if Set.member hint.name visitedTypes then
                                        "_"

                                    else
                                        getDefaultValueForTypeRecur activeFileTokens (Set.insert hint.name visitedTypes) hint.tipe

                                else if hint.kind == KindType then
                                    case List.head hint.cases of
                                        Just tipeCase ->
                                            if Set.member hint.name visitedTypes then
                                                "_"

                                            else
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
                                                    ++ String.join " " (List.map (getDefaultValueForTypeRecur activeFileTokens (Set.insert hint.name visitedTypes)) alignedArgs)

                                        Nothing ->
                                            "_"

                                else
                                    "_"

                            Nothing ->
                                "_"

            Nothing ->
                "_"


formatDecoderEncoderFunctionBody : String -> String
formatDecoderEncoderFunctionBody str =
    -- Remove first line if it's empty.
    -- Also remove parentheses if they're not necessary.
    let
        lines =
            str
                |> String.split "\n"
    in
    (case List.head lines of
        Just firstLine ->
            if String.trim firstLine == "" then
                List.drop 1 lines
                    |> String.join "\n"

            else
                str

        Nothing ->
            str
    )
        |> unencloseParentheses


getDefaultDecoderRecur : TokenDict -> Set.Set String -> String -> Maybe String -> Int -> TipeString -> String
getDefaultDecoderRecur activeFileTokens visitedTypes decoderModuleName maybeHintName indents tipeString =
    if String.trim tipeString == "" then
        "_"

    else if isRecordString tipeString then
        case maybeHintName of
            Just hintName ->
                let
                    fieldsAndValues =
                        getRecordTipeParts tipeString

                    numFieldAndValues =
                        List.length fieldsAndValues
                in
                if numFieldAndValues > 0 then
                    let
                        mapSuffix =
                            case numFieldAndValues of
                                1 ->
                                    ""

                                n ->
                                    toString n
                    in
                    ("\n" ++ Helper.indent indents ++ "(" ++ decoderModuleName ++ "map" ++ mapSuffix ++ " " ++ hintName ++ "\n")
                        ++ (fieldsAndValues
                                |> List.map
                                    (\( field, tipe ) ->
                                        let
                                            inner =
                                                getDefaultDecoderRecur activeFileTokens visitedTypes decoderModuleName Nothing (indents + 2) tipe

                                            innerLines =
                                                inner |> String.split "\n"

                                            isMultiline =
                                                List.length innerLines > 1
                                        in
                                        Helper.indent (indents + 1)
                                            ++ "("
                                            ++ decoderModuleName
                                            ++ "field \""
                                            ++ field
                                            ++ "\" "
                                            ++ inner
                                            ++ (if isMultiline then
                                                    "\n" ++ Helper.indent (indents + 1) ++ ")"

                                                else
                                                    ")"
                                               )
                                    )
                                |> String.join "\n"
                           )
                        ++ ("\n" ++ Helper.indent indents ++ ")")

                else
                    "_"

            Nothing ->
                "_"

    else if isTupleString tipeString then
        let
            parts =
                getTupleParts tipeString
                    |> List.indexedMap
                        (\index partTipe ->
                            Helper.indent (indents + 1) ++ "(" ++ decoderModuleName ++ "index " ++ toString index ++ " " ++ getDefaultDecoderRecur activeFileTokens visitedTypes decoderModuleName Nothing (indents + 1) partTipe ++ ")"
                        )

            numParts =
                List.length parts
        in
        ("\n" ++ Helper.indent indents ++ "(" ++ decoderModuleName ++ "map" ++ toString numParts ++ " (" ++ (List.repeat (numParts - 1) "," |> String.join "") ++ ")\n")
            ++ String.join "\n" parts
            ++ ("\n" ++ Helper.indent indents ++ ")")

    else
        let
            tipeParts =
                String.split " " (unencloseParentheses tipeString)

            tailParts =
                List.tail tipeParts
                    |> Maybe.withDefault []

            tailTipe =
                tailParts |> String.join " "

            wrapWith decodeFunction =
                let
                    inner =
                        getDefaultDecoderRecur activeFileTokens visitedTypes decoderModuleName Nothing (indents + 1) tailTipe

                    numLines =
                        String.split "\n" inner |> List.length
                in
                if numLines > 1 then
                    ("\n" ++ Helper.indent indents ++ "(" ++ decoderModuleName ++ decodeFunction ++ " " ++ inner)
                        ++ ("\n" ++ Helper.indent indents ++ ")")

                else
                    "(" ++ decoderModuleName ++ decodeFunction ++ " " ++ inner ++ ")"
        in
        case List.head tipeParts of
            Just headTipeString ->
                case headTipeString of
                    -- Primitives
                    "number" ->
                        decoderModuleName ++ "float"

                    "Int" ->
                        decoderModuleName ++ "int"

                    "Float" ->
                        decoderModuleName ++ "float"

                    "Bool" ->
                        decoderModuleName ++ "bool"

                    "String" ->
                        decoderModuleName ++ "string"

                    -- Core
                    "List" ->
                        wrapWith "list"

                    "Array.Array" ->
                        wrapWith "array"

                    "Dict.Dict" ->
                        case List.head tailParts of
                            Just "String" ->
                                "(" ++ decoderModuleName ++ "dict " ++ getDefaultDecoderRecur activeFileTokens visitedTypes decoderModuleName Nothing indents (List.tail tailParts |> Maybe.withDefault [] |> String.join " ") ++ ")"

                            _ ->
                                "_"

                    "Maybe" ->
                        "(" ++ decoderModuleName ++ "maybe " ++ getDefaultDecoderRecur activeFileTokens visitedTypes decoderModuleName Nothing indents tailTipe ++ ")"

                    headTipeString ->
                        if
                            (getLastName headTipeString == "Value")
                                && (getModuleName headTipeString == decoderModuleName || getModuleName headTipeString ++ "." == decoderModuleName)
                        then
                            decoderModuleName ++ "value"

                        else
                            case getHintsForToken (Just headTipeString) activeFileTokens |> List.head of
                                Just hint ->
                                    -- Avoid infinite recursion.
                                    if
                                        (hint.kind /= KindType)
                                            && (hint.tipe /= headTipeString)
                                            && (hint.kind /= KindTypeAlias || (hint.kind == KindTypeAlias && List.length hint.args == 0))
                                        -- TODO: ^ Make it work with aliases with type variables (e.g. `type alias AliasedType a b = ( a, b )`).
                                    then
                                        if Set.member hint.name visitedTypes then
                                            "_"

                                        else
                                            getDefaultDecoderRecur activeFileTokens (Set.insert hint.name visitedTypes) decoderModuleName (Just hint.name) indents hint.tipe

                                    else if hint.kind == KindType then
                                        -- Decoder for union types.
                                        ("\n" ++ Helper.indent indents ++ "(" ++ decoderModuleName ++ "string")
                                            ++ ("\n" ++ Helper.indent (indents + 1) ++ "|> " ++ decoderModuleName ++ "andThen")
                                            ++ ("\n" ++ Helper.indent (indents + 2) ++ "(\\string ->")
                                            ++ ("\n" ++ Helper.indent (indents + 3) ++ "case string of\n")
                                            ++ (List.map (\tipeCase -> Helper.indent (indents + 4) ++ "\"" ++ tipeCase.name ++ "\" ->\n" ++ Helper.indent (indents + 5) ++ decoderModuleName ++ "succeed " ++ tipeCase.name) hint.cases |> String.join "\n\n")
                                            ++ ("\n\n" ++ Helper.indent (indents + 4) ++ "_ ->\n" ++ Helper.indent (indents + 5) ++ decoderModuleName ++ "fail \"Invalid " ++ hint.name ++ "\"")
                                            ++ ("\n" ++ Helper.indent (indents + 2) ++ ")")
                                            ++ ("\n" ++ Helper.indent indents ++ ")")
                                        -- TODO: Use `Json.Decode.lazy` for recursive types.

                                    else
                                        "_"

                                Nothing ->
                                    "_"

            Nothing ->
                "_"


getDefaultEncoderRecur : TokenDict -> Set.Set String -> String -> Maybe String -> Int -> TipeString -> String
getDefaultEncoderRecur activeFileTokens visitedTypes encoderModuleName maybeObjectName indents tipeString =
    if String.trim tipeString == "" then
        "_"

    else if isRecordString tipeString then
        case maybeObjectName of
            Just objectName ->
                let
                    fieldsAndValues =
                        getRecordTipeParts tipeString

                    numFieldAndValues =
                        List.length fieldsAndValues
                in
                if numFieldAndValues > 0 then
                    ("\n" ++ Helper.indent indents ++ "(" ++ encoderModuleName ++ "object" ++ "\n")
                        ++ (fieldsAndValues
                                |> List.indexedMap
                                    (\index ( fieldName, tipe ) ->
                                        let
                                            inner =
                                                getDefaultEncoderRecur activeFileTokens visitedTypes encoderModuleName (Just (objectName ++ "." ++ fieldName)) (indents + 2) tipe

                                            innerLines =
                                                inner |> String.split "\n"

                                            isMultiline =
                                                List.length innerLines > 1

                                            prefix =
                                                if index == 0 then
                                                    "[ "

                                                else
                                                    ", "
                                        in
                                        Helper.indent (indents + 1)
                                            ++ prefix
                                            ++ "( \""
                                            ++ fieldName
                                            ++ "\""
                                            ++ (if isMultiline then
                                                    "\n" ++ Helper.indent (indents + 1) ++ "  , "

                                                else
                                                    ", "
                                               )
                                            ++ (formatDecoderEncoderFunctionBody inner |> String.trim)
                                            ++ (if isMultiline then
                                                    "\n" ++ Helper.indent (indents + 1) ++ "  )"

                                                else
                                                    " )"
                                               )
                                    )
                                |> String.join "\n"
                           )
                        ++ ("\n" ++ Helper.indent (indents + 1) ++ "]")
                        ++ ("\n" ++ Helper.indent indents ++ ")")

                else
                    "_"

            Nothing ->
                "_"

    else if isTupleString tipeString then
        case maybeObjectName of
            Just objectName ->
                let
                    parts =
                        getTupleParts tipeString
                            |> List.indexedMap
                                (\index partTipe ->
                                    getDefaultEncoderRecur activeFileTokens visitedTypes encoderModuleName (Just <| "v" ++ toString index) indents partTipe
                                )
                in
                ("\n" ++ Helper.indent indents ++ "let\n")
                    ++ (Helper.indent (indents + 1) ++ "( " ++ (List.indexedMap (\index _ -> "v" ++ toString index) parts |> String.join ", ") ++ " ) =\n")
                    ++ (Helper.indent (indents + 2) ++ objectName)
                    ++ ("\n" ++ Helper.indent indents ++ "in\n")
                    ++ (Helper.indent (indents + 1)
                            ++ encoderModuleName
                            ++ "list [ "
                       )
                    ++ String.join ", " parts
                    ++ " ]"

            Nothing ->
                "_"

    else
        let
            tipeParts =
                String.split " " (unencloseParentheses tipeString)

            tailParts =
                List.tail tipeParts
                    |> Maybe.withDefault []

            tailTipe =
                tailParts |> String.join " "

            objectName =
                maybeObjectName |> Maybe.withDefault ""

            wrapWithMap moduleName =
                (Helper.indent indents ++ "(" ++ encoderModuleName ++ String.toLower moduleName ++ " ")
                    ++ ("\n" ++ Helper.indent (indents + 1) ++ "(" ++ moduleName ++ ".map")
                    ++ ("\n" ++ Helper.indent (indents + 2) ++ "(\\v -> ")
                    ++ getDefaultEncoderRecur activeFileTokens visitedTypes encoderModuleName (Just "v") (indents + 3) tailTipe
                    ++ ("\n" ++ Helper.indent (indents + 2) ++ ")")
                    ++ ("\n" ++ Helper.indent (indents + 2) ++ objectName)
                    ++ ("\n" ++ Helper.indent (indents + 1) ++ ")")
                    ++ ("\n" ++ Helper.indent indents ++ ")")
        in
        case List.head tipeParts of
            Just headTipeString ->
                case headTipeString of
                    -- Primitives
                    "number" ->
                        encoderModuleName ++ "float " ++ objectName

                    "Int" ->
                        encoderModuleName ++ "int " ++ objectName

                    "Float" ->
                        encoderModuleName ++ "float " ++ objectName

                    "Bool" ->
                        encoderModuleName ++ "bool " ++ objectName

                    "String" ->
                        encoderModuleName ++ "string " ++ objectName

                    -- Core
                    "List" ->
                        wrapWithMap "List"

                    "Array.Array" ->
                        wrapWithMap "Array"

                    "Dict.Dict" ->
                        case List.head tailParts of
                            Just "String" ->
                                let
                                    dictValueTipe =
                                        List.tail tailParts
                                            |> Maybe.withDefault []
                                            |> String.join " "
                                in
                                "(" ++ encoderModuleName ++ "object (List.map (\\( k, v ) -> ( k, " ++ getDefaultEncoderRecur activeFileTokens visitedTypes encoderModuleName (Just "v") indents dictValueTipe ++ " )) (Dict.toList " ++ objectName ++ ")))"

                            _ ->
                                "_"

                    "Maybe" ->
                        ("\n" ++ Helper.indent indents ++ "case " ++ objectName ++ " of\n")
                            ++ (Helper.indent (indents + 1) ++ "Just v ->\n")
                            ++ (Helper.indent (indents + 2) ++ getDefaultEncoderRecur activeFileTokens visitedTypes encoderModuleName (Just "v") (indents + 2) tailTipe ++ "\n\n")
                            ++ (Helper.indent (indents + 1) ++ "Nothing ->\n")
                            ++ (Helper.indent (indents + 2) ++ encoderModuleName ++ "null")

                    headTipeString ->
                        if getLastName headTipeString == "Value" then
                            -- TODO: Check if `Value` is from `Json.Decode` of `elm-lang/core`.
                            objectName

                        else
                            case getHintsForToken (Just headTipeString) activeFileTokens |> List.head of
                                Just hint ->
                                    -- Avoid infinite recursion.
                                    if
                                        (hint.kind /= KindType)
                                            && (hint.tipe /= headTipeString)
                                            && (hint.kind /= KindTypeAlias || (hint.kind == KindTypeAlias && List.length hint.args == 0))
                                        -- TODO: ^ Make it work with aliases with type variables (e.g. `type alias AliasedType a b = ( a, b )`).
                                    then
                                        if Set.member hint.name visitedTypes then
                                            "_"

                                        else
                                            getDefaultEncoderRecur activeFileTokens (Set.insert hint.name visitedTypes) encoderModuleName maybeObjectName indents hint.tipe

                                    else if hint.kind == KindType then
                                        -- Encoder for union types.
                                        ("\n" ++ Helper.indent indents ++ "case " ++ objectName ++ " of\n")
                                            ++ (List.map
                                                    (\tipeCase ->
                                                        (Helper.indent (indents + 1) ++ tipeCase.name ++ " ->\n")
                                                            ++ (Helper.indent (indents + 2) ++ encoderModuleName ++ "string " ++ "\"" ++ tipeCase.name ++ "\"")
                                                    )
                                                    hint.cases
                                                    |> String.join "\n\n"
                                               )

                                    else
                                        "_"

                                Nothing ->
                                    "_"

            Nothing ->
                "_"


doConstructCaseOf : Token -> Model -> ( Model, Cmd Msg )
doConstructCaseOf token model =
    ( model
    , constructCaseOf token model.activeFileTokens
        |> caseOfConstructedCmd
    )


doConstructDefaultValueForType : Token -> Model -> ( Model, Cmd Msg )
doConstructDefaultValueForType token model =
    ( model
    , constructDefaultValueForType token model.activeFileTokens
        |> defaultValueForTypeConstructedCmd
    )


doConstructDefaultArguments : Token -> Model -> ( Model, Cmd Msg )
doConstructDefaultArguments token model =
    ( model
    , constructDefaultArguments token model.activeFileTokens
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
constructCaseOf token activeFileTokens =
    case getHintsForToken (Just token) activeFileTokens |> List.head of
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
                                    getHintsForToken (Just tokenTipeName) activeFileTokens
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
constructDefaultValueForType token activeFileTokens =
    if
        -- isPrimitiveTipe token
        --     ||
        (getHintsForToken (Just token) activeFileTokens
            |> List.filter (\hint -> hint.kind == KindType || hint.kind == KindTypeAlias)
            |> List.length
        )
            > 0
    then
        getDefaultValueForType activeFileTokens token
            |> Just

    else
        Nothing


constructDefaultArguments : Token -> TokenDict -> Maybe (List String)
constructDefaultArguments token activeFileTokens =
    case getHintsForToken (Just token) activeFileTokens |> List.head of
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
                                getDefaultValueForType activeFileTokens tipeString
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
                    ( partName2 ++ toString (count + 1)
                    , Dict.update partName2 (\_ -> Just (count + 1)) argNameCounters2
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

    else if isFunctionTipe argString then
        updatePartNameAndArgNameCounters "function" argNameCounters

    else
        updatePartNameAndArgNameCounters (tipeToVar argString) argNameCounters


doGetAliasesOfType : Token -> Model -> ( Model, Cmd Msg )
doGetAliasesOfType token model =
    ( model
    , getAliasesOfType model.activeFileTokens "" token
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
            "( " ++ String.join ", " parts ++ " )"


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
    getActiveFileContents maybeActiveFile fileContentsDict
        |> getImportsPlusActiveModule


getImportsPlusActiveModule : FileContents -> ImportDict
getImportsPlusActiveModule fileContents =
    Dict.update fileContents.moduleDocs.name (\_ -> Just { alias = Nothing, exposed = All }) fileContents.imports


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
            packageUri ++ "docs.json"
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
    jsonString
        |> Decode.decodeString (Decode.list (decodeModuleDocs packageUri))
        |> Result.toMaybe
        |> Maybe.withDefault []


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
    , tipe : TipeString
    , caseTipe : Maybe String
    , kind : SymbolKind
    }


type alias EncodedSymbol =
    { fullName : String
    , sourcePath : SourcePath
    , tipe : TipeString
    , caseTipe : Maybe String
    , kind : String
    }


encodeSymbol : Symbol -> EncodedSymbol
encodeSymbol symbol =
    { fullName = symbol.fullName
    , sourcePath = symbol.sourcePath
    , tipe = symbol.tipe
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


getActiveFileTokens : Maybe ActiveFile -> Maybe ActiveTopLevel -> ProjectFileContentsDict -> ProjectDependencies -> List ModuleDocs -> TokenDict
getActiveFileTokens maybeActiveFile maybeActiveTopLevel projectFileContentsDict projectDependencies packageDocs =
    case maybeActiveFile of
        Just { projectDirectory, filePath } ->
            let
                fileContentsDict =
                    getFileContentsOfProject projectDirectory projectFileContentsDict

                importsPlusActiveModule =
                    getImportsPlusActiveModuleForActiveFile maybeActiveFile fileContentsDict

                getHints moduleDocs =
                    Maybe.map
                        (getFilteredHints filePath moduleDocs)
                        (Dict.get moduleDocs.name importsPlusActiveModule)

                insertTokenAndHint ( token, hint ) dict =
                    Dict.update token (\value -> Just (hint :: Maybe.withDefault [] value)) dict

                projectPackageDocs =
                    getProjectPackageDocs maybeActiveFile projectDependencies packageDocs

                topLevelTokens =
                    projectPackageDocs
                        ++ getProjectModuleDocs projectDirectory projectFileContentsDict
                        |> List.filterMap getHints
                        |> List.concat
                        |> List.foldl insertTokenAndHint Dict.empty

                topLevelArgTipePairs =
                    getHintsForToken maybeActiveTopLevel topLevelTokens
                        |> List.concatMap
                            (\{ args, tipe } ->
                                List.map2 (,) args (getTipeParts tipe)
                            )

                argumentHints =
                    case maybeActiveTopLevel of
                        Just activeTopLevel ->
                            List.concatMap
                                (topLevelArgToHints
                                    filePath
                                    ( maybeActiveFile, projectFileContentsDict, projectDependencies, packageDocs )
                                    topLevelTokens
                                )
                                topLevelArgTipePairs

                        Nothing ->
                            []

                activeFileTokens =
                    (argumentHints
                        ++ (defaultSuggestions
                                |> List.filter (\hint -> hint.comment /= "")
                                |> List.map (\hint -> ( hint.name, hint ))
                           )
                    )
                        |> List.foldl insertTokenAndHint topLevelTokens
            in
            activeFileTokens

        Nothing ->
            Dict.empty


computeHintSourcePath : ( Maybe ActiveFile, Maybe ActiveTopLevel, ProjectFileContentsDict, ProjectDependencies, List ModuleDocs ) -> TokenDict -> Hint -> String
computeHintSourcePath ( maybeActiveFile, maybeActiveTopLevel, projectFileContentsDict, projectDependencies, packageDocs ) tokens hint =
    case maybeActiveFile of
        Just { filePath } ->
            if hint.kind == KindVariable then
                getSourcePathOfRecordFieldToken hint.name
                    filePath
                    maybeActiveTopLevel
                    ( maybeActiveFile, projectFileContentsDict, projectDependencies, packageDocs )
                    tokens

            else
                hint.sourcePath

        Nothing ->
            ""


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
                                        , getActiveFileTokens maybeNewActiveFile Nothing projectFileContentsDict projectDependencies packageDocs
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


filePathSeparator : String
filePathSeparator =
    " > "


{-|

    ```
    getArgsParts "a b c" == [ "a", "b", "c" ]
    ```

-}
getArgsParts : String -> List String
getArgsParts argsString =
    case argsString of
        "" ->
            []

        argsString ->
            let
                args =
                    getArgsPartsRecur argsString "" [] ( 0, 0 )
            in
            if List.member "->" args then
                [ argsString ]

            else
                args


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


{-|

    ```
    getTipeParts "Int -> Int -> Int" == [ "Int", "Int" ]
    getTipeParts "a -> b" == [ "a -> b" ]
    getTipeParts "(a -> b)" == [ "a", "b" ]
    ```

-}
getTipeParts : TipeString -> List String
getTipeParts tipeString =
    case tipeString of
        "" ->
            []

        tipeString ->
            let
                tipe =
                    if isFunctionTipe tipeString then
                        unencloseParentheses tipeString

                    else
                        tipeString
            in
            getTipePartsRecur tipe "" [] ( 0, 0 )


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


{-|

    ```
    getTupleParts "( Int, String )" == [ "Int", "String" ]
    ```

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


{-|

    ```
    getRecordArgParts "{ a, b }" == [ "a", "b" ]
    ```

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


{-|

    ```
    getRecordTipeParts "{ a : Int, b : String }" == [ ("a", "Int"), ("b", "String") ]
    ```

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


{-|

    ```
    getRecordTipeFieldNames "{ a : Int, b : String }" == [ "a", "b" ]
    ```

-}
getRecordTipeFieldNames : TipeString -> List String
getRecordTipeFieldNames tipeString =
    getRecordTipeParts tipeString
        |> List.map Tuple.first


{-|

    ```
    getRecordTipeFieldTipes "{ a : Int, b : String }" == [ "Int", "String" ]
    ```

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


topLevelArgToHints : SourcePath -> ( Maybe ActiveFile, ProjectFileContentsDict, ProjectDependencies, List ModuleDocs ) -> TokenDict -> ( String, TipeString ) -> List ( String, Hint )
topLevelArgToHints parentSourcePath ( maybeActiveFile, projectFileContentsDict, projectDependencies, packageDocs ) topLevelTokens ( name, tipeString ) =
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
                                            getRecordFieldTokens field
                                                tipeString
                                                parentSourcePath
                                                ( maybeActiveFile, projectFileContentsDict, projectDependencies, packageDocs )
                                                topLevelTokens
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
                    getRecordFieldTokens name
                        tipeString
                        parentSourcePath
                        ( maybeActiveFile, projectFileContentsDict, projectDependencies, packageDocs )
                        topLevelTokens
    in
    tipes
        |> List.concatMap getHint


getRecordFieldTokens : String -> TipeString -> SourcePath -> ( Maybe ActiveFile, ProjectFileContentsDict, ProjectDependencies, List ModuleDocs ) -> TokenDict -> List ( String, TipeString )
getRecordFieldTokens name tipeString parentSourcePath ( maybeActiveFile, projectFileContentsDict, projectDependencies, packageDocs ) topLevelTokens =
    getRecordFieldTokensRecur name tipeString parentSourcePath ( maybeActiveFile, projectFileContentsDict, projectDependencies, packageDocs ) topLevelTokens True Nothing Set.empty


getRecordFieldTokensRecur : String -> TipeString -> SourcePath -> ( Maybe ActiveFile, ProjectFileContentsDict, ProjectDependencies, List ModuleDocs ) -> TokenDict -> Bool -> Maybe String -> Set.Set ( String, String ) -> List ( String, TipeString )
getRecordFieldTokensRecur name tipeString parentSourcePath ( maybeActiveFile, projectFileContentsDict, projectDependencies, packageDocs ) topLevelTokens shouldAddSelf maybeRootTipeString visitedHints =
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
                                                    visitedHints
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
                                visitedHints
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
                                visitedHints
                        )
                    |> List.concat

             else
                case
                    getHintsForToken (Just tipeString) topLevelTokens
                        |> List.partition (.tipe >> isRecordString)
                        |> uncurry (++)
                        |> List.head
                of
                    Just hint ->
                        -- Avoid infinite recursion.
                        if hint.kind /= KindType && hint.tipe /= tipeString && not (Set.member ( hint.name, hint.sourcePath ) visitedHints) then
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
                                        getActiveFileTokens maybeNewActiveFile Nothing projectFileContentsDict projectDependencies packageDocs

                                      else
                                        topLevelTokens
                                    )

                                updatedVisitedSourcePaths =
                                    Set.insert ( hint.name, hint.sourcePath ) visitedHints
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


{-|

    ```
    isRecordString "{ x : Int , y : Int , ab : { a : Int , b : Int } , cd : Aaa.Cd }" == True
    ```

-}
isRecordString : String -> Bool
isRecordString tipeString =
    String.startsWith "{" tipeString && String.endsWith "}" tipeString


{-|

    ```
    isTupleString "()" == True
    isTupleString "(String, Int)" == True
    isTupleString "(List Int)" == False
    isTupleString "(List (String, Int))" == False
    isTupleString "(List {a : String, b : Int})" == False
    isTupleString "(a -> b)" == False
    ```

-}
isTupleString : String -> Bool
isTupleString tipeString =
    if tipeString == "()" then
        True

    else if String.startsWith "(" tipeString && String.endsWith ")" tipeString then
        case parseTipeString tipeString of
            Just (TypeTuple elements) ->
                case elements of
                    [ oneElement ] ->
                        False

                    _ ->
                        True

            _ ->
                False

    else
        False


isFunctionTipe : String -> Bool
isFunctionTipe tipeString =
    let
        tipe =
            if isTupleString tipeString then
                getTupleParts tipeString |> List.head |> Maybe.withDefault ""

            else
                tipeString
    in
    tipe /= "" && not (isRecordString tipe) && not (isTupleString tipe) && String.contains "->" tipe && List.length (getArgsParts tipe) == 1


isDecoderTipe : String -> Bool
isDecoderTipe tipeString =
    case List.head (String.split " " tipeString) of
        Just headTipeString ->
            -- TODO: Check that it's actually from `Json.Decode` of `elm-lang/core`.
            getLastName headTipeString == "Decoder"

        Nothing ->
            False


isEncoderTipe : String -> Bool
isEncoderTipe tipeString =
    -- Check that's in the form `Something -> Json.Encode.Value`.
    if getLastName (getReturnTipe tipeString) == "Value" && List.length (getParameterTipes tipeString) == 1 then
        -- TODO: Check that it's actually from `Json.Encode` of `elm-lang/core`.
        True

    else
        False


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
        , "Char" => Some (Set.fromList [ "Char" ])
        , "Debug" => None
        , "List" => Some (Set.fromList [ "List", "::" ])
        , "Maybe" => Some (Set.singleton "Maybe")
        , "Result" => Some (Set.singleton "Result")
        , "Platform" => Some (Set.singleton "Program")
        , ( "Platform.Cmd", Import (Just "Cmd") (Some (Set.fromList [ "Cmd" ])) )
        , ( "Platform.Sub", Import (Just "Sub") (Some (Set.singleton "Sub")) )
        , "String" => Some (Set.fromList [ "String" ])
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
                | name = "Int"
                , comment = "Integer."
             }
           , { emptyHint
                | name = "Float"
                , comment = "Floating-point number."
             }
           , { emptyHint
                | name = "Bool"
                , comment = "`True` or `False`."
             }
           , { emptyHint
                | name = "number"
                , comment = "Can be an `Int` or a `Float` depending on usage."
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
                case caseTipe of
                    Just caseTipe ->
                        Just (caseTipe ++ "(" ++ symbolName ++ ")")

                    Nothing ->
                        Just symbolName

              else
                Nothing
            )


unencloseParentheses : String -> String
unencloseParentheses str =
    let
        dropLength =
            if String.startsWith "(" str && String.endsWith ")" str then
                1

            else
                0
    in
    str
        |> String.dropLeft dropLength
        |> String.dropRight dropLength


dictGroupBy : (a -> comparable) -> List a -> Dict.Dict comparable (List a)
dictGroupBy keyfn list =
    -- From https://github.com/elm-community/dict-extra.
    List.foldr
        (\x acc ->
            Dict.update (keyfn x) (Maybe.map ((::) x) >> Maybe.withDefault [ x ] >> Just) acc
        )
        Dict.empty
        list



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
