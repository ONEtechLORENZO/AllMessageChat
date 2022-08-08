import { Fragment, useEffect, useRef, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import Axios from "axios";
import notie from 'notie';
import nProgress, { settings } from 'nprogress';
import Dropdown from './Dropdown';
import TextArea from './TextArea';
import Input from './Input';
import Pristine from "pristinejs";
import { Inertia } from '@inertiajs/inertia'
import { useForm } from '@inertiajs/inertia-react';
import ValidationErrors from '@/Components/ValidationErrors';
import Checkbox from '../Checkbox';
import Creatable from 'react-select/creatable';
import PhoneInput, {parsePhoneNumber} from 'react-phone-number-input'

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
            
function Form(props) 
{
    const [open, setOpen] = useState(true)

    const cancelButtonRef = useRef(null)

    const [fields, setFields] = useState([]);

    const[phoneNumber, setPhoneNumber] = useState('');

    const [formErrors, setErrors] = useState({});

    const { data, setData, post, processing, errors, reset } = useForm({});

    const [options, setOptions] = useState(null);

    useEffect(() => {
        fetchModuleFields();
        if(props.recordId) {
            fetchRecord();
        }   
    }, [props]);

    /**
     * Fetch record
     */
    function fetchRecord() {
        nProgress.start(0.5);
        nProgress.inc(0.2);

        let endpoint_url = route('edit'+ props.module , {'id': props.recordId});
        
        Axios.get(endpoint_url).then((response) => {
            nProgress.done(true);
            if(response.data.status !== false) {
                setData(response.data.record);
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

    /**
     * Fetch module fields
     */
    function fetchModuleFields() {
        nProgress.start(0.5);
        nProgress.inc(0.2);

        let endpoint_url = route('fetchModuleFields', {'module': props.module});
        Axios.get(endpoint_url).then((response) => {
            nProgress.done(true);
            if (response.data.status !== false) {
                setFields(response.data.fields);
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

    /**
     * Handle Input Change
     */
    const handleChange = (event) => {
        let newState = Object.assign({}, data); 
        var isUpdated = CustomData(event.target);  //Custom field data entry
        if(! isUpdated ){
            if (event.target.name == 'field_type') {
                EventHandler(event);
            }
            const field_name = event.target.name;
            const field_value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
            newState[field_name] = field_value;
            setData(newState);
        }
    }

    const EventHandler = (event) => { 
        if (event.target.value == 'dropdown') {
            fields.push(optionField);
        } else {
            fields.map((field,key) => { 
                if (field.field_type == 'selectable') { 
                    fields.pop(key); 
                    setOptions(null);
                }
            });
        }
    }

    /**
     * Phone number change event
     */
    function changePhoneNumber(value , name){
        let newState = Object.assign({}, data);
        newState[name] = value;
        if(value && parsePhoneNumber(value) ){
            newState['country_code'] = parsePhoneNumber(value).countryCallingCode;
        }
       
        setData(newState);
    }

    /**
     * Save form
     */
    function saveForm()
    {    
        // Validate the data
        let is_validated = false;
        var pristine = new Pristine(document.getElementById(`form`), defaultConfig);
        is_validated = pristine.validate(document.querySelectorAll('input[data-pristine-required="true"]'));
        if(!is_validated) {
            return false;
        }
        data['options'] = options;
        
        Inertia.post(props.recordId ? route('update' + props.module, {id: props.recordId}) : route('store' + props.module), data, {
            onSuccess: (response) => {
                props.hideForm();
            },
            onError: (errors) => {
                setErrors(errors)
            }
        });
    }

    /**
     * Added custom dropdown options
     */
    function addSelectableField(){
        var isAdded = false;
        Object.entries(fields).map(([key, field])=> {
            if(field.field_type == 'selectable'){
                isAdded = true;
            }
        })
        if(!isAdded){
            fields.push(optionField);
            setOptions(data.options);
        }
    }

    function CustomData(event){
        let newState = Object.assign({}, data); 
        let value = event.value;
        let field_name = event.name;
        var isUpdate = false;
       
        var customField = (data.custom)? data.custom : {};
        Object.entries(fields).map(([key, field])=> {
            let name = '';
            if(field.is_custom == '1'){
                name = field.field_name; 
                if(name == field_name){
                    customField[field_name] = value; 
                    newState['custom'] = customField;
                    isUpdate = true;;
                }
            }  
        })

        setData(newState);
        return isUpdate;
    }
       
    return (
        <Transition.Root show={open} as={Fragment}>
            <Dialog as="div" className="relative z-10" initialFocus={cancelButtonRef} onClose={() => {}} >
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

                <div className="fixed z-10 inset-0 overflow-y-auto">
                    <div className="flex items-end sm:items-center justify-center min-h-full p-4 text-center sm:p-0">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-xl sm:w-full">
                                <div className="bg-gray-50 px-4 pt-5 pb-4 sm:p-4 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mt-3 text-center sm:mt-0 sm:text-left">
                                            <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                                                {props.id ? 'Update' : 'Create'} {props.heading}
                                            </Dialog.Title>
                                        </div>
                                    </div>
                                </div>

                                {Object.keys(formErrors) > 0 ?
                                    <div className='p-4'>
                                        <ValidationErrors errors={formErrors} />
                                    </div>
                                : ''}

                                <form id='form'>
                                    <div className='p-4 space-y-4'>
                                        {fields && fields.map((field_info,index) => { 
                                            let element = ''; 
                                            if(data.is_custom == '1' && data.module_name == 'Contact' && data.field_type == 'dropdown'){
                                                addSelectableField();
                                            }
                                            let field_value = data[field_info.field_name];
                                            if(data.custom && data.custom[field_info.field_name]){
                                                field_value = data.custom[field_info.field_name]
                                            }

                                            switch (field_info.field_type) {
                                                case "text":
                                                    element = <Input
                                                        required={field_info.is_mandatory === 1 ? true : false}
                                                        type="text"
                                                        className={`mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-skin-primary focus:border-skin-primary sm:text-sm`}
                                                        id={field_info.field_name}
                                                        name={field_info.field_name}
                                                        value={field_value}
                                                        handleChange={handleChange}
                                                    />;
                                                    break;
                                                case 'phone_number':
                                                    element = <PhoneInput
                                                        initialValueFormat="national"
                                                        withCountryCallingCode
                                                        placeholder="Enter phone number"
                                                        className={`mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-skin-primary focus:border-skin-primary sm:text-sm`}
                                                        value={field_value} 
                                                        onChange={(value) => changePhoneNumber(value,field_info.field_name )}
                                                        />
                                                    break;
                                                case "amount":
                                                    element = <div className="mt-1 relative rounded-md shadow-sm">
                                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                            <span className="text-gray-500 sm:text-sm">$</span>
                                                        </div>
                                                        <Input
                                                            required={field_info.is_mandatory === 1 ? true : false}
                                                            type="text"
                                                            className={`pl-6 mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-skin-primary focus:border-skin-primary sm:text-sm`}
                                                            id={field_info.field_name}
                                                            name={field_info.field_name}
                                                            value={field_value}
                                                            handleChange={handleChange}
                                                        />
                                                    </div>
                                                    break;
                                                case "textarea":
                                                    element = <TextArea
                                                        id={field_info.field_name}
                                                        name={field_info.field_name}
                                                        required={field_info.is_mandatory === 1 ? true : false}
                                                        rows="2"
                                                        className={`mt-1 max-w-lg shadow-sm block w-full focus:ring-skin-primary focus:border-skin-primary sm:text-sm border border-gray-300 rounded-md`}
                                                        value={field_value}
                                                        handleChange={handleChange}
                                                    />
                                                    break;
                                                case 'dropdown':
                                                    element = <Dropdown
                                                        id={field_info.field_name}
                                                        name={field_info.field_name}
                                                        options={field_info.options ? field_info.options : {}}
                                                        handleChange={handleChange}
                                                        value={field_value}
                                                        required={field_info.is_mandatory === 1 ? true : false}
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
                                                        id={field_info.field_name}
                                                        name={field_info.field_name}
                                                        value={field_value}
                                                        handleChange={handleChange}
                                                    />
                                                    break;
                                                case 'default':
                                                    element = <Input 
                                                        required={field_info.is_mandatory === 1 ? true : false}
                                                        type="text" 
                                                        className={`mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-skin-primary focus:border-skin-primary sm:text-sm`}
                                                        id={field_info.field_name}
                                                        name={field_info.field_name}
                                                        value={field_value} 
                                                        handleChange={handleChange}
                                                    />;
                                                    break;
                                            }
                                           
                                            return (
                                                <div className='form-group' key={field_info.field_name}>
                                                    <label htmlFor={field_info.field_name} className="block text-sm font-medium text-gray-700">
                                                        {field_info.field_label} {field_info.is_mandatory === 1 ? <span className='text-red-600'>*</span> : ''}
                                                    </label>
                                                    <div className="mt-1">
                                                        {element}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </form>

                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="button"
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                                        onClick={saveForm}
                                    >
                                        Save
                                    </button>
                                    <button
                                        type="button"
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                        onClick={() => props.hideForm()}
                                        ref={cancelButtonRef}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    )
}

export default Form;