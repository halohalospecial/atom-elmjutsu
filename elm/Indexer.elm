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


port module Indexer exposing (..)

import Dict
import Html exposing (..)
import Html.App as Html
import Http
import Json.Decode as Decode exposing ((:=))
import Set
import String
import Task
import Regex


main : Program Never
main =
    Html.program
        { init = init
        , view = (\_ -> div [] [])
        , update = update
        , subscriptions = subscriptions
        }


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.batch
        [ activeTokenChangedSub CursorMove
        , activeFileChangedSub UpdateActiveFile
        , fileContentsChangedSub (\( filePath, moduleDocs, rawImports ) -> UpdateFileContents filePath (FileContents moduleDocs (toImportDict rawImports)))
        , fileContentsRemovedSub RemoveFileContents
        , projectDependenciesChangedSub UpdateProjectDependencies
        , downloadMissingPackageDocsSub DownloadMissingPackageDocs
        , docsReadSub DocsRead
        , goToDefinitionSub GoToDefinition
        , goToSymbolSub GoToSymbol
        , getHintsForPartialSub GetHintsForPartial
        , getSuggestionsForImportSub GetSuggestionsForImport
        , askCanGoToDefinitionSub AskCanGoToDefinition
        , getImportersForTokenSub GetImporterSourcePathsForToken
        ]



-- INCOMING PORTS


port activeTokenChangedSub : (Maybe String -> msg) -> Sub msg


port activeFileChangedSub : (Maybe ActiveFile -> msg) -> Sub msg


port fileContentsChangedSub : (( String, ModuleDocs, List RawImport ) -> msg) -> Sub msg


port fileContentsRemovedSub : (String -> msg) -> Sub msg


port projectDependenciesChangedSub : (( String, List Dependency ) -> msg) -> Sub msg


port downloadMissingPackageDocsSub : (List Dependency -> msg) -> Sub msg


port docsReadSub : (List ( Dependency, String ) -> msg) -> Sub msg


port goToDefinitionSub : (Maybe String -> msg) -> Sub msg


port goToSymbolSub : (( Maybe String, Maybe String ) -> msg) -> Sub msg


port getHintsForPartialSub : (String -> msg) -> Sub msg


port getSuggestionsForImportSub : (String -> msg) -> Sub msg


port askCanGoToDefinitionSub : (String -> msg) -> Sub msg


port getImportersForTokenSub : (( Maybe String, Maybe String, Maybe Bool ) -> msg) -> Sub msg



-- OUTGOING PORTS


port docsReadCmd : () -> Cmd msg


port docsDownloadedCmd : List ( Dependency, String ) -> Cmd msg


port downloadDocsFailedCmd : () -> Cmd msg


port goToDefinitionCmd : EncodedSymbol -> Cmd msg


port goToSymbolCmd : ( Maybe String, Maybe ActiveFile, List EncodedSymbol ) -> Cmd msg


port activeFileChangedCmd : Maybe ActiveFile -> Cmd msg


port activeHintsChangedCmd : List EncodedHint -> Cmd msg


port readingPackageDocsCmd : () -> Cmd msg


port downloadingPackageDocsCmd : () -> Cmd msg


port readPackageDocsCmd : List Dependency -> Cmd msg


port hintsForPartialReceivedCmd : ( String, List EncodedHint ) -> Cmd msg


port suggestionsForImportReceivedCmd : ( String, List ImportSuggestion ) -> Cmd msg


port canGoToDefinitionRepliedCmd : ( String, Bool ) -> Cmd msg


port importersForTokenReceivedCmd : ( String, String, Bool, Bool, List ( String, Bool, Bool, List String ) ) -> Cmd msg



-- MODEL


type alias Model =
    { packageDocs : List ModuleDocs
    , fileContentsDict : FileContentsDict
    , activeTokens : TokenDict
    , activeHints : List Hint
    , activeFile : Maybe ActiveFile
    , projectDependencies : Dict.Dict String (List Dependency)
    }


type alias ActiveFile =
    { filePath : String
    , projectDirectory : String
    }


type alias FileContentsDict =
    Dict.Dict String FileContents


type alias FileContents =
    { moduleDocs : ModuleDocs
    , imports : ImportDict
    }


type alias Dependency =
    -- ( ProjectDirectory, Version )
    ( String, String )


init : ( Model, Cmd Msg )
init =
    ( emptyModel
      -- , Task.perform (always DownloadDocsFailed) DocsDownloaded (downloadPackageDocsList defaultPackages)
    , Cmd.none
    )


emptyModel : Model
emptyModel =
    { packageDocs = []
    , fileContentsDict = Dict.empty
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
    = DownloadDocsFailed
    | DocsDownloaded (List ( Dependency, String, List ModuleDocs ))
    | DocsRead (List ( Dependency, String ))
    | CursorMove (Maybe String)
    | UpdateActiveFile (Maybe ActiveFile)
    | UpdateFileContents String FileContents
    | RemoveFileContents String
    | UpdateProjectDependencies ( String, List Dependency )
    | GoToDefinition (Maybe String)
    | GoToSymbol ( Maybe String, Maybe String )
    | GetHintsForPartial String
    | GetSuggestionsForImport String
    | AskCanGoToDefinition String
    | GetImporterSourcePathsForToken ( Maybe String, Maybe String, Maybe Bool )
    | DownloadMissingPackageDocs (List Dependency)


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        DownloadDocsFailed ->
            ( model
            , downloadDocsFailedCmd ()
            )

        DocsDownloaded result ->
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

        CursorMove maybeToken ->
            let
                updatedActiveHints =
                    getHintsForToken maybeToken model.activeTokens
            in
                ( { model | activeHints = updatedActiveHints }
                , List.map encodeHint updatedActiveHints
                    |> activeHintsChangedCmd
                )

        UpdateActiveFile maybeActiveFile ->
            ( { model
                | activeFile = maybeActiveFile
                , activeTokens = toTokenDict maybeActiveFile model.fileContentsDict (getProjectPackageDocs maybeActiveFile model.projectDependencies model.packageDocs)
              }
            , activeFileChangedCmd maybeActiveFile
            )

        UpdateFileContents filePath fileContents ->
            let
                updatedFileContentsDict =
                    Dict.update filePath (always <| Just fileContents) model.fileContentsDict
            in
                ( { model
                    | fileContentsDict = updatedFileContentsDict
                    , activeTokens = toTokenDict model.activeFile updatedFileContentsDict (getProjectPackageDocs model.activeFile model.projectDependencies model.packageDocs)
                  }
                , activeFileChangedCmd model.activeFile
                )

        RemoveFileContents filePath ->
            let
                updatedFileContentsDict =
                    Dict.remove filePath model.fileContentsDict
            in
                ( { model
                    | fileContentsDict = updatedFileContentsDict
                    , activeTokens = toTokenDict model.activeFile updatedFileContentsDict (getProjectPackageDocs model.activeFile model.projectDependencies model.packageDocs)
                  }
                , activeFileChangedCmd model.activeFile
                )

        UpdateProjectDependencies ( projectDirectory, dependencies ) ->
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

        DownloadMissingPackageDocs dependencies ->
            ( model
            , Cmd.batch
                [ downloadingPackageDocsCmd ()
                , Task.perform (always DownloadDocsFailed) DocsDownloaded (downloadPackageDocsList dependencies)
                ]
            )

        GoToDefinition maybeToken ->
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
                                        |> goToDefinitionCmd
                            )
            in
                ( model
                , Cmd.batch requests
                )

        GoToSymbol ( maybeProjectDirectory, maybeToken ) ->
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
                        , ( defaultSymbolName, model.activeFile, List.map encodeSymbol (getProjectSymbols projectDirectory model.fileContentsDict) )
                            |> goToSymbolCmd
                        )

        GetHintsForPartial partial ->
            ( model
            , ( partial
              , getHintsForPartial partial model.activeFile model.fileContentsDict (getProjectPackageDocs model.activeFile model.projectDependencies model.packageDocs) model.activeTokens
                    |> List.map encodeHint
              )
                |> hintsForPartialReceivedCmd
            )

        GetSuggestionsForImport partial ->
            ( model
            , ( partial
              , getSuggestionsForImport partial model.activeFile model.fileContentsDict (getProjectPackageDocs model.activeFile model.projectDependencies model.packageDocs)
              )
                |> suggestionsForImportReceivedCmd
            )

        AskCanGoToDefinition token ->
            ( model
            , ( token
              , Dict.member token model.activeTokens
              )
                |> canGoToDefinitionRepliedCmd
            )

        GetImporterSourcePathsForToken ( maybeProjectDirectory, maybeToken, maybeIsCursorAtLastPartOfToken ) ->
            case ( maybeProjectDirectory, maybeToken, maybeIsCursorAtLastPartOfToken ) of
                ( Just projectDirectory, Just rawToken, Just isCursorAtLastPartOfToken ) ->
                    let
                        activeFileContents =
                            getActiveFileContents model.activeFile model.fileContentsDict

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
                          , getImportersForToken token isCursorAtLastPartOfToken model.activeFile model.activeTokens activeFileContents model.fileContentsDict
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
            , activeTokens = toTokenDict model.activeFile model.fileContentsDict (getProjectPackageDocs model.activeFile model.projectDependencies updatedPackageDocs)
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


getProjectSymbols : String -> FileContentsDict -> List Symbol
getProjectSymbols projectDirectory fileContentsDict =
    let
        allFileSymbols =
            Dict.values fileContentsDict
                |> List.concatMap
                    (\{ moduleDocs } ->
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
                    )
    in
        allFileSymbols
            |> List.filter
                (\{ sourcePath } ->
                    not (String.startsWith packageDocsPrefix sourcePath)
                        && isSourcePathInProjectDirectory projectDirectory sourcePath
                )


getHintsForToken : Maybe String -> TokenDict -> List Hint
getHintsForToken maybeToken tokens =
    case maybeToken of
        Nothing ->
            []

        Just token ->
            Maybe.withDefault [] (Dict.get token tokens)


getHintsForPartial : String -> Maybe ActiveFile -> FileContentsDict -> List ModuleDocs -> TokenDict -> List Hint
getHintsForPartial partial activeFile fileContentsDict projectPackageDocs tokens =
    let
        exposedSet =
            getExposedHints activeFile fileContentsDict projectPackageDocs

        exposedNames =
            Set.map snd exposedSet

        activeFileContents =
            getActiveFileContents activeFile fileContentsDict

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


getSuggestionsForImport : String -> Maybe ActiveFile -> FileContentsDict -> List ModuleDocs -> List ImportSuggestion
getSuggestionsForImport partial maybeActiveFile fileContentsDict projectPackageDocs =
    case maybeActiveFile of
        Nothing ->
            []

        Just { projectDirectory } ->
            let
                suggestions =
                    (getProjectModuleDocs projectDirectory fileContentsDict ++ projectPackageDocs)
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


getImportersForToken : String -> Bool -> Maybe ActiveFile -> TokenDict -> FileContents -> FileContentsDict -> List ( String, Bool, Bool, List String )
getImportersForToken token isCursorAtLastPartOfToken maybeActiveFile tokens activeFileContents fileContentsDict =
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

                        projectFileContents =
                            getProjectFileContents projectDirectory fileContentsDict
                    in
                        projectFileContents
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


getHintFullName : Hint -> String
getHintFullName hint =
    case hint.moduleName of
        "" ->
            hint.name

        _ ->
            hint.moduleName ++ "." ++ hint.name


getProjectModuleDocs : String -> FileContentsDict -> List ModuleDocs
getProjectModuleDocs projectDirectory fileContentsDict =
    List.map .moduleDocs (Dict.values fileContentsDict)
        |> List.filter (\{ sourcePath } -> isSourcePathInProjectDirectory projectDirectory sourcePath)


getProjectFileContents : String -> FileContentsDict -> List FileContents
getProjectFileContents projectDirectory fileContentsDict =
    Dict.values fileContentsDict
        |> List.filter
            (\fileContents ->
                isSourcePathInProjectDirectory projectDirectory fileContents.moduleDocs.sourcePath
            )


getExposedHints : Maybe ActiveFile -> FileContentsDict -> List ModuleDocs -> Set.Set ( String, String )
getExposedHints activeFile fileContentsDict projectPackageDocs =
    case activeFile of
        Nothing ->
            Set.empty

        Just { projectDirectory } ->
            let
                importsPlusActiveModule =
                    getImportsPlusActiveModuleForActiveFile activeFile fileContentsDict

                importedModuleNames =
                    Dict.keys importsPlusActiveModule

                importedModuleDocs =
                    (projectPackageDocs ++ getProjectModuleDocs projectDirectory fileContentsDict)
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


isSourcePathInProjectDirectory : String -> String -> Bool
isSourcePathInProjectDirectory projectDirectory sourcePath =
    List.any
        (\pathSep ->
            String.startsWith (projectDirectory ++ pathSep) sourcePath
        )
        [ "/", "\\" ]


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
    if String.startsWith packageDocsPrefix sourcePath then
        sourcePath ++ dotToHyphen name ++ "#" ++ valueName
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



-- defaultPackages : List String
-- defaultPackages =
--     List.map toPackageUri
--         [ ( "elm-lang/core", "latest" )
--           -- , ("elm-lang/html", "latest" )
--           -- , ("elm-lang/svg", "latest" )
--           -- , ("evancz/elm-markdown", "latest" )
--           -- , ("evancz/elm-http", "latest" )
--         ]


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
            |> Task.map
                (\jsonString ->
                    ( dependency
                    , jsonString
                    , Decode.decodeString (Decode.list (moduleDocsDecoder packageUri)) jsonString
                        |> Result.toMaybe
                        |> Maybe.withDefault []
                    )
                )


toModuleDocs : String -> String -> List ModuleDocs
toModuleDocs packageUri jsonString =
    Decode.decodeString (Decode.list (moduleDocsDecoder packageUri)) jsonString
        |> Result.toMaybe
        |> Maybe.withDefault []


moduleDocsDecoder : String -> Decode.Decoder ModuleDocs
moduleDocsDecoder packageUri =
    let
        name =
            "name" := Decode.string

        tipe =
            Decode.object4 Tipe
                ("name" := Decode.string)
                ("comment" := Decode.string)
                ("name" := Decode.string)
                -- type
                ("cases" := Decode.list (Decode.tuple2 always Decode.string Decode.value))

        value =
            Decode.object3 Value
                ("name" := Decode.string)
                ("comment" := Decode.string)
                ("type" := Decode.string)

        values =
            Decode.object3 Values
                ("aliases" := Decode.list value)
                ("types" := Decode.list tipe)
                ("values" := Decode.list value)
    in
        Decode.object3 (ModuleDocs packageUri)
            name
            values
            ("comment" := Decode.string)


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


toTokenDict : Maybe ActiveFile -> FileContentsDict -> List ModuleDocs -> TokenDict
toTokenDict maybeActiveFile fileContentsDict projectPackageDocs =
    case maybeActiveFile of
        Nothing ->
            Dict.empty

        Just { projectDirectory } ->
            let
                getMaybeHints moduleDocs =
                    Maybe.map (filteredHints moduleDocs) (Dict.get moduleDocs.name (getImportsPlusActiveModuleForActiveFile maybeActiveFile fileContentsDict))

                insert ( token, hint ) dict =
                    Dict.update token (\value -> Just (hint :: Maybe.withDefault [] value)) dict
            in
                (projectPackageDocs ++ getProjectModuleDocs projectDirectory fileContentsDict)
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
moduleToHints { name, comment, sourcePath } { alias, exposed } =
    let
        hint =
            { name = name
            , moduleName = ""
            , sourcePath = sourcePath
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
        , "Debug" => None
        , "List" => Some (Set.fromList [ "List", "::" ])
        , "Maybe" => Some (Set.singleton "Maybe")
          -- Just, Nothing
        , "Result" => Some (Set.singleton "Result")
          -- Ok, Err
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
