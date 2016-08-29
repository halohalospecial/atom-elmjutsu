port module Usages exposing (..)

import Html exposing (..)
import Html.App as Html
import Html.Attributes exposing (class, type', checked)
import Html.Events exposing (onClick, onCheck)
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
        [ setContentsSub SetContents
        , selectNextUsageSub (\_ -> SelectNextUsage)
        , selectPreviousUsageSub (\_ -> SelectPreviousUsage)
        , getCheckedUsagesSub (\_ -> GetCheckedUsages)
        ]



-- INCOMING PORTS


port setContentsSub : (( String, String, Array.Array Usage, Bool ) -> msg) -> Sub msg


port selectNextUsageSub : (() -> msg) -> Sub msg


port selectPreviousUsageSub : (() -> msg) -> Sub msg


port getCheckedUsagesSub : (() -> msg) -> Sub msg



-- OUTGOING PORTS


port viewInEditorCmd : Usage -> Cmd msg


port checkedUsagesReceivedCmd : Array.Array Usage -> Cmd msg



-- MODEL


type alias Model =
    { usages : Array.Array Usage
    , token : String
    , projectDirectory : String
    , selectedIndex : Int
    , willShowRenamePanel : Bool
    }


emptyModel : Model
emptyModel =
    { usages = Array.empty
    , token = ""
    , projectDirectory = ""
    , selectedIndex = -1
    , willShowRenamePanel = False
    }


type alias Usage =
    { sourcePath : String
    , lineText : String
    , range : Range
    , checked : Bool
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
    = SetContents ( String, String, Array.Array Usage, Bool )
    | SelectNextUsage
    | SelectPreviousUsage
    | SelectIndex Int
    | GetCheckedUsages
    | SetUsageChecked Int Bool


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        SetContents ( projectDirectory, token, usages, willShowRenamePanel ) ->
            ( { model | projectDirectory = projectDirectory, token = token, usages = usages, selectedIndex = -1, willShowRenamePanel = willShowRenamePanel }
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

        GetCheckedUsages ->
            ( model
            , checkedUsagesReceivedCmd (checkedUsages model.usages)
            )

        SetUsageChecked index checked ->
            case Array.get index model.usages of
                Nothing ->
                    ( model
                    , Cmd.none
                    )

                Just usage ->
                    ( { model | usages = Array.set index { usage | checked = checked } model.usages }
                    , Cmd.none
                    )


checkedUsages : Array.Array Usage -> Array.Array Usage
checkedUsages usages =
    Array.filter (\usage -> usage.checked) usages


selectDelta : Int -> Model -> ( Model, Cmd Msg )
selectDelta delta model =
    let
        updatedSelectedIndex =
            let
                n =
                    Array.length model.usages
            in
                if n > 0 then
                    (model.selectedIndex + delta) % n
                else
                    model.selectedIndex
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
view { usages, token, projectDirectory, selectedIndex, willShowRenamePanel } =
    let
        headerText =
            if willShowRenamePanel then
                let
                    usageOrUsages =
                        if Array.length usages == 1 then
                            " usage"
                        else
                            " usages"
                in
                    "Will rename " ++ (toString <| Array.length (checkedUsages usages)) ++ " out of " ++ (toString <| Array.length usages) ++ usageOrUsages
            else
                "Usages for `" ++ token ++ "`: " ++ (toString <| Array.length usages)
    in
        div []
            [ div [ class "header" ]
                [ text headerText ]
            , div []
                [ ul
                    []
                    ((Array.indexedMap (usageView projectDirectory selectedIndex willShowRenamePanel) usages)
                        |> Array.toList
                    )
                ]
            ]


usageView : String -> Int -> Bool -> Int -> Usage -> Html Msg
usageView projectDirectory selectedIndex willShowRenamePanel index usage =
    let
        { lineText, sourcePath, range } =
            usage

        preSymbolText =
            String.left range.start.column lineText

        symbolText =
            (String.dropLeft range.start.column >> String.left (range.end.column - range.start.column)) lineText

        postSymbolText =
            String.right ((String.length lineText) - range.end.column) lineText

        listItemClass =
            if selectedIndex == index then
                "selected"
            else
                ""

        maybeRenamePanelView =
            if willShowRenamePanel then
                [ input [ type' "checkbox", checked usage.checked, onCheck (SetUsageChecked index) ] [] ]
            else
                []

        usageTextClass =
            if usage.checked then
                "usage-text"
            else
                "usage-text-unchecked"
    in
        li [ class listItemClass ]
            (maybeRenamePanelView
                ++ [ div [ onClick (SelectIndex index), class usageTextClass ]
                        [ div []
                            [ span [] [ text preSymbolText ]
                            , span [ class "symbol" ] [ text symbolText ]
                            , span [] [ text postSymbolText ]
                            ]
                        , div [ class "source-path" ] [ text (String.dropLeft (String.length projectDirectory) sourcePath ++ " (" ++ (toString <| range.start.row + 1) ++ "," ++ (toString <| range.start.column + 1) ++ ")") ]
                        ]
                   ]
            )
