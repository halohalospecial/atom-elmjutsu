module ConstructDecoder exposing (..)

import Json.Decode as Decode


type alias Comment =
    { message : String
    , responses : Responses
    }


type Responses
    = Responses (List Comment)


type Status
    = Started
    | Stopped


type alias SessionInfo =
    { sessionId : String
    , startTime : String
    , endTime : Maybe String
    , status : Status
    , tuple : ( String, Decode.Value )
    , comment : Comment
    }


decodeSessionInfo : Decode.Decoder SessionInfo
decodeSessionInfo =
    (Decode.map6 SessionInfo
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
                        Decode.index 1 Decode.value
                            |> Decode.andThen
                                (\v1 -> Decode.succeed ( v0, v1 ))
                    )
            )
        )
        (Decode.field "comment"
            (Decode.map2 Comment
                (Decode.field "message" Decode.string)
                (Decode.field "responses"
                    (Decode.string
                        |> Decode.andThen
                            (\string ->
                                case string of
                                    "Responses" ->
                                        Decode.succeed Responses

                                    _ ->
                                        Decode.fail "Unknown Responses"
                            )
                    )
                )
            )
        )
    )
