import React, { useState } from "react";
import Authenticated from "../../Layouts/Authenticated";
import DetailView from "@/Components/Views/Detail/Index";
import Form from '@/Components/Forms/Form';


export default function Detail(props) 
{
    const tabs = [
        { label:'Support Request',name: 'SupportRequest', href: '#'  },       
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
                module='SupportRequest'
                updateRecord={showEditForm}
                headers={props.headers}
                tabs = {tabs}
                translator={props.translator}
                current_userid={props.current_userid}
                created_by = {props.created_by}
            />
            {showForm ?
                <Form 
                    module={'SupportRequest'}
                    heading={props.heading}
                    hideForm={hideForm}
                    recordId={props.record.id}
                />
            : ''}

        </Authenticated>
    );
}
