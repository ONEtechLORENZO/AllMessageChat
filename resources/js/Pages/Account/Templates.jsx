import React, { useState, useEffect, useMemo } from "react";
import Authenticated from "@/Layouts/Authenticated";
import { Head, Link, router as Inertia } from "@inertiajs/react";
import {
    ArrowPathIcon,
    ChevronRightIcon,
    TrashIcon,
} from "@heroicons/react/24/solid";
import { FolderPlusIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import notie from "notie";
import nProgress from "nprogress";

function Templates(props) {
    const [templates, setTemplates] = useState(props.templates ?? []);
    const [selectedAccountId, setSelectedAccountId] = useState(
        props.account?.id ? String(props.account.id) : "",
    );
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setTemplates(props.templates ?? []);
        setSelectedAccountId(props.account?.id ? String(props.account.id) : "");
        setIsLoading(false);
    }, [props.templates, props.account?.id]);

    const resolvedAccount = useMemo(() => {
        if (props.account?.id) return props.account;
        if (!selectedAccountId) return null;
        return (
            props.accounts?.find(
                (account) => String(account.id) === String(selectedAccountId),
            ) ?? null
        );
    }, [props.account, props.accounts, selectedAccountId]);

    function handleAccountChange(event) {
        const nextId = event.target.value;
        setSelectedAccountId(nextId);
        setTemplates([]);
        setIsLoading(!!nextId);
        Inertia.get(
            route("account_templates", { account_id: nextId }),
            {},
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
                onFinish: () => setIsLoading(false),
            },
        );
    }

    function refreshTemplates() {
        if (!selectedAccountId) return;
        setIsLoading(true);
        Inertia.get(
            route("account_templates", { account_id: selectedAccountId }),
            {},
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
                onFinish: () => setIsLoading(false),
            },
        );
    }

    function syncTemplates() {
        if (!selectedAccountId) return;
        nProgress.start(0.5);
        nProgress.inc(0.2);
        axios
            .get(route("sync_templates", { account: selectedAccountId }))
            .then(() => {
                nProgress.done();
                notie.alert({
                    type: "success",
                    text: "Template synced successfully",
                    time: 5,
                });
                refreshTemplates();
            });
    }

    function deleteTemplate(id) {
        const confirmation = window.confirm(
            props.translator["Are you sure you want to delete this Templete?"],
        );
        if (confirmation) {
            axios.post(route("delete_template", id)).then(() => {
                refreshTemplates();
            });
        }
    }

    const hasAccount = !!resolvedAccount;

    function getStatusClasses(status) {
        const normalizedStatus = (status || "").toLowerCase();

        if (normalizedStatus === "approved") {
            return "border-emerald-400/20 bg-emerald-400/10 text-emerald-200";
        }

        if (
            normalizedStatus === "rejected" ||
            normalizedStatus.includes("rejected")
        ) {
            return "border-amber-400/20 bg-amber-400/10 text-amber-200";
        }

        if (
            normalizedStatus === "submitted" ||
            normalizedStatus === "pending"
        ) {
            return "border-sky-400/20 bg-sky-400/10 text-sky-200";
        }

        return "border-white/10 bg-white/[0.04] text-white/70";
    }

    return (
        <Authenticated
            auth={props.auth}
            errors={props.errors}
            current_page={props.current_page}
            navigationMenu={props.menuBar}
        >
            <Head title={props.translator["Templates"] ?? "Templates"} />

            <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                <div className="flex flex-wrap items-start justify-between gap-6">
                    <div className="space-y-2">
                        <h3 className="text-3xl font-semibold tracking-tight text-white">
                            {props.translator["Templates"] ?? "Templates"}
                        </h3>
                        {hasAccount ? (
                            <p className="text-sm text-white/60">
                                {resolvedAccount.company_name} -{" "}
                                {props.translator[resolvedAccount.category] ??
                                    resolvedAccount.category}
                            </p>
                        ) : (
                            <p className="text-sm text-white/60">
                                {props.translator[
                                    "Select an account to view templates."
                                ] ?? "Select an account to view templates."}
                            </p>
                        )}
                    </div>

                    <div className="min-w-[280px]">
                        <label
                            htmlFor="account_id"
                            className="block text-sm font-medium uppercase tracking-[0.18em] text-white/55"
                        >
                            {props.translator["Account"] ?? "Account"}
                        </label>
                        <select
                            id="account_id"
                            name="account_id"
                            value={selectedAccountId}
                            onChange={handleAccountChange}
                            className="mt-2 w-full rounded-2xl border border-white/10 bg-[#100517]/80 px-4 py-3 text-sm text-white shadow-[0_10px_30px_rgba(0,0,0,0.18)] focus:border-fuchsia-500/60 focus:outline-none"
                        >
                            <option value="">
                                {props.translator["Select account"] ??
                                    "Select account"}
                            </option>
                            {props.accounts?.map((account) => (
                                <option key={account.id} value={account.id}>
                                    {account.company_name} ({account.service})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#140816]/70 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.35)] ring-1 ring-white/5 backdrop-blur-3xl">
                    <div className="flex flex-col gap-4 border-b border-white/10 pb-5 md:flex-row md:items-start md:justify-between">
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-fuchsia-200">
                                {props.translator["Templates"] ?? "Templates"}
                            </div>
                            <div className="text-sm text-white/60">
                                {hasAccount
                                    ? (props.translator[
                                          "Templates for this account"
                                      ] ?? "Templates for this account")
                                    : (props.translator[
                                          "Choose an account to see templates"
                                      ] ?? "Choose an account to see templates")}
                            </div>
                        </div>

                        <button
                            onClick={() => syncTemplates()}
                            disabled={!hasAccount || isLoading}
                            className="inline-flex items-center justify-center gap-2 rounded-full bg-fuchsia-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-fuchsia-500 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <ArrowPathIcon
                                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                            />
                            {props.translator["Sync Templates"]}
                        </button>
                    </div>

                    <div className="mt-5 overflow-hidden">
                        {!hasAccount ? (
                            <div className="py-12 text-center">
                                <FolderPlusIcon className="mx-auto h-12 w-12 text-white/40" />
                                <h3 className="mt-3 text-sm font-medium text-white">
                                    {props.translator[
                                        "Select an account to continue"
                                    ] ?? "Select an account to continue"}
                                </h3>
                                <p className="mt-1 text-sm text-white/50">
                                    {props.translator[
                                        "You can only view templates after choosing an account."
                                    ] ??
                                        "You can only view templates after choosing an account."}
                                </p>
                            </div>
                        ) : isLoading ? (
                            <div className="py-12 text-center text-sm text-white/70">
                                {props.translator["Loading templates..."] ??
                                    "Loading templates..."}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {templates.map((data) => {
                                    return (
                                        <div
                                            key={data.id}
                                            className="group overflow-hidden rounded-3xl border border-white/10 bg-[#100517]/85 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.28)] transition hover:border-fuchsia-400/20 hover:bg-[#14081d]/90"
                                        >
                                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                                <div className="min-w-0 flex-1 space-y-3">
                                                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                                        <div className="min-w-0 space-y-1">
                                                            <Link
                                                                className="block truncate text-xl font-semibold text-white transition group-hover:text-fuchsia-100"
                                                                href={route(
                                                                    "template_detail_view",
                                                                    [
                                                                        data.account_id,
                                                                        data.id,
                                                                    ],
                                                                )}
                                                            >
                                                                {data.name}
                                                            </Link>
                                                            <p className="truncate text-sm text-white/55">
                                                                {
                                                                    props.translator[
                                                                        "Created by"
                                                                    ]
                                                                }{" "}
                                                                {data.creater_name?.name ??
                                                                    ""}{" "}
                                                                {data.created_at
                                                                    ? `on ${new Date(data.created_at).toLocaleDateString("en-US")}`
                                                                    : ""}
                                                            </p>
                                                        </div>

                                                        <span
                                                            className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${getStatusClasses(data.status)}`}
                                                        >
                                                            {data.status ?? "Unknown"}
                                                        </span>
                                                    </div>

                                                    <div className="flex flex-wrap gap-2">
                                                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-white/70">
                                                            {data.language}
                                                        </span>
                                                        {data.template_uid ? (
                                                            <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 font-mono text-xs text-white/55">
                                                                {data.template_uid}
                                                            </span>
                                                        ) : null}
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-end gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            deleteTemplate(data.id)
                                                        }
                                                        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/55 transition hover:border-red-400/20 hover:bg-red-500/10 hover:text-red-200"
                                                    >
                                                        <TrashIcon className="h-5 w-5" />
                                                    </button>
                                                    <Link
                                                        className="inline-flex items-center gap-2 rounded-full border border-fuchsia-400/20 bg-fuchsia-500/10 px-4 py-2 text-sm font-semibold text-fuchsia-100 transition hover:bg-fuchsia-500/20"
                                                        href={route(
                                                            "template_detail_view",
                                                            [
                                                                data.account_id,
                                                                data.id,
                                                            ],
                                                        )}
                                                    >
                                                        {props.translator["Open"] ??
                                                            "Open"}
                                                        <ChevronRightIcon className="h-4 w-4" />
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {hasAccount &&
                        !isLoading &&
                        (!templates || templates.length == 0) ? (
                            <div className="py-12 text-center">
                                <FolderPlusIcon className="mx-auto h-12 w-12 text-white/35" />
                                <h3 className="mt-2 text-sm font-medium text-white">
                                    {props.translator["No templates found"]}
                                </h3>
                                <p className="mt-1 text-sm text-white/55">
                                    {props.translator[
                                        "Sync templates or choose another account to continue."
                                    ] ??
                                        "Sync templates or choose another account to continue."}
                                </p>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </Authenticated>
    );
}

export default Templates;
