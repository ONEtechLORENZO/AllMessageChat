import React, { useState } from "react";
import Authenticated from "../../Layouts/Authenticated";
import DetailView from "@/Components/Views/Detail/Index";
import Form from '@/Components/Forms/Form';


export default function Detail(props) 
{
    const tabs = [
        { label: (props.translator['Detail']), name: 'Detail', href: '#' },
        { label: (props.translator['Notes']), name: 'Notes', href: '#' },       
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
        >
            <DetailView
                record={props.record}
                module='Lead'
                updateRecord={showEditForm}
                tabs={tabs}
                headers={props.headers}                
                translator={props.translator}  
                current_userid={props.current_userid}             
                      
            />
            
            {showForm ?
                <Form 
                    module={'Lead'}
                    heading={props.heading}
                    hideForm={hideForm}
                    recordId={props.record.id}
                />
            : ''}

        </Authenticated>
    );
}
