import React, {useState, useEffect} from "react";
import { PencilIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/solid";
import Element from "./Element";
import { router as Inertia } from "@inertiajs/react";
import notie from 'notie';

export default function InlineEdit(props) {
    
    const [record, setRecord] = useState(props.record);
    const [currentInfo, setCurrentInfo] = useState(props.field);
    const [temp, setTemp] = useState({});
    const [showEditView, setShowEditView] = useState(false);

    // Get which field you want to edit 
    function editCurrentField(field_name, field_type) {
        let newTemp = Object.assign({}, temp);
    
        // reset the old value
        newTemp = {};
        setTemp(newTemp);

        // Get current field name and type 
        newTemp['name'] = field_name
        newTemp['type'] = field_type;
        if(field_type == 'selectable') {
            newTemp['value'] = record[field_name] ? record[field_name] : '';
        } else {
            newTemp['value'] = props.value;
        }
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
        newTemp['value'] = value;
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

    function checkFieldType(temp){
        let check = true;
        let mail = temp.value;
        if(temp.type == 'email') {
            if(mail) {
                let regEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                if(!regEmail.test(mail)){
                    notie.alert({type: 'error', text: 'Please enter the valid email', time: 5});
                    check = false;
                    return false;
                }
            }
        }

        return check;
    }
    
    // Save the record changes
    function saveEdit(){
        let Ismandatory = checkIsMandatory(temp);
        let checkType = checkFieldType(temp);
        
        if (Ismandatory && checkType) {
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
                  temp={temp}
                  fieldOptions={props.fieldOptions}
                  tempDataHandler={tempDataHandler}
                  moduleFields={props.moduleFields}                 
                />
                <div className="p-2 text-gray-900"><CheckIcon className="h-6 w-6 text-green-900"  onClick={() => saveEdit()}/></div>
                <div className="p-2 text-gray-900"><XMarkIcon className="h-6 w-6 text-red-900"  onClick={() => cancelEdit()}/></div>
              </>
             :
              <>
                {props.value} 
                {(props.module != 'Plan' && props.field.name != 'api_key'&& props.field.type != 'phones' && props.field.type != 'emails') ? 
                    <span className="px-3"><PencilIcon className="h-4 w-4"  onClick={() => editCurrentField(currentInfo.name, currentInfo.type)}/></span>
                : ''}
              </>
            } 
        </>        
    );
}












