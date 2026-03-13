import React from "react";
import { Head } from "@inertiajs/react";
import Authenticated from "@/Layouts/Authenticated";
import ListView from "@/Components/Views/List/Index2";

function formatMessageLogDate(value) {
    if (!value || typeof value !== "string") return value;

    const formattedMatch = value.match(
        /^(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2}):(\d{2})$/,
    );

    if (formattedMatch) {
        return value;
    }

    const isoLikeMatch = value.match(
        /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2}):(\d{2})/,
    );

    if (!isoLikeMatch) {
        return value;
    }

    const [, year, month, day, hour, minute, second] = isoLikeMatch;

    return `${day}-${month}-${year} ${hour}:${minute}:${second}`;
}

export default function MessageLogs(props) {
    return (
        <Authenticated
            auth={props.auth}
            errors={props.errors}
            current_page={"Message Logs"}
            navigationMenu={props.menuBar}
        >
            <Head title={props.translator["Message Logs"] ?? "Message Logs"} />

            <ListView
                module="Msg"
                headers={props.list_view_columns}
                routeName={props.routeName}
                listRouteParams={props.listRouteParams}
                renderCell={({ name, record }) => {
                    if (name === "created_at") {
                        return formatMessageLogDate(record.created_at);
                    }
                }}
                {...props}
                translator={props.translator}
                noCardBorder
            />
        </Authenticated>
    );
}
