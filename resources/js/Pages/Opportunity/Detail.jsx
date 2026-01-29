import React, {useState} from "react";
import Authenticated from "../../Layouts/Authenticated";
import DetailView from "@/Components/Views/Detail/Index";
import Form from '@/Components/Forms/Form';
import NewForm from "@/Components/Forms/NewForm";

function Detail(props){
    const [showForm, setShowForm] = useState(false);

    const tabs = [
        { label:(props.translator['Detail']),name: 'Detail', href: '#'  },
        { label: 'Product', name: 'Product', href: '#' },       
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
            current_page={'Deals'}
            navigationMenu={props.menuBar}
        >
            <DetailView
                record = {props.record}
                users={props.users}
                module = 'Opportunity'
                updateRecord = {showEditForm}
                tabs = {tabs}
                headers = {props.headers}
                tagData={props.tagData}
                tagOptions={props.tagOptions}
                listOptions={props.listOptions}
                listData={props.listData}
                translator={props.translator}
                productList={props.productList}
                lineItems = {props.lineItems}
                {...props}
            />
            
            {showForm ?
                <NewForm 
                    module={'Opportunity'}
                    heading={props.heading}
                    hideForm={hideForm}
                    recordId={props.record.id}
                />
            : ''}

        </Authenticated>
    )
}
export default Detail;












