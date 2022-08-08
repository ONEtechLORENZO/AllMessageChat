import React from 'react';
import Authenticated from "../../../Layouts/Authenticated";
import ListView from '@/Components/Views/List/Index2';

function List(props)
{
    return (
        <Authenticated
            auth={props.auth}
            errors={props.errors}
        >

            <ListView
                headers={props.list_view_columns}
                {...props}
            />
            
        </Authenticated>
    )
}

export default List;