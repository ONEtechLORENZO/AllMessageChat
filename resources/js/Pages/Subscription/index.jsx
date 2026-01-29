import React, { useState, useEffect } from "react";
import Authenticated from "@/Layouts/Authenticated";
import CompanyDetail from "./company";
import axios from "axios";
import Accounts from "../Wallet/Accounts";
import Settings from "../Wallet/Settings";
import ListView from "@/Components/Views/List/Index2";
import InviteUser from "../Admin/User/InviteUsers";
import SubPanels from "@/Components/Views/Detail/SubPanels";
import Group from "../Group/List";

const tabs = [
  { name: 'Workspace Settings', href: '#', current: true, page: 1 },
  //{ name: 'Social Profilie', href: '#', current: false , page: 'social_profile' },
  { name: 'Users', href: '#', current: false , page: 'users' },
  { name: 'Settings', href: '#', current: false , page: 'settings' },
  { name: 'Groups', href: route("listGroup"), current: false , page: 'groups' },
//  { name: 'Templates', href: route("listInteractiveMessage"), current: false , page: 'templates' },

 // { name: 'API', href: '#', current: false , page: 'api' },
];

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export default function Subscription(props)
{  
  const [page, setPage] = useState(1);
  const[ inviteUser, setInviteUser] = useState(false);

  useEffect(() => {
    setPage(props.current_tab);
  }, [props.current_tab]);

  return(
    <Authenticated
      auth={props.auth}
      errors={props.errors}
      navigationMenu={props.menuBar}
      current_page={'Settings'}
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
                {props.translator[tab.name]}
            </a>
            ))}
          </nav>
         </div>

         <div className="p-4">
            
            {page && page == 1 ? 
              <CompanyDetail 
                currentCompany={props.company.currentCompany}
                {...props}
              />
            : ''}
            
            {page && page == 'social_profile' ? 
              <Accounts 
               accounts={props.accounts}
               createAccount={false}
               {...props}
              /> 
            : ''}
              {page && page == 'settings' ? 
                <Settings   
                    autoTopup_value = { props.autoTopup_value}
                    autoTopup_status  = { props.autoTopup_status}
                    {...props}
                /> 
            : ''}
            {page && page == 'users' ? 
              <ListView 
                headers={props.list_view_columns}
                setInviteUser={setInviteUser}
                current_user={props.current_user}
                {...props}
              />

            : ''}

            {page && page == 'api' ? 
              <SubPanels
                module={'Api'}
                parent_id={1}
                parent_name={'test'}
                parent_module={'Company'}
                {...props}
            />

            : ''}            

            {inviteUser &&
                <InviteUser 
                    setInviteUser={setInviteUser}
                    {...props}
                />
            }
                 
            {page && page == 'templates' ? 
              <ListView 
                headers={props.list_view_columns}
                setInviteUser={setInviteUser}
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












