import React, {useState} from "react";
import Authenticated from "../../Layouts/Authenticated";
import DetailView from "@/Components/Views/Detail/Index";
import Form from '@/Components/Forms/Form';
import NewForm from "@/Components/Forms/NewForm";

function Detail(props){
    const [showForm, setShowForm] = useState(false);

    const tabs = [
       // { label:(props.translator['Detail']),name: 'Detail', href: '#'  },
        { label:(['Contacts']),name: 'Contact', href: '#'  },
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
            current_page={'Lists'}
            navigationMenu={props.menuBar}
        >
            <DetailView
                record = {props.record}
                related_records={props.related_records}
                module = 'Category'
                updateRecord = {showEditForm}
                tabs = {tabs}
                headers = {props.headers}
                sub_headers = {props.related_records_header} 
                translator={props.translator}
                actions={props.sub_panbel_actions}
                pagination={props.sub_panel_pagination}
                current_tab = 'Contact'
            />
            
            {showForm ?  
                <NewForm 
                    module={'Category'}
                    heading={props.heading}
                    hideForm={hideForm}
                    recordId={props.record.id}
                    translator={props.translator}
                    {...props}
                />
            : ''}

        </Authenticated>
    )
}
export default Detail;












