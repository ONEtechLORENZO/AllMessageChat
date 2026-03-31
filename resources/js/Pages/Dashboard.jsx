import React from "react";
import Authenticated from "@/Layouts/Authenticated";
import { Head } from "@inertiajs/react";
import Accounts from "./Wallet/Accounts";

export default function Dashboard(props) {
    return (
        <Authenticated
            auth={props.auth}
            errors={props.errors}
            current_page={"Social Profiles"}
            message={props.message}
            navigationMenu={props.menuBar}
            subduedBackground={true}
        >
            <Head title="Social Profiles" />

            <div className="px-4 pb-10 pt-6 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <Accounts accounts={props.accounts} createAccount={true} {...props} />
                </div>
            </div>
        </Authenticated>
    );
}
