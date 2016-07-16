-- Based on https://github.com/elm-lang/elm-lang.org/tree/master/src/editor


port module Sidekick exposing (..)

import Dict
import Html exposing (..)
import Html.App as Html
import Http
import Json.Decode as Json exposing ((:=))
import Set
import String
import Task
import Markdown
import Regex


main : Program Never
main =
    Html.program
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.batch
        [ activeTokenChanged CursorMove
        , activeFilePathChanged UpdateActiveFilePath
        , sourceFileChanged (\( filePath, moduleDocs, rawImports ) -> UpdateSourceFile filePath { moduleDocs = moduleDocs, imports = toImportDict rawImports })
        , newPackagesNeeded UpdatePackageDocs
        ]



-- INCOMING PORTS


port activeTokenChanged : (Maybe String -> msg) -> Sub msg


port activeFilePathChanged : (Maybe String -> msg) -> Sub msg


port sourceFileChanged : (( String, ModuleDocs, List RawImport ) -> msg) -> Sub msg


port newPackagesNeeded : (List String -> msg) -> Sub msg



-- OUTGOING PORTS


port docsLoaded : () -> Cmd msg



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
    { package = ""
    , name = ""
    , values =
        { aliases = []
        , types = []
        , values = []
        }
    }


emptySourceFile : { imports : ImportDict, moduleDocs : ModuleDocs }
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
                    List.map .package model.packageDocs

                missingPackageDocs =
                    List.filter (\{ package } -> not <| List.member package existingPackages) docs

                updatedPackageDocs =
                    missingPackageDocs ++ model.packageDocs
            in
                ( { model
                    | packageDocs = updatedPackageDocs
                    , tokens = toTokenDict (getActiveSourceFile model.activeFilePath model.sourceFileDict) model.sourceFileDict updatedPackageDocs
                    , note = ""
                  }
                , docsLoaded ()
                )

        CursorMove Nothing ->
            ( { model | hints = [] }
            , Cmd.none
            )

        CursorMove (Just name) ->
            ( { model | hints = Maybe.withDefault [] (Dict.get name model.tokens) }
            , Cmd.none
            )

        UpdateActiveFilePath activeFilePath ->
            ( { model
                | activeFilePath = activeFilePath
                , tokens = toTokenDict (getActiveSourceFile activeFilePath model.sourceFileDict) model.sourceFileDict model.packageDocs
              }
            , Cmd.none
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
                , Cmd.none
                )

        UpdatePackageDocs packages ->
            let
                existingPackages =
                    List.map .package model.packageDocs

                missingPackages =
                    List.filter (\package -> not <| List.member package existingPackages) packages
            in
                ( { model | note = "Loading..." }
                , Task.perform (always DocsFailed) DocsLoaded (getPackageDocsList missingPackages)
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



-- VIEW


view : Model -> Html Msg
view { note, hints, activeFilePath, sourceFileDict } =
    div []
        [ text note
        , Markdown.toHtml [] (viewHintString (activeFileModuleName activeFilePath sourceFileDict) hints)
        ]


viewHintString : String -> List Hint -> String
viewHintString activeModuleName hints =
    case hints of
        [] ->
            ""

        _ ->
            String.join "\n\n" (List.map (viewHint activeModuleName) hints)


viewHint : String -> Hint -> String
viewHint activeModuleName hint =
    let
        ( moduleName, name ) =
            case String.split "." hint.name of
                [] ->
                    ( "", hint.name )

                list ->
                    let
                        reversed =
                            List.reverse list

                        name =
                            case List.head reversed of
                                Just last ->
                                    last

                                Nothing ->
                                    ""

                        moduleName =
                            reversed
                                |> List.drop 1
                                |> List.reverse
                                |> String.join "."
                    in
                        ( moduleName, name )

        formatModule moduleName =
            if activeModuleName == moduleName then
                moduleName ++ "."
            else
                moduleName ++ "."

        formatName name =
            if Regex.contains (Regex.regex "\\w") name then
                name
            else
                "(" ++ name ++ ")"

        maybeBrowserLink =
            if hint.href == "" then
                ""
            else
                "[View in browser]("
                    ++ hint.href
                    ++ ")"
    in
        "# "
            ++ formatModule moduleName
            ++ "**"
            ++ name
            ++ "**\n"
            ++ "## **"
            ++ formatName name
            ++ "** : "
            ++ hint.tipe
            ++ "<br><br>\n"
            ++ hint.comment
            ++ "<br><br>\n"
            ++ maybeBrowserLink


activeFileModuleName : Maybe String -> SourceFileDict -> String
activeFileModuleName activeFilePath sourceFileDict =
    let
        sourceFile =
            getActiveSourceFile activeFilePath sourceFileDict
    in
        sourceFile.moduleDocs.name



-- DOCUMENTATION


type alias ModuleDocs =
    { package : String
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
urlTo { package, name } valueName =
    "http://package.elm-lang.org/packages/"
        ++ package
        ++ "/latest/"
        ++ dotToHyphen name
        ++ "#"
        ++ valueName


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
    [ "elm-lang/core"
      -- , "elm-lang/html"
      -- , "elm-lang/svg"
      -- , "evancz/elm-markdown"
      -- , "evancz/elm-http"
    ]


getPackageDocsList : List String -> Task.Task Http.Error (List ModuleDocs)
getPackageDocsList packages =
    packages
        |> List.map getPackageDocs
        |> Task.sequence
        |> Task.map List.concat


getPackageDocs : String -> Task.Task Http.Error (List ModuleDocs)
getPackageDocs package =
    let
        url =
            "http://package.elm-lang.org/packages/" ++ package ++ "/latest/documentation.json"
    in
        Http.get (Json.list (moduleDecoder package)) url


moduleDecoder : String -> Json.Decoder ModuleDocs
moduleDecoder package =
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
        Json.object2 (ModuleDocs package) name values



-- FORMAT DOCS


type alias TokenDict =
    Dict.Dict String (List Hint)


type alias Hint =
    { name : String
    , href : String
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
