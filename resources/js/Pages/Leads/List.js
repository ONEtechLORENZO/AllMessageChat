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
        { label:'Leads',name: 'Leads', href: '#',current: true },        
        { label:'Fields',name: 'Fields', href: route("listField",{'mod':props.module}),current: false }

      ];
    return (
        <Authenticated
            auth={props.auth}
            errors={props.errors}
            current_page={props.current_page}
        >
                <nav
                    className="px-4 sm:px-6 flex gap-2 mb-3"
                    aria-label="Tabs"
                >
                    {tabs.map((tab) => (
                        <Link
                            key={tab.name}
                            href={tab.href}
                            className={classNames(
                                tab.current
                                    ? "bg-primary text-white shadow-blue-500/50 shadow-md"
                                    : "border-transparent text-gray-500  hover:bg-[#545cd8] hover:text-white hover:shadow-blue-500/50 hover:shadow-md",
                                "whitespace-nowrap px-3 py-2 font-medium text-base  my-2 rounded-md"
                            )}
                        >
                            {tab.name}  
                        </Link>
                    ))} 
                </nav>
                {tabs.map((tab) => (
                    <>
                        {tab.name=='Leads' &&
                            <ListView
                                headers={props.list_view_columns}
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