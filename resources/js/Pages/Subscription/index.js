import React, { useState, useEffect } from "react";
import Authenticated from "@/Layouts/Authenticated";
import CompanyDetail from "./company";
import axios from "axios";

const tabs = [
  { name: 'Workspace Settings', href: '#', current: true, page: 1 },
  { name: 'Channels', href: '#', current: false , page: 2 },
  { name: 'Users', href: '#', current: false , page: 3 },
];

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export default function Subscription(props)
{  
  const [page, setPage] = useState(1);
  const [currentCompany, setCurrentCompany] = useState(props.company.currentCompany);
  const [relatedCompany, setRelatedCompany] = useState(props.company.relatedCompany);

  function currentUserCompany() {
    axios.get(route('user_company')).then((response) => {
      setCurrentCompany(response.data.currentCompany);
      setRelatedCompany(response.data.relatedCompany);
    });  
  }

  function changeCompany(event){
    const id = event.target.value;
    let url = route('change_company', {'id': id});
    axios.get(url).then((response) => {
      currentUserCompany()
    });
  }

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
                tab.current
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
            <div 
             className={
             page == 1 ? "block" : "hidden"
             }
            >
                <CompanyDetail 
                 currentCompany={currentCompany}
                 relatedCompany={relatedCompany}
                 changeCompany={changeCompany}
                 setCurrentCompany={setCurrentCompany}
                />
            </div>
            <div 
             className={
             page == 2 ? "block" : "hidden"
             }
            >
                channel
            </div>
            <div 
             className={
             page == 3 ? "block" : "hidden"
             }
            >
                Users
            </div>
         </div>
       </div>
      </div>
     </Authenticated>
  );

}