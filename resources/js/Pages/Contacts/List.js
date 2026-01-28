import React from 'react';
import Authenticated from "../../Layouts/Authenticated";
import ListView from '@/Components/Views/List/Index2';
import CategoryList from '../../Pages/Category/List';
import TagList from '../../Pages/Tag/List';
//import { Link } from 'heroicons-react';
import { Link } from "@inertiajs/inertia-react";
function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
}

function List(props)
{
    const tabs = [
        { label:'All',name: 'Contacts', href: '#',current: true },
        { label:'Lists',name: 'Lists', href: route("listCategory"),current: false},
        { label:'Tags',name: 'Tags', href: route("listTag"),current: false },
        { label:'Fields',name: 'Fields', href: route("listField",{'mod':props.module}),current: false }
    ];

    return (
        <Authenticated
            auth={props.auth}
            errors={props.errors}
            current_page={props.current_page}
            navigationMenu={props.menuBar}
        >
                
            <div className='font-semibold text-2xl text-[#363740] !px-4 ml-3'>{props.plural}</div>

            <div className="mt-6 sm:mt-2 2xl:mt-5 !mb-6">
              <div className="border-b border-gray-200">
                <div className="mx-auto px-4 sm:px-6 lg:px-8">
                  <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {tabs.map((tab) => (
                      <Link
                        key={tab.name}
                        href={tab.href}
                        className={classNames(
                          tab.current
                            ? 'border-primary text-[#363740]'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                          'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm'
                        )}
                        aria-current={tab.current ? 'page' : undefined}
                      >
                        {props.translator[tab.label]} 
                      </Link>
                    ))}
                  </nav>
                </div>
              </div>
            </div>

            {/* <nav
                className="px-4 sm:px-6 flex space-x-8 gap-2 d-none"
                aria-label="Tabs"
            >
                {tabs.map((tab) => (
                    <Link
                        key={tab.name}
                        href={tab.href}
                        className={classNames(
                            tab.current
                                ? "bg-primary text-white"
                                : "border-transparent  text-[#3D4459] hover:text-primary hover:border-purple-500",
                            "whitespace-nowrap py-2 px-1 border-b-2 font-medium text-base  my-3"
                        )}
                    >
                        {tab.name} 
                    </Link> 
                ))} 
            </nav> */}
            {tabs.map((tab) => (
                <>
                    {tab.name == 'Contacts' &&
                        <ListView
                            headers={props.list_view_columns}
                            search={props.search}
                            filter={props.filter}
                            filter_condition={props.filter_condition}
                            filter_id={props.filter_id}
                            {...props}
                            translator={props.translator}
                        /> 
                    }
                </>
            ))}
                           
        </Authenticated>
    )
}

export default List;