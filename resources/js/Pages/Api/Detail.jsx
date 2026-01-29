import React, {useState} from "react";
import Authenticated from "../../Layouts/Authenticated";
import DetailView from "@/Components/Views/Detail/Index";
import Form from '@/Components/Forms/Form';

function Detail(props){
    const [showForm, setShowForm] = useState(false);
    const tabs = [
         { label:(props.translator['Detail']),name: 'Detail', href: '#'  },
        // { label:(['Contacts']),name: 'Contact', href: '#'  },
       ];
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
    return(
        <Authenticated
            auth={props.auth}
            errors={props.errors}
        >
            <DetailView
                record = {props.record}
                module = 'Api'
                updateRecord = {showEditForm}
                headers = {props.headers}
                translator={props.translator}
                tabs = {tabs}
                user={props.auth.user}
                current_tab = 'Detail'
            />
            
            {showForm ?  
                <Form 
                    module={'Api'}
                    heading={'Api'}
                    hideForm={hideForm}
                    recordId={props.record.id}
                />
            : ''}

        </Authenticated>
    )
}
export default Detail;









