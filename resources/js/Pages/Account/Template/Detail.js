import React, {Fragment, useRef, useEffect, useState } from 'react';
import Authenticated from '@/Layouts/Authenticated';
import Input from '@/Components/Forms/Input';
import TextArea from '@/Components/Forms/TextArea';
import PristineJS from 'pristinejs';
import { Head, useForm, Link, InertiaLink } from '@inertiajs/inertia-react';
import Dropdown from '@/Components/Forms/Dropdown';
import InputError from '@/Components/Forms/InputError';
import {defaultPristineConfig, header_templates} from '@/Pages/Constants'; 
import languages from '@/Pages/languages';
import TemplateButton from './TemplateButton';
import { Inertia } from '@inertiajs/inertia';

import { Dialog, Transition } from '@headlessui/react'


function NewTemplate(props) 
{
    const header_text_max_length = 60;

    const body_max_length = 1024;

    const footer_text_max_length = 60;

    const quick_reply_max_length = 20;

    const url_max_length = 2000;

    const { data, setData, post, processing, errors, reset } = useForm({
        language: props.message.language ? props.message.language : props.language,
        header_type: props.message.header_type ? props.message.header_type : '',
        header_text: props.message.header_content ? props.message.header_content : '',
        body: props.message.body ? props.message.body : '',
        body_footer: props.message.footer_content ? props.message.footer_content : '',
        buttons: props.buttons,
        template_name: props.template.template_name ? props.template.template_name : '',
        template_name_space: props.template.template_name_space ? props.template.template_name_space : '',
    });

    const [buttons, setButtons] = useState([]);
    

    useEffect(() => {
        let tmpButtons = Object.assign([], buttons);
        props.buttons.map((button) => {
            tmpButtons.push({
                id: button.id,
                button_type: button.button_type,
                button_text: button.body,
                action: button.action,
                phone_number: button.phone_number,
                url: button.url,
                url_type: button.url_type,
            });
        });

        if(props.buttons.length == 0) {
            tmpButtons.push({
                id: '',
                button_type: '',
                button_text: '',
                action: '',
                phone_number: '',
                url: '',
                url_type: '',
            });
        }

        setButtons(tmpButtons);
    }, []);

    /**
     * Validate the form and submit
     */
    function validateAndSubmitForm() 
    {
        var pristine = new PristineJS(document.getElementById("template_form"), defaultPristineConfig);
        let is_template_validated = pristine.validate(document.querySelectorAll('input[data-pristine-required], select[data-pristine-required], textarea[data-pristine-required]'));
        
        var pristine = new PristineJS(document.getElementById("button_form"), defaultPristineConfig);
        let is_validated = pristine.validate(document.querySelectorAll('input[data-pristine-required], select[data-pristine-required], textarea[data-pristine-required]'));
        if(!is_validated || !is_template_validated) {
            return false;
        }

        let post_data = Object.assign({}, data);
        post_data['buttons'] = buttons;
        Inertia.post(route('store_template', [props.template.account_id, props.template.id]), post_data);
    }
    
    /**
     * Save Template Status
     */
    const [templateModalOpen, setTemplateModalOpen ] = useState(false);
    const cancelButtonRef = useRef(null);
    function saveTemplateStatus(){
        var pristine = new PristineJS(document.getElementById("template_status_form"), defaultPristineConfig);
        let is_template_validated = pristine.validate(document.querySelectorAll('input[data-pristine-required]'));
        if(!is_template_validated) {
            return false;
        }
        Inertia.post(route('template_status_form', [props.template.account_id, props.template.id]), data, {
            onSuccess: () => {
                setTemplateModalOpen(false);
            },
        });
    }

    /**
     * Add new button
     */
    function addNewButton()
    {
        let tmpButtons = Object.assign([], buttons);
        tmpButtons.push({
            id: '',
            button_type: '',
            button_text: '',
            action: '',
            phone_number: '',
            url: '',
            url_type: '',
        });

        setButtons(tmpButtons);
    }

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
     * Handle button change
     */ 
     function handleButtonChange(event, index) {
        const name = event.target.name;
        const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
        let newState = Object.assign([], buttons);
        newState[index][name] = value;
        setButtons(newState);
    }

    /**
     * Redirect and pass the language
     * 
     * @param {string} language 
     */
    function redirectToLanguage(language) 
    {
        Inertia.visit(route('template_detail_view', [props.template.account_id, props.template.id]) + '?language=' + language);
    }

    return (
        <Authenticated
            auth={props.auth}
            errors={props.errors}
            header={
                <div className="flex justify-between">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        {props.template.name}
                    </h2>
                    <div>
                       <button type='button' onClick={() => setTemplateModalOpen(true)} className="mr-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-gray-700  hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            Change Template Status
                        </button>
                        <Link 
                            href={route('account_view', props.template.account_id)}
                            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Back
                        </Link>
                        <button
                            type="button"
                            onClick={validateAndSubmitForm}
                            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Save
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Account Registration" />

            <div className="py-12 px-24">
                <div className="space-y-6">
                    <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                        <div className="md:grid md:grid-cols-3 md:gap-6">
                            <div className="md:col-span-1">
                                <h3 className="text-lg font-medium leading-6 text-gray-900">Template Information</h3>
                                <div className="bg-white border shadow overflow-hidden rounded-md mt-4">
                                    <ul role="list" className="divide-y divide-gray-200">
                                    {props.template.languages.map((language, index) => {
                                        return (
                                            <li onClick={() => redirectToLanguage(language)} key={index} className={props.language == language ? 'bg-indigo-50 border-indigo-200 text-indigo-900 z-10 border-transparent px-6 py-4' : 'px-6 py-4'}>
                                                <div className="flex">
                                                    <h2>{language}</h2>
                                                </div>
                                            </li>
                                        );
                                    })}
                                    </ul>
                                </div>
                            </div>
                            <div className="mt-5 md:mt-0 md:col-span-2">
                                <div>
                                    <form className="space-y-6" action="#" method="POST" id="template_form">
                                        <div className="grid grid-cols-6 gap-6">
                                            <div className="form-group col-span-6 sm:col-span-4">
                                                <label htmlFor="header_type" className="block text-sm font-medium text-gray-700">
                                                    Header Template
                                                </label>
                                                <div className="mt-1">
                                                    <Dropdown 
                                                        required={true} 
                                                        id="header_type"
                                                        name="header_type"
                                                        handleChange={handleChange}
                                                        options={header_templates}
                                                        value={data.header_type}
                                                    />
                                                </div>
                                                <InputError message={errors.header_type} />
                                            </div>

                                            {data.header_type == 'text' ?
                                                <div className="form-group col-span-6 sm:col-span-4">
                                                    <label htmlFor="header_text" className="block text-sm font-medium text-gray-700">
                                                        Header Text
                                                    </label>
                                                    <div className="mt-1">
                                                        <Input name='header_text' required={data.header_type == 'text' ? true : false} id='header_text' placeholder='' handleChange={handleChange} value={data.header_text} />
                                                    </div>
                                                    <p className='mt-2 text-sm text-gray-500 float-right'>{header_text_max_length - data.header_text.length}</p>
                                                    <InputError message={errors.header_text} />
                                                </div> 
                                            : ''}

                                            <div className="form-group col-span-6 sm:col-span-4">
                                                <label htmlFor="body" className="block text-sm font-medium text-gray-700">
                                                    Body
                                                </label>
                                                <div className="mt-1">
                                                    <TextArea id="body" name="body" required={true} handleChange={handleChange} value={data.body} />
                                                </div>
                                                <p className='mt-2 text-sm text-gray-500 float-right'>{body_max_length - data.body.length}</p>
                                                <InputError message={errors.body} />
                                            </div>

                                            <div className="form-group col-span-6 sm:col-span-4">
                                                <label htmlFor="body_footer" className="block text-sm font-medium text-gray-700">
                                                    Footer
                                                </label>
                                                <div className="mt-1">
                                                    <Input id="body_footer" name="body_footer" handleChange={handleChange} value={data.body_footer} />
                                                </div>
                                                <p className='mt-2 text-sm text-gray-500 float-right'>{footer_text_max_length - data.body_footer.length}</p>
                                                <InputError message={errors.body_footer} />
                                            </div>
                                        </div>
                                    </form>

                                    <form className="space-y-6 mt-6" action="#" method="POST" id="button_form">
                                        <div className="grid grid-cols-6 gap-6">
                                            <div className="form-group col-span-6 sm:col-span-4">
                                                <div className='flex justify-between'>
                                                    <div>
                                                        <h4 className="text-lg font-medium leading-6 text-gray-900">Buttons (Optional)</h4>
                                                    </div>
                                                    <div>
                                                        <button
                                                            onClick={addNewButton}
                                                            type="button"
                                                            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                        >
                                                            Add button
                                                        </button>
                                                    </div>
                                                </div>
                                                <hr className="mt-4" />
                                            </div>

                                            {buttons.map((button, index) => {
                                                return (
                                                    <TemplateButton 
                                                        key={index}
                                                        data={button}
                                                        quick_reply_max_length={quick_reply_max_length} 
                                                        url_max_length={url_max_length} 
                                                        errors={errors}
                                                        handleChange={(e) => handleButtonChange(e, index)}
                                                    />
                                                );
                                            })}

                                            {/** 
                                            <div className="form-group col-span-6 sm:col-span-4">
                                                <label htmlFor="button_type" className="block text-sm font-medium text-gray-700">
                                                    Button type
                                                </label>
                                                <div className="mt-1 flex rounded-md shadow-sm">
                                                    <Dropdown 
                                                        id="button_type"
                                                        name="button_type"
                                                        handleChange={handleChange}
                                                        options={button_types}
                                                        value={data.button_type}
                                                    />
                                                </div>
                                                <InputError message={errors.button_type} />
                                            </div>

                                            {data.button_type == 'Quick Reply' ?                                         
                                                <div className="form-group col-span-6 sm:col-span-4">
                                                    <div className="mt-1">
                                                        <Input id="button_text" required={true} name="button_text" handleChange={handleChange} />
                                                    </div>
                                                    <p className='mt-2 text-sm text-gray-500 float-right'>{quick_reply_max_length - data.button_text.length}</p>
                                                    <InputError message={errors.button_text} />
                                                </div> 
                                            : ''}

                                            {data.button_type == 'Call to Action' ?      
                                                <>                                   
                                                    <div className="form-group col-span-6 sm:col-span-4">
                                                        <label htmlFor="button_type" className="block text-sm font-medium text-gray-700">
                                                            Type of action
                                                        </label>
                                                        <div className="mt-1">
                                                            <Dropdown 
                                                                required={true} 
                                                                id="action"
                                                                name="action"
                                                                handleChange={handleChange}
                                                                options={call_to_action_lists}
                                                                value={data.action}
                                                            />
                                                        </div>
                                                        <InputError message={errors.action} />
                                                    </div> 

                                                    {data.action == 'call_phone_number' ?
                                                        <>
                                                            <div className="form-group col-span-6 sm:col-span-4">
                                                                <label htmlFor="button_text" className="block text-sm font-medium text-gray-700">
                                                                    Button text
                                                                </label>
                                                                <div className="mt-1">
                                                                    <Input id="button_text" required={true} name="button_text" handleChange={handleChange} />
                                                                </div>
                                                                <p className='mt-2 text-sm text-gray-500 float-right'>{quick_reply_max_length - data.button_text.length}</p>
                                                                <InputError message={errors.button_text} />
                                                            </div> 
                                                            <div className="form-group col-span-6 sm:col-span-4">
                                                                <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">
                                                                    Phone number (format: +XXXXXXXXXX)
                                                                </label>
                                                                <div className="mt-1">
                                                                    <Input id="phone_number" name="phone_number" required={true} handleChange={handleChange} />
                                                                </div>
                                                                <p className='mt-2 text-sm text-gray-500 float-right'>{quick_reply_max_length - data.phone_number.length}</p>
                                                                <InputError message={errors.phone_number} />
                                                            </div> 
                                                        </>
                                                    : ''}

                                                    {data.action == 'visit_website' ? 
                                                        <>
                                                            <div className="form-group col-span-6 sm:col-span-4">
                                                                <label htmlFor="url_type" className="block text-sm font-medium text-gray-700">
                                                                    URL Type
                                                                </label>
                                                                <div className="mt-1">
                                                                    <Dropdown 
                                                                        required={true} 
                                                                        id="url_type"
                                                                        name="url_type"
                                                                        handleChange={handleChange}
                                                                        options={url_types}
                                                                        value={data.url_type}
                                                                        required={true}
                                                                    />
                                                                </div>
                                                                <InputError message={errors.url_type} />
                                                            </div> 
                                                            <div className="form-group col-span-6 sm:col-span-4">
                                                                <label htmlFor="url" className="block text-sm font-medium text-gray-700">
                                                                    URL
                                                                </label>
                                                                <div className="mt-1">
                                                                    <Input id="url" name="url" handleChange={handleChange} required={true} />
                                                                </div>
                                                                <p className='mt-2 text-sm text-gray-500 float-right'>{url_max_length - data.url.length}</p>
                                                                <InputError message={errors.url} />
                                                            </div> 
                                                        </>
                                                    : ''}
                                                </>
                                            : ''} */}
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>    
            </div>


            <Transition.Root show={templateModalOpen} as={Fragment}>
                <Dialog as="div" className="fixed z-10 inset-0 overflow-y-auto" initialFocus={cancelButtonRef} onClose={setTemplateModalOpen}>
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
                                            Template Status
                                        </Dialog.Title>
                                        <div className="mt-2">

                                            <form id="template_status_form">
                                            <div className="grid gap-6">  
                                                <div className="form-group col-span-6 sm:col-span-4">
                                                    <label htmlFor="template_name" className="block text-sm font-medium text-gray-700">
                                                        Template Name
                                                    </label>
                                                    <div className="mt-1 flex rounded-md shadow-sm">
                                                        <Input name='template_name' value={data.template_name} required={true} id='template_name' placeholder='Template name' handleChange={handleChange} />
                                                    </div>
                                                    <InputError message={errors.template_name} />
                                                </div>                                              
                                                <div className="form-group col-span-6 sm:col-span-4">
                                                    <label htmlFor="template_name_space" className="block text-sm font-medium text-gray-700">
                                                        Template Name Space
                                                    </label>
                                                    <div className="mt-1 flex rounded-md shadow-sm">
                                                        <Input name='template_name_space' value={data.template_name_space} required={true} id='template_name_space' placeholder='Template name' handleChange={handleChange} />
                                                    </div>
                                                    <InputError message={errors.template_name_space} />
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
                                        onClick={() => saveTemplateStatus()}
                                    >
                                        Update
                                    </button>
                                    <button
                                        type="button"
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                                        onClick={() => setTemplateModalOpen(false)}
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

export default NewTemplate;
