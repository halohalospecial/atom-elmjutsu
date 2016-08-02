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
import Json.Encode as Encode
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



-- OUTGOING PORTS


port docsLoadedCmd : () -> Cmd msg


port docsFailedCmd : () -> Cmd msg


port goToDefinitionCmd : GoToDefinitionRequest -> Cmd msg


port goToSymbolCmd : ( Maybe String, Maybe ActiveFile, List Encode.Value ) -> Cmd msg


port activeFileChangedCmd : Maybe ActiveFile -> Cmd msg


port activeHintsChangedCmd : List Encode.Value -> Cmd msg


port updatingPackageDocsCmd : () -> Cmd msg


port gotHintsForPartialCmd : ( String, List Encode.Value ) -> Cmd msg



-- MODEL


type alias Model =
    { packageDocs : List ModuleDocs
    , activeTokens : TokenDict
    , activeHints : List Hint
    , activeFile : Maybe ActiveFile
    , fileContentsDict : FileContentsDict
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
    , activeTokens = Dict.empty
    , activeHints = []
    , activeFile = Nothing
    , fileContentsDict = Dict.empty
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
                    , activeTokens = toTokenDict (activeFileContents model.activeFile model.fileContentsDict) model.fileContentsDict updatedPackageDocs
                  }
                , docsLoadedCmd ()
                )

        CursorMove maybeToken ->
            let
                updatedActiveHints =
                    -- hintsForTokenInFile maybeToken model.activeFile model.activeTokens
                    hintsForToken maybeToken model.activeTokens
            in
                ( { model | activeHints = updatedActiveHints }
                , List.map encodeHint updatedActiveHints
                    |> activeHintsChangedCmd
                )

        UpdateActiveFile activeFile ->
            ( { model
                | activeFile = activeFile
                , activeTokens = toTokenDict (activeFileContents activeFile model.fileContentsDict) model.fileContentsDict model.packageDocs
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
                    , activeTokens = toTokenDict (activeFileContents model.activeFile updatedFileContentsDict) updatedFileContentsDict model.packageDocs
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
                    , activeTokens = toTokenDict (activeFileContents model.activeFile updatedFileContentsDict) updatedFileContentsDict model.packageDocs
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
                        symbols =
                            Dict.values model.fileContentsDict
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
                                                            Symbol (moduleDocs.name ++ "." ++ value.name) (formatSourcePath moduleDocs value.name) Nothing kind
                                                    )
                                                    values.values

                                            tipeSymbols =
                                                List.map
                                                    (\tipe ->
                                                        Symbol (moduleDocs.name ++ "." ++ tipe.name) (formatSourcePath moduleDocs tipe.name) Nothing KindType
                                                    )
                                                    values.tipes

                                            tipeCaseSymbols =
                                                List.concatMap
                                                    (\tipe ->
                                                        List.map
                                                            (\caseName ->
                                                                Symbol (moduleDocs.name ++ "." ++ caseName) (formatSourcePath moduleDocs caseName) (Just tipe.name) KindTypeCase
                                                            )
                                                            tipe.cases
                                                    )
                                                    values.tipes
                                        in
                                            valueSymbols ++ tipeSymbols ++ tipeCaseSymbols
                                    )

                        projectSymbols =
                            symbols
                                |> List.filter
                                    (\{ sourcePath } ->
                                        not (String.startsWith packageDocsPrefix sourcePath)
                                            && isSourcePathInProjectDirectory projectDirectory sourcePath
                                    )

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
                        , ( defaultSymbolName, model.activeFile, List.map encodeSymbol projectSymbols )
                            |> goToSymbolCmd
                        )

        GetHintsForPartial partial ->
            ( model
            , ( partial, List.map encodeHint (hintsForPartial partial (activeFileContents model.activeFile model.fileContentsDict) model.activeTokens) )
                |> gotHintsForPartialCmd
            )


hintsForToken : Maybe String -> TokenDict -> List Hint
hintsForToken maybeToken tokens =
    case maybeToken of
        Nothing ->
            []

        Just token ->
            Maybe.withDefault [] (Dict.get token tokens)


hintsForPartial : String -> FileContents -> TokenDict -> List Hint
hintsForPartial partial fileContents tokens =
    tokens
        |> Dict.filter
            (\token _ ->
                String.startsWith partial token
            )
        |> Dict.values
        |> List.concatMap identity


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


encodeSymbol : Symbol -> Encode.Value
encodeSymbol symbol =
    Encode.object
        [ ( "fullName", Encode.string symbol.fullName )
        , ( "sourcePath", Encode.string symbol.sourcePath )
        , ( "caseTipe", encodeCaseTipe symbol.caseTipe )
        , ( "kind", Encode.string (symbolKindToString symbol.kind) )
        ]


type alias Hint =
    { name : String
    , sourcePath : String
    , comment : String
    , tipe : String
    , caseTipe : Maybe String
    , kind : SymbolKind
    }


encodeHint : Hint -> Encode.Value
encodeHint hint =
    Encode.object
        [ ( "name", Encode.string hint.name )
        , ( "sourcePath", Encode.string hint.sourcePath )
        , ( "comment", Encode.string hint.comment )
        , ( "tipe", Encode.string hint.tipe )
        , ( "caseTipe", encodeCaseTipe hint.caseTipe )
        , ( "kind", Encode.string (symbolKindToString hint.kind) )
        ]


encodeCaseTipe : Maybe String -> Encode.Value
encodeCaseTipe caseTipe =
    case caseTipe of
        Nothing ->
            Encode.null

        Just value ->
            Encode.string value


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


toTokenDict : FileContents -> FileContentsDict -> List ModuleDocs -> TokenDict
toTokenDict activeFileContents fileContentsDict packageDocsList =
    let
        getMaybeHints moduleDocs =
            let
                activeFileContentsAndImports =
                    Dict.update activeFileContents.moduleDocs.name (always <| Just { alias = Nothing, exposed = All }) activeFileContents.imports
            in
                Maybe.map (filteredHints moduleDocs) (Dict.get moduleDocs.name activeFileContentsAndImports)

        insert ( token, hint ) dict =
            Dict.update token (\value -> Just (hint :: Maybe.withDefault [] value)) dict
    in
        (packageDocsList ++ [ activeFileContents.moduleDocs ])
            |> List.filterMap getMaybeHints
            |> List.concat
            |> List.foldl insert Dict.empty


tipeToValue : Tipe -> Value
tipeToValue { name, comment, tipe } =
    { name = name, comment = comment, tipe = tipe }


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
            Hint fullName (formatSourcePath moduleDocs name) comment tipe Nothing kind

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
                    Hint fullName (formatSourcePath moduleDocs name) comment tipe (Just name) KindTypeCase

                localName =
                    (Maybe.withDefault moduleDocs.name alias) ++ "." ++ tag
            in
                if List.member name defaultTypes || isExposed tag exposed then
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


defaultTypes : List String
defaultTypes =
    [ "Maybe", "Result" ]


lastName : String -> String
lastName fullName =
    List.foldl always "" (String.split "." fullName)
