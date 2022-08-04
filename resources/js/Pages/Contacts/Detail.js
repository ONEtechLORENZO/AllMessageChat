import React, { useState } from "react";
import Authenticated from "../../Layouts/Authenticated";
import DetailView from "@/Components/Views/Detail/Index";
import Form from '@/Components/Forms/Form';


export default function Detail(props) {

    const contactFields ={
        'id': { 'label': '', 'type': 'hidden', 'required': false, 'value': '' },
        'first_name': { 'label': 'First Name', 'type': 'text', 'required': false, 'value': '' },
        'last_name': { 'label': 'Last Name', 'type': 'text', 'required': true, 'value': '' } , 
        'email': { 'label': 'Email', 'type': 'email', 'required': true, 'value': '' }, 
        'phone_number': { 'label': 'Phone number', 'type': 'text', 'required': false, 'value': '' },
        'instagram_id': { 'label': 'Instagram ID', 'type': 'text', 'required': false, 'value': '' }, 
        'tag': { 'label': 'Tag', 'type': 'text', 'required': false, 'value': '' },
        'list': { 'label': 'List', 'type': 'text', 'required': false, 'value': '' },

        'tag': { 'label': 'Tag', 'type': 'text', 'required': false, 'value': '' },
        'list': { 'label': 'List', 'type': 'text', 'required': false, 'value': '' }
    };
    
    //const[record , setRecord] = useState(props.contact);
    const tabs = [
        { name: 'Detail', href: '#'  },
        { name: 'Notes', href: '#' },
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
     function showEditForm(id){
        setShowForm(true);
    }
    return (
        <Authenticated>

            <DetailView
                record = {props.contact}
                module = 'Contact'
                updateRecord = {showEditForm}
                tabs = {tabs}
                headers = {contactFields}
                tagData={props.tagData}
                tagOptions={props.tagOptions}
                listOptions={props.listOptions}
                listData={props.listData}

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
