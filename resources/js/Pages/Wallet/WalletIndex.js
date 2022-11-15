import React, { useState } from "react";
import Wallet from "./Index";
import Authenticated from "@/Layouts/Authenticated";
import { Head } from "@inertiajs/inertia-react";
import MessageTransaction from "./MsgTransaction";
import ListView from "@/Components/Views/List/Index2";

function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
}

const tabs = [
    { label: 'Wallet & Usages', name: 'Wallet & Usages', href: '#',current: true, page: 1 },
    { label: 'Transaction History', name: 'Transaction History', href: '#',current: false, page: 2 },
    { label: 'VAT Invoices', name: 'VAT Invoices', href: '#',current: false, page: 3 },       
];

function WalletIndex(props)
{
    const [currentTab, setCurrentTab] = useState(1);
    
    return (
        <Authenticated
            auth={props.auth}
            errors={props.errors}
            current_page= {props.current_page}
        >
        <Head title={props.translator['Wallet']} />

        <div className="hidden sm:block p-4">
         <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                {tabs.map((tab) => (
                    <a
                        active
                        href={tab.href}
                        className={classNames(
                            tab.page == currentTab
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                        'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
                        )}
                        onClick={() => setCurrentTab(tab.page)}
                    >
                        {tab.name}
                    </a>
                ))} 
            </nav>

            <div className="p-4">

             {currentTab && currentTab == 1 ? 
                <Wallet
                  {...props}
                  tabs={tabs} 
                />
             : ''}

             {currentTab && currentTab == 2 ? 
              <>
                <MessageTransaction
                  {...props} 
                />
              </>
                
             : ''}

             {currentTab && currentTab == 3 ? 
                <ListView 
                  module={'Transaction'}
                  singular={'Transaction'}
                  plural={'Transactions'}
                  headers={props.invoice_columns}
                  current_user={props.auth}
                  records={props.transactionHistory}
                  paginator={props.invoice_paginator}
                  actions={props.invoice_actions}
                  {...props}
                />
             : ''}

            </div>
         </div>
        </div>    

        </Authenticated>
    )
}

export default WalletIndex;