import React, { Fragment, useRef, useEffect, useState } from 'react';
import Authenticated from '@/Layouts/Authenticated';
import { Head, Link, useForm } from '@inertiajs/inertia-react';
import { Dialog, Transition } from '@headlessui/react'
import PristineJS from 'pristinejs';
import Input from '@/Components/Forms/Input';
import InputError from '@/Components/Forms/InputError';

import { currencies, countries } from '@/Pages/Constants';
import { BriefcaseIcon } from '@heroicons/react/solid';

export default function UserDetail(props) {

    const fieldList = {
        'Personal Information': {
            'name': {'value': props.user.name, 'label': 'Name', 'type': 'text', 'required': true },
            'company_name': {'value': props.user.company_name, 'label': 'Company name', 'type': 'text', 'required': false },
            'email': {'value': props.user.email, 'label': 'Email', 'type': 'email', 'required': true},
            'phone_number': {'value': props.user.phone_number, 'label': 'Phone number', 'type': 'text', 'required': false },
            'language': {'value': props.user.language, 'label': 'Language', 'type': 'select', 'required': false , 'options': { 'en': 'English', 'it': 'Italy'}},
            'currency': {'value': props.user.currency, 'label': 'Currency', 'type': 'select', 'required': false, 'options': currencies },
            'time_zone': {'value': props.user.time_zone, 'label': 'Time zone', 'type': 'select', 'required': false , 'options': props.time_zone },
            'token': {'value': props.token, 'label': 'Token' , action:'regenarate', 'type': 'text', 'required': false },
            'status': {'value': (props.user.status == 1) ? 'Active': 'Inactive', 'label': 'Active Status', 'type': 'checkbox', 'required': false },
        },
        'Billing Information': {
            'company_address': {'value': props.user.company_address, 'label': 'Company Address', 'type': 'textarea', 'required': false },
            'company_country': {'value': props.user.company_country, 'label': 'Company Country', 'type': 'select', 'required': false, 'options': countries },
            'company_vat_id': {'value': props.user.company_vat_id, 'label': 'Company VAT ID', 'type': 'text', 'required': false },
            'codice_destinatario': {'value': props.user.codice_destinatario, 'label': 'Company Codice Destinatario', 'type': 'text', 'required': false },
            'admin_email': {'value': props.user.admin_email, 'label': 'Admin email for invoices', 'type': 'email', 'required': false },
        }
    };

    const [spinClass , setSpinClass] = useState([]);
    const [token , setToken ]= useState(props.token);
    const { data, setData, post, processing, errors, reset } = useForm({});
    const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
    const cancelButtonRef = useRef(null);

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
    
    function formatDate(date) {
        var monthArray=['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		var date = new Date(date);               
		var d = date.getDate();
		var day = (d <= 9 ? '0' + d : d)
		var month = monthArray[date.getMonth()];
		var year = date.getFullYear();
        var dateFormat = month + ' ' + day + ', ' + year;
        return dateFormat;
    }

    // Update Token
    function updateToken(){
        axios({
            method: 'post',
            url: route('regenerate_token'),
            data: {
                user_id: props.user.id,
            }
        })
        .then((response) => {
            setToken(response.data.token);
            setSpinClass(' ');
        });
    }

    /**
     * Open modal for change the password
     */
     function createNewPassword() {
        var pristine = new PristineJS(document.getElementById("user_new_password"));
        let is_validated = pristine.validate();
        if(!is_validated) {
            return false;
        }
        var new_pass = document.getElementById("new_password");
        var conf_pass = document.getElementById("confirm_password");

        pristine.addValidator(new_pass, function (value ) {
            console.log(value );
            if (value == pristine.confirm_password) {
                return true;
            }
            return false;
        }, "The new password and confirm password must match", 2, false);
 
        Inertia.post(route('change_password', props.user.id), data, {
            onSuccess: () => {
                console.log('Password saved successfully')
            }
        });
    }
    var isChangePassword = false;
    if (props.user.id == props.current_user.id) {
        isChangePassword = true;
    }

    return (
        <Authenticated
            auth={props.auth}
            errors={props.errors}
            header={<div className="flex justify-between"> 
                <div> 
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">Users</h2>
                </div> 
                <div className='flex gap-3'>
                    <Link 
                        href={route('wallet')}
                        className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <span className='flex gap-1'>
                            <BriefcaseIcon className='h-4 w-4' /> Wallet
                        </span>
                    </Link>
                    {isChangePassword &&
                        <button
                            onClick={() => setChangePasswordModalOpen(true)}
                            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Change Password
                        </button>
                    }
                    <Link
                        href={props.user.role == 'Admin' ?  route('edit_user' , [props.user.id]) : route('edit_profile' , [props.user.id])}
                        className='inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                    >
                        Edit User
                    </Link>
                </div> 
            </div>}
        >
        <Head title="User Detail" />

            <div className="py-12">
                {Object.entries(fieldList).map(([title, fields]) => {
                    return(
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 mt-4">
                        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                            <div className="px-4 py-5 sm:px-6">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
                            </div>
                            <div className="border-t border-gray-200">
                                <dl>
                                    {Object.entries(fields).map(([key, field], index) => {
                                        let showField = true;
                                        let bg_color = 'bg-gray-50';
                                        if(index % 2 == 0) {
                                            bg_color = 'bg-white';
                                        }
                                        
                                        if(key == 'status' && props.current_user.role != 'Admin'){
                                            showField = false;
                                        }
                                        
                                        if(key == 'codice_destinatario' && fields.company_country.value != 'Italy'){
                                            showField = false;
                                        }

                                        if(field.hasOwnProperty('options')){
                                            field.value = field.options[field.value];
                                        }
                                        
                                        if(showField){
                                            return (
                                                <div key={key} className={`${bg_color} px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6`}>
                                                    <dt className="text-sm font-medium text-gray-500">{field.label}</dt>
                                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                                    {field.hasOwnProperty('action') ?
                                                        <>
                                                            {token}
                                                            <span class="cursor-pointer" title="Regenarate Token">
                                                                <svg xmlns="http://www.w3.org/2000/svg" onClick={() => {if(window.confirm('Do you want change the user token?')){updateToken()};}} class={"h-5 w-5 " + spinClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                                </svg>
                                                            </span>
                                                        </>
                                                    : <>
                                                       {field.value}  
                                                     </>
                                                    }
                                                    </dd>
                                                </div>
                                            );
                                        }
                                    })}
                                </dl>
                            </div>
                        </div>
                    </div>
                )})}
            </div>


            <Transition.Root show={changePasswordModalOpen} as={Fragment}>
                <Dialog as="div" className="fixed z-10 inset-0 overflow-y-auto" initialFocus={cancelButtonRef} onClose={setChangePasswordModalOpen}>
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
                                            Change Password
                                        </Dialog.Title>
                                        <div className="mt-2">
                                            <form id="user_new_password">
                                            <div className="grid gap-6">                                                
                                                <div className="form-group col-span-6 sm:col-span-4">
                                                    <label htmlFor="new_password" className="block text-sm font-medium text-gray-700">
                                                        New Password
                                                    </label>
                                                    <div className="mt-1 flex rounded-md shadow-sm">
                                                        <Input type="password" minlength="8" name='new_password' required={true} id='new_password' placeholder='New Password' handleChange={handleChange} />
                                                    </div>
                                                    <InputError message={errors.incoming_url} />
                                                </div>
                                                </div>
                                                <div className="grid gap-6 mt-3">                                                
                                                <div className="form-group col-span-6 sm:col-span-4">
                                                    <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700">
                                                        Confirm Password
                                                    </label>
                                                    <div className="mt-1 flex rounded-md shadow-sm">
                                                        <Input type="password" minlength="8" name='confirm_password' required={true} id='confirm_password' placeholder='Confirm Password' handleChange={handleChange} />
                                                    </div>
                                                    <InputError message={errors.incoming_url} />
                                                </div>
                                            </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                                    <button
                                        type="button"
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
                                        onClick={() => createNewPassword()}
                                    >
                                        Change 
                                    </button>
                                    <button
                                        type="button"
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                                        onClick={() => setChangePasswordModalOpen(false)}
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
