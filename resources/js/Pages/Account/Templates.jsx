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
    XMarkIcon,
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
            subject: "",
            category: "",
            languages: ["en"],
            service: "",
            template_type: "text",
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
        if (
            errors.template_name ||
            errors.subject ||
            errors.category ||
            errors.languages ||
            errors.template_type
        ) {
            setIsCreateModalOpen(true);
        }
    }, [errors]);

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
    const isEmailAccount =
        String(resolvedAccount?.service ?? "").toLowerCase() === "email";
    const isSocialTemplateAccount = ["facebook", "instagram"].includes(
        String(resolvedAccount?.service ?? "").toLowerCase(),
    );
    const isInstagramAccount = String(resolvedAccount?.service ?? "").toLowerCase() === "instagram";
    const templateTypeOptions = [
        { value: "text", label: "Text" },
        { value: "media", label: "Media" },
        { value: "card", label: "Card" },
        { value: "carousel", label: "Carousel" },
        ...(!isInstagramAccount ? [{ value: "quick_replies", label: "Quick replies" }] : []),
    ];

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
        if (isSocialTemplateAccount) {
            return ["DRAFT", "ACTIVE"];
        }

        const preferredStatuses = ["APPROVED", "PENDING", "DRAFT"];
        const existingStatuses = (templates ?? [])
            .map((template) => String(template.status ?? "").toUpperCase())
            .filter(Boolean);

        return Array.from(
            new Set([...preferredStatuses, ...existingStatuses]),
        );
    }, [isSocialTemplateAccount, templates]);

    const [currentPage, setCurrentPage] = useState(1);
    const TEMPLATES_PER_PAGE = 15;

    const filteredTemplates = useMemo(() => {
        setCurrentPage(1);
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
            subject: "",
            category: isEmailAccount
                ? "EMAIL"
                : isSocialTemplateAccount
                  ? String(resolvedAccount?.service ?? "").toUpperCase()
                  : "",
            languages: isEmailAccount || isSocialTemplateAccount ? [] : [],
            service: isEmailAccount ? "email" : String(resolvedAccount?.service ?? ""),
            template_type: "text",
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

        if (!isValidated) {
            return false;
        }

        if (!isEmailAccount && !isSocialTemplateAccount && !data.languages?.length) {
            return false;
        }

        post(route("create_new_template", { id: selectedAccountId }), {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                closeCreateTemplateModal();
            },
            onError: () => {
                setIsCreateModalOpen(true);
            },
        });
    }

    const createTemplateTitle = isEmailAccount
        ? "Add Email Template"
        : isSocialTemplateAccount
          ? String(resolvedAccount?.service ?? "").toLowerCase() === "facebook"
              ? "Create Facebook Message Template"
              : "Create Instagram Message Template"
          : props.translator["Add template"] ?? "Add template";
    const createTemplateDescription = isEmailAccount
        ? "Create a minimal email template with an internal name and a default subject. You will complete the HTML body and preview in the editor after creation."
        : isSocialTemplateAccount
          ? String(resolvedAccount?.service ?? "").toLowerCase() === "facebook"
              ? "Create a reusable message template for Facebook campaigns."
              : "Create a reusable message template for Instagram campaigns."
          : props.translator[
              "Create a new WhatsApp template. Each template must have a unique name consisting of lowercase alphanumeric characters.Spaces must be replaced with underscores (_). Only WhatsApp templates within the pre-defined categories can be accepted."
          ] ??
          "Create a new WhatsApp template. Each template must have a unique name consisting of lowercase alphanumeric characters. Spaces must be replaced with underscores (_). Only WhatsApp templates within the pre-defined categories can be accepted.";
    const createTemplateButtonLabel = isEmailAccount
        ? "Add Email Template"
        : isSocialTemplateAccount
          ? "Add template"
          : props.translator["Add template"] ?? "Add template";

    function getStatusClasses(status) {
        const normalizedStatus = (status || "").toLowerCase();

        if (
            normalizedStatus === "active" ||
            normalizedStatus === "live"
        ) {
            return "bg-emerald-400/10 text-emerald-200";
        }

        if (
            normalizedStatus === "inactive" ||
            normalizedStatus === "disabled"
        ) {
            return "bg-rose-400/10 text-rose-200";
        }

        if (normalizedStatus === "sandbox") {
            return "bg-amber-400/10 text-amber-200";
        }

        if (normalizedStatus === "approved") {
            return "bg-emerald-400/10 text-emerald-200";
        }

        if (
            normalizedStatus === "rejected" ||
            normalizedStatus.includes("rejected")
        ) {
            return "bg-amber-400/10 text-amber-200";
        }

        if (
            normalizedStatus === "submitted" ||
            normalizedStatus === "pending"
        ) {
            return "bg-sky-400/10 text-sky-200";
        }

        return "bg-white/[0.04] text-white/70";
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

                    {/* Account selection list — no GlassCard wrapper */}
                    {!hasAccount ? (
                        <div className="space-y-3">
                            {(props.accounts ?? []).length > 0 ? (
                                (props.accounts ?? []).map((account, index) => (
                                    <div
                                        key={account.id}
                                        className="flex items-center overflow-hidden rounded-xl bg-[#170024]/80"
                                    >
                                        {/* Number column */}
                                        <div className="flex w-14 shrink-0 items-center justify-center self-stretch border-r-2 border-[#d946a8]">
                                            <span className="text-base font-bold text-[#d946a8]">{index + 1}</span>
                                        </div>

                                        {/* Content */}
                                        <button
                                            type="button"
                                            onClick={() => openAccount(account.id)}
                                            className="flex flex-1 items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-white/[0.03]"
                                        >
                                            <div className="min-w-0 space-y-0.5">
                                                <div className="text-base font-extrabold uppercase tracking-wide text-white">
                                                    {account.company_name} ({account.service})
                                                </div>
                                                <div className="text-sm text-white/45">
                                                    Account Id : {account.id}
                                                </div>
                                            </div>

                                            <div className="flex shrink-0 items-center gap-2">
                                                <span className="rounded-lg bg-[#5b6af0] px-4 py-2 text-sm font-semibold text-white">
                                                    {account.status ?? "Active"}
                                                </span>
                                                <span className="rounded-lg bg-[#d946a8] px-4 py-2 text-sm font-semibold text-white">
                                                    open
                                                </span>
                                            </div>
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="py-12 text-center">
                                    <FolderPlusIcon className="mx-auto h-12 w-12 text-white/40" />
                                    <h3 className="mt-3 text-sm font-medium text-white">
                                        No accounts found
                                    </h3>
                                </div>
                            )}
                        </div>
                    ) : (
                    <GlassCard className="overflow-hidden shadow-[0_24px_90px_rgba(0,0,0,0.35)]">
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
                                    {createTemplateButtonLabel}
                                </button>

                                {!isEmailAccount && !isSocialTemplateAccount ? (
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
                                ) : null}
                            </div>
                        </div>

                    <div className="mt-5 overflow-hidden">
                        {isLoading ? (
                            <div className="py-12 text-center text-sm text-white/70">
                                {props.translator["Loading templates..."] ??
                                    "Loading templates..."}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="grid gap-4 border-b border-white/10 px-5 pb-5 lg:grid-cols-[minmax(0,1.25fr)_140px_180px_140px_184px] lg:items-end lg:gap-6">
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

                                    <div className="hidden lg:block" />

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

                                <div className="hidden border-b border-white/10 px-5 pb-3 lg:grid lg:grid-cols-[minmax(0,1.25fr)_140px_180px_140px_184px] lg:items-center lg:gap-6">
                                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                                        {props.translator["Name"] ?? "Name"}
                                    </div>
                                    <div className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                                        {props.translator["Type"] ?? "Type"}
                                    </div>
                                    <div className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                                        {props.translator["Created On"] ?? "Created On"}
                                    </div>
                                    <div className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                                        {props.translator["Status"] ?? "Status"}
                                    </div>
                                    <div />
                                </div>

                                {filteredTemplates.slice((currentPage - 1) * TEMPLATES_PER_PAGE, currentPage * TEMPLATES_PER_PAGE).map((data) => {
                                    const statusNorm = (data.status || "").toLowerCase();
                                    const accentColor =
                                        statusNorm === "active" || statusNorm === "live" || statusNorm === "approved"
                                            ? "bg-emerald-400"
                                            : statusNorm === "rejected" || statusNorm.includes("rejected")
                                            ? "bg-amber-400"
                                            : statusNorm === "submitted" || statusNorm === "pending"
                                            ? "bg-sky-400"
                                            : statusNorm === "inactive" || statusNorm === "disabled"
                                            ? "bg-rose-400"
                                            : "bg-violet-500";

                                    return (
                                        <div
                                            key={data.id}
                                            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#16082a]/90 to-[#0d0516]/95 shadow-[0_2px_16px_rgba(0,0,0,0.3)] transition-all duration-300 hover:shadow-[0_6px_28px_rgba(124,58,237,0.14)]"
                                        >
                                            {/* Left status accent bar */}
                                            <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${accentColor} opacity-75 rounded-l-2xl`} />

                                            {/* Top shimmer on hover */}
                                            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/25 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                                            <div className="pl-6 pr-5 py-4 flex flex-col gap-3 lg:grid lg:grid-cols-[minmax(0,1.25fr)_140px_180px_140px_184px] lg:items-center lg:gap-5">

                                                {/* Name */}
                                                <div className="min-w-0 flex-1 space-y-2">
                                                    <div className="min-w-0 space-y-0.5">
                                                        <Link
                                                            className="block truncate text-base font-bold text-white/90 transition-colors duration-200 group-hover:text-violet-200"
                                                            href={route("template_detail_view", [data.account_id, data.id])}
                                                        >
                                                            {data.name}
                                                        </Link>
                                                        {data.subject ? (
                                                            <div className="truncate text-xs text-white/40">
                                                                {data.subject}
                                                            </div>
                                                        ) : data.preview ? (
                                                            <div className="truncate text-xs text-white/40">
                                                                {data.preview}
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {!data.type ? (
                                                            <span className="rounded-full bg-violet-500/10 px-2.5 py-0.5 text-[11px] font-medium text-violet-300/75">
                                                                {data.service === "email" ? "Email" : data.language}
                                                            </span>
                                                        ) : null}
                                                        {data.template_uid ? (
                                                            <span className="rounded-full bg-white/[0.04] px-2.5 py-0.5 font-mono text-[11px] text-white/35">
                                                                {data.template_uid}
                                                            </span>
                                                        ) : null}
                                                    </div>
                                                </div>

                                                {/* Type */}
                                                <div className="text-center">
                                                    {data.type ? (
                                                        <span className="inline-flex items-center rounded-full bg-white/[0.05] px-3 py-1 text-xs font-medium text-white/55">
                                                            {String(data.type).replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                                                        </span>
                                                    ) : (
                                                        <span className="text-sm text-white/25">—</span>
                                                    )}
                                                </div>

                                                {/* Date */}
                                                <div className="text-center text-xs text-white/40">
                                                    {data.created_at
                                                        ? new Date(data.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
                                                        : "—"}
                                                </div>

                                                {/* Status */}
                                                <div className="flex items-center justify-center">
                                                    <span className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${getStatusClasses(data.status)}`}>
                                                        {data.status ?? "Unknown"}
                                                    </span>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center justify-start gap-2 self-center lg:justify-end">
                                                    <button
                                                        type="button"
                                                        onClick={() => deleteTemplate(data.id)}
                                                        className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-rose-400/50 transition hover:bg-rose-500/10 hover:text-rose-300"
                                                    >
                                                        <TrashIcon className="h-4 w-4" />
                                                    </button>
                                                    <Link
                                                        className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-1.5 text-xs font-semibold text-white shadow-[0_2px_12px_rgba(124,58,237,0.35)] transition hover:shadow-[0_4px_18px_rgba(124,58,237,0.5)] hover:brightness-110"
                                                        href={route("template_detail_view", [data.account_id, data.id])}
                                                    >
                                                        {props.translator["Open"] ?? "Open"}
                                                        <ChevronRightIcon className="h-3 w-3" />
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                {/* Pagination */}
                                {filteredTemplates.length > TEMPLATES_PER_PAGE && (
                                    <div className="mt-6 flex items-center justify-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#170024]/80 text-white/60 transition hover:bg-[#2a0040] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                                        >
                                            <ChevronLeftIcon className="h-4 w-4" />
                                        </button>

                                        {Array.from({ length: Math.ceil(filteredTemplates.length / TEMPLATES_PER_PAGE) }, (_, i) => i + 1).map((page) => (
                                            <button
                                                key={page}
                                                type="button"
                                                onClick={() => setCurrentPage(page)}
                                                className={`inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold transition ${
                                                    page === currentPage
                                                        ? "bg-[#BF00FF] text-white shadow-[0_4px_14px_rgba(191,0,255,0.35)]"
                                                        : "bg-[#170024]/80 text-white/60 hover:bg-[#2a0040] hover:text-white"
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        ))}

                                        <button
                                            type="button"
                                            onClick={() => setCurrentPage((p) => Math.min(Math.ceil(filteredTemplates.length / TEMPLATES_PER_PAGE), p + 1))}
                                            disabled={currentPage === Math.ceil(filteredTemplates.length / TEMPLATES_PER_PAGE)}
                                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#170024]/80 text-white/60 transition hover:bg-[#2a0040] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                                        >
                                            <ChevronRightIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}
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
                                        : isEmailAccount
                                          ? "Create an email template to get started."
                                          : props.translator[
                                                "Sync templates or choose another account to continue."
                                            ] ??
                                            "Sync templates or choose another account to continue."}
                                </p>
                            </div>
                        ) : null}
                    </div>
                    </GlassCard>
                    )}
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
                                <Dialog.Panel className="relative w-full max-w-5xl transform overflow-hidden rounded-[2.5rem] bg-[#140816]/95 text-white shadow-2xl ring-1 ring-white/5 transition-all">
                                    <button
                                        type="button"
                                        onClick={closeCreateTemplateModal}
                                        className="absolute right-6 top-6 z-20 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-600/80 text-white shadow-[0_14px_30px_rgba(0,0,0,0.25)] ring-1 ring-white/10 transition hover:bg-violet-500/80"
                                        aria-label={props.translator["Close"] ?? "Close"}
                                    >
                                        <XMarkIcon className="h-6 w-6" />
                                    </button>

                                    <div className="grid min-h-[34rem] grid-cols-1 md:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
                                        {/* Left info panel */}
                                        <div className="flex items-center justify-center bg-[linear-gradient(180deg,rgba(124,58,237,0.92),rgba(168,85,247,0.62))] px-8 py-10 md:px-10">
                                            <div className="max-w-[18rem] space-y-7 text-center">
                                                <Dialog.Title
                                                    as="h3"
                                                    className="text-4xl font-black tracking-tight text-white sm:text-5xl"
                                                >
                                                    {String(createTemplateTitle).toUpperCase()}
                                                </Dialog.Title>
                                                <p className="text-sm leading-7 text-white/90">
                                                    {createTemplateDescription}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Right form panel */}
                                        <div className="flex flex-col bg-[linear-gradient(180deg,rgba(25,10,37,0.96),rgba(18,9,30,0.98))] px-8 py-10 md:px-12">
                                            <form id="new_template" className="grid flex-1 gap-6">
                                                <div>
                                                    <label htmlFor="template_name" className="mb-2 block text-sm font-medium text-white/80">
                                                        {isSocialTemplateAccount ? "Template name" : props.translator["Name"] ?? "Name"}
                                                        {" "}<span className="text-fuchsia-400">*</span>
                                                    </label>
                                                    <Input
                                                        name="template_name"
                                                        required={true}
                                                        id="template_name"
                                                        value={data.template_name}
                                                        placeholder={
                                                            isSocialTemplateAccount
                                                                ? "e.g. Welcome message, Promo April"
                                                                : props.translator["Template name"] ?? "Template name"
                                                        }
                                                        handleChange={handleCreateTemplateChange}
                                                        className="rounded-xl border-0 bg-white/[0.06] px-4 py-3 text-white placeholder:text-white/25 focus:border-fuchsia-500/60 focus:ring-fuchsia-500/20"
                                                    />
                                                    <InputError message={errors.template_name} />
                                                </div>

                                                {isEmailAccount ? (
                                                    <div>
                                                        <label htmlFor="subject" className="mb-2 block text-sm font-medium text-white/80">
                                                            Subject
                                                        </label>
                                                        <Input
                                                            name="subject"
                                                            id="subject"
                                                            value={data.subject}
                                                            placeholder="Optional. Defaults to the template name"
                                                            handleChange={handleCreateTemplateChange}
                                                            className="rounded-xl border-0 bg-white/[0.06] px-4 py-3 text-white placeholder:text-white/25 focus:border-fuchsia-500/60 focus:ring-fuchsia-500/20"
                                                        />
                                                        <InputError message={errors.subject} />
                                                    </div>
                                                ) : isSocialTemplateAccount ? (
                                                    <div>
                                                        <label htmlFor="template_type" className="mb-2 block text-sm font-medium text-white/80">
                                                            Message format{" "}<span className="text-fuchsia-400">*</span>
                                                        </label>
                                                        <select
                                                            id="template_type"
                                                            name="template_type"
                                                            value={data.template_type}
                                                            data-pristine-required
                                                            onChange={handleCreateTemplateChange}
                                                            className="block w-full rounded-xl border-0 bg-white/[0.06] px-4 py-3 text-sm text-white focus:border-fuchsia-500/60 focus:outline-none focus:ring-fuchsia-500/20"
                                                        >
                                                            {templateTypeOptions.map((option) => (
                                                                <option key={option.value} value={option.value} className="bg-[#1a0828]">
                                                                    {option.label}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <p className="mt-2 text-xs text-white/45">
                                                            Defines how the message will be structured when sent.
                                                        </p>
                                                        <InputError message={errors.template_type} />
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div>
                                                            <label htmlFor="category" className="mb-2 block text-sm font-medium text-white/80">
                                                                {props.translator["Category"] ?? "Category"}{" "}
                                                                <span className="text-fuchsia-400">*</span>
                                                            </label>
                                                            <select
                                                                id="category"
                                                                name="category"
                                                                value={data.category}
                                                                data-pristine-required
                                                                onChange={handleCreateTemplateChange}
                                                                className="block w-full rounded-xl border-0 bg-white/[0.06] px-4 py-3 text-sm text-white focus:border-fuchsia-500/60 focus:outline-none focus:ring-fuchsia-500/20"
                                                            >
                                                                <option value="" className="bg-[#1a0828]">Select</option>
                                                                {templateCategories.map((category) => (
                                                                    <option key={category} value={category} className="bg-[#1a0828]">
                                                                        {category}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                            <InputError message={errors.category} />
                                                        </div>

                                                        <div>
                                                            <label htmlFor="languages" className="mb-2 block text-sm font-medium text-white/80">
                                                                {props.translator["Languages"] ?? "Languages"}{" "}
                                                                <span className="text-fuchsia-400">*</span>
                                                            </label>
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
                                                            <InputError message={errors.languages} />
                                                        </div>
                                                    </>
                                                )}
                                            </form>

                                            <div className="mt-10 flex items-center justify-between gap-4">
                                                <button
                                                    type="button"
                                                    onClick={closeCreateTemplateModal}
                                                    className="inline-flex min-w-[9.5rem] items-center justify-center rounded-full bg-white/10 px-6 py-2.5 text-sm font-semibold text-white/90 ring-1 ring-white/10 transition hover:bg-white/15"
                                                >
                                                    {isSocialTemplateAccount ? "Cancel" : props.translator["Close"] ?? "Close"}
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={processing}
                                                    onClick={createTemplate}
                                                    className="inline-flex min-w-[9.5rem] items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-7 py-2.5 text-sm font-semibold text-white shadow-[0_8px_28px_rgba(124,58,237,0.35)] transition hover:opacity-90 disabled:opacity-50"
                                                >
                                                    {isSocialTemplateAccount ? "Continue" : props.translator["Create"] ?? "Create"}
                                                </button>
                                            </div>
                                        </div>
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
