import React, { useState, useRef, Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react'
import CreatableSelect, { useAsync } from 'react-select';
import Form from '@/Components/Forms/Form';
import nProgress from 'nprogress';
import Axios from "axios";
import { Inertia } from '@inertiajs/inertia';

export default function ContactSelection(props) {

    const [show, setShow] = useState(true);
    const [createForm, setCreateForm] = useState(false);
    const cancelButtonRef = useRef(null);
    const[contactList, setContactList] = useState();
    const[selectedContact , setSelectedContact] = useState();

    useEffect(() => {    
        getUserContacts('');
        
    },[]);
 
    /**
     * Get User contact list
     */
    function getUserContacts(key){
        nProgress.start(0.5);
        nProgress.inc(0.2);
        var url = route('get_user_contacts_list');
        url += '?parent='+props.parent_module;
        if(props.parent_id){
            url += '&record='+props.parent_id;
        }
        if(key){
            url += '&key='+key;
        }
        Axios.get(url).then((response) => {
            nProgress.done(true);
            setContactList(response.data.records);
        });    
    }

    /**
     * Get Contact list based on input 
     */
    function handleInputChange(value){
        if(value){
            getUserContacts(value);
        }
    }

    function addContacts(){
      
        var data = {
            'contacts': selectedContact,
            'parent': props.parent_module,
            'record': (props.parent_id) ? props.parent_id : ''
        }
        Inertia.post( route('store_user_contact_list') , data, {
            onSuccess: (response) => {
                props.setShowForm(false)
            },
            onError: (errors) => {
                setErrors(errors)
            }
        });
    }
    function hideForm() {
        setCreateForm(false);
    }

    return (
        <>
        <Transition.Root show={show} as={Fragment}>
                <Dialog as="div" className="fixed z-10 inset-0 overflow-y-auto" initialFocus={cancelButtonRef} onClose={ () => props.setShowForm(false)}>
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
                                            Select Contact
                                            <span className=' float-right'>
                                                <button 
                                                    onClick={()=> setCreateForm(true)}
                                                    className='text-sm text-indigo-900'
                                                >
                                                    Add a contact
                                                </button>
                                            </span>
                                        </Dialog.Title>

                                        <div className="mt-2">
                                            <div>
                                                    <CreatableSelect
                                                        isMulti
                                                    //    value={selectedContact}
                                                        options={contactList}
                                                        onInputChange={handleInputChange}
                                                        onChange={setSelectedContact}
                                                    />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                                    <button
                                        type="button"
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
                                        onClick={() => addContacts()}
                                    >
                                        Add
                                    </button>
                                    <button
                                        type="button"
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                                        onClick={() => props.setShowForm(false)}
                                    >
                                      Cancel
                                    </button>
                                </div>
                            </div>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition.Root>

            {createForm ?
                <Form 
                    module={'Contact'}
                    hideForm={hideForm}
                    parent_module={props.parent_module}
                    parent_id= {props.parent_id ? props.parent_id : ''}
                    parent_name= {props.parent_name}
                    getUserContacts={getUserContacts}
                />
            : ''}

        </>
    );
}
