import React, { useEffect, useState } from "react";
import Dropdown from "@/Components/Forms/Dropdown";

const options = {
    'whatsapp': 'Whatsapp',
    'instagram': 'Instagram'
}

function Content(props){

    return(
        <div className="overflow-hidden shadow rounded-lg divide-gray-200 w-full float-center">
      
            <div className="px-4 py-5 sm:px-6 bg-green-200">
                Content
            </div>
     
        <div className="border m-10 h-50 rounded-lg">
            <div className="p-8">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Service
                </label>
                <br></br>
                <Dropdown
                    id={'service'}
                    name={'service'}
                    options={options}
                    handleChange={props.handleChange}
                    value={props.data.service}
                />
            </div>
        </div>

        <div className="border m-10 h-50 rounded-lg">
            <div className="p-8">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Account
                </label>
                <br></br>
                <Dropdown
                    id='account_id'
                    name='account_id'
                    options={props.companyName}
                    handleChange={props.handleChange}
                    value={props.data.account_id == null ? '' : props.data.account_id}
                />
            </div>
        </div>
    
        <div className="border m-10 h-64 rounded-lg">  
            <div className="p-8">
                
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Template
                </label>
                <br></br>
                <Dropdown
                    id='template_id'
                    name='template_id'
                    options={props.templates}
                    handleChange={props.handleChange}
                    value={props.data.template_id == null ? '' : props.data.template_id}
                />
            </div>
        </div>
        
        <div className="m-10 flex justify-between">
            <button
                type='button'
                className="justify-start bg-indigo-600 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={(e) => props.previous(2)}
           >
                Previous
            </button>
            <button
                type='button'
                className=" bg-indigo-600 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={props.saveCampaign}
           >
                Next
            </button>
         </div>
        </div>
    );
}

export default Content;









