import React from 'react';
import {button_types, call_to_action_lists, url_types} from '@/Pages/Constants'; 
import Dropdown from '@/Components/Forms/Dropdown';
import InputError from '@/Components/Forms/InputError';
import { DeleteIcon } from '@/Pages/icons';

export default function CreateButton(props) {
    const buttonData = {
        id: props.data?.id ?? '',
        button_type: props.data?.button_type ?? '',
        button_text: props.data?.button_text ?? '',
        action: props.data?.action ?? '',
        phone_number: props.data?.phone_number ?? '',
        url: props.data?.url ?? '',
        url_type: props.data?.url_type ?? '',
    };
    const inputClass =
        "mt-2 block w-full rounded-xl bg-white/[0.10] px-4 py-3 text-sm text-white " +
        "shadow-[0_10px_30px_rgba(0,0,0,0.18)] placeholder:text-white/35 " +
        "focus:outline-none focus:ring-2 focus:ring-fuchsia-500/30";

    return (
        <div className="rounded-3xl bg-white/[0.04] p-5 shadow-[0_18px_55px_rgba(0,0,0,0.26)]">
            <input type="hidden" name="id" value={buttonData.id} />
            <div className="form-group col-span-6 sm:col-span-4">
                <div className='grid grid-cols-2'>
                    <label htmlFor="button_type" className="block text-sm font-semibold text-white/70">
                        {props.translator['Button No']} {props.index  + 1}
                    </label>
                    <button
                        type="button"
                        className='flex justify-end text-red-400 transition hover:text-red-300'
                        onClick={() => {props.deleteButton(props.index)}}
                    >
                        <DeleteIcon className="cursor-pointer" /> 
                    </button>
                </div>
                
                <div className="mt-1 flex rounded-md shadow-sm">
                    <Dropdown 
                        id="button_type"
                        name="button_type"
                        handleChange={props.handleChange}
                        options={button_types}
                        value={buttonData.button_type}
                        variant="soft"
                    />
                </div>
                <InputError message={props.errors.button_type} />
            </div>

            {buttonData.button_type == 'Quick Reply' ?                                         
                <div className="form-group col-span-6 sm:col-span-4">
                    <div className="mt-1">
                        <input name='button_text' id='button_text' type={'text'} className={inputClass} maxLength={'20'} onChange={(e) => props.handleChange(e)} value={buttonData.button_text} required={true}/>
                    </div>
                    <small className="form-text text-white/45"> {props.quick_reply_max_length - buttonData.button_text.length} / {props.quick_reply_max_length} </small>
                    <InputError message={props.errors.button_text} />
                </div> 
            : ''}

            {buttonData.button_type == 'Call to Action' ?      
                <>                                   
                    <div className="form-group col-span-6 sm:col-span-4">
                        <label htmlFor="action" className="block text-sm font-medium text-white/70">
                            Type of action
                        </label>
                        <div className="mt-1">
                            <Dropdown 
                                required={true} 
                                id="action"
                                name="action"
                                handleChange={props.handleChange}
                                options={call_to_action_lists}
                                value={buttonData.action}
                            />
                        </div>
                        <InputError message={props.errors.action} />
                    </div> 

                    {buttonData.action == 'call_phone_number' ?
                        <>
                            <div className="form-group col-span-6 sm:col-span-4">
                                <label htmlFor="button_text" className="block text-sm font-medium text-white/70">
                                    Button text
                                </label>
                                <div className="mt-1">
                                   <input name='button_text' id='button_text' type={'text'} className={inputClass} maxLength={'60'} onChange={(e) => props.handleChange(e)} value={buttonData.button_text} required={true}/>
                                </div>
                                <small className="form-text text-white/45"> {props.quick_reply_max_length - buttonData.button_text.length} / {props.quick_reply_max_length} </small>
                                <InputError message={props.errors.button_text} />
                            </div> 
                            <div className="form-group col-span-6 sm:col-span-4">
                                <label htmlFor="phone_number" className="block text-sm font-medium text-white/70">
                                    Phone number (format: +XXXXXXXXXX)
                                </label>
                                <div className="mt-1">
                                   <input name='phone_number' id='phone_number' type={'text'} className={inputClass} maxLength={'60'} onChange={(e) => props.handleChange(e)} value={buttonData.phone_number} required={true}/>
                                </div>
                                <small className="form-text text-white/45">Max {props.quick_reply_max_length - buttonData.phone_number.length} characters </small>
                                <InputError message={props.errors.phone_number} />
                            </div> 
                        </>
                    : ''}

                    {buttonData.action == 'visit_website' ? 
                        <>
                            <div className="form-group col-span-6 sm:col-span-4">
                                <div className="mt-1">
                                    <input name='button_text' id='button_text' type={'text'} className={inputClass} maxLength={'20'} onChange={(e) => props.handleChange(e)} value={buttonData.button_text} required={true}/>
                                </div>
                                <small className="form-text text-white/45"> {props.quick_reply_max_length - buttonData.button_text.length} / {props.quick_reply_max_length} </small>
                                <InputError message={props.errors.button_text} />
                            </div> 

                            <div className="form-group col-span-6 sm:col-span-4">
                                <label htmlFor="url_type" className="block text-sm font-medium text-white/70">
                                    URL Type
                                </label>
                                <div className="mt-1">
                                    <Dropdown 
                                        required={true} 
                                        id="url_type"
                                        name="url_type"
                                        handleChange={props.handleChange}
                                        options={url_types}
                                        value={buttonData.url_type}
                                    />
                                </div>
                                <InputError message={props.errors.url_type} />
                            </div> 
                            <div className="form-group col-span-6 sm:col-span-4">
                                <label htmlFor="url" className="block text-sm font-medium text-white/70">
                                    URL
                                </label>
                                <div className="mt-1">
                                   <input name='url' id='url' type={'text'} maxlength="2000" className={inputClass} onChange={(e) => props.handleChange(e)} value={buttonData.url} required={true}/>
                                </div>
                                <small className="form-text text-white/45"> {props.url_max_length - buttonData.url.length} / {props.url_max_length} </small>
                                <InputError message={props.errors.url} />
                            </div> 
                        </>
                    : ''}
                </>
            : ''}
        </div>
    );
}












