module ConstructDefaultArguments exposing (..)


myFunction : String -> Int -> Float
myFunction string int =
    0.0


caseFunction : Float
caseFunction =
    myFunction "" 0


type alias Model =
    { position :
        { x : Float
        , y : Float
        }
    , message : Maybe String
    , name : String
    }


caseModel : Model
caseModel =
    Model { x = 0.0, y = 0.0 } Nothing ""


type MyType
    = MyTypeA String Int Bool


caseMyType : MyType
caseMyType =
    MyTypeA "" 0 False
