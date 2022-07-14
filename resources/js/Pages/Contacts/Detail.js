import React, { Fragment, useRef, useState } from "react";
import Authenticated from "../../Layouts/Authenticated";
import { Dialog, Transition } from '@headlessui/react'
import { Head, useForm, Link } from '@inertiajs/inertia-react';
import { PencilIcon } from "../icons";
import Input from '@/Components/Forms/Input';
import InputError from '@/Components/Forms/InputError';
import PristineJS from 'pristinejs';
import categories, {defaultPristineConfig} from '@/Pages/Constants';
import { Inertia } from '@inertiajs/inertia';
import DetailView from "@/Components/Views/Detail/Index";

export default function Detail(props) {
    /*
    const contactFields = {
        'first_name' : { 'label' : 'First name'},
        'last_name' : { 'label' : 'Last name'} ,
        'email' : { 'label' : 'Email'},
        'phone_number' : { 'label' : 'Phone number'},
        'instagram_id' : { 'label' : 'Instagram ID'}   
    };
    */
    const [contactFields, setContactFields] = useState({
        'id': { 'label': '', 'type': 'hidden', 'required': false, 'value': '' },
        'first_name': { 'label': 'First Name', 'type': 'text', 'required': false, 'value': '' },
        'last_name': { 'label': 'Last Name', 'type': 'text', 'required': true, 'value': '' } , 
        'email': { 'label': 'Email', 'type': 'email', 'required': true, 'value': '' }, 
        'phone_number': { 'label': 'Phone number', 'type': 'text', 'required': false, 'value': '' },
        'instagram_id': { 'label': 'Instagram ID', 'type': 'text', 'required': false, 'value': '' }, 
    });

    const[record , setRecord] = useState(props.contact);
    const tabs = [
        { name: 'Detail', href: '#'  },
        { name: 'Notes', href: '#' },
      ]
    
    const [openCreateContactModal, setOpenCreateContactModal ] = useState(false);
    const cancelButtonRef = useRef(null);
    const { data, setData, post, processing, errors, reset } = useForm({});
    const[activeTab , setActiveTab] = useState('Detail');

    /**
     * Handle input change
     */ 
     function handleChange(event) {
        const name = event.target.name;
        const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
        let newData = Object.assign({}, data);
   //     let newState = Object.assign({}, contactFields);
        if(event.target.type == 'file' && event.target.files) {
            newState[name] = event.target.files[0];
        }
        else {
            newData[name] = value;
//            newState[name].value = value;
        }
        setData(newData);
        setContactFields(newState);
    }

    /**
     * Store contact info
     */
    function updateContact(){
        var pristine = new PristineJS(document.getElementById("update_contact"), defaultPristineConfig);
        let is_validated = pristine.validate(document.querySelectorAll('input[data-pristine-required], select[data-pristine-required]'));
        if(!is_validated) {
            return false;
        }

        Inertia.post(route('store_contact'), data, {
            onSuccess: (response) => {
                window.location.reload(false);
                setOpenCreateContactModal(false);
            },
        });
    }
      
    /**
     * Update contact
     */
     function updateCotnact(id){
        axios({
            method: 'get',
            url: route('get_contact_data', {'contact_id': id}),
        })
        .then( (response) =>{
            let newState = Object.assign({}, contactFields);
            let newData = Object.assign({}, data);
            {Object.entries(contactFields).map(([name, field]) => {
            //    console.log(newState[name]);
            //    newState[name].value = response.data.contact[name];
                newData[name] = response.data.contact[name];

            })};
            setData(newData);
            //setContactFields(newState);
            setOpenCreateContactModal(true)
        });
    }

    return (
        <Authenticated>
{/* 
            <DetailView
                record = {record}
                module = 'Contacts'
                updateCotnact = {updateCotnact}
              //  setActiveTab = {setActiveTab}
                tabs = {tabs}
                fields = {contactFields}
            />
 */}

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
                                    <div className="text-gray-600"> {record.first_name} {record.last_name}  </div>
                                    <div className="text-gray-600"> {record.phone_number} </div>
                                    <div className="text-gray-600"> {record.email} </div>
                                </div>
                                
                            </h3>
                            <div className="mt-1 text-sm text-gray-600 whitespace-nowrap sm:mt-0 sm:ml-3">
                                <div>
                                    <button
                                        type="button"
                                        onClick={ () => updateCotnact(record.id)}
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
                        <ul id="tabs" className="inline-flex w-full px-1 pt-2 ">
                            {Object.entries(tabs).map(([key, tab])=>{
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
                            {Object.entries(tabs).map(([key, tab])=>{
                                var hideClass = "p-4";
                                if(activeTab != tab.name){
                                    hideClass += ' hidden';
                                }
                                return(
                                    <div id={tab.name} className={hideClass}>
                                        {tab.name == 'Detail' ?
                                            <div>
                                                {Object.entries(contactFields).map( ([key, field]) => {
                                                    if(key != 'id'){
                                                        return(
                                                            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                                                <dt className="text-sm font-medium text-gray-500"> {field.label} </dt>
                                                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2"> {record[key]} </dd>
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
            

            {/* Create modal */}
            <Transition.Root show={openCreateContactModal} as={Fragment}>
                <Dialog as="div" className="fixed z-10 inset-0 overflow-y-auto" initialFocus={cancelButtonRef} onClose={setOpenCreateContactModal}>
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                </Transition.Child>

                {/* This element is to trick the browser into centering the modal contents. */}
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
                    &#8203;
                </span>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                    enterTo="opacity-100 translate-y-0 sm:scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                    leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                    <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                        <div>
                            <div className="">
                                <Dialog.Title as="h3" className="text-xl leading-6 font-medium text-gray-900">
                                    Edit Contact
                                </Dialog.Title>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500 pt-2 pb-4">
                                        Display the specific contacts only 
                                    </p>

                                    <form id="update_contact">
                                        <div className="grid gap-6">         
                                            {Object.entries(contactFields).map(([name, field]) => {
                                                
                                                    return (
                                                    <div className="form-group col-span-6 sm:col-span-4">
                                                        <label htmlFor={name} className="block text-sm font-medium text-gray-700">
                                                            {field.label}
                                                        </label>
                                                        <div className="mt-1 flex rounded-md shadow-sm">
                                                            <Input name={name}  value={data[name]} required={field.required} type={field.type} id={name} placeholder={field.label} handleChange={handleChange} />
                                                        </div>
                                                        <InputError message={errors.name} />
                                                    </div>
                                                    )
                                               
                                            })}                                      
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                        <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                            <button
                                type="button"
                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
                                onClick={() => updateContact()}
                            >
                                Update
                            </button>
                            <button
                                type="button"
                                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                                onClick={() => setOpenCreateContactModal(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </Transition.Child>
                    </div>
                </Dialog>
            </Transition.Root>

        </Authenticated>
    );
}
