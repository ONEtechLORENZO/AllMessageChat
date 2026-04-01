import React, { useEffect, useState } from 'react'
import Dropdown from '@/Components/Forms/Dropdown';
import { useForm, Link, router as Inertia } from '@inertiajs/react';
import InputError from '@/Components/Forms/InputError';
import TextArea from '@/Components/Forms/TextArea';
import { header_templates } from '@/Pages/Constants';
import notie from 'notie';
import CreateButton from './CreateButton.jsx';
import TemplateBodyMapping from './TemplateBodyMapping';
import nProgress from 'nprogress';

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export default function TemplateContent(props) {

    const header_text_max_length = 60;

    const body_max_length = 1024;

    const footer_text_max_length = 60;

    const quick_reply_max_length = 20;

    const url_max_length = 2000;

    const message = props.message ?? {};
    const incomingButtons = Array.isArray(props.buttons) ? props.buttons : [];
    const initialSamples = props.samples ?? {};
    const inputClass =
        'mt-2 block w-full rounded-xl bg-white/[0.10] px-4 py-3 text-sm text-white ' +
        'shadow-[0_10px_30px_rgba(0,0,0,0.18)] placeholder:text-white/35 ' +
        'focus:outline-none focus:ring-2 focus:ring-fuchsia-500/30';

    const { data, setData, post, processing, reset } = useForm({
        language: message.language ? message.language : props.language,
        header_type: message.header_type ? message.header_type : '',
        header_text: message.header_content ? message.header_content : '',
        body: message.body ? message.body : '',
        status: message.status ? message.status : 'draft',
        example: message.example ? message.example : '',
        body_footer: message.footer_content ? message.footer_content : '',
        buttons: incomingButtons,
        template_name: props.template.template_name ? props.template.template_name : '',
        template_name_space: props.template.template_name_space ? props.template.template_name_space : '',
        attach_file: props.template.attach_file ? props.template.attach_file : '',
    });
    const footerLength = (data?.body_footer || '').length;
    const headerTextLength = (data?.header_text || '').length;
    const bodyLength = (data?.body || '').length;
    const normalizedStatus = (data?.status || 'draft').toLowerCase();
    const statusClass = normalizedStatus == 'approved'
        ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200'
        : (normalizedStatus == 'rejected' || normalizedStatus.indexOf('rejected') != -1)
            ? 'border-rose-400/20 bg-rose-400/10 text-rose-200'
            : 'border-amber-400/20 bg-amber-400/10 text-amber-200';

    const [buttons, setButtons] = useState([]);
    const [errors, setError] = useState({});
    const [sampleValues, setSampleValue] = useState(initialSamples);
    const [templateMapping, setTemplateMapping] = useState(false);

    useEffect(() => {
        const tmpButtons = [];

        incomingButtons.forEach((button) => {
            tmpButtons.push({
                id: button?.id ?? '',
                button_type: button?.button_type ?? '',
                button_text: button?.body ?? button?.button_text ?? '',
                action: button?.action ?? '',
                phone_number: button?.phone_number ?? '',
                url: button?.url ?? '',
                url_type: button?.url_type ?? '',
            });
        });

        if (tmpButtons.length === 0) {
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
    }, [incomingButtons]);

    function handleChange(event) {
        const name = event.target.name;
        const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
        if (name == 'body') {
            addSampleValueBox(value);
        }

        let newState = Object.assign({}, data);
        if (event.target.type == 'file' && event.target.files) {
            newState[name] = event.target.files[0];
        }
        else {
            newState[name] = value;
        }
        if (data.status == 'draft') {
            setData(newState);
        }
    }

    function addSampleValueBox(content) {
        var getFromBetween = {
            results: [],
            string: "",
            getFromBetween: function (sub1, sub2) {
                if (this.string.indexOf(sub1) < 0 || this.string.indexOf(sub2) < 0) return false;
                var SP = this.string.indexOf(sub1) + sub1.length;
                var string1 = this.string.substr(0, SP);
                var string2 = this.string.substr(SP);
                var TP = string1.length + string2.indexOf(sub2);
                return this.string.substring(SP, TP);
            },
            removeFromBetween: function (sub1, sub2) {
                if (this.string.indexOf(sub1) < 0 || this.string.indexOf(sub2) < 0) return false;
                var removal = sub1 + this.getFromBetween(sub1, sub2) + sub2;
                this.string = this.string.replace(removal, "");
            },
            getAllResults: function (sub1, sub2) {
                // first check to see if we do have both substrings
                if (this.string.indexOf(sub1) < 0 || this.string.indexOf(sub2) < 0) return;

                // find one result
                var result = this.getFromBetween(sub1, sub2);
                // push it to the results array
                this.results.push(result);
                // remove the most recently found one from the string
                this.removeFromBetween(sub1, sub2);

                // if there's more substrings
                if (this.string.indexOf(sub1) > -1 && this.string.indexOf(sub2) > -1) {
                    this.getAllResults(sub1, sub2);
                }
                else return;
            },
            get: function (string, sub1, sub2) {
                this.results = [];
                this.string = string;
                this.getAllResults(sub1, sub2);
                return this.results;
            }
        };
        var sampleValueIndex = getFromBetween.get(content, "{{", "}}");

        let newSample = Object.assign({}, sampleValues || {});
        for (var i = 0; i < sampleValueIndex.length; i++) {
            if (sampleValueIndex[i]) {
                var index = sampleValueIndex[i];
                newSample[index] = (newSample[index]) ? newSample[index] : '';
            }
        }

        Object.entries(newSample).forEach(([key]) => {
            if (!sampleValueIndex.includes(key)) {
                delete newSample[key];
            }
        });

        setSampleValue(newSample);
    }

    function sampleValueHandler(e) {
        var value = e.target.value;
        var name = e.target.name;
        var field = e.target.getAttribute('fieldIndex');
        let newState = Object.assign({}, sampleValues);

        if (name == 'module_field') {
            value = (newState[field]) ? newState[field] + " " + value : value;
        }

        newState[field] = value;
        setSampleValue(newState);

        let newData = Object.assign({}, data);
        newData['sample_value'] = newState;
        setData(newData);
    }

    function addNewButton() {
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

    function validateAndSubmitForm() {
        let post_data = Object.assign({}, data);
        post_data['buttons'] = buttons;

        nProgress.start(0.5);
        nProgress.inc(0.2);

        Inertia.post(route('store_template', [props.template.account_id, props.template.id]), post_data, {
            onSuccess: (response) => {
                if (response.props.result.status == 'failed' || 'error' == response.props.result.status || 'false' == response.props.result.status) {
                    var error = (response.props.result.template_status) ? response.props.result.template_status : 'Template format is incorrect';
                    error = (response.props.result.message) ? response.props.result.message : error;
                    notie.alert({ type: 'warning', text: error, time: 5 });
                } else {
                    let newState = Object.assign({}, data);
                    newState['status'] = 'Submitted';
                    setData(newState);
                    notie.alert({ type: 'warning', text: 'Template submitted successfully', time: 5 });
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
        if (buttonLength != 1) {
            newButton.splice(index, 1);
        }
        setButtons(newButton);
    }

    return (
        <div className="w-full py-6">
            <div className="mb-6 text-lg font-black tracking-[0.22em] text-white/90">
                {String(props.translator['Template editor'] ?? 'Template editor').toUpperCase()}
            </div>

            <div className="grid w-full rounded-[28px] bg-[radial-gradient(circle_at_0%_0%,rgba(124,58,237,0.35),rgba(20,8,22,0.92)_55%,rgba(8,4,16,0.98)_100%)] shadow-[0_40px_140px_rgba(0,0,0,0.55)] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start" style={{overflow: 'clip'}}>
                <div className="px-8 py-10 sm:px-10">
                    <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
                        {data.status == 'draft'
                            ? (props.translator['Create new message template'] ?? 'Create new message template')
                            : props.template.name}
                    </h1>

                    <p className="mt-4 max-w-2xl text-sm leading-6 text-white/70">
                        {props.translator['Through this page you can modify your template following the Whatsapp guidelines. Check out']}{' '}
                        <a className="text-white underline decoration-white/30 underline-offset-4">
                            {props.translator['whatsapp suggestions.']}
                        </a>
                    </p>

                    <div className="mt-6 h-px w-full bg-white/25" />

                    <div className="mt-10 space-y-10">
                        <div className="space-y-4">
                            <label className="text-base font-medium text-white">
                                {props.translator['Header type']}
                            </label>
                            <Dropdown
                                required={true}
                                id="header_type"
                                name="header_type"
                                handleChange={handleChange}
                                options={header_templates}
                                value={data.header_type}
                                readOnly={data.status == 'draft' ? false : true}
                                variant="soft"
                            />
                            <InputError message={errors.header_type} />
                        </div>

                        {(data.header_type == 'text' && (data.header_text || data.status == 'draft')) ?
                            <div className="form-group col-span-6 sm:col-span-4">
                                <label htmlFor="header_text" className="block text-sm font-medium text-white/75">
                                    {props.translator['Header Text']}
                                </label>
                                <input name='header_text' id='header_text' type={'text'} className={inputClass} maxLength={'60'} onChange={(e) => handleChange(e)} value={data.header_text} required={data.header_type == 'text' ? true : false} />
                                <small className="form-text text-white/45">{props.translator['Max']} {header_text_max_length - headerTextLength} {props.translator['characters']} </small>
                                <InputError message={errors.header_text} />
                            </div>
                            : ''}

                        {data.header_type == 'image' || data.header_type == 'document' || data.header_type == 'video' ?
                            <>
                                {data.status == 'draft' &&
                                    <div className="form-group col-span-6 sm:col-span-4">
                                        <label htmlFor="attach_file" className="block text-sm font-medium text-white/75">
                                            {props.translator['Attach file']}
                                        </label>
                                        <div className="mt-1">
                                            <input name='attach_file' id='attach_file' type={'file'} className={`${inputClass} file:mr-4 file:rounded-full file:border-0 file:bg-fuchsia-500/15 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-fuchsia-100`} maxLength={'60'} onChange={(e) => handleChange(e)} required={true} />
                                        </div>
                                        <InputError message={errors.attach_file} />
                                    </div>
                                }
                            </>
                            : ''}

                        <div className='form-group'>
                            <div className='grid grid-cols-2 items-center'>
                                <label className='text-base font-medium text-white'>{props.translator['Body']}</label>
                                <button type="button" className='flex justify-end font-medium text-fuchsia-200 transition hover:text-white' onClick={() => setTemplateMapping(true)}>{props.translator['Template mapping']}</button>
                            </div>
                            <div className="mt-1">
                                <TextArea
                                    id="body"
                                    readOnly={data.status == 'draft' ? false : true}
                                    name="body"
                                    required={true}
                                    handleChange={handleChange}
                                    value={data.body}
                                    maxLength={'1024'}
                                    variant="soft"
                                />
                            </div>
                            <div className='grid grid-cols-2'>
                                <small className="form-text justify-start text-white/45" >{props.translator['Max']} {body_max_length - bodyLength} {props.translator['characters']} </small>
                                <small className="form-text flex justify-end text-white/45" >
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

                        <div className="space-y-3">
                            <label className="text-base font-medium text-white">
                                {props.translator['Footer']}
                            </label>
                            <input name='body_footer' id='body_footer' readOnly={data.status == 'draft' ? false : true} type={'text'} className={inputClass} maxLength={'60'} onChange={(e) => handleChange(e)} value={data.body_footer} />
                            <small className="form-text text-white/45">{props.translator['Max']} {footer_text_max_length - footerLength} {props.translator['characters']} </small>
                            <InputError message={errors.body_footer} />
                        </div>

                        <div className="h-px w-full bg-white/25" />

                        <div>
                            <div className="flex items-center justify-between gap-4">
                                <div className="text-base font-medium text-white">
                                    {props.translator['Buttons (Optional)']}
                                </div>
                                <button
                                    type="button"
                                    className="inline-flex items-center rounded-full bg-fuchsia-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-fuchsia-500"
                                    onClick={addNewButton}
                                >
                                    {props.translator['Add Button']}
                                </button>
                            </div>
                            <p className="mt-2 text-sm text-white/55">
                                {props.translator['Create up to 3 buttons that let customers respond to your message or take action.']}
                            </p>

                            <div className="button-container mt-6 space-y-4">
                                {buttons.map((button, index) => {
                                    return (
                                        <CreateButton
                                            key={button.id || `button-${index}`}
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
                        </div>

                        <div className="pt-4">
                            <div className="flex w-full items-center justify-between gap-4">
                                <Link
                                    href={route('account_view', props.template.account_id)}
                                    className="inline-flex items-center rounded-full bg-white/10 px-6 py-2.5 text-sm font-semibold text-white/90 ring-1 ring-white/10 transition hover:bg-white/15"
                                >
                                    {props.translator['Back']}
                                </Link>
                                {data.status == 'draft' &&
                                    <button
                                        type="button"
                                        className="inline-flex items-center rounded-full bg-fuchsia-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-fuchsia-500"
                                        onClick={() => validateAndSubmitForm()}
                                    >
                                        {props.translator['Send for review']}
                                    </button>
                                }
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative flex flex-col items-center bg-[linear-gradient(180deg,rgba(88,28,135,0.95),rgba(67,22,120,0.92))] px-8 py-10 sm:px-10 lg:self-start lg:sticky lg:top-0 lg:min-h-screen">
                    <div className="text-center text-4xl font-black tracking-[0.08em] text-white">
                        {String(props.translator['Preview'] ?? 'Preview').toUpperCase()}
                    </div>

                    {/* Phone mockup - always pinned below the title, never re-centers */}
                    <div className="mt-10 flex justify-center">
                        <div className="relative w-[270px] h-[540px]">
                            {/* Phone frame image */}
                            <img
                                src="/img/mockup-trans.png"
                                width="270"
                                className="absolute inset-0 z-10 pointer-events-none select-none"
                                alt=""
                            />
                            {/* Chat content inside phone */}
                            <div className="absolute inset-0 flex flex-col overflow-hidden">
                                <div className="px-[11px] pt-[13px] pb-[9px] flex flex-col h-full">
                                    <img
                                        src="/img/WhatsApp-header.png"
                                        className="rounded-t-xl w-full"
                                        alt=""
                                    />
                                    {/* Scrollable chat body */}
                                    <div className="flex-1 bg-[#EEE3DE] overflow-y-auto px-2 py-2 space-y-2">
                                        <div className="flex justify-center">
                                            <span className="text-[10px] text-[#6C6C6C] bg-white/60 rounded-full px-2 py-0.5">TODAY</span>
                                        </div>

                                        {/* Message bubble */}
                                        <div className="w-4/5 bg-white rounded-lg p-2 shadow-sm">
                                            {(data.header_type === 'image' || data.header_type === 'video' || data.header_type === 'document') && (
                                                <img src="/img/dummy-img.png" className="w-full object-cover mb-1.5 rounded" alt="" />
                                            )}
                                            {data.header_type === 'text' && data.header_text && (
                                                <p className="text-[11px] font-bold text-black mb-1 leading-tight">{data.header_text}</p>
                                            )}
                                            <p className="text-[11px] text-black leading-relaxed">
                                                {data.body || <span className="text-[#aaa] italic">Your message body will appear here…</span>}
                                            </p>
                                            {data.body_footer && (
                                                <p className="text-[10px] text-[#777] mt-1">{data.body_footer}</p>
                                            )}
                                            <div className="flex justify-end mt-1">
                                                <span className="text-[9px] text-[#aaa]">9:41 AM ✓✓</span>
                                            </div>
                                        </div>

                                        {/* Button previews */}
                                        {buttons.length > 0 && (
                                            <div className="w-4/5 space-y-1">
                                                {buttons.map((btn, i) => (
                                                    <div key={i} className="bg-white rounded-md py-1.5 text-center text-[11px] text-[#46A5EE] font-medium shadow-sm cursor-default">
                                                        {btn.button_text || `Button ${i + 1}`}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Chat input bar */}
                                    <img
                                        src="/img/whatapp-chat.png"
                                        className="rounded-b-xl w-full"
                                        alt=""
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}












