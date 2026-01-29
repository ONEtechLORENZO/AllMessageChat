import React from 'react';
import Authenticated from "../../Layouts/Authenticated";
import ListView from '@/Components/Views/List/Index2';

function List(props)
{
    return (
        <Authenticated
            auth={props.auth}
            errors={props.errors}
        >
            <div className='font-semibold text-2xl text-[#363740] !px-4 !mb-6 ml-3' >{props.plural}</div>

            <ListView
                headers={props.list_view_columns}
                {...props}
                translator={props.translator}
            />
            
        </Authenticated>
    )
}

export default List;









