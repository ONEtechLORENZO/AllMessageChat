import React, {useEffect, useState } from 'react'
import {Card } from 'reactstrap'
import TemplateBody from './TemplateBody';
import Dropdown from '@/Components/Forms/Dropdown';
import { useForm, Link } from '@inertiajs/inertia-react';
import InputError from '@/Components/Forms/InputError';
import TextArea from '@/Components/Forms/TextArea';
import { header_templates} from '@/Pages/Constants'; 
import notie from 'notie';
import CreateButton from './CreateButton.js';
import TemplateBodyMapping from './TemplateBodyMapping';
import nProgress from 'nprogress';
import { Inertia } from '@inertiajs/inertia';

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export default function TemplateContent(props) {

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
        status: props.message.status ? props.message.status : 'draft',
        example: props.message.example ? props.message.example : '',
        body_footer: props.message.footer_content ? props.message.footer_content : '',
        buttons: props.buttons,
        template_name: props.template.template_name ? props.template.template_name : '',
        template_name_space: props.template.template_name_space ? props.template.template_name_space : '',
        attach_file: props.template.attach_file ? props.template.attach_file : '',
    });

    const [buttons, setButtons] = useState([]);
    const [errors, setError] = useState({});
    const [sampleValues , setSampleValue] = useState(props.samples);
    const [templateMapping, setTemplateMapping] = useState(false);

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
        if(data.status == 'draft') {
            setData(newState);
        }
    }

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

    function validateAndSubmitForm() 
    {
        let post_data = Object.assign({}, data);
        post_data['buttons'] = buttons;
        
        nProgress.start(0.5);
        nProgress.inc(0.2);
       
        Inertia.post(route('store_template', [props.template.account_id, props.template.id]), post_data, {
            onSuccess: (response) => {
                if(response.props.result.status == 'failed' || 'error' == response.props.result.status || 'false' == response.props.result.status ){
                    var error = (response.props.result.template_status) ? response.props.result.template_status : 'Template format is incorrect';
                    error = (response.props.result.message) ? response.props.result.message : error;
                    notie.alert({type: 'warning', text: error, time: 5});
                }else {    
                    let newState = Object.assign({}, data);
                    newState['status'] = 'Submitted';
                    setData(newState);
                    notie.alert({type: 'warning', text: 'Template submitted successfully', time: 5});     
                }
            },
            onError: (errors) => {
                setError(errors);
            },
            onComplete: (response) => {
                
            }
        });
    }

    function handleButtonChange(event, index) {
        const name = event.target.name;
        const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
        let newState = Object.assign([], buttons);
        newState[index][name] = value;
        setButtons(newState);
    }

    function deleteButton(index) {
        let newButton = Object.assign([], buttons);
        let buttonLength = newButton.length;
        if(buttonLength != 1) {
            newButton.splice(index, 1);
        }
        setButtons(newButton);
    }

    return (
        <div className="sm:grid grid-cols-12 w-full p-6 bg-[#F1F4F6]">
            <div className="col-span-6">

            <h1 className="text-[#545CD8] text-2xl font-semibold">
                {data.status == 'draft' ? 
                 <> {props.translator['Create new message template']} </> 
                 :
                 <> 
                    {props.template.name} 
                    <span 
                        className={classNames(
                            (data.status).toLowerCase() == 'approved' ?
                                 'text-[#3c763d] bg-[#dff0d8]'
                                : 
                                    (data.status == 'rejected' || (data.status).indexOf('REJECTED') != -1 ) ?
                                        'text-[#c7254e] bg-[#f9f2f4]'  
                                    :
                                        'text-[#E68D08] bg-[#fcf8e3]'  
                                ,
                            'ml-3 text-sm inline-flex items-center px-2 col-span-5 py-0.5 rounded font-semibold'
                            )}
                       >
                        {(data.status).toUpperCase()}
                    </span>
                </>
                } 
            </h1>

            <Card className='!mt-4 p-6'>
                <div className='font-semibold text-xl leading-8 text-[#424242]' >
                {props.translator['Customize template']}
                </div>
                <p className='text-[#878787]'>{props.translator['Through this page you can modify your template following the Whatsapp guidelines. Check out']} <a className='text-[#4175DC]'>{props.translator['whatsapp suggestions.']}</a></p>
                <p>{props.translator['Good Work!']}</p>
                <div className='space-y-3'>            
                    <div className='form-group'>
                        <label className='text-[#424242] text-base font-medium'>{props.translator['Header type']}</label>
                        <Dropdown 
                            required={true} 
                            id="header_type"
                            name="header_type"
                            handleChange={handleChange}
                            options={header_templates}
                            value={data.header_type}
                            readOnly={data.status == 'draft' ? false : true}
                        />
                        <InputError message={errors.header_type} />
                    </div>

                    {(data.header_type == 'text' && (data.header_text || data.status == 'draft')) ?
                        <div className="form-group col-span-6 sm:col-span-4">
                            <label htmlFor="header_text" className="block text-sm font-medium text-gray-700">
                            {props.translator['Header Text']}
                            </label>
                            <div className="mt-1">
                                <input name='header_text' id='header_text' type={'text'} className="form-control" maxLength={'60'} onChange={(e) => handleChange(e)} value={data.header_text} required={data.header_type == 'text' ? true : false}/>
                            </div>
                            <small class="form-text text-muted">{props.translator['Max']} {header_text_max_length - data.header_text.length} {props.translator['characters']} </small>
                            <InputError message={errors.header_text} />
                        </div> 
                    : ''}

                    {data.header_type == 'image' || data.header_type == 'document' || data.header_type == 'video' ?
                        <>
                            {data.status == 'draft' &&
                                <div className="form-group col-span-6 sm:col-span-4">
                                    <label htmlFor="attach_file" className="block text-sm font-medium text-gray-700">
                                    {props.translator['Attach file']}
                                    </label>
                                    <div className="mt-1">
                                        <input name='attach_file' id='attach_file' type={'file'} className="form-control" maxLength={'60'} onChange={(e) => handleChange(e)} required={true}/>
                                    </div>
                                    <InputError message={errors.attach_file} />
                                </div>
                            }
                        </>
                    : ''}  

                    <div className='form-group'>
                        <div className='grid grid-cols-2 '>
                            <label className='text-[#424242] text-base font-medium'>{props.translator['Body']}</label>
                            <div className='text-blue-500 font-medium flex justify-end' onClick={() => setTemplateMapping(true)}>{props.translator['Template mapping']}</div>
                        </div>
                        <div className="mt-1">
                            <TextArea id="body"  readOnly={data.status == 'draft' ? false : true} name="body" required={true} handleChange={handleChange} value={data.body} maxLength={'1024'}/>
                        </div>
                        <div className='grid grid-cols-2'>
                            <small className="form-text text-muted justify-start" >{props.translator['Max']} {body_max_length - data.body.length} {props.translator['characters']} </small>
                            <small className="form-text text-muted justify-end flex" >
                                <a href="https://developers.facebook.com/docs/whatsapp/message-templates/guidelines/#common-rejection-reasons" target={"_blank"}> {props.translator['Please follow the']} <span className='text-blue-500'> {props.translator['criteria']} </span> </a> 
                            </small>
                        </div>
                        <InputError message={errors.body} />
                    </div>

                    {templateMapping &&
                        <TemplateBodyMapping 
                            data={data}
                            fields={props.fields}
                            language={props.language}
                            sampleValues={sampleValues}
                            template_id={props.template.id}
                            addSampleValueBox={addSampleValueBox}
                            setTemplateMapping={setTemplateMapping}
                            sampleValueHandler={sampleValueHandler}
                            {...props}
                        /> 
                    }

                    <div className='form-group'>
                        <label className='text-[#424242] text-base font-medium'>{props.translator['Footer']}</label>
                        <input name='body_footer' id='body_footer'  readOnly={data.status == 'draft' ? false : true} type={'text'} className="form-control" maxLength={'60'} onChange={(e) => handleChange(e)} value={data.body_footer}/>
                        <small class="form-text text-muted">{props.translator['Max']} {footer_text_max_length - data.body_footer.length} {props.translator['characters']} </small>
                        <InputError message={errors.body_footer} />
                    </div>
                </div>
                <hr/>

                <div className='text-base font-medium grid grid-cols-2'>
                    <div className='flex justify-start'>{props.translator['Buttons (Optional)']}</div>
                    <div className='flex justify-end'>
                        <button class="mb-2 mr-2 btn btn-primary" onClick={addNewButton}>{props.translator['Add Button']}</button>
                    </div>
                </div>
                <p className='text-[#878787]'>{props.translator['Create up to 3 buttons that let customers respond to your message or take action.']}</p>

                <div className='button-container mt-6 space-y-3'>
                    {buttons.map((button, index) => {
                        return (
                            <CreateButton 
                                index={index}
                                data={button}
                                quick_reply_max_length={quick_reply_max_length} 
                                url_max_length={url_max_length} 
                                errors={errors}
                                handleChange={(e) => handleButtonChange(e, index)}
                                deleteButton={deleteButton}
                                {...props}
                            />
                        );
                    })}
                </div>

                <p className='text-center !mt-6'>{props.translator['Look, whatsapp takes up to 24 hours to review this template.']}</p>

                <div className='flex justify-between !mt-6 w-full'>
                    <Link 
                        href={route('account_view', props.template.account_id)}
                        className="mb-2 mr-2 btn btn-light"
                    >
                        {props.translator['Back']}
                    </Link>
                    {data.status == 'draft' &&
                        <button class="mb-2 mr-2 btn btn-primary" onClick={() => validateAndSubmitForm()}>{props.translator['Send for review']}</button>
                    }
                </div>
            </Card>

            </div>

            <div className=" col-span-6 flex  items-center flex-col gap-6 ">
                <div className='text-center text-2xl leading-6 font-semibold text-[#878787] !mt-12'>{props.translator['Preview']}</div>
                <div className='w-[300px] h-[600px] relative'>
                    <img src='/img/mockup-trans.png' width={'300'} className="absolute inset-0" />
                    <div className='w-full h-full'>
                        <div className='!px-3 pt-[14px] !pb-[10px] flex flex-col h-full '>
                        <img src='/img/WhatsApp-header.png' className='rounded-t-xl' width={'300'} /> 
                            <TemplateBody
                                template={data}
                                buttons={buttons}
                            />
                        <div className='bg-[#EEE3DE] rounded-b-xl w-full' >
                            <img src='/img/whatapp-chat.png' className='rounded-b-xl'  width={'300'} /> 
                        </div>                   
                        </div>            
                    </div>
                </div>
            </div>
            
        </div>
    );
}