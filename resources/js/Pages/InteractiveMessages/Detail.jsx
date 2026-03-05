import React, { useState, useEffect } from "react";
import Authenticated from "../../Layouts/Authenticated";
import DetailView from "@/Components/Views/Detail/Index";
import Form from '@/Components/Forms/Form';
import NewForm from "@/Components/Forms/NewForm";


export default function Detail(props) 
{
   
    const [showForm, setShowForm] = useState(false);
    useEffect(() => {
        
    },[]);


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
            current_page={'InteractiveMessage'}
            navigationMenu={props.menuBar}
        >
            
            <DetailView
                record={props.record}
                module='InteractiveMessage'
                updateRecord={showEditForm}
                headers={props.headers}                
                translator={props.translator}  
                current_userid={props.current_userid} 
                {...props}
            />
            
            {showForm ?
                <NewForm 
                    module={'InteractiveMessage'}
                    heading={props.heading}
                    hideForm={hideForm}
                    recordId={props.record.id}
                    {...props}
                />
            : ''}

        </Authenticated>
    );
}












