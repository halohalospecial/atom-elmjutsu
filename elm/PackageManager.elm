port module PackageManager exposing (Model, Msg(..), Package, ProjectDirectory, Version, decodePackages, emptyModel, getPackageList, getPackageListFailedCmd, getPackageListSub, init, main, showPackageListCmd, subscriptions, update)

import Http
import Json.Decode as Decode


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
        [ getPackageListSub GetPackageList
        ]



-- INCOMING PORTS


port getPackageListSub : (( ProjectDirectory, Bool ) -> msg) -> Sub msg



-- OUTGOING PORTS


port showPackageListCmd : ( ProjectDirectory, Bool, List Package ) -> Cmd msg


port getPackageListFailedCmd : () -> Cmd msg



-- MODEL


type alias Model =
    { projectDirectory : String
    , usingPre0_19ElmVersion : Bool
    }


type alias Package =
    { name : String
    , summary : String
    , versions : List Version
    }


type alias ProjectDirectory =
    String


type alias Version =
    String


init : ( Model, Cmd Msg )
init =
    ( emptyModel
    , Cmd.none
    )


emptyModel : Model
emptyModel =
    { projectDirectory = ""
    , usingPre0_19ElmVersion = False
    }



-- UPDATE


type Msg
    = GetPackageList ( String, Bool )
    | PackageListReceived (Result Http.Error (List Package))


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        GetPackageList ( projectDirectory, usingPre0_19ElmVersion ) ->
            ( { model | projectDirectory = projectDirectory, usingPre0_19ElmVersion = usingPre0_19ElmVersion }
            , getPackageList usingPre0_19ElmVersion
            )

        PackageListReceived (Ok packages) ->
            ( model
            , ( model.projectDirectory, model.usingPre0_19ElmVersion, packages )
                |> showPackageListCmd
            )

        PackageListReceived (Err _) ->
            ( model
            , getPackageListFailedCmd ()
            )


getPackageList : Bool -> Cmd Msg
getPackageList usingPre0_19ElmVersion =
    if usingPre0_19ElmVersion then
        Http.send PackageListReceived (Http.get "http://package.elm-lang.org/all-packages?elm-package-version=0.18" decodePackages)

    else
        Http.send PackageListReceived (Http.get "http://package.elm-lang.org/search.json" decodePackages)


decodePackages : Decode.Decoder (List Package)
decodePackages =
    Decode.list
        (Decode.map3 Package
            (Decode.field "name" Decode.string)
            (Decode.field "summary" Decode.string)
            (Decode.field "versions" (Decode.list Decode.string))
        )
