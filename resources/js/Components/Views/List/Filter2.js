import React, { useState, useEffect } from "react";
import Dropdown from "@/Components/Dropdown";
import { SettingIcon, PencilIcon, DeleteIcon, AddIcon } from "../../../Pages/icons";
import { TrashIcon } from '@heroicons/react/solid';
import Axios from "axios";
import notie from 'notie';
import nProgress from 'nprogress';
import { Inertia } from '@inertiajs/inertia';
import CreatableSelect, { useAsync } from 'react-select';

function Filter(props)
{    
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
            'field_label': 'Tag',
            'field_name': 'tag_relation',
            'field_type': 'tag',
            'is_mandatory': 0,
            'options': props.filter.tag_list
        },
        {
            'field_label': 'List',
            'field_name': 'list_relation',
            'field_type': 'tag',
            'is_mandatory': 0,
            'options': props.filter.category_list
        }
    ];


    const condition_operators = {
        'text':{
            'equal':  'Equal',
            'contains': 'Contains',
            'is_null': 'Null',
            'not_equal': 'Not equal',
            'start_with': 'Start with',
            'end_with': 'End with',
        },
        'string':{
            'equal':  'Equal',
            'contains': 'Contains',
            'is_null': 'Null',
            'not_equal': 'Not equal',
            'start_with': 'Start with',
            'end_with': 'End with',
        },
        'date':{
            'equal':  'Equal',
            'not_equal': 'Not equal',
            'is_null': 'Null',
            'lesser_than': 'Lesser than',
            'greater_than': 'Greater than'
        },
        'select':{
            'equal':  'Equal',
            'not_equal': 'Not equal',
            'is_null': 'Null',
        },
        'dropdown':{
            'equal':  'Equal',
            'not_equal': 'Not equal',
            'is_null': 'Null',
        },
        'phone_number':{
            'contains': 'Contains',
            'equal':  'Equal',
            'not_equal': 'Not equal',
            'is_null': 'Null',
        },
        'checkbox': {
            'equal':  'Equal',
        },
        'tag': {
            'equal':  'Equal',
        }
    };
    const [filter, setFilter] = useState([
        {'AND': [newCondition]}
    ]);

    const [fields, setFields] = useState([]);
    const [filterList , setFilterList ] = useState(props.filter.filter_list);
    const [openFilterModal, setOpenFilterModal ] = useState(false);
    const [filterName, setFilterName] = useState('');
    const [selectedFilter , setSelectedFilter] = useState(props.filter.selected_filter);
    const [errors, setErrors] = useState({});
    const [selectedOptions, setSelectedOptions] = useState({'tag_relation': {} , 'list_relation': {}});
    const [tagOptions, setTagOptions] = useState(props.filter.tag_list);

    useEffect(() => {
        fetchModuleFields();
    }, []);

    // Apply filter data
    function applyFilter( filter ){
        var url = route('listContact') + '?filter_id='+filter;
        Inertia.get(url,  {
            onSuccess: (response) => {
                setOpenFilterModal(false);
            },
        });
    }

    // Create Filter
    function createFilter(){
        setFilter([
            {'AND': [newCondition]}
        ]);
        setFilterName('');
        setSelectedFilter('');
        setOpenFilterModal(true);
    }

    //Edit filter Data 
    function editFilter(filter){
        nProgress.start(0.5);
        nProgress.inc(0.2);

        axios({
            method: 'get',
            url: route('get_filter_data', {'filter_id': filter}),
        })
        .then( (response) =>{
           setFilter(response.data.conditions);
           setFilterName(response.data.name);
           setSelectedFilter(filter);
           setOpenFilterModal(true);
           nProgress.done(true);
        });
    }

    // Delete Filter
    function deleteFilter(filter){
        if(confirm('Do you want to delete the filter?')){
            var data = {'filter_id':filter };
            nProgress.start(0.5);
            nProgress.inc(0.2);
            Inertia.post(route('delete_filter'), data, {
                onSuccess: (response) => {
                    Object.entries(filterList).map(([filter_index, filterData])=> {
                        if(filterData['id'] == filter){
                            filterList.splice(filter_index,1);
                            setFilter(filterList);
                        }
                    });
                    setOpenFilterModal(false);
                    nProgress.done(true);
                },
            });
        }
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
     * Delete Filte Group
     */
    function deleteGroup(group_count){
        if(confirm('Do you want to delete group?')){
            let newData = Object.assign({}, filter);
            delete newData[group_count]; 
            setFilter(newData);
        }
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
     * Search Filter
     */
    function searchFilterData(){
        var is_valid = checkValidate();
        if(!is_valid){
            return false;
        }
        
        var advancedSearch = JSON.stringify(filter);
        var url = route('listContact') + '?filter='+advancedSearch;
        
        Inertia.get(url,  {
            onSuccess: (response) => {
                setOpenFilterModal(false);
            },
        });
    }
    function saveFilterCondition(){
        var is_valid = checkValidate();
        if(!is_valid){
            return false;
        }

        if(!filterName){
            let newError = Object.assign({}, errors);
            newError['filter_name'] = true;
            setErrors(newError);
        } else {
            var data = {'filter': JSON.stringify(filter), 'module_name': props.module, 'filter_name': filterName, 'filter_id':selectedFilter };
            Inertia.post(route('store_filter'), data, {
                onSuccess: (response) => {
                    setOpenFilterModal(false);
                },
            });
        }
    }

    /**
     * Return Tag List
     */
    function loadTagOptions(searchKey, callback){
        if(!searchKey){
            return false;
        }
        console.log(searchKey);
        axios({
            method: 'get',
            url: route('get_tag_list', {'key': searchKey}),
        })
        .then( (response) =>{
            callback(response.data.tag_list);
        });
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
    
    return ( 
        <>
            <div className="overscroll-auto">
                <Dropdown >
                    <Dropdown.Trigger>
                        <span className="inline-flex rounded-md">
                            <button
                                type="button"
                                className="w-10 h-10 bg-white shadow-sm flex items-center justify-center"
                            >
                                <SettingIcon />
                            </button>
                        </span>
                    </Dropdown.Trigger>

                    <Dropdown.Content align="" contentClasses="right-4 py-1 bg-white w-64 shadow-lg">
                            
                    <ul role="list" className="divide-y divide-gray-200 overflow-y-auto m-h-64">
                        
                        <li onClick={ ()=> applyFilter('All')} className={"px-4 py-2 text-gray-900 text-sm hover:bg-sky-700 cursor-pointer "+ (selectedFilter == 'All' && 'bg-gray-100' ) }>
                            All
                        </li>
                        {Object.entries(props.filter.filter_list).map(([filter_index, filterData])=>
                            <li  key={filterData['id']} className={"px-4 py-2 hover:bg-sky-700 cursor-pointer "+ (selectedFilter == filterData['id'] ? 'bg-gray-100' : '' ) }>
                                <div class="flex text-white hover:text-gray-900">
                                    <div className="flex-auto w-80 text-gray-900 text-sm" onClick={()=> applyFilter(filterData['id'])}> {filterData['name']} </div>
                                    <div className=" flex-initial right-3 p-1 ml-1" onClick={() => editFilter(filterData['id']) } >  <PencilIcon className="float-right" /></div> 
                                    <div className="flex-initial right-0 p-1 ml-1" onClick={() => deleteFilter(filterData['id']) } >  <DeleteIcon className="float-right" /></div> 
                                </div>
                            </li>
                        )}
                        <li onClick={()=> createFilter()} className="px-4 py-2 text-gray-900 text-sm hover:bg-sky-700 cursor-pointer">
                            Add New
                        </li>
                    </ul>
                    </Dropdown.Content>
                </Dropdown>
            </div>
            <div>
                {openFilterModal &&
                <>
                    <div
                        className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none"
                    >
                        <div className="relative w-auto my-6 mx-auto max-w-5xl lg:min-w-[900px]">
                            <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                                <div className="flex items-start justify-between p-5 border-b border-solid border-slate-200 rounded-t">
                                    <h3 className="text-3xl font-semibold">
                                        Search filter
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={() => saveFilterCondition()}
                                        className="inline-flex items-center gap-2 px-4 py-2 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-gray-500 hover:bg-gray-700 active:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                    >
                                        <svg width={19} height={19} fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M4.5.5v3.4c0 .56 0 .84.109 1.054a1 1 0 0 0 .437.437C5.26 5.5 5.54 5.5 6.1 5.5h6.8c.56 0 .84 0 1.054-.109a1 1 0 0 0 .437-.437c.109-.214.109-.494.109-1.054V1.5m0 17v-6.4c0-.56 0-.84-.109-1.054a1 1 0 0 0-.437-.437c-.214-.109-.494-.109-1.054-.109H6.1c-.56 0-.84 0-1.054.109a1 1 0 0 0-.437.437C4.5 11.26 4.5 11.54 4.5 12.1v6.4m14-11.675V13.7c0 1.68 0 2.52-.327 3.162a3 3 0 0 1-1.311 1.311c-.642.327-1.482.327-3.162.327H5.3c-1.68 0-2.52 0-3.162-.327a3 3 0 0 1-1.311-1.311C.5 16.22.5 15.38.5 13.7V5.3c0-1.68 0-2.52.327-3.162A3 3 0 0 1 2.138.827C2.78.5 3.62.5 5.3.5h6.875c.489 0 .733 0 .963.055.204.05.4.13.579.24.201.123.374.296.72.642l3.126 3.126c.346.346.519.519.642.72.11.18.19.374.24.579.055.23.055.474.055.963Z" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>

                                        Save Filter
                                    </button>                        
                                </div>
                                {/*body*/}
                                <div className="relative p-6 flex-auto max-h-[60vh] overflow-auto">
                                    <form id="filter_list_form">
                                        {/* <Filter
                                            fields={props.headers}
                                            filter={filter}
                                            filterList={props.filterList}
                                            filterName={filterName}
                                            selectedFilter={selectedFilter} 
                                            addCondition={addCondition}
                                            handleChange={handleChange}
                                            deleteCondition={deleteCondition}
                                            deleteGroup={deleteGroup}
                                            addGroup={addConditionGroup}
                                            errors={errors}
                                        /> */}


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
                                                                                                      //  value={selectedOptions}
                                                                                                        defaultValue={selectedOptionValues[condition.field_name]}
                                                                                                        onChange={(e) => handleTagInputChange(e, grpCondition_index, condition_index, condition.field_name)}
                                                                                                    //    loadOptions={loadTagOptions}
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
                                                                        Add New Contidion
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
                                                    Add Group
                                                </button>
                                            </div>
                                            <br />
                                            <div className="mt-6 sm:mt-5 space-y-6 sm:space-y-5 clear-both">
                                                <div className="sm:grid sm:grid-cols-4 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                                                    <label htmlFor="filter_name" className="block text-sm text-right font-medium text-gray-700 sm:mt-px sm:pt-2">
                                                        Filter name
                                                    </label>
                                                    <div className="mt-1 sm:mt-0 sm:col-span-3">
                                                        <div className="max-w-lg flex rounded-sm shadow-sm">
                                                        <input
                                                            type="text"
                                                            name="filter_name"
                                                            value={filterName}
                                                            id="filter_name"
                                                            autoComplete="filter_name"
                                                            onChange={ (e) => handleChange(e)}
                                                            className="flex-1 block w-full focus:ring-indigo-500 focus:border-indigo-500 min-w-0 rounded-none rounded-r-md sm:text-sm border-gray-300"
                                                        />
                                                        </div>
                                                        <div>
                                                            {errors.filter_name &&
                                                                <small className="text-red-500"> Please fill the name </small>
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>



                                    </form>
                                </div>
                                
                                {/*footer*/}
                                <div className="flex items-center justify-end p-6 border-t border-solid border-slate-200 rounded-b">
                                    {errors.field_name &&
                                        <div className="absolute left-0 mx-2" ><small className="text-red-500"> Please fill the condition </small> </div>
                                    }
                                    <button
                                        className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                                        type="button"
                                        onClick={() => setOpenFilterModal(false)}
                                    >
                                        Close
                                    </button>
                                    
                                    <button
                                        className="bg-primary text-white active:bg-primary/80 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                                        type="button"
                                        onClick={() => searchFilterData()}
                                    >
                                        Search Filter
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
                </>
                }
            </div>
        </>
       
        
    );
}

export default Filter;