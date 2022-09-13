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

function Action(props){

    const cancelButtonRef = useRef(null);
    const [actionData , setActionData] = useState({});
    const [options, setOptions] = useState({});
    const [fieldInfo, setFieldInfo] = useState({});

    useEffect(()=>{
        
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
        
    },[actionData]);

    function DataHandler(name, value) 
    {
        var newActionData = Object.assign({}, actionData);
        newActionData[name] = value;
        setActionData(newActionData);
    }

    function handleChange(event){
        console.log(event);
        var name = event.target.name;
        var value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;

        if(name == 'field_name' && actionData.type == 'custom_field' ){
            console.log(['fieldInfo',options.field_info[value], 'val', value]);
            DataHandler('field_name', '');
            setFieldInfo(options.field_info[value]);
        }
        
        DataHandler(name, value);
    }

    /**
     * Handle relate field change
     * 
     * @param {object} value 
     * @param {string} field_name 
     */
     function handleRelateChange(value, field_name) {
        DataHandler(field_name, value);
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

        DataHandler(field_name, values);
    }

    /**
     * Get account list
     */
    function getActionData(action_type){
        var url = route('get_action_data') + '?action_type='+action_type;
        Axios.get(url).then((response) => {
            
            if(response.data.status !== false) {
                setOptions(response.data.result);
                if(action_type == 'custom_field' && props.actionData.node_data.field_name){
                    setFieldInfo(props.actionData.node_data);
                }
            }
        });
    }
//console.log('fieldInfo : ' , fieldInfo) ;
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
                                                            <div class="flex flex-wrap -mx-3 mb-6">
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
                                                            <div class="flex flex-wrap -mx-3 mb-6">
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
                                              </div>
                                          </div>
                                      </form>
 
                                      <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                        <button
                                            type="button"
                                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                                            onClick={() => props.saveActionData(props.actionData.node_id, actionData)}
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