import React, {useState, useEffect}from "react";
import { AddIcon } from "../icons";
import { TrashIcon } from '@heroicons/react/solid';
import Axios from "axios";
import notie from 'notie';
import nProgress from 'nprogress';
import CreatableSelect from 'react-select'

function FilterGroups (props) {
  
    const newCondition = {
        'field_name': '',
        'field_type': 'text',
        'record_condition': 'equal',
        'condition_value': '',
        'condition_operator': 'AND'
    };
    const logic_operators = ['AND', 'OR'];

    const relationFields = [
        {
            'field_label': props.translator.Tag,
            'field_name': 'tag_relation',
            'field_type': 'tag',
            'is_mandatory': 0,
            'options': props.filter.tag_list
        },
        {
            'field_label': props.translator.List,
            'field_name': 'list_relation',
            'field_type': 'tag',
            'is_mandatory': 0,
            'options': props.filter.category_list
        }
    ];


    const condition_operators = {
        'text':{
            'equal':  props.translator['Equal'],
            'contains': props.translator['Contains'],
            'is_null': props.translator['Null'],
            'not_equal':props.translator['Not equal'],
            'start_with': props.translator['Start with'],
            'end_with': props.translator['End with']
        },
        'string':{
            'equal':  props.translator['Equal'],
            'contains': props.translator['Contains'],
            'is_null': props.translator['Null'],
            'not_equal': props.translator['Not equal'],
            'start_with': props.translator['Start with'],
            'end_with': props.translator['End with'],
        },
        'date':{
            'equal':  props.translator['Equal'],
            'not_equal': props.translator['Not equal'],
            'is_null': props.translator['Null'],
            'lesser_than': props.translator['Lesser than'],
            'greater_than': props.translator['Greater than']
        },
        'select':{
            'equal':  props.translator['Equal'],
            'not_equal': props.translator['Not equal'],
            'is_null': props.translator['Null'],
        },
       
        'dropdown':{
            'equal':  props.translator['Equal'],
            'not_equal': props.translator['Not equal'],
            'is_null': props.translator['Null'],
        },
        'phone_number':{
            'contains': props.translator['Contains'],
            'equal':  props.translator['Equal'],
            'not_equal': props.translator['Not equal'],
            'is_null': props.translator['Null'],
        },
        'checkbox': {
            'equal':  props.translator['Equal'],
        },
        'tag': {
            'equal':  props.translator['Equal'],
        }
       
    };
    const [filter, setFilter] = useState([
        {'AND': [newCondition]}
    ]);

    const [fields, setFields] = useState([]);
    const [errors, setErrors] = useState({});
    const [filterName, setFilterName] = useState('');
    const [selectedFilter , setSelectedFilter] = useState(props.filter.selected_filter);
    
    useEffect(() => {
        if(props.filterCondition){
            setFilter(props.filterCondition);
        }
        fetchModuleFields();
    }, [props]);

     /**
     * Add condition group
     */
      function addConditionGroup(){
        let newFilter = Object.assign({}, filter);
        var newGroup = {'AND': [newCondition]};
        var groupLength = Object.entries(newFilter).length;
        newFilter[groupLength] = newGroup;
        setFilter(newFilter);
    }

     /**
     * Delete filter condition
     */
      function deleteCondition(group_count, conditions_count){

        var is_deleted = false;
        let newData = Object.assign({}, filter);
        Object.entries(newData).map(([grpCondition_index, groupConditions], group_index) => {
            if(grpCondition_index == group_count){
                Object.entries(groupConditions).map(([condition_index, conditions]) => {
                    if(newData[grpCondition_index][condition_index] && (grpCondition_index == group_count )){
                        Object.entries(conditions).map(([grpConditionIndex, condition]) => {
                            if((grpConditionIndex == conditions_count) && is_deleted === false ){
                                newData[grpCondition_index][condition_index].splice(conditions_count,1);
                                is_deleted = true;
                            }
                        });
                    }
                });
            }
        });
        setFilter(newData);
    }

     /**
     * Delete Filte Group
     */
         function deleteGroup(group_count){
            if(confirm(props.translator['Do you want to delete group?'])){
                let newData = Object.assign({}, filter);
                delete newData[group_count]; 
                setFilter(newData);
            }
        }

    /**
     * Handle input change
     */ 
     function handleChange(event) {

        var group_count = event.target.getAttribute('group_index');
        var conditions_count = event.target.getAttribute('condition_index');

        const name = event.target.name;
        const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;

        if(name == 'filter_name'){
            setFilterName(value);
        } else if(name == 'selected_filter') {
            if(value){
                axios({
                    method: 'get',
                    url: route('get_filter_data', {'filter_id': value}),
                })
                .then( (response) =>{
                   setFilter(response.data.conditions);
                   setFilterName(response.data.name);
                   setSelectedFilter(value);
                });
            } else {
                setFilter([
                    {'AND': [newCondition]}
                ]);
                setFilterName('');
                setSelectedFilter('');
            }
        } else {

            let newData = Object.assign({}, filter);
            Object.entries(newData).map(([grpCondition_index, grpConditions]) => {
                Object.entries(grpConditions).map(([grpCondition, conditions], group_index) => {
                    if(grpCondition_index == group_count){
                        if(name == 'group_condition'){
                            grpConditions[value] = grpConditions[grpCondition];
                            delete grpConditions[grpCondition]; 
                        }else{ 
                            Object.entries(conditions).map(([condition_index, condition]) => {
                                if(condition_index == conditions_count){
                                    newData[grpCondition_index][grpCondition][condition_index][name] = value;
                                    if(name == 'field_name'){
                                        var index = event.target.selectedIndex;
                                        var optionElement = event.target.childNodes[index]
                                        var field_type =  optionElement.getAttribute('field_type');
                                        newData[grpCondition_index][grpCondition][condition_index]['field_type'] = field_type;
                                        newData[grpCondition_index][grpCondition][condition_index]['condition_value'] = '';
                                    }
                                }
                            });
                        }
                    }
                });
            });
           setFilter(newData);
        }
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
            if(response.data.status !== false) {
                response.data.fields = [...response.data.fields, ...relationFields];
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
     * Search Filter
     */
      function searchFilterData(){
        var is_valid = checkValidate();
        if(!is_valid){
            return false;
        }
        
        var advancedSearch = JSON.stringify(filter);
        var url = route('searchfilter') + '?filter='+advancedSearch + '&from=campaignfilter';

        Axios.get(url).then((response) => {
            props.setOpenlist(true);
            props.setRecordCount(response.data.total);
            props.setHeader(response.data.headers);
            props.setRecord(response.data.records);
            props.setConditions(filter);
            props.setfilterCondition(filter);
        });
    }

    /**
     * Check Validation
     */
    function checkValidate(){
        var returnFlag = true;
        let newError = Object.assign({}, errors);
        newError['field_name'] = false;

        let newData = Object.assign({}, filter);
        Object.entries(newData).map(([grpCondition_index, grpConditions]) => {
            Object.entries(grpConditions).map(([grpCondition, conditions], group_index) => {
                Object.entries(conditions).map(([condition_index, condition]) => {
                    if(! condition.field_name){
                        newError['field_name'] = true;
                        returnFlag =  false; 
                    }
                });
                
            });
        });
        setErrors(newError);

        return returnFlag;
    }

    function handleTagInputChange(selectedOptions, group_count , conditions_count, name){
        
        var selectedOption = [];
        Object.entries(selectedOptions).map(([key, tag])=> {
           (selectedOption).push(tag.value);
        })
        
        let newData = Object.assign({}, filter);
        Object.entries(newData).map(([grpCondition_index, grpConditions]) => {
            if(grpCondition_index == group_count){
                Object.entries(grpConditions).map(([grpCondition, conditions], group_index) => {
                    Object.entries(conditions).map(([condition_index, condition]) => {
                        if(condition_index == conditions_count){
                            newData[grpCondition_index][grpCondition][condition_index]['field_name'] = name;
                            newData[grpCondition_index][grpCondition][condition_index]['condition_value'] = selectedOption;
                        }
                    });
                });
            }
        });
        setFilter(newData);
    }

     /**
     * Add group condition
     */
      function addCondition(e){
        var grpCount = e.target.getAttribute('grp_count');
        let newFilter = Object.assign({}, filter);
        Object.entries(newFilter).map(([index, conditionsGroup]) => {
            Object.entries(conditionsGroup).map(([operator, conditions], groupIndex) => {
                if(index == grpCount){
                    conditionsGroup[operator].push(newCondition);
                }
            });
        }); 
        setFilter(newFilter);
    }

    return (
       <div>
        <div className="relative p-6 flex-auto max-h-[60vh] overflow-auto">
            <form id="filter_list_form">
                <div className="overscroll-auto">
                    {Object.entries(filter).map(([grpCondition_index, grpConditions]) => 
                        <>
                        {Object.entries(grpConditions).map(([grpCondition,conditions ],group_index ) => 
                            <>  
                            
                                <div className="relative mt-3 border border-gray-200 rounded-sm px-3 py-4 shadow-sm focus-within:ring-1 focus-within:ring-indigo-200 focus-within:border-indigo-200">
                                    <fieldset>
                                            <legend className="w-full">  
                                                <div className="flex w-full justify-between">
                                                    {grpCondition_index != 0 &&
                                                        <select
                                                            name="group_condition"
                                                            id="group_condition"
                                                            value={grpCondition}
                                                            group_index={grpCondition_index} 
                                                            onChange={ (e) => handleChange(e)}
                                                            className='mt-1 inline-flex w-28 py-2 px-3 bg-[#9BFFF2] border-0 rounded-sm shadow-sm focus:outline-none focus:ring-[#9BFFF2] focus:border-[#9BFFF2] sm:text-sm'
                                                        >
                                                            {(logic_operators).map((value) => {
                                                                return (
                                                                    <option defaultValue={grpCondition === value} value={value} > {value} </option>
                                                                )
                                                            })}
                                                        </select>
                                                    }
                                                    {grpCondition_index == 0 &&
                                                        <div></div>
                                                        }
                                                    <div 
                                                        group_index={grpCondition_index} 
                                                        type="button"
                                                        onClick={(e) => deleteGroup(grpCondition_index)}
                                                        className=" right-0 p-2 mx-2 cursor-pointer text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded">
                                                            <TrashIcon 
                                                                className='h-4 w-4 text-red-600 cursor-pointer' 
                                                            />
                                                    </div>
                                                
                                                </div>
                                            </legend>
                                    
                                        {Object.entries(conditions).map(([condition_index, condition]) => {
                                            var valueField = '';
                                            var selectedOptionValues = {'tag_relation': [] , 'list_relation': []};
                                            var optionValues = {'tag_relation': [] , 'list_relation': []};

                                            Object.entries(fields).map(([key, field])=> {
                                                if(field.field_name == condition.field_name){
                                                    condition.field_type = field.field_type
                                                }
                                                
                                                if(condition.field_type == 'tag'){
                                                    if(field.field_name == condition.field_name) {
                                                        optionValues[field.field_name] = field.options;
                                                        var selectedValues = [];
                                                        Object.entries(field.options).map(([key, tag])=> {
                                                            if(condition.condition_value == tag.value) {
                                                                (selectedValues).push(tag);
                                                            }
                                                        })
                                                        selectedOptionValues[field.field_name] = selectedValues;
                                                    }
                                                }
                                                
                                                if(field.field_name == condition.field_name){
                                                    
                                                    switch(condition.field_type){
                                                        case 'select' :
                                                            valueField = <select
                                                                name="condition_value"
                                                                group_index={grpCondition_index} 
                                                                condition_index={condition_index}
                                                                id="condition_value"
                                                                value={condition.condition_value}
                                                                onChange={ (e) => handleChange(e)}
                                                                className='mt-1 block w-full py-2 px-3 bg-[#9BFFF2] border-0 rounded-sm shadow-sm focus:outline-none focus:ring-[#9BFFF2] focus:border-[#9BFFF2] sm:text-sm'
                                                            >
                                                                {Object.entries(field.options).map(([name, label]) => 
                                                                    <option defaultValue={condition.condition_value === name} value={name}> {label} </option>
                                                                )}
                                                            </select>
                                                            break;
                                                        case 'dropdown':
                                                            valueField = <select
                                                                name="condition_value"
                                                                group_index={grpCondition_index} 
                                                                condition_index={condition_index}
                                                                id="condition_value"
                                                                value={condition.condition_value}
                                                                onChange={ (e) => handleChange(e)}
                                                                className='mt-1 block w-full py-2 px-3 bg-[#9BFFF2] border-0 rounded-sm shadow-sm focus:outline-none focus:ring-[#9BFFF2] focus:border-[#9BFFF2] sm:text-sm'
                                                            >
                                                                {Object.entries(field.options).map(([name, label]) => 
                                                                    <option defaultValue={condition.condition_value === name} value={name}> {label} </option>
                                                                )}
                                                            </select>
                                                            break;
                                                        case 'text':
                                                            valueField = <input
                                                                type='text'
                                                                className="focus:ring-[#9BFFF2] focus:border-[#9BFFF2] bg-[#F6FFFD] flex-1 block w-full rounded-sm sm:text-sm border border-[#67e8f9]"
                                                                name="condition_value"
                                                                group_index={grpCondition_index} 
                                                                condition_index={condition_index}
                                                                id= "condition_value"
                                                                onChange={(e) => handleChange(e)}
                                                                value={condition.condition_value}
                                                            />
                                                            break;
                                                        case 'checkbox':
                                                                valueField = <input
                                                                    type='checkbox'
                                                                    className="focus:ring-[#9BFFF2] focus:border-[#9BFFF2] bg-[#F6FFFD]  block rounded-sm sm:text-sm border border-[#67e8f9]"
                                                                    name="condition_value"
                                                                    group_index={grpCondition_index} 
                                                                    condition_index={condition_index}
                                                                    id= "condition_value"
                                                                    onChange={(e) => handleChange(e)}
                                                                    value={condition.condition_value}
                                                                />
                                                                break;
                                                        case 'textarea':
                                                                valueField = <textarea
                                                                    className="focus:ring-[#9BFFF2] focus:border-[#9BFFF2] bg-[#F6FFFD] flex-1 block w-full rounded-sm sm:text-sm border border-[#67e8f9]"
                                                                    name="condition_value"
                                                                    group_index={grpCondition_index} 
                                                                    condition_index={condition_index}
                                                                    id= "condition_value"
                                                                    onChange={(e) => handleChange(e)}
                                                                    value={condition.condition_value}
                                                                > {condition.condition_value}
                                                                </textarea> 
                                                                break;
                                                        default :
                                                            valueField = <input
                                                                type='text'
                                                                className="focus:ring-[#9BFFF2] focus:border-[#9BFFF2] bg-[#F6FFFD] flex-1 block w-full rounded-sm sm:text-sm border border-[#67e8f9]"
                                                                name="condition_value"
                                                                group_index={grpCondition_index} 
                                                                condition_index={condition_index}
                                                                id= "condition_value"
                                                                onChange={(e) => handleChange(e)}
                                                                value={condition.condition_value}
                                                            />

                                                    }
                                                }

                                            })
                                            return(
                                                <>
                                                    <div className="flex w-full">
                                                        <div className="flex flex-1  gap-2">
                                                            <div className="flex-1 flex items-center ">
                                                                <select
                                                                    name="field_name"
                                                                    group_index={grpCondition_index} 
                                                                    condition_index={condition_index}
                                                                    id="field_name"
                                                                    value={condition.field_name}
                                                                    onChange={ (e) => handleChange(e)}
                                                                    className='mt-1 block w-full py-2 px-3 bg-[#9BFFF2] border-0 rounded-sm shadow-sm focus:outline-none focus:ring-[#9BFFF2] focus:border-[#9BFFF2] sm:text-sm'
                                                                >
                                                                    <option value=""></option>
                                                                    {Object.entries(fields).map(([key, field]) => 
                                                                        <option field_type={field.field_type} defaultValue={condition.field_name === field.field_name} value={field.field_name}> {field.field_label} </option>
                                                                    )}
                                                                </select>
                                                            </div>
                                                            <div className="flex-1 flex items-center">
                                                                <select
                                                                    name="record_condition"
                                                                    group_index={grpCondition_index} 
                                                                    condition_index={condition_index}
                                                                    id="record_condition"
                                                                    value={condition.record_condition}
                                                                    onChange={ (e) => handleChange(e)}
                                                                    className='mt-1 block w-full py-2 px-3 bg-[#9BFFF2] border-0 rounded-sm shadow-sm focus:outline-none focus:ring-[#9BFFF2] focus:border-[#9BFFF2] sm:text-sm'
                                                                >
                                                                    {Object.entries(condition_operators[condition.field_type]).map(([name, label]) => 
                                                                        <option defaultValue={condition.record_condition === name} value={name}> {label} </option>
                                                                    )}
                                                                </select>
                                                            </div>
                                                            <div className="flex-1 flex items-center">
                                                                
                                                                {condition.record_condition != 'is_null' &&
                                                                    <>
                                                                        {condition.field_type != 'tag' ?
                                                                            <> {valueField} </>
                                                                        :
                                                                            <CreatableSelect
                                                                                isMulti 
                                                                                defaultValue={selectedOptionValues[condition.field_name]}
                                                                                onChange={(e) => handleTagInputChange(e, grpCondition_index, condition_index, condition.field_name)}
                                                                                options={optionValues[condition.field_name]} 
                                                                                name={condition.field_name}
                                                                                className='mt-1 block w-full py-2 px-3 bg-[#9BFFF2] border-0 rounded-sm shadow-sm focus:outline-none focus:ring-[#9BFFF2] focus:border-[#9BFFF2] sm:text-sm'
                                                                            
                                                                            />
                                                                        }
                                                                    </>
                                                                }
                                                            </div>
                                                            <div className="w-28 flex items-center">
                                                                <select
                                                                    name="condition_operator"
                                                                    id="condition_operator"
                                                                    group_index={grpCondition_index} 
                                                                    value={condition.condition_operator}
                                                                    condition_index={condition_index}
                                                                    onChange={ (e) => handleChange(e)}
                                                                    className='mt-1 block w-full py-2 px-3 bg-[#9BFFF2] border-0 rounded-sm shadow-sm focus:outline-none focus:ring-[#9BFFF2] focus:border-[#9BFFF2] sm:text-sm'
                                                                >
                                                                    {(logic_operators).map((value) => 
                                                                        <option defaultValue={condition.condition_operator === value} value={value}> {value} </option>
                                                                    )}
                                                                </select>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center justify-between p-4 space-x-6">
                                                            <button
                                                                type="button"
                                                                onClick={(e) => deleteCondition(grpCondition_index, condition_index)}
                                                                className="inline-flex  items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-sm text-black bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
                                                            >
                                                                <TrashIcon 
                                                                    group_index={grpCondition_index} 
                                                                    condition_index={condition_index}
                                                                    className='h-4 w-4 text-red-600 cursor-pointer' 
                                                                />

                                                            </button>
                                                        </div>       
                                                    </div>
                                                </>
                                            )
                                        })}
                                        
                                        <div>
                                            <button
                                                type="button"
                                                grp_count={grpCondition_index}
                                                onClick={(e) => addCondition(e)}
                                                className="inline-flex items-center mt-6 px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-sm text-black bg-[#F6FFFD] hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
                                            >
                                                <AddIcon
                                                    type="button"
                                                    grp_count={grpCondition_index}
                                                    onClick={(e) => addCondition(e)}
                                                    className="-ml-0.5 mr-2 h-4 w-4" 
                                                    aria-hidden="true" />
                                                {props.translator['Add New Condition']}
                                            </button>
                                        </div>
                                                
                                    </fieldset>
                                </div>
                            </>
                        )}   
                        </>
                    )}
                    <div className="w-full">
                        <button
                            type="button"
                            onClick={addConditionGroup}
                            className="inline-flex items-center mt-6 px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-sm text-black bg-[#F6FFFD] hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
                        >
                            <AddIcon
                                type="button"
                                onClick={addConditionGroup}
                                className="-ml-0.5 mr-2 h-4 w-4" 
                                aria-hidden="true" />
                            {props.translator['Add Group']}
                        </button>
                    </div>
                </div>
            </form>
        </div>

        <div className="flex items-center justify-end p-6 border-t border-solid border-slate-200 rounded-b">
            {errors.field_name &&
                <div className="absolute left-0 mx-2" ><small className="text-red-500"> Please fill the condition </small> </div>
            }
            <button
                className="bg-primary text-white active:bg-primary/80 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                type="button"
                onClick={() => searchFilterData()}
            >
                {props.translator['Search Filter']}
            </button>
        </div>

        </div>   
    );
}

export default FilterGroups;