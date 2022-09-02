import React, {useState} from "react";
import ListTable from "../List/ListTable";
import Alert from '@/Components/Alert';
import Pagination from '@/Components/Pagination';
import Button from '@/Components/Forms/Button';
import ContactSelection from '@/Components/ContactSelection';

function SubPanels(props){
    const [showForm, setShowForm] = useState(false);
    
    /**
     * Hide form and reset the Record ID
     */
     function hideForm() {
        setShowForm(false);
        setRecordId('');
    }
    
    return(
        <div className="">
            <div className="flex min-w-0 justify-between">
                <div className='flex gap-4'></div>
                <div className='flex gap-4'>
                    {props.actions && props.actions.create === true &&
                        <Button 
                            type='button'
                            onClick={() => setShowForm(true)}
                        >
                            {props.add_button_text ? props.add_button_text : `Add ${props.module}`}
                        </Button>
                    }
                </div>
            </div>
            <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                           
                            <ListTable 
                                module={props.module}
                                headers={props.headers}
                                records={props.records}
                                actions={props.actions}
                            />
                            {Object.entries(props.records).length == 0 ?         
                                <Alert type='info' message= {'No record related yet.'} hideClose={true} />
                            : 
                                <Pagination paginator={props.paginator} />
                            }
                            
                            
                </div>
            </div>

            {showForm &&
            <ContactSelection
                    setShowForm={setShowForm}
                    parent_module={props.parent_module}
                    parent_id={props.parent_id}
                />
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