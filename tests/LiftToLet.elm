module LiftToLet exposing (..)


foo : Float
foo =
    let
        a =
            1 / 2
    in
        let
            b =
                1 + 100

            c =
                let
                    cc =
                        2 + 2
                in
                    cc + 1

            d =
                1 + 1
        in
            2 * 3


bar : Float
bar =
    1 + 2
