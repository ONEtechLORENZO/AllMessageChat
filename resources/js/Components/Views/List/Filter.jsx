import React from "react";
import {AddIcon, DeleteIcon} from "../../../Pages/icons"
import { TrashIcon } from '@heroicons/react/24/solid';

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
        <div className="overscroll-auto">
            
            {Object.entries(props.filter).map(([grpCondition_index, grpConditions]) => 
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
                                                    onChange={ (e) => props.handleChange(e)}
                                                    className='mt-1 inline-flex w-28 py-2 px-3 bg-[#9BFFF2] border-0 rounded-sm shadow-sm focus:outline-none focus:ring-[#9BFFF2] focus:border-[#9BFFF2] sm:text-sm'
                                                >
                                                    {Object.entries(logic_operators).map(([key, value]) => {
                                                        return (
                                                            <option defaultValue={grpCondition === value.value} value={value.value} > {value.value} </option>
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
                                                onClick={(e) => props.deleteGroup(grpCondition_index)}
                                                className=" right-0 p-2 mx-2 cursor-pointer text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded">
                                                    <TrashIcon 
                                                        className='h-4 w-4 text-red-600 cursor-pointer' 
                                                    />
                                              </div>
                                        
                                        </div>
                                    </legend>
                              
                                {Object.entries(conditions).map(([condition_index, condition]) => 
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
                                                        onChange={ (e) => props.handleChange(e)}
                                                        className='mt-1 block w-full py-2 px-3 bg-[#9BFFF2] border-0 rounded-sm shadow-sm focus:outline-none focus:ring-[#9BFFF2] focus:border-[#9BFFF2] sm:text-sm'
                                                    >
                                                        
                                                        {Object.entries(props.fields).map(([key, field]) => 
                                                            <option defaultValue={condition.field_name === key} value={key}> {field.label} </option>
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
                                                        onChange={ (e) => props.handleChange(e)}
                                                        className='mt-1 block w-full py-2 px-3 bg-[#9BFFF2] border-0 rounded-sm shadow-sm focus:outline-none focus:ring-[#9BFFF2] focus:border-[#9BFFF2] sm:text-sm'
                                                    >
                                                        {Object.entries(condition_operators.text).map(([name, label]) => 
                                                            <option defaultValue={condition.record_condition === name} value={name}> {label} </option>
                                                        )}
                                                    </select>
                                                </div>
                                                <div className="flex-1 flex items-center">
                                                    {condition.record_condition != 'is_null' &&
                                                        <input
                                                            type='text'
                                                            className="focus:ring-[#9BFFF2] focus:border-[#9BFFF2] bg-[#F6FFFD] flex-1 block w-full rounded-sm sm:text-sm border border-[#67e8f9]"
                                                            name="condition_value"
                                                            group_index={grpCondition_index} 
                                                            condition_index={condition_index}
                                                            id= "condition_value"
                                                            onChange={(e) => props.handleChange(e)}
                                                            value={condition.condition_value}
                                                        />
                                                    }
                                                </div>
                                                <div className="w-28 flex items-center">
                                                    <select
                                                        name="condition_operator"
                                                        id="condition_operator"
                                                        group_index={grpCondition_index} 
                                                        value={condition.condition_operator}
                                                        condition_index={condition_index}
                                                        onChange={ (e) => props.handleChange(e)}
                                                        className='mt-1 block w-full py-2 px-3 bg-[#9BFFF2] border-0 rounded-sm shadow-sm focus:outline-none focus:ring-[#9BFFF2] focus:border-[#9BFFF2] sm:text-sm'
                                                    >
                                                        {Object.entries(logic_operators).map(([key, value]) => 
                                                            <option defaultValue={condition.condition_operator === value.value} value={value.value}> {value.value} </option>
                                                        )}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between p-4 space-x-6">
                                                <button
                                                    type="button"
                                                    onClick={(e) => props.deleteCondition(grpCondition_index, condition_index)}
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
                                )}
                                
                                <div>
                                    <button
                                        type="button"
                                        grp_count={grpCondition_index}
                                        onClick={(e) => props.addCondition(e)}
                                        className="inline-flex items-center mt-6 px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-sm text-black bg-[#F6FFFD] hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
                                    >
                                        <AddIcon
                                            type="button"
                                            grp_count={grpCondition_index}
                                            onClick={(e) => props.addCondition(e)}
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
                    onClick={props.addGroup}
                    className="inline-flex items-center mt-6 px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-sm text-black bg-[#F6FFFD] hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
                >
                    <AddIcon
                        type="button"
                        onClick={props.addGroup}
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












