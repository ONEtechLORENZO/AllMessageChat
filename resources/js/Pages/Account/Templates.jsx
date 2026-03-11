import React, { Fragment, useEffect, useMemo, useState } from "react";
import Authenticated from "@/Layouts/Authenticated";
import { Head, Link, router as Inertia, useForm } from "@inertiajs/react";
import { Dialog, Transition } from "@headlessui/react";
import Select from "react-select";
import {
    ArrowPathIcon,
    ChevronRightIcon,
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

function Templates(props) {
    const [templates, setTemplates] = useState(props.templates ?? []);
    const [selectedAccountId, setSelectedAccountId] = useState(
        props.account?.id ? String(props.account.id) : "",
    );
    const [isLoading, setIsLoading] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
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
    const templateCategories = [
        "AUTHENTICATION",
        "MARKETING",
        "UTILITY",
    ];

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

                        <div className="flex flex-wrap items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={openCreateTemplateModal}
                                disabled={!hasAccount}
                                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition hover:border-white/25 hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <PlusIcon className="h-4 w-4" />
                                {props.translator["Add template"] ?? "Add template"}
                            </button>

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
                                <Dialog.Panel className="inline-block w-full max-w-lg transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:p-6">
                                    <div>
                                        <Dialog.Title
                                            as="h3"
                                            className="text-xl leading-6 font-medium text-gray-900"
                                        >
                                            {props.translator["Add template"] ?? "Add template"}
                                        </Dialog.Title>
                                        <div className="mt-2">
                                            <p className="pb-4 pt-2 text-sm text-gray-500">
                                                {props.translator[
                                                    "Create a new WhatsApp template. Each template must have a unique name consisting of lowercase alphanumeric characters.Spaces must be replaced with underscores (_). Only WhatsApp templates within the pre-defined categories can be accepted."
                                                ]}
                                            </p>

                                            <form id="new_template">
                                                <div className="grid gap-6">
                                                    <div className="form-group col-span-6 sm:col-span-4">
                                                        <label
                                                            htmlFor="template_name"
                                                            className="block text-sm font-medium text-gray-700"
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
                                                            />
                                                        </div>
                                                        <InputError message={errors.template_name} />
                                                    </div>

                                                    <div className="form-group col-span-6 sm:col-span-4">
                                                        <label
                                                            htmlFor="category"
                                                            className="block text-sm font-medium text-gray-700"
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
                                                                className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
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
                                                            className="block text-sm font-medium text-gray-700"
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
                                            className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60 sm:col-start-2 sm:text-sm"
                                            onClick={createTemplate}
                                        >
                                            {props.translator["Create"] ?? "Create"}
                                        </button>
                                        <button
                                            type="button"
                                            className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm"
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

export default Templates;
