import React, { useEffect, useState } from "react";
import { PencilIcon, UserIcon } from "../../../Pages/icons";
import { Inertia } from "@inertiajs/inertia";
import ReactSelect from "./ReactSelect";
import Notes from '@/Components/Notes';
import { Head, Link } from "@inertiajs/inertia-react";
import SubPanels from "./SubPanels";
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import notie from 'notie';
import ItemTable from "@/Pages/Order/itemTable";
import InlineEdit from "./InlineEdit";
import { Disclosure } from '@headlessui/react'
import { ChevronDownIcon, SearchCircleIcon, TrashIcon } from "@heroicons/react/outline";
import SubscriptionPlan from "./PlanEdit";
import WorkspacePlan from "./WorkspacePlan";
import WorkspacePaid from "./WorkspacePaid";
import axios from "axios";
import Wallet from "@/Pages/Wallet/Index"
import Form from '@/Components/Forms/Form';
import Acitivies from "@/Pages/Company/Acitivies";
import Alert from '@/Components/Alert';
import CatalogDetail from "@/Pages/Catalog/CatalogDetail";
import ModulePermission from "@/Pages/Roles/ModulePermission";

export default function Index(props) {
    const [record, setRecord] = useState(props.record);
    const [activeTab, setActiveTab] = useState('Detail');

    const [tagSelectedOption, setTagSelectedOption] = useState(null);
    const [ListSelectedOption, setListSelectedOption] = useState(null);

    const [tagOption, setTagOption] = useState();
    const [listOption, setListOption] = useState();
    const [recordId, setRecordId] = useState();
    const [tagOpen, setTagOpen] = useState(false);

    const [listOpen, setListOpen] = useState(false);
    const [defaultHeader, setDefaultHeader] = useState(props.headers.default);
    const [customHeader, setCustomHeader] = useState(props.headers.custom);
    const [fieldOptions, setFieldOptions] = useState({});

    const [subscribedServices, setSubscribedServices] = useState([]);
    const [addClass, setAddClass] = useState(false);
    const [moduleFields, setModuleFields] = useState();

    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        fetchModuleFields();
        setRecord(props.record);
        setTagOption(props.tagOptions);

        setListOption(props.listOptions);
        setTagSelectedOption(props.tagData);

        setListSelectedOption(props.listData);
        setRecordId(props.record.id);

        if (props.current_tab) {
            setActiveTab(props.current_tab);
        }
        setSubscribedServices(props.subscribedServices);
    }, [props]);

      /**
     * Hide form and reset the Record ID
     */
       function hideForm() {
        setShowForm(false);
        setRecordId('');
    }

    function saveTag() {
        var data = {
            'name': tagSelectedOption,
            'id': recordId,
            'view': 'Detail',
        }

        Inertia.post(route('storeTag'), data, {
            onSuccess: (response) => {
                setTagOpen(false);
            },
        });
    }

    /**
     * Handle Contact Subscription
     * 
     * @param {object} event
     */
    function handleSubscription(event) {
        let service_name = event.target.name;
        if (subscribedServices.includes(service_name)) {
            removeSubscription(event);
        }
        else {
            saveSubscription(event);
        }
    }

    /**
     * Subscribe selected service
     * 
     * @param {object} e 
     */
    function saveSubscription(e) {
        confirmAlert({
            message: ('Please confirm your Subscription'),
            buttons: [{
                label: ('Confirm'),
                onClick: () => {
                    var data = {
                        'service_name': e.target.value,
                        'service_id': e.target.id,
                        'id': recordId
                    }

                    Inertia.post(route('saveSubscription'), data, {
                        onSuccess: (response) => {
                            let tmpState = Object.assign([], subscribedServices);
                            tmpState.push(e.target.name);
                            setSubscribedServices(tmpState);

                            notie.alert({ type: 'success', text: 'Subscribed successfully', time: 5 });
                        },
                    });
                }
            }, {
                label: 'No',
            }]
        });
    }

    /**
     * Remove selected service from Subscription
     * 
     * @param {object} e 
     */
    function removeSubscription(e) {
        confirmAlert({
            message: ('Are you sure you want to cancel the subscription?'),
            buttons: [
                {
                    label: ('Confirm'),
                    onClick: () => {
                        var data = {
                            'service_name': e.target.name,
                            'service_id': e.target.id,
                            'id': recordId
                        }

                        Inertia.post(route('removeSubscription'), data, {
                            onSuccess: (response) => {
                                let tmpState = Object.assign([], subscribedServices);
                                const index = tmpState.indexOf(e.target.name);
                                if (index > -1) {
                                    tmpState.splice(index, 1);
                                }
                                setSubscribedServices(tmpState);

                                notie.alert({ type: 'success', text: 'Subscription removed successfully', time: 5 });
                            },
                        });
                    }
                }, {
                    label: 'No',
                }]
        });
    }

    function lead_to_opportunity() {
        confirmAlert({
            message: ('Are you sure you want to convert the Lead Deal?'),
            buttons: [
                {
                    label: ('Confirm'),
                    onClick: () => {
                        Inertia.post(route('convertLead', { id: record.id })), {
                            onSuccess: (response) => {
                                notie.alert({ type: 'success', text: 'Moved successfully', time: 5 });
                            }
                        }
                    }
                }, {
                    label: 'No',
                }]
        });
    }

    function saveList() {
        var data = {
            'name': ListSelectedOption,
            'id': recordId,
            'view': 'Detail',
        }
        Inertia.post(route('storeCategory'), data, {
            onSuccess: (response) => {
                setListOpen(false);
            },
        });
    }

    function classNames(...classes) {
        return classes.filter(Boolean).join(' ')
    }

    function removeClass() {
        if (!addClass) {
            setAddClass(true);
            return false;
        }
        if (addClass) {
            setAddClass(false);
            return false;
        }
    }

     /**
     * Fetch module fields
     */
    function fetchModuleFields() {

        axios({
            method : 'get',
            url:  route('fetchModuleFields', {'module': props.module}),
        })
        .then((response) => {
            if (response.data.status !== false) {
                setModuleFields(response.data.fields);
                optionFields(response.data.fields);
            }
            else {
                notie.alert({type: 'error', text: response.data.message, time: 5});
            }
        });
    }

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

    function generateApiToken(){
        let confirm = window.confirm('Do you want add the user token?');

        if(confirm){
            axios({
                method: 'post',
                url: route('regenerate_token'),
                data: {
                    user_id: props.user.id,
                }
            })
            .then((response) => {
                linkToken(response.data.token);
            });
        }
    }

    function linkToken(token) {
        let data = {
            'token' : token,
            'id' : props.record.id
        };
        
        let url = route('link_token');
       
        Inertia.post(url, data, {
            onSuccess: (response) => {
                if(response){
                    notie.alert({ type: 'success', text: 'Your api token has been created.', time: 5 });
                }
            }
        })
    }

    function deleteToken(id) {
        if(id) {
            let url = route('delete_token');
            let data = {
                'record_id' : props.record.id,
                'token_id' : id
            };

            Inertia.post(url, data, {
                onSuccess: (response) => {
                    if(response){
                        notie.alert({ type: 'success', text: 'Your api token has been deleted.', time: 5 });
                    }
                }
            })
        }
    }

    function deleteRecord() {

        confirmAlert({
            message: ('Are you sure you want to delete this record?'),
            buttons: [
                {
                    label: ('Confirm'),
                    onClick: () => {
                        Inertia.delete(route('delete' + props.module, {id : record.id}), {}, {
                            onSuccess: (response) => { 
                                notie.alert({type: 'success', text: 'Record deleted successfully', time: 5});
                            },
                            onError: (errors) => {
                                notie.alert({type: 'error', text: errors.message, time: 5});
                            }
                        });
                    }
                }, {
                    label: 'No',
                }]
        });
    }

    return (  
        <>    
            <div>
                <Head title={props.translator[props.module]}/>
                <ul className="py-4 space-y-2 sm:px-6 sm:space-y-4 lg:px-8" role="list">
                    <li className="border border-gray-500 px-4 py-6 sm:rounded-xl sm:px-6">
                        <div className="sm:flex sm:justify-between sm:items-baseline">
                            <h3 className="text-base font-medium flex w-full">
                            {(props.module != 'SupportRequest') &&
                                <>
                                    {(props.module == 'Product' && record.media_id) ? 
                                      <div>
                                        <img  src={route('preview_document', record.media_id)} class={'object-cover w-24 h-24 rounded-full'}/>
                                      </div>
                                    :
                                     <div>
                                        <span className="text-gray-900 p-3">
                                            <span className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-gray-500">
                                                <span className="text-3xl font-medium leading-none text-uppercase text-white">
                                                    {(props.module == 'Contact') ?
                                                        <> { record.first_name ? (record.first_name).substring(0,2) : (record.last_name).substring(0,2)} </>
                                                        : 
                                                        <> {(record.name).substring(0, 2)} </>
                                                    }
                                                </span>
                                            </span>
                                        </span>
                                       </div> 
                                    }
                                </>
                            }


                            {(props.module == 'Contact' ) ?
                                <>
                                    <div>
                                        <div className="text-gray-600"> {record.first_name} {record.last_name} </div>
                                        <div className="text-gray-600"> {record.phone_number} </div>
                                        <div className="text-gray-600"> {record.email} </div>
                                    </div>
                                    {props.module == 'Contact' ?
                                        <div>
                                            {Object.entries(props.serviceOptions).map(([key, service]) => {
                                                return (
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={handleSubscription}
                                                            name={service.name}
                                                            id={service.value}
                                                            value={service.name}
                                                            className={`inline-flex items-left ml-2 px-4 py-2 h-10 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${subscribedServices.includes(service.name) ? "bg-green-600" : "bg-gray-700"
                                                                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                                                        >
                                                            {service.name}
                                                        </button>
                                                    </>
                                                );
                                            })}
                                        </div> : ''}
                                </>
                                :
                                <>
                                    <div className="pl-3 w-full">                                    
                                        <div className="text-black-800">{(props.module == 'SupportRequest') ? <>{record.subject}</>:<>{record.name}</>} </div>
                                        {props.module == 'Api' ? 
                                            <div className="flex justify-start mt-2" > 
                                                <button 
                                                    type="button" 
                                                    class="bg-gray-200 hover:bg-gray-400 py-1 px-2 font-medium rounded" 
                                                    onClick={() => generateApiToken()}
                                                >
                                                    Re-generate Token 
                                                </button>
                                            </div>
                                        : ''}
                                        {props.module == 'Tag' || props.module == 'Category' || props.module == 'Plan' ?
                                            <div className={classNames(
                                                addClass ? 'text-gray-600 break-words w-3/4' : 'text-gray-600 w-1/2 truncate'
                                            )} onClick={() => removeClass()}>{record.description} </div>
                                            : (props.module == 'SupportRequest') ?  
                                            <><div className="text-gray-600"> Status        : {record.status} </div>
                                               {props.role == 'global_admin'?
                                              <><div className="text-gray-600"> Created by: <a href={route('detail_global_User', { id: record.created_by })} className='text-indigo-600 mx-1'>{props.created_by}</a> </div>
                                              <div className="text-gray-600"> Workspace name: <a href={route('detail_global_Company', { id: record.company_id })} className='text-indigo-600 mx-1'>{props.workspace} </a></div></>:''}</>
                                        : ''}
                                        {props.module == 'Product' && record.catalog_id ?
                                            <div className="flex justify-start mt-2" > 
                                                <Link href={route('detailCatalog', {id: record.catalog_detail})} className='cursor-pointer underline'>
                                                    {record.catalog_id}
                                                </Link>
                                            </div>
                                        : ''}
                                    </div>
                                </>
                            }
                        </h3>
                        <div className="d-flex align-items-center">
                        {(props.module == 'Lead') || (props.module == 'Opportunity')  ?
                            <div className="mt-1 text-sm text-gray-600 whitespace-nowrap sm:mt-0 sm:ml-3">
                                {(props.module == 'Lead') ? <div>
                                    <button
                                        type="button"
                                        onClick={() => lead_to_opportunity()}
                                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        {props.translator['Convert Lead to Deal']}                                      
                                    </button>
                                </div>:<div>
                                    <button
                                        type="button"
                                        onClick={() => setShowForm(true)}
                                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        {props.translator['Convert Deal to Order']} 
                                    </button>
                                </div>}
                            </div>
                            : ''}
                            
                         {(props.module == 'Company' && props.role == 'global_admin') ?
                            <div className="mt-1 text-sm text-gray-600 whitespace-nowrap sm:mt-0 sm:ml-3">
                                <div>
                                    <WorkspacePaid
                                        company={record}
                                    />
                                </div>
                            </div>
                            : ''}

                            <div className="mt-1 text-sm text-gray-600 whitespace-nowrap sm:mt-0 sm:ml-3">
                                <div>
                                    {((!props.action || props.action == 'undefined') || props.action.delete === true) &&
                                        <button
                                            type="button"
                                            onClick={() => deleteRecord()}
                                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                            {props.translator['Delete']}                                       
                                        </button>
                                    }
                                </div>
                            </div>

                        <div className="mt-1 text-sm text-gray-600 whitespace-nowrap sm:mt-0 sm:ml-3">
                            <div>
                                {((!props.action || props.action == 'undefined') || props.action.edit === true) &&
                                    <button
                                        type="button"
                                        onClick={() => props.updateRecord(record.id)}
                                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        <PencilIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                                        {props.translator['Edit']}
                                    </button>
                                }
                            </div>
                        </div>
                        </div>
                    </div>
                </li> 
                <li className="border border-gray-500 px-4 py-6 sm:rounded-xl sm:px-6">
                    <ul id="props.tabs" className="inline-flex w-full px-1 pt-2 border-bottom">
                        {props.tabs && Object.entries(props.tabs).map(([key, tab]) => {
                            var activeClassName = "px-3 py-2 -mb-px font-semibold text-gray-800 rounded-t";
                            
                            let activeHrefClass = "text-gray-600"
                            if (activeTab == tab.name) {
                                activeClassName += ' border-b-2 border-blue-400';
                                activeHrefClass = "text-primary"
                            }
                            return (
                                <li className={activeClassName} onClick={() => setActiveTab(tab.name)}>
                                    <a id="default-tab" href={"#"+tab.name} className={activeHrefClass}> {tab.label} </a>
                                </li>
                            )
                        })}
                    </ul>    
                     {(props.module == 'SupportRequest') &&
                         <>
                                <Notes
                                  module={props.module}                                                                                
                                  recordId={props.record.id} 
                                  current_userid={props.current_userid}
                                  created_by = {props.created_by}
                                  creator_id ={props.creator_id}
                                  {...props}
                                />
                         
                         </>}                      
                     
                        
                        <div id="tab-contents" className="my-3">
                            
                            {activeTab == 'Detail' && (props.module != 'SupportRequest') && (props.module != 'Catalog') &&
                               <>
                               <div className="bg-gray-50 ">
                                   <dl className="text-gray-200 divide-y">
                                       <Disclosure as="div" key='General' className="" defaultOpen>
                                           {({ open }) => (
                                           <>
                                               <dt className="p-2 bg-gray-200 rounded-lg">
                                                   <Disclosure.Button className="flex w-full items-start align-items-center justify-between text-left text-gray-500">
                                                       <span className="px-2 -mb-px font-semibold text-gray-800 rounded-t">{props.translator['General']}</span>
                                                       <span className="ml-6 flex h-7 items-center">
                                                       <ChevronDownIcon
                                                           className={classNames(open ? '-rotate-180' : 'rotate-0', 'h-4 w-4 transform')}
                                                           aria-hidden="true"
                                                       />
                                                       </span>
                                                   </Disclosure.Button>
                                               </dt>
                                                   <Disclosure.Panel as="dd" className="mt-2 pr-12">
                                                   <div className="divide-y divide-gray-200">
                                                       {Object.entries(defaultHeader).map( ([key, field]) => {
                                                           var field_name = key;
                                                           let showField = true;

                                                           if(key == 'id' || key == 'tag' || key == 'list') {
                                                               showField = false;
                                                           }

                                                           var value = field.custom == 0 ? record[key] : record['custom'] ? record['custom'][key] : '';
                                                           if(field.type == 'dropdown') {
                                                               if(fieldOptions[field_name]){
                                                                   if(record.hasOwnProperty(key)){
                                                                       value = (fieldOptions[field_name]) ? fieldOptions[field_name][value] : value;
                                                                   }
                                                               }
                                                           }
                                                           else if(field.type == 'multiselect') {
                                                               value =  (value) ? value.join(', ') : '-';
                                                           }

                                                           if(field.type == 'relate') {
                                                               let relate_value = record[key] ? record[key] : '';
                                                               if(relate_value) {
                                                                   let relate_module = relate_value['module'];
                                                                   let related_id = relate_value['value'];
                                                                   if(relate_module) {
                                                                       value = <Link href={route('detail' + relate_module, {id: related_id})} className='cursor-pointer underline'>
                                                                          {relate_value['label']}
                                                                       </Link>;
                                                                   }else {
                                                                       value = '';
                                                                   }
                                                               }
                                                           }
                                                           
                                                           if(field.type == 'checkbox') {
                                                               value = (value) ? 'Yes': 'No';
                                                           }

                                                           if(field.type == 'phones' && key == 'phones') {
                                                               let phoneNumbers = record[key];
                                                               let numbers = [];
                                                               if(phoneNumbers) {
                                                                {phoneNumbers && phoneNumbers.map( (phone) => {
                                                                    numbers.push(phone[key]);
                                                                })}
                                                               }
                                                               value = numbers ? (numbers).join(', ') : '';
                                                           }

                                                           if(field.type == 'emails' && key == 'emails') {
                                                               let EmailAddress = record[key];
                                                               let emails = [];
                                                               if(EmailAddress) {
                                                                 {EmailAddress && EmailAddress.map( (email) => {
                                                                     emails.push(email[key]);
                                                                 })}
                                                               }

                                                               value = emails ? (emails).join(', ') : '';
                                                           }

                                                           if(field.type == 'selectable'){
                                                                let ips = '';
                                                                {record[key] && record[key].map( (select, index)=> {
                                                                    ips += select.label;
                                                                    var nextIndex = index + 1;
                                                                    if(record[key][nextIndex]){
                                                                        ips += ", ";
                                                                    } 
                                                                })}
                                                                value = ips;
                                                           }

                                                           if(showField) {
                                                               return(
                                                                   <div className="py-2 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-4">
                                                                       <dt className="text-sm font-medium text-gray-500"> {props.translator[field.label]} </dt>
                                                                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 flex"> 
                                                                        
                                                                            <InlineEdit 
                                                                            module={props.module}
                                                                            field={field}
                                                                            value={value}
                                                                            record={record}
                                                                            user_list={props.user_list}
                                                                            fieldOptions={fieldOptions}
                                                                            moduleFields={moduleFields}
                                                                            {...props}
                                                                            />
                                                                     
                                                                       </dd>
                                                                   </div>
                                                               )
                                                           }

                                                           if(key == 'tag'){
                                                               return(
                                                                   <div className="py-2 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-4">
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
                                                                           translator={props.translator}
                                                                           />
                                                                       </dd>
                                                                   </div>    
                                                               )   
                                                           }   
                                                           if(key == 'list'){
                                                               return(
                                                                   <div className="py-2 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-4">
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
                                                                           translator={props.translator}
                                                                           />
                                                                       </dd>
                                                                   </div>    
                                                               )
                                                           } 
                                                       })}
                                                   </div>
                                                   </Disclosure.Panel>
                                           </>
                                           )}
                                       </Disclosure>
                                   </dl>
                               </div>

                               {customHeader &&
                                   <div className="bg-gray-50 ">
                                   <dl className="text-gray-200">
                                       {Object.entries(customHeader).map(([group, fields]) => (
                                       <Disclosure as="div" key={group} className="" defaultOpen>
                                           {({ open }) => (
                                           <>
                                               <dt className="p-2 bg-gray-200 rounded-lg mt-3">
                                               <Disclosure.Button className="flex w-full items-start justify-between text-left text-gray-500">
                                                   <span className="px-2 -mb-px font-semibold text-gray-800 rounded-t">{props.translator[group]}</span>
                                                   <span className="ml-6 flex h-7 items-center">
                                                   <ChevronDownIcon
                                                       className={classNames(open ? '-rotate-180' : 'rotate-0', 'h-4 w-4 transform')}
                                                       aria-hidden="true"
                                                   />
                                                   </span>
                                               </Disclosure.Button>
                                               </dt>
                                               <Disclosure.Panel as="dd" className="mt-2 pr-12">
                                               <div className="divide-y divide-gray-200">
                                                   {Object.entries(fields).map(([key,field]) => { 
                                                       var field_name = key;
                                                       var value = (record[key]) ? record[key] : (record.custom && record.custom[key]) ? record.custom[key] : '-';

                                                       if(field.type == 'dropdown') {
                                                           if(fieldOptions[field_name]){
                                                               if(record.hasOwnProperty(key)){
                                                                   value = (fieldOptions[field_name]) ? fieldOptions[field_name][value] : value;
                                                               }
                                                           }
                                                       }
                                                       else if(field.type == 'multiselect') {
                                                           value =  (value) ? value.join(', ') : '-';
                                                       }

                                                       if(field.type == 'checkbox') {
                                                           value = (value) ? 'Yes': 'No';
                                                       }

                                                       if(field.type == 'relate') {
                                                           let relate_value = record[key] ? record[key] : '';
                                                           if(relate_value) {
                                                               let relate_module = relate_value['module'];
                                                               let related_id = relate_value['value'];
                                                               if(relate_module) {
                                                                   value = <Link href={route('detail' + relate_module, {id: related_id})} className='cursor-pointer underline'>
                                                                      {relate_value['label']}
                                                                   </Link>;
                                                               }else {
                                                                   value = '';
                                                               }
                                                               
                                                           }
                                                       }

                                                       return(
                                                           <div className="py-2 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-4">
                                                               <dt className="text-sm font-medium text-gray-500"> {props.translator[field.label]} </dt>
                                                               <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 flex">
                                                                 <InlineEdit 
                                                                   module={props.module}
                                                                   field={field}
                                                                   value={value}
                                                                   record={record}
                                                                   fieldOptions={fieldOptions}
                                                                   moduleFields={moduleFields}
                                                                 />
                                                               </dd>
                                                           </div>
                                                       )
                                                   }) }
                                               </div>
                                               </Disclosure.Panel>
                                           </>
                                           )}
                                       </Disclosure>
                                       ))}
                                   </dl>
                                   </div>
                               }

                               {props.lineItems && props.lineItems.length != 0? 
                                   <div className="divide-y pt-4">
                                       <ItemTable 
                                           lineItems={props.lineItems}
                                           view={'Detail'}
                                           totalPrice={props.totalPrice}
                                           getProductName={''}
                                           addQuantity={''}
                                           deleteItem={''}
                                           addItem={''}
                                           productList={''}
                                       />
                                   </div>
                               :''}
                               </>
                            }
                            {activeTab == 'Notes' &&                              
                                <Notes
                                  module={props.module}                                                                                
                                  recordId={props.record.id} 
                                  translator={props.translator}
                                />
                            }
                            {activeTab == 'Users' &&
                                <ul role="list" className="divide-y divide-gray-200">
                                    {Object.entries(props.users).map(([key, user]) => (
                                        <li key={''} className="py-4 flex border-2 m-1 border-gray-100 p-4">
                                            <span><UserIcon /> </span> 
                                            <span className="ml-3">{user.name}</span>
                                        </li>
                                    ))}
                                </ul>
                            }
                            {activeTab == 'Contact' &&
                                <SubPanels 
                                    module={'Contact'}
                                    parent_id={props.record.id}
                                    parent_name={props.record.name}
                                    parent_module={props.module}
                                    {...props}
                                
                                />
                            }
                            {activeTab == 'Opportunity' &&
                                <SubPanels 
                                    module={'Opportunity'}
                                    parent_id={props.record.id}
                                    parent_module={props.module}
                                    parent_name={props.record.name}
                                    {...props}
                                />
                            }
                            {activeTab == 'Order' &&
                                <SubPanels 
                                    module={'Order'}
                                    parent_id={props.record.id}
                                    parent_module={props.module}
                                    parent_name={props.record.name}
                                    {...props}
                                />
                            }
                            {activeTab == 'Product' &&
                                <SubPanels 
                                    module={'Product'}
                                    parent_id={props.record.id}
                                    parent_module={props.module}
                                    parent_name={props.record.name}
                                    {...props}
                                />
                            }
                            {activeTab == 'Document' &&
                                <SubPanels 
                                    module={'Document'}
                                    parent_id={props.record.id}
                                    parent_module={props.module}
                                    parent_name={props.record.name}
                                    {...props}
                                />
                            }
                            {activeTab == 'company_plan' &&
                                <SubscriptionPlan 
                                  record={props.record}
                                  subscriptionPlan={props.subscriptionPlan}
                                  {...props}
                                />
                            }
                            {activeTab == 'workspacePlan' &&
                                <WorkspacePlan 
                                  plan_id={props.record.id}
                                  workspaces={props.workspaces}
                                  {...props}
                                />
                            }
                            {activeTab == 'Acitivies' &&
                                <Acitivies 
                                  workspace={props.record}
                                  revenue={props.revenue_data}
                                  plan={props.companyPlan}
                                />
                            }
                            {activeTab == 'Detail' && (props.module == 'Catalog') && 
                               <CatalogDetail 
                                  defaultHeader={defaultHeader}
                                  record={record}
                                  {...props}
                               />
                            }
                            {activeTab == 'Permissions' &&
                                <div className="">
                                    <ModulePermission
                                        modulePermissions={props.module_permissions}
                                        DataHandler={props.DataHandler}
                                        data={props.role_permissions}
                                        readOnly={false}
                                    />
                                </div>
                            }
                        </div>
                    </li>
                </ul>
            </div>
            {showForm ?
                <Form 
                    module="Order"
                    heading={props.heading}
                    hideForm={hideForm}
                    OpportunityrecordId = {recordId}
                    opportunityname = {props.record.name}
                    translator={props.translator}
                    mod={props.mod}
                    productList={props.productList}
                    lineItems = {props.lineItems}                 
                />
            : ''}
            </>
    );
}
