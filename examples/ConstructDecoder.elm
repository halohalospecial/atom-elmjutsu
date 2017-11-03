module ConstructDecoder exposing (..)

import Json.Decode as Decode


type alias Data =
    { name : String, value : String }


type Status
    = Started
    | Stopped


type alias SessionInfo =
    { sessionId : String
    , startTime : String
    , endTime : Maybe String
    , data : Data
    , status : Status
    }


decodeSessionInfo : Decode.Decoder SessionInfo
decodeSessionInfo =
    (Decode.map5 SessionInfo
        (Decode.field "sessionId" Decode.string)
        (Decode.field "startTime" Decode.string)
        (Decode.field "endTime" (Decode.maybe Decode.string))
        (Decode.field "data"
            (Decode.map2 Data
                (Decode.field "name" Decode.string)
                (Decode.field "value" Decode.string)
            )
        )
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
    )
