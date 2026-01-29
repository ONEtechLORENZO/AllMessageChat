import React, { useState } from 'react';
import Authenticated from '@/Layouts/Authenticated';
import ListView from '@/Components/Views/List/Index2';
import InviteUser from './InviteUsers';
import ShowCompany from './ShowCompany';

function List(props) {
    const [inviteUser, setInviteUser] = useState(false);
    const [parent, setParent] = useState();
    const [showCompanies, setShowCompanies] = useState(false);

    return (
        <Authenticated
            auth={props.auth}
            errors={props.errors}
            current_page={props.current_page}
        >

            <ListView
                headers={props.list_view_columns}
                setInviteUser={setInviteUser}
                current_user={props.current_user}
                setShowCompanies={setShowCompanies}
                setParent={setParent}
                {...props}
            />

            {inviteUser &&
                <InviteUser
                    setInviteUser={setInviteUser}
                    {...props}
                />
            }
            {showCompanies &&
                <ShowCompany
                    userId={parent}
                    showCompanies={showCompanies}
                    setShowCompanies={setShowCompanies}
                />
            }

        </Authenticated>
    )
}

export default List;












