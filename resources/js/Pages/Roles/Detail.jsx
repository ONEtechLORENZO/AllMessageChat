import React, { useState } from "react";
import Authenticated from "../../Layouts/Authenticated";
import DetailView from "@/Components/Views/Detail/Index";
import Form from '@/Components/Forms/Form';
import NewForm from "@/Components/Forms/NewForm";


export default function Detail(props) 
{
    const tabs = [
        { label: (props.translator['Detail']), name: 'Detail', href: '#' },
        { label: ('Permissions'), name: 'Permissions', href: '#' },
    ];
    
    const [showForm, setShowForm] = useState(false);

    /**
     * Hide form and reset the Record ID
     */
    function hideForm() {
        setShowForm(false);
    }

    /**
     * Update contact
     */
     function showEditForm(id) {
        setShowForm(true);
    }
    
    /**
     * Data handler
     */
    function DataHandler(){

    }

    return (
        <Authenticated
            auth={props.auth}
            errors={props.errors}
            current_page={'Roles'}
            navigationMenu={props.menuBar}
        >
            <DetailView
                record={props.record}
                module='Role'
                updateRecord={showEditForm}
                tabs={tabs}
                headers={props.headers}                
                translator={props.translator}  
                current_userid={props.current_userid}             
                module_permissions={props.module_permissions}
                role_permissions={props.role_permissions}
                DataHandler={DataHandler}
            />

            {showForm ?
                <NewForm 
                    module={'Role'}
                    heading={props.heading}
                    hideForm={hideForm}
                    recordId={props.record.id}
                    {...props}
                />
            : ''}

        </Authenticated>
    );
}









