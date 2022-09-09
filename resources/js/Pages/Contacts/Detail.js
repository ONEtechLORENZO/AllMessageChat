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
               // related_records={props.related_records}
                //sub_headers = {props.related_records_header} 
                //actions={props.sub_panbel_actions}
                //pagination={props.sub_panel_pagination}                
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
