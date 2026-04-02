import React, {useState, useEffect}from "react";
import { AddIcon } from "../icons";
import { TrashIcon } from '@heroicons/react/24/solid';
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

    const isDark = props.variant === 'dark';
    const isCampaignWizard = isDark && props.ui === 'campaign_wizard';
    const selectClass = isDark
        ? isCampaignWizard
            ? "mt-1 block w-full rounded-xl border-0 bg-black/35 px-4 py-3 text-sm text-white/90 focus:border-0 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/25"
            : "mt-1 block w-full rounded-lg border-0 bg-[#202020] px-3 py-2 text-sm text-white focus:border-0 focus:ring-[#BF00FF]/40"
        : "mt-1 block w-full py-2 px-3 bg-[#9BFFF2] border-0 rounded-sm shadow-sm focus:outline-none focus:ring-[#9BFFF2] focus:border-[#9BFFF2] sm:text-sm";
    const inputClass = isDark
        ? isCampaignWizard
            ? "block w-full rounded-xl border-0 bg-black/35 px-4 py-3 text-sm text-white/90 focus:border-0 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/25"
            : "block w-full rounded-lg border-0 bg-[#202020] px-3 py-2 text-sm text-white focus:border-0 focus:ring-[#BF00FF]/40"
        : "focus:ring-[#9BFFF2] focus:border-[#9BFFF2] bg-[#F6FFFD] flex-1 block w-full rounded-sm sm:text-sm border border-[#67e8f9]";
    const cardClass = isDark
        ? isCampaignWizard
            ? "relative mt-4 rounded-2xl border-0 bg-white/[0.04] px-5 py-5 shadow-[0_18px_55px_rgba(0,0,0,0.3)]"
            : "relative mt-3 rounded-xl border-0 bg-[#120815]/70 px-4 py-5 shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
        : "relative mt-3 border border-gray-200 rounded-sm px-3 py-4 shadow-sm focus-within:ring-1 focus-within:ring-indigo-200 focus-within:border-indigo-200";
    const actionBtnClass = isDark
        ? isCampaignWizard
            ? "inline-flex items-center mt-6 px-4 py-2.5 rounded-lg border-0 bg-sky-500/90 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(59,130,246,0.18)] hover:bg-sky-500 transition"
            : "inline-flex items-center mt-6 px-3 py-2 rounded-lg border-0 bg-[#202020] text-sm font-medium text-white/80 hover:bg-[#2a2a2a] hover:text-white transition"
        : "inline-flex items-center mt-6 px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-sm text-black bg-[#F6FFFD] hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300";
    const groupActionBtnClass = isDark
        ? isCampaignWizard
            ? "inline-flex items-center mt-6 px-4 py-2.5 rounded-lg border-0 bg-violet-600/90 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(124,58,237,0.18)] hover:bg-violet-600 transition"
            : "inline-flex items-center mt-6 px-3 py-2 rounded-lg border-0 bg-[#202020] text-sm font-medium text-white/80 hover:bg-[#2a2a2a] hover:text-white transition"
        : "inline-flex items-center mt-6 px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-sm text-black bg-[#F6FFFD] hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300";
    const trashBtnClass = isDark
        ? isCampaignWizard
            ? "inline-flex items-center rounded-lg border-0 bg-transparent px-3 py-2 text-red-400 hover:text-red-300 transition"
            : "inline-flex items-center rounded-lg border-0 bg-[#202020] px-3 py-2 text-white/70 hover:bg-[#2a2a2a] hover:text-red-200 transition"
        : "inline-flex  items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-sm text-black bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300";
    const footerBtnClass = isDark
        ? "bg-[#BF00FF] text-white font-semibold text-sm px-6 py-3 rounded-lg shadow-[0_10px_25px_rgba(191,0,255,0.3)] hover:bg-[#a100df] transition"
        : "bg-primary text-white active:bg-primary/80 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150";

    const wizardMiniLabelClass = isCampaignWizard
        ? "text-[12px] font-semibold tracking-wide text-white/65"
        : "";

    const campaignTagSelectStyles = isCampaignWizard
        ? {
              control: (base) => ({
                  ...base,
                  backgroundColor: "rgba(0,0,0,0.35)",
                  borderColor: "transparent",
                  boxShadow: "none",
                  minHeight: 46,
              }),
              valueContainer: (base) => ({
                  ...base,
                  padding: "6px 12px",
              }),
              input: (base) => ({
                  ...base,
                  color: "rgba(255,255,255,0.9)",
              }),
              placeholder: (base) => ({
                  ...base,
                  color: "rgba(255,255,255,0.45)",
              }),
              multiValue: (base) => ({
                  ...base,
                  backgroundColor: "rgba(255,255,255,0.10)",
              }),
              multiValueLabel: (base) => ({
                  ...base,
                  color: "rgba(255,255,255,0.9)",
              }),
              multiValueRemove: (base) => ({
                  ...base,
                  color: "rgba(255,255,255,0.65)",
                  ":hover": {
                      backgroundColor: "rgba(217,70,239,0.15)",
                      color: "rgba(255,255,255,0.95)",
                  },
              }),
              menu: (base) => ({
                  ...base,
                  backgroundColor: "#140816",
                  borderRadius: 14,
                  overflow: "hidden",
              }),
              option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isFocused
                      ? "rgba(217,70,239,0.18)"
                      : "#140816",
                  color: "rgba(255,255,255,0.92)",
              }),
          }
        : undefined;
    
    useEffect(() => {
        if(props.filterCondition){
            setFilter(props.filterCondition);
        }
        fetchModuleFields();
    }, []);

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
        if (props.restrictToRelationFields) {
            setFields(relationFields);
            return;
        }

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
        if(props.is_flow){
            props.updateNodeCondition(props.nodeId,filter);
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
                                
                                    <div className={cardClass}>
                                        {isCampaignWizard ? (
                                            <button
                                                type="button"
                                                onClick={(e) => deleteGroup(grpCondition_index)}
                                                className="absolute right-5 top-5 text-red-500/95 hover:text-red-400 transition"
                                                aria-label={props.translator['Delete'] ?? 'Delete'}
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        ) : null}
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
                                                                className={`${selectClass} mt-0 w-28`}
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
                                                        {!isCampaignWizard ? (
                                                            <div 
                                                                group_index={grpCondition_index} 
                                                                type="button"
                                                                onClick={(e) => deleteGroup(grpCondition_index)}
                                                                className="right-0 p-2 mx-2 cursor-pointer text-white/50 hover:text-white hover:bg-[#202020] rounded-lg transition"
                                                            >
                                                                <TrashIcon className='h-4 w-4 text-red-600 cursor-pointer' />
                                                            </div>
                                                        ) : null}
                                                    
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
                                                                    className={selectClass}
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
                                                                    className={selectClass}
                                                                >
                                                                    {Object.entries(field.options).map(([name, label]) => 
                                                                        <option defaultValue={condition.condition_value === name} value={name}> {label} </option>
                                                                    )}
                                                                </select>
                                                                break;
                                                            case 'text':
                                                                valueField = <input
                                                                    type='text'
                                                                    className={inputClass}
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
                                                                        className={inputClass}
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
                                                                        className={inputClass}
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
                                                                    className={inputClass}
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
                                                        <div className={isCampaignWizard ? "relative mt-6 rounded-2xl bg-black/20 px-6 py-6 shadow-[0_18px_55px_rgba(0,0,0,0.28)]" : "flex w-full"}>
                                                            {isCampaignWizard ? (
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => deleteCondition(grpCondition_index, condition_index)}
                                                                    className="absolute right-4 top-4 text-red-500/95 hover:text-red-400 transition"
                                                                    aria-label={props.translator['Delete'] ?? 'Delete'}
                                                                >
                                                                    <TrashIcon className="h-5 w-5" />
                                                                </button>
                                                            ) : null}

                                                            {isCampaignWizard ? (
                                                                <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5">
                                                                    <div className="lg:col-span-4">
                                                                        <div className={wizardMiniLabelClass}>Select Filter From TAG &amp; LIST</div>
                                                                        <select
                                                                            name="field_name"
                                                                            group_index={grpCondition_index} 
                                                                            condition_index={condition_index}
                                                                            id="field_name"
                                                                            value={condition.field_name}
                                                                            onChange={ (e) => handleChange(e)}
                                                                            className={`${selectClass} mt-2`}
                                                                        >
                                                                            <option value=""></option>
                                                                            {Object.entries(fields).map(([key, field]) => 
                                                                                <option field_type={field.field_type} defaultValue={condition.field_name === field.field_name} value={field.field_name}> {field.field_label} </option>
                                                                            )}
                                                                        </select>
                                                                    </div>

                                                                    <div className="lg:col-span-2">
                                                                        <div className={wizardMiniLabelClass}>&nbsp;</div>
                                                                        <select
                                                                            name="record_condition"
                                                                            group_index={grpCondition_index} 
                                                                            condition_index={condition_index}
                                                                            id="record_condition"
                                                                            value={condition.record_condition}
                                                                            onChange={ (e) => handleChange(e)}
                                                                            className={`${selectClass} mt-2`}
                                                                        >
                                                                            {Object.entries(condition_operators[condition.field_type]).map(([name, label]) => 
                                                                                <option defaultValue={condition.record_condition === name} value={name}> {label} </option>
                                                                            )}
                                                                        </select>
                                                                    </div>

                                                                    <div className="lg:col-span-4">
                                                                        <div className={wizardMiniLabelClass}>Select TAG or LIST</div>
                                                                        <div className="mt-2">
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
                                                                                            className={selectClass}
                                                                                            styles={campaignTagSelectStyles}
                                                                                        />
                                                                                    }
                                                                                </>
                                                                            }
                                                                        </div>
                                                                    </div>

                                                                    <div className="lg:col-span-2">
                                                                        <div className={wizardMiniLabelClass}>&nbsp;</div>
                                                                        <select
                                                                            name="condition_operator"
                                                                            id="condition_operator"
                                                                            group_index={grpCondition_index} 
                                                                            value={condition.condition_operator}
                                                                            condition_index={condition_index}
                                                                            onChange={ (e) => handleChange(e)}
                                                                            className={`${selectClass} mt-2 w-28`}
                                                                        >
                                                                            {(logic_operators).map((value) => 
                                                                                <option defaultValue={condition.condition_operator === value} value={value}> {value} </option>
                                                                            )}
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                            <>
                                                            <div className="flex flex-1  gap-2">
                                                                <div className="flex-1 flex items-center ">
                                                                    <select
                                                                        name="field_name"
                                                                        group_index={grpCondition_index} 
                                                                        condition_index={condition_index}
                                                                        id="field_name"
                                                                        value={condition.field_name}
                                                                        onChange={ (e) => handleChange(e)}
                                                                        className={selectClass}
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
                                                                        className={selectClass}
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
                                                                                    className={selectClass}
                                                                                    styles={campaignTagSelectStyles}
                                                                                
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
                                                                        className={selectClass}
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
                                                                    className={trashBtnClass}
                                                                >
                                                                    <TrashIcon 
                                                                        group_index={grpCondition_index} 
                                                                        condition_index={condition_index}
                                                                        className='h-4 w-4 text-red-600 cursor-pointer' 
                                                                    />

                                                                </button>
                                                            </div>       
                                                            </>
                                                            )}
                                                        </div>
                                                    </>
                                                )
                                            })}
                                            
                                            <div>
                                                <button
                                                    type="button"
                                                    grp_count={grpCondition_index}
                                                    onClick={(e) => addCondition(e)}
                                                    className={actionBtnClass}
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
                                className={groupActionBtnClass}
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

            {!props.hideFooter ? (
                <div className={`flex items-center justify-end p-6 ${isDark ? '' : 'border-t border-slate-200'} rounded-b`}>
                    {errors.field_name &&
                        <div className="absolute left-0 mx-2" ><small className="text-red-500"> {props.translator['Please fill the condition']} </small> </div>
                    }
                    <button
                        className={footerBtnClass}
                        type="button"
                        onClick={() => searchFilterData()}
                    >
                    {props.is_flow ?
                            <> Save condition </>
                            :
                            <> {props.buttonLabel ? props.buttonLabel : props.translator['Search Filter']} </>
                        }  
                    </button>
                </div>
            ) : null}

        </div>   
    );
}

export default FilterGroups;












