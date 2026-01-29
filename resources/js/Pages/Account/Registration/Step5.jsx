import React from "react";
import { Link } from "@inertiajs/react";

export default function Step5(props){
    return(
        <div className="p-4 bg-white rounded-sm h-72 px-12 py-10">
            <div className="">
               <p className="text-3xl font-bold">Your Account has been succesfully linked on your OneMessage Workspace!</p>
            </div>

            <p className="py-5 text-gray-700">
                Have a nice Chatting
            </p>

            <div className="w-full h-auto py-5 flex justify-center">
                <Link
                    href={route('wallet_subscription')}
                    className="rounded text-white h-10 p-2 bg-gray-700"
                >
                    Go to Settings
                </Link>
                <Link
                    href={route('updateSubscription')}
                    className="rounded text-white h-10 p-2 mx-10 bg-green-500"
                >
                    Look at the prices
                </Link>
                <Link
                    href={route('dashboard')}
                    className="rounded text-white bg-black h-10 p-2 bg-purple-600"
                >
                    Go to Dashboard
                </Link>
            </div>
        </div>
    );
}












