import React, {useState, useEffect} from "react";
import Authenticated from "@/Layouts/Authenticated";
import axios from "axios";
import notie from 'notie';
import nProgress from 'nprogress';
import { Inertia } from "@inertiajs/inertia";

export default function RecordMerger(props) {

    const [fields, setFields] = useState(props.fields);
    const [fieldOptions, setFieldOptions] = useState({});
    const [records, setRecords] = useState(props.records);
    const [mergeRecord, setMerger] = useState({});
    const [data, seData] = useState({});

    useEffect( () => {
        optionFields(props.fields);   
    },[]);

    useEffect( () => {
        recordMerger();
    },[mergeRecord]);

    // GET Dropdown fields value
    function optionFields(fields) {
        if(fields) {
            Object.entries(fields).map( ([key,field]) => {
                let newFieldOptions = Object.assign({}, fieldOptions);
                if(field.field_type == 'dropdown') {
                    newFieldOptions[field.field_name] = field.options;
                    setFieldOptions(newFieldOptions);  
                }
            });
        }
    }

    // Master Record id
    function selectedMasterRecord(id) {
        if(id) {
           records.map( (record) => {
              if(record.id == id) {
                let newMerger = Object.assign({}, mergeRecord);
                fields.map( (field) => {
                    let fieldname = field.field_name;

                    newMerger[fieldname] = record.id;
                    setMerger(newMerger);
                })
                newMerger['master_id'] = record.id;
                setMerger(newMerger);
              }
            })
        }
    }
    
    // Change record values
    function recordHandler(id, name) {
        let newMerger = Object.assign({}, mergeRecord);
        newMerger[name] = id;
        setMerger(newMerger);
    }

    // Merge your records
    function recordMerger() {
        let newState = Object.assign({}, data); 
        let customfields = (data.custom) ? data.custom : {};

        Object.entries(mergeRecord).map( ([name, id]) => {
            records.map( (record) => {
                if(record.id == id) {
                    fields.map( (field) => {
                        let fieldname = field.field_name;
                        let value = field.is_custom == 0 ? record[fieldname] : record.custom ? record['custom'][fieldname] : '';

                        if(name == fieldname && field.is_custom == 0) {
                            newState[fieldname] = value;
                        }
            
                        if(name == fieldname && field.is_custom == 1) {
                            customfields[fieldname] = value; 
                            newState['custom'] = customfields;
                        }
                    });
                }
            });
        });
        seData(newState);
    }

    // Save the merge records
    function mergeHandler() {
        let masterId = mergeRecord.hasOwnProperty('master_id');

        if(masterId) {
            nProgress.start(0.5);
            nProgress.inc(0.2);

            Inertia.post(route('update' + props.module, {id: mergeRecord.master_id}), data, {
                onSuccess: (response) => {
                    nProgress.done(true);
                },
            });

        } else {
            notie.alert({type: 'warning', text: ' Please select master record', time: 5});
        }
    }

    return (
      <Authenticated
        auth={props.auth}
        errors={props.errors}
      >

        <div className="px-4 sm:px-6 lg:px-8">
            <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
                <h1 className="text-xl font-semibold text-gray-900">Merge Record</h1>
                <p className="mt-2 text-sm text-gray-700 sr-only">
                  Merge multi record as single record
                </p>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                <button
                 type="button"
                 className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
                 onClick={() => mergeHandler()}
               >
                Merge
                </button>
            </div>
            </div>
            <div className="mt-8 flex flex-col">
            <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                        <tr className="divide-x divide-gray-200">
                        <th scope="col" className="py-3.5 pl-4 pr-4 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                            Name
                        </th>
                        {records.map( (record,index) => (
                            <th scope="col" key={record.id}className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900">
                                <input
                                    id={record.id}
                                    name={'master_record'}
                                    type="radio"
                                    className="h-4 w-4 mr-3 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    onClick={() => selectedMasterRecord(record.id)}
                                />
                                Record {index + 1}
                            </th>
                        ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {fields.map( (field) => (
                            <tr key={field.field_name} className="divide-x divide-gray-200">
                                <td className="whitespace-nowrap py-4 pl-4 pr-4 text-sm font-medium text-gray-900 sm:pl-6">
                                 {field.field_label}
                                </td>
                                {records.map( (record) => {
                                    let fieldname = field.field_name;
                                    let value = field.is_custom == 0 ? record[fieldname] : record.custom ? record['custom'][fieldname] : '';

                                    if(field.field_type == 'dropdown') {
                                        if(fieldOptions[fieldname]){
                                            if(record.hasOwnProperty(fieldname)){
                                                value = (fieldOptions[fieldname]) ? fieldOptions[fieldname][value] : value;
                                            }
                                        }
                                    }
                                    else if(field.field_type == 'multiselect') {
                                        value =  (value) ? value.join(', ') : ' ';
                                    }

                                    if(field.field_type == 'relate') {
                                        let relate_value = record[fieldname] ? record[fieldname] : '';
                                        if(relate_value) {
                                            let relate_module = relate_value['module'];
                                            if(relate_module) {
                                                value = relate_value['label'];
                                            }else {
                                                value = '';
                                            }
                                        }
                                    }
                                    
                                    if(field.type == 'checkbox') {
                                        value = (value) ? 'checked': 'unchecked';
                                    }
                                    
                                    return(
                                        <td className="whitespace-nowrap p-4 text-sm text-gray-500">
                                            <input
                                                id={fieldname}
                                                name={fieldname}
                                                type="radio"
                                                checked={mergeRecord[fieldname] == record.id ? true : false}
                                                className="h-4 w-4 mr-3 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                onClick={() => recordHandler(record.id, fieldname)}
                                            />
                                            {value}
                                        </td> 
                                    );
                                })}
                            </tr>
                        ))}
                        
                    </tbody>
                    </table>
                </div>
                </div>
            </div>
            </div>
        </div>
         
      </Authenticated>
    );
}