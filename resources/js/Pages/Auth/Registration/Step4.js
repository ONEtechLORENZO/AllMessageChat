import React, {useState} from "react";
import {CreditCardIcon , ChevronRightIcon}from "@heroicons/react/outline";
import { Link } from "@inertiajs/inertia-react";

export default function Step4 (props) {

    return (
        <div className="h-screen w-full bg-blue-50 flex justify-center items-center">
            <div className="max-w-7xl flex mx-auto items-center px-10">
                <div className="w-full bg-white self-stretch flex justify-center py-24 rounded-xl px-4 lg:px-10">
                    <div className="py-8">
                        <div className="flex justify-end px-4">
                            <img
                                src="./img/onemessage-logo.png"
                                alt="One message logo"
                                className="w-1/2"
                            />
                        </div>
                        <div className="flex justify-end">
                            <span>Already have an account 
                               <Link
                                    href={route('login')}
                                    className="text-primary px-2"
                                    >
                                    Log in
                                </Link>
                            </span>
                        </div> 

                        <div className="grid grid-cols-2 mt-5">
                            <div className="flex justify-start font-semibold text-lg text-primary">Step 4</div>
                            <div className="flex justify-end font-semibold text-lg">Payment Method</div>
                        </div>

                        <div className="bg-white shadow w-full px-10 py-2 flex gap-8 items-center mt-4 rounded">
                            <div className="text-gray-500">
                               <CreditCardIcon className="h-6 w-6" />
                            </div>
                            <div className="flex flex-col flex-1">
                                <label>Add a Credit Card or a Bank Account</label>
                                <input
                                    type="text"
                                    className="h-4 px-0 py-4 border-0 focus:ring-0 focus:border-primary w-full focus:border-0 focus:border-b"
                                    autoComplete="off"
                                />
                            </div>
                        </div>

                        <div className="mt-4 flex justify-end">
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    className="w-full inline-flex justify-start rounded-md border border-transparent shadow-sm px-4 py-2 bg-gray-200 hover:bg-gray-900 hover:text-white text-semibold font-medium text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm mt-4"
                                    onClick={() => props.setOpenTab(5)}
                               >
                                    Connect later
                                    <span className="flex justify-end pt-1"><ChevronRightIcon className="h-4 w-4"/></span>
                                </button>
                            </div>
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    className="w-full inline-flex justify-end rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary hover:bg-primary/80 text-semibold font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm mt-4"
                                >
                                    Next
                                    <span className="flex justify-end pt-1"><ChevronRightIcon className="h-4 w-4"/></span>
                                </button>
                            </div>
                        </div>
            
                    </div>
                </div>
            </div>
        </div>
    );
}