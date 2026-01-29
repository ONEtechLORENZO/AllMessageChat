import React from "react";
import { Link } from "@inertiajs/react";

export default function Step4(props) {
    return (
        <div className="p-8 ">
            <div>
                <h2 className="text-lg font-medium">{props.translator['Link Whatsapp via WABA']}</h2>
                <p className="text-[#878787]">{props.translator['Whatsapp Business API to unlock Whatsapp superpowers.']}</p>
            </div>
            <p className="text-center w-52 text-[#424242] mx-auto text-lg font-semibold mt-8" >
            {props.translator['Your request has been successfully submitted']}
            </p>
            <div className="block space-y-2 mt-6">
                <p className=" text-sm mb-0">
                {props.translator['It will processed as soon as possible(within 48 hours).']}
                </p>
                <p className=" text-sm">
                {props.translator['You will recieve a notification with link via email into your OneMessage Workspace.']}
                </p>
                <p className=" text-sm">
                {props.translator['You Will need to fill in a few more fields to complete the linking process.']}
                </p>
                <p className=" text-sm">
                {props.translator['You can monitor the progress of the procedure in the "My Requests" section of your workspace.']}
                </p>
            </div>
            <p className="font-bold text-gray-700 text-xl mt-6 text-center">
            {props.translator['Thank You']}
            </p>
            <div className="w-full justify-center flex mt-12 mr-4">
                {props.accountId ? (
                    <Link
                        href={route("account_view", props.accountId)}
                        className="btn btn-primary"
                    >
                        {props.translator['Go to My Request']}
                    </Link>
                ) : (
                    ""
                )}

                <Link href={route("dashboard")} className="btn btn-primary ml-4">
                {props.translator['Go to Dashboard']}
                </Link>
            </div>
        </div>
    );
}









