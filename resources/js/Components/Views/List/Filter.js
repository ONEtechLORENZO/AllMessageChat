import React from "react";
import {AddIcon, DeleteIcon} from "../../../Pages/icons"
import { TrashIcon } from '@heroicons/react/solid';

function Filter(props)
{    
    const errors = props.errors;
    const logic_operators = [{ 'value': 'AND', 'label': 'AND'}, {'value': 'OR', 'label':'OR' }];
    const condition_operators = {
        'text':{
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
        }
    };
    return ( 
        <div className="height: 100vh; overscroll-auto">
            
            {Object.entries(props.filter).map(([grpCondition_index, grpConditions]) => 
                <>
                {Object.entries(grpConditions).map(([grpCondition,conditions ],group_index ) => 
                    <>
                        <div className="relative mt-3 border border-gray-300 rounded-md px-3 py-2 shadow-sm focus-within:ring-1 focus-within:ring-indigo-600 focus-within:border-indigo-600">
                            <fieldset>
                                    <legend> 
                                        <div className="flex">
                                            {grpCondition_index != 0 &&
                                                <select
                                                    name="group_condition"
                                                    id="group_condition"
                                                    value={grpCondition}
                                                    group_index={grpCondition_index} 
                                                    onChange={ (e) => props.handleChange(e)}
                                                    className={`mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                                                >
                                                    {Object.entries(logic_operators).map(([key, value]) => {
                                                        return (
                                                            <option defaultValue={grpCondition === value.value} value={value.value} > {value.value} </option>
                                                        )
                                                    })}
                                                </select>
                                              }
                                              <div 
                                                group_index={grpCondition_index} 
                                                type="button"
                                                onClick={(e) => props.deleteGroup(grpCondition_index)}
                                                className="absolute right-0 p-2 mx-2 cursor-pointer text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded">
                                                    <TrashIcon 
                                                        className='h-4 w-4 text-red-600 cursor-pointer' 
                                                    />
                                              </div>
                                        
                                        </div>
                                    </legend>
                              
                                {Object.entries(conditions).map(([condition_index, condition]) => 
                                    <>
                                        <div className="grid grid-cols-5 gap-6 sm:grid-cols-5 lg:grid-cols-5">
                                            <div className="w-full flex items-center justify-between p-6 space-x-6">
                                                <select
                                                    name="field_name"
                                                    group_index={grpCondition_index} 
                                                    condition_index={condition_index}
                                                    id="field_name"
                                                    value={condition.field_name}
                                                    onChange={ (e) => props.handleChange(e)}
                                                    className={`mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                                                >
                                                    
                                                    {Object.entries(props.fields).map(([key, field]) => 
                                                        <option defaultValue={condition.field_name === key} value={key}> {field.label} </option>
                                                    )}
                                                </select>
                                            </div>
                                            <div className="w-full flex items-center justify-between p-6 space-x-6">
                                                <select
                                                    name="record_condition"
                                                    group_index={grpCondition_index} 
                                                    condition_index={condition_index}
                                                    id="record_condition"
                                                    value={condition.record_condition}
                                                    onChange={ (e) => props.handleChange(e)}
                                                    className={`mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                                                >
                                                    {Object.entries(condition_operators.text).map(([name, label]) => 
                                                        <option defaultValue={condition.record_condition === name} value={name}> {label} </option>
                                                    )}
                                                </select>
                                            </div>
                                            <div className="w-full flex items-center justify-between p-6 space-x-6">
                                                {condition.record_condition != 'is_null' &&
                                                    <input
                                                        type='text'
                                                        className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-md sm:text-sm border-gray-300 "
                                                        name="condition_value"
                                                        group_index={grpCondition_index} 
                                                        condition_index={condition_index}
                                                        id= "condition_value"
                                                        onChange={(e) => props.handleChange(e)}
                                                        value={condition.condition_value}
                                                    />
                                                }
                                            </div>
                                            <div className="w-full flex items-center justify-between p-6 space-x-6">
                                                <select
                                                    name="condition_operator"
                                                    id="condition_operator"
                                                    group_index={grpCondition_index} 
                                                    value={condition.condition_operator}
                                                    condition_index={condition_index}
                                                    onChange={ (e) => props.handleChange(e)}
                                                    className={`mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                                                >
                                                    {Object.entries(logic_operators).map(([key, value]) => 
                                                        <option defaultValue={condition.condition_operator === value.value} value={value.value}> {value.value} </option>
                                                    )}
                                                </select>
                                            </div>
                                            <div className="w-full flex items-center justify-between p-6 space-x-6">
                                                <button
                                                    type="button"
                                                    onClick={(e) => props.deleteCondition(grpCondition_index, condition_index)}
                                                    className="inline-flex float-right items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-black bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
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
                                )}
                                
                                <div>
                                    <button
                                        type="button"
                                        grp_count={grpCondition_index}
                                        onClick={(e) => props.addCondition(e)}
                                        className="inline-flex float-right items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-black bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
                                    >
                                        <AddIcon
                                            type="button"
                                            grp_count={grpCondition_index}
                                            onClick={(e) => props.addCondition(e)}
                                            className="-ml-0.5 mr-2 h-4 w-4" 
                                            aria-hidden="true" />
                                        ADD
                                    </button>
                                </div>
                                        
                            </fieldset>
                        </div>
                    </>
                )}   
                </>
            )}
             <div>
                <button
                    type="button"
                    onClick={props.addGroup}
                    className="my-3 inline-flex float-right items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-black bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
                >
                    <AddIcon
                        type="button"
                        onClick={props.addGroup}
                        className="-ml-0.5 mr-2 h-4 w-4" 
                        aria-hidden="true" />
                    ADD Group
                </button>
            </div>
            <br />
            <div className="mt-6 sm:mt-5 space-y-6 sm:space-y-5">
                <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                    <label htmlFor="filter_name" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                        Filter name
                    </label>
                    <div className="mt-1 sm:mt-0 sm:col-span-2">
                        <div className="max-w-lg flex rounded-md shadow-sm">
                        <input
                            type="text"
                            name="filter_name"
                            value={props.filterName}
                            id="filter_name"
                            autoComplete="filter_name"
                            onChange={ (e) => props.handleChange(e)}
                            className="flex-1 block w-full focus:ring-indigo-500 focus:border-indigo-500 min-w-0 rounded-none rounded-r-md sm:text-sm border-gray-300"
                        />
                        </div>
                        <div>
                            {props.errors.filter_name &&
                                <small className="text-red-500"> Please fill the name </small>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Filter;