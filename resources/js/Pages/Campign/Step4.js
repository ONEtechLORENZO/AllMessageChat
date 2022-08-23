import React, { useState } from "react";
import Input from "@/Components/Input";
import { Check } from "heroicons-react";
import Dropdown from "@/Components/Forms/Dropdown";

function Schedule(props){

    return(
        <div className="overflow-hidden shadow rounded-lg divide-gray-200 w-full float-center">
        
            <div className="px-4 py-5 sm:px-6 bg-green-200">
                 Review & Schedule
            </div>
     
         <div className="border m-10 h-50 rounded-lg">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Information</h3>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                 <dl className="sm:divide-y sm:divide-gray-200">
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Title</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{props.data.name}</dd>
                    </div>
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Service</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{props.data.service}</dd>
                    </div>
                 </dl>
                </div>
            </div>
        </div>

        <div className="border m-10 h-50 rounded-lg">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Contact</h3>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                 <dl className="sm:divide-y sm:divide-gray-200">
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Total</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{props.records}</dd>
                    </div>
                 </dl>
                </div>
            </div>
        </div>
    
        <div className="border m-10 h-50 rounded-lg">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Account</h3>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                 <dl className="sm:divide-y sm:divide-gray-200">
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-4 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Select Account</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            <Dropdown
                                id='account_id'
                                name='account_id'
                                options={props.companyName}
                                handleChange={props.handleChange}
                                value={props.data.account_id == null ? '' : props.data.account_id}
                                readOnly={props.status == 'new' ? true : false}
                            />
                        </dd>
                    </div>
                 </dl>
                </div>
            </div>
        </div>

        <div className="border m-10 h-50 rounded-lg">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Content</h3>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                 <dl className="sm:divide-y sm:divide-gray-200">
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">{props.data.service}</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{props.data.action}</dd>
                    </div>
                 </dl>
                </div>
            </div>
        </div>
        
        <div className="border m-10 h-50 rounded-lg">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Schedule</h3>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                {props.status == 'new' ? 
                <>
                 <dl className="sm:divide-y sm:divide-gray-200">
                     <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                       <dt className="text-sm font-medium text-gray-500">Scheduling Time</dt>
                       <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{props.data.scheduled_at}</dd>
                    </div>
                 </dl>
                </>
                :
                <>
                  <dl className="sm:divide-y sm:divide-gray-200">
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-4 sm:gap-4 sm:px-6 flex">
                            <button
                                type='button'
                                name='scheduled_at'
                                value='now'
                                className="flex justify-center bg-indigo-600 py-2 px-6 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                onClick={props.handleChange}
                            >
                            BoardCast Now 
                            {props.data.scheduled_at == 'now' && props.scheduleOpen === false? 
                            <>
                                <span className="px-4"><Check /></span>
                            </>
                            : ''}  
                             </button>
                            {props.scheduleOpen ?
                            <>
                                <Input
                                    type="datetime-local"
                                    name="scheduled_at"
                                    id="scheduled_at"
                                    className="px-6 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                    placeholder=""
                                    value={props.data.scheduled_at}
                                    handleChange={props.handleChange}
                                />
                            </>
                            : 
                            <>
                            <button
                                    type='button'
                                    className="justify-end bg-indigo-600 py-2 px-6 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    onClick={(e) => props.schedule(true)}
                            >
                                Schedule Time  
                                </button> 
                            </>
                            }
                    </div>
                 </dl>
                </>
                }
                 
                </div>
            </div>
        </div>
        {props.status == 'new' ? 
        <>
         <div className="flex m-10 justify-end">
            <a
                href={route("listCampign")}
                className="justify-start bg-indigo-600 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                Back
            </a>
         </div>
        </>
        : 
        <>
         <div className="m-10  flex justify-between">
            <button
                type='button'
                className="justify-start bg-indigo-600 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={(e) => props.previous(3)}
           >
                Previous
            </button>
            <button
                type='button'
                className="justify-end bg-indigo-600 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={props.saveCampign}    
            >
                Send Now
            </button>
         </div>
        </>
        }
        </div>
    );
}

export default Schedule;