import { SettingIcon } from "../icons";
import { Dialog, Transition } from '@headlessui/react'
import { SearchIcon } from "@heroicons/react/outline";
import React, { Fragment, useRef, useState } from "react";
import Input from '@/Components/Forms/Input';
import InputError from '@/Components/Forms/InputError';
import Authenticated from "../../Layouts/Authenticated";
import { Head, useForm, Link } from '@inertiajs/inertia-react';
import Dropdown from '@/Components/Forms/Dropdown';
import categories, {defaultPristineConfig} from '@/Pages/Constants';
import Select from 'react-select';
import languages from '@/Pages/languages';
import PristineJS from 'pristinejs';
import { Inertia } from '@inertiajs/inertia';
import { List } from "../../Components/Views/List/Index";

export default function Contacts(props) {
    const [contactFields, setContactFields] = useState({
        'id': { 'label': '', 'type': 'hidden', 'required': false },
        'first_name': { 'label': 'First Name', 'type': 'text', 'required': false },
        'last_name': { 'label': 'Last Name', 'type': 'text', 'required': true } , 
        'email': { 'label': 'Email', 'type': 'email', 'required': true }, 
        'phone_number': { 'label': 'Phone number', 'type': 'text', 'required': false },
        'instagram_id': { 'label': 'Instagram ID', 'type': 'text', 'required': false }, 
    });

    const[contacts, setContacts] = useState(props.contacts);
    const[mode, setMode] = useState('create');
    const [openFilterModal, setOpenFilterModal ] = useState(false);
    const [openCreateContactModal, setOpenCreateContactModal ] = useState(false);
    const cancelButtonRef = useRef(null);
    const { data, setData, post, processing, errors, reset } = useForm({});

    /**
     * Handle input change
     */ 
    function handleChange(event) {
        const name = event.target.name;
        const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
        let newData = Object.assign({}, data);
      //  let newState = Object.assign({}, contactFields);
        if(event.target.type == 'file' && event.target.files) {
            newData[name] = event.target.files[0];
        }
        else {
            newData[name] = value;
    //        newState[name].value = value;
        }
        setData(newData);
    //    setContactFields(newState);
    }
    
    /**
     * Handle select change
     */ 
     function handleSelectChange(selected_value, field_info) {
        let values = [];
        
        let newState = Object.assign({}, data);
        selected_value.map((value) => {
            values.push(value.code);
        })
        newState[field_info.name] = values;
        setData(newState);
    }

    function openCreateModal(){
        setMode('create');
        setOpenCreateContactModal(true)
    }

    /**
     * Store contact info
     */
    function createContact(){
        var pristine = new PristineJS(document.getElementById("contact_form"), defaultPristineConfig);
        let is_validated = pristine.validate(document.querySelectorAll('input[data-pristine-required="required"], select[data-pristine-required="required"]'));

        if(!is_validated) {
            return false;
        }
        Inertia.post(route('store_contact'), data, {
            onSuccess: (response) => {
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
                newState[name].value = response.data.contact[name];
                newData[name] = response.data.contact[name];

            })};
            setMode('edit');
            setData(newData);
            setContactFields(newState);
            setOpenCreateContactModal(true)
        });
    }

    return (
        <Authenticated>
           
            <div className="px-4 sm:px-6 lg:px-8 bg-[#FBFBFBBF]">
                <div className="sm:flex sm:items-center sm:justify-between">
                    <div className="flex gap-3">
                        <div className="w-10 h-10 bg-white shadow-sm flex items-center justify-center">
                            <SettingIcon 
                                onClick={()=> setOpenFilterModal(true)}
                            />
                        </div>

                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <SearchIcon
                                    className="h-5 w-5 text-gray-400"
                                    aria-hidden="true"
                                />
                            </div>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                className="focus:ring-indigo-500 focus:border-primary/50 border-0 block w-full pl-10 sm:text-sm  rounded-md"
                                placeholder="Search"
                            />
                        </div>
                        <div className="flex items-center text-[#3D4459] gap-2 ml-5">
                            <svg
                                width={22}
                                height={20}
                                viewBox="0 0 22 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M21 19V17C21 15.1362 19.7252 13.5701 18 13.126M14.5 1.29076C15.9659 1.88415 17 3.32131 17 5C17 6.67869 15.9659 8.11585 14.5 8.70924M16 19C16 17.1362 16 16.2044 15.6955 15.4693C15.2895 14.4892 14.5108 13.7105 13.5307 13.3045C12.7956 13 11.8638 13 10 13H7C5.13623 13 4.20435 13 3.46927 13.3045C2.48915 13.7105 1.71046 14.4892 1.30448 15.4693C1 16.2044 1 17.1362 1 19M12.5 5C12.5 7.20914 10.7091 9 8.5 9C6.29086 9 4.5 7.20914 4.5 5C4.5 2.79086 6.29086 1 8.5 1C10.7091 1 12.5 2.79086 12.5 5Z"
                                    stroke="#3D4459"
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                            <div><span className="font-semibold">{Object.keys(contacts).length}</span> Contacts</div>
                        </div>
                    </div>
                    <div className="mt-4 sm:mt-0 sm:ml-16 flex gap-3">
                        <button
                            type="button"
                            className="inline-flex items-center px-2.5 py-1.5 border-0 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3D4459]"
                        >
                            <svg
                                className="-ml-0.5 mr-2 h-4 w-4"
                                viewBox="0 0 16 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M14.75 10.25V11.15C14.75 12.4101 14.75 13.0402 14.5048 13.5215C14.289 13.9448 13.9448 14.289 13.5215 14.5048C13.0402 14.75 12.4101 14.75 11.15 14.75H4.85C3.58988 14.75 2.95982 14.75 2.47852 14.5048C2.05516 14.289 1.71095 13.9448 1.49524 13.5215C1.25 13.0402 1.25 12.4101 1.25 11.15V10.25M11.75 6.5L8 10.25M8 10.25L4.25 6.5M8 10.25V1.25"
                                    stroke="#3D4459"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                            Import
                        </button>
                        <button
                            type="button"
                            className="inline-flex items-center px-2.5 py-1.5 border-0 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3D4459]"
                        >
                            <svg
                                className="-ml-0.5 mr-2 h-4 w-4"
                                viewBox="0 0 16 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M14.75 8V11.15C14.75 12.4101 14.75 13.0402 14.5048 13.5215C14.289 13.9448 13.9448 14.289 13.5215 14.5048C13.0402 14.75 12.4101 14.75 11.15 14.75H4.85C3.58988 14.75 2.95982 14.75 2.47852 14.5048C2.05516 14.289 1.71095 13.9448 1.49524 13.5215C1.25 13.0402 1.25 12.4101 1.25 11.15V8M11 4.25L8 1.25M8 1.25L5 4.25M8 1.25V10.25"
                                    stroke="#3D4459"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                            Export
                        </button>
                        <button
                            type="button"
                            onClick={() => openCreateModal()}
                            className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
                        >
                            New Contact
                        </button>
                    </div>
                </div>
                <div className="mt-8 flex flex-col">
                    <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                                <table className="min-w-full divide-y divide-[#D9D9D9]">
                                    <thead>
                                        <tr>
                                            <th></th>
                                            <th
                                                scope="col"
                                                className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-[#3D4459] sm:pl-6"
                                            >
                                                First Name
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-3 py-3.5 text-left text-sm font-semibold text-[#3D4459]"
                                            >
                                                Last Name
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-3 py-3.5 text-left text-sm font-semibold text-[#3D4459]"
                                            >
                                                Number
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-3 py-3.5 text-left text-sm font-semibold text-[#3D4459]"
                                            >
                                                Email
                                            </th>
                                           
                                            <th
                                                scope="col"
                                                className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                                            ></th>
                                        </tr>
                                    </thead>
                                    <tbody className=" bg-white">
                                        {Object.entries(contacts).map(([id, person], j) => (
                                            <tr key={person.id}>
                                                <td
                                                    scope="col"
                                                    className="relative w-12 px-6 sm:w-16 sm:px-8"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/80 sm:left-6"
                                                    />
                                                </td>
                                                <td className="whitespace-nowrap py-3 pl-4 pr-3 text-sm sm:pl-6">
                                                    <div className="flex items-center">
                                                        <div className="h-10 w-10 flex-shrink-0">
                                                            <span className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-gray-500">
                                                                <span className="text-2xl font-medium leading-none text-white">
                                                                    {(person.logo).substring(0,2)}
                                                                </span>
                                                            </span>
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="font-medium text-[#3D4459]">
                                                                <Link
                                                                    href={route('contact_detail', person.id)}
                                                                    >
                                                                        {person.name}
                                                                    </Link>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-2 py-2 text-sm text-[#3D4459]">
                                                    {person.last_name}
                                                </td>
                                                <td className="whitespace-nowrap px-2 py-2 text-sm text-[#3D4459]">
                                                    {person.number}
                                                </td>
                                                <td className="whitespace-nowrap px-2 py-2 text-sm text-[#3D4459]">
                                                    {person.email}
                                                </td>
                                                
                                                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                    <a
                                                        href="#"
                                                        onClick={() => updateCotnact(person.id)}
                                                        className="text-indigo-600 hover:text-indigo-900"
                                                    >
                                                        Edit
                                                        <span className="sr-only">
                                                            , {person.name}
                                                        </span>
                                                    </a>
                                                </td>
                                            </tr>
                                        ))}
                                        {Object.entries(contacts).length == 0 &&
                                            <tr><td className = "" colspan="3">
                                                <div className="relative px-6 py-5 flex items-center space-x-3 hover:bg-gray-50 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary">
                                                    Contact not created yet.
                                                </div>
                                            </td></tr>
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter */}
            <Transition.Root show={openFilterModal} as={Fragment}>
                <Dialog as="div" className="fixed z-10 inset-0 overflow-y-auto" initialFocus={cancelButtonRef} onClose={setOpenFilterModal}>
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
                                            Filter Contacts
                                        </Dialog.Title>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500 pt-2 pb-4">
                                                Display the specific contacts only 
                                            </p> 
                                            <form id="filter_contact" >
                                            <div className="grid gap-6">                                                
                                                <div className="form-group col-span-6 sm:col-span-4">
                                                    <label htmlFor="template_name" className="block text-sm font-medium text-gray-700">
                                                        Name
                                                    </label>
                                                    <div className="mt-1 flex rounded-md shadow-sm">
                                                        <Input name='template_name' required={true} id='template_name' placeholder='Template name' handleChange={handleChange} />
                                                    </div>
                                                    <InputError message={errors.template_name} />
                                                </div>

                                                <div className="form-group col-span-6 sm:col-span-4">
                                                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                                                        Category
                                                    </label>
                                                    <div className="mt-1">
                                                        <Dropdown 
                                                            required={true} 
                                                            id="category"
                                                            name="category"
                                                            handleChange={handleChange}
                                                            options={categories}
                                                            value={data.category}
                                                        />
                                                    </div>
                                                    <InputError message={errors.category} />
                                                </div>

                                                <div className="form-group col-span-6 sm:col-span-4">
                                                    <label htmlFor="languages" className="block text-sm font-medium text-gray-700">
                                                        Languages
                                                    </label>
                                                    <div className="mt-1">
                                                        <Select 
                                                            options={languages} 
                                                            isMulti
                                                            getOptionLabel ={(option) => option.name}
                                                            getOptionValue ={(option )=> option.code} 
                                                            required={true}
                                                            id="languages"
                                                            name="languages"
                                                            onChange={handleSelectChange}
                                                        />
                                                    </div>
                                                    <InputError message={errors.languages} />
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
                                        onClick={() => createNewTemplate()}
                                    >
                                        Create
                                    </button>
                                    <button
                                        type="button"
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                                        onClick={() => setOpenFilterModal(false)}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition.Root>

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
                                    {mode == 'create' ? <>Create</> : <>Edit</> } Contact
                                </Dialog.Title>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500 pt-2 pb-4">
                                        Display the specific contacts only 
                                    </p>

                                    <form id="contact_form">
                                        <div className="grid gap-6">         
                                            {Object.entries(contactFields).map(([name, field]) => {
                                                var element = '';
                                                switch(field.type){
                                                    case 'textarea':
                                                        element = <TextArea value={data[name]} name={name} required={field.required} id={name} placeholder='' handleChange={handleChange} />
                                                        break;
                                                    case 'select':
                                                        let select_options = [];
                                                        if(Object.keys(field.options).length){
                                                            Object.entries(field.options).map(([name, label], index) => {
                                                                select_options.push({'value': name, 'label': label});
                                                            })
                                                        }
                                                        
                                                        element = <Dropdown name={name} id={name} value={data[name]} className={`custom-select ${error_class}`} onChange={handleSelectChange} options={select_options} /> ;
                                                        break;    
                                                    case 'checkbox':
                                                        element = <Checkbox name={name} id={name} value={data[name]} className={`custom-select ${error_class}`} handleChange={handleChange} />
                                                        break;
                                                    default :
                                                        element = <Input value={data[name]} type={field.type} name={name} required={field.required} id={name} placeholder={field.label} handleChange={handleChange} />
                                                }
                                                return (
                                                <div className="form-group col-span-6 sm:col-span-4">
                                                    <label htmlFor={name} className="block text-sm font-medium text-gray-700">
                                                        {field.label} 
                                                        {field.required &&
                                                            <span className="text-sm text-red-700"> *</span>
                                                        }
                                                    </label>
                                                    <div className="mt-1 flex rounded-md shadow-sm">
                                                        {element}
                                                    </div>
                                                    <InputError message={props.errors[name]} />
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
                                onClick={() => createContact()}
                            >
                                 {mode == 'create' ? <>Create</> : <>Update</> }
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
