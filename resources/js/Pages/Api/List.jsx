import React from 'react';
import Authenticated from "../../Layouts/Authenticated";
import ListView from '@/Components/Views/List/Index2';
import { Link } from "@inertiajs/react";
function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
}

function List(props)
{
    const tabs = [
   
      ];
    return (
        <Authenticated
            auth={props.auth}
            errors={props.errors}
            current_page={props.current_page}
        >
              
               
            <ListView
                headers={props.list_view_columns}
                {...props}
                translator={props.translator}
            /> 
            
        </Authenticated>
    )
}

export default List;









