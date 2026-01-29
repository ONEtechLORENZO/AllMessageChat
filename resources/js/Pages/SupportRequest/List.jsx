import React from 'react';
import Authenticated from "../../Layouts/Authenticated";
import ListView from '@/Components/Views/List/Index2';
import CategoryList from '../../Pages/Category/List';
import TagList from '../../Pages/Tag/List';
//import { Link } from 'heroicons-react';
import { Link } from "@inertiajs/react";
function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
}

function List(props)
{
    const tabs = [
        { label:'Support Requests',name: 'supportrequest', href: '#',current: true },        
     //   { label:'Fields',name: 'Fields', href: route("listField",{'mod':props.module}),current: false }

      ];
    return (
        <Authenticated
            auth={props.auth}
            errors={props.errors}
            current_page={props.current_page}
        >
                <nav
                    className="px-4 sm:px-6 flex space-x-8 gap-2"
                    aria-label="Tabs"
                >
                    {tabs.map((tab) => (
                        <Link
                            key={tab.name}
                            href={tab.href}
                            className={classNames(
                                tab.current
                                    ? "border-purple-500 text-primary"
                                    : "border-transparent text-[#3D4459] hover:text-primary hover:border-purple-500",
                                "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-base  my-6"
                            )}
                        >
                            {tab.label}  
                        </Link>
                    ))} 
                </nav>
                {tabs.map((tab) => (
                    <>
                        {tab.name=='supportrequest' &&
                            <ListView
                                headers={props.list_view_columns}
                                current_user={props.current_user}
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












