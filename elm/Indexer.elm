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
        , newPackagesNeededSub UpdatePackageDocs
        , goToDefinitionSub GoToDefinition
        , goToSymbolSub GoToSymbol
        , getHintsForPartialSub GetHintsForPartial
        , askCanGoToDefinitionSub AskCanGoToDefinition
        ]



-- INCOMING PORTS


port activeTokenChangedSub : (Maybe String -> msg) -> Sub msg


port activeFileChangedSub : (Maybe ActiveFile -> msg) -> Sub msg


port fileContentsChangedSub : (( String, ModuleDocs, List RawImport ) -> msg) -> Sub msg


port fileContentsRemovedSub : (String -> msg) -> Sub msg


port newPackagesNeededSub : (List String -> msg) -> Sub msg


port goToDefinitionSub : (Maybe String -> msg) -> Sub msg


port goToSymbolSub : (( Maybe String, Maybe String ) -> msg) -> Sub msg


port getHintsForPartialSub : (String -> msg) -> Sub msg


port askCanGoToDefinitionSub : (String -> msg) -> Sub msg



-- OUTGOING PORTS


port docsLoadedCmd : () -> Cmd msg


port docsFailedCmd : () -> Cmd msg


port goToDefinitionCmd : GoToDefinitionRequest -> Cmd msg


port goToSymbolCmd : ( Maybe String, Maybe ActiveFile, List EncodedSymbol ) -> Cmd msg


port activeFileChangedCmd : Maybe ActiveFile -> Cmd msg


port activeHintsChangedCmd : List EncodedHint -> Cmd msg


port updatingPackageDocsCmd : () -> Cmd msg


port gotHintsForPartialCmd : ( String, List EncodedHint ) -> Cmd msg


port canGoToDefinitionRepliedCmd : ( String, Bool ) -> Cmd msg



-- MODEL


type alias Model =
    { packageDocs : List ModuleDocs
    , fileContentsDict : FileContentsDict
    , activeTokens : TokenDict
    , activeHints : List Hint
    , activeFile : Maybe ActiveFile
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


type alias GoToDefinitionRequest =
    { sourcePath : String
    , name : String
    , caseTipe : Maybe String
    }


init : ( Model, Cmd Msg )
init =
    ( emptyModel
    , Task.perform (always DocsFailed) DocsLoaded (getPackageDocsList defaultPackages)
    )


emptyModel : Model
emptyModel =
    { packageDocs = []
    , fileContentsDict = Dict.empty
    , activeTokens = Dict.empty
    , activeHints = []
    , activeFile = Nothing
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
    }


emptyFileContents : FileContents
emptyFileContents =
    { moduleDocs = emptyModuleDocs
    , imports = defaultImports
    }



-- UPDATE


type Msg
    = DocsFailed
    | DocsLoaded (List ModuleDocs)
    | CursorMove (Maybe String)
    | UpdateActiveFile (Maybe ActiveFile)
    | UpdateFileContents String FileContents
    | RemoveFileContents String
    | UpdatePackageDocs (List String)
    | GoToDefinition (Maybe String)
    | GoToSymbol ( Maybe String, Maybe String )
    | GetHintsForPartial String
    | AskCanGoToDefinition String


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        DocsFailed ->
            ( model
            , docsFailedCmd ()
            )

        DocsLoaded docs ->
            let
                existingPackages =
                    List.map .sourcePath model.packageDocs

                missingPackageDocs =
                    List.filter (\{ sourcePath } -> not <| List.member sourcePath existingPackages) docs

                updatedPackageDocs =
                    missingPackageDocs ++ model.packageDocs
            in
                ( { model
                    | packageDocs = updatedPackageDocs
                    , activeTokens = toTokenDict model.activeFile model.fileContentsDict updatedPackageDocs
                  }
                , docsLoadedCmd ()
                )

        CursorMove maybeToken ->
            let
                updatedActiveHints =
                    hintsForToken maybeToken model.activeTokens
            in
                ( { model | activeHints = updatedActiveHints }
                , List.map encodeHint updatedActiveHints
                    |> activeHintsChangedCmd
                )

        UpdateActiveFile activeFile ->
            ( { model
                | activeFile = activeFile
                , activeTokens = toTokenDict activeFile model.fileContentsDict model.packageDocs
              }
            , activeFileChangedCmd activeFile
            )

        UpdateFileContents filePath fileContents ->
            let
                updatedFileContentsDict =
                    Dict.update filePath (always <| Just fileContents) model.fileContentsDict
            in
                ( { model
                    | fileContentsDict = updatedFileContentsDict
                    , activeTokens = toTokenDict model.activeFile updatedFileContentsDict model.packageDocs
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
                    , activeTokens = toTokenDict model.activeFile updatedFileContentsDict model.packageDocs
                  }
                , activeFileChangedCmd model.activeFile
                )

        UpdatePackageDocs packages ->
            let
                existingPackages =
                    List.map .sourcePath model.packageDocs

                missingPackages =
                    List.filter (\sourcePath -> not <| List.member sourcePath existingPackages) (List.map toPackageUri packages)
            in
                ( model
                , Cmd.batch
                    [ updatingPackageDocsCmd ()
                    , Task.perform (always DocsFailed) DocsLoaded (getPackageDocsList missingPackages)
                    ]
                )

        GoToDefinition maybeToken ->
            let
                requests =
                    hintsForToken maybeToken model.activeTokens
                        |> List.map
                            (\hint ->
                                goToDefinitionCmd (GoToDefinitionRequest hint.sourcePath (lastName hint.name) hint.caseTipe)
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
                            hintsForToken maybeToken model.activeTokens

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
                                                Just (lastName hint.name)
                                            else
                                                Just hint.name
                    in
                        ( model
                        , ( defaultSymbolName, model.activeFile, List.map encodeSymbol (projectSymbols projectDirectory model.fileContentsDict) )
                            |> goToSymbolCmd
                        )

        GetHintsForPartial partial ->
            ( model
            , ( partial
              , hintsForPartial partial model.activeFile model.fileContentsDict model.packageDocs model.activeTokens
                    |> List.map encodeHint
              )
                |> gotHintsForPartialCmd
            )

        AskCanGoToDefinition token ->
            ( model
            , canGoToDefinitionRepliedCmd
                ( token
                , Dict.member token model.activeTokens
                )
            )


projectSymbols : String -> FileContentsDict -> List Symbol
projectSymbols projectDirectory fileContentsDict =
    let
        allFileSymbols fileContentsDict =
            Dict.values fileContentsDict
                |> List.concatMap
                    (\{ moduleDocs } ->
                        let
                            { sourcePath, values } =
                                moduleDocs

                            valueSymbols =
                                List.map
                                    (\value ->
                                        let
                                            firstChar =
                                                String.left 1 value.name

                                            kind =
                                                if firstChar == String.toUpper firstChar then
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
                            valueSymbols ++ tipeSymbols ++ tipeCaseSymbols
                    )
    in
        allFileSymbols fileContentsDict
            |> List.filter
                (\{ sourcePath } ->
                    not (String.startsWith packageDocsPrefix sourcePath)
                        && isSourcePathInProjectDirectory projectDirectory sourcePath
                )


hintsForToken : Maybe String -> TokenDict -> List Hint
hintsForToken maybeToken tokens =
    case maybeToken of
        Nothing ->
            []

        Just token ->
            Maybe.withDefault [] (Dict.get token tokens)


hintsForPartial : String -> Maybe ActiveFile -> FileContentsDict -> List ModuleDocs -> TokenDict -> List Hint
hintsForPartial partial activeFile fileContentsDict packageDocs tokens =
    let
        exposedSet =
            exposedHints activeFile fileContentsDict packageDocs

        exposedNames =
            Set.map snd exposedSet

        activeModuleName =
            (activeFileContents activeFile fileContentsDict).moduleDocs.name

        hints =
            tokens
                |> Dict.filter
                    (\token _ ->
                        let
                            maybeUnqualify name =
                                if Set.member name exposedNames then
                                    lastName name
                                else
                                    name
                        in
                            String.startsWith partial (maybeUnqualify token)
                    )
                |> Dict.values
                |> List.concatMap identity
                |> List.map
                    (\hint ->
                        let
                            name =
                                lastName hint.name

                            formattedModuleName =
                                if activeModuleName == hint.moduleName then
                                    ""
                                else
                                    hint.moduleName

                            formattedName =
                                if Set.member ( hint.moduleName, name ) exposedSet then
                                    name
                                else
                                    hint.moduleName ++ "." ++ name
                        in
                            { hint | name = formattedName, moduleName = formattedModuleName }
                    )

        defaultHints =
            List.filter
                (\{ name } ->
                    String.startsWith partial name
                )
                defaultSuggestions
    in
        hints



-- ++ defaultHints


exposedHints : Maybe ActiveFile -> FileContentsDict -> List ModuleDocs -> Set.Set ( String, String )
exposedHints activeFile fileContentsDict packageDocs =
    case activeFile of
        Nothing ->
            Set.empty

        Just { projectDirectory } ->
            let
                fileContents =
                    activeFileContents activeFile fileContentsDict

                projectModuleDocs =
                    List.map .moduleDocs (Dict.values fileContentsDict)
                        |> List.filter (\{ sourcePath } -> isSourcePathInProjectDirectory projectDirectory sourcePath)

                importsPlusActiveModule =
                    Dict.update fileContents.moduleDocs.name (always <| Just { alias = Nothing, exposed = All }) fileContents.imports

                importedModuleNames =
                    Dict.keys importsPlusActiveModule

                importedModuleDocs =
                    (packageDocs ++ projectModuleDocs)
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


activeFileContents : Maybe ActiveFile -> FileContentsDict -> FileContents
activeFileContents activeFile fileContentsDict =
    case activeFile of
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


defaultPackages : List String
defaultPackages =
    List.map toPackageUri
        [ "elm-lang/core"
          -- , "elm-lang/html"
          -- , "elm-lang/svg"
          -- , "evancz/elm-markdown"
          -- , "evancz/elm-http"
        ]


toPackageUri : String -> String
toPackageUri package =
    packageDocsPrefix
        ++ package
        ++ "/latest/"


packageDocsPrefix : String
packageDocsPrefix =
    "http://package.elm-lang.org/packages/"


getPackageDocsList : List String -> Task.Task Http.Error (List ModuleDocs)
getPackageDocsList packageuris =
    packageuris
        |> List.map getPackageDocs
        |> Task.sequence
        |> Task.map List.concat


getPackageDocs : String -> Task.Task Http.Error (List ModuleDocs)
getPackageDocs packageUri =
    let
        url =
            packageUri ++ "documentation.json"
    in
        Http.get (Decode.list (moduleDecoder packageUri)) url


moduleDecoder : String -> Decode.Decoder ModuleDocs
moduleDecoder packageUri =
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
        Decode.object2 (ModuleDocs packageUri) name values


type alias TokenDict =
    Dict.Dict String (List Hint)


type SymbolKind
    = KindDefault
    | KindTypeAlias
    | KindType
    | KindTypeCase


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


toTokenDict : Maybe ActiveFile -> FileContentsDict -> List ModuleDocs -> TokenDict
toTokenDict activeFile fileContentsDict packageDocsList =
    let
        fileContents =
            activeFileContents activeFile fileContentsDict
    in
        case activeFile of
            Nothing ->
                Dict.empty

            Just { projectDirectory } ->
                let
                    projectModuleDocs =
                        List.map .moduleDocs (Dict.values fileContentsDict)
                            |> List.filter (\{ sourcePath } -> isSourcePathInProjectDirectory projectDirectory sourcePath)

                    importsPlusActiveModule =
                        Dict.update fileContents.moduleDocs.name (always <| Just { alias = Nothing, exposed = All }) fileContents.imports

                    getMaybeHints moduleDocs =
                        Maybe.map (filteredHints moduleDocs) (Dict.get moduleDocs.name importsPlusActiveModule)

                    insert ( token, hint ) dict =
                        Dict.update token (\value -> Just (hint :: Maybe.withDefault [] value)) dict
                in
                    (packageDocsList ++ projectModuleDocs)
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


nameToHints : ModuleDocs -> Import -> SymbolKind -> Value -> List ( String, Hint )
nameToHints moduleDocs { alias, exposed } kind { name, comment, tipe } =
    let
        fullName =
            moduleDocs.name ++ "." ++ name

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
            (Maybe.withDefault moduleDocs.name alias) ++ "." ++ name
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
                    (Maybe.withDefault moduleDocs.name alias) ++ "." ++ tag
            in
                if Set.member name defaultTypes || isExposed tag exposed then
                    ( tag, hint ) :: ( localName, hint ) :: ( fullName, hint ) :: hints
                else
                    ( localName, hint ) :: ( fullName, hint ) :: hints
    in
        List.foldl addHints [] cases


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
        [ "True"
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


lastName : String -> String
lastName fullName =
    List.foldl always "" (String.split "." fullName)
