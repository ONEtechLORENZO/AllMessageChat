import React, { useState } from "react";
import Authenticated from "../../Layouts/Authenticated";
import DetailView from "@/Components/Views/Detail/Index";
import Form from '@/Components/Forms/Form';
import NewForm from "@/Components/Forms/NewForm";


export default function Detail(props) 
{
    const tabs = [
        { label: (props.translator['Detail']), name: 'Detail', href: '#' },
        { label: 'Contact', name: 'Contact', href: '#' },
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
    return (
        <Authenticated
            auth={props.auth}
            errors={props.errors}
            current_page={'Organizations'}
            navigationMenu={props.menuBar}
        >
            <DetailView
                record={props.record}
                module='Organization'
                updateRecord={showEditForm}
                tabs={tabs}
                headers={props.headers}    
                translator={props.translator}           
                {...props}   
            />
            
            {showForm ?
                <NewForm 
                    module={'Organization'}
                    heading={props.heading}
                    hideForm={hideForm}
                    recordId={props.record.id}
                />
            : ''}

        </Authenticated>
    );
}
