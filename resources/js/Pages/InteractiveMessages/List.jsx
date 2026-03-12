import React from "react";
import Authenticated from "../../Layouts/Authenticated";
import ListView from "@/Components/Views/List/Index2";
import CategoryList from "../Category/List";
import TagList from "../Tag/List";
//import { Link } from 'heroicons-react';
import { Head, Link } from "@inertiajs/react";
function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
}

function List(props) {
    return (
        <Authenticated
            auth={props.auth}
            errors={props.errors}
            current_page={props.current_page}
            navigationMenu={props.menuBar}
        >
            <Head title={props.plural} />

            <div className="dashboard-page relative pt-4 pb-8">
                <div className="purple-giant-arc" aria-hidden="true"></div>
                <div className="relative z-10 space-y-8 px-4 sm:px-6 lg:px-8">
                    <div className="pb-4">
                        <h2 className="mb-6 flex flex-wrap items-baseline gap-x-3 leading-none">
                            <span className="one-tech-special text-4xl font-black tracking-tight sm:text-5xl">
                                {props.plural}
                            </span>
                        </h2>
                    </div>

                    <GlassCard className="overflow-hidden shadow-[0_24px_90px_rgba(0,0,0,0.35)]">
                        <ListView
                            headers={props.list_view_columns}
                            {...props}
                            translator={props.translator}
                            noCardBorder
                        />
                    </GlassCard>
                </div>
            </div>
        </Authenticated>
    );
}

function GlassCard({ className = "", children }) {
    return (
        <div
            className={classNames(
                "relative overflow-hidden rounded-[32px] border border-white/10 bg-[rgba(20,5,32,0.82)] backdrop-blur-xl",
                className,
            )}
        >
            <div className="relative z-10 flex h-full flex-col p-6">{children}</div>
        </div>
    );
}

export default List;
