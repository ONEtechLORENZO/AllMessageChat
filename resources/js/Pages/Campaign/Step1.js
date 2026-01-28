import React from "react";
import Input from "@/Components/Input";

function Information(props){

    return(
        <div className="overflow-hidden shadow rounded-lg divide-y divide-gray-200 w-full content-center">
            <div className="px-4 py-5 sm:px-6 bg-green-200">
                {props.translator['Information']}
            </div>
        <div className="px-4 py-5 sm:p-6">
         <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            {props.translator['Title']}
            </label>
            <div className="mt-1">
                <Input
                  type="text"
                  name="name"
                  id="campaign_name"
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder=""
                  value={props.data.name}
                  handleChange={props.handleChange}
                />
            </div>
         </div>
         <div>
          <div className="pt-5">
            <div className="flex justify-end">
                <button
                    type='button'
                    className="bg-indigo-600 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={props.saveCampaign}
               >
                    {props.translator['Next']}
                </button>
             </div>
            </div>
         </div>
        </div>
        </div>
    );
}

export default Information;