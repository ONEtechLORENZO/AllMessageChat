import React, { Fragment, useEffect, useRef, useState } from "react";
import { PencilIcon } from "../../../Pages/icons";
import Creatable from 'react-select/creatable';
import { Inertia } from "@inertiajs/inertia";


export default function Index(props) {
    const [record , setRecord] = useState(props.record);
    const [activeTab , setActiveTab] = useState('Detail');
    const [selectedOption, setSelectedOption] = useState(null);
    const [openSelectTag, setSelectTag] = useState(false);
    const [recordId, setRecordId] = useState();
    const [options ,setOption] = useState();

    useEffect(() => {
        if(props.tagOptions){
            setOption(props.tagOptions)
        }
        if(props.tagData){
            setSelectedOption(props.tagData);
        }
        setRecordId(props.record.id);
      },[props]);

    function openTag() {
        setSelectTag(true);
    } 

    function closeTag(){
        setSelectTag(false);
    }

    function saveTag (){
        var data = {
            'name': selectedOption ,
             'id' : recordId
        }
        Inertia.post(route('tag_save'), data, {
            onSuccess: (response) => {
                setSelectTag(false);
            },
        });
    }
   
    return (            
            <div>
                <ul className="py-4 space-y-2 sm:px-6 sm:space-y-4 lg:px-8" role="list">
                    <li className="bg-white px-4 py-6 shadow sm:rounded-lg sm:px-6">
                        <div className="sm:flex sm:justify-between sm:items-baseline">
                            <h3 className="text-base font-medium flex">
                                <div>
                                    <span className="text-gray-900 p-3">
                                        <span className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-gray-500">
                                            <span className="text-3xl font-medium leading-none text-white">
                                                {record.first_name ?
                                                    <> {(record.first_name).substring(0,2)} </>
                                                :
                                                    <> {(record.last_name).substring(0,2)} </>
                                                }
                                              
                                            </span>
                                        </span>
                                    </span>
                                </div>
                                <div>
                                    
                                    {props.module == 'Contacts' &&
                                        <>
                                            <div className="text-gray-600"> {record.first_name} {record.last_name}  </div>
                                            <div className="text-gray-600"> {record.phone_number} </div>
                                            <div className="text-gray-600"> {record.email} </div>
                                        </>
                                    }
                                </div>
                                
                            </h3>
                            <div className="mt-1 text-sm text-gray-600 whitespace-nowrap sm:mt-0 sm:ml-3">
                                <div>
                                    <button
                                        type="button"
                                        onClick={ () => props.updateRecord(record.id)}
                                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        <PencilIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                                        Edit
                                    </button>
                                </div>
                            </div>
                        </div>
                    </li>
                    <li className="bg-white px-4 py-6 shadow sm:rounded-lg sm:px-6">
                        <ul id="props.tabs" className="inline-flex w-full px-1 pt-2 ">
                            {Object.entries(props.tabs).map(([key, tab])=>{
                                var activeClassName = "px-4 py-2 -mb-px font-semibold text-gray-800 rounded-t opacity-50";
                                if(activeTab == tab.name){
                                    activeClassName += ' border-b-2 border-blue-400';
                                }
                                return(
                                    <li className={activeClassName} onClick={() => setActiveTab(tab.name)}>
                                        <a id="default-tab" href="#{tab.name}"> {tab.name} </a>
                                    </li>
                                )
                            })}
                        </ul>

                        <div id="tab-contents">
                            {Object.entries(props.tabs).map(([key, tab])=>{
                                var hideClass = "p-4";
                                if(activeTab != tab.name){
                                    hideClass += ' hidden';
                                }
                                return(
                                    <div id={tab.name} className={hideClass}>
                                        {tab.name == 'Detail' ?
                                            <div>
                                                {Object.entries(props.headers).map( ([key, field], index) => {
                                                    let showField = true;
                                                    let select = false;
                                                    if(key == 'id'){
                                                        showField = false;
                                                    }
                                                    if(key == 'tag'||key == 'list'){
                                                        select = true;
                                                        showField = false;
                                                    }
                                                    if(showField){ 
                                                        return(
                                                            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                                                <dt className="text-sm font-medium text-gray-500"> {field.label} </dt>
                                                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2"> {record[key]} </dd>
                                                            </div>
                                                        )
                                                    }
                                                    if(select){
                                                        return(
                                                            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                                                <dt className="text-sm font-medium text-gray-500"> {field.label} </dt>
                                                                <dd className="flex"> 
                                                                {openSelectTag?
                                                                <>
                                                                    <div className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 w-96" >
                                                                    <Creatable
                                                                    isMulti 
                                                                    value={selectedOption}
                                                                    defaultValue={selectedOption}
                                                                    onChange={setSelectedOption}
                                                                    options={options}
                                                                    />
                                                                    </div> 
                                                                    <div className="inline-flex items-center px-2.5 py-1.5 border-0 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3D4459]">
                                                                       <span >
                                                                         <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" onClick={() => saveTag()}>
                                                                            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                                                                          </svg>
                                                                       </span>
                                                                       <span >
                                                                         <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" onClick={() => closeTag(false)}>
                                                                           <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                                         </svg>
                                                                       </span>
                                                                    </div>
                                                                </>                                                                 
                                                                :
                                                                <>
                                                                {selectedOption && selectedOption.map((tag, key) => {
                                                                    return(
                                                                        <div className="mt-1 mx-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                                                            {tag.label} 
                                                                            {selectedOption.length > (key+1) && 
                                                                                <> , </>
                                                                            }
                                                                        </div>
                                                                    )
                                                                })}
                                                                    <div className="inline-flex items-center px-2.5 py-1.5 border-0 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3D4459]" onClick={() => openTag()}>
                                                                       <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                                         <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                                                       </svg>
                                                                    </div>
                                                                </>
         
                                                                 }
                                                                
                                                                </dd>
                                                            </div>    
                                                        )   
                                                    }    
                                                })}
                                            </div>
                                        :
                                            <> Notes List  </>
                                        }
                                    </div>
                                )
                            })}
                        </div>
                    </li>
                </ul>
            </div>
    );
}
