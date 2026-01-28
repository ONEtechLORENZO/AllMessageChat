import React, { useEffect, useState } from "react";
import { AiOutlineArrowRight } from "react-icons/ai";
import Axios from "axios";
import notie from 'notie';
import { ChevronRightIcon } from '@heroicons/react/solid';

export default function Step4(props) {

    const [fbfields, setfbFields] = useState();
    const [crmfields, setCrmFields] = useState();
    const [mappingfields, setMappingfields] = useState();

    useEffect(() => {
        fetchFacebookFields()
    },[props]);

    function fetchFacebookFields()
    {          
        let endpoint_url = route('fetchFBfields',{'module': 'Product', 'catalog_id': props.catalogId});   
        Axios.get(endpoint_url).then((response) => {      
            if(response.data) {
                setfbFields(response.data.fb_fields);
                setCrmFields(response.data.crm_fields);
                setMappingfields(response.data.mapping_fields);
            }      
        })      
    }

    function handleFBMapping(event) {
        let newState = Object.assign({}, mappingfields);
        let name = event.target.name;
        let value = event.target.value;
        newState[name] = value;
        setMappingfields(newState);
    } 

    function validation() {
       let check = false;
       if(mappingfields['name'] && mappingfields['price']) check = true;
       return check;
    }

    function saveMappingField() {
        if(mappingfields) {
            let check = validation();

            if(check) {
                Axios({
                    method: 'post',
                    url: route('schedule_mappingfield',{'id':props.catalogId}),
                    data: mappingfields
                })
                .then( (response) => {
                    props.setTab('schedule');
                }); 
            } else {
                notie.alert({type: 'warning', text: 'Please fill the mandatory fields', time: 5}); 
            }
            
        } else {
            notie.alert({type: 'warning', text: 'Please fill the mandatory fields', time: 5}); 
        }
    }

    return (
        <>
           <div className="flex-1">
                <div className="space-y-4">
                    <div className="flex !gap-2 items-center">
                        <span>Meta Profile</span>
                        <AiOutlineArrowRight/>
                        <span>Meta Business</span>
                        <AiOutlineArrowRight/>
                        <span>Meta Catalog</span>
                        <AiOutlineArrowRight/>
                        <span className="text-[#7c3aed]">Meta Map field</span>
                    </div>

                    <div className="text-sm font-semibold !mt-8">Match the product fields with those of your OneMessage CRM</div>
                    
                    <div className="space-y-1"> 
                       {fbfields && crmfields ? 
                          <>
                            {Object.entries(fbfields).map( ([fb_key, record]) => {
                                return(
                                    <div className="sm:grid sm:grid-cols-12 sm:gap-4">
                                        <label htmlFor="first-name"className="block col-span-4 text-sm font-medium text-gray-700 sm:mt-px sm:pt-2 flex">
                                            {record.field_label}
                                            {record.is_mandatory ?  <span className='text-red-600 px-2'>*</span> : ''}
                                        </label>
                                        <div className="mt-1 col-span-8 !sm:mt-0">
                                           <select 
                                              id={record.field_name}
                                              name={record.field_name}
                                              className="block w-48 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500  sm:text-sm"
                                              onChange={(event) => handleFBMapping(event) }
                                           >
                                            <option value=""> select </option>
                                            {Object.entries(crmfields).map( ([crm_key, option]) => {
                                                return(
                                                   <> 
                                                    {mappingfields && (mappingfields[crm_key] == fb_key) ? 
                                                        <option value={option.field_name} selected>        
                                                          {option.field_label} 
                                                        </option> 
                                                    : 
                                                        <option value={option.field_name}>        
                                                            {option.field_label} 
                                                        </option>
                                                    }
                                                   </>
                                                )
                                            })}
                                            </select>
                                        </div>
                                    </div>
                                )
                            })}
                          </>
                       :''}
                    </div>
                </div>
            </div>

            <div className="h-16 flex items-center justify-between">
              <button type="button" className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm" onClick={() => props.setShowImport(false)}>Cancel</button>
              <button 
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#7c3aed] text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={() => saveMappingField()}
              >
                Next <ChevronRightIcon className="w-4 h-4 text-white mt-1"/>
              </button>  
            </div>
        </>
        
    );
}
