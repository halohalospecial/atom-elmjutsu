module ConstructDefaultValueForType exposing (..)


type alias Model =
    { position :
        { x : Float
        , y : Float
        , z : Float
        }
    , message : Maybe String
    , active : Bool
    }


defaultModel : Model
defaultModel =
    { position = { x = 0.0, y = 0.0, z = 0.0 }, message = Nothing, active = False }


type MyType
    = MyTypeA ( String, Int, Bool )
    | MyTypeB
    | MyTypeC


defaultMyType : MyType
defaultMyType =
    MyTypeA ( "", 0, False )
