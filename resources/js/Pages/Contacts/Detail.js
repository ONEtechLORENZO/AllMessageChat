import React, { useState } from "react";
import Authenticated from "../../Layouts/Authenticated";
import DetailView from "@/Components/Views/Detail/Index";
import Form from '@/Components/Forms/Form';


export default function Detail(props) 
{
    const tabs = [
        { label: (props.translator['Detail']), name: 'Detail', href: '#' },
        { label: (props.translator['Notes']), name: 'Notes', href: '#' },
        { label: 'Opportunity', name: 'Opportunity', href: '#' },
        { label: 'Order', name: 'Order', href: '#' },
        { label: 'Media', name: 'Document', href: '#' },
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
                record={props.contact}
                module='Contact'
                updateRecord={showEditForm}
                tabs={tabs}
                headers={props.headers}
                tagData={props.tagData}
                tagOptions={props.tagOptions}
                listOptions={props.listOptions}
                listData={props.listData}
                translator={props.translator}
                serviceOptions={props.serviceOptions}
                subscribedServices={props.subscribedServices}
                current_userid={props.current_userid}
                      
            />
            
            {showForm ?
                <Form 
                    module={'Contact'}
                    heading={props.heading}
                    hideForm={hideForm}
                    recordId={props.contact.id}
                />
            : ''}

        </Authenticated>
    );
}
