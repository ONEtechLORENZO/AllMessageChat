import React, { Fragment, useEffect, useMemo, useState } from "react";
import Authenticated from "@/Layouts/Authenticated";
import { Head, Link, router as Inertia, useForm } from "@inertiajs/react";
import { Dialog, Transition } from "@headlessui/react";
import Select from "react-select";
import {
    ArrowPathIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    MagnifyingGlassIcon,
    PlusIcon,
    TrashIcon,
} from "@heroicons/react/24/solid";
import { FolderPlusIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import notie from "notie";
import nProgress from "nprogress";
import languages from "@/Pages/languages";
import PristineJS from "pristinejs";
import Input from "@/Components/Forms/Input";
import InputError from "@/Components/Forms/InputError";
import { defaultPristineConfig } from "@/Pages/Constants";

function getLocalDateKey(value) {
    if (!value) return "";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function Templates(props) {
    const [templates, setTemplates] = useState(props.templates ?? []);
    const [selectedAccountId, setSelectedAccountId] = useState(
        props.account?.id ? String(props.account.id) : "",
    );
    const [isLoading, setIsLoading] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [templateNameSearch, setTemplateNameSearch] = useState("");
    const [templateStatusFilter, setTemplateStatusFilter] = useState("");
    const [templateCreatedOnFilter, setTemplateCreatedOnFilter] = useState("");
    const { data, setData, post, processing, reset, errors, clearErrors } =
        useForm({
            template_name: "",
            category: "",
            languages: ["en"],
        });

    useEffect(() => {
        setTemplates(props.templates ?? []);
        setSelectedAccountId(props.account?.id ? String(props.account.id) : "");
        setIsLoading(false);
    }, [props.templates, props.account?.id]);

    useEffect(() => {
        setTemplateNameSearch("");
        setTemplateStatusFilter("");
        setTemplateCreatedOnFilter("");
    }, [props.account?.id]);

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

        const params = new URLSearchParams(window.location.search);
        const assistantSearch = params.get("assistant_search");
        const assistantMode = params.get("assistant");

        if (assistantSearch) {
            setTemplateNameSearch(assistantSearch);
        }

        if (assistantMode === "create" && props.account?.id) {
            setIsCreateModalOpen(true);
        }
    }, [props.account?.id]);

    const resolvedAccount = useMemo(() => {
        if (props.account?.id) return props.account;
        if (!selectedAccountId) return null;
        return (
            props.accounts?.find(
                (account) => String(account.id) === String(selectedAccountId),
            ) ?? null
        );
    }, [props.account, props.accounts, selectedAccountId]);

    function openAccount(accountId) {
        setSelectedAccountId(String(accountId));
        setTemplates([]);
        setIsLoading(true);
        Inertia.get(
            route("account_templates", { account_id: accountId }),
            {},
            {
                preserveScroll: true,
                preserveState: false,
                onFinish: () => setIsLoading(false),
            },
        );
    }

    function clearSelectedAccount() {
        setSelectedAccountId("");
        setTemplates([]);
        setIsLoading(true);
        Inertia.get(
            route("account_templates"),
            {},
            {
                preserveScroll: true,
                preserveState: false,
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
    const templateCategories = [
        "AUTHENTICATION",
        "MARKETING",
        "UTILITY",
    ];
    const templateStatusOptions = useMemo(() => {
        return Array.from(
            new Set(
                (templates ?? [])
                    .map((template) => template.status)
                    .filter(Boolean),
            ),
        );
    }, [templates]);

    const filteredTemplates = useMemo(() => {
        const normalizedNameSearch = templateNameSearch.trim().toLowerCase();

        return (templates ?? []).filter((template) => {
            const matchesName =
                !normalizedNameSearch ||
                (template.name ?? "")
                    .toLowerCase()
                    .includes(normalizedNameSearch);
            const matchesStatus =
                !templateStatusFilter ||
                String(template.status ?? "").toLowerCase() ===
                    templateStatusFilter.toLowerCase();
            const matchesCreatedOn =
                !templateCreatedOnFilter ||
                getLocalDateKey(template.created_at) ===
                    templateCreatedOnFilter;

            return matchesName && matchesStatus && matchesCreatedOn;
        });
    }, [
        templates,
        templateNameSearch,
        templateStatusFilter,
        templateCreatedOnFilter,
    ]);

    const createTemplateLanguageSelectStyles = useMemo(
        () => ({
            control: (base, state) => ({
                ...base,
                minHeight: 48,
                borderRadius: 12,
                backgroundColor: "#171717",
                borderColor: state.isFocused
                    ? "rgba(217, 70, 239, 0.6)"
                    : "rgba(255, 255, 255, 0.1)",
                boxShadow: "none",
                color: "#ffffff",
                "&:hover": {
                    borderColor: state.isFocused
                        ? "rgba(217, 70, 239, 0.6)"
                        : "rgba(255, 255, 255, 0.18)",
                },
            }),
            menu: (base) => ({
                ...base,
                backgroundColor: "#12041f",
                border: "1px solid rgba(255,255,255,0.1)",
                overflow: "hidden",
            }),
            menuList: (base) => ({
                ...base,
                paddingTop: 4,
                paddingBottom: 4,
            }),
            option: (base, state) => ({
                ...base,
                backgroundColor: state.isFocused
                    ? "rgba(217, 70, 239, 0.16)"
                    : "transparent",
                color: "#ffffff",
                cursor: "pointer",
            }),
            singleValue: (base) => ({
                ...base,
                color: "#ffffff",
            }),
            multiValue: (base) => ({
                ...base,
                backgroundColor: "rgba(255,255,255,0.08)",
                borderRadius: 9999,
            }),
            multiValueLabel: (base) => ({
                ...base,
                color: "#ffffff",
            }),
            multiValueRemove: (base) => ({
                ...base,
                color: "rgba(255,255,255,0.7)",
                borderRadius: 9999,
                ":hover": {
                    backgroundColor: "rgba(248, 113, 113, 0.15)",
                    color: "#fca5a5",
                },
            }),
            input: (base) => ({
                ...base,
                color: "#ffffff",
            }),
            placeholder: (base) => ({
                ...base,
                color: "rgba(255,255,255,0.35)",
            }),
            indicatorSeparator: (base) => ({
                ...base,
                backgroundColor: "rgba(255,255,255,0.1)",
            }),
            dropdownIndicator: (base) => ({
                ...base,
                color: "rgba(255,255,255,0.45)",
                ":hover": {
                    color: "rgba(255,255,255,0.75)",
                },
            }),
        }),
        [],
    );

    function openCreateTemplateModal() {
        if (!hasAccount) return;
        clearErrors();
        reset();
        setData({
            template_name: "",
            category: "",
            languages: [],
        });
        setIsCreateModalOpen(true);
    }

    function closeCreateTemplateModal() {
        setIsCreateModalOpen(false);
        clearErrors();
    }

    function handleCreateTemplateChange(event) {
        const { name, value, options, multiple } = event.target;

        if (multiple) {
            setData(
                name,
                Array.from(options)
                    .filter((option) => option.selected)
                    .map((option) => option.value),
            );
            return;
        }

        setData(name, value);
    }

    function handleCreateTemplateLanguageChange(selectedValues) {
        const values = (selectedValues ?? []).map((language) => language.code);
        setData("languages", values);
    }

    function createTemplate(event) {
        if (event) {
            event.preventDefault();
        }
        if (!selectedAccountId) return;

        const pristine = new PristineJS(
            document.getElementById("new_template"),
            defaultPristineConfig,
        );
        const isValidated = pristine.validate(
            document.querySelectorAll(
                "#new_template input[data-pristine-required], #new_template select[data-pristine-required]",
            ),
        );

        if (!isValidated || !data.languages?.length) {
            return false;
        }

        post(route("create_new_template", { id: selectedAccountId }), {
            preserveScroll: true,
            onSuccess: () => {
                closeCreateTemplateModal();
            },
        });
    }

    function getStatusClasses(status) {
        const normalizedStatus = (status || "").toLowerCase();

        if (
            normalizedStatus === "active" ||
            normalizedStatus === "live"
        ) {
            return "border-emerald-400/20 bg-emerald-400/10 text-emerald-200";
        }

        if (
            normalizedStatus === "inactive" ||
            normalizedStatus === "disabled"
        ) {
            return "border-rose-400/20 bg-rose-400/10 text-rose-200";
        }

        if (normalizedStatus === "sandbox") {
            return "border-amber-400/20 bg-amber-400/10 text-amber-200";
        }

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
            hidePageTitle
        >
            <Head title={props.translator["Templates"] ?? "Templates"} />

            <div className="dashboard-page relative pt-4 pb-8">
                <div className="relative z-10 space-y-8 px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-wrap items-start justify-between gap-6">
                        <div className="space-y-3">
                            <h2 className="flex flex-wrap items-baseline gap-x-3 leading-none">
                                <span className="one-tech-special text-4xl font-black tracking-tight sm:text-5xl">
                                    {props.translator["Templates"] ?? "Templates"}
                                </span>
                            </h2>
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

                        {hasAccount ? (
                            <button
                                type="button"
                                onClick={clearSelectedAccount}
                                className="inline-flex items-center gap-2 border border-white/70 bg-transparent px-7 py-4 text-sm font-semibold text-white transition hover:border-white hover:bg-white/[0.04]"
                            >
                                <ChevronLeftIcon className="h-4 w-4" />
                                {props.translator["Accounts"] ?? "Accounts"}
                            </button>
                        ) : null}
                    </div>

                    <GlassCard className="overflow-hidden shadow-[0_24px_90px_rgba(0,0,0,0.35)]">
                    {hasAccount ? (
                        <div className="flex flex-col gap-4 border-b border-white/10 pb-5 md:flex-row md:items-start md:justify-between">
                            <div className="space-y-2">
                                <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-fuchsia-200">
                                    {resolvedAccount.company_name}
                                </div>
                                <div className="text-sm text-white/60">
                                    {props.translator[
                                        "Templates for this account"
                                    ] ?? "Templates for this account"}
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={openCreateTemplateModal}
                                    disabled={!hasAccount}
                                    style={{
                                        backgroundColor: "#BF00FF",
                                        borderColor: "#BF00FF",
                                        borderRadius: "16px",
                                    }}
                                    className="inline-flex min-h-[52px] min-w-[170px] items-center justify-center gap-2 px-5 py-3 text-base font-semibold leading-none whitespace-nowrap text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <PlusIcon className="h-4 w-4 shrink-0" />
                                    {props.translator["Add template"] ?? "Add template"}
                                </button>

                                <button
                                    onClick={() => syncTemplates()}
                                    disabled={!hasAccount || isLoading}
                                    style={{
                                        backgroundColor: "#BF00FF",
                                        borderColor: "#BF00FF",
                                        borderRadius: "16px",
                                    }}
                                    className="inline-flex min-h-[52px] min-w-[170px] items-center justify-center gap-2 px-5 py-3 text-base font-semibold leading-none whitespace-nowrap text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <ArrowPathIcon
                                        className={`h-4 w-4 shrink-0 ${isLoading ? "animate-spin" : ""}`}
                                    />
                                    {props.translator["Sync Templates"]}
                                </button>
                            </div>
                        </div>
                    ) : null}

                    <div className={`${hasAccount ? "mt-5" : ""} overflow-hidden`}>
                        {!hasAccount ? (
                            <div className="space-y-4">
                                {(props.accounts ?? []).length > 0 ? (
                                    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#100517]/40">
                                        {(props.accounts ?? []).map((account) => (
                                            <button
                                                key={account.id}
                                                type="button"
                                                onClick={() => openAccount(account.id)}
                                                className="w-full border-b border-white/10 px-5 py-4 text-left transition last:border-b-0 hover:bg-white/[0.03]"
                                            >
                                                <div className="flex flex-col gap-3 lg:grid lg:grid-cols-[minmax(0,1.8fr)_auto_auto] lg:items-center lg:gap-5">
                                                    <div className="min-w-0 space-y-1">
                                                        <div className="text-lg font-semibold text-white">
                                                            {account.company_name} ({account.service})
                                                        </div>
                                                        <div className="text-sm text-white/60">
                                                            Account Id : {account.id}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center lg:justify-center">
                                                        <span
                                                            className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${getStatusClasses(account.status)}`}
                                                        >
                                                            {account.status ?? "Unknown"}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center justify-start lg:justify-end">
                                                        <span className="inline-flex items-center gap-2 rounded-full border border-fuchsia-400/20 bg-fuchsia-500/10 px-4 py-1.5 text-sm font-semibold text-fuchsia-100 transition hover:bg-fuchsia-500/20">
                                                            Open
                                                            <ChevronRightIcon className="h-3.5 w-3.5" />
                                                        </span>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-12 text-center">
                                        <FolderPlusIcon className="mx-auto h-12 w-12 text-white/40" />
                                        <h3 className="mt-3 text-sm font-medium text-white">
                                            No accounts found
                                        </h3>
                                    </div>
                                )}
                            </div>
                        ) : isLoading ? (
                            <div className="py-12 text-center text-sm text-white/70">
                                {props.translator["Loading templates..."] ??
                                    "Loading templates..."}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="grid gap-4 border-b border-white/10 px-5 pb-5 lg:grid-cols-[minmax(0,1.4fr)_180px_140px_184px] lg:items-end lg:gap-6">
                                    <label className="block">
                                        <span className="mb-2 block text-sm font-medium text-white/70">
                                            {props.translator["Name"] ?? "Name"}
                                        </span>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={templateNameSearch}
                                                onChange={(event) =>
                                                    setTemplateNameSearch(
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder={
                                                    props.translator[
                                                        "Search by name"
                                                    ] ?? "Search by name"
                                                }
                                                className="w-full rounded-xl border-0 bg-[#171717] py-2.5 pl-4 pr-10 text-sm text-white placeholder:text-white/35 focus:outline-none focus:ring-0 focus:border-transparent"
                                            />
                                            <MagnifyingGlassIcon className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                                        </div>
                                    </label>

                                    <label className="block">
                                        <span className="mb-2 block text-sm font-medium text-white/70">
                                            {props.translator["Created On"] ??
                                                "Created On"}
                                        </span>
                                        <input
                                            type="date"
                                            value={templateCreatedOnFilter}
                                            onChange={(event) =>
                                                setTemplateCreatedOnFilter(
                                                    event.target.value,
                                                )
                                            }
                                            className="w-full rounded-xl border-0 bg-[#171717] px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-0 focus:border-transparent"
                                        />
                                    </label>

                                    <label className="block">
                                        <span className="mb-2 block text-sm font-medium text-white/70">
                                            {props.translator["Status"] ?? "Status"}
                                        </span>
                                        <select
                                            value={templateStatusFilter}
                                            onChange={(event) =>
                                                setTemplateStatusFilter(
                                                    event.target.value,
                                                )
                                            }
                                            className="w-full rounded-xl border-0 bg-[#171717] px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-0 focus:border-transparent"
                                        >
                                            <option value="">
                                                {props.translator["All"] ?? "All"}
                                            </option>
                                            {templateStatusOptions.map((status) => (
                                                <option key={status} value={status}>
                                                    {status}
                                                </option>
                                            ))}
                                        </select>
                                    </label>

                                    <div className="hidden lg:block" />
                                </div>

                                <div className="hidden border-b border-white/10 px-5 pb-3 lg:grid lg:grid-cols-[minmax(0,1.4fr)_180px_140px_184px] lg:items-center lg:gap-6">
                                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                                        {props.translator["Name"] ?? "Name"}
                                    </div>
                                    <div className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                                        {props.translator["Created On"] ?? "Created On"}
                                    </div>
                                    <div className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                                        {props.translator["Status"] ?? "Status"}
                                    </div>
                                    <div />
                                </div>

                                {filteredTemplates.map((data) => {
                                    return (
                                        <div
                                            key={data.id}
                                            className="group overflow-hidden rounded-3xl border border-white/10 bg-[#100517]/85 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.28)] transition hover:border-fuchsia-400/20 hover:bg-[#14081d]/90"
                                        >
                                            <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1.4fr)_180px_140px_184px] lg:items-center lg:gap-6">
                                                <div className="min-w-0 flex-1 space-y-3">
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

                                                <div className="text-center text-sm text-white/60">
                                                    {data.created_at
                                                        ? new Date(
                                                              data.created_at,
                                                          ).toLocaleDateString(
                                                              "en-US",
                                                          )
                                                        : "-"}
                                                </div>

                                                <div className="flex items-center justify-center">
                                                    <span
                                                        className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${getStatusClasses(data.status)}`}
                                                    >
                                                        {data.status ?? "Unknown"}
                                                    </span>
                                                </div>

                                                <div className="flex items-center justify-start gap-4 self-center lg:justify-end">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            deleteTemplate(data.id)
                                                        }
                                                        className="inline-flex h-10 w-10 items-center justify-center text-red-400 transition hover:text-red-300"
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
                        (!filteredTemplates || filteredTemplates.length == 0) ? (
                            <div className="py-12 text-center">
                                <FolderPlusIcon className="mx-auto h-12 w-12 text-white/35" />
                                <h3 className="mt-2 text-sm font-medium text-white">
                                    {props.translator["No templates found"] ??
                                        "No templates found"}
                                </h3>
                                <p className="mt-1 text-sm text-white/55">
                                    {templates?.length
                                        ? props.translator[
                                              "No templates match the current filters."
                                          ] ??
                                          "No templates match the current filters."
                                        : props.translator[
                                              "Sync templates or choose another account to continue."
                                          ] ??
                                          "Sync templates or choose another account to continue."}
                                </p>
                            </div>
                        ) : null}
                    </div>
                    </GlassCard>
                </div>
            </div>

            <Transition.Root show={isCreateModalOpen} as={Fragment}>
                <Dialog
                    as="div"
                    className="relative z-50"
                    onClose={closeCreateTemplateModal}
                >
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                                enterTo="opacity-100 translate-y-0 sm:scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            >
                                <Dialog.Panel className="inline-block w-full max-w-lg transform overflow-hidden rounded-3xl border border-white/10 bg-[#12041f] px-4 pt-5 pb-4 text-left shadow-[0_24px_80px_rgba(0,0,0,0.45)] transition-all sm:p-6">
                                    <div>
                                        <Dialog.Title
                                            as="h3"
                                            className="text-3xl font-semibold leading-6 text-white"
                                        >
                                            {props.translator["Add template"] ?? "Add template"}
                                        </Dialog.Title>
                                        <div className="mt-2">
                                            <p className="pb-4 pt-3 text-sm leading-7 text-white/60">
                                                {props.translator[
                                                    "Create a new WhatsApp template. Each template must have a unique name consisting of lowercase alphanumeric characters.Spaces must be replaced with underscores (_). Only WhatsApp templates within the pre-defined categories can be accepted."
                                                ]}
                                            </p>

                                            <form id="new_template">
                                                <div className="grid gap-6">
                                                    <div className="form-group col-span-6 sm:col-span-4">
                                                        <label
                                                            htmlFor="template_name"
                                                            className="block text-sm font-medium text-white/80"
                                                        >
                                                            {props.translator["Name"] ?? "Name"}{" "}
                                                            <span className="text-red-500">*</span>
                                                        </label>
                                                        <div className="mt-1 flex rounded-md shadow-sm">
                                                            <Input
                                                                name="template_name"
                                                                required={true}
                                                                id="template_name"
                                                                value={data.template_name}
                                                                placeholder={
                                                                    props.translator["Template name"] ??
                                                                    "Template name"
                                                                }
                                                                handleChange={handleCreateTemplateChange}
                                                                className="border-0 bg-[#171717] px-4 py-3 text-white placeholder:text-white/35 focus:border-fuchsia-500/60 focus:ring-fuchsia-500/20"
                                                            />
                                                        </div>
                                                        <InputError message={errors.template_name} />
                                                    </div>

                                                    <div className="form-group col-span-6 sm:col-span-4">
                                                        <label
                                                            htmlFor="category"
                                                            className="block text-sm font-medium text-white/80"
                                                        >
                                                            {props.translator["Category"] ?? "Category"}{" "}
                                                            <span className="text-red-500">*</span>
                                                        </label>
                                                        <div className="mt-1">
                                                            <select
                                                                id="category"
                                                                name="category"
                                                                value={data.category}
                                                                data-pristine-required
                                                                onChange={handleCreateTemplateChange}
                                                                className="block w-full rounded-xl border border-white/10 bg-[#171717] px-4 py-3 text-sm text-white focus:border-fuchsia-500/60 focus:outline-none focus:ring-fuchsia-500/20"
                                                            >
                                                                <option value="">
                                                                    Select
                                                                </option>
                                                                {templateCategories.map((category) => (
                                                                    <option
                                                                        key={category}
                                                                        value={category}
                                                                    >
                                                                        {category}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <InputError message={errors.category} />
                                                    </div>

                                                    <div className="form-group col-span-6 sm:col-span-4">
                                                        <label
                                                            htmlFor="languages"
                                                            className="block text-sm font-medium text-white/80"
                                                        >
                                                            {props.translator["Languages"] ?? "Languages"}{" "}
                                                            <span className="text-red-500">*</span>
                                                        </label>
                                                        <div className="mt-1">
                                                            <Select
                                                                options={languages}
                                                                isMulti
                                                                getOptionLabel={(option) => option.name}
                                                                getOptionValue={(option) => option.code}
                                                                id="languages"
                                                                name="languages"
                                                                value={languages.filter((language) =>
                                                                    data.languages?.includes(language.code),
                                                                )}
                                                                onChange={handleCreateTemplateLanguageChange}
                                                                placeholder="Select..."
                                                                className="text-sm"
                                                                classNamePrefix="react-select"
                                                                styles={createTemplateLanguageSelectStyles}
                                                            />
                                                        </div>
                                                        <InputError message={errors.languages} />
                                                    </div>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                    <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                                        <button
                                            type="button"
                                            disabled={processing}
                                            className="inline-flex w-full justify-center rounded-xl border border-transparent bg-fuchsia-600 px-4 py-3 text-base font-medium text-white shadow-sm transition hover:bg-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/40 focus:ring-offset-0 disabled:opacity-60 sm:col-start-2 sm:text-sm"
                                            onClick={createTemplate}
                                        >
                                            {props.translator["Create"] ?? "Create"}
                                        </button>
                                        <button
                                            type="button"
                                            className="mt-3 inline-flex w-full justify-center rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-base font-medium text-white/85 shadow-sm transition hover:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-fuchsia-500/40 focus:ring-offset-0 sm:col-start-1 sm:mt-0 sm:text-sm"
                                            onClick={closeCreateTemplateModal}
                                        >
                                            {props.translator["Close"] ?? "Close"}
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>
        </Authenticated>
    );
}

function GlassCard({ className = "", children }) {
    return (
        <div
            className={[
                "relative rounded-3xl bg-[#170024]/80 backdrop-blur-sm group",
                className,
            ].join(" ")}
        >
            <div className="relative z-10 flex h-full flex-col p-6">{children}</div>
        </div>
    );
}

export default Templates;
