import React from "react";
import { Link } from "@inertiajs/inertia-react";

export default function Step4(props){
    return(
        <div className="p-8 px-10">
            <div className="block">
                <p className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate p-5">
                    Your request has been successfully submitted
                </p>
                <p className="py-3 text-lg text-gray-500">
                    It will processed as soon as possible(within 48 hours).
                </p>
                <p className="pt-2 text-lg text-gray-500 text-base">
                    You will recieve a notification with link via email into
                    your OneMessage Workspace.
                </p>
                <p className="pt-2 text-lg font-normal text-gray-500 text-base">
                    You Will need to fill in a few more fields to complete the
                    linking process.
                </p>
                <p className="py-4 text-lg font-normal text-gray-500 text-base">
                    You can monitor the progress of the procedure in the "My
                    Requests" section of your workspace.
                </p>
                <p className="font-bold text-gray-700 text-xl mt-6">
                    Thank You
                </p>
                <div className="w-full justify-center flex mt-10">
                    {props.accountId ? 
                     <Link
                        href={route('account_view', props.accountId)}
                        className="inline-flex justify-center border border-transparent shadow-sm text-sm rounded-md text-white bg-gray-900 hover:bg-gray-200 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2  px-8 py-4 mr-2 mr-4 font-bold text-base"
                     >
                       Go to My Request
                     </Link>
                    :''}

                    <Link
                      href={route('dashboard')}
                      className="inline-flex justify-center border border-transparent shadow-sm text-sm rounded-md text-white bg-primary hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2  px-8 py-4 mr-2 mr-4 font-bold text-base"
                    >
                     Go to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}