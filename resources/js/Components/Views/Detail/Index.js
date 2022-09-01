import React, { Fragment, useEffect, useRef, useState } from "react";
import { PencilIcon, UserIcon,WhatsAppIcon,    
    InstaIcon} from "../../../Pages/icons";
import { Inertia } from "@inertiajs/inertia";
import ReactSelect from "./ReactSelect";
import Notes from '@/Components/Notes';
import { Head,Link } from "@inertiajs/inertia-react";
import SubPanels from "./SubPanels";
import { WhatsApp } from "@mui/icons-material";
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import notie from 'notie';

export default function Index(props) {
    const [record , setRecord] = useState(props.record);
    const [activeTab , setActiveTab] = useState('Detail');
    const [tagSelectedOption, setTagSelectedOption] = useState(null);
    const [ListSelectedOption, setListSelectedOption] = useState(null);
    const [serviceSelected, setServiceSelectedOption] = useState(null);
    const [tagOption ,setTagOption] = useState();
    const [serviceOption ,setServiceOption] = useState();
    const [listOption, setListOption] = useState();
    const [recordId, setRecordId] = useState();
    const [tagOpen, setTagOpen] = useState(false);
    const [subscribeInfo, setSubscribeInfo] = useState(['Whatsapp','Instagram'])
    const [subscribeStatus, setSubscribeStatus] = useState({
        'Whatsapp':false,
       'Instagram':false
    })
    const [listOpen, setListOpen] = useState(false);
    const [defaultHeader , setDefaultHeader] = useState(props.headers.default);
    const [customHeader, setCustomHeader] = useState(props.headers.custom);
    const [fieldOptions, setFieldOptions ] = useState({});

    useEffect(() => {
        setRecord(props.record);
        setTagOption(props.tagOptions);
        setServiceOption(props.serviceOptions);
        setListOption(props.listOptions);
        setTagSelectedOption(props.tagData);
       setServiceSelectedOption(props.serviceData);
        setListSelectedOption(props.listData);        
        setRecordId(props.record.id);
        if(props.current_tab){
            setActiveTab(props.current_tab);
        } 
      },[props]);  
    function saveTag (){
        var data = {
            'name': tagSelectedOption ,
             'id' : recordId,
             'view': 'Detail',
        }
        Inertia.post(route('storeTag'), data, {
            onSuccess: (response) => {
                setTagOpen(false);
            },
        });
    }
    function handleClick (e){        
        
        if(subscribeStatus[e.target.name]==false)
            {   
                savesubscription(e)
            }
            else
              {
                removesubscription(e)
              }
    }
    function savesubscription (e){        
        confirmAlert({
            message: ('Please confirm your Subscription'),
            buttons: [
            {
              label: ('Confirm'),
              onClick: () => {                      
        var data = {
            'service_name': e.target.value ,
             'service_id' : e.target.id,
             'id' : recordId            
        }
        console.log('')
        Inertia.post(route('saveSubscription'), data, {
            onSuccess: (response) => {
                setSubscribeStatus((state) => ({
                    ...state,
                    [e.target.name]: true}))
                notie.alert({type: 'success', text: 'Subscribed successfully', time: 5});                
            },
        });}},
        {
            label: 'No',            
          }
        ]
      });
    }
    function removesubscription (e){
        confirmAlert({
            message: ('Are you sure you want to cancel the subscription?'),
            buttons: [
            {
              label: ('Confirm'),
              onClick: () => {                      
        var data = {
            'service_name': e.target.name ,
             'service_id' : e.target.id,
             'id' : recordId            
        }
        Inertia.post(route('removeSubscription'), data, {
            onSuccess: (response) => {
                setSubscribeStatus((state) => ({
                    ...state,
                   [e.target.name]: false}))
                notie.alert({type: 'success', text: 'Subscription removed successfully', time: 5});
            },
        });}},
        {
            label: 'No',            
          }
        ]
      });
    }

    function saveList (){
        var data = {
            'name': ListSelectedOption ,
             'id' : recordId,
             'view': 'Detail',
        }
        Inertia.post(route('storeCategory'), data, {
            onSuccess: (response) => {
                setListOpen(false);
            },
        });
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

    return (            
            <div>
                <Head title={props.module}/>
                <ul className="py-4 space-y-2 sm:px-6 sm:space-y-4 lg:px-8" role="list">
                    <li className="bg-white px-4 py-6 shadow sm:rounded-lg sm:px-6">
                        <div className="sm:flex sm:justify-between sm:items-baseline">
                            <h3 className="text-base font-medium flex">
                                <div>
                                    <span className="text-gray-900 p-3">
                                        <span className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-gray-500">
                                            <span className="text-3xl font-medium leading-none text-white">
                                                {(props.module == 'Contact')  ?
                                                    <> {(record.first_name).substring(0,2)} </>
                                                :
                                                    <> {(record.name).substring(0,2)} </>
                                                }
                                              
                                            </span>
                                        </span>
                                    </span>
                                </div>
                                
                                    
                                    {props.module == 'Contact' ?
                                        <>
                                        <div>
                                            <div className="text-gray-600"> {record.first_name} {record.last_name}  
                                            <div className="text-gray-600"> {record.phone_number} </div>
                                            <div className="text-gray-600"> {record.email} </div>
                                            </div>
                                            <div>
                                          

                                                <div className="mt-1 text-lg text-gray-600 whitespace-nowrap sm:mt-0 sm:ml-3 ">Click here to subscribe/unsubscribe
                                             
                                                { Object.entries(props.serviceOptions).map(([key, service])=> {
                                            return(
                                                <>    
                                                
                                    <button
                                        type="button"
                                        onClick={ (e) => handleClick(e)}
                                        name={service.name}
                                        id={service.value}                                       
                                        value={service.name} 
                                                                     
                                        className={`inline-flex items-left ml-2 px-4 py-2 h-10 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                                            subscribeStatus[service.name]? "bg-green-600" : "bg-gray-700"
                                        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                                    >
                                       {/*<WhatsAppIcon className="h-3 w-5" aria-hidden="true" />*/}
                                       {service.name}
                                    </button>
                                     </>
                                                );
                                            } )}
                                    
                            </div></div></div>
                                                

                                        </>
                                        :
                                        <>
                                        <div>
                                            <div className="text-gray-600">{record.name}  </div></div>
                                        </>
                                    }
                                
                                
                            </h3>
                            <div className="mt-1 text-sm text-gray-600 whitespace-nowrap sm:mt-0 sm:ml-3">
                                <div>
                                    <button
                                        type="button"
                                        onClick={ () => props.updateRecord(record.id)}
                                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        <PencilIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                                        {props.translator['Edit']}
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
                                        <a id="default-tab" href={"#"+tab.name}> {tab.label} </a>
                                    </li>
                                )
                            })}
                        </ul>

                        <div id="tab-contents">
                            {Object.entries(props.tabs).map(([key, tab])=>{
                                var hideClass = "p-4 divide-y";
                                if(activeTab != tab.name){
                                    hideClass += ' hidden';
                                }
                                return(
                                    <div id={tab.name} className={hideClass}>
                                        {tab.name == 'Detail' &&
                                           <>
                                            <div className="">
                                                <div className="px-4 py-2 -mb-px font-semibold text-gray-900 rounded-t opacity-70 divide-y"> General </div>  

                                                {Object.entries(defaultHeader).map( ([key, field]) => {
                                                    var field_name = key;
                                                    let showField = true;
                                                    let select = false;
                                                    if(key == 'id'){
                                                        showField = false;
                                                    }
                                                    if(key == 'tag'||key == 'list'){
                                                        showField = false;
                                                    }
                                                    var value = record[key];
                                                    if(field.type == 'dropdown'){
                                                        if(!fieldOptions[field_name]){
                                                            getFieldOptions(field_name);
                                                        }
                                                        if(record.hasOwnProperty(key)){
                                                            value = (fieldOptions[field_name]) ? fieldOptions[field_name][value] : value;
                                                        }
                                                    }
                                                   
                                                    if(showField){ 
                                                        return(
                                                            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                                                <dt className="text-sm font-medium text-gray-500"> {field.label} </dt>
                                                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2"> {value} </dd>
                                                            </div>
                                                        )
                                                    }
                                                    if(key == 'tag'){
                                                        return(
                                                            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                                                <dt className="text-sm font-medium text-gray-500"> {field.label} </dt>
                                                                <dd className="flex"> 
                                                                    <ReactSelect
                                                                    value={tagSelectedOption}
                                                                    defaultValue={tagSelectedOption}
                                                                    onChange={setTagSelectedOption}
                                                                    options={tagOption}
                                                                    setOpen={setTagOpen}
                                                                    save={saveTag}
                                                                    openTag={tagOpen}
                                                                    />
                                                                </dd>
                                                            </div>    
                                                        )   
                                                    }   
                                                    if(key == 'list'){
                                                        return(
                                                            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                                                <dt className="text-sm font-medium text-gray-500"> {field.label} </dt>
                                                                <dd className="flex"> 
                                                                    <ReactSelect
                                                                    value={ListSelectedOption}
                                                                    defaultValue={ListSelectedOption}
                                                                    onChange={setListSelectedOption}
                                                                    options={listOption}
                                                                    setOpen={setListOpen}
                                                                    save={saveList}
                                                                    openTag={listOpen}
                                                                    />
                                                                </dd>
                                                            </div>    
                                                        )
                                                    } 
                                                })}
                                            </div>
                                                {customHeader &&
                                                    <div className="divide-y"> 
                                                   
                                                        {Object.entries(customHeader).map(([group,fields]) => { 
                                                            return(
                                                                <div>
                                                                <div className="px-4 py-2 -mb-px font-semibold text-gray-800 rounded-t opacity-70 ">{group}</div>  
                                                                {Object.entries(fields).map(([key,field]) => { 
                                                                    
                                                                    var value = (record[key]) ? record[key] : (record.custom && record.custom[key]) ? record.custom[key] : '-';
                                                                    if(field.type == 'checkbox'){
                                                                        value = (value) ? 'True': 'False';
                                                                    }

                                                                    return(
                                                                        <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                                                            <dt className="text-sm font-medium text-gray-500"> {field.label} </dt>
                                                                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                                                                {value}
                                                                            </dd>
                                                                        </div>
                                                                    )
                                                                }) }
                                                                </div>
                                                            )
                                                        }) }
                                                  </div>
                                                }
                                            </>
                                        }
                                        {tab.name == 'Notes' &&
                                                <Notes
                                                    module={props.module}                                                                                
                                                    recordId={props.record.id} 
                                                />
                                        }
                                        {tab.name == 'Users' &&
                                            <>
                                            
                                               <ul role="list" className="divide-y divide-gray-200">
                                                    {Object.entries(props.users).map(([key, user]) => (
                                                        <li key={''} className="py-4 flex border-2 m-1 border-gray-100 p-4">
                                                            <span><UserIcon /> </span> 
                                                            <span className="ml-3">{user.name}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </>
                                        }
                                        {tab.name == 'Contact' &&
                                            <>
                                                <SubPanels 
                                                    module={tab.name}
                                                    parent_id={props.record.id}
                                                    parent_module={props.module}
                                                    headers={props.sub_headers}
                                                    records={props.related_records} 
                                                    actions={props.actions}
                                                    paginator={props.pagination}

                                                />
                                            </>
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
