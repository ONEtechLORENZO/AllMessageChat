import React, { useState } from "react";
import Authenticated from "../../Layouts/Authenticated";
import DetailView from "@/Components/Views/Detail/Index";
import Form from '@/Components/Forms/Form';
import NewForm from "@/Components/Forms/NewForm";


export default function Detail(props) 
{
    const tabs = [
        { label: (props.translator['Detail']), name: 'Detail', href: '#' },
        { label: (props.translator['Notes']), name: 'Notes', href: '#' },
        { label: (props.translator['Deals']), name: 'Opportunity', href: '#' },
        { label: (props.translator['Order']), name: 'Order', href: '#' },
        { label: (props.translator['Media']), name: 'Document', href: '#' },
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
            current_page={'Contacts'}
            navigationMenu={props.menuBar}
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
                {...props}
                      
            />
            
            {showForm ?
                <NewForm 
                    module={'Contact'}
                    heading={props.heading}
                    hideForm={hideForm}
                    recordId={props.contact.id}
                    {...props}
                />
            : ''}

        </Authenticated>
    );
}









