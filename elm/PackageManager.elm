port module PackageManager exposing (..)

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


port getPackageListSub : (ProjectDirectory -> msg) -> Sub msg



-- OUTGOING PORTS


port showPackageListCmd : ( ProjectDirectory, List Package ) -> Cmd msg


port getPackageListFailedCmd : () -> Cmd msg



-- MODEL


type alias Model =
    { projectDirectory : String
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
    }



-- UPDATE


type Msg
    = GetPackageList String
    | PackageListReceived (Result Http.Error (List Package))


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        GetPackageList projectDirectory ->
            ( { model | projectDirectory = projectDirectory }
            , getPackageList
            )

        PackageListReceived (Ok packages) ->
            ( model
            , ( model.projectDirectory, packages )
                |> showPackageListCmd
            )

        PackageListReceived (Err _) ->
            ( model
            , getPackageListFailedCmd ()
            )


getPackageList : Cmd Msg
getPackageList =
    Http.send PackageListReceived (Http.get "http://package.elm-lang.org/all-packages" decodePackages)


decodePackages : Decode.Decoder (List Package)
decodePackages =
    Decode.list
        (Decode.map3 Package
            (Decode.field "name" Decode.string)
            (Decode.field "summary" Decode.string)
            (Decode.field "versions" (Decode.list Decode.string))
        )
