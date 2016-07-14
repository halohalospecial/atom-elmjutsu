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
        , rawImportsChanged (\rawImports -> UpdateImports (toImportDict rawImports))
        , activeModuleChanged UpdateActiveModuleDocs
        , newPkgsNeeded UpdateDocs
        ]



-- INCOMING PORTS


port activeTokenChanged : (Maybe String -> msg) -> Sub msg


port rawImportsChanged : (List RawImport -> msg) -> Sub msg


port activeModuleChanged : (ModuleDocs -> msg) -> Sub msg


port newPkgsNeeded : (List String -> msg) -> Sub msg



-- OUTGOING PORTS


port docsLoaded : () -> Cmd msg



-- MODEL


type alias Model =
    { docs : List ModuleDocs
    , imports : ImportDict
    , activeModuleDocs : ModuleDocs
    , tokens : TokenDict
    , hints : List Hint
    , note : String
    }


init : ( Model, Cmd Msg )
init =
    ( emptyModel
    , Task.perform (always DocsFailed) DocsLoaded (getPkgsDocs defaultPkgs)
    )


emptyModel : Model
emptyModel =
    { docs = []
    , imports = defaultImports
    , activeModuleDocs = emptyModuleDocs
    , tokens = Dict.empty
    , hints = []
    , note = "Loading..."
    }


emptyModuleDocs : ModuleDocs
emptyModuleDocs =
    { pkg = ""
    , name = ""
    , values =
        { aliases = []
        , types = []
        , values = []
        }
    }



-- UPDATE


type Msg
    = DocsFailed
    | DocsLoaded (List ModuleDocs)
    | UpdateImports ImportDict
    | CursorMove (Maybe String)
    | UpdateDocs (List String)
    | UpdateActiveModuleDocs ModuleDocs


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        DocsFailed ->
            ( { model | note = "Failed to load -_-" }
            , Cmd.none
            )

        DocsLoaded docs ->
            let
                updatedDocs =
                    docs ++ model.docs
            in
                ( { model
                    | docs = updatedDocs
                    , tokens = toTokenDict model.imports model.activeModuleDocs updatedDocs
                    , note = ""
                  }
                , docsLoaded ()
                )

        UpdateImports imports ->
            ( { model
                | imports = imports
                , tokens = toTokenDict imports model.activeModuleDocs model.docs
              }
            , Cmd.none
            )

        UpdateActiveModuleDocs activeModuleDocs ->
            ( { model
                | activeModuleDocs = activeModuleDocs
                , tokens = toTokenDict model.imports activeModuleDocs model.docs
              }
            , Cmd.none
            )

        CursorMove Nothing ->
            ( { model | hints = [] }
            , Cmd.none
            )

        CursorMove (Just name) ->
            ( { model | hints = Maybe.withDefault [] (Dict.get name model.tokens) }
            , Cmd.none
            )

        UpdateDocs pkgs ->
            let
                existingPkgs =
                    List.map .pkg model.docs

                missingPkgs =
                    List.filter (\pkg -> not <| List.member pkg existingPkgs) pkgs
            in
                ( { model | note = "Loading..." }
                , Task.perform (always DocsFailed) DocsLoaded (getPkgsDocs missingPkgs)
                )



-- VIEW


view : Model -> Html Msg
view { note, hints } =
    div []
        [ text note
        , Markdown.toHtml [] (viewHintString hints)
        ]


viewHintString : List Hint -> String
viewHintString hints =
    case hints of
        [] ->
            ""

        _ ->
            String.join "\n\n" (List.map viewHint hints)


viewHint : Hint -> String
viewHint hint =
    let
        ( modul, name ) =
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

                        modul =
                            reversed
                                |> List.drop 1
                                |> List.reverse
                                |> String.join "."
                    in
                        ( modul, name )

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
            ++ modul
            ++ ".**"
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



-- DOCUMENTATION


type alias ModuleDocs =
    { pkg : String
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
urlTo { pkg, name } valueName =
    "http://package.elm-lang.org/packages/"
        ++ pkg
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


defaultPkgs : List String
defaultPkgs =
    [ "elm-lang/core"
      -- , "elm-lang/html"
      -- , "elm-lang/svg"
      -- , "evancz/elm-markdown"
      -- , "evancz/elm-http"
    ]


getPkgsDocs : List String -> Task.Task Http.Error (List ModuleDocs)
getPkgsDocs pkgs =
    pkgs
        |> List.map getPkgDocs
        |> Task.sequence
        |> Task.map List.concat


getPkgDocs : String -> Task.Task Http.Error (List ModuleDocs)
getPkgDocs pkg =
    let
        url =
            "http://package.elm-lang.org/packages/" ++ pkg ++ "/latest/documentation.json"
    in
        Http.get (Json.list (moduleDecoder pkg)) url


moduleDecoder : String -> Json.Decoder ModuleDocs
moduleDecoder pkg =
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
        Json.object2 (ModuleDocs pkg) name values



-- FORMAT DOCS


type alias TokenDict =
    Dict.Dict String (List Hint)


type alias Hint =
    { name : String
    , href : String
    , comment : String
    , tipe : String
    }


toTokenDict : ImportDict -> ModuleDocs -> List ModuleDocs -> TokenDict
toTokenDict imports activeModuleDocs moduleList =
    let
        getMaybeHints moduleDocs =
            let
                importsAndActiveModule =
                    Dict.update activeModuleDocs.name (always <| Just { alias = Nothing, exposed = All }) imports
            in
                Maybe.map (filteredHints moduleDocs) (Dict.get moduleDocs.name importsAndActiveModule)

        insert ( token, hint ) dict =
            Dict.update token (\value -> Just (hint :: Maybe.withDefault [] value)) dict
    in
        (moduleList ++ [ activeModuleDocs ])
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
        List.concatMap (unionTagsToHints moduleDocs) moduleDocs.values.types
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


unionTagsToHints : ModuleDocs -> Tipe -> List ( String, Hint )
unionTagsToHints moduleDocs { name, cases, comment, tipe } =
    let
        addHints tag hints =
            let
                fullName =
                    moduleDocs.name ++ "." ++ tag

                hint =
                    Hint fullName (urlTo moduleDocs name) comment tipe
            in
                ( tag, hint ) :: ( fullName, hint ) :: hints
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
        , "Result" => Some (Set.singleton "Result")
        , "Platform" => Some (Set.singleton "Program")
        , ( "Platform.Cmd", Import (Just "Cmd") (Some (Set.fromList [ "Cmd", "!" ])) )
        , ( "Platform.Sub", Import (Just "Sub") (Some (Set.singleton "Sub")) )
        ]
