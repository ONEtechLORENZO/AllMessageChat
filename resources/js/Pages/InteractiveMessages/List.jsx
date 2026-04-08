import React, { Fragment, useMemo, useState } from "react";
import Authenticated from "../../Layouts/Authenticated";
import { Head, Link, router as Inertia, useForm } from "@inertiajs/react";
import { Dialog, Transition } from "@headlessui/react";
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    MagnifyingGlassIcon,
    PlusIcon,
    TrashIcon,
    XMarkIcon,
} from "@heroicons/react/24/solid";
import axios from "axios";
import showThemedConfirm from "@/lib/showThemedConfirm";

const ITEMS_PER_PAGE = 15;

const OPTION_TYPES = [
    { value: "quick_reply", label: "Quick Reply" },
    { value: "list_option", label: "Menu List" },
    { value: "button_option", label: "Button" },
];

function getLocalDateKey(value) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function getStatusLabel(is_active) {
    return is_active ? "ACTIVE" : "INACTIVE";
}

function getStatusClasses(is_active) {
    return is_active
        ? "bg-emerald-400/10 text-emerald-200"
        : "bg-rose-400/10 text-rose-200";
}

function getAccentColor(is_active) {
    return is_active ? "bg-emerald-400" : "bg-rose-400";
}

function GlassCard({ className = "", children }) {
    return (
        <div
            className={[
                "relative overflow-hidden rounded-[32px] border border-white/10 bg-[rgba(20,5,32,0.82)] backdrop-blur-xl",
                className,
            ]
                .filter(Boolean)
                .join(" ")}
        >
            <div className="relative z-10 flex h-full flex-col p-6">
                {children}
            </div>
        </div>
    );
}

function List(props) {
    const records = props.records ?? [];

    const [nameSearch, setNameSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [dateFilter, setDateFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data, setData, post, processing, reset, errors } = useForm({
        name: "",
        option_type: "quick_reply",
        is_active: "1",
    });

    const filtered = useMemo(() => {
        setCurrentPage(1);
        const q = nameSearch.trim().toLowerCase();
        return records.filter((r) => {
            const matchName = !q || (r.name ?? "").toLowerCase().includes(q);
            const matchStatus =
                !statusFilter ||
                getStatusLabel(r.is_active) === statusFilter;
            const matchDate =
                !dateFilter ||
                getLocalDateKey(r.created_at) === dateFilter;
            return matchName && matchStatus && matchDate;
        });
    }, [records, nameSearch, statusFilter, dateFilter]);

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const paginated = filtered.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE,
    );

    function openModal() {
        reset();
        setIsModalOpen(true);
    }

    function closeModal() {
        setIsModalOpen(false);
    }

    function handleSubmit(e) {
        e.preventDefault();
        post(route("storeInteractiveMessage"), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
        });
    }

    async function deleteRecord(id) {
        const confirmed = await showThemedConfirm({
            eyebrow: "Delete",
            title: props.translator?.["Confirm to Delete"] ?? "Confirm to Delete",
            message: "Are you sure you want to delete this message?",
            confirmLabel: props.translator?.["Confirm"] ?? "Confirm",
            cancelLabel: props.translator?.["No"] ?? "No",
        });
        if (!confirmed) return;
        axios
            .delete(route("deleteInteractiveMessage", id))
            .then(() => Inertia.reload({ preserveScroll: true }));
    }

    return (
        <Authenticated
            auth={props.auth}
            errors={props.errors}
            current_page={props.current_page}
            navigationMenu={props.menuBar}
            hidePageTitle
        >
            <Head title={props.plural ?? "Interactive Messages"} />

            <div className="dashboard-page relative pt-4 pb-8">
                <div className="relative z-10 space-y-8 px-4 sm:px-6 lg:px-8">

                    {/* Page title + Add button */}
                    <div className="flex flex-wrap items-start justify-between gap-6">
                        <div className="space-y-1">
                            <h2 className="flex flex-wrap items-baseline gap-x-3 leading-none">
                                <span className="one-tech-special text-4xl font-black tracking-tight sm:text-5xl">
                                    {props.plural ?? "Interactive Messages"}
                                </span>
                            </h2>
                            <p className="text-sm text-white/50">
                                Manage your interactive message templates
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={openModal}
                            style={{ backgroundColor: "#BF00FF", borderRadius: "16px" }}
                            className="inline-flex min-h-[52px] min-w-[230px] items-center justify-center gap-2 px-5 py-3 text-base font-semibold leading-none whitespace-nowrap text-white transition hover:opacity-90"
                        >
                            <PlusIcon className="h-4 w-4 shrink-0" />
                            Add Interactive Message
                        </button>
                    </div>

                    <GlassCard className="overflow-hidden shadow-[0_24px_90px_rgba(0,0,0,0.35)]">

                        {/* Filters */}
                        <div className="grid gap-4 border-b border-white/10 pb-5 lg:grid-cols-[minmax(0,1.25fr)_180px_140px_1fr] lg:items-end lg:gap-6">
                            <label className="block">
                                <span className="mb-2 block text-sm font-medium text-white/70">Name</span>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={nameSearch}
                                        onChange={(e) => setNameSearch(e.target.value)}
                                        placeholder="Search by name"
                                        className="w-full rounded-xl border-0 bg-[#171717] py-2.5 pl-4 pr-10 text-sm text-white placeholder:text-white/35 focus:outline-none focus:ring-0"
                                    />
                                    <MagnifyingGlassIcon className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                                </div>
                            </label>

                            <label className="block">
                                <span className="mb-2 block text-sm font-medium text-white/70">Created On</span>
                                <input
                                    type="date"
                                    value={dateFilter}
                                    onChange={(e) => setDateFilter(e.target.value)}
                                    className="w-full rounded-xl border-0 bg-[#171717] px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-0"
                                />
                            </label>

                            <label className="block">
                                <span className="mb-2 block text-sm font-medium text-white/70">Status</span>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full rounded-xl border-0 bg-[#171717] px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-0"
                                >
                                    <option value="">All</option>
                                    <option value="ACTIVE">Active</option>
                                    <option value="INACTIVE">Inactive</option>
                                </select>
                            </label>

                            <div className="hidden lg:block" />
                        </div>

                        {/* Column headers */}
                        <div className="mt-4 hidden border-b border-white/10 px-5 pb-3 lg:grid lg:grid-cols-[minmax(0,1.25fr)_160px_180px_140px_160px] lg:items-center lg:gap-6">
                            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">Name</div>
                            <div className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-white/45">Type</div>
                            <div className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-white/45">Created On</div>
                            <div className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-white/45">Status</div>
                            <div />
                        </div>

                        {/* Rows */}
                        <div className="mt-2 space-y-2">
                            {paginated.length === 0 ? (
                                <div className="py-12 text-center text-sm text-white/40">
                                    No interactive messages found.
                                </div>
                            ) : (
                                paginated.map((record) => (
                                    <div
                                        key={record.id}
                                        className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#16082a]/90 to-[#0d0516]/95 shadow-[0_2px_16px_rgba(0,0,0,0.3)] transition-all duration-300 hover:shadow-[0_6px_28px_rgba(124,58,237,0.14)]"
                                    >
                                        <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${getAccentColor(record.is_active)} opacity-75 rounded-l-2xl`} />
                                        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/25 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                                        <div className="pl-6 pr-5 py-4 flex flex-col gap-3 lg:grid lg:grid-cols-[minmax(0,1.25fr)_160px_180px_140px_160px] lg:items-center lg:gap-5">

                                            {/* Name */}
                                            <div className="min-w-0">
                                                <Link
                                                    href={route("detailInteractiveMessage", record.id)}
                                                    className="block truncate text-base font-bold text-white/90 transition-colors duration-200 group-hover:text-violet-200"
                                                >
                                                    {record.name ?? "—"}
                                                </Link>
                                            </div>

                                            {/* Type */}
                                            <div className="text-center">
                                                {record.option_type ? (
                                                    <span className="inline-flex items-center rounded-full bg-white/[0.05] px-3 py-1 text-xs font-medium text-white/55">
                                                        {OPTION_TYPES.find((t) => t.value === record.option_type)?.label ??
                                                            String(record.option_type).replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                                                    </span>
                                                ) : (
                                                    <span className="text-sm text-white/25">—</span>
                                                )}
                                            </div>

                                            {/* Created On */}
                                            <div className="text-center text-xs text-white/40">
                                                {record.created_at
                                                    ? new Date(record.created_at).toLocaleDateString("en-US", {
                                                          year: "numeric",
                                                          month: "short",
                                                          day: "numeric",
                                                      })
                                                    : "—"}
                                            </div>

                                            {/* Status */}
                                            <div className="flex items-center justify-center">
                                                <span className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${getStatusClasses(record.is_active)}`}>
                                                    {getStatusLabel(record.is_active)}
                                                </span>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center justify-start gap-2 self-center lg:justify-end">
                                                <button
                                                    type="button"
                                                    onClick={() => deleteRecord(record.id)}
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-rose-400/50 transition hover:bg-rose-500/10 hover:text-rose-300"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                                <Link
                                                    href={route("detailInteractiveMessage", record.id)}
                                                    className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-1.5 text-xs font-semibold text-white shadow-[0_2px_12px_rgba(124,58,237,0.35)] transition hover:brightness-110"
                                                >
                                                    Open
                                                    <ChevronRightIcon className="h-3 w-3" />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-6 flex items-center justify-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#170024]/80 text-white/60 transition hover:bg-[#2a0040] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                                >
                                    <ChevronLeftIcon className="h-4 w-4" />
                                </button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#170024]/80 text-white/60 transition hover:bg-[#2a0040] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                                >
                                    <ChevronRightIcon className="h-4 w-4" />
                                </button>
                            </div>
                        )}
                    </GlassCard>
                </div>
            </div>

            {/* Create Modal */}
            <Transition appear show={isModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={closeModal}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-200"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-150"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-200"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-150"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md rounded-3xl bg-[#12041f] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.6)]">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <Dialog.Title className="text-xl font-black text-white">
                                                New Interactive Message
                                            </Dialog.Title>
                                            <p className="mt-1 text-sm text-white/50">
                                                Create a new interactive message template.
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={closeModal}
                                            className="mt-0.5 rounded-lg p-1.5 text-white/40 transition hover:bg-white/5 hover:text-white"
                                        >
                                            <XMarkIcon className="h-5 w-5" />
                                        </button>
                                    </div>

                                    <form id="new_interactive_msg" onSubmit={handleSubmit} className="mt-6 space-y-4">
                                        {/* Name */}
                                        <div>
                                            <label className="mb-1.5 block text-sm font-semibold text-white/80">
                                                Name <span className="text-rose-400">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={data.name}
                                                onChange={(e) => setData("name", e.target.value)}
                                                placeholder="Enter template name"
                                                required
                                                className="w-full rounded-xl bg-[#1a0a2e] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:bg-[#220d3a] transition"
                                            />
                                            {errors.name && (
                                                <p className="mt-1 text-xs text-rose-400">{errors.name}</p>
                                            )}
                                        </div>

                                        {/* Option Type */}
                                        <div>
                                            <label className="mb-1.5 block text-sm font-semibold text-white/80">
                                                Template Type <span className="text-rose-400">*</span>
                                            </label>
                                            <select
                                                name="option_type"
                                                value={data.option_type}
                                                onChange={(e) => setData("option_type", e.target.value)}
                                                required
                                                className="w-full appearance-none rounded-xl bg-[#1a0a2e] px-4 py-3 text-sm text-white focus:outline-none cursor-pointer transition hover:bg-[#220d3a]"
                                            >
                                                {OPTION_TYPES.map((t) => (
                                                    <option key={t.value} value={t.value} className="bg-[#1a0a2e]">
                                                        {t.label}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.option_type && (
                                                <p className="mt-1 text-xs text-rose-400">{errors.option_type}</p>
                                            )}
                                        </div>

                                        {/* Status */}
                                        <div>
                                            <label className="mb-1.5 block text-sm font-semibold text-white/80">
                                                Status <span className="text-rose-400">*</span>
                                            </label>
                                            <select
                                                name="is_active"
                                                value={data.is_active}
                                                onChange={(e) => setData("is_active", e.target.value)}
                                                required
                                                className="w-full appearance-none rounded-xl bg-[#1a0a2e] px-4 py-3 text-sm text-white focus:outline-none cursor-pointer transition hover:bg-[#220d3a]"
                                            >
                                                <option value="1" className="bg-[#1a0a2e]">Active</option>
                                                <option value="0" className="bg-[#1a0a2e]">Inactive</option>
                                            </select>
                                            {errors.is_active && (
                                                <p className="mt-1 text-xs text-rose-400">{errors.is_active}</p>
                                            )}
                                        </div>

                                        {/* Submit */}
                                        <div className="flex items-center justify-end gap-3 pt-2">
                                            <button
                                                type="button"
                                                onClick={closeModal}
                                                className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                style={{ backgroundColor: "#BF00FF", borderRadius: "12px" }}
                                                className="px-6 py-2.5 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50"
                                            >
                                                {processing ? "Creating…" : "Create"}
                                            </button>
                                        </div>
                                    </form>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </Authenticated>
    );
}

export default List;
