import React, { Fragment, useRef, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react'
import Select from 'react-select';
import Authenticated from '@/Layouts/Authenticated';
import { Inertia } from '@inertiajs/inertia';
import { Head, useForm, Link } from '@inertiajs/inertia-react';
import languages from '@/Pages/languages';
import PristineJS from 'pristinejs';
import Input from '@/Components/Forms/Input';
import Dropdown from '@/Components/Forms/Dropdown';
import InputError from '@/Components/Forms/InputError';
import categories, {defaultPristineConfig} from '@/Pages/Constants';

export default function Detail(props) {

    const fieldInfo = {
        'display_name': {'label': 'Display name'},
        'company_name': {'label': 'Company name'},
        'company_type': {'label': 'Company type'},
        'website': {'label': 'Website'},
        'email': {'label': 'Email'},
        'estimated_launch_date': {'label': 'Estimated launch date'},
        'type_of_integration': {'label': 'Type of integration'},
        'phone_number': {'label': 'Phone number'},
        'business_manager_id': {'label': 'Business manager ID'},
        'profile_picture': {'label': 'Profile picture', 'type': 'image'},
        'profile_description': {'label': 'Profile description'},
        'status': {'label': 'Status'},
    };

    const [accountModalOpen, setAccountModalOpen ] = useState(false);
    const [incomingUrlModalOpen , setIncomingUrlModalOpen ] = useState(false);

    const cancelButtonRef = useRef(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        template_name: '',
        category: '',
        languages: '',
        incoming_url: '',
    });

    /**
     * Handle input change
     */ 
     function handleChange(event) {
        const name = event.target.name;
        const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
        let newState = Object.assign({}, data);
        if(event.target.type == 'file' && event.target.files) {
            newState[name] = event.target.files[0];
        }
        else {
            newState[name] = value;
        }

        setData(newState);
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

    /**
     * Create new template
     */
    function createNewTemplate() {
        var pristine = new PristineJS(document.getElementById("new_template"), defaultPristineConfig);
        let is_validated = pristine.validate(document.querySelectorAll('input[data-pristine-required], select[data-pristine-required]'));
        if(!is_validated) {
            return false;
        }

        Inertia.post(route('create_new_template', props.account.id), data, {
            onSuccess: () => {
                setAccountModalOpen(false);
            },
        });
    }

    /**
     * Create new Incoming URL
     */
     function createNewIncomingUrl(){
        var pristine = new PristineJS(document.getElementById("new_incoming_url"), defaultPristineConfig);
        let is_validated = pristine.validate(document.querySelectorAll('input[data-pristine-required], select[data-pristine-required]'));
        if(!is_validated) {
            return false;
        }
        Inertia.post(route('create_new_incoming_url', props.account.id), data, {
            onSuccess: () => {
                setIncomingUrlModalOpen(false);
            },
        });

     }

    return (
        <Authenticated
            auth={props.auth}
            errors={props.errors}
            header={<div className="flex justify-between"> 
                    <div> <h2 className="font-semibold text-xl text-gray-800 leading-tight">Profile Info</h2> </div>
                    <div className="inline-flex">
                        <Link 
                            href={route('edit_account' , props.account.id)}
                            class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded">
                            Edit
                        </Link>
                    </div>
            </div>}
        >
            <Head title="Profile Info" />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        <div className="px-4 py-5 sm:px-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">Profile Information</h3>
                            <p className="mt-1 max-w-2xl text-sm text-gray-500">This is what your customers can see on their phone when they contact you via WhatsApp</p>
                        </div>
                        <div className="border-t border-gray-200">
                            <dl>
                                {Object.keys(fieldInfo).map((key, index) => {
                                    let bg_color = 'bg-gray-50';
                                    if(index % 2 == 0) {
                                        bg_color = 'bg-white';
                                    }

                                    return (
                                        <div key={key} className={`${bg_color} px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6`}>
                                            <dt className="text-sm font-medium text-gray-500">{fieldInfo[key]['label']}</dt>
                                            {fieldInfo[key]['type'] == 'image' ? 
                                                <img src={`/image/profile/${props['account']['id']}`} alt="Profile picture" className='h-64 w-64' />
                                            : 
                                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{props['account'][key]}</dd>
                                            }
                                        </div>
                                    );
                                })}
                            </dl>
                        </div>
                    </div>
                    <div className="pb-5 pt-5">
                        <div className="flex justify-between">
                            <div>
                                <h3 className="text-lg leading-6 font-medium text-gray-900 mt-3"> Incoming URL </h3>
                            </div>
                            <div>
                                <button type='button' onClick={() => setIncomingUrlModalOpen(true)} className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                    Add Incoming URL
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white shadow overflow-hidden rounded-md">
                        <ul role="list" className="divide-y divide-gray-200">
                            {props.incoming_url.map((data) => {
                                return (
                                    <li key={data.id} className="px-6 py-4">
                                        <div className="flex">
                                            <h2> {data.incoming_url} </h2>
                                        </div>
                                    </li>
                                );
                            })}
                            {props.incoming_url.length == 0 &&
                                <li className="flex p-5"> No URL added yet. </li>
                            }
                        </ul>
                    </div>
                    <div className="pb-5 pt-5">
                        <div className="flex justify-between">
                            <div>
                                <h3 className="text-lg leading-6 font-medium text-gray-900 mt-3">Templates</h3>
                            </div>
                            <div>
                                <button type='button' onClick={() => setAccountModalOpen(true)} className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                    Add template
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white shadow overflow-hidden rounded-md">
                        <ul role="list" className="divide-y divide-gray-200">
                            {props.templates.map((data) => {
                                let status_class_names = 'bg-yellow-100 text-yellow-800';
                                if(data.status == 'new') {
                                    status_class_names = 'bg-green-100 text-green-800';
                                }
                                else if(data.status == 'rejected') {
                                    status_class_names = 'bg-red-100 text-red-800';
                                }

                                return (
                                    <li key={data.id} className="px-6 py-4">
                                        <div className="flex">
                                            <h2><Link href={route('template_detail_view', [data.account_id, data.id])}>{data.name}</Link></h2>
                                            <span className={`ml-3 text-sm inline-flex items-center px-2 py-0.5 rounded font-medium ${status_class_names}`}>
                                                {data.status}
                                            </span>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                        {!props.templates || props.templates.length == 0 ? 
                            <div className="text-center py-12">
                                <svg
                                    className="mx-auto h-12 w-12 text-gray-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    aria-hidden="true"
                                >
                                    <path
                                        vectorEffect="non-scaling-stroke"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                                    />
                                </svg>
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No templates found</h3>
                                    <p className="mt-1 text-sm text-gray-500">Get started by creating a new template.</p>
                                    <div className="mt-6">
                                        <a onClick={() => setAccountModalOpen(true)} className="cursor-pointer underline text-sm text-indigo-600 hover:text-indigo-900">
                                            Click here to create new template
                                        </a>
                                    </div>
                              </div>
                            : ''}
                    </div>
                </div>
            </div>

            <Transition.Root show={accountModalOpen} as={Fragment}>
                <Dialog as="div" className="fixed z-10 inset-0 overflow-y-auto" initialFocus={cancelButtonRef} onClose={setAccountModalOpen}>
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
                                            Add template
                                        </Dialog.Title>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500 pt-2 pb-4">
                                                Create a new WhatsApp template. Each template must have a unique name consisting of lowercase alphanumeric characters. 
                                                Spaces must be replaced with underscores (_). Only WhatsApp templates within the pre-defined categories can be accepted.
                                            </p>

                                            <form id="new_template">
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
                                        onClick={() => setAccountModalOpen(false)}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition.Root>

            <Transition.Root show={incomingUrlModalOpen} as={Fragment}>
                <Dialog as="div" className="fixed z-10 inset-0 overflow-y-auto" initialFocus={cancelButtonRef} onClose={setIncomingUrlModalOpen}>
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
                                            Add Incoming URL
                                        </Dialog.Title>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500 pt-2 pb-4">
                                                Create a new WhatsApp call back URL. Each url must have a unique consisting. 
                                            </p>

                                            <form id="new_incoming_url">
                                            <div className="grid gap-6">                                                
                                                <div className="form-group col-span-6 sm:col-span-4">
                                                    <label htmlFor="incoming_url" className="block text-sm font-medium text-gray-700">
                                                        Name
                                                    </label>
                                                    <div className="mt-1 flex rounded-md shadow-sm">
                                                        <Input name='incoming_url' required={true} id='incoming_url' placeholder='Incoming URL' handleChange={handleChange} />
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
                                        onClick={() => createNewIncomingUrl()}
                                    >
                                        Create
                                    </button>
                                    <button
                                        type="button"
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                                        onClick={() => setIncomingUrlModalOpen(false)}
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
