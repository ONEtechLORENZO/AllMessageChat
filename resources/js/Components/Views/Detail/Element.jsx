import React, {useState, useEffect} from "react";
import Input from "@/Components/Forms/Input";
import Dropdown from "@/Components/Forms/Dropdown";
import TextArea from "@/Components/Forms/TextArea";
import Checkbox from "@/Components/Forms/Checkbox";
import Number from "@/Components/Forms/Number"; 
import MultiSelect from "@/Components/Forms/MultiSelect";
import Date from "@/Components/Forms/Date";
import DateTime from "@/Components/Forms/DateTime";
import PhoneInput2 from 'react-phone-input-2';
import Time from "@/Components/Forms/DateTime";
import Relate from '@/Components/Relate';
import 'react-phone-input-2/lib/style.css';
import Creatable from 'react-select/creatable';

export default function Element(props) {

    const [options, setOptions] = useState({});
    const [fieldInfo , setFieldInfo] = useState({});
    
    useEffect(()=>{
        setSelectedFieldInfo();
        if(props.temp.type == 'selectable') {
            setSelectableOptions();
        }
    },[]);

    function setSelectableOptions() {
        let newState = Object.assign({}, options);
        newState[props.temp.name] = props.temp.value;
        setOptions(newState);
    }

    // Selected field details
    function setSelectedFieldInfo(){
        Object.entries(props.moduleFields).map(([key, field]) => {
            if(props.temp.name == field.field_name){
                setFieldInfo(field);
            }
        });
    }

    // Multi select value formate
    function multiformate(field_value){
        let isArray = Array.isArray(field_value);
    
        if(!isArray && field_value){
            var multi = field_value;
            var field_value = multi.split(', ');
            return field_value;
        }
        return field_value;
    }

    // Get dropdown option values
    function getDropDownValue(field_name,field_value){
        let fieldOptions = props.fieldOptions;
        
        if(fieldOptions[field_name]) {
            let dropdownfields = fieldOptions[field_name];
            Object.entries(dropdownfields).map(([key, value]) => {
                 if(field_value == value) {
                    field_value = key;
                 }
            });
        }
        return field_value;
        
    }

    /**
     * Handle Input Change
     */
     const handleChange = (event) => {
        const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
        let field_name = event.target.name;
        if (event.target.name == 'field_type') {
            EventHandler(event);
        }

        props.tempDataHandler(field_name,value); 
    }
    
    /**
     * Phone number change event
     */
     function changePhoneNumber(value , name){
        let phoneNumber = '+'+value;
        props.tempDataHandler(name, phoneNumber);
    }
 
    // Change Date & Time Format
    function changeDateTime(name,event) {
        let dateTime = '';
        if(event){
            var date = event.toISOString().substring(0, 10);
            var time = event.getHours() + ':' + String(event.getMinutes()).padStart(2, '0');
            dateTime = date + ' ' + time;
        }
        props.tempDataHandler(name,dateTime);
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
        props.tempDataHandler(name,result);
    }
    
    // Change Date format
    function changeDate(name, event) {
        let date = '';
        if(event){
            date = event.getFullYear() + '-' + ('0' + (event.getMonth() + 1)).slice(-2) + '-' + ('0' + event.getDate()).slice(-2);
        }
        props.tempDataHandler(name, date);
    }

    // Change Time format
    function changeTime(name, event) {
        let time = '';
        if(event){
            time = ('0' + event.getHours()).slice(-2) + ':' + ('0' + event.getMinutes()).slice(-2) + ':00';
        }
        props.tempDataHandler(name, time);
    }

    
    /**
     * Handle relate field change
     * 
     * @param {object} value 
     * @param {string} field_name 
     */
     function handleRelateChange(value, field_name) {
        props.tempDataHandler(field_name, value);
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

        props.tempDataHandler(field_name, values);
    }

    function handleSelectable(event, field_name) {
        let newState = Object.assign({}, options);
        newState[field_name] = event;
        setOptions(newState);

        props.tempDataHandler(field_name, newState[field_name]);
    }

    return(
        <form id='form'>
        <div className='p-4 space-y-4'>
           {fieldInfo &&
                <>
                {(() => {
                    var element = <Input
                    type="text"
                    className={`mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-skin-primary focus:border-skin-primary sm:text-sm`}
                    id={fieldInfo.field_name}
                    name={fieldInfo.field_name}
                    value={props.temp.value}
                    handleChange={handleChange}            
                    />;

                    switch (fieldInfo.field_type) {
                        case "text":
                            element = <Input
                                type="text"
                                className={`mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-skin-primary focus:border-skin-primary sm:text-sm`}
                                id={fieldInfo.field_name}
                                name={fieldInfo.field_name}
                                value={props.temp.value}
                                handleChange={handleChange}
                            />;
                            break;
                        case "url":
                            element = <Input
                                type="text"
                                className={`mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-skin-primary focus:border-skin-primary sm:text-sm`}
                                id={fieldInfo.field_name}
                                name={fieldInfo.field_name}
                                value={props.temp.value}
                                handleChange={handleChange}
                            />;
                            break    
                        case 'phone_number':
                            element = <PhoneInput2
                            inputProps={{
                                name: fieldInfo.field_name,
                                required: fieldInfo.is_mandatory === 1 ? true : false,
                                autoFocus: true
                              }}
                            containerStyle={{ marginTop: "15px" }}
                            searchclassName="search-class"
                            searchStyle={{ margin: "0", width: "97%", height: "30px" }}
                            enableSearchField
                            disableSearchIcon
                            placeholder="Enter phone number"
                            value={props.temp.value} 
                            onChange={(value) => changePhoneNumber(value, fieldInfo.field_name)}
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
                                    id={fieldInfo.field_name}
                                    name={fieldInfo.field_name}
                                    value={props.temp.value}
                                  
                                    handleChange={(event) => changeNumber( fieldInfo.field_name,event)}
                                />
                            </div>
                            break;
                        case "textarea":
                            element = <TextArea
                                id={fieldInfo.field_name}
                                name={fieldInfo.field_name}
                                rows="2"
                                className={`mt-1 max-w-lg shadow-sm block w-full focus:ring-skin-primary focus:border-skin-primary sm:text-sm border border-gray-300 rounded-md`}
                                value={props.temp.value}
                                handleChange={handleChange}
                            />
                            break;
                        case 'dropdown':
                            element = <Dropdown
                                id={fieldInfo.field_name}
                                name={fieldInfo.field_name}
                                options={fieldInfo.options ? fieldInfo.options : {}}
                                handleChange={handleChange}
                                emptyOption={ fieldInfo.field_name == 'field_group' ? 'General' : 'Select'}
                                value={getDropDownValue(fieldInfo.field_name,props.temp.value)}
                            />
                            break;
                        case 'checkbox':
                            element = <Checkbox
                                id={fieldInfo.field_name}
                                name={fieldInfo.field_name}
                                value={props.temp.value && (props.temp.value == 'checked' || props.temp.value == true || props.temp.value == 'Yes' ) ? 1 : '' }
                                handleChange={handleChange}
                            />
                            break;
                        case 'number':
                             element = <Number 
                             type="text"
                             className={`mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-skin-primary focus:border-skin-primary sm:text-sm`}
                             id={fieldInfo.field_name}
                             name={fieldInfo.field_name}
                             value={props.temp.value}
                             handleChange={(event) => changeNumber( fieldInfo.field_name,event)}
                             />
                             break;
                        case 'datetime':
                            element = <DateTime 
                            id={fieldInfo.field_name}
                            name={fieldInfo.field_name}
                            value={props.temp.value}
                            handleChange={(event) => changeDateTime( fieldInfo.field_name,event)}
                            />
                            break;
                        case 'date':
                            element = <Date 
                            id={fieldInfo.field_name}
                            name={fieldInfo.field_name}
                            value={props.temp.value}
                            handleChange={(event) => changeDate( fieldInfo.field_name,event)}
                            />
                            break; 
                        case 'time':
                            element = <Time 
                            id={fieldInfo.field_name}
                            name={fieldInfo.field_name}
                            value={props.temp.value}
                            handleChange={(event) => changeTime( fieldInfo.field_name,event)}
                            />
                            break; 
                        case 'multiselect':
                            element = <MultiSelect
                                id={fieldInfo.field_name}
                                name={fieldInfo.field_name}
                                options={fieldInfo.options ? fieldInfo.options : {}}
                                handleChange={handleMultiSelectChange}
                                emptyOption={ fieldInfo.field_name == 'field_group' ? 'General' : ''}
                                value={multiformate(props.temp.value)}
                            />
                            break;
                        case 'relate':
                            element = <Relate
                                    id={fieldInfo.field_name}
                                    name={fieldInfo.field_name}                                            
                                    module={fieldInfo.options.module}
                                    handleChange={handleRelateChange}
                                    value={props.temp.value}
                                />                                                    
                            break;

                        case 'selectable':
                                element = <Creatable
                                    style={{width: '82%'}}  
                                    isMulti
                                    value={options[fieldInfo.field_name]}
                                    onChange={(e) => handleSelectable(e, fieldInfo.field_name)}
                                />
                                break;                                     
                        case 'default':
                            element = <Input 
                                type="text" 
                                className={`mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-skin-primary focus:border-skin-primary sm:text-sm`}
                                id={fieldInfo.field_name}
                                name={fieldInfo.field_name}
                                value={props.temp.value} 
                                handleChange={handleChange}
                            />;
                            break;
                    }
                  
                    return (
                        <>
                         {element}
                        </>
                    )
                })()}
                </>
           }
        </div>
    </form>
    );
}












