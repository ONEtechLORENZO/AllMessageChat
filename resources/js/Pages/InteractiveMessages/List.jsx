import React from "react";
import Authenticated from "../../Layouts/Authenticated";
import ListView from "@/Components/Views/List/Index2";
import CategoryList from "../Category/List";
import TagList from "../Tag/List";
//import { Link } from 'heroicons-react';
import { Link } from "@inertiajs/react";
function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
}

function List(props) {
    return (
        <Authenticated
            auth={props.auth}
            errors={props.errors}
            current_page={props.current_page}
            navigationMenu={props.menuBar}
        >
            <div className="font-semibold text-2xl text-white !px-4 ml-3">
                {props.plural}
            </div>

            <ListView
                headers={props.list_view_columns}
                {...props}
                translator={props.translator}
                noCardBorder
            />
        </Authenticated>
    );
}

export default List;
