import React, { Fragment, useRef, useEffect, useState } from 'react';
import Authenticated from '@/Layouts/Authenticated';
import Input from '@/Components/Forms/Input';
import { Inertia } from '@inertiajs/inertia';
import { Dialog, Transition } from '@headlessui/react'
import TextArea from '@/Components/Forms/TextArea';
import FileInput from '@/Components/Forms/FileInput';
import PristineJS from 'pristinejs';
import Checkbox from '@/Components/Forms/Checkbox';
import { Head, useForm, Link } from '@inertiajs/inertia-react';
import Dropdown from '@/Components/Forms/Dropdown';
import InputError from '@/Components/Forms/InputError';
import {defaultPristineConfig, currencies, countries} from '@/Pages/Constants';
import ConfirmPassword from '@/Pages/Auth/ConfirmPassword';

export default function CreateUser(props) {

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
        //    'created_at': {'value': formatDate(props.user.created_at), 'label': 'Created At', 'type': 'text', 'required': false },
        },
        'Billing Information': {
            'company_address': {'value': props.user.company_address, 'label': 'Company Address', 'type': 'textarea', 'required': false },
            'company_country': {'value': props.user.company_country, 'label': 'Company Country', 'type': 'select', 'required': false, 'options': countries },
            'company_vat_id': {'value': props.user.company_vat_id, 'label': 'Company VAT ID', 'type': 'text', 'required': false },
            'codice_destinatario': {'value': props.user.codice_destinatario, 'label': 'Company Codice Destinatario', 'type': 'text', 'required': false },
            'admin_email': {'value': props.user.admin_email, 'label': 'Admin email for invoices', 'type': 'email', 'required': false },
        }
    };
	const { data, setData, post, processing, errors, reset } = useForm({});
    useEffect(() => {  
        // Check is admin
        if(props.user.role == 'Admin' || ( props.user.id == props.currentUser.id)){
            if(props.user.id) {
                let newData = Object.assign({}, props.user);
                newData['password'] = props.password;
                setData(newData);
            }  
        } else {
            
        }
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
     * Handle select change
     */ 
    function handleSelectChange(event) {
        let values = [];
       // console.log(event.target.value)
        const name = event.target.name;
        /*
        let newState = Object.assign({}, data);
        selected_value.map((value) => {
            values.push(value.code);
        })
        newState[field_info.name] = values;
        setData(newState);
        */
    }


    /**
     * Validate the form and submit
     */
    function validateAndSubmitForm() 
    {
        var pristine = new PristineJS(document.getElementById("create_user_form"), defaultPristineConfig);
        let is_validated = pristine.validate(document.querySelectorAll('input[data-pristine-required="required"], select[data-pristine-required="required"]'));
        if(!is_validated) {
            return false;
        }
        post(route('store_user_data'));
    }
    const roleOptions = [
        {value: 'Admin', label: 'Admin'},
        {value: 'Customer', label: 'Customer'},
    ];

    // Password change modal
    const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
    const cancelButtonRef = useRef(null);

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

    // Cheack Admin user
    var isAdmin = false;
    if(  data.role == 'Admin' || props.currentUser.role == 'Admin' ){
        isAdmin  = true;
    }
    var isChangePassword = false;
    if (data.id == props.currentUser.id) {
        isChangePassword = true;
    }

	return(
	
		<Authenticated
            auth={props.auth}
            errors={props.errors}
            header={<div className="flex justify-between"> 
                <div> 
                    <h2 className="font-Seminole text-xl text-gray-800 leading-tight"> {data.id ? "Edit User" : "Create User"} </h2>
                </div> 
                <div>

                {/* {isChangePassword &&
                    <button
                       onClick={() => setChangePasswordModalOpen(true)}
                        className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                        Change Password
                    </button>
                } */}
                
                <Link 
                    href={ props.currentUser.role == 'Admin' ? route('usersListing') : route('user_profile', props.user.id)}
                        className="ml-3 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
					>
                    Cancel
                </Link>
                <button
                    type="button"
                    onClick={validateAndSubmitForm}
                    className='ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                	>
                    Save
                </button>

                </div> 
            </div>}
        >
	<Head title={data.id ? "Edit User" : "Create User"} User />
	<div className="bg-white overflow-hidden shadow rounded-lg">
    	<div className="px-4 py-5 sm:p-6">
    		<form action="#" method="POST" className="container mx-auto px-4 sm:px-6 lg:px-8" id="create_user_form" >
            <input type='hidden' name='id' value={data.id} />

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
                                                let select_options = [];
                                                if(Object.keys(field.options).length){
                                                    Object.entries(field.options).map(([name, label], index) => {
                                                        select_options.push({'value': name, 'label': label});
                                                    })
                                                }
                                                
                                                element = <Dropdown name={key} id={key} value={data[key]} className={`custom-select ${error_class}`} handleChange={handleChange} options={select_options} /> ;
                                                break;    
                                            case 'checkbox':
                                                element = <Checkbox name={key} id={key} value={data[key]} className={`custom-select ${error_class}`} handleChange={handleChange} />
                                                break;
                                            default :
                                                element = <Input value={data[key]} type={field.type} name={key} required={field.required} id={key} placeholder='' handleChange={handleChange} />
                                        }
                                        if(key == 'status' && props.currentUser.role != 'Admin'){
                                            showField = false;
                                        }
                                        if(key == 'codice_destinatario' && data.company_country != 'IT'){
                                            showField = false;
                                        }
                                        if(key == 'token'){
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
                        </div>
                    </div>
                )})}
{/* 
    		<div className="form-group col-span-6 sm:col-span-4">
    			<label htmlFor="name" className="block text-sm font-medium text-gray-700">
                	 Name
                </label>
				<div className="mt-1 flex rounded-md shadow-sm">
                	<Input value={data.name} name='name' required={true} id='name' placeholder='Your name' handleChange={handleChange} />
                </div>
                <InputError message={errors.name} />
    		</div>

    		<div className="form-group col-span-6 sm:col-span-4 mt-5">
    			<label htmlFor="email" className="block text-sm font-medium text-gray-700">
                	Email
                </label>
				<div className="mt-1 flex rounded-md shadow-sm">
                	<Input name='email' value={data.email} required={true} type='email' id='email' placeholder='Your email' handleChange={handleChange} />
                </div>
                <InputError message={errors.email} />
    		</div>

    		<div className="form-group col-span-6 sm:col-span-4 mt-5">
                <div className="flex items-start">
                    <div className="flex items-center h-5">
                        <Checkbox
                            id="status"
                            name="status"
                            value={data.status != 0 ? true : false } 
                            handleChange={handleChange}
                        />
                    </div>
                    <div className="ml-3 text-sm">
                    	<label htmlFor="status" className="font-medium text-gray-700">
                        	Active User status?
                        </label>
                    </div>
                    <InputError message={errors.oba} />
                </div>
            </div>
            { isAdmin &&
    		<div className="form-group col-span-6 sm:col-span-4 mt-5">
    			<label htmlFor="role" className="block text-sm font-medium text-gray-700">
                	Role
                </label>
				<div className="mt-1 flex rounded-md shadow-sm">
                	<Dropdown 
                        required={false} 
                        id="role"
                        name="role"
                        handleChange={handleChange}
                        options={roleOptions}
                        value={data.role}
                        />
                </div>
    		</div>
            } */}

                    </form>
                </div>                    
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
