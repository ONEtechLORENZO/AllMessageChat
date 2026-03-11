import React, {useState,useEffect} from "react";
import ListViewTable from "../List/ListViewTable";
import Alert from '@/Components/Alert';
import Pagination from '@/Components/Pagination';
import Button from '@/Components/Forms/Button';
import ContactSelection from '@/Components/ContactSelection';
import Form from '@/Components/Forms/Form';
import { router as Inertia } from "@inertiajs/react";
import notie from 'notie';

function SubPanels(props){
    const [showForm, setShowForm] = useState(false);
    const [recordDetails, setrecordDetails ] = useState([]);
    const [headers, setHeaders ] = useState([]);
    const [actions, setActions ] = useState([]);
    const [paginateDetail, setpaginateDetail ] = useState([]);
    const [parentName, setparentName ] = useState([]);
    const [recordId, setRecordId] = useState(''); 

    useEffect(() => {
        getData();
    }, [props]);


    // Get subpanel records
    function getData()
    {
        let endpoint_url = route("subpanel_list" , {'module':props.parent_module,'id': props.parent_id,'submodule':props.module});   
        axios({
            method: 'get',
            url: endpoint_url,
        })
        .then((response) => {                      
          setrecordDetails(response.data.related_records); 
          setHeaders(response.data.related_records_header);
          setpaginateDetail(response.data.sub_panel_pagination);
          setActions(response.data.sub_panbel_actions);
          setparentName(response.data.parent_name);
        });
    }

    /**
     * Hide form and reset the Record ID
     */
     function hideForm() {
        setShowForm(false);
        setRecordId('');
    }

    function deleteRecord(record_id , soft_delete = false)
    {
        
        var recordData = {id: record_id};

        if(props.module == 'User'){
           
            if(props.auth.user.id == record_id) {
                notie.alert({type: 'error', text: 'you can not delete your profile.', time: 5});
                return false;
            }

            var msg = 'Are you sure you want to delete the user?';
            if(soft_delete){
                recordData['is_soft'] = true;
                msg = 'Are you sure you want to unlink the user?'
            }
            let confirmUserDelete = window.confirm(msg);
            if(!confirmUserDelete) {
                return;
            }

        } else {
            let confirm = window.confirm(props.translator['Are you sure you want to delete the record?']);
            if(!confirm) {
                return;
            }
        }
      
        Inertia.delete(route('delete' + props.module, recordData), {}, {
            onSuccess: (response) => { 
                notie.alert({type: 'success', text: (props.translator['Record deleted successfully']), time: 5});
            },
            onError: (errors) => {
                notie.alert({type: 'error', text: errors.message, time: 5});
            }
        });
    }

    return(
        <div className="">
            <div className="flex min-w-0 justify-between">
                <div className='flex gap-4'></div>
                <div className='flex gap-4'>
                    {actions && actions.create === true &&
                        <Button 
                            type='button'
                            onClick={() => setShowForm(true)}
                        >
                            {actions.add_button_text ? actions.add_button_text : `Add ${props.module}`}
                        </Button>
                    }
                </div>
            </div>
            <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                    
                    <ListViewTable 
                        module={props.module}
                        headers={headers}
                        records={recordDetails}
                        actions={actions}
                        paginator={paginateDetail}
                        deleteRecord={deleteRecord}
                        hideToolMenu
                        noCardBorder
                        {...props}
                    />
                    {Object.entries(recordDetails).length !== 0 &&                    
                        <Pagination paginator={paginateDetail} />
                    }

                </div>
            </div>

            {showForm && (props.module==='Contact'?
                <ContactSelection
                    setShowForm={setShowForm}
                    parent_module={props.parent_module}
                    parent_id={props.parent_id}
                    parent_name={parentName}
                    {...props}
                /> 
                :
                <Form 
                    module={props.module}
                    heading={props.heading}
                    hideForm={hideForm}
                    recordId={recordId}
                    translator={props.translator}
                    parent_name={parentName}
                    parent_module={props.parent_module} 
                    parent_id={props.parent_id} 
                    
                />
            )}
            {/* {showForm ?
                <Form 
                    module={props.module}
                    heading={props.heading}
                    hideForm={hideForm}
                    recordId={''}
                    translator={props.translator}
                    parent_id={props.parent_id}
                    parent_module={props.parent_module} 
                />
            : ''} */}

        </div>
    );
}
export default SubPanels;












