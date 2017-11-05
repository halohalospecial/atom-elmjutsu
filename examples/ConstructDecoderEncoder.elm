module ConstructDecoderEncoder exposing (..)

import Json.Decode as Decode
import Json.Encode as Encode
import Dict


type alias Session =
    { startTime : String
    , endTime : Maybe String
    , status : Status
    , kv : KeyValue
    , aDict : Dict.Dict String Int
    , aTuple : ( String, Float, Decode.Value, Decode.Value )
    }


type Status
    = Started
    | Stopped


type alias KeyValue =
    { key : String, value : Int }


decodeSessions : Decode.Decoder (List Session)
decodeSessions =
    Decode.list
        (Decode.map6 Session
            (Decode.field "startTime" Decode.string)
            (Decode.field "endTime" (Decode.maybe Decode.string))
            (Decode.field "status"
                (Decode.string
                    |> Decode.andThen
                        (\string ->
                            case string of
                                "Started" ->
                                    Decode.succeed Started

                                "Stopped" ->
                                    Decode.succeed Stopped

                                _ ->
                                    Decode.fail "Invalid Status"
                        )
                )
            )
            (Decode.field "kv"
                (Decode.map2 KeyValue
                    (Decode.field "key" Decode.string)
                    (Decode.field "value" Decode.int)
                )
            )
            (Decode.field "aDict" (Decode.dict Decode.int))
            (Decode.field "aTuple"
                (Decode.map4 (,,,)
                    Decode.string
                    Decode.float
                    Decode.value
                    Decode.value
                )
            )
        )


encodeSessions : List Session -> Encode.Value
encodeSessions v =
    Encode.list
        (List.map
            (\v ->
                (Encode.object
                    [ ( "startTime", Encode.string v.startTime )
                    , ( "endTime"
                      , case v.endTime of
                            Just v ->
                                Encode.string v

                            Nothing ->
                                Encode.null
                      )
                    , ( "status"
                      , case v.status of
                            Started ->
                                Encode.string "Started"

                            Stopped ->
                                Encode.string "Stopped"
                      )
                    , ( "kv"
                      , (Encode.object
                            [ ( "key", Encode.string v.kv.key )
                            , ( "value", Encode.int v.kv.value )
                            ]
                        )
                      )
                    , ( "aDict", Encode.object (List.map (\( k, v ) -> ( k, Encode.int v )) (Dict.toList v.aDict)) )
                    , ( "aTuple"
                      , let
                            ( v0, v1, v2, v3 ) =
                                v.aTuple
                        in
                            Encode.list [ Encode.string v0, Encode.float v1, v2, v3 ]
                      )
                    ]
                )
            )
            v
        )
