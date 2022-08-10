import React from 'react';
import Authenticated from "../../Layouts/Authenticated";
import ListView from '@/Components/Views/List/Index2';

function MessageListing(props) 
{
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
    );
}

export default MessageListing;