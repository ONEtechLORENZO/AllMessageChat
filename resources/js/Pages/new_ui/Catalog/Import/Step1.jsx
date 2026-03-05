import React from "react";

export default function Step1() {
    return (
        <div className="flex-1">
            <div className="space-y-2">
                <div className="text-center flex justify-center flex-col items-center !gap-4">
                    <label
                        htmlFor="first-name"
                        className="block col-span-4 text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
                    >
                        Select Meta profile
                    </label>                    
                    <select className="block w-48 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500  sm:text-sm">
                        <option value={""}>Select</option>
                    </select>
                    
                </div>
                
            </div>
        </div>
    );
}












