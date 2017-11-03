module ConstructDecoderEncoder exposing (..)

import Json.Decode as Decode
import Json.Encode as Encode
import Dict


type Status
    = Started
    | Stopped


type alias KeyValue =
    { key : String, value : Int }


type alias Session =
    { startTime : String
    , endTime : Maybe String
    , status : Status
    , kv : KeyValue
    , aDict : Dict.Dict String Int
    , aTuple : ( String, Float, Decode.Value )
    }


decodeSession : Decode.Decoder (List Session)
decodeSession =
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
                                    Decode.fail "Unknown Status"
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
                (Decode.index 0 Decode.string
                    |> Decode.andThen
                        (\v0 ->
                            Decode.index 1 Decode.float
                                |> Decode.andThen
                                    (\v1 ->
                                        Decode.index 2 Decode.value
                                            |> Decode.andThen
                                                (\v2 ->
                                                    Decode.succeed ( v0, v1, v2 )
                                                )
                                    )
                        )
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
                            [ ( "key", Encode.string v.key )
                            , ( "value", Encode.int v.value )
                            ]
                        )
                      )
                    , ( "aDict", (Encode.object (List.map (\( k, v ) -> ( k, Encode.int v )) (Dict.toList v.aDict))) )
                    , ( "aTuple"
                      , let
                            ( v0, v1, v2 ) =
                                v.aTuple
                        in
                            Encode.list [ Encode.string v0, Encode.float v1, v2 ]
                      )
                    ]
                )
            )
            v
        )
