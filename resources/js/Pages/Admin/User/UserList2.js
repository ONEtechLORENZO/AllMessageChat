import React, { useState } from 'react';
import Authenticated from '@/Layouts/Authenticated';
import ListView from '@/Components/Views/List/Index2';
import InviteUser from './InviteUsers';

function List(props)
{
    const[ inviteUser, setInviteUser] = useState(false);

    return (
        <Authenticated
            auth={props.auth}
            errors={props.errors}
            current_page= {props.current_page}
        >

            <ListView
                headers={props.list_view_columns}
                setInviteUser={setInviteUser}
                {...props}
            />
            
            {inviteUser &&
                <InviteUser 
                    setInviteUser={setInviteUser}
                />
            }

        </Authenticated>
    )
}

export default List;