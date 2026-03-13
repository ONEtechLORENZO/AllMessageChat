import React from "react";
import ListView from "@/Components/Views/List/Index2";
import Authenticated from "@/Layouts/Authenticated";

function List(props) {
    return (
        <Authenticated
            auth={props.auth}
            errors={props.errors}
            current_page={props.current_page}
            navigationMenu={props.menuBar}
        >
            <ListView headers={props.list_view_columns} {...props} />
        </Authenticated>
    );
}

export default List;
