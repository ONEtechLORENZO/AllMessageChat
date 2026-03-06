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
           <form className="space-y-8 divide-y divide-white/10" id="update_csv" >
                <div className="space-y-8 divide-y divide-white/10 sm:space-y-5">
                    <div>
                        <div className="sm:grid sm:grid-cols-2 sm:gap-4 sm:items-start sm:border-t sm:border-white/10 sm:pt-5">
                            <div className="form-group">
                                <label htmlFor="name" className="block text-sm font-medium text-white/70" >
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
                                        className="bg-[#0F0B1A] text-white border-white/10 placeholder:text-[#878787] focus:ring-[#BF00FF]/60 focus:border-[#BF00FF]/60"
                                    />
                                </div>
                                <InputError message={props.errors.name} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="name" className="block text-sm font-medium text-white/70" >
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
                        <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-white/10 sm:pt-5">
                            <div className="mt-1 sm:mt-0 sm:col-span-2">
                                <div className="max-w-lg flex justify-center px-6 pt-5 pb-6 border-2 border-white/20 border-dashed rounded-md bg-white/5">
                                    <div className="space-y-1 text-center">
                                        <svg
                                            className="mx-auto h-12 w-12 text-white/50"
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
                                        <div className="flex text-sm text-white/70 form-group">
                                            <label
                                                htmlFor="file-upload"
                                                className="relative cursor-pointer bg-white/10 rounded-md font-medium text-[#BF00FF] hover:text-[#d27bff] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-[#0b0815] focus-within:ring-[#BF00FF]/60 px-2 py-1"
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
                            className="bg-white/10 py-2 px-4 border border-white/15 rounded-md shadow-sm text-sm font-medium text-white/80 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0b0815] focus:ring-[#BF00FF]/60"
                        >
                            Cancel
                        </Link>
                        <button
                            type="button"
                            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#BF00FF] hover:bg-[#9c00d9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0b0815] focus:ring-[#BF00FF]/60"
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












