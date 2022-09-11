import React, {useState,useEffect} from "react";
import ListTable from "../List/ListTable";
import Alert from '@/Components/Alert';
import Pagination from '@/Components/Pagination';
import Button from '@/Components/Forms/Button';
import ContactSelection from '@/Components/ContactSelection';
import Form from '@/Components/Forms/Form';
import Axios from "axios";
import notie from 'notie';

function SubPanels(props){
    const [showForm, setShowForm] = useState(false);
    const [fieldOptions, setFieldOptions ] = useState([]);
    const [recordDetails, setrecordDetails ] = useState([]);
    const [headers, setHeaders ] = useState([]);
    const [actions, setActions ] = useState([]);
    const [paginateDetail, setpaginateDetail ] = useState([]);
    const [recordId, setRecordId] = useState(''); 

    useEffect(() => {
        getData();
       }, [props]);


     
       function getData()
    {
        let endpoint_url = route("subpanel_list" , {'module':props.parent_module,'id': props.parent_id,'submodule':props.module});   
        axios({
            method: 'get',
            url: endpoint_url,
        })
        .then((response) => {                      
          setrecordDetails(response.data.related_records); 
          setHeaders(response.data.sub_headers);
          setpaginateDetail(response.data.pagination);
          setActions(response.data.actions);
      
      });
   
    }

    /**
     * Hide form and reset the Record ID
     */
     function hideForm() {
        setShowForm(false);
        setRecordId('');
    }
    /**
     * Get dropdown field options
     */
     function getFieldOptions(name){
        let newFieldOptions = Object.assign({}, fieldOptions);
        axios({
            method: 'get',
            url: route('get_field_options', {'field_name': name, 'module_name': props.module}),
        })
        .then( (response) =>{
            newFieldOptions[name] = response.data.options;          
          setFieldOptions(newFieldOptions);
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
                           
                            <ListTable 
                                module={props.module}
                                headers={headers}
                                records={recordDetails}
                                actions={actions}
                                fieldOptions={fieldOptions}
                                getFieldOptions={getFieldOptions}
                                paginator={paginateDetail}
                            />
                            {Object.entries(recordDetails).length == 0 ?         
                                <Alert type='info' message= {'No record related yet.'} hideClose={true} />
                            : 
                                <Pagination paginator={paginateDetail} />
                            }
                            
                            
                </div>
            </div>

            {showForm && (props.module==='Contact'?
            <ContactSelection
                    setShowForm={setShowForm}
                    parent_module={props.parent_module}
                    parent_id={props.parent_id}
                /> :<Form 
                module={props.module}
                heading={props.heading}
                hideForm={hideForm}
                recordId={recordId}
                translator={props.translator}
               // parent_id={props.parent_id}
                //parent_module={props.parent_module} 
            />)
           }
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