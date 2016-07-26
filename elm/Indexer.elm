-- Based on https://github.com/elm-lang/elm-lang.org/tree/master/src/editor


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
        , newPackagesNeededSub UpdatePackageDocs
        , goToDefinitionSub GoToDefinition
        ]



-- INCOMING PORTS


port activeTokenChangedSub : (Maybe String -> msg) -> Sub msg


port activeFilePathChangedSub : (Maybe String -> msg) -> Sub msg


port sourceFileChangedSub : (( String, ModuleDocs, List RawImport ) -> msg) -> Sub msg


port newPackagesNeededSub : (List String -> msg) -> Sub msg


port goToDefinitionSub : (Maybe String -> msg) -> Sub msg



-- OUTGOING PORTS


port docsLoadedCmd : () -> Cmd msg


port goToDefinitionCmd : String -> Cmd msg


port activeModuleNameChangedCmd : String -> Cmd msg


port activeHintsChangedCmd : List Hint -> Cmd msg



-- MODEL


type alias Model =
    { packageDocs : List ModuleDocs
    , tokens : TokenDict
    , hints : List Hint
    , note : String
    , activeFilePath : Maybe String
    , sourceFileDict : SourceFileDict
    }


type alias SourceFileDict =
    Dict.Dict String SourceFile


type alias SourceFile =
    { moduleDocs : ModuleDocs
    , imports : ImportDict
    }


init : ( Model, Cmd Msg )
init =
    ( emptyModel
    , Task.perform (always DocsFailed) DocsLoaded (getPackageDocsList defaultPackages)
      -- , Cmd.none
    )


emptyModel : Model
emptyModel =
    { packageDocs = []
    , tokens = Dict.empty
    , hints = []
    , note = "Loading..."
    , activeFilePath = Nothing
    , sourceFileDict = Dict.empty
    }


emptyModuleDocs : ModuleDocs
emptyModuleDocs =
    { packageUri = ""
    , name = ""
    , values =
        { aliases = []
        , types = []
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
    | UpdatePackageDocs (List String)
    | GoToDefinition (Maybe String)


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        DocsFailed ->
            ( { model | note = "Failed to load -_-" }
            , Cmd.none
            )

        DocsLoaded docs ->
            let
                existingPackages =
                    List.map .packageUri model.packageDocs

                missingPackageDocs =
                    List.filter (\{ packageUri } -> not <| List.member packageUri existingPackages) docs

                updatedPackageDocs =
                    missingPackageDocs ++ model.packageDocs
            in
                ( { model
                    | packageDocs = updatedPackageDocs
                    , tokens = toTokenDict (getActiveSourceFile model.activeFilePath model.sourceFileDict) model.sourceFileDict updatedPackageDocs
                    , note = ""
                  }
                , docsLoadedCmd ()
                )

        CursorMove Nothing ->
            ( { model | hints = [] }
            , activeHintsChangedCmd []
            )

        CursorMove (Just token) ->
            let
                updatedHints =
                    Maybe.withDefault [] (Dict.get token model.tokens)
            in
                ( { model | hints = updatedHints }
                , activeHintsChangedCmd updatedHints
                )

        UpdateActiveFilePath activeFilePath ->
            ( { model
                | activeFilePath = activeFilePath
                , tokens = toTokenDict (getActiveSourceFile activeFilePath model.sourceFileDict) model.sourceFileDict model.packageDocs
              }
            , activeModuleNameChangedCmd <| activeFileModuleName activeFilePath model.sourceFileDict
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
                , activeModuleNameChangedCmd <| activeFileModuleName model.activeFilePath updatedSourceFileDict
                )

        UpdatePackageDocs packages ->
            let
                existingPackages =
                    List.map .packageUri model.packageDocs

                missingPackages =
                    List.filter (\packageUri -> not <| List.member packageUri existingPackages) (List.map toPackageUri packages)
            in
                ( { model | note = "Loading..." }
                , Task.perform (always DocsFailed) DocsLoaded (getPackageDocsList missingPackages)
                )

        GoToDefinition Nothing ->
            ( model
            , Cmd.none
            )

        GoToDefinition (Just token) ->
            let
                hints =
                    Maybe.withDefault [] (Dict.get token model.tokens)
            in
                case hints of
                    [] ->
                        ( model
                        , Cmd.none
                        )

                    _ ->
                        ( model
                        , Cmd.batch <| List.map (\hint -> goToDefinitionCmd hint.uri) hints
                        )


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


activeFileModuleName : Maybe String -> SourceFileDict -> String
activeFileModuleName activeFilePath sourceFileDict =
    let
        sourceFile =
            getActiveSourceFile activeFilePath sourceFileDict
    in
        sourceFile.moduleDocs.name



-- DOCUMENTATION


type alias ModuleDocs =
    { packageUri : String
    , name : String
    , values : Values
    }


type alias Values =
    { aliases : List Value
    , types : List Tipe
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


urlTo : ModuleDocs -> String -> String
urlTo { packageUri, name } valueName =
    let
        uri =
            if String.startsWith packageDocsPrefix packageUri then
                packageUri ++ dotToHyphen name
            else
                packageUri
    in
        uri ++ "#" ++ valueName


dotToHyphen : String -> String
dotToHyphen string =
    String.map
        (\c ->
            if c == '.' then
                '-'
            else
                c
        )
        string



-- FETCH DOCS


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



-- FORMAT DOCS


type alias TokenDict =
    Dict.Dict String (List Hint)


type alias Hint =
    { name : String
    , uri : String
    , comment : String
    , tipe : String
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
    let
        allValues =
            moduleDocs.values.aliases
                ++ List.map tipeToValue moduleDocs.values.types
                ++ moduleDocs.values.values
    in
        List.concatMap (unionTagsToHints moduleDocs importData) moduleDocs.values.types
            ++ List.concatMap (nameToHints moduleDocs importData) allValues


nameToHints : ModuleDocs -> Import -> Value -> List ( String, Hint )
nameToHints moduleDocs { alias, exposed } { name, comment, tipe } =
    let
        fullName =
            moduleDocs.name ++ "." ++ name

        hint =
            Hint fullName (urlTo moduleDocs name) comment tipe

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
                    Hint fullName (urlTo moduleDocs name) comment tipe

                localName =
                    Maybe.withDefault moduleDocs.name alias ++ "." ++ tag
            in
                if List.member name defaultTypes || isExposed tag exposed then
                    ( tag, hint ) :: ( localName, hint ) :: ( fullName, hint ) :: hints
                else
                    ( localName, hint ) :: ( fullName, hint ) :: hints
    in
        List.foldl addHints [] cases



-- IMPORTS


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



-- CREATE IMPORT DICTS


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
