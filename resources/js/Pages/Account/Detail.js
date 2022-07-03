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
import { PencilAltIcon, PencilIcon, TrashIcon } from '@heroicons/react/solid';
import { FolderAddIcon } from '@heroicons/react/outline';
import Checkbox from '@/Components/Forms/Checkbox';

function Detail(props) 
{
    const [webhookData, setWebhookData] = useState({});
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

    function handleWebhookFormChange(event) {
        const name = event.target.name;
        const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
        let newState = Object.assign({}, webhookData);
        if(event.target.type == 'file' && event.target.files) {
            newState[name] = event.target.files[0];
        }
        else {
            newState[name] = value;
        }

        setWebhookData(newState);
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
     * Create/Update Webhook form
     */
    function processWebhookForm()
    {
        var pristine = new PristineJS(document.getElementById("new_incoming_url"), defaultPristineConfig);
        let is_validated = pristine.validate(document.querySelectorAll('input[data-pristine-required], select[data-pristine-required]'));
        if(!is_validated) {
            return false;
        }

        let event_name = 'create_webhook_event';
        let event_params = {id: props.account.id};
        if(webhookData.id) {
            event_name = 'update_webhook_url';
            event_params = {id: props.account.id, webhook_id: webhookData.id};
        }

        Inertia.post(route(event_name, event_params), webhookData, {
            onSuccess: () => {
                setIncomingUrlModalOpen(false);
            },
        });
    }

    /**
     * Delete incoming URL
     * 
     * @param {integer} id 
     */
    function deleteWebhookEvent(id) {
        var confirmation = window.confirm('Are you sure you want to delete this webhook event?');
        if(confirmation) {
            Inertia.post(route('delete_webhook_event', id), {}, {
                onSuccess: () => {
                    //
                },
            });
        }
    }

    /**
     * Edit webhook
     * 
     * @param {integer} id 
     */
    function editWebhookEvent(data) {
        setIncomingUrlModalOpen(true);
        setWebhookData(data);
    }

    /**
     * Open webhook form
     */
    function openWebhookForm() {
        setWebhookData({});
        setIncomingUrlModalOpen(true);
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
                            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
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
                        </div>
                        <div className="border-t border-gray-200">
                            <dl>
                                {Object.keys(props.field_info).map((key, index) => {
                                    let bg_color = 'bg-gray-50';
                                    if(index % 2 == 0) {
                                        bg_color = 'bg-white';
                                    }

                                    if(props.field_info[key].show && !props.field_info[key].show.includes(props.account.service)) {
                                        return;
                                    }

                                    return (
                                        <div key={key} className={`${bg_color} px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6`}>
                                            <dt className="text-sm font-medium text-gray-500">{props.field_info[key]['label']}</dt>
                                            {props.field_info[key]['type'] == 'image' ? 
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
                    {props.account.service == 'whatsapp' ?
                        <>
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
                                        if((data.status).toLowerCase() == 'approved') {
                                            status_class_names = 'bg-green-100 text-green-800';
                                        }
                                        else if(data.status == 'rejected' || (data.status).indexOf('REJECTED') != -1 ) {
                                            status_class_names = 'bg-red-100 text-red-800';
                                        }

                                        return (
                                            <li key={data.id} className="px-6 py-4">
                                                <div className="flex">
                                                    <h2><Link href={route('template_detail_view', [data.account_id, data.id])}>{data.name}</Link></h2>
                                                    <span className={`ml-3 text-sm inline-flex items-center px-2 py-0.5 rounded font-medium ${status_class_names}`}>
                                                        {(data.status).toUpperCase()}
                                                    </span>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                                {!props.templates || props.templates.length == 0 ? 
                                    <div className="text-center py-12">
                                        <FolderAddIcon className='mx-auto h-12 w-12 text-gray-400' />
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
                        </>
                    : ''}

                    <div className="pb-5 pt-5">
                        <div className="flex justify-between">
                            <div>
                                <h3 className="text-lg leading-6 font-medium text-gray-900 mt-3"> Webhook URLs </h3>
                            </div>
                            <div>
                                <button type='button' onClick={openWebhookForm} className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                    Add Webhook URL
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white shadow overflow-hidden rounded-md">
                        <ul role="list" className="divide-y divide-gray-200">
                            {props.events.map((data) => {
                                return (
                                    <li key={data.id} className="px-6 py-4">
                                        <div className="flex justify-between">
                                            <h2> {data.callback_url} </h2>
                                            <div className='flex gap-3'>
                                                <PencilAltIcon className='h-6 w-6' onClick={() => editWebhookEvent(data)} />
                                                <TrashIcon className='h-6 w-6 text-red-700 cursor-pointer' onClick={() => deleteWebhookEvent(data.id)} />
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}

                            {props.events.length == 0 &&
                                <li className="flex p-5"> Webhooks not configured yet. </li>
                            }
                        </ul>
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
                                            {webhookData.id ? 'Update' : 'Add'} Webhook
                                        </Dialog.Title>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500 pt-2 pb-4">
                                                Create a new WhatsApp Webhook URL to receive notifications about events like sent, failed etc...
                                            </p>

                                            <form id="new_incoming_url">
                                                <div className="space-y-4">                                                
                                                    <div className="form-group col-span-6 sm:col-span-4">
                                                        <label htmlFor="incoming_url" className="block text-sm font-medium text-gray-700">
                                                            Webhook URL
                                                        </label>
                                                        <div className="mt-1 flex rounded-md shadow-sm">
                                                            <Input name='callback_url' value={webhookData.callback_url} required={true} id='callback_url' placeholder='Callback URL' handleChange={handleWebhookFormChange} />
                                                        </div>
                                                    </div>
                                                    {Object.keys(props.webhook_events).map((event_name, index) => {
                                                        let bg_color = 'bg-white';
                                                        if(index % 2 == 0) {
                                                            bg_color = 'bg-white';
                                                        }

                                                        return (
                                                            <div className="flex items-start">
                                                                <div className="flex items-center h-5">
                                                                    <Checkbox
                                                                        id={event_name}
                                                                        name={event_name}
                                                                        handleChange={handleWebhookFormChange}
                                                                        value={webhookData[event_name]}
                                                                    />
                                                                </div>
                                                                <div className="ml-3 text-sm">
                                                                    <label htmlFor={event_name} className="font-medium text-gray-700">
                                                                        {props.webhook_events[event_name]['label']}
                                                                    </label>
                                                                    <p className="text-gray-500">{props.webhook_events[event_name]['help_text']}</p>
                                                                </div>
                                                            </div>
                                                        );
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
                                        onClick={processWebhookForm}
                                    >
                                        {webhookData.id ? 'Update' : 'Create'}
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

export default Detail;