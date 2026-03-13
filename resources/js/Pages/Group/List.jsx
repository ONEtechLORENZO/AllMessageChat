import React, { Fragment, useEffect, useState, useRef } from "react";
import Authenticated from "../../Layouts/Authenticated";
import ListView from "@/Components/Views/List/Index2";
import {
    EllipsisVerticalIcon,
    AdjustmentsHorizontalIcon,
    StopIcon,
    XMarkIcon,
    ForwardIcon,
    ClipboardDocumentListIcon,
} from "@heroicons/react/24/solid";

export default function Group(props) {
    const [crmfields, setCrmfields] = useState();

    return (
        <Authenticated
            auth={props.auth}
            errors={props.errors}
            current_page={props.current_page}
            navigationMenu={props.menuBar}
        >
            <ListView
                headers={props.list_view_columns}
                user_list={props.user_list}
                {...props}
                translator={props.translator}
            />
        </Authenticated>
    );
}
