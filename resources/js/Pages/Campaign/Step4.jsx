import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function Schedule(props){

    const [openDatepick, setDatepick] = useState(false);

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
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Select Account</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            {props.data.account_id && props.company?
                             <> 
                                {props.company[props.data.account_id]}
                             </> 
                             : ''}
                        </dd>
                    </div>
                 </dl>
                </div>
            </div>
        </div>

        <div className="border m-10 h-50 rounded-lg">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Template</h3>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                 <dl className="sm:divide-y sm:divide-gray-200">
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">{props.data.service}</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{props.templates[props.data.template_id]}</dd>
                    </div>
                 </dl>
                </div>
            </div>
        </div>

        <div className="border m-10 h-50 rounded-lg">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Schedule Time</h3>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                 <dl className="sm:divide-y sm:divide-gray-200">
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-4 sm:gap-4 sm:px-6 flex sm:col-span-2">  
                    {props.data.status != 'draft' ? 
                       <>
                         <dt className="text-sm font-medium text-gray-500">Scheduling Time</dt>
                         <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{props.data.scheduled_at}</dd>
                       </>
                      : 
                       <>
                        <dt className="text-sm font-medium text-gray-500">
                        <div className="flex">
                            <div className="flex content-center p-4">
                            <input
                                    id='scheduled_at'
                                    name='scheduled_at'
                                    type="radio"
                                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                                    value='now'
                                    onChange={props.handleChange}
                                    onClick={() => setDatepick(false)}
                                />
                                <label className="ml-3 block text-sm font-bold text-gray-700">
                                    BoardCast Now
                                </label>
                            </div>
                            <div className="flex  p-4">
                            <input
                                    id='scheduled_at'
                                    name='scheduled_at'
                                    type="radio" 
                                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                                    value=''
                                    onClick={() => setDatepick(true)}
                            />
                                <label className="ml-3 block text-sm font-bold text-gray-700">
                                    Scheduling Time
                                </label>
                            </div>
                        </div>
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {openDatepick ? 
                        <>
                            <div className="w-1/2">
                                <DatePicker
                                    selected={props.scheduleTime == 'now' ? new Date() : props.scheduleTime}
                                    onChange={(date) => props.setScheduleTime(date)}
                                    dateFormat="MM/dd/yyyy h:mm aa"
                                    showTimeSelect
                                    timeIntervals={15}
                                    timeCaption="Time"
                                />
                            </div> 
                        </> : ''}  
                        </dd>
                       </>
                      }
                    </div>
                 </dl>
                </div>
            </div>
        </div>

        {props.status != 'draft' ? 
        <>
         <div className="flex m-10 justify-end">
            <a
                href={route("listCampaign")}
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
                onClick={props.saveCampaign}    
            >
                 {openDatepick ? 'Schedule' : 'Send Now' }    
            </button>
         </div>
        </>
        }
        </div>
    );
}

export default Schedule;









