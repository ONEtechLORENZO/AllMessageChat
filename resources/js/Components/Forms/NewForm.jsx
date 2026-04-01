import { Fragment, useEffect, useRef, useState } from 'react'
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { BsPlusLg } from "react-icons/bs";
import { useForm, router as Inertia } from '@inertiajs/react';
import Axios from "axios";

import notie from 'notie';
import nProgress from 'nprogress';
import Dropdown from './Dropdown';
import TextArea from './TextArea';
import Input from './Input';
import Pristine from "pristinejs";
import ValidationErrors from '@/Components/ValidationErrors';
import Checkbox from '../Checkbox';
import Creatable from 'react-select/creatable';
import { parsePhoneNumber } from 'react-phone-number-input';
import Number from './Number';
import DateTime from './DateTime';
import PhoneInput2 from 'react-phone-input-2';
import Relate from '@/Components/Relate';
import 'react-phone-input-2/lib/style.css';
import Date from './Date';
import Time from './Time';
import MultiSelect from './MultiSelect';
import LineItem from '@/Pages/Order/Form';
import InputError from './InputError';
import MultiContainer from './MultiContainer';
import MultiPhoneNumber from './MultiPhoneNumber';
import ModulePermission from '@/Pages/Roles/ModulePermission';
import OptionButtons from '../../Pages/InteractiveMessages/OptionButtons';

const defaultConfig = {
    // class of the parent element where the error/success class is added
    classTo: 'form-group',
    errorClass: 'has-danger',
    successClass: 'has-success',
    // class of the parent element where error text element is appended
    errorTextParent: 'form-group',
    // type of element to create for the error text
    errorTextTag: 'div',
    // class of the error text element
    errorTextClass: 'text-red-500 text-xs pt-1'
};

const optionField = {
    'field_name': 'options',
    'field_label': 'Options',
    'field_type': 'selectable',
    'is_mandatory': 1,
    'is_custom': 1
}

const hiddenContactModalFields = new Set([
    "telegram_number",
    "tiktok_username",
    "linkedin_username",
    "personal_website",
]);

function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
}

function getCreateTitle(props) {
    if (props.module === "Api") {
        return props.translator["Create Api key"] ?? "Create Api key";
    }

    return `${props.translator['Add']} ${props.module}`;
}

function getSubmitLabel(props) {
    if (props.module === "Api") {
        return props.recordId
            ? props.translator["Update Api key"] ?? "Update Api key"
            : props.translator["Create Api key"] ?? "Create Api key";
    }

    return props.recordId
        ? `${props.translator['Update']} ${props.translator[props.module]}`
        : `${props.translator['Create']} ${props.translator[props.module]}`;
}

export default function NewForm(props) {
    const [show, setShow] = useState(true);
    const [group, setGroup] = useState('General');
    const [fields, setFields] = useState();
    const [fieldGroupList, setfieldGroupList] = useState();
    const [groupFieldList, setGroupfieldList] = useState();
    const cancelButtonRef = useRef(null)
    const [formErrors, setErrors] = useState({});
    const [options, setOptions] = useState(null);
    const [lineItems, setLineItems] = useState([]);
    const [totalPrice, setTotalPrice] = useState('0.00');
    const [productList, setProductList] = useState(props.productList);
    const [tmpRecord, setTmpRecord] = useState();
    const [tagOptions, setTagOptions] = useState(props.tagOptions ?? []);
    const [categoryOptions, setCategoryOptions] = useState(props.listOptions ?? []);
    const [setupOptionsLoaded, setSetupOptionsLoaded] = useState(
        (Array.isArray(props.tagOptions) && props.tagOptions.length > 0) ||
            (Array.isArray(props.listOptions) && props.listOptions.length > 0),
    );
    const [setupOptionsRequested, setSetupOptionsRequested] = useState(
        (Array.isArray(props.tagOptions) && props.tagOptions.length > 0) ||
            (Array.isArray(props.listOptions) && props.listOptions.length > 0),
    );
    const [setupOptionsLoading, setSetupOptionsLoading] = useState(false);

    // Role module permission
    const [modulePermissions, setPermissonField] = useState();

    const { data, setData, post, processing, errors, reset } = useForm({});

    useEffect(() => {
        fetchModuleGroupfields();
        fetchRecord();


        //prefill the module_name in addfield form  
        props.module == 'Field' && props.mod != '' && setData('module_name', props.mod);

        props.module == 'Order' && props.OpportunityrecordId != '' && setData('opportunity', { 'value': props.OpportunityrecordId, 'label': props.opportunityname });


        //prefill relate field in subpanel
        if (props.parent_module == 'Organization' && props.module == 'Contact') {
            setData('organization_id', { 'value': props.parent_id, 'label': props.parent_name });
        }
        if (props.parent_module == 'Contact' && props.module == 'Opportunity') {
            setData('contact_id', { 'value': props.parent_id, 'label': props.parent_name });
        }
        if (props.parent_module == 'Contact' && props.module == 'Order') {
            setData('contact', { 'value': props.parent_id, 'label': props.parent_name });
        }
        if (props.module == "Api") {
            setData({ read_only: true, write_only: true });
        }
    }, [props]);

    useEffect(() => {
        if (props.module !== "Contact") {
            return;
        }

        if (Array.isArray(props.tagOptions) && props.tagOptions.length) {
            setTagOptions(props.tagOptions);
            setSetupOptionsLoaded(true);
            setSetupOptionsRequested(true);
        }

        if (Array.isArray(props.listOptions) && props.listOptions.length) {
            setCategoryOptions(props.listOptions);
            setSetupOptionsLoaded(true);
            setSetupOptionsRequested(true);
        }
    }, [props.module, props.tagOptions, props.listOptions]);

    useEffect(() => {
        if (
            props.module === "Contact" &&
            group === "Setup" &&
            !setupOptionsRequested &&
            !setupOptionsLoading
        ) {
            fetchTagListOptions();
        }
    }, [props.module, group, setupOptionsRequested, setupOptionsLoading]);

    function normalizeSelectionOptions(records) {
        if (!Array.isArray(records)) {
            return [];
        }

        return records
            .map((record) => {
                if (!record) {
                    return null;
                }

                if (typeof record === "string") {
                    const label = record.trim();
                    return label ? { value: label, label } : null;
                }

                if (typeof record === "object") {
                    const label = record.label ?? record.value ?? record.name ?? "";
                    const trimmedLabel =
                        typeof label === "string" ? label.trim() : "";

                    return trimmedLabel
                        ? {
                              value: trimmedLabel,
                              label: trimmedLabel,
                              ...(record.__isNew__ ? { __isNew__: true } : {}),
                          }
                        : null;
                }

                return null;
            })
            .filter(Boolean);
    }

    function isContactModalFieldHidden(fieldName) {
        return props.module === "Contact" && hiddenContactModalFields.has(fieldName);
    }

    function isFieldMandatory(field) {
        if (field?.is_mandatory === 1) {
            return true;
        }

        return props.module === "Contact" && field?.field_name === "first_name";
    }

    function handleSetupSelection(fieldName, value) {
        let newState = Object.assign({}, data);
        newState[fieldName] = value ?? [];
        setData(newState);
    }

    function fetchTagListOptions() {
        setSetupOptionsRequested(true);
        setSetupOptionsLoading(true);

        Axios.get(route("tag_list_options"))
            .then((response) => {
                if (response.data.status === true) {
                    setTagOptions(response.data.tagOptions ?? []);
                    setCategoryOptions(response.data.categoryOptions ?? []);
                    setSetupOptionsLoaded(true);
                }
            })
            .finally(() => {
                setSetupOptionsLoading(false);
            });
    }

    const relationSelectStyles = {
        control: (base, state) => ({
            ...base,
            minHeight: 44,
            backgroundColor: "#0F0B1A",
            borderColor: state.isFocused ? "#1C9AE1" : "rgba(255,255,255,0.2)",
            boxShadow: state.isFocused ? "0 0 0 2px rgba(28,154,225,0.18)" : "none",
            "&:hover": {
                borderColor: "#1C9AE1",
            },
        }),
        menu: (base) => ({
            ...base,
            backgroundColor: "#12041f",
            color: "#fff",
            zIndex: 30,
        }),
        menuPortal: (base) => ({
            ...base,
            zIndex: 40,
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isFocused ? "rgba(191,0,255,0.2)" : "#12041f",
            color: "#fff",
        }),
        singleValue: (base) => ({
            ...base,
            color: "#fff",
        }),
        input: (base) => ({
            ...base,
            color: "#fff",
        }),
        placeholder: (base) => ({
            ...base,
            color: "rgba(255,255,255,0.45)",
        }),
        multiValue: (base) => ({
            ...base,
            backgroundColor: "rgba(191,0,255,0.18)",
        }),
        multiValueLabel: (base) => ({
            ...base,
            color: "#fff",
        }),
        multiValueRemove: (base) => ({
            ...base,
            color: "#fff",
            ":hover": {
                backgroundColor: "rgba(191,0,255,0.32)",
                color: "#fff",
            },
        }),
        indicatorSeparator: (base) => ({
            ...base,
            backgroundColor: "rgba(255,255,255,0.15)",
        }),
        dropdownIndicator: (base) => ({
            ...base,
            color: "rgba(255,255,255,0.65)",
        }),
        clearIndicator: (base) => ({
            ...base,
            color: "rgba(255,255,255,0.65)",
        }),
    };
    const menuPortalTarget =
        typeof document !== "undefined" ? document.body : null;

    function fetchModuleGroupfields() {
        nProgress.start(0.5);
        nProgress.inc(0.2);

        let url = route('fetch_module_groupfields', { 'module': props.module });
        Axios.get(url).then((response) => {
            nProgress.done(true);
            if (response.data.status === true) {
                var fieldGroup = (typeof (response.data.fieldGroupLists) === 'object') ? Object.assign({}, response.data.fieldGroupLists) : response.data.fieldGroupLists;
                const groupedFields = { ...(response.data.groupFieldList ?? {}) };

                if (props.module === "Contact") {
                    if (Array.isArray(fieldGroup)) {
                        if (!fieldGroup.includes("Setup")) {
                            fieldGroup.push("Setup");
                        }
                    } else if (!Object.values(fieldGroup).includes("Setup")) {
                        fieldGroup.setup = "Setup";
                    }

                    groupedFields.Setup = groupedFields.Setup ?? [];
                }

                setFields(response.data.fields);
                setfieldGroupList(fieldGroup);
                setGroupfieldList(groupedFields);

                // Role permission
                setPermissonField((response.data.modulePermissions) ? response.data.modulePermissions : modulePermissions);

            }
            else {
                notie.alert({ type: 'error', text: response.data.message, time: 5 });
            }
        }).catch((error) => {
            nProgress.done(true);
            let error_message = 'Something went wrong';
            if (error.response) {
                error_message = error.response.data.message;
                if (error_message == undefined) {
                    error_message = error.response.statusText;
                }
            }
            else {
                error_message = error.message;
            }
            notie.alert({ type: 'error', text: error_message, time: 5 });
        });
    }

    function fetchRecord() {
        if (props.recordId) {
            nProgress.start(0.5);
            nProgress.inc(0.2);

            let endpoint_url = route('edit' + props.module, { 'id': props.recordId });

            Axios.get(endpoint_url).then((response) => {
                nProgress.done(true);
                if (response.data.status !== false) {
                    const record = {
                        ...response.data.record,
                        tags: normalizeSelectionOptions(response.data.record.tags),
                        categorys: normalizeSelectionOptions(response.data.record.categorys),
                    };

                    setData(record);
                    setTmpRecord(record);
                    setLineItems((response.data.lineItems) ? response.data.lineItems : props.lineItems);
                    setProductList((response.data.productList) ? response.data.productList : productList);

                    // Role Permissions                
                    setPermissonField((response.data.module_permissions) ? response.data.module_permissions : modulePermissions);
                    var data = record;
                    data['role_permission'] = response.data.role_permissions;

                    // Check Quick Reply
                    if (response.data.record) {
                        if (response.data.record.option_type && response.data.record.option_type == 'list_option') {
                            data['list_options'] = response.data.record.options['list_option'];
                            data['menu_items'] = response.data.record.options['menu_data'];
                        } else {
                            data['list_options'] = response.data.record.options;
                        }
                    }
                    setData(data);

                } else {
                    notie.alert({ type: 'error', text: (props.translator[response.data.message]), time: 5 });
                }
            }).catch((error) => {
                nProgress.done(true);
                let error_message = 'Something went wrong';
                if (error.response) {
                    error_message = error.response.data.message;
                    if (error_message == undefined) {
                        error_message = error.response.statusText;
                    }
                }
                else {
                    error_message = error.message;
                }

                notie.alert({ type: 'error', text: error_message, time: 5 });
            });
        }
    }

    function addSelectableField(name, groupFields) {
        var isAdded = false;
        (groupFieldList[name]).map((field, key) => {
            if (field.field_type == 'selectable') {
                isAdded = true;
            }
        })

        if (!isAdded) {
            (groupFieldList[name]).push(optionField);
            setOptions(data.options);
        }
    }

    const handleChange = (event) => {
        const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
        let field_name = event.target.name;
        if (event.target.name == 'field_type') {
            EventHandler(event);
        }
        DataHandler(field_name, value);
    }

    const EventHandler = (event) => {
        if (event.target.value == 'dropdown' || event.target.value == 'multiselect') {
            Object.entries(groupFieldList).map(([name, groupFields]) => {
                (groupFields).map((field, key) => {
                    if (field.field_type == 'selectable' && field.field_name == 'options') {
                        (groupFieldList[name]).pop(key);
                        setOptions(null);
                    }
                });
                (groupFieldList[name]).push(optionField);
            });
        } else {
            Object.entries(groupFieldList).map(([name, groupFields]) => {
                (groupFields).map((field) => {
                    if (field.field_type == 'selectable') {
                        (groupFieldList[name]).pop(key);
                        setOptions(null);
                    }
                });
            });
        }
    }

    function changePhoneNumber(value, name) {
        let newState = Object.assign({}, data);
        value = '+' + value;
        newState[name] = value;
        if (value && parsePhoneNumber(value)) {
            newState['country_code'] = parsePhoneNumber(value).countryCallingCode;
        }

        setData(newState);
    }

    function DataHandler(name, value) {
        let newState = Object.assign({}, data);
        let customfields = (data.custom) ? data.custom : {};
        Object.entries(fields).map(([key, field]) => {
            if (name == field.field_name && field.is_custom == 0) {
                newState[name] = value;
            }

            if (name == field.field_name && field.is_custom == 1) {
                customfields[name] = value;
                newState['custom'] = customfields;
            }
        });

        if (props.module == 'Contact' && name == 'phones' && data['phones']) {
            let flag = false;
            (data['phones']).map((number) => {
                if (number.phones && !flag) {
                    flag = true;
                    if (!props.recordId) {
                        newState['whatsapp_number'] = number.phones;
                    } else if (props.recordId && (!data['whatsapp_number'] || data['whatsapp_number'] == '+')) {
                        newState['whatsapp_number'] = number.phones;
                    } else if (props.recordId && data['whatsapp_number'] != (tmpRecord && tmpRecord['whatsapp_number'])) {
                        newState['whatsapp_number'] = number.phones;
                    }
                }
            })
            if (!flag && !props.recordId) {
                newState['whatsapp_number'] = '';
            }
        }

        if (props.module == 'Role' && name == 'role_permission') {
            newState[name] = value;
        }
        if (props.module == 'InteractiveMessage' && (name == 'list_options' || name == 'menu_items')) {
            newState[name] = value;
        }

        setData(newState);
    }

    // Change Date & Time Format
    function changeDateTime(name, event) {
        let dateTime = '';
        if (event) {
            var date = event.toISOString().substring(0, 10);
            var time = event.getHours() + ':' + String(event.getMinutes()).padStart(2, '0');
            dateTime = date + ' ' + time;
        }
        DataHandler(name, dateTime);
    }

    // Remove characters
    function changeNumber(name, event) {
        let result = event.target.value;

        if (result) {
            result = result.replace(/[^0-9\.]/g, '');
            if (result.split('.').length > 2) {
                result = result.replace(/\.+$/, "")
            }
        }
        DataHandler(name, result);
    }

    // Change Date format
    function changeDate(name, event) {
        let date = '';
        if (event) {
            date = event.getFullYear() + '-' + ('0' + (event.getMonth() + 1)).slice(-2) + '-' + ('0' + event.getDate()).slice(-2);
        }
        DataHandler(name, date);
    }

    // Change Time format
    function changeTime(name, event) {
        let time = '';
        if (event) {
            time = ('0' + event.getHours()).slice(-2) + ':' + ('0' + event.getMinutes()).slice(-2) + ':00';
        }
        DataHandler(name, time);
    }

    function handleRelateChange(value, field_name) {
        DataHandler(field_name, value);
    }

    function handleMultiSelectChange(event) {
        let field_name = event.target.name;

        var options = event.target.options;
        var values = [];
        for (var i = 0; i < options.length; i++) {
            if (options[i].selected) {
                values.push(options[i].value);
            }
        }

        DataHandler(field_name, values);
    }

    function fileHandler(event) {
        let field_name = event.target.name;
        let field_value = event.target.files[0];

        DataHandler(field_name, field_value);
    }

    function saveForm() {
        // Validate the data
        let is_validated = false;
        var pristine = new Pristine(document.getElementById(`form`), defaultConfig);
        is_validated = pristine.validate(
            document.querySelectorAll(
                'input[required], input[data-pristine-required="true"], input[data-pristine-required="required"]',
                'textarea[data-pristine-required="true"], textarea[data-pristine-required="required"]',
            )
        );

        if (!is_validated) {
            return false;
        }

        data['options'] = options;
        data['lineItems'] = (props.lineItems) ? props.lineItems : lineItems;

        // Set parent module detail
        data['parent_id'] = (props.parent_id) ? props.parent_id : '';
        data['parent_module'] = (props.parent_module) ? props.parent_module : '';

        Inertia.post(props.recordId ? route('update' + props.module, { id: props.recordId }) : route('store' + props.module), data, {
            onSuccess: (response) => {
                props.hideForm();
                if (props.is_chat) {
                    props.getUserContacts();
                }
                if (props.newcontact) {
                    props.addNewContact();
                }
            },
            onError: (errors) => {
                setErrors(errors)
            }
        });
    }

    return (
        <Transition appear show={show} as={Fragment}>
            <Dialog as="div" className="relative z-10" initialFocus={cancelButtonRef} onClose={() => { }}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-start justify-center p-4 text-center sm:items-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="flex h-[calc(100vh-2rem)] w-full max-w-4xl max-h-[720px] transform overflow-hidden rounded-[28px] shadow-[0_24px_70px_rgba(0,0,0,0.55)] text-left align-middle transition-all">
                                <div className="flex min-h-0 flex-1">

                                    {/* ── Left panel – dark with contact watermark ── */}
                                    <div className="relative w-2/6 min-h-0 bg-[#0a0012] pt-7 pr-4 pb-7 pl-0 text-white flex flex-col overflow-hidden">
                                        {/* Watermark contact icon */}
                                        <div className="pointer-events-none absolute bottom-0 left-0 right-0 flex items-end justify-center pb-4 opacity-[0.07] text-white">
                                            <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 220, height: 220 }}>
                                                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                                            </svg>
                                        </div>
                                        {/* Glow blob */}
                                        <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-violet-700/20 blur-3xl" />

                                        {/* Title */}
                                        <div className="relative z-10 mb-8 pl-5">
                                            <h1 className="text-3xl font-black uppercase tracking-wider text-white leading-tight">
                                                {getCreateTitle(props)}
                                            </h1>
                                        </div>

                                        {/* Navigation – flush to left edge */}
                                        <nav className="relative z-10 flex-1">
                                            <ul className="space-y-0.5">
                                                {fieldGroupList && Object.entries(fieldGroupList).map(([index, grouplist]) => (
                                                    <li key={index}>
                                                        <button
                                                            type="button"
                                                            onClick={() => setGroup(grouplist)}
                                                            className={classNames(
                                                                group == grouplist
                                                                    ? 'bg-violet-600/30 text-violet-200 border-l-2 border-violet-400'
                                                                    : 'text-white/50 hover:text-white/80 hover:bg-white/5 border-l-2 border-transparent',
                                                                'w-full text-left pl-4 pr-3 py-2.5 text-sm font-medium transition-all'
                                                            )}
                                                        >
                                                            {props.translator[grouplist] ?? grouplist}
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </nav>
                                    </div>

                                    {Object.keys(formErrors) > 0 ?
                                        <div className='p-4'>
                                            <ValidationErrors errors={formErrors} />
                                        </div>
                                        : ''}
                                    {/* ── Right panel – form ── */}
                                    <div className="relative flex w-4/6 min-h-0 flex-col bg-[rgba(20,8,30,0.98)] text-white">
                                        {/* Violet X close button – sits in its own header row */}
                                        <div className="flex-shrink-0 flex justify-end px-4 pt-4 pb-0">
                                            <button
                                                type="button"
                                                onClick={() => props.hideForm()}
                                                className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-white transition hover:bg-violet-500"
                                                aria-label="Close"
                                            >
                                                <XMarkIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <div className="px-6 pt-4 pb-4 flex-1 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                                            <div className="flex-1">
                                                <form id='form'>
                                                    <div className="space-y-2">
                                                        {groupFieldList && Object.entries(groupFieldList).map(([groupName, groupfields]) => (
                                                            <>
                                                                {group == groupName &&
                                                                    (groupfields).map((field) => {
                                                                        if (isContactModalFieldHidden(field.field_name)) {
                                                                            return null;
                                                                        }

                                                                        let element = '';
                                                                        let readOnly = true;
                                                                        const mandatory = isFieldMandatory(field);
                                                                        if (data && data.is_custom == '1' && data.module_name == 'Contact' || data.module_name == 'Opportunity' && data.field_type == 'dropdown') {
                                                                            addSelectableField(groupName, groupfields);
                                                                        }
                                                                        var field_value = data[field.field_name];
                                                                        if (data.custom) {
                                                                            const custom = data.custom;
                                                                            let custom_field = field.field_name;

                                                                            if (custom.hasOwnProperty(custom_field)) {
                                                                                field_value = custom[custom_field];
                                                                            }
                                                                        }
                                                                        if (field.readonly_on_edit == 'true' && data.id) {
                                                                            readOnly = false;
                                                                        }

                                                                        if (props.module == 'InteractiveMessage' && field.field_name == 'content' && data['option_type'] == 'list_option') {
                                                                            return "";
                                                                        }

                                                                        if (props.module == 'InteractiveMessage' && field.field_name == 'option_type' && data['id']) {
                                                                            readOnly = false;
                                                                        }

                                                                        switch (field.field_type) {
                                                                            case "text":
                                                                                element = <Input
                                                                                    type="text"
                                                                                    className={`mt-1 appearance-none block w-full px-3 py-2 border-0 bg-white/[0.06] rounded-xl text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-violet-500/40 sm:text-sm`}
                                                                                    id={field.field_name}
                                                                                    name={field.field_name}
                                                                                    value={field_value}
                                                                                    handleChange={handleChange}
                                                                                    required={mandatory}
                                                                                    readOnly={(readOnly) ? '' : 'disabled'}
                                                                                />;
                                                                                break;

                                                                            case "url":
                                                                                element = <Input
                                                                                    type="text"
                                                                                    className={`mt-1 appearance-none block w-full px-3 py-2 border-0 bg-white/[0.06] rounded-xl text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-violet-500/40 sm:text-sm`}
                                                                                    id={field.field_name}
                                                                                    name={field.field_name}
                                                                                    value={field_value}
                                                                                    handleChange={handleChange}
                                                                                    required={mandatory}
                                                                                    readOnly={(readOnly) ? '' : 'disabled'}
                                                                                />;
                                                                                break;

                                                                            case 'phone_number':
                                                                                element = <PhoneInput2
                                                                                    inputProps={{
                                                                                        name: 'field.field_name',
                                                                                        required: mandatory,
                                                                                        autoFocus: true
                                                                                    }}
                                                                                    containerStyle={{ marginTop: "15px" }}
                                                                                    searchclassName="search-class"
                                                                                    searchStyle={{ margin: "0", width: "97%", height: "30px" }}
                                                                                    enableSearchField
                                                                                    disableSearchIcon
                                                                                    placeholder={props.translator["Enter phone number"]}
                                                                                    value={field_value}
                                                                                    onChange={(value) => changePhoneNumber(value, field.field_name)}
                                                                                    required={mandatory}
                                                                                />

                                                                                break;
                                                                            case "amount":
                                                                                element = <div className="mt-1 relative rounded-md shadow-sm">
                                                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                                                        <span className="text-gray-500 sm:text-sm">$</span>
                                                                                    </div>

                                                                                    <Number
                                                                                        type="text"
                                                                                        className={`pl-6 mt-1 appearance-none block w-full pr-3 py-2 border-0 bg-white/[0.06] rounded-xl text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-violet-500/40 sm:text-sm`}
                                                                                        id={field.field_name}
                                                                                        name={field.field_name}
                                                                                        value={field_value}
                                                                                        required={mandatory}
                                                                                        handleChange={(event) => changeNumber(field.field_name, event)}
                                                                                    />
                                                                                </div>
                                                                                break;
                                                                            case "textarea":
                                                                                element = <TextArea
                                                                                    id={field.field_name}
                                                                                    name={field.field_name}
                                                                                    required={mandatory}
                                                                                    rows="2"
                                                                                    className={`mt-1 block w-full border-0 bg-white/[0.06] rounded-xl text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-violet-500/40 sm:text-sm`}
                                                                                    value={field_value}
                                                                                    handleChange={handleChange}
                                                                                />
                                                                                break;
                                                                            case 'dropdown':
                                                                                element = <Dropdown
                                                                                    id={field.field_name}
                                                                                    name={field.field_name}
                                                                                    options={field.options ? field.options : {}}
                                                                                    handleChange={handleChange}
                                                                                    emptyOption={field.field_name == 'field_group' ? props.translator['General'] : props.translator['Select']}
                                                                                    value={field_value}
                                                                                    required={mandatory}
                                                                                    readOnly={(readOnly) ? '' : 'disabled'}
                                                                                />
                                                                                break;
                                                                            case 'selectable':
                                                                                element = <Creatable
                                                                                    isMulti
                                                                                    value={options}
                                                                                    defaultValue={options}
                                                                                    onChange={setOptions}
                                                                                />
                                                                                break;
                                                                            case 'checkbox':
                                                                                element = <Checkbox
                                                                                    id={field.field_name}
                                                                                    name={field.field_name}
                                                                                    value={field_value}
                                                                                    handleChange={handleChange}
                                                                                />
                                                                                break;
                                                                            case 'number':
                                                                                element = <Number
                                                                                    type="text"
                                                                                    className={`mt-1 appearance-none block w-full px-3 py-2 border-0 bg-white/[0.06] rounded-xl text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-violet-500/40 sm:text-sm`}
                                                                                    id={field.field_name}
                                                                                    name={field.field_name}
                                                                                    value={field_value}
                                                                                    handleChange={(event) => changeNumber(field.field_name, event)}
                                                                                />
                                                                                break;
                                                                            case 'datetime':
                                                                                element = <DateTime
                                                                                    id={field.field_name}
                                                                                    name={field.field_name}
                                                                                    value={field_value}
                                                                                    handleChange={(event) => changeDateTime(field.field_name, event)}
                                                                                />
                                                                                break;
                                                                            case 'date':
                                                                                element = <Date
                                                                                    id={field.field_name}
                                                                                    name={field.field_name}
                                                                                    value={field_value}
                                                                                    handleChange={(event) => changeDate(field.field_name, event)}
                                                                                />
                                                                                break;
                                                                            case 'time':
                                                                                element = <Time
                                                                                    id={field.field_name}
                                                                                    name={field.field_name}
                                                                                    value={field_value}
                                                                                    handleChange={(event) => changeTime(field.field_name, event)}
                                                                                />
                                                                                break;
                                                                            case 'multiselect':
                                                                                element = <MultiSelect
                                                                                    id={field.field_name}
                                                                                    name={field.field_name}
                                                                                    options={field.options ? field.options : (props.module == 'Group' && (props.user_list) ? props.user_list : {})}
                                                                                    handleChange={handleMultiSelectChange}
                                                                                    emptyOption={field.field_name == 'field_group' ? 'General' : 'Select'}
                                                                                    value={field_value}
                                                                                    required={mandatory}
                                                                                    readOnly={(readOnly) ? '' : 'disabled'}
                                                                                />
                                                                                break;
                                                                            case 'relate':
                                                                                element = <Relate
                                                                                    id={field.field_name}
                                                                                    name={field.field_name}
                                                                                    module={field.options.module}
                                                                                    handleChange={handleRelateChange}
                                                                                    value={field_value}
                                                                                    required={mandatory}
                                                                                    readOnly={(readOnly) ? '' : 'disabled'}
                                                                                />
                                                                                break;
                                                                            case 'email':
                                                                                element = <Input
                                                                                    type="email"
                                                                                    className={`mt-1 appearance-none block w-full px-3 py-2 border-0 bg-white/[0.06] rounded-xl text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-violet-500/40 sm:text-sm`}
                                                                                    id={field.field_name}
                                                                                    name={field.field_name}
                                                                                    value={field_value}
                                                                                    handleChange={handleChange}
                                                                                    required={mandatory}
                                                                                    readOnly={(readOnly) ? '' : 'disabled'}
                                                                                />;
                                                                                break;
                                                                            case 'phones':
                                                                                element = <MultiPhoneNumber
                                                                                    type="text"
                                                                                    id={field.field_name}
                                                                                    name={field.field_name}
                                                                                    value={field_value}
                                                                                    DataHandler={DataHandler}
                                                                                    buttonTitle={'Phone Number'}
                                                                                    {...props}
                                                                                />;
                                                                                break;
                                                                            case 'emails':
                                                                                element = <MultiContainer
                                                                                    type="text"
                                                                                    id={field.field_name}
                                                                                    name={field.field_name}
                                                                                    value={field_value}
                                                                                    DataHandler={DataHandler}
                                                                                    buttonTitle={'Email'}
                                                                                    translator={props.translator}
                                                                                    {...props}
                                                                                />;
                                                                                break;
                                                                            case "file":
                                                                                element = <Input
                                                                                    type="file"
                                                                                    className={`mt-1 appearance-none block w-full px-3 py-2 border-0 bg-white/[0.06] rounded-xl text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-violet-500/40 sm:text-sm`}
                                                                                    id={field.field_name}
                                                                                    name={field.field_name}
                                                                                    handleChange={fileHandler}
                                                                                    required={mandatory}
                                                                                />;
                                                                                break;
                                                                            default:
                                                                                element = <Input
                                                                                    type="text"
                                                                                    className={`mt-1 appearance-none block w-full px-3 py-2 border-0 bg-white/[0.06] rounded-xl text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-violet-500/40 sm:text-sm`}
                                                                                    id={field.field_name}
                                                                                    name={field.field_name}
                                                                                    value={field_value}
                                                                                    handleChange={handleChange}
                                                                                    required={mandatory}
                                                                                    readOnly={(readOnly) ? '' : 'disabled'}
                                                                                />;
                                                                                break;
                                                                        }

                                                                        return (
                                                                            <div className="sm:grid sm:grid-cols-12 sm:gap-4" key={field.field_name}>
                                                                                <label htmlFor={field.field_name} className="block col-span-4 text-sm font-medium text-white sm:mt-px sm:pt-2">
                                                                                    {props.translator[field.field_label]}  {mandatory ? <span className='text-red-600'> *</span> : ''}
                                                                                </label>
                                                                                <div className="mt-1 col-span-8 !sm:mt-0">
                                                                                    {element}
                                                                                </div>
                                                                                <InputError message={formErrors[field.field_name]} />
                                                                            </div>
                                                                        );
                                                                    })
                                                                }
                                                            </>
                                                        ))}
                                                        {props.module == 'Contact' && group == 'Setup' ? (
                                                            <>
                                                                {setupOptionsLoading ? (
                                                                    <div className="sm:grid sm:grid-cols-12 sm:gap-4">
                                                                        <div className="col-span-4"></div>
                                                                        <div className="mt-1 col-span-8 text-sm text-white/60 !sm:mt-0">
                                                                            {props.translator["Loading..."] ?? "Loading..."}
                                                                        </div>
                                                                    </div>
                                                                ) : null}
                                                                <div className="sm:grid sm:grid-cols-12 sm:gap-4">
                                                                    <label className="block col-span-4 text-sm font-medium text-white sm:mt-px sm:pt-2">
                                                                        {props.translator["Tag"] ?? "Tag"}
                                                                    </label>
                                                                    <div className="mt-1 col-span-8 !sm:mt-0">
                                                                        <Creatable
                                                                            isMulti
                                                                            isDisabled={setupOptionsLoading}
                                                                            value={data.tags ?? []}
                                                                            onChange={(value) => handleSetupSelection("tags", value)}
                                                                            options={tagOptions}
                                                                            styles={relationSelectStyles}
                                                                            menuPortalTarget={menuPortalTarget}
                                                                            placeholder={
                                                                                setupOptionsLoading
                                                                                    ? props.translator["Loading..."] ?? "Loading..."
                                                                                    : props.translator["Select"] ?? "Select"
                                                                            }
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="sm:grid sm:grid-cols-12 sm:gap-4">
                                                                    <label className="block col-span-4 text-sm font-medium text-white sm:mt-px sm:pt-2">
                                                                        {props.translator["List"] ?? "List"}
                                                                    </label>
                                                                    <div className="mt-1 col-span-8 !sm:mt-0">
                                                                        <Creatable
                                                                            isMulti
                                                                            isDisabled={setupOptionsLoading}
                                                                            value={data.categorys ?? []}
                                                                            onChange={(value) => handleSetupSelection("categorys", value)}
                                                                            options={categoryOptions}
                                                                            styles={relationSelectStyles}
                                                                            menuPortalTarget={menuPortalTarget}
                                                                            placeholder={
                                                                                setupOptionsLoading
                                                                                    ? props.translator["Loading..."] ?? "Loading..."
                                                                                    : props.translator["Select"] ?? "Select"
                                                                            }
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </>
                                                        ) : null}
                                                        {group == 'Line Items' && props.module == 'Order' ?
                                                            <LineItem
                                                                productList={productList}
                                                                lineItems={(props.lineItems) ? props.lineItems : lineItems}
                                                                totalPrice={totalPrice}
                                                                setLineItems={setLineItems}
                                                                setTotalPrice={setTotalPrice}
                                                                {...props}
                                                            />
                                                            : ''}

                                                        {/* Role permission */}
                                                        {(props.module == 'Role' && group == 'Permissions' && modulePermissions) &&
                                                            <ModulePermission
                                                                modulePermissions={modulePermissions}
                                                                DataHandler={DataHandler}
                                                                data={data}
                                                                readOnly={true}
                                                            />
                                                        }

                                                        {/* Interactive Messages */}
                                                        {(props.module == 'InteractiveMessage' && group == 'Buttons') &&
                                                            <OptionButtons
                                                                DataHandler={DataHandler}
                                                                data={data}
                                                                readOnly={true}
                                                            />
                                                        }

                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-end gap-3 border-t border-white/[0.06] bg-[rgba(20,8,30,0.98)] px-6 py-4">
                                            <button
                                                type="button"
                                                ref={cancelButtonRef}
                                                onClick={() => props.hideForm()}
                                                className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
                                            >
                                                {props.translator['Cancel']}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => saveForm()}
                                                className="inline-flex items-center rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-2.5 text-sm font-semibold text-white shadow-[0_4px_20px_rgba(124,58,237,0.4)] transition hover:opacity-90"
                                            >
                                                {getSubmitLabel(props)}
                                            </button>
                                        </div>

                                    </div>

                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}












