import { Fragment, useEffect, useRef, useState } from 'react'
import { Dialog, Transition } from "@headlessui/react";
import { BsPlusLg } from "react-icons/bs";
import { useForm } from '@inertiajs/inertia-react';
import Axios from "axios";

import notie from 'notie';
import nProgress from 'nprogress';
import Dropdown from './Dropdown';
import TextArea from './TextArea';
import Input from './Input';
import Pristine from "pristinejs";
import { Inertia } from '@inertiajs/inertia'
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
    'is_custom':1
}

function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
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

    // Role module permission
    const [modulePermissions , setPermissonField] = useState();

    const { data, setData, post, processing, errors, reset } = useForm({});

    useEffect( () => {
        fetchModuleGroupfields();
        fetchRecord();        
        
        
        //prefill the module_name in addfield form  
        props.module=='Field' && props.mod!='' && setData('module_name',props.mod);
       
        props.module=='Order' && props.OpportunityrecordId!='' && setData('opportunity',{'value':props.OpportunityrecordId,'label':props.opportunityname});
       
       
        //prefill relate field in subpanel
        if(props.parent_module == 'Organization' && props.module == 'Contact')
        {                        
            setData('organization_id',{'value':props.parent_id,'label':props.parent_name});
        }       
        if(props.parent_module == 'Contact' && props.module == 'Opportunity')
        {                        
            setData('contact_id',{'value':props.parent_id,'label':props.parent_name});
        }     
        if(props.parent_module == 'Contact' && props.module == 'Order')
        {                        
            setData('contact',{'value':props.parent_id,'label':props.parent_name});
        } 
        if(props.module == "Api") {
            setData({ read_only: true, write_only: true});
        }
    },[props]);

    function fetchModuleGroupfields() {
        nProgress.start(0.5);
        nProgress.inc(0.2);

        let url = route('fetch_module_groupfields', {'module' : props.module});
        Axios.get(url).then((response) => {
            nProgress.done(true);
            if(response.data.status === true) {
                var fieldGroup = (typeof (response.data.fieldGroupLists) === 'object') ? Object.assign({}, response.data.fieldGroupLists) : response.data.fieldGroupLists;
                setFields(response.data.fields);
                setfieldGroupList(fieldGroup);
                setGroupfieldList(response.data.groupFieldList);

                // Role permission
                setPermissonField( (response.data.modulePermissions)? response.data.modulePermissions : modulePermissions );

            }
            else {
                notie.alert({type: 'error', text: response.data.message, time: 5});
            }
        }).catch((error) => {
            nProgress.done(true);
            let error_message = 'Something went wrong';
            if(error.response) {
                error_message = error.response.data.message;
                if(error_message == undefined) {
                    error_message = error.response.statusText;
                }
            }
            else {
                error_message = error.message;
            }
            notie.alert({type: 'error', text: error_message, time: 5});
        });
    }

    function fetchRecord() {
        if(props.recordId) {
            nProgress.start(0.5);
            nProgress.inc(0.2);
    
            let endpoint_url = route('edit'+ props.module , {'id': props.recordId});
            
            Axios.get(endpoint_url).then((response) => {
                nProgress.done(true);
                if(response.data.status !== false) {
                    setData(response.data.record);
                    setTmpRecord(response.data.record);
                    setLineItems((response.data.lineItems)?response.data.lineItems:props.lineItems);
                    setProductList((response.data.productList)?response.data.productList :productList);
                
                    // Role Permissions                
                    setPermissonField( (response.data.module_permissions)? response.data.module_permissions : modulePermissions );
                    var data = response.data.record;
                    data['role_permission'] = response.data.role_permissions;

                    // Check Quick Reply
                    if(response.data.record) {
                        if( response.data.record.option_type && response.data.record.option_type  == 'list_option' ){
                            data['list_options'] = response.data.record.options['list_option'];
                            data['menu_items'] = response.data.record.options['menu_data'];
                        } else {
                            data['list_options'] = response.data.record.options;
                        }
                    }
                    setData(data);

                } else {
                    notie.alert({type: 'error', text: (props.translator[response.data.message]), time: 5});
                }
            }).catch((error) => {
                nProgress.done(true);
                let error_message = 'Something went wrong';
                if(error.response) {
                    error_message = error.response.data.message;
                    if(error_message == undefined) {
                        error_message = error.response.statusText;
                    }
                }
                else {
                    error_message = error.message;
                }
    
                notie.alert({type: 'error', text: error_message, time: 5});
            });
        }
    }

    function addSelectableField(name, groupFields)
    {
        var isAdded = false;
        (groupFieldList[name]).map( (field, key) => {
            if(field.field_type == 'selectable'){
                isAdded = true;
            }
        })

        if(!isAdded) {
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
        DataHandler(field_name,value); 
    }

    const EventHandler = (event) => { 
        if (event.target.value == 'dropdown' || event.target.value == 'multiselect') {
            Object.entries(groupFieldList).map(([name, groupFields]) => {
                (groupFields).map( (field, key) => {
                    if(field.field_type == 'selectable' && field.field_name == 'options'){
                        (groupFieldList[name]).pop(key);
                        setOptions(null);
                    }
                });
                (groupFieldList[name]).push(optionField);
            });
        } else {
            Object.entries(groupFieldList).map(([name, groupFields]) => {
                (groupFields).map( (field) => {
                    if (field.field_type == 'selectable') { 
                        (groupFieldList[name]).pop(key); 
                        setOptions(null);
                    }
                });
            });
        }
    }

    function changePhoneNumber(value , name){
        let newState = Object.assign({}, data);
        value = '+'+value;
        newState[name] = value;
        if(value && parsePhoneNumber(value) ){
            newState['country_code'] = parsePhoneNumber(value).countryCallingCode;
        }

        setData(newState);
    }

    function DataHandler(name, value) 
    {
        let newState = Object.assign({}, data); 
        let customfields = (data.custom) ? data.custom : {};
        Object.entries(fields).map(([key, field]) => {
            if(name == field.field_name && field.is_custom == 0) {
                newState[name] = value;
            }

            if(name == field.field_name && field.is_custom == 1) {
                customfields[name] = value; 
                newState['custom'] = customfields;
            }
        });

        if(props.module == 'Contact' && name == 'phones' && data['phones']) {
            let flag = false;
            (data['phones']).map( (number) => {
                if(number.phones && !flag) {
                    flag = true;  
                    if(!props.recordId) {
                        newState['whatsapp_number'] = number.phones;
                    } else if(props.recordId && (!data['whatsapp_number'] || data['whatsapp_number'] == '+')) {
                        newState['whatsapp_number'] = number.phones;
                    } else if(props.recordId && data['whatsapp_number'] != (tmpRecord && tmpRecord['whatsapp_number'])) {
                        newState['whatsapp_number'] = number.phones;
                    }
                }
            })
            if(!flag && !props.recordId) {
                newState['whatsapp_number'] = '';
            }
        }

        if(props.module == 'Role' && name == 'role_permission') {
            newState[name] = value;
        }
        if(props.module == 'InteractiveMessage' && (name == 'list_options' || name == 'menu_items')) {
            newState[name] = value;
        }
        
        setData(newState);
    }

    // Change Date & Time Format
    function changeDateTime(name,event) {
        let dateTime = '';
        if(event){
            var date = event.toISOString().substring(0, 10);
            var time = event.getHours() + ':' + String(event.getMinutes()).padStart(2, '0');
            dateTime = date + ' ' + time;
        }
        DataHandler(name,dateTime);
    }

     // Remove characters
     function changeNumber(name,event) {
        let result = event.target.value;

        if(result){
            result = result.replace(/[^0-9\.]/g,'');
            if(result.split('.').length>2){
                result = result.replace(/\.+$/,"")
            } 
        }
        DataHandler(name,result);
    }

    // Change Date format
    function changeDate(name, event) {
        let date = '';
        if(event){
            date = event.getFullYear() + '-' + ('0' + (event.getMonth() + 1)).slice(-2) + '-' + ('0' + event.getDate()).slice(-2);
        }
        DataHandler(name, date);
    }

    // Change Time format
    function changeTime(name, event) {
        let time = '';
        if(event){
            time = ('0' + event.getHours()).slice(-2) + ':' + ('0' + event.getMinutes()).slice(-2) + ':00';
        }
        DataHandler(name, time);
    }

    function handleRelateChange(value, field_name) {
        DataHandler(field_name, value);
    }

    function handleMultiSelectChange(event) 
    {
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

    function saveForm()
    {    
        // Validate the data
        let is_validated = false;
        var pristine = new Pristine(document.getElementById(`form`), defaultConfig);
        is_validated = pristine.validate(
            document.querySelectorAll(
                'input[required], input[data-pristine-required="true"], input[data-pristine-required="required"]',
                'textarea[data-pristine-required="true"], textarea[data-pristine-required="required"]',
            )
        );

        if(!is_validated) {
            return false;
        }
        
        data['options'] = options;
        data['lineItems'] = (props.lineItems)? props.lineItems:lineItems;

        // Set parent module detail
        data['parent_id'] = (props.parent_id) ? props.parent_id : '';
        data['parent_module'] = (props.parent_module) ? props.parent_module : '';

        Inertia.post(props.recordId ? route('update' + props.module, {id: props.recordId}) : route('store' + props.module), data, {
            onSuccess: (response) => {
                props.hideForm();
                if(props.is_chat){
                    props.getUserContacts();
                }
                if(props.newcontact){
                    props.addNewContact();
                }
            },
            onError: (errors) => {
                setErrors(errors)
            }
        });
    }

    return(
        <Transition appear show={show} as={Fragment}>
            <Dialog as="div" className="relative z-10" initialFocus={cancelButtonRef} onClose={() => {}}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-25" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-4xl max-h-[640px] transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                                <div className="flex min-h-[300px]">
                                    <div className="w-2/6 bg-[#3F3F3F] text-white flex flex-col gap-4 items-center p-6 overflow-y-auto max-h-[640px]">
                                        <div className="text-xl font-semibold">
                                            {props.translator['Add']} {props.module}
                                        </div>
                                        {/* <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-[#D4D4D4] flex justify-center items-center">
                                                <svg
                                                    width={22}
                                                    height={22}
                                                    viewBox="0 0 22 22"
                                                    fill="none"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        opacity="0.2"
                                                        d="M11.2548 13.75C8.35534 13.75 6.00484 11.2876 6.00484 8.25C6.00484 5.21243 8.35534 2.75 11.2548 2.75C14.1543 2.75 16.5048 5.21243 16.5048 8.25C16.5048 11.2876 14.1543 13.75 11.2548 13.75Z"
                                                        fill="#FBFBFB"
                                                    />
                                                    <path
                                                        d="M2.73179 18.2192C3.9563 16.0094 5.91632 14.3508 8.23609 13.5614C7.12417 12.8687 6.26009 11.8127 5.7766 10.5557C5.2931 9.29865 5.21694 7.91006 5.5598 6.60327C5.90266 5.29647 6.64559 4.14375 7.67445 3.32219C8.7033 2.50062 9.96118 2.05566 11.2548 2.05566C12.5485 2.05566 13.8064 2.50062 14.8352 3.32219C15.8641 4.14375 16.607 5.29647 16.9499 6.60327C17.2927 7.91006 17.2166 9.29865 16.7331 10.5557C16.2496 11.8127 15.3855 12.8687 14.2736 13.5614C16.5934 14.3508 18.5534 16.0094 19.7779 18.2192C19.8292 18.2973 19.8646 18.3856 19.8818 18.4787C19.899 18.5718 19.8977 18.6676 19.8779 18.7601C19.858 18.8526 19.8201 18.9398 19.7666 19.0162C19.713 19.0926 19.645 19.1566 19.5667 19.2042C19.4884 19.2517 19.4016 19.2818 19.3116 19.2925C19.2217 19.3032 19.1307 19.2943 19.0442 19.2664C18.9577 19.2384 18.8777 19.1921 18.8091 19.1302C18.7406 19.0683 18.685 18.9922 18.6459 18.9067C17.8958 17.5489 16.818 16.4216 15.5208 15.6379C14.2235 14.8541 12.7523 14.4416 11.2548 14.4416C9.75733 14.4416 8.28615 14.8541 6.98889 15.6379C5.69163 16.4216 4.6139 17.5489 3.86382 18.9067C3.82468 18.9922 3.76909 19.0683 3.70054 19.1302C3.63199 19.1921 3.55196 19.2384 3.46548 19.2664C3.37901 19.2943 3.28795 19.3032 3.19803 19.2925C3.10811 19.2818 3.02127 19.2517 2.94298 19.2042C2.86469 19.1566 2.79663 19.0926 2.74308 19.0162C2.68953 18.9398 2.65165 18.8526 2.63182 18.7601C2.61198 18.6676 2.61063 18.5718 2.62783 18.4787C2.64503 18.3856 2.68043 18.2973 2.73179 18.2192ZM15.8486 8.25047C15.8486 7.29865 15.5792 6.3682 15.0744 5.57679C14.5696 4.78538 13.8522 4.16855 13.0128 3.8043C12.1734 3.44006 11.2497 3.34475 10.3586 3.53044C9.46754 3.71614 8.64901 4.17448 8.00657 4.84752C7.36412 5.52056 6.9266 6.37807 6.74935 7.3116C6.5721 8.24513 6.66307 9.21277 7.01077 10.0921C7.35845 10.9715 7.94725 11.7231 8.70269 12.2519C9.45812 12.7807 10.3463 13.063 11.2548 13.063C12.4732 13.063 13.6416 12.5559 14.5031 11.6534C15.3646 10.7509 15.8486 9.52683 15.8486 8.25047Z"
                                                        fill="#7666B4"
                                                    />
                                                </svg>
                                            </div>
                                            <div className="flex text-white gap-1.5 items-center text-sm">
                                                <BsPlusLg/>
                                                Add photo
                                            </div>                                                
                                        </div> */}
                                        <ul className="divide-y w-full pl-0">
                                         {fieldGroupList && Object.entries(fieldGroupList).map( ([index, grouplist]) => (
                                            <li key={index} className={classNames(group == grouplist ? 'text-[#AA94FF]' : 'text-white', 'flex gap-2 items-center w-full !p-3 cursor-pointer')} onClick={() => setGroup(grouplist)}>
                                              <div className="w-3 h-3 bg-white rounded-full"></div>
                                              {props.translator[grouplist]}
                                            </li>
                                          ))}
                                        </ul>
                                    </div>

                                    {Object.keys(formErrors) > 0 ?
                                        <div className='p-4'>
                                            <ValidationErrors errors={formErrors} />
                                        </div>
                                    : ''}
                                    <div className='w-4/6'>
                                    <div className=" !p-6 flex flex-col overflow-y-auto !pb-8 h-[576px]">
                                        <div className="flex-1 ">
                                            <form id='form'>
                                                <div className="space-y-2">
                                                    {groupFieldList && Object.entries(groupFieldList).map(([groupName, groupfields]) => (
                                                        <>
                                                        {group == groupName &&
                                                            (groupfields).map( (field) => {
                                                                let element = ''; 
                                                                let readOnly = true;
                                                                if(data && data.is_custom == '1' && data.module_name == 'Contact' || data.module_name == 'Opportunity'  && data.field_type == 'dropdown'){
                                                                    addSelectableField(groupName, groupfields);
                                                                }
                                                                var field_value = data[field.field_name];
                                                                if(data.custom){
                                                                    const custom = data.custom;
                                                                    let custom_field = field.field_name;

                                                                    if(custom.hasOwnProperty(custom_field)){
                                                                        field_value  = custom[custom_field];
                                                                    }
                                                                }
                                                                if(field.readonly_on_edit == 'true' && data.id){
                                                                    readOnly = false;
                                                                }

                                                                if( props.module == 'InteractiveMessage' && field.field_name == 'content' && data['option_type'] == 'list_option' ) {
                                                                    return "";
                                                                }

                                                                if( props.module == 'InteractiveMessage' && field.field_name == 'option_type' && data['id'] ) {
                                                                    readOnly = false;
                                                                }

                                                                switch (field.field_type) {
                                                                    case "text":
                                                                        element = <Input
                                                                            type="text"
                                                                            className={`mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-skin-primary focus:border-skin-primary sm:text-sm`}
                                                                            id={field.field_name}
                                                                            name={field.field_name}
                                                                            value={field_value}
                                                                            handleChange={handleChange}
                                                                            required={field.is_mandatory === 1 ? true : false}
                                                                            readOnly={(readOnly) ? '' : 'disabled'}
                                                                        />;
                                                                        break;

                                                                        case "url":
                                                                            element = <Input
                                                                                type="text"
                                                                                className={`mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-skin-primary focus:border-skin-primary sm:text-sm`}
                                                                                id={field.field_name}
                                                                                name={field.field_name}
                                                                                value={field_value}
                                                                                handleChange={handleChange}
                                                                                required={field.is_mandatory === 1 ? true : false}
                                                                                readOnly={(readOnly) ? '' : 'disabled'}
                                                                            />;
                                                                            break;

                                                                    case 'phone_number':
                                                                        element = <PhoneInput2
                                                                        inputProps={{
                                                                            name: 'field.field_name',
                                                                            required: field.is_mandatory === 1 ? true : false,
                                                                            autoFocus: true
                                                                        }}
                                                                        containerStyle={{ marginTop: "15px" }}
                                                                        searchClass="search-class"
                                                                        searchStyle={{ margin: "0", width: "97%", height: "30px" }}
                                                                        enableSearchField
                                                                        disableSearchIcon
                                                                        placeholder={props.translator["Enter phone number"]}
                                                                        value={field_value} 
                                                                        onChange={(value) => changePhoneNumber(value,field.field_name)}
                                                                        required={field.is_mandatory === 1 ? true : false}
                                                                    />
                                                        
                                                                        break;
                                                                    case "amount":
                                                                        element = <div className="mt-1 relative rounded-md shadow-sm">
                                                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                                                <span className="text-gray-500 sm:text-sm">$</span>
                                                                            </div>
                                                                        
                                                                            <Number 
                                                                                type="text"
                                                                                className={`pl-6 mt-1 appearance-none block w-full pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-skin-primary focus:border-skin-primary sm:text-sm`}
                                                                                id={field.field_name}
                                                                                name={field.field_name}
                                                                                value={field_value}
                                                                                required={field.is_mandatory === 1 ? true : false}
                                                                                handleChange={(event) => changeNumber(field.field_name,event)}
                                                                            />
                                                                        </div>
                                                                        break;
                                                                    case "textarea":
                                                                        element = <TextArea
                                                                            id={field.field_name}
                                                                            name={field.field_name}
                                                                            required={field.is_mandatory === 1 ? true : false}
                                                                            rows="2"
                                                                            className={`mt-1 max-w-lg shadow-sm block w-full focus:ring-skin-primary focus:border-skin-primary sm:text-sm border border-gray-300 rounded-md`}
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
                                                                            required={field.is_mandatory === 1 ? true : false}
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
                                                                        className={`mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-skin-primary focus:border-skin-primary sm:text-sm`}
                                                                        id={field.field_name}
                                                                        name={field.field_name}
                                                                        value={field_value}
                                                                        handleChange={(event) => changeNumber(field.field_name,event)}
                                                                        />
                                                                        break;
                                                                    case 'datetime':
                                                                        element = <DateTime 
                                                                        id={field.field_name}
                                                                        name={field.field_name}
                                                                        value={field_value}
                                                                        handleChange={(event) => changeDateTime(field.field_name,event)}
                                                                        />
                                                                        break;
                                                                    case 'date':
                                                                        element = <Date 
                                                                        id={field.field_name}
                                                                        name={field.field_name}
                                                                        value={field_value}
                                                                        handleChange={(event) => changeDate(field.field_name,event)}
                                                                        />
                                                                        break; 
                                                                    case 'time':
                                                                        element = <Time 
                                                                        id={field.field_name}
                                                                        name={field.field_name}
                                                                        value={field_value}
                                                                        handleChange={(event) => changeTime(field.field_name,event)}
                                                                        />
                                                                        break; 
                                                                    case 'multiselect':
                                                                        element = <MultiSelect
                                                                            id={field.field_name}
                                                                            name={field.field_name}
                                                                            options={field.options ? field.options : (props.module == 'Group' && (props.user_list) ? props.user_list:{})}
                                                                            handleChange={handleMultiSelectChange}
                                                                            emptyOption={field.field_name == 'field_group' ? 'General' : 'Select'}
                                                                            value={field_value}
                                                                            required={field.is_mandatory === 1 ? true : false}
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
                                                                                required={field.is_mandatory === 1 ? true : false}
                                                                                readOnly={(readOnly) ? '' : 'disabled'}
                                                                            />                                                    
                                                                        break;
                                                                    case 'email':
                                                                            element = <Input 
                                                                                type="email" 
                                                                                className={`mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-skin-primary focus:border-skin-primary sm:text-sm`}
                                                                                id={field.field_name}
                                                                                name={field.field_name}
                                                                                value={field_value} 
                                                                                handleChange={handleChange}
                                                                                required={field.is_mandatory === 1 ? true : false}
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
                                                                            className={`mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-skin-primary focus:border-skin-primary sm:text-sm`}
                                                                            id={field.field_name}
                                                                            name={field.field_name}
                                                                            handleChange={fileHandler}
                                                                            required={field.is_mandatory === 1 ? true : false}
                                                                        />;
                                                                        break;                                                            
                                                                    default:
                                                                        element = <Input 
                                                                            type="text" 
                                                                            className={`mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-skin-primary focus:border-skin-primary sm:text-sm`}
                                                                            id={field.field_name}
                                                                            name={field.field_name}
                                                                            value={field_value} 
                                                                            handleChange={handleChange}
                                                                            required={field.is_mandatory === 1 ? true : false}
                                                                            readOnly={(readOnly) ? '' : 'disabled'}
                                                                        />;
                                                                        break;
                                                                }

                                                                return(
                                                                    <div className="sm:grid sm:grid-cols-12 sm:gap-4">
                                                                        <label htmlFor={field.field_name} className="block col-span-4 text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                                                                            {props.translator[field.field_label]}  {field.is_mandatory === 1 ? <span className='text-red-600'> *</span> : ''}
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
                                                    {group == 'Line Items' && props.module == 'Order' ? 
                                                        <LineItem 
                                                            productList={productList}
                                                            lineItems={(props.lineItems)? props.lineItems:lineItems}
                                                            totalPrice={totalPrice}
                                                            setLineItems={setLineItems}
                                                            setTotalPrice={setTotalPrice}
                                                            {...props}
                                                        />
                                                    :''}

                                                    {/* Role permission */}
                                                    {(props.module == 'Role' && group == 'Permissions'  && modulePermissions) &&
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
                                        <div className="h-16 flex items-center justify-between mt-3 absolute w-4/6 bottom-0 px-3">
                                            <button 
                                                type="button" 
                                                class="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                                onClick={() => props.hideForm()}
                                                ref={cancelButtonRef}
                                            >
                                                {props.translator['Cancel']}
                                            </button>
                                            <button 
                                                type="button" 
                                                class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                                                onClick={() => saveForm()}
                                            >
                                              {props.recordId ? <>{props.translator['Update']} {props.translator[props.module]}</> : <>{props.translator['Create']} {props.translator[props.module]}</> }
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