import React from 'react';
import {button_types, call_to_action_lists, url_types} from '@/Pages/Constants'; 
import Dropdown from '@/Components/Forms/Dropdown';
import InputError from '@/Components/Forms/InputError';
import Input from '@/Components/Forms/Input';

function TemplateButton(props)
{
    return (
        <>
            <div className="form-group col-span-6 sm:col-span-4">
                <label htmlFor="button_type" className="block text-sm font-medium text-gray-700">
                    Button type
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                    <Dropdown 
                        id="button_type"
                        name="button_type"
                        handleChange={props.handleChange}
                        options={button_types}
                        value={props.data.button_type}
                    />
                </div>
                <InputError message={props.errors.button_type} />
            </div>

            {props.data.button_type == 'Quick Reply' ?                                         
                <div className="form-group col-span-6 sm:col-span-4">
                    <div className="mt-1">
                        <Input id="button_text" value={props.data.button_text} required={true} name="button_text" handleChange={props.handleChange} />
                    </div>
                    <p className='mt-2 text-sm text-gray-500 float-right'>{props.quick_reply_max_length - props.data.button_text.length}</p>
                    <InputError message={props.errors.button_text} />
                </div> 
            : ''}

            {props.data.button_type == 'Call to Action' ?      
                <>                                   
                    <div className="form-group col-span-6 sm:col-span-4">
                        <label htmlFor="action" className="block text-sm font-medium text-gray-700">
                            Type of action
                        </label>
                        <div className="mt-1">
                            <Dropdown 
                                required={true} 
                                id="action"
                                name="action"
                                handleChange={props.handleChange}
                                options={call_to_action_lists}
                                value={props.data.action}
                            />
                        </div>
                        <InputError message={props.errors.action} />
                    </div> 

                    {props.data.action == 'call_phone_number' ?
                        <>
                            <div className="form-group col-span-6 sm:col-span-4">
                                <label htmlFor="button_text" className="block text-sm font-medium text-gray-700">
                                    Button text
                                </label>
                                <div className="mt-1">
                                    <Input id="button_text" required={true} name="button_text" value={props.data.button_text} handleChange={props.handleChange} />
                                </div>
                                <p className='mt-2 text-sm text-gray-500 float-right'>{props.quick_reply_max_length - props.data.button_text.length}</p>
                                <InputError message={props.errors.button_text} />
                            </div> 
                            <div className="form-group col-span-6 sm:col-span-4">
                                <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">
                                    Phone number (format: +XXXXXXXXXX)
                                </label>
                                <div className="mt-1">
                                    <Input id="phone_number" name="phone_number" value={props.data.phone_number} required={true} handleChange={props.handleChange} />
                                </div>
                                <p className='mt-2 text-sm text-gray-500 float-right'>{props.quick_reply_max_length - props.data.phone_number.length}</p>
                                <InputError message={props.errors.phone_number} />
                            </div> 
                        </>
                    : ''}

                    {props.data.action == 'visit_website' ? 
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
                                        handleChange={props.handleChange}
                                        options={url_types}
                                        value={props.data.url_type}
                                        required={true}
                                    />
                                </div>
                                <InputError message={props.errors.url_type} />
                            </div> 
                            <div className="form-group col-span-6 sm:col-span-4">
                                <label htmlFor="url" className="block text-sm font-medium text-gray-700">
                                    URL
                                </label>
                                <div className="mt-1">
                                    <Input id="url" name="url" handleChange={props.handleChange} required={true} value={props.data.url} />
                                </div>
                                <p className='mt-2 text-sm text-gray-500 float-right'>{props.url_max_length - props.data.url.length}</p>
                                <InputError message={props.errors.url} />
                            </div> 
                        </>
                    : ''}
                </>
            : ''}
            <div className='col-span-6 sm:col-span-4'>
                <hr className="my-2" />
            </div>
        </>
    );
}

export default TemplateButton;