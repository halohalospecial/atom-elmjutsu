port module FindUsages exposing (..)

import Html exposing (..)
import Html.App as Html
import Html.Attributes exposing (class)
import Html.Events exposing (onClick)
import String
import Array


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
        [ setUsagesSub SetUsages
        , selectNextUsageSub (\_ -> SelectNextUsage)
        , selectPreviousUsageSub (\_ -> SelectPreviousUsage)
        ]



-- INCOMING PORTS


port setUsagesSub : (( String, Array.Array Usage ) -> msg) -> Sub msg


port selectNextUsageSub : (() -> msg) -> Sub msg


port selectPreviousUsageSub : (() -> msg) -> Sub msg



-- OUTGOING PORTS


port viewInEditorCmd : Usage -> Cmd msg



-- MODEL


type alias Model =
    { usages : Array.Array Usage
    , projectDirectory : String
    , selectedIndex : Int
    }


emptyModel : Model
emptyModel =
    { usages = Array.empty
    , projectDirectory = ""
    , selectedIndex = -1
    }


type alias Usage =
    { sourcePath : String
    , lineText : String
    , range : Range
    }


type alias Range =
    { start : Point
    , end : Point
    }


type alias Point =
    { row : Int
    , column : Int
    }


init : ( Model, Cmd Msg )
init =
    ( emptyModel
    , Cmd.none
    )



-- UPDATE


type Msg
    = SetUsages ( String, Array.Array Usage )
    | SelectNextUsage
    | SelectPreviousUsage
    | SelectIndex Int


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        SetUsages ( projectDirectory, usages ) ->
            ( { model | projectDirectory = projectDirectory, usages = usages, selectedIndex = -1 }
            , Cmd.none
            )

        SelectNextUsage ->
            selectDelta 1 model

        SelectPreviousUsage ->
            selectDelta -1 model

        SelectIndex index ->
            ( { model | selectedIndex = index }
            , maybeViewInEditor index model
            )


selectDelta : Int -> Model -> ( Model, Cmd Msg )
selectDelta delta model =
    let
        updatedSelectedIndex =
            -- clamp 0 ((Array.length model.usages) - 1) (model.selectedIndex + delta)
            (model.selectedIndex + delta) % Array.length model.usages
    in
        ( { model | selectedIndex = updatedSelectedIndex }
        , if model.selectedIndex /= updatedSelectedIndex then
            maybeViewInEditor updatedSelectedIndex model
          else
            Cmd.none
        )


maybeViewInEditor : Int -> Model -> Cmd Msg
maybeViewInEditor index model =
    case Array.get index model.usages of
        Nothing ->
            Cmd.none

        Just usage ->
            viewInEditorCmd usage



-- VIEW


view : Model -> Html Msg
view { usages, projectDirectory, selectedIndex } =
    div []
        [ div [ class "header" ]
            [ text ("Usages: " ++ (toString <| Array.length usages)) ]
        , div []
            [ ul
                []
                ((Array.indexedMap (usageView projectDirectory selectedIndex) usages)
                    |> Array.toList
                )
            ]
        ]


usageView : String -> Int -> Int -> Usage -> Html Msg
usageView projectDirectory selectedIndex index usage =
    let
        { lineText, sourcePath, range } =
            usage

        preSymbolText =
            String.left range.start.column lineText

        symbolText =
            (String.dropLeft range.start.column >> String.left (range.end.column - range.start.column)) lineText

        postSymbolText =
            String.right ((String.length lineText) - range.end.column) lineText

        attrs =
            [ onClick (SelectIndex index) ]
                ++ (if selectedIndex == index then
                        [ class "selected" ]
                    else
                        []
                   )
    in
        li attrs
            [ div []
                [ span [] [ text preSymbolText ]
                , span [ class "symbol" ] [ text symbolText ]
                , span [] [ text postSymbolText ]
                ]
            , div [ class "source-path" ] [ text (String.dropLeft (String.length projectDirectory) sourcePath ++ " (" ++ (toString <| range.start.row + 1) ++ "," ++ (toString <| range.start.column + 1) ++ ")") ]
            ]
