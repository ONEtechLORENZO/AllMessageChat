import React, {useState} from "react";
import Authenticated from "../../Layouts/Authenticated";
import DetailView from "@/Components/Views/Detail/Index";
import Form from '@/Components/Forms/Form';
import Wallet from "@/Pages/Wallet/Index"

function Detail(props){
    const [showForm, setShowForm] = useState(false);

    const tabs = [
      //  { label:(props.translator['Detail']),name: 'Detail', href: '#'  },
       { label:(props.translator['Acitivies']),name: 'Acitivies', href: '#'  },
       { label:(['Users']),name: 'Users', href: '#'  },
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
            current_page='Company'
        >
       <DetailView
                record={props.record}
                users={props.users}
                current_user={props.current_user}
                module='Company'
                updateRecord={showEditForm}
                tabs={tabs}
                headers={props.headers}
                tagData={props.tagData}
                tagOptions={props.tagOptions}
                listOptions={props.listOptions}
                listData={props.listData}
                translator={props.translator}
                role={props.role} 
                {...props}/>      

            {showForm ?
                <Form 
                    module={'Company'}
                    heading={props.heading}
                    hideForm={hideForm}
                    recordId={props.record.id}
                />
            : ''}

        </Authenticated>
    )
}
export default Detail;