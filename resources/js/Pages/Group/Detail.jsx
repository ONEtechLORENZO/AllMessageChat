import React, { useState } from "react";
import Authenticated from "../../Layouts/Authenticated";
import DetailView from "@/Components/Views/Detail/Index";
import Form from '@/Components/Forms/Form';
import NewForm from "@/Components/Forms/NewForm";


export default function Detail(props) 
{
    const tabs = [
        { label: (props.translator['Detail']), name: 'Detail', href: '#' },        
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
            current_page={'Groups'}
            navigationMenu={props.menuBar}
        >
            <DetailView
                record={props.record}
                module='Group'
                updateRecord={showEditForm}
                tabs={tabs}
                headers={props.headers}                
                translator={props.translator}  
                user_list={props.user_list}
                current_userid={props.current_userid} 
                {...props}
            />
            
            {showForm ?
                <NewForm 
                    module={'Group'}
                    heading={props.heading}
                    hideForm={hideForm}
                    user_list={props.user_list}
                    recordId={props.record.id}
                    {...props}
                />
            : ''}

        </Authenticated>
    );
}












