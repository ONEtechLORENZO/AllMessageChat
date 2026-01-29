import React from "react";

import { AiOutlineArrowRight } from "react-icons/ai";

export default function Step4() {
    return (
        <div className="flex-1">
            <div className="space-y-4">
                <div className="flex !gap-2 items-center">
                    <span>Meta Profile name</span>
                    <AiOutlineArrowRight/>
                    <span>Meta Business name</span>
                    <AiOutlineArrowRight/>
                    <span>Meta Catalog name</span>
                </div>

                <div className="text-sm font-semibold !mt-8">Match the product fields with those of your OneMessage CRM</div>
                
                <div className="space-y-1"> 
                <div className="sm:grid sm:grid-cols-12 sm:gap-4">
                    <label
                        htmlFor="first-name"
                        className="block col-span-4 text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
                    >
                        Title
                    </label>
                    <div className="mt-1 col-span-8 !sm:mt-0">
                        <select className="block w-48 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500  sm:text-sm">
                            <option value={""}>Select</option>
                        </select>
                    </div>
                </div>
                <div className="sm:grid sm:grid-cols-12 sm:gap-4">
                    <label
                        htmlFor="first-name"
                        className="block col-span-4 text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
                    >
                        Price
                    </label>
                    <div className="mt-1 col-span-8 !sm:mt-0">
                        <select className="block w-48 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500  sm:text-sm">
                            <option value={""}>Select</option>
                        </select>
                    </div>
                </div>
                <div className="sm:grid sm:grid-cols-12 sm:gap-4">
                    <label
                        htmlFor="first-name"
                        className="block col-span-4 text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
                    >
                        Description
                    </label>
                    <div className="mt-1 col-span-8 !sm:mt-0">
                        <select className="block w-48 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500  sm:text-sm">
                            <option value={""}>Select</option>
                        </select>
                    </div>
                </div>
                <div className="sm:grid sm:grid-cols-12 sm:gap-4">
                    <label
                        htmlFor="first-name"
                        className="block col-span-4 text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
                    >
                        Website link
                    </label>
                    <div className="mt-1 col-span-8 !sm:mt-0">
                        <select className="block w-48 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500  sm:text-sm">
                            <option value={""}>Select</option>
                        </select>
                    </div>
                </div>

                <div className="sm:grid sm:grid-cols-12 sm:gap-4">
                    <label
                        htmlFor="first-name"
                        className="block col-span-4 text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
                    >
                        Website link
                    </label>
                    <div className="mt-1 col-span-8 !sm:mt-0">
                        <select className="block w-48 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500  sm:text-sm">
                            <option value={""}>Select</option>
                        </select>
                    </div>
                </div>

                <div className="sm:grid sm:grid-cols-12 sm:gap-4">
                    <label
                        htmlFor="first-name"
                        className="block col-span-4 text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
                    >
                        Condition
                    </label>
                    <div className="mt-1 col-span-8 !sm:mt-0">
                        <select className="block w-48 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500  sm:text-sm">
                            <option value={""}>Select</option>
                        </select>
                    </div>
                </div>

                <div className="sm:grid sm:grid-cols-12 sm:gap-4">
                    <label
                        htmlFor="first-name"
                        className="block col-span-4 text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
                    >
                        Availability
                    </label>
                    <div className="mt-1 col-span-8 !sm:mt-0">
                        <select className="block w-48 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500  sm:text-sm">
                            <option value={""}>Select</option>
                        </select>
                    </div>
                </div>
                </div>
                
            </div>
        </div>
    );
}









