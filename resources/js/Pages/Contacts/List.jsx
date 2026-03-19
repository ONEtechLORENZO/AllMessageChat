import React, { useState } from "react";
import Authenticated from "../../Layouts/Authenticated";
import ListView from "@/Components/Views/List/Index2";
import CategoryList from "../../Pages/Category/List";
import TagList from "../../Pages/Tag/List";
//import { Link } from 'heroicons-react';
import { Link, router } from "@inertiajs/react";
import { ArrowUpTrayIcon } from "@heroicons/react/24/solid";
import ImportContactsModal from "./ImportContactsModal";
function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
}

function List(props) {
    const [showImportModal, setShowImportModal] = useState(false);
    const contactActions = {
        ...(props.actions ?? {}),
        create: true,
    };

    const tabs = [
        { label: "All", name: "Contacts", href: "#", current: true },
        {
            label: "Lists",
            name: "Lists",
            href: route("listCategory"),
            current: false,
        },
        { label: "Tags", name: "Tags", href: route("listTag"), current: false },
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
                    {tab.name == "Contacts" && (
                        <ListView
                            headers={props.list_view_columns}
                            search={props.search}
                            filter={props.filter}
                            filter_condition={props.filter_condition}
                            filter_id={props.filter_id}
                            {...props}
                            actions={contactActions}
                            headerActions={
                                <button
                                    type="button"
                                    onClick={() => setShowImportModal(true)}
                                    className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition hover:bg-white/10"
                                >
                                    <ArrowUpTrayIcon className="h-4 w-4" />
                                    Import Contacts
                                </button>
                            }
                            add_button_text={
                                props.translator?.["Add Contact"] ??
                                `${props.translator?.Add ?? "Add"} ${props.singular ?? "Contact"}`
                            }
                            translator={props.translator}
                        />
                    )}
                </>
            ))}
            {showImportModal ? (
                <ImportContactsModal
                    translator={props.translator}
                    onClose={() => setShowImportModal(false)}
                    onImported={() =>
                        router.reload({
                            preserveScroll: true,
                            preserveState: true,
                        })
                    }
                />
            ) : null}
        </Authenticated>
    );
}

export default List;
