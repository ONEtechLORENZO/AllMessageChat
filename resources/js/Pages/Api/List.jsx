import React from 'react';
import Authenticated from "../../Layouts/Authenticated";
import ListView from '@/Components/Views/List/Index2';
import ApiReferenceOverviewCards from "@/Components/ApiReferenceOverviewCards";

function List(props)
{
    return (
        <Authenticated
            auth={props.auth}
            errors={props.errors}
            current_page={props.current_page}
        >
            <div className="mb-7 px-4 pt-4 sm:px-6 lg:px-8">
                <ApiReferenceOverviewCards translator={props.translator} />
            </div>
            <ListView
                headers={props.list_view_columns}
                {...props}
                translator={props.translator}
                pageHeadTitle={props.current_page}
                add_button_text={props.translator["Create Api key"] ?? "Create Api key"}
                hideDropdownMenu
                headerActionsClassName="items-start pt-1"
                headerLeadContent={
                    <div className="max-w-2xl">
                        <h2 className="text-[1.75rem] font-semibold leading-tight text-white">
                            {props.translator["Api Keys"] ?? "Api Keys"}
                        </h2>
                        <p className="mt-2 text-sm text-[#878787]">
                            {props.translator["Create Bearer tokens to authenticate API requests. Treat tokens like passwords."] ?? "Create Bearer tokens to authenticate API requests. Treat tokens like passwords."}
                        </p>
                    </div>
                }
            /> 
            
        </Authenticated>
    )
}

export default List;












