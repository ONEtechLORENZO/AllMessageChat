import React from "react";
import Authenticated from "../../Layouts/Authenticated";
import ListView from "@/Components/Views/List/Index2";

function MessageListing(props) {
    return (
        <Authenticated
            auth={props.auth}
            errors={props.errors}
            current_page={"Messages"}
            navigationMenu={props.menuBar}
        >
            <ListView
                headers={props.list_view_columns}
                {...props}
                translator={props.translator}
                fetchFields={false}
                noCardBorder
            />
        </Authenticated>
    );
}

export default MessageListing;
