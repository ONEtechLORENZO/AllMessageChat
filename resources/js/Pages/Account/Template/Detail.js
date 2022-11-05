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
import notie from 'notie';
import { TrashIcon } from '@heroicons/react/solid';

import { Dialog, Transition } from '@headlessui/react'


function NewTemplate(props) 
{
    const header_text_max_length = 60;

    const body_max_length = 1024;

    const footer_text_max_length = 60;

    const quick_reply_max_length = 20;

    const url_max_length = 2000;

    const { data, setData, post, processing, reset } = useForm({
        language: props.message.language ? props.message.language : props.language,
        header_type: props.message.header_type ? props.message.header_type : '',
        header_text: props.message.header_content ? props.message.header_content : '',
        body: props.message.body ? props.message.body : '',
        example: props.message.example ? props.message.example : '',
        body_footer: props.message.footer_content ? props.message.footer_content : '',
        buttons: props.buttons,
        template_name: props.template.template_name ? props.template.template_name : '',
        template_name_space: props.template.template_name_space ? props.template.template_name_space : '',
        attach_file: props.template.attach_file ? props.template.attach_file : '',
    });

    const [buttons, setButtons] = useState([]);
    const [errors, setError] = useState({});
    const [temp_status, setStatus] = useState(props.template.status);
    const [sampleValues , setSampleValue] = useState(props.samples);

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
        // var pristine = new PristineJS(document.getElementById("template_form"), defaultPristineConfig);
        // let is_template_validated = pristine.validate(document.querySelectorAll('input[data-pristine-required], select[data-pristine-required], textarea[data-pristine-required]'));
        
        // var pristine = new PristineJS(document.getElementById("button_form"), defaultPristineConfig);
        // let is_validated = pristine.validate(document.querySelectorAll('input[data-pristine-required], select[data-pristine-required], textarea[data-pristine-required]'));
        // if(!is_validated || !is_template_validated) {
        // //    return false;
        // }

        let post_data = Object.assign({}, data);
        post_data['buttons'] = buttons;
        Inertia.post(route('store_template', [props.template.account_id, props.template.id]), post_data, {
            onSuccess: (response) => {
                if(response.props.result.status == 'failed'){
                    var error = (response.props.result.message) ? response.props.result.message : 'Template format is incorrect';
                    notie.alert({type: 'warning', text: error, time: 5});
                }else {         
                    window.location.reload();
                }
            },
            onError: (errors) => {
                setError(errors);
             },
            onComplete: (response) => {
                console.log(response);
            }
        });
        
        
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
            onSuccess: (response) => {
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
        if(name == 'body'){
            addSampleValueBox(value);
        }

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
    
    /**
     * Put field name to the template content
     */
    function addFieldToContent(e){
        var field = e.target.value;
        let newState = Object.assign({}, data);
        newState['body'] += field;
        setData(newState);

        let newSample = Object.assign({}, sampleValues);
        newSample[field] = '';
        setSampleValue(newSample);
    }

    /**
     * Handle sample value 
     */
    function sampleValueHandler(e){
        var value = e.target.value;
        var name = e.target.name;
        var field = e.target.getAttribute('fieldIndex');
        let newState = Object.assign({}, sampleValues);
        
        if(name == 'module_field'){
            value = (newState[field]) ? newState[field] + " " + value : value ; 
        }

        newState[field] = value;
        setSampleValue(newState);

        let newData = Object.assign({}, data);
        newData['sample_value'] = newState;
        setData(newData);
    }

    /**
     * Add input for sample value 
     * @param {Sring} content 
     */
    function addSampleValueBox(content){
        var getFromBetween = {
            results:[],
            string:"",
            getFromBetween:function (sub1,sub2) {
                if(this.string.indexOf(sub1) < 0 || this.string.indexOf(sub2) < 0) return false;
                var SP = this.string.indexOf(sub1)+sub1.length;
                var string1 = this.string.substr(0,SP);
                var string2 = this.string.substr(SP);
                var TP = string1.length + string2.indexOf(sub2);
                return this.string.substring(SP,TP);
            },
            removeFromBetween:function (sub1,sub2) {
                if(this.string.indexOf(sub1) < 0 || this.string.indexOf(sub2) < 0) return false;
                var removal = sub1+this.getFromBetween(sub1,sub2)+sub2;
                this.string = this.string.replace(removal,"");
            },
            getAllResults:function (sub1,sub2) {
                // first check to see if we do have both substrings
                if(this.string.indexOf(sub1) < 0 || this.string.indexOf(sub2) < 0) return;
        
                // find one result
                var result = this.getFromBetween(sub1,sub2);
                // push it to the results array
                this.results.push(result);
                // remove the most recently found one from the string
                this.removeFromBetween(sub1,sub2);
        
                // if there's more substrings
                if(this.string.indexOf(sub1) > -1 && this.string.indexOf(sub2) > -1) {
                    this.getAllResults(sub1,sub2);
                }
                else return;
            },
            get:function (string,sub1,sub2) {
                this.results = [];
                this.string = string;
                this.getAllResults(sub1,sub2);
                return this.results;
            }
        };
        var sampleValueIndex = getFromBetween.get(content,"{{","}}");

        let newSample = Object.assign({}, sampleValues);
        for(var i = 0 ; i < sampleValueIndex.length ; i ++ ){
            if(sampleValueIndex[i]){
                var index = sampleValueIndex[i];
                newSample[index] = (newSample[index]) ? newSample[index] : '';
            }
        }
        Object.entries(newSample).map(([key, value]) => {
            if(!sampleValueIndex.includes(key)){
                delete newSample[key]; 
            }
        });

        setSampleValue(newSample);
    }

    /**
     * Delete sample data
     */
    function deleteSampleData(key){
        console.log(key);
        var newState = Object.assign([], sampleValues);
        delete newState[key]; 
        setSampleValue(newState);

        let newData = Object.assign({}, data);
        newData['sample_value'] = newState;
        setData(newData);
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
                        {temp_status.toLowerCase() == 'approved' ?
                           <span class="shadow-sm mr-3 text-sm font-medium rounded-md text-green-700  p-3 bg-green-100">
                                {temp_status}
                            </span>
                        : 
                           <>
                           {(temp_status).toLowerCase() == 'submitted' || temp_status == 'draft' ?
                          <span class="shadow-sm text-sm mr-3 font-medium rounded-md text-yellow-700  p-3 bg-yellow-100">
                              {temp_status.toUpperCase()}
                            </span>
                            : 
                            <span class="shadow-sm text-sm mr-3 font-medium rounded-md text-red-700  p-3 bg-red-100">
                                {temp_status}
                            </span>
                            }
                            </>
                        }
                    {/* 
                       <button type='button' onClick={() => setTemplateModalOpen(true)} className="mr-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-gray-700  hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            Change Template Status
                        </button>
                        */}
                        <Link 
                            href={route('account_view', props.template.account_id)}
                            className="bg-white mr-3 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Back
                        </Link>
                      	{temp_status == 'draft' &&
                        <button
                            type="button"
                            onClick={validateAndSubmitForm}
                            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Save
                        </button>
                        }
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


                                            {data.header_type == 'image' || data.header_type == 'document' || data.header_type == 'video' ?
                                                <div className="form-group col-span-6 sm:col-span-4">
                                                    <label htmlFor="attach_file" className="block text-sm font-medium text-gray-700">
                                                        Attach file
                                                    </label>
                                                    <div className="mt-1">
                                                        <Input type="file" name='attach_file' required={true} id='attach_file' placeholder='' handleChange={handleChange} />
                                                    </div>
                                                    <InputError message={errors.attach_file} />
                                                </div>
                                            : ''}                                            

                                            {/* <div className="form-group col-span-6 sm:col-span-4">
                                                <label htmlFor="body" className="block text-sm font-medium text-gray-700">
                                                    Select field
                                                </label>
                                                <Dropdown 
                                                    required={true} 
                                                    id="field_name"
                                                    name="field_name"
                                                    handleChange={addFieldToContent}
                                                    options={props.fields}
                                                    value={data.field_name}
                                                />
                                            </div> */}
                                            <div className="form-group col-span-6 sm:col-span-4">
                                                <label htmlFor="body" className="block text-sm font-medium text-gray-700">
                                                    Body
                                                </label>
                                                <div className="mt-1">
                                                    <TextArea id="body" name="body" required={true} handleChange={handleChange} value={data.body} />
                                                </div>
                                                <p className='mt-2 text-sm text-gray-500 float-right'>{body_max_length - data.body.length}</p>
                                                <>
                                                 
                                                    <p className='mt-2 text-sm text-gray-500 '> 
                                                        <a href="https://developers.facebook.com/docs/whatsapp/message-templates/guidelines/#common-rejection-reasons" target={"_blank"}> Please follow the <span className='text-blue-500'> criteria </span> </a> 
                                                        </p> 
                                                    </>
                                                <InputError message={errors.body} />
                                            </div>
                                            {sampleValues && Object.entries(sampleValues).length && 
                                                <div className="form-group col-span-6 sm:col-span-4">
                                                    <label htmlFor="example" className="block text-sm font-medium text-gray-700">
                                                        Sample value
                                                    </label>
                                                    <div className="mt-1">
                                                        {Object.entries(sampleValues).map(([key, value]) => {
                                                            
                                                            var label = "{{"+ key +"}}";
                                                            return(
                                                                <div className=' grid grid-cols-4 '>
                                                                    <label className="block w-1/2 mt-2 mr-2 text-sm font-medium text-gray-700"> {label} </label>
                                                                    
                                                                    <select
                                                                        name="module_field"
                                                                        fieldIndex={key}
                                                                        id="module_field"
                                                                        value={value}
                                                                        onChange={ (e) => sampleValueHandler(e)}
                                                                        className='mt-1 block w-full py-2 px-3 bg-[#9BFFF2] border-0 rounded-sm shadow-sm focus:outline-none focus:ring-[#9BFFF2] focus:border-[#9BFFF2] sm:text-sm'
                                                                    >
                                                                        <option value=""> Select field</option>
                                                                        {Object.entries(props.fields).map(([index, field]) => 
                                                                            <option map_index={key} value={"{{"+ index +"}}"} > {field} </option>
                                                                        )}
                                                                    </select>
                                                                     <div className="flex items-center justify-between ml-5 w-64">
                                                                     <input
                                                                        className="focus:ring-[#9BFFF2] focus:border-[#9BFFF2] bg-[#F6FFFD] flex-1 block w-full rounded-sm sm:text-sm border border-[#67e8f9]"
                                                                        type="text"
                                                                        name={'field_value'}
                                                                        fieldIndex={key}
                                                                        onChange={ (e) => sampleValueHandler(e)}
                                                                        value={value}
                                                                    />
                                                                    </div> 
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            }
                                            {/* <div className="form-group col-span-6 sm:col-span-4">
                                                <label htmlFor="example" className="block text-sm font-medium text-gray-700">
                                                    Example
                                                </label>
                                                <div className="mt-1">
                                                    <TextArea id="example" name="example" required={true} handleChange={handleChange} value={data.example} />
                                                </div>
                                                <p className='mt-2 text-sm text-gray-500 float-right'>{body_max_length - data.example.length}</p>
                                                <InputError message={errors.example} />
                                            </div> */}

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
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>    
            </div>

        </Authenticated>
    );
}

export default NewTemplate;
