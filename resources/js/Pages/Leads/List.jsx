import React from "react";
import Authenticated from "../../Layouts/Authenticated";
import ListView from "@/Components/Views/List/Index2";
import CategoryList from "../../Pages/Category/List";
import TagList from "../../Pages/Tag/List";
//import { Link } from 'heroicons-react';
import { Link } from "@inertiajs/react";
function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
}

function List(props) {
    const tabs = [
        {
            label: props.translator["Leads"],
            name: "Leads",
            href: "#",
            current: true,
        },
        {
            label: props.translator["Fields"],
            name: "Fields",
            href: route("listField", { mod: props.module }),
            current: false,
        },
    ];
    return (
        <Authenticated
            auth={props.auth}
            errors={props.errors}
            current_page={props.current_page}
            navigationMenu={props.menuBar}
        >
            <div className="mt-6 sm:mt-2 2xl:mt-5 !mb-6">
                <div className="border-b border-gray-200">
                    <div className="mx-auto px-4 sm:px-6 lg:px-8">
                        <nav
                            className="-mb-px flex space-x-8"
                            aria-label="Tabs"
                        >
                            {tabs.map((tab) => (
                                <Link
                                    key={tab.name}
                                    href={tab.href}
                                    className={classNames(
                                        tab.current
                                            ? "border-primary text-[#363740]"
                                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
                                        "whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm",
                                    )}
                                    aria-current={
                                        tab.current ? "page" : undefined
                                    }
                                >
                                    {tab.label}
                                </Link>
                            ))}
                        </nav>
                    </div>
                </div>
            </div>

            {tabs.map((tab) => (
                <>
                    {tab.name == "Leads" && (
                        <ListView
                            headers={props.list_view_columns}
                            {...props}
                            translator={props.translator}
                        />
                    )}
                </>
            ))}
        </Authenticated>
    );
}

export default List;
