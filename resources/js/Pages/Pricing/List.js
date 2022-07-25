import React from 'react';
import Authenticated from "../../Layouts/Authenticated";
import ListView from '@/Components/Views/List/Index2';

function List(props)
{
    return (
        <Authenticated>

            <ListView
                heading={props.heading}
                headers={props.list_view_columns}
                records={props.records}
                module='Price'
                paginator={props.paginator}
                import={props.import}
                export={props.export}
                create={props.create}
            />
            
        </Authenticated>
    )
}

export default List;