import React, { Fragment, useEffect, useRef, useState } from "react";
import { SettingIcon, SearchIcon } from "../../../Pages/icons";
import Pagination from "@/Components/Pagination";
import { useForm, Link } from '@inertiajs/inertia-react';
import { Dialog, Transition } from '@headlessui/react'
import Filter from "./Filter";
import axios from "axios";
import { Inertia } from '@inertiajs/inertia';

function ListView(props)
{
    const newCondition = {
        'field_name': '',
        'record_condition': '',
        'condition_value': '',
        'condition_operator': ''
    };
    const [records, setRecords] = useState(props.records);
    const [openFilterModal, setOpenFilterModal ] = useState(false);
    const [filterName, setFilterName] = useState('');
    const [selectedFilter , setSelectedFilter] = useState('');
    const [errors, setErrors] = useState({});
    const { searchData, setSearchData, post, processing, reset } = useForm({});
    const cancelButtonRef = useRef(null);
    const [filter, setFilter] = useState([
        {'AND': [newCondition]}
    ]);

    useEffect(() => { 
        if(props.filter){
            setFilter(props.filter);
        }
        if(props.selectedFilter){
            setSelectedFilter(props.selectedFilter);
            Object.entries(props.filterList).map(([filter_index, filterData])=>{
                if(filterData['id'] == props.selectedFilter){
                    setFilterName(filterData['name']);
                }
            })
        }
    },[]);

    /**
     * Add group condition
     */
    function addCondition(e){
        var grpCount = e.target.getAttribute('grp_count');
        let newFilter = Object.assign({}, filter);
        Object.entries(newFilter).map(([index, conditionsGroup]) => {
            Object.entries(conditionsGroup).map(([operator, conditions], groupIndex) => {
                if(index == grpCount){
                  //  var conditionGroupLength = Object.entries(conditionsGroup).length;
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
     * Delete filter condition
     */
    function deleteCondition(event){
        var group_count = event.target.getAttribute('group_index');
        var conditions_count = event.target.getAttribute('condition_index');
        let newData = Object.assign({}, filter);
        Object.entries(newData).map(([grpCondition_index, grpConditions]) => {
            Object.entries(newData).map(([grpConditionsIndex, groupConditions], group_index) => {
                if(grpCondition_index == group_count){
                    Object.entries(groupConditions).map(([condition_index, conditions]) => {
                        if(newData[grpCondition_index][condition_index] && (grpCondition_index == group_count )){
                            Object.entries(conditions).map(([grpConditionIndex, condition]) => {
                                if(grpConditionIndex == conditions_count ){
                                   newData[grpCondition_index][condition_index].splice(conditions_count,1);
                                }
                            });
                        }
                    });
                }
            });
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
                    url: route('get_filter_data', {'selected_filter': value}),
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
                                }
                            });
                        }
                    }
                });
            });
            setFilter(newData);
        }
        
    }
    function searchFilterData(){
        var advancedSearch = JSON.stringify(filter);
        var url = route('contacts') + '?filter='+advancedSearch;
        if(selectedFilter){
            url += '&filter_id='+selectedFilter;
        }
        Inertia.get(url,  {
            onSuccess: (response) => {
                setOpenCreateContactModal(false);
            },
        });
    }
    function saveFilterCondition(){
        if(!filterName){
            let newError = Object.assign({}, errors);
            newError['filter_name'] = true;
            setErrors(newError);
        } else {
            var advancedSearch = JSON.stringify(filter);
            var url = route('contacts') + '?filter='+advancedSearch+'&filter_name='+filterName;
            if(selectedFilter){
                url += '&filter_id='+selectedFilter;
            }
            Inertia.get(url,  {
                onSuccess: (response) => {
                    setOpenCreateContactModal(false);
                },
            });
        }
    }
    return (
       <>
            <div className="px-4 sm:px-6 lg:px-8 bg-[#FBFBFBBF]">
                <div className="sm:flex sm:items-center sm:justify-between">
                    <div className="flex gap-3">
                        <button 
                            type='button'
                            onClick={()=> setOpenFilterModal(true)}
                            className="w-10 h-10 bg-white shadow-sm flex items-center justify-center">
                            <SettingIcon 
                            />
                        </button>

                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <SearchIcon
                                    className="h-5 w-5 text-gray-400"
                                    aria-hidden="true"
                                />
                            </div>
                            <input
                                type="search"
                                name="search"
                                id="search"
                                className="focus:ring-indigo-500 focus:border-primary/50 border-0 block w-full pl-10 sm:text-sm  rounded-md"
                                placeholder="Search"
                            />
                        </div>
                        <div>
                        <button
                    onClick={(e)=>search(e)}
                    className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
                        >                        
                        Search                        
                    </button>
                    </div>
                        <div className="flex items-center text-[#3D4459] gap-2 ml-5">
                            <svg
                                width={22}
                                height={20}
                                viewBox="0 0 22 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M21 19V17C21 15.1362 19.7252 13.5701 18 13.126M14.5 1.29076C15.9659 1.88415 17 3.32131 17 5C17 6.67869 15.9659 8.11585 14.5 8.70924M16 19C16 17.1362 16 16.2044 15.6955 15.4693C15.2895 14.4892 14.5108 13.7105 13.5307 13.3045C12.7956 13 11.8638 13 10 13H7C5.13623 13 4.20435 13 3.46927 13.3045C2.48915 13.7105 1.71046 14.4892 1.30448 15.4693C1 16.2044 1 17.1362 1 19M12.5 5C12.5 7.20914 10.7091 9 8.5 9C6.29086 9 4.5 7.20914 4.5 5C4.5 2.79086 6.29086 1 8.5 1C10.7091 1 12.5 2.79086 12.5 5Z"
                                    stroke="#3D4459"
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                            <div><span className="font-semibold">{props.paginator.total}</span> {props.module} </div>
                        </div>
                    </div>
                    <div className="mt-4 sm:mt-0 sm:ml-16 flex gap-3">
                        <button
                            type="button"
                            className="inline-flex items-center px-2.5 py-1.5 border-0 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3D4459]"
                        >
                            <svg
                                className="-ml-0.5 mr-2 h-4 w-4"
                                viewBox="0 0 16 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M14.75 10.25V11.15C14.75 12.4101 14.75 13.0402 14.5048 13.5215C14.289 13.9448 13.9448 14.289 13.5215 14.5048C13.0402 14.75 12.4101 14.75 11.15 14.75H4.85C3.58988 14.75 2.95982 14.75 2.47852 14.5048C2.05516 14.289 1.71095 13.9448 1.49524 13.5215C1.25 13.0402 1.25 12.4101 1.25 11.15V10.25M11.75 6.5L8 10.25M8 10.25L4.25 6.5M8 10.25V1.25"
                                    stroke="#3D4459"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                            Import
                        </button>
                        <button
                            type="button"
                            className="inline-flex items-center px-2.5 py-1.5 border-0 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3D4459]"
                        >
                            <svg
                                className="-ml-0.5 mr-2 h-4 w-4"
                                viewBox="0 0 16 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M14.75 8V11.15C14.75 12.4101 14.75 13.0402 14.5048 13.5215C14.289 13.9448 13.9448 14.289 13.5215 14.5048C13.0402 14.75 12.4101 14.75 11.15 14.75H4.85C3.58988 14.75 2.95982 14.75 2.47852 14.5048C2.05516 14.289 1.71095 13.9448 1.49524 13.5215C1.25 13.0402 1.25 12.4101 1.25 11.15V8M11 4.25L8 1.25M8 1.25L5 4.25M8 1.25V10.25"
                                    stroke="#3D4459"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                            Export
                        </button>
                        <button
                            type="button"
                            onClick={() => props.openCreateModal()}
                            className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
                        >
                            New {props.module}
                        </button>
                    </div>
                </div>
                <div className="mt-8 flex flex-col">
                    <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                                <table className="min-w-full divide-y divide-[#D9D9D9]">
                                    <thead>
                                        <tr>
                                            {Object.entries(props.headers).map(([name, field])=>{
                                                let showField = true;
                                                if(showField){
                                                    return (
                                                        <th
                                                            scope="col"
                                                            className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-[#3D4459] sm:pl-6"
                                                        >
                                                            {name != 'id' &&
                                                                <>{field.label}</>
                                                            }
                                                        </th>
                                                    )
                                                }
                                            })}
                                        
                                            <th
                                                scope="col"
                                                className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                                            ></th>
                                        </tr>
                                    </thead>
                                    <tbody className=" bg-white">
                                        {Object.entries(records).map(([id, person], j) => (
                                            <tr key={person.id}>
                                                <td
                                                    scope="col"
                                                    className="relative w-12 px-6 sm:w-16 sm:px-8"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/80 sm:left-6"
                                                    />
                                                </td>
                                                <td className="whitespace-nowrap py-3 pl-4 pr-3 text-sm sm:pl-6">
                                                    <div className="flex items-center">
                                                        <div className="h-10 w-10 flex-shrink-0">
                                                            <span className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-gray-500">
                                                                <span className="text-2xl font-medium leading-none text-white">
                                                                    {(person.logo).substring(0,2)}
                                                                </span>
                                                            </span>
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="font-medium text-[#3D4459]">
                                                                <Link
                                                                    href={route('contact_detail', person.id)}
                                                                    >
                                                                        {person.name}
                                                                    </Link>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-2 py-2 text-sm text-[#3D4459]">
                                                    {person.last_name}
                                                </td>
                                                <td className="whitespace-nowrap px-2 py-2 text-sm text-[#3D4459]">
                                                    {person.email}
                                                </td>
                                                <td className="whitespace-nowrap px-2 py-2 text-sm text-[#3D4459]">
                                                    {person.number}
                                                </td>
                                                
                                                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                    <a
                                                        href="#"
                                                        onClick={() => props.updateRecord(person.id)}
                                                        className="text-indigo-600 hover:text-indigo-900"
                                                    >
                                                        Edit
                                                        
                                                    </a>
                                                </td>
                                            </tr>
                                        ))}
                                        {Object.entries(props.records).length == 0 &&
                                            <tr><td className = "" colSpan="3">
                                                <div className="relative px-6 py-5 flex items-center space-x-3 hover:bg-gray-50 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary">
                                                    {props.module} not created yet.
                                                </div>
                                            </td></tr>
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <Pagination paginator={props.paginator} />
                    </div>
                </div>
            </div>

            {/* Filter */}
            {openFilterModal &&
                <>
                <div
                    className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none"
                >
                    <div className="relative w-auto my-6 mx-auto max-w-3xl">
                    {/*content*/}
                    <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                        {/*header*/}
                        <div className="flex items-start justify-between p-5 border-b border-solid border-slate-200 rounded-t">
                        <h3 className="text-3xl font-semibold">
                            Search filter
                        </h3>
                        <button
                            className="p-1 ml-auto bg-transparent border-0 text-black opacity-5 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                            onClick={() => setOpenFilterModal(false)}
                        >
                            <span className="bg-transparent text-black opacity-5 h-6 w-6 text-2xl block outline-none focus:outline-none">
                            ×
                            </span>
                        </button>
                        </div>
                        {/*body*/}
                        <div className="relative p-6 flex-auto">
                            <form id="filter_list_form">
                                <Filter
                                    fields={props.headers}
                                    filter={filter}
                                    filterList={props.filterList}
                                    filterName={filterName}
                                    selectedFilter={selectedFilter} 
                                    addCondition={addCondition}
                                    handleChange={handleChange}
                                    deleteCondition={deleteCondition}
                                    addGroup={addConditionGroup}
                                    errors={errors}
                                />
                            </form>
                        </div>
                        
                        {/*footer*/}
                        <div className="flex items-center justify-end p-6 border-t border-solid border-slate-200 rounded-b">
                        <button
                            className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                            type="button"
                            onClick={() => setOpenFilterModal(false)}
                        >
                            Close
                        </button>
                        <button
                            className="bg-gray-500 text-white active:bg-gray-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                            type="button"
                            onClick={() => saveFilterCondition()}
                        >
                            Save Filter
                        </button>
                        <button
                            className="bg-indigo-500 text-white active:bg-indigo-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
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
           
        </>
    );
}

export default ListView;