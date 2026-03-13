import React from "react";
import { Head } from "@inertiajs/react";
import Authenticated from "@/Layouts/Authenticated";
import ListView from "@/Components/Views/List/Index2";

export default function MessageLogs(props) {
    return (
        <Authenticated
            auth={props.auth}
            errors={props.errors}
            current_page={"Message Logs"}
            navigationMenu={props.menuBar}
        >
            <Head title={props.translator["Message Logs"] ?? "Message Logs"} />

            <div className="font-semibold text-2xl text-white !px-4 !mb-6 ml-3">
                {props.translator["Message Logs"] ?? "Message Logs"}
            </div>

            <ListView
                module="Msg"
                headers={props.list_view_columns}
                routeName={props.routeName}
                listRouteParams={props.listRouteParams}
                {...props}
                translator={props.translator}
                noCardBorder
            />
        </Authenticated>
    );
}
