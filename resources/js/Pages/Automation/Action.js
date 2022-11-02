import React, { useState, useCallback, useRef, Fragment, useEffect } from "react";
import { Dialog, Transition } from '@headlessui/react'
import Dropdown from "@/Components/Forms/Dropdown";
import Axios from "axios";
import Input from "@/Components/Forms/Input";
import TextArea from '@/Components/Forms/TextArea';
import PhoneInput2 from 'react-phone-input-2';
import Number from "@/Components/Forms/Number";
import Creatable from 'react-select/creatable';
import Checkbox from "@/Components/Forms/Checkbox";
import Date from "@/Components/Forms/Date";
import DateTime from "@/Components/Forms/DateTime";
import Time from "@/Components/Forms/Time";
import MultiSelect from "@/Components/Forms/MultiSelect";
import Relate from "@/Components/Relate";
import { TrashIcon } from '@heroicons/react/solid';
import notie from 'notie';

function Action(props){

    const inital_field = {
            module_field: '',
            map_field: '',
        };

    const initialHeader = {
        header_type: '',
        header_value:''
    }

    const methodOptions = {
        GET: 'GET',
        POST: 'POST',
        PUT: 'PUT'
    };

    const headerType = {
        'apiKey': 'API key',
        'Authorization': 'Bearer token',
    };

    const webhookActions = ['create_contact' , 'update_contact' , 'send_request', 'create_lead' , 'update_lead'] ;

    const cancelButtonRef = useRef(null);
    const [actionData , setActionData] = useState({});
    const [options, setOptions] = useState({});
    const [fieldInfo, setFieldInfo] = useState({});

    const [moduleFields, setModuleFields] = useState({});
    const [mappedField , setFieldMapping] = useState([]);
    const [data_headers , setHeaders] = useState([]);

    useEffect(()=>{
        //if(props.actionData.type == 'create_contact' || props.actionData.type == 'update_contact' || props.actionData.type == 'send_request'){
        if(webhookActions.includes(props.actionData.type)){
            fetchModuleFields( props.actionData.type );
            addMoreMapFields();
            addMoreHeader();
        }
        if(props.actionData.node_data){
            setActionData(props.actionData.node_data);
        } else {
            var newActionData = Object.assign({}, actionData);
            newActionData['type'] = props.actionData.type;
            setActionData(newActionData);
        }
        getActionData(props.actionData.type);   
             
    }, []);

    useEffect(()=>{
      
       if(actionData && actionData.field_name){
        if(options.field_info)
            setFieldInfo(options.field_info[actionData.field_name]);
       }

       if(actionData && actionData.field_mapping && actionData.field_mapping[0]){
            setFieldMapping(actionData.field_mapping);
       }
       if(actionData && actionData.data_headers && actionData.data_headers[0]){
            setHeaders(actionData.data_headers);
       }
    },[actionData, fieldInfo, data_headers]);

    function dataHandler(name, value) 
    {
        var newActionData = Object.assign({}, actionData);
        newActionData[name] = value;
        setActionData(newActionData);
        
    }

    /**
     * Handle field map module field
     * 
     * @param {Element} event 
     */
    function handleFieldMap(event){
       
        var newMapField = Object.assign([], mappedField);
        var value = event.target.value;
        var name = event.target.name;
        var key = event.target.getAttribute('map_index');

        var fieldMap = newMapField[key]
    
        if(name == 'webhook_field'){
            name = "map_field";
            value = fieldMap.map_field + ' ' + value;
        }


        fieldMap[name] = value;
        newMapField[key] = fieldMap;
        setFieldMapping(newMapField);

        dataHandler('field_mapping', newMapField);
    }

    /**
     * Handle header data
     * 
     * @param {Element} event 
     */
    function handleHeader(event){
        var newHeaders = Object.assign([], data_headers);
    
        var value = event.target.value;
        var name = event.target.name;
        var key = event.target.getAttribute('header_index');

        var header = newHeaders[key]
        header[name] = value;
        newHeaders[key] = header;
        setHeaders(newHeaders);

        dataHandler('data_headers', newHeaders);
    }
    /**
     * Delete mapping 
     * 
     * @param {Integer} index 
     */
    function deleteMaField(index){
        var newMapField = Object.assign([], mappedField);
        delete newMapField[index]; 
        setFieldMapping(newMapField);

        dataHandler('field_mapping', newMapField);
    }

    
    /**
     * Delete Header 
     * 
     * @param {Integer} index 
     */
    function deleteHeader(index){
        var newHeader = Object.assign([], data_headers);
        delete newHeader[index]; 
        setHeaders(newHeader);

        dataHandler('data_headers', newHeader);
    }
    /**
     * Add more one field to mapping
     */
    function addMoreMapFields(){
        var newMapField = Object.assign([], mappedField);
        newMapField.push(inital_field);
        setFieldMapping(newMapField);
    }

    /**
     * Add more header
     */
    function addMoreHeader(){
        var newHeaders = Object.assign([], data_headers);
        newHeaders.push(initialHeader);
        setHeaders(newHeaders);
    }

    function handleChange(event){
        
        var name = event.target.name;
        var value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;

        if(name == 'field_name' && actionData.type == 'custom_field' ){
            dataHandler('field_name', '');
            setFieldInfo(options.field_info[value]);
        }
        
        dataHandler(name, value);
    }

    /**
     * Handle relate field change
     * 
     * @param {object} value 
     * @param {string} field_name 
     */
     function handleRelateChange(value, field_name) {
        dataHandler(field_name, value);
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
        dataHandler(name,result);
    }
    
    // Change Date format
    function changeDate(name, event) {
        let date = '';
        if(event){
            date = event.getFullYear() + '-' + ('0' + (event.getMonth() + 1)).slice(-2) + '-' + ('0' + event.getDate()).slice(-2);
        }
        dataHandler(name, date);
    }

    // Change Time format
    function changeTime(name, event) {
        let time = '';
        if(event){
            time = ('0' + event.getHours()).slice(-2) + ':' + ('0' + event.getMinutes()).slice(-2) + ':00';
        }
        dataHandler(name, time);
    }
    /**
     * Handle multi select change
     * 
     * @param {object} event 
     */
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

        dataHandler(field_name, values);
    }

    /**
     * Get account list
     */
    function getActionData(action_type){
        var url = route('get_action_data') + '?action_type='+action_type+'&record='+props.record.id;
        Axios.get(url).then((response) => {
            
            if(response.data.status !== false) {
                setOptions(response.data.result);
                
                if(action_type == 'custom_field' && props.actionData.node_data.field_name){
                    setFieldInfo(props.actionData.node_data);
                }
            }
        });
    }

    /**
     * Fetch module fields
     */
     function fetchModuleFields(type) {
      
        var moduleName = (type.indexOf("lead") !== -1)? 'Lead' : 'Contact';
        let endpoint_url = route('fetchModuleFields', {'module': moduleName});
        Axios.get(endpoint_url).then((response) => {
            if(response.data.status !== false) {
                setModuleFields(response.data.fields);
            }
        });
    }
    
    /**
     * Test request call
     */
    function testRequestCall(){
        let endpoint_url = route('test_post_data');
        var result = checkPostUrl();
        if(!result){
            return false;
        }

        Axios.post(endpoint_url, actionData).then((response) => {
            if(response.data.status !== false) {
                notie.alert({type: 'success', text: 'Test call send successfully!', time: 5});
            } else {
                notie.alert({type: 'error', text: response.data.message, time: 5});
            }
        });
    }

    function saveAction(){
        var result = checkPostUrl();
        if(!result){
            return false;
        }
        props.saveActionData(props.actionData.node_id, actionData);
    }

    /**
     * Check post url 
     */
    function checkPostUrl(){
        var hostName = window.location.hostname;
        if((actionData.post_url).indexOf(hostName) !== -1 ){
            notie.alert({type: 'error', text: 'Post url hostname must be different from current host', time: 5});
            return false
        }
        return true;
    }

    return(
        <Transition.Root show={true} as={Fragment}>
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
                                          <div className="sm:flex sm:items-start ">
                                              <div className="mt-3 text-center sm:mt-0 sm:text-left w-1/2 ">
                                                        <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                                                        {props.actionData.heading}
                                                        </Dialog.Title>
                                                    </div>
                                                    <div className="w-1/2 text-right">
                                                        <button
                                                            className="border-1 border-indigo-300"
                                                            onClick={() => props.setShowAction(false)}
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                                                 <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                          </div>
                                      </div>
      
                                      <form id='form'>
                                          <div className='p-4 space-y-4'>
                                              <div className='form-group' >
                                                
                                                    {actionData.type == 'send_message' &&
                                                        <div>
                                                            <div class="flex flex-wrap mx-3 mb-6">
                                                                <div class="w-full px-3">
                                                                <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="grid-password">
                                                                    Select account
                                                                </label>
                                                                <Dropdown
                                                                    id={'select_account'}
                                                                    name={'select_account'}
                                                                    options={options.account_list}
                                                                    handleChange={handleChange}
                                                                    emptyOption={'Select'}
                                                                    value={actionData.select_account}
                                                                    required={ true }
                                                                />
                                                                <p class="text-gray-600 text-xs italic">Send a message using the selected account</p>
                                                                </div>
                                                            </div>
                                                            <div class="flex flex-wrap mx-3 mb-6">
                                                                <div class="w-full px-3">
                                                                <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="grid-password">
                                                                    Select Template
                                                                </label>
                                                                <Dropdown
                                                                    id={'select_template'}
                                                                    name={'select_template'}
                                                                    options={options.template_list}
                                                                    handleChange={handleChange}
                                                                    emptyOption={'Select'}
                                                                    value={actionData.select_template}
                                                                    required={ true }
                                                                />
                                                                <p class="text-gray-600 text-xs italic">Send a message using the template</p>
                                                                </div>
                                                            </div>

                                                        </div>
                                                    }
                                                    {actionData.type == 'tag_contact' &&
                                                        <div>
                                                            <div class="flex flex-wrap -mx-3 mb-6">
                                                                <div class="w-full px-3">
                                                                <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="grid-password">
                                                                    Select Tag
                                                                </label>
                                                                <Dropdown
                                                                    id={'select_tag'}
                                                                    name={'select_tag'}
                                                                    options={options.tag_list}
                                                                    handleChange={handleChange}
                                                                    emptyOption={'Select'}
                                                                    value={actionData.select_tag}
                                                                    required={ true }
                                                                />
                                                                <p class="text-gray-600 text-xs italic">Relate the tag to the contact</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    }
                                                    {actionData.type == 'list_contact' &&
                                                        <div>
                                                            <div class="flex flex-wrap -mx-3 mb-6">
                                                                <div class="w-full px-3">
                                                                <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="grid-password">
                                                                    Select List
                                                                </label>
                                                                <Dropdown
                                                                    id={'select_list'}
                                                                    name={'select_list'}
                                                                    options={options.list_list}
                                                                    handleChange={handleChange}
                                                                    emptyOption={'Select'}
                                                                    value={actionData.select_list}
                                                                    required={ true }
                                                                />
                                                                <p class="text-gray-600 text-xs italic">Relate the List to the contact</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    }
                                                    {actionData.type == 'custom_field' &&
                                                        <div>
                                                            <div class="flex flex-wrap mx-3 mb-6">
                                                                <div className="w-1/2">
                                                                    <div className='form-group' >
                                                                        <label htmlFor={'field_name'} className="block text-sm font-medium text-gray-700">
                                                                            Field name
                                                                        </label>
                                                                        <Dropdown
                                                                            id={'field_name'}
                                                                            name={'field_name'}
                                                                            options={options.field_list}
                                                                            handleChange={handleChange}
                                                                            emptyOption={'Select'}
                                                                            value={actionData.field_name}
                                                                            required={ true }
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <div className='form-group ml-2' >
                                                                        <label htmlFor={'field_name'} className="block text-sm font-medium text-gray-700">
                                                                            Field value
                                                                        </label>
                                                                        {(() => {
                                                                            var element = <Input
                                                                                type="text"
                                                                                className={`mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-skin-primary focus:border-skin-primary sm:text-sm`}
                                                                                id={'field_value'}
                                                                                name={'field_value'}
                                                                                value={actionData.field_value}
                                                                                handleChange={handleChange}            
                                                                            />;
                                                                        
                                                                            switch (fieldInfo.field_type) {
                                                                                case "text":
                                                                                    element = <Input
                                                                                        type="text"
                                                                                        className={`mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-skin-primary focus:border-skin-primary sm:text-sm`}
                                                                                        id={'field_value'}
                                                                                        name={'field_value'}
                                                                                        value={actionData.field_value}
                                                                                        handleChange={handleChange}            
                                                                                    />;
                                                                                    break;
                                                                                case 'phone_number':
                                                                                    element = <PhoneInput2
                                                                                        inputProps={{
                                                                                            name: 'field_value',
                                                                                            autoFocus: true
                                                                                        }}
                                                                                        containerStyle={{ marginTop: "15px" }}
                                                                                        searchClass="search-class"
                                                                                        searchStyle={{ margin: "0", width: "97%", height: "30px" }}
                                                                                        enableSearchField
                                                                                        disableSearchIcon
                                                                                        placeholder="Enter phone number"
                                                                                        value={actionData.field_value} 
                                                                                        onChange={(value) => changePhoneNumber(value,'field_value')}
                                                                                  />
                                                                            
                                                                                    break;
                                                                                case "amount":
                                                                                    element = <div className="mt-1 relative rounded-md shadow-sm">
                                                                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                                                            <span className="text-gray-500 sm:text-sm">$</span>
                                                                                        </div>
                                                                                       
                                                                                        <Number
                                                                                            type="text"
                                                                                            className={`pl-6 mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-skin-primary focus:border-skin-primary sm:text-sm`}
                                                                                            id={'field_value'}
                                                                                            name={'field_value'}
                                                                                            value={actionData.field_value}
                                                                                            
                                                                                            handleChange={(event) => changeNumber('field_value',event)}
                                                                                        />
                                                                                    </div>
                                                                                    break;
                                                                                case "textarea":
                                                                                    element = <TextArea
                                                                                        id={'field_value'}
                                                                                        name={'field_value'}
                                                                                        
                                                                                        rows="2"
                                                                                        className={`mt-1 max-w-lg shadow-sm block w-full focus:ring-skin-primary focus:border-skin-primary sm:text-sm border border-gray-300 rounded-md`}
                                                                                        value={actionData.field_value}
                                                                                        handleChange={handleChange}
                                                                                    />
                                                                                    break;
                                                                                case 'dropdown':
                                                                                    element = <Dropdown
                                                                                        id={'field_value'}
                                                                                        name={'field_value'}
                                                                                        options={fieldInfo.options ? fieldInfo.options : {}}
                                                                                        handleChange={handleChange}
                                                                                        emptyOption={'Select'}
                                                                                        value={actionData.field_value}
                                                                                        
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
                                                                                        id={'field_value'}
                                                                                        name={'field_value'}
                                                                                        value={actionData.field_value}
                                                                                        handleChange={handleChange}
                                                                                    />
                                                                                    break;
                                                                                case 'number':
                                                                                     element = <Number 
                                                                                     type="text"
                                                                                     className={`mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-skin-primary focus:border-skin-primary sm:text-sm`}
                                                                                     id={'field_value'}
                                                                                     name={'field_value'}
                                                                                     value={actionData.field_value}
                                                                                     handleChange={(event) => changeNumber('field_value',event)}
                                                                                     />
                                                                                     break;
                                                                                case 'datetime':
                                                                                    element = <DateTime
                                                                                    id={'field_value'}
                                                                                    name={'field_value'}
                                                                                    value={actionData.field_value}
                                                                                    handleChange={(event) => changeDateTime('field_value',event)}
                                                                                    />
                                                                                    break;
                                                                                case 'date':
                                                                                    element = <Date
                                                                                    id={'field_value'}
                                                                                    name={'field_value'}
                                                                                    value={actionData.field_value}
                                                                                    handleChange={(event) => changeDate('field_value',event)}
                                                                                    />
                                                                                    break; 
                                                                                case 'time':
                                                                                    element = <Time 
                                                                                    id={'field_value'}
                                                                                    name={'field_value'}
                                                                                    value={actionData.field_value}
                                                                                    handleChange={(event) => changeTime('field_value',event)}
                                                                                    />
                                                                                    break; 
                                                                                case 'multiselect':
                                                                                    element = <MultiSelect
                                                                                        id={'field_value'}
                                                                                        name={'field_value'}
                                                                                        options={fieldInfo.options ? fieldInfo.options : {}}
                                                                                        handleChange={handleMultiSelectChange}
                                                                                        emptyOption={'Select'}
                                                                                        value={actionData.field_value}
                                                                                        
                                                                                        
                                                                                    />
                                                                                    break;
                                                                                case 'relate':
                                                                                    element = <Relate
                                                                                            id={'field_value'}
                                                                                            name={'field_value'}                                               
                                                                                            module={fieldInfo.options.module}
                                                                                            handleChange={handleRelateChange}
                                                                                            value={actionData.field_value}
                                                                                            
                                                                                        />                                                    
                                                                                    break;                                 
                                                                                case 'default':
                                                                                    element = <Input 
                                                                                        type="text" 
                                                                                        className={`mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-skin-primary focus:border-skin-primary sm:text-sm`}
                                                                                        id={'field_value'}
                                                                                        name={'field_value'}
                                                                                        value={actionData.field_value} 
                                                                                        handleChange={handleChange}
                                                                                        
                                                                                        
                                                                                    />;
                                                                                    break;
                                                                            }

                                                                            return(
                                                                                <>{element}</>
                                                                            )
                                                                        })()}
                                                                       
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    }
                                                    
                                                    {actionData.type == 'send_request' &&
                                                        <div>
                                                            <div class="flex flex-wrap mx-3 mb-6">
                                                                <div className="w-3/4">
                                                                    <div className='form-group mb-2' >
                                                                        <label htmlFor={'method'} className="block text-sm font-medium text-gray-700">
                                                                            Method
                                                                        </label>
                                                                        <Dropdown
                                                                            id={'method'}
                                                                            name={'method'}
                                                                            options={methodOptions}
                                                                            handleChange={handleChange}
                                                                            emptyOption={'Select'}
                                                                            value={actionData.method}
                                                                            required={ true }
                                                                        />
                                                                    </div>
                                                                    <div className='form-group mb-2' >
                                                                        <label htmlFor={'post_url'} className="block text-sm font-medium text-gray-700">
                                                                            Post URL
                                                                        </label>
                                                                        <Input
                                                                            id={'post_url'}
                                                                            name={'post_url'}
                                                                            handleChange={handleChange}
                                                                            value={actionData.post_url}
                                                                            required={ true }
                                                                        />
                                                                    </div>
                                                                    <div className='form-group mb-2' >
                                                                        <label htmlFor={'headerType'} className="block text-sm font-medium text-gray-700">
                                                                            Headers
                                                                        </label>
                                                                        <div className=' mb-2' >
                                                                            {data_headers && Object.entries(data_headers).map(([key , header]) => {
                                                                                return(
                                                                                    <div className="flex items-center">
                                                                                        
                                                                                        <input
                                                                                            className="p-2 m-2 focus:ring-[#9BFFF2] focus:border-[#9BFFF2] bg-[#F6FFFD] flex-1 block w-full rounded-sm sm:text-sm border border-[#67e8f9]"
                                                                                            id={'header_type'}
                                                                                            name={'header_type'}
                                                                                            header_index={key}
                                                                                            onChange={(e) => handleHeader(e)}
                                                                                            value={header.header_type}
                                                                                            required={ true }
                                                                                        />
                                                                                        <input
                                                                                            className=" p-2 m-2 focus:ring-[#9BFFF2] focus:border-[#9BFFF2] bg-[#F6FFFD] flex-1 block w-full rounded-sm sm:text-sm border border-[#67e8f9]"
                                                                                            id={'header_value'}
                                                                                            name={'header_value'}
                                                                                            header_index={key}
                                                                                            onChange={ (e) => handleHeader(e)}
                                                                                            value={header.header_value}
                                                                                            required={ true }
                                                                                        />
                                                                                        <div className="flex items-center justify-between p-4 space-x-6">
                                                                                            <button
                                                                                                type="button"
                                                                                                onClick={(e) => deleteHeader(key)}
                                                                                                className="inline-flex  items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-sm text-black bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
                                                                                            >
                                                                                                <TrashIcon 
                                                                                                    className='h-4 w-4 text-red-600 cursor-pointer' 
                                                                                                />

                                                                                            </button>
                                                                                        </div>     
                                                                                    </div>
                                                                                )
                                                                            })}
                                                                        </div>
                                                                        <div className='form-group' >
                                                                            <button
                                                                                type="button"
                                                                                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                                                                onClick={ () => addMoreHeader()}
                                                                            >
                                                                                Add
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    }
                                                    {/* {(actionData.type == 'create_contact' || 'update_contact' == actionData.type || actionData.type == 'send_request') && */}
                                                    { (webhookActions.includes(actionData.type)) &&
                                                        <div>
                                                            <div class="flex flex-wrap mx-3 mb-6">
                                                                <div className="w-full">
                                                                    <div className='form-group' >
                                                                        {actionData.type != 'send_request' ?
                                                                            <label htmlFor={'field_name'} className="block text-sm font-medium text-gray-700">
                                                                                Select Fields
                                                                            </label>
                                                                        :
                                                                        <div className="flex w-full">
                                                                            <div className="flex flex-1  gap-2">
                                                                                <div className="flex-1 flex items-center ">
                                                                                    <label  className="block text-sm font-medium text-gray-700">
                                                                                        Post field
                                                                                    </label>
                                                                                </div>
                                                                                <div className="flex-1 flex items-center ">
                                                                                    <label className="block text-sm font-medium text-gray-700">
                                                                                       Field value
                                                                                    </label>
                                                                                </div>
                                                                                <div className="flex-1 flex items-center ">
                                                                                    <label className="block text-sm font-medium text-gray-700">
                                                                                        Field name
                                                                                    </label>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        }

                                                                        {Object.entries(mappedField).map(([key, field_map]) => {
                                                                            return(
                                                                                <div className="flex w-full">
                                                                                    <div className="flex flex-1  gap-2">
                                                                                        <div className="flex-1 flex items-center ">
                                                                                            {actionData.type != 'send_request' ?
                                                                                                <select
                                                                                                    name="module_field"
                                                                                                    map_index={key}
                                                                                                    id="module_field"
                                                                                                    value={field_map.module_field}
                                                                                                    onChange={ (e) => handleFieldMap(e)}
                                                                                                    className='mt-1 block w-full py-2 px-3 bg-[#9BFFF2] border-0 rounded-sm shadow-sm focus:outline-none focus:ring-[#9BFFF2] focus:border-[#9BFFF2] sm:text-sm'
                                                                                                >
                                                                                                    <option value=""></option>
                                                                                                    {Object.entries(moduleFields).map(([key, field]) => 
                                                                                                        <option map_index={key} value={field.field_name}  defaultValue={field_map.module_field === field.field_name} > {field.field_label} </option>
                                                                                                    )}
                                                                                                </select>
                                                                                                :
                                                                                                <select
                                                                                                    onChange={ (e) => handleFieldMap(e)}
                                                                                                    map_index={key}
                                                                                                    value=''
                                                                                                    name="webhook_field"
                                                                                                    className='mt-1 block w-full py-2 px-3 bg-[#9BFFF2] border-0 rounded-sm shadow-sm focus:outline-none focus:ring-[#9BFFF2] focus:border-[#9BFFF2] sm:text-sm'
                                                                                                >
                                                                                                    <option value=""> {'{{}}'} </option>
                                                                                                    
                                                                                                    {Object.entries(moduleFields).map(([key, field]) => 
                                                                                                        <option map_index={key} value={"{{"+field.field_name+'}}'} defaultValue={field_map.module_field === field.field_name} > {field.field_label} </option>
                                                                                                    )}
                                                                                                </select>
                                                                                                
                                                                                            }
                                                                                        </div>
                                                                                        <div className="flex-2 flex items-center ">
                                                                                            <input
                                                                                                className="focus:ring-[#9BFFF2] focus:border-[#9BFFF2] bg-[#F6FFFD] flex-1 block w-full rounded-sm sm:text-sm border border-[#67e8f9]"
                                                                                                type="text"
                                                                                                name={'map_field'}
                                                                                                map_index={key}
                                                                                                onChange={ (e) => handleFieldMap(e)}
                                                                                                value={field_map.map_field}
                                                                                            />
                                                                                        </div>
                                                                                        {actionData.type != 'send_request' ?
                                                                                            <div className="flex-1 flex items-center ">
                                                                                                <select
                                                                                                    onChange={ (e) => handleFieldMap(e)}
                                                                                                    map_index={key}
                                                                                                    value=''
                                                                                                    name="webhook_field"
                                                                                                    className='mt-1 block w-full py-2 px-3 bg-[#9BFFF2] border-0 rounded-sm shadow-sm focus:outline-none focus:ring-[#9BFFF2] focus:border-[#9BFFF2] sm:text-sm'
                                                                                                >
                                                                                                    <option value=""> {'{{}}'} </option>
                                                                                                    {options.sample_data && Object.entries(options.sample_data).map(([key, field]) => 
                                                                                                        <option map_index={key} value={"{{"+key+'}}'}> {key} </option>
                                                                                                    )}
                                                                                                </select>
                                                                                            </div>
                                                                                            :
                                                                                            <div className="flex-1 flex items-center ">
                                                                                                <input
                                                                                                    className="focus:ring-[#9BFFF2] focus:border-[#9BFFF2] bg-[#F6FFFD] flex-1 block w-full rounded-sm sm:text-sm border border-[#67e8f9]"
                                                                                                    type="text"
                                                                                                    name={'field_name'}
                                                                                                    map_index={key}
                                                                                                    onChange={ (e) => handleFieldMap(e)}
                                                                                                    value={field_map.field_name}
                                                                                                />
                                                                                            </div>
                                                                                        }
                                                                                        <div className="flex items-center justify-between p-4 space-x-6">
                                                                                            <button
                                                                                                type="button"
                                                                                                onClick={(e) => deleteMaField(key)}
                                                                                                className="inline-flex  items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-sm text-black bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
                                                                                            >
                                                                                                <TrashIcon 
                                                                                                    className='h-4 w-4 text-red-600 cursor-pointer' 
                                                                                                />

                                                                                            </button>
                                                                                        </div>     
                                                                                    </div>
                                                                                </div>
                                                                            )
                                                                        })}
                                                                    </div>
                                                                </div>
                                                                <div className='form-group' >
                                                                    <button
                                                                        type="button"
                                                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                                                        onClick={ () => addMoreMapFields()}
                                                                    >
                                                                        Add
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    }
                                                    {actionData.type == 'send_request' &&
                                                        <div className='form-group' >
                                                            <button
                                                                type="button"
                                                                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                                                onClick={ () => testRequestCall()}
                                                            >
                                                                Test
                                                            </button>
                                                        </div>
                                                    }
                                              </div>
                                          </div>
                                      </form>
 
                                      <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                        <button
                                            type="button"
                                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                                            onClick={() => saveAction()}
                                        >
                                            Save
                                        </button>
                                        <button
                                            type="button"
                                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                            onClick={() => props.setShowAction(false)}
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
export default Action;