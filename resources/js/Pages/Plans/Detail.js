import React, {useState} from "react";
import Authenticated from "../../Layouts/Authenticated";
import DetailView from "@/Components/Views/Detail/Index";
import Form from '@/Components/Forms/Form';

function Detail(props){
    const [showForm, setShowForm] = useState(false);

    const tabs = [
        { label:(props.translator['Detail']),name: 'Detail', href: '#'  },    
        { label:(props.translator['Plan Detail']),name: 'company_plan', href: '#'  },
        { label:(props.translator['Workspace']),name: 'workspacePlan', href: '#'  },    
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
                users={props.users}
                module = 'Plan'
                updateRecord = {showEditForm}
                tabs = {tabs}
                headers = {props.headers}
                translator={props.translator}
                subscriptionPlan={props.subscription_plan}
                workspaces={props.workspaces}
            />
            
            {showForm ?
                <Form 
                    module={'Plan'}
                    heading={props.heading}
                    hideForm={hideForm}
                    recordId={props.record.id}
                />
            : ''}

        </Authenticated>
    )
}
export default Detail;