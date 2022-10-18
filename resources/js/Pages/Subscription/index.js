import React, { useState, useEffect } from "react";
import Authenticated from "@/Layouts/Authenticated";
import CompanyDetail from "./company";
import axios from "axios";
import Accounts from "../Wallet/Accounts";
import ListView from "@/Components/Views/List/Index2";

const tabs = [
  { name: 'Workspace Settings', href: '#', current: true, page: 1 },
  { name: 'Social Profilie', href: '#', current: false , page: 2 },
  { name: 'Users', href: '#', current: false , page: 3 },
];

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export default function Subscription(props)
{  
  const [page, setPage] = useState(1);
  
  return(
    <Authenticated
      auth={props.auth}
      errors={props.errors}
    >
      <div>
       <div className="hidden sm:block p-4">
         <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
            <a
                key={tab.name}
                href={tab.href}
                className={classNames(
                tab.page == page
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
                )}
                aria-current={tab.current ? 'page' : undefined}
                onClick={() => setPage(tab.page)}
            >
                {tab.name}
            </a>
            ))}
          </nav>
         </div>

         <div className="p-4">
            
            {page && page == 1 ? 
               <CompanyDetail 
               currentCompany={props.company.currentCompany}
               relatedCompany={props.company.relatedCompany}
              />
            : ''}
            
            {page && page == 2 ? 
              <Accounts 
               accounts={props.accounts}
               createAccount={false}
               {...props}
              /> 
            : ''}

            {page && page == 3 ? 
               
              <ListView 
                headers={props.list_view_columns}
                current_user={props.current_user}
                {...props}
              />
            : ''}
                 
         </div>
       </div>
      </div>
     </Authenticated>
  );

}