import React from 'react';
import Authenticated from "../../Layouts/Authenticated";
import ListView from '@/Components/Views/List/Index2';

function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
}

function List(props)
{
   
    return (
        <Authenticated
            auth={props.auth}
            errors={props.errors}
            current_page={props.current_page}
        >
           
            <ListView
                headers={props.list_view_columns}
                add_link={route('account_registration')}
                add_button_text="Create Social profile"
                {...props}
                translator={props.translator}
            /> 
                
        </Authenticated>
    )
}

export default List;