import React, { useState, useEffect } from "react";
import Authenticated from "@/Layouts/Authenticated";
import { DetailContainer } from "./DetailContainer";

const workspaceDetails = [
    {label: 'Workspace ID', name: 'id'},
    {label: 'Workspace Name', name: 'name'},
    {label: 'Registered On', name: 'created_at'},
    {label: 'Last Sign Up', name: 'last_signUp'},
    {label: 'Number of Admins', name: 'admin'},
    {label: 'Number of Users', name: 'users'},
];

const revenueDetails = [
    {label: 'Last Month Value', name: 'last_month'},
    {label: 'Last 3 Months Value', name: 'last_three_month'},
    {label: 'Last 12 Months Value', name: 'last_one_year'},
    {label: 'Lifetime Value', name: 'life_time'},
];

const planComsumptionData = [
    {label: 'Subscription Plan', name: 'name'},
    {label: 'Monthly Subscription Value', name: 'amount'},
    {label: 'Average Monthly Consumption M&M', name: 'average'},
    {label: 'Average Monthly Add-Ons Value', name: 'add_on'},
];

const paymentDetails = [
    {label: 'Payment Method', name: 'method'},
    {label: 'Payment Cycle', name: 'billing_period'},
    {label: 'Payment Terms', name: 'payment_method'},
    {label: 'Tolerance Threshold', name: 'holds'},
];

const billingInfo = [
    {label: 'Currency', name: 'currency'},
    {label: 'Country', name: 'country'},
    //{label: 'State', name: 'state'},
    {label: 'Province', name: 'province'},
    {label: 'City', name: 'city'},
    //{label: 'Street', name: 'street'},
    //{label: 'Bulding Number', name: 'building_number'},
    {label: 'Vat Code', name: 'company_vat_id'},
    {label: 'Codice Destinatario', name: 'codice_destinatario'},
    {label: 'Email for Invoices', name: 'email'},
];

const workspaceSettings = [
    {label: 'Time Zone', name: 'time_zone'},
];

export default function WorkspaceActivities(props) {
    
    return(
        <Authenticated
        auth={props.auth}
        errors={props.errors}
    >
       <div>
            <ul className="py-4 space-y-2 sm:px-6 sm:space-y-4 lg:px-8" role="list">
                <li className="bg-white px-4 py-6 shadow sm:rounded-lg sm:px-6">
                    <div className="sm:flex sm:justify-between sm:items-baseline">
                        <h3 className="text-base font-medium flex w-full">
                            Workspace Activities
                        </h3>
                    </div>
                </li> 
                <li className="bg-white px-4 py-6 shadow sm:rounded-lg sm:px-6">
                  
                    {/**Workspace Details*/}
                    <DetailContainer 
                     header={'Workspace Details'}
                     fields={workspaceDetails}
                     record={props.workspace}
                     default={true}
                    />

                    {/**Revenue Data*/}
                    <DetailContainer 
                     header={'Revenue Data'}
                     fields={revenueDetails}
                     record={props.revenue}
                     default={false}
                    />

                    {/**Plans & Consumption Data*/}
                    <DetailContainer 
                     header={'Plans & Consumption Data'}
                     fields={planComsumptionData}
                     record={props.plan}
                     default={false}
                    />

                    {/**Payment Detials*/}
                    <DetailContainer 
                     header={'Payment Details'}
                     fields={paymentDetails}
                     record={props.plan}
                     default={false}
                    />

                    {/**Billing information */}
                    <DetailContainer 
                     header={'Billing Info'}
                     fields={billingInfo}
                     record={props.workspace}
                     default={false}
                    />

                    {/**Workspace Setting */}
                    <DetailContainer 
                     header={'Workspace Settings'}
                     fields={workspaceSettings}
                     record={props.workspace}
                     default={false}
                    />
                </li>
            </ul>
        </div>

    </Authenticated>
    );
}