import React, { Fragment, useRef, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react'
import Authenticated from '@/Layouts/Authenticated';
import { router as Inertia } from "@inertiajs/react";
import { Head, Link } from '@inertiajs/react';
import PristineJS from 'pristinejs';
import Input from '@/Components/Forms/Input';
import  {defaultPristineConfig} from '@/Pages/Constants';
import { PencilSquareIcon, ChevronLeftIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/solid';
import Checkbox from '@/Components/Forms/Checkbox';

import { Button } from 'reactstrap';

function Detail(props) 
{
    const [webhookData, setWebhookData] = useState({});
    const [incomingUrlModalOpen , setIncomingUrlModalOpen ] = useState(false);
    const cancelButtonRef = useRef(null);

    const [ selectedTab , selectTab ] = useState('info');
    const tabs = [
        { name: 'Info', href: '#', current: true, page: 'info' },
        { name: 'WebHooks', href: '#', current: false , page: 'webhooks' },
    ];

    function classNames(...classes) {
        return classes.filter(Boolean).join(' ')
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
        var confirmation = window.confirm((props.translator['Are you sure you want to delete this webhook event?']));
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

    let status_class_names = 'bg-yellow-100 text-yellow-800';
    if(props['account'].status == 'Active') {
        status_class_names = 'bg-green-100 text-green-800';
    }
    else if(props['account'].status == 'Inactive') {
        status_class_names = 'bg-red-100 text-red-800';
    }

    return (
        <Authenticated
            auth={props.auth}
            errors={props.errors}
        >
            <Head title={props.translator['Profile Info']} />
            
            <div className="">
                <div className='max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-2'>
                    <Link
                        className="flex text-sm font-bold"
                        href={route('social_profile')}
                    >
                        <ChevronLeftIcon 
                            className='w-5 h-5'
                        />
                        {props.translator['Back to list view']}
                    </Link>
                    <h3
                        className='text-2xl font-semibold'
                    >
                        {props.account.service} {props.translator['channels']}
                    </h3>
                    <p className='text-lg font-semibold' > {props.account.company_name}  - {props.translator[props.account.category]}</p>
                </div>
                <div className='max-w-7xl mx-auto sm:px-6 lg:px-8 mt-6'>
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                            {tabs.map((tab) => {
                                return(
                                    <a
                                        key={tab.name}
                                        href={tab.href}
                                        className={classNames(
                                        tab.page == selectedTab
                                            ? 'border-indigo-500 text-indigo-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                                        'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm'
                                        )}
                                        aria-current={tab.current ? 'page' : undefined}
                                        onClick={() => selectTab(tab.page)}
                                    >
                                        {props.translator[tab.name]}
                                    </a>
                                    )
                            })}
                        </nav>
                    </div>
                </div> 
                
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 mt-4">
                    {selectedTab == 'info' &&
                        <div className="bg-[#140816]/70 backdrop-blur-3xl border border-white/10 ring-1 ring-white/5 shadow overflow-hidden sm:rounded-2xl p-4">
                            
                            <div className='space-y-4'>
                                {Object.keys(props.field_info).map((key, index) => {
                                    let bg_color = '';
                                    let label_class = "text-sm";
                                    if(index % 2 == 0) {
                                        bg_color = '';
                                    }

                                    if(props.field_info[key].show && !props.field_info[key].show.includes(props.account.service)) {
                                        return;
                                    }
                                    if(!props.field_info[key]['label']){
                                        return;
                                    }
                                    if(props.field_info[key].fb_show && !props.field_info[key].fb_show.includes(props.account.service_engine)) {
                                        return;
                                    }
                                    if(props.field_info[key].user_show && !props.field_info[key].user_show.includes(props.auth.user.role)) {
                                        return;
                                    }

                                    if(key === "company_name"){
                                        label_class = "text-xl font-semibold"
                                    }
                                
                                    return (
                                        <div key={key} className="sm:grid sm:grid-cols-3 sm:gap-4 items-center">
                                            <dt className="text-sm font-medium text-[#878787]">
                                                {props.field_info[key]['label']}
                                            </dt>
                                            {props.field_info[key]['type'] == 'image' ? 
                                                <img src={`/image/profile/${props['account']['id']}`} alt="Profile picture" className='h-64 w-64' />
                                            : 
                                                <dd className={`text-white ${label_class} sm:col-span-2 overflow-x-auto mb-0`}>
                                                    {key == 'api_partner' ?
                                                        <>
                                                            {props['account'][key] && <> Checked </>}
                                                        </>
                                                    : <> {props['account'][key]} </>
                                                    }
                                                </dd>
                                            }
                                        </div>
                                    );
                                })}
                            </div>
                            
                            <div className="mt-4">
                                <Link
                                    className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                                    href={route('edit_account', props.account.id)}
                                >
                                    {props.translator['Edit']}
                                </Link>
                            </div>
                        </div>
                    }
                    {selectedTab == 'webhooks' &&
                        <>
                            <div>                                    
                                <Button
                                    onClick={openWebhookForm}
                                    className="!flex gap-1 items-center">
                                        {props.translator['Add Webhook URL']}
                                        <PlusIcon className='h-4 w-4 text-white'/>
                                </Button>                                  
                            </div>

                            <div className="overflow-hidden ">
                                <div  className="space-y-4 my-4">
                                    {props.events.map((data) => {
                                        return (
                                            <div key={data.id} className="pt-3 bg-white drop-shadow rounded-md grid grid-cols-12 px-6 py-4">
                                                
                                                    <div className='col-span-4 flex flex-col'>
                                                        <h2 className='text-[#393939] text-base font-semibold' >{data.name_url}</h2>
                                                        <span className='truncate'>Created by {data.created_by} the {new Date(data.created_at).toLocaleDateString("en-US")}</span>
                                                    </div>
                                                    <span className='col-span-5'>{data.callback_url}</span>
                                                    
                                                    <div className='flex gap-3 col-span-3 justify-end items-center'>
                                                        <PencilSquareIcon className='h-6 w-6 cursor-pointer' onClick={() => editWebhookEvent(data)} />
                                                        <TrashIcon className='h-6 w-6 text-red-700 cursor-pointer' onClick={() => deleteWebhookEvent(data.id)} />
                                                    </div>
                                                
                                            </div>
                                        );
                                    })}

                                    {props.events.length == 0 &&
                                        <li className="flex pt-3"> {props.translator['Webhooks not configured yet.']} </li>
                                    }
                                </div>
                            </div>
                        
                        </>
                    }
                </div>
            </div>

<Transition.Root show={incomingUrlModalOpen} as={Fragment}>
                <Dialog
                    as="div"
                    className="relative z-50"
                    initialFocus={cancelButtonRef}
                    onClose={setIncomingUrlModalOpen}
                >
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-6">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                                enterTo="opacity-100 translate-y-0 sm:scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:p-6">
                                    <div>
                                        <div className="">
                                            <Dialog.Title as="h3" className="text-xl leading-6 font-medium text-gray-900">
                                                {webhookData.id ? (props.translator['Update']) : (props.translator['Add'])} Webhook
                                            </Dialog.Title>
                                            <div className="mt-2">
                                                <p className="text-sm text-gray-500 pt-2 pb-4">
                                                    {props.translator['Create a new WhatsApp Webhook URL to receive notifications about events like sent, failed etc...']}
                                                </p>

                                                <form id="new_incoming_url">
                                                    <div className="space-y-4">
                                                        <div className="form-group col-span-6 sm:col-span-4">
                                                            <label htmlFor="incoming_url" className="block text-sm font-medium text-gray-700">
                                                                Name
                                                            </label>
                                                            <div className="mt-1 flex rounded-md shadow-sm">
                                                                <Input name='name_url' value={webhookData.name_url} required={true} id='name_url' placeholder={props.translator['Name of URL']} handleChange={handleWebhookFormChange} />
                                                            </div>
                                                        </div>
                                                        <div className="form-group col-span-6 sm:col-span-4">
                                                            <label htmlFor="incoming_url" className="block text-sm font-medium text-gray-700">
                                                                Webhook URL
                                                            </label>
                                                            <div className="mt-1 flex rounded-md shadow-sm">
                                                                <Input name='callback_url' value={webhookData.callback_url} required={true} id='callback_url' placeholder={props.translator['Callback URL']} handleChange={handleWebhookFormChange} />
                                                            </div>
                                                        </div>
                                                        {Object.keys(props.webhook_events).map((event_name, index) => {
                                                            let bg_color = 'bg-white';
                                                            if(index % 2 == 0) {
                                                                bg_color = 'bg-white';
                                                            }
                                                            var facebookHooks = ['received' , 'read', 'sent'];
                                                            if(props.account.service != 'whatsapp' && !facebookHooks.includes(event_name) ){
                                                                return true;
                                                            }

                                                            return (
                                                                <div
                                                                    key={event_name}
                                                                    className="flex items-start"
                                                                >
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
                                                                            {(props.translator[props.webhook_events[event_name]['label']]) ?
                                                                                <>{props.translator[props.webhook_events[event_name]['label']]}</>
                                                                                :
                                                                                <> {props.webhook_events[event_name]['label']} </>
                                                                            }
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
                                    <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense items-center">
                                        <Button
                                            color="primary"
                                            onClick={processWebhookForm}
                                        >
                                            {webhookData.id ? (props.translator['Update']) : (props.translator['Create'])}
                                        </Button>
                                        <Button onClick={() => setIncomingUrlModalOpen(false)}>
                                            {props.translator['Close']}
                                        </Button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>

        </Authenticated>
    );
}

export default Detail;












