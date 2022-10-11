import React from "react";
import Wallet from "./Index";
import Authenticated from "@/Layouts/Authenticated";
import { Head } from "@inertiajs/inertia-react";

function WalletIndex(props)
{
    return (
        <Authenticated
            auth={props.auth}
            errors={props.errors}
            current_page= {props.current_page}
        >
            <Head title={props.translator['Wallet']} />

            <Wallet {...props} />

        </Authenticated>
    )
}

export default WalletIndex;