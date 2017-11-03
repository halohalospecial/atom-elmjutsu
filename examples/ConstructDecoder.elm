module ConstructDecoder exposing (..)

import Json.Decode as Decode


type Status
    = Started
    | Stopped


type alias SessionInfo =
    { sessionId : String
    , startTime : String
    , endTime : Maybe String
    , status : Status
    , tuple : ( String, Float, Decode.Value )
    }


decodeSessionInfo : Decode.Decoder SessionInfo
decodeSessionInfo =
    (Decode.map5 SessionInfo
        (Decode.field "sessionId" Decode.string)
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
        (Decode.field "tuple"
            (Decode.index 0 Decode.string
                |> Decode.andThen
                    (\v0 ->
                        Decode.index 1 Decode.float
                            |> Decode.andThen
                                (\v1 ->
                                    Decode.index 2 Decode.value
                                        |> Decode.andThen
                                            (\v2 -> Decode.succeed ( v0, v1, v2 ))
                                )
                    )
            )
        )
    )
