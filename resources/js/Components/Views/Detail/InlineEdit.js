import React, {useState, useEffect} from "react";
import { PencilIcon, CheckIcon, XIcon } from "@heroicons/react/solid";
import Element from "./Element";
import Axios from "axios";
import { Inertia } from "@inertiajs/inertia";
import notie from 'notie';

export default function InlineEdit(props) {
    
    const [record, setRecord] = useState(props.record);
    const [currentInfo, setCurrentInfo] = useState(props.field);
    const [temp, setTemp] = useState({});
    const [fields, setFields] = useState();
    const [showEditView, setShowEditView] = useState(false);

    useEffect( () => {
        fetchModuleFields();
    },[]);
    
    /**
     * Fetch module fields
     */
     function fetchModuleFields() {

        let endpoint_url = route('fetchModuleFields', {'module': props.module});
        Axios.get(endpoint_url).then((response) => {
            if (response.data.status !== false) {
                setFields(response.data.fields);
            }
            else {
                notie.alert({type: 'error', text: response.data.message, time: 5});
            }
        });
    }

    // Get which field you want to edit 
    function editCurrentField(field_name, field_type) {
        let newTemp = Object.assign({}, temp);
    
        // reset the old value
        newTemp = {};
        setTemp(newTemp);

        // Get current field name and type 
        newTemp['name'] = field_name
        newTemp['value'] = props.value;
        newTemp['type'] = field_type;
        setTemp(newTemp);
        setShowEditView(true);
    }

    function cancelEdit(){
        setTemp({});
        setShowEditView(false);
    }
    

    // Temporary record values
    function tempDataHandler(name, value) {
        let newTemp = Object.assign({}, temp); 
        newTemp['name'] = name;
        newTemp['value'] =value;
        setTemp(newTemp);
    }

    // Check the edit field is mandatory or not 
    function checkIsMandatory (temp) {
        let check = true;
        let is_mandatory = currentInfo.mandatory;

        if(is_mandatory == 1) {
            let tempValue = temp.value;
            if(!tempValue) {
                check = false;
                notie.alert({type: 'error', text: 'This field is mandatory', time: 5});  
                cancelEdit();              
            }
        }
        return check;
    }
    
    // Save the record changes
    function saveEdit(){
        let Ismandatory = checkIsMandatory(temp);
        
        if (Ismandatory) {
            let customfields = (record.custom) ? record.custom : {};
            let Iscustom = currentInfo.custom;
           
            if(!Iscustom) {
                record[temp.name] = temp.value;
            }else {
                customfields[temp.name] = temp.value;
                record['custom'] = customfields;
            }
    
            Inertia.post(route('update' + props.module, {id: record.id}), record, {
                onSuccess: (response) => {
                    cancelEdit();
                }           
            });
        }
    }

    return (
        <>
            {showEditView ? 
              <>
                <Element
                  record={props.record}
                  fields={fields}
                  temp={temp}
                  fieldOptions={props.fieldOptions}
                  tempDataHandler={tempDataHandler}
                />
                <div className="p-2 text-gray-900"><CheckIcon className="h-6 w-6 text-green-900"  onClick={() => saveEdit()}/></div>
                <div className="p-2 text-gray-900"><XIcon className="h-6 w-6 text-red-900"  onClick={() => cancelEdit()}/></div>
              </>
             :
              <>
                {props.value} 
              <span className="px-3"><PencilIcon className="h-4 w-4"  onClick={() => editCurrentField(currentInfo.name, currentInfo.type)}/></span>
              </>
            } 
        </>        
    );
}