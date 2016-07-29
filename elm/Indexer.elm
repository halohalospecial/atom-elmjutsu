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
import Json.Decode as Json exposing ((:=))
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
        , activeFilePathChangedSub UpdateActiveFilePath
        , sourceFileChangedSub (\( filePath, moduleDocs, rawImports ) -> UpdateSourceFile filePath <| SourceFile moduleDocs (toImportDict rawImports))
        , sourceFileRemovedSub RemoveSourceFile
        , newPackagesNeededSub UpdatePackageDocs
        , goToDefinitionSub GoToDefinition
        , goToSymbolSub GoToSymbol
        ]



-- INCOMING PORTS


port activeTokenChangedSub : (Maybe String -> msg) -> Sub msg


port activeFilePathChangedSub : (Maybe String -> msg) -> Sub msg


port sourceFileChangedSub : (( String, ModuleDocs, List RawImport ) -> msg) -> Sub msg


port sourceFileRemovedSub : (String -> msg) -> Sub msg


port newPackagesNeededSub : (List String -> msg) -> Sub msg


port goToDefinitionSub : (Maybe String -> msg) -> Sub msg


port goToSymbolSub : (( Maybe String, Maybe String ) -> msg) -> Sub msg



-- OUTGOING PORTS


port docsLoadedCmd : () -> Cmd msg


port docsFailedCmd : () -> Cmd msg


port goToDefinitionCmd : GoToDefinitionRequest -> Cmd msg


port goToSymbolCmd : ( Maybe String, Maybe String, List Symbol ) -> Cmd msg


port activeFilePathChangedCmd : Maybe String -> Cmd msg


port activeHintsChangedCmd : List Hint -> Cmd msg


port updatingPackageDocsCmd : () -> Cmd msg



-- MODEL


type alias Model =
    { packageDocs : List ModuleDocs
    , tokens : TokenDict
    , hints : List Hint
    , activeFilePath : Maybe String
    , sourceFileDict : SourceFileDict
    }


type alias SourceFileDict =
    Dict.Dict String SourceFile


type alias SourceFile =
    { moduleDocs : ModuleDocs
    , imports : ImportDict
    }


type alias Symbol =
    { fullName : String
    , sourcePath : String
    , caseTipe : Maybe String
    , kind : String
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
    , tokens = Dict.empty
    , hints = []
    , activeFilePath = Nothing
    , sourceFileDict = Dict.empty
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


emptySourceFile : SourceFile
emptySourceFile =
    { moduleDocs = emptyModuleDocs
    , imports = defaultImports
    }



-- UPDATE


type Msg
    = DocsFailed
    | DocsLoaded (List ModuleDocs)
    | CursorMove (Maybe String)
    | UpdateActiveFilePath (Maybe String)
    | UpdateSourceFile String SourceFile
    | RemoveSourceFile String
    | UpdatePackageDocs (List String)
    | GoToDefinition (Maybe String)
    | GoToSymbol ( Maybe String, Maybe String )


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
                    , tokens = toTokenDict (getActiveSourceFile model.activeFilePath model.sourceFileDict) model.sourceFileDict updatedPackageDocs
                  }
                , docsLoadedCmd ()
                )

        CursorMove maybeToken ->
            let
                updatedHints =
                    hintsForToken maybeToken model.tokens
            in
                ( { model | hints = updatedHints }
                , activeHintsChangedCmd updatedHints
                )

        UpdateActiveFilePath activeFilePath ->
            ( { model
                | activeFilePath = activeFilePath
                , tokens = toTokenDict (getActiveSourceFile activeFilePath model.sourceFileDict) model.sourceFileDict model.packageDocs
              }
            , activeFilePathChangedCmd activeFilePath
            )

        UpdateSourceFile filePath sourceFile ->
            let
                updatedSourceFileDict =
                    Dict.update filePath (always <| Just sourceFile) model.sourceFileDict
            in
                ( { model
                    | sourceFileDict = updatedSourceFileDict
                    , tokens = toTokenDict (getActiveSourceFile model.activeFilePath updatedSourceFileDict) updatedSourceFileDict model.packageDocs
                  }
                , activeFilePathChangedCmd model.activeFilePath
                )

        RemoveSourceFile filePath ->
            let
                updatedSourceFileDict =
                    Dict.remove filePath model.sourceFileDict
            in
                ( { model
                    | sourceFileDict = updatedSourceFileDict
                    , tokens = toTokenDict (getActiveSourceFile model.activeFilePath updatedSourceFileDict) updatedSourceFileDict model.packageDocs
                  }
                , activeFilePathChangedCmd model.activeFilePath
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
                hints =
                    hintsForToken maybeToken model.tokens
            in
                ( model
                , Cmd.batch
                    <| List.map
                        (\hint ->
                            goToDefinitionCmd (GoToDefinitionRequest hint.sourcePath (lastName hint.name) hint.caseTipe)
                        )
                        hints
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
                            Dict.values model.sourceFileDict
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
                                                                    "type alias"
                                                                else
                                                                    ""
                                                        in
                                                            Symbol (moduleDocs.name ++ "." ++ value.name) (formatSourcePath moduleDocs value.name) Nothing kind
                                                    )
                                                    values.values

                                            tipeSymbols =
                                                List.map
                                                    (\tipe ->
                                                        Symbol (moduleDocs.name ++ "." ++ tipe.name) (formatSourcePath moduleDocs tipe.name) Nothing "type"
                                                    )
                                                    values.tipes

                                            tipeCaseSymbols =
                                                List.concatMap
                                                    (\tipe ->
                                                        List.map
                                                            (\caseName ->
                                                                Symbol (moduleDocs.name ++ "." ++ caseName) (formatSourcePath moduleDocs caseName) (Just tipe.name) ("type case")
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
                                            && (String.startsWith (projectDirectory ++ "/") sourcePath
                                                    || String.startsWith (projectDirectory ++ "\\") sourcePath
                                               )
                                    )

                        hints =
                            hintsForToken maybeToken model.tokens

                        defaultSymbolName =
                            case List.head hints of
                                Nothing ->
                                    maybeToken

                                Just hint ->
                                    if model.activeFilePath == Just hint.sourcePath then
                                        Just (lastName hint.name)
                                    else
                                        Just hint.name
                    in
                        ( model
                        , goToSymbolCmd ( defaultSymbolName, model.activeFilePath, projectSymbols )
                        )


hintsForToken : Maybe String -> TokenDict -> List Hint
hintsForToken maybeToken tokens =
    case maybeToken of
        Nothing ->
            []

        Just token ->
            Maybe.withDefault [] (Dict.get token tokens)


getActiveSourceFile : Maybe String -> SourceFileDict -> SourceFile
getActiveSourceFile activeFilePath sourceFileDict =
    case activeFilePath of
        Nothing ->
            emptySourceFile

        Just filePath ->
            case Dict.get filePath sourceFileDict of
                Just sourceFile ->
                    sourceFile

                Nothing ->
                    emptySourceFile


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
        Http.get (Json.list (moduleDecoder packageUri)) url


moduleDecoder : String -> Json.Decoder ModuleDocs
moduleDecoder packageUri =
    let
        name =
            "name" := Json.string

        tipe =
            Json.object4 Tipe
                ("name" := Json.string)
                ("comment" := Json.string)
                ("name" := Json.string)
                -- type
                ("cases" := Json.list (Json.tuple2 always Json.string Json.value))

        value =
            Json.object3 Value
                ("name" := Json.string)
                ("comment" := Json.string)
                ("type" := Json.string)

        values =
            Json.object3 Values
                ("aliases" := Json.list value)
                ("types" := Json.list tipe)
                ("values" := Json.list value)
    in
        Json.object2 (ModuleDocs packageUri) name values


type alias TokenDict =
    Dict.Dict String (List Hint)


type alias Hint =
    { name : String
    , sourcePath : String
    , comment : String
    , tipe : String
    , caseTipe : Maybe String
    , kind : String
    }


toTokenDict : SourceFile -> SourceFileDict -> List ModuleDocs -> TokenDict
toTokenDict activeSourceFile sourceFileDict packageDocsList =
    let
        sourceFileDictModuleDocs =
            Dict.values sourceFileDict |> List.map .moduleDocs

        getMaybeHints moduleDocs =
            let
                activeSourceFileAndImports =
                    Dict.update activeSourceFile.moduleDocs.name (always <| Just { alias = Nothing, exposed = All }) activeSourceFile.imports
            in
                Maybe.map (filteredHints moduleDocs) (Dict.get moduleDocs.name activeSourceFileAndImports)

        insert ( token, hint ) dict =
            Dict.update token (\value -> Just (hint :: Maybe.withDefault [] value)) dict
    in
        (packageDocsList ++ sourceFileDictModuleDocs)
            |> List.filterMap getMaybeHints
            |> List.concat
            |> List.foldl insert Dict.empty


tipeToValue : Tipe -> Value
tipeToValue { name, comment, tipe } =
    { name = name, comment = comment, tipe = tipe }


filteredHints : ModuleDocs -> Import -> List ( String, Hint )
filteredHints moduleDocs importData =
    List.concatMap (unionTagsToHints moduleDocs importData) moduleDocs.values.tipes
        ++ List.concatMap (nameToHints moduleDocs importData "type alias") moduleDocs.values.aliases
        ++ List.concatMap (nameToHints moduleDocs importData "type") (List.map tipeToValue moduleDocs.values.tipes)
        ++ List.concatMap (nameToHints moduleDocs importData "") moduleDocs.values.values


nameToHints : ModuleDocs -> Import -> String -> Value -> List ( String, Hint )
nameToHints moduleDocs { alias, exposed } kind { name, comment, tipe } =
    let
        fullName =
            moduleDocs.name ++ "." ++ name

        hint =
            Hint fullName (formatSourcePath moduleDocs name) comment tipe Nothing kind

        localName =
            Maybe.withDefault moduleDocs.name alias ++ "." ++ name
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
                    Hint fullName (formatSourcePath moduleDocs name) comment tipe (Just name) "type case"

                localName =
                    Maybe.withDefault moduleDocs.name alias ++ "." ++ tag
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
