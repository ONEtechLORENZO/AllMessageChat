import React from "react";
import Input from "@/Components/Forms/Input";
import InputError from "@/Components/Forms/InputError";
import { Link } from "@inertiajs/react";
import Dropdown from "@/Components/Forms/Dropdown";

const moduleOptions = {
    'Contact' :'Contact', 'Product' : 'Product', 'Order' : 'Order'
};

function Step1(props){

    return (
        <>
           <form className="space-y-8 divide-y divide-gray-200" id="update_csv" >
                <div className="space-y-8 divide-y divide-gray-200 sm:space-y-5">
                    <div>
                        <div className="sm:grid sm:grid-cols-2 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                            <div className="form-group">
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700" >
                                    Name <span className="text-sm text-red-700"> *</span>
                                </label>
                                <div className="mt-1 flex rounded-md shadow-sm">
                                    <Input
                                        name="name"
                                        required={true}
                                        id="name"
                                        placeholder="Name"
                                        handleChange={props.handleChange}
                                        value={props.data['name']}
                                    />
                                </div>
                                <InputError message={props.errors.name} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700" >
                                    Module<span className="text-sm text-red-700"> *</span>
                                </label>
                                <div className="mt-1 flex rounded-md shadow-sm px-2">
                                    <Dropdown
                                        id="module"
                                        name="module"
                                        options={moduleOptions}
                                        handleChange={props.handleChange}
                                        emptyOption="Select Module"
                                        value={props.data['module']}
                                        required={true}
                                    />
                                </div>
                                <InputError message={props.errors.name} />
                            </div>
                        </div>
                        <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                            <div className="mt-1 sm:mt-0 sm:col-span-2">
                                <div className="max-w-lg flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                    <div className="space-y-1 text-center">
                                        <svg
                                            className="mx-auto h-12 w-12 text-gray-400"
                                            stroke="currentColor"
                                            fill="none"
                                            viewBox="0 0 48 48"
                                            aria-hidden="true"
                                        >
                                            <path
                                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                                strokeWidth={2}
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                        <div className="flex text-sm text-gray-600 form-group">
                                            <label
                                                htmlFor="file-upload"
                                                className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                                            >
                                                <span>Upload a CSV file</span>
                                                <Input
                                                    name="fileUpload"
                                                    required={true}
                                                    id="file-upload"
                                                    type="file"
                                                    className="sr-only"
                                                    handleChange={props.handleChange}
                                                />
                                                <InputError message={props.errors.fileUpload} />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-5">
                    <div className="flex justify-end">
                        <Link
                            href={route("listImport")}
                            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Cancel
                        </Link>
                        <button
                            type="button"
                            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            onClick={() =>
                                props.importStep()
                            }
                        >
                            Next
                        </button>
                    </div>
                </div>
           </form>
        </>
    );
}

export default Step1;









