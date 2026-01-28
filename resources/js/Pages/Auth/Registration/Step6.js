import React, { useEffect, useState } from "react";
import {ChevronRightIcon}from "@heroicons/react/outline";
import { Link } from "@inertiajs/inertia-react";
import ApplicationLogo from "@/Components/ApplicationLogo";

export default function Step6 (props) {

    const [plan , setPlan] = useState('');

    useEffect(()=> {
        getCompanyPlan();
    }, []);

    /**
     * Fetch company plan
     */
    function getCompanyPlan(){
        axios.get(route('get_company' , props.company.id)).then((response) => {
            if(response)
                setPlan(response.data.plan)
        });
    } 

    return (
        <div className="h-screen w-full bg-blue-50 flex justify-center items-center">
            <div className="max-w-7xl flex mx-auto items-center px-10">
                <div className="w-full bg-white self-stretch flex justify-center py-24 rounded-xl px-4 lg:px-10">
                    <div className="">
                        <div className="flex justify-center px-4 text-indigo-600 text-4xl font-semibold italic">
                           One message
                           <ApplicationLogo className="block h-90 w-auto text-gray-500 px-2" />
                        </div>
                        <div className="pl-10 flex justify-center">
                           
                        </div>
                        
                        <div className="grid grid-cols-2 mt-5">
                            <div className="flex justify-start font-semibold text-lg text-primary">Registration Done!</div>
                            <div className="flex justify-end font-semibold text-lg">Congratulation!</div>
                        </div>

                        <div className="bg-white w-full py-2 items-center mt-8 ">
                          <div className="text-gray-900 py-2 font-semibold text-lg">You Account has been registered!</div>
                          <div className="text-gray-500 font-small py-2">We've been accredited $1.00 so you can start using OneMessage right now!</div>
                          <div className="text-gray-500 font-small py-2">You can charge your wallet anytime and send more messages:<span className="text-indigo-500 font-semibold pl-2">Check Rates</span></div>
                          <div className="text-gray-500 font-small py-2">You registered with<span className="text-indigo-500 font-semibold px-2"> {plan} plan</span>which is monthly free and you have: </div>
                          <div className="text-gray-500 font-small py-2">
                            <ul className="list-disc ml-6">
                                <li>1 workspace</li>
                                <li>1 user</li>
                                <li>1 social account for channel <span className="font-small">(1 whatsapp number, 1 instagram account, 1 Facebook account).</span></li>
                            </ul> 
                          </div>
                          <div className="text-gray-500 font-small py-2">Check<span className="text-indigo-500 font-semibold px-2">Other Plan</span>if you need more than that. </div>
                          <div className="text-gray-500 font-small py-2 mt-2">Have a nice chat!</div>
                        </div>

                        <div className="mt-4 flex justify-end">
                            <div className="flex justify-end">
                                {/* <button
                                    type="button"
                                    className="w-full inline-flex justify-start rounded-md border border-transparent shadow-sm px-4 py-2 bg-gray-900 hover:bg-gray-200 hover:text-gray-900 text-semibold font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm mt-4"
                                    onClick={''}
                               >
                                    Watch Tutorial
                                    <span className="flex justify-end pt-1"><ChevronRightIcon className="h-4 w-4"/></span>
                                </button> */}
                            </div>
                            <div className="flex justify-end">
                                <Link
                                    href={route('dashboard')}
                                    className="w-full inline-flex justify-end rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary hover:bg-primary/80 text-semibold font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm mt-4"
                                    >
                                        Start Using OneMessage
                                    <span className="flex justify-end pt-1"><ChevronRightIcon className="h-4 w-4"/></span>
                                </Link>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}