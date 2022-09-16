import { Fragment, useEffect, useRef, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react'
import Input from '@/Components/Forms/Input';
import TextArea from '@/Components/Forms/TextArea';
import Checkbox from '@/Components/Forms/Checkbox';
import { Head, useForm, Link } from '@inertiajs/inertia-react';
import Dropdown from '@/Components/Forms/Dropdown';
import InputError from '@/Components/Forms/InputError';
import PristineJS from 'pristinejs';

import {defaultPristineConfig, currencies, countries} from '@/Pages/Constants';
import axios from 'axios';

export default function UserRegistration(props) {

    const [show, setShow] = useState(true);
    const cancelButtonRef = useRef(null);
    const fieldList = {
        'User Information': {
            'currency': {'value': props.user.currency, 'label': 'Currency', 'type': 'select', 'required': true, 'options': currencies },
            'time_zone': {'value': props.user.time_zone, 'label': 'Time Zone', 'type': 'select', 'required': true , 'options': props.time_zone },
        },
        'Billing Information': {
            'company_address': {'value': props.user.company_address, 'label': 'Company Address', 'type': 'textarea', 'required': true },
            'company_country': {'value': props.user.company_country, 'label': 'Company Country', 'type': 'select', 'required': true, 'options': countries },
            'company_vat_id': {'value': props.user.company_vat_id, 'label': 'Company VAT ID', 'type': 'text', 'required': true },
            'codice_destinatario': {'value': props.user.codice_destinatario, 'label': 'Company Codice Destinatario', 'type': 'text', 'required': true },
            'admin_email': {'value': props.user.admin_email, 'label': 'Admin email for invoices', 'type': 'email', 'required': true },
        }
    };

    const { data, setData, post, processing, errors, reset } = useForm({});
    useEffect(() => {  
        let newData = Object.assign({}, data);
        setData(props.user);
    },[]);

    /**
     * Handle input change
     */ 
     function handleChange(event) {
    	const name = event.target.name;
        const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
        let newState = Object.assign({}, data);
        newState[name] = value;
        setData(newState);
    }


 /**
     * Validate the form and submit
     */
  function validateAndSubmitForm() 
  {
        var pristine = new PristineJS(document.getElementById("register_user_form"), defaultPristineConfig);
        let is_validated = pristine.validate(document.querySelectorAll('input[data-pristine-required="true"], select[data-pristine-required="true"], textarea[data-pristine-required="true"]'));
        if(!is_validated) {
            return false;
        }
      post(route('store_user_data'))
      props.setshowModal(false)       
  }

    return (
        <>
        <Transition.Root show={show} as={Fragment}>
                <Dialog as="div" className="fixed z-10 inset-0 overflow-y-auto" initialFocus={cancelButtonRef} onClose={() => {}}>
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
                                
                                    <div className="">
                                        <Dialog.Title as="h3" className="text-xl leading-6 font-medium text-gray-900">
                                            Please enter the below details to proceed ..
                                           </Dialog.Title>
                                        </div>
                                        <form action="#" method="POST" id="register_user_form" >
                                        <input type='hidden' name='id' value={data.id} />
                                {Object.entries(fieldList).map(([title, fields]) => {
                    return(
                   <>
                            <div className="px-4 py-5 sm:px-6">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
                            </div>
                            <div className="border-t border-gray-200">
                                <dl>
                                    {Object.entries(fields).map(([key, field], index) => {
                                        let showField = true;
                                        let error_class = errors[key] == true ? 'is-invalid' : '';
                                        let bg_color = 'bg-gray-50';
                                        if(index % 2 == 0) {
                                            bg_color = 'bg-white';
                                        }
                                        var element = '';
                                        switch(field.type){
                                            case 'textarea':
                                                element = <TextArea value={data[key]} name={key} required={field.required} id={key} placeholder='' handleChange={handleChange} />
                                                break;
                                            case 'select':
                                                element = <Dropdown name={key} id={key} value={data[key]} className={`custom-select ${error_class}`} handleChange={handleChange} options={field.options ? field.options: {}} /> ;
                                                break;    
                                            case 'checkbox':
                                                element = <Checkbox name={key} id={key} value={data[key]} className={`custom-select ${error_class}`} handleChange={handleChange} />
                                                break;
                                                
                                            default :
                                                element = <Input value={data[key]} type={field.type} name={key} required={field.required} id={key} placeholder='' handleChange={handleChange} />
                                        }
                                        
                                        if(key == 'codice_destinatario' && data.company_country != 'IT'){
                                            showField = false;
                                        }
                                        
                                        if(showField){
                                            return (
                                                <div key={key} className={`${bg_color} px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6`}>
                                                    <div className="form-group col-span-6 sm:col-span-4">
                                                        <label htmlFor={key} className="block text-sm font-medium text-gray-700">
                                                            {field.label}
                                                            {field.required &&
                                                                <span className="text-sm text-red-700"> *</span>
                                                            }
                                                        </label>
                                                        <div className="mt-1 flex rounded-md shadow-sm">
                                                            {element}
                                                        </div>
                                                        <InputError message={errors[key]} />
                                                    </div>
                                                </div>
                                            )
                                        }
                                    })}
                                </dl>
                            </div>
                        </>
                )})}

                                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                                <button
                                        type="button"
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
                                            onClick={validateAndSubmitForm}
                                    >
                                        Save
                                    </button>
                                    <button
                                        type="button"
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                                        onClick={() => props.setshowModal(false)}
                                    >
                                      Cancel
                                    </button>
                                </div>
                                </form>
                            </div>
                            
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition.Root>

            </>
    );
}
