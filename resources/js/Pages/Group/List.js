import React, {Fragment, useEffect, useState, useRef} from "react";
import Authenticated from "../../Layouts/Authenticated";
import ListView from '@/Components/Views/List/Index2';
import { DotsVerticalIcon, AdjustmentsIcon, StopIcon, XIcon, FastForwardIcon, ClipboardListIcon } from '@heroicons/react/solid';



export default function Group(props) {

    const [crmfields, setCrmfields] = useState();   

    return (        
        <Authenticated
        auth={props.auth}
        errors={props.errors}
        current_page = {props.current_page}
        navigationMenu={props.menuBar}
    >
        <div className='font-semibold text-2xl text-[#363740] !px-4 !mb-6 ml-3' >{props.plural}</div>

        <ListView
            headers={props.list_view_columns}
            user_list={props.user_list}
            {...props}
            translator={props.translator}
        />
        
    </Authenticated>
        
   
    );
}