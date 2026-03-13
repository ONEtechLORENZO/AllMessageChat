import Authenticated from "../../Layouts/Authenticated";
import { Link, router as Inertia } from "@inertiajs/react";
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon } from "@heroicons/react/24/solid";
import { useMemo, useState } from "react";
import Pagination from "@/Components/Pagination";
import ListViewTable from "@/Components/Views/List/ListViewTable";

function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
}

function List(props) {
    const isDemo = !props.records || props.records.length === 0;

    const demoRecords = [
        {
            id: 1,
            name: "Spring Re-Engagement",
            status: "Running",
            service: "WhatsApp",
            audience: 1240,
            scheduled_at: "2026-02-10 09:00",
            sent: 820,
            delivered: 794,
            created_at: "2026-02-01",
        },
        {
            id: 2,
            name: "VIP Upsell",
            status: "Scheduled",
            service: "WhatsApp",
            audience: 320,
            scheduled_at: "2026-02-18 14:30",
            sent: 0,
            delivered: 0,
            created_at: "2026-02-05",
        },
        {
            id: 3,
            name: "Winback Q1",
            status: "Completed",
            service: "WhatsApp",
            audience: 2040,
            scheduled_at: "2026-01-28 08:00",
            sent: 1120,
            delivered: 1097,
            created_at: "2026-01-15",
        },
        {
            id: 4,
            name: "New Product Launch",
            status: "Completed",
            service: "WhatsApp",
            audience: 860,
            scheduled_at: "2026-01-10 10:15",
            sent: 860,
            delivered: 844,
            created_at: "2025-12-28",
        },
        {
            id: 5,
            name: "Weekend Promo",
            status: "Scheduled",
            service: "Instagram",
            audience: 420,
            scheduled_at: "2026-02-22 12:00",
            sent: 0,
            delivered: 0,
            created_at: "2026-02-08",
        },
        {
            id: 6,
            name: "Renewals",
            status: "Running",
            service: "Facebook",
            audience: 540,
            scheduled_at: "2026-02-12 07:30",
            sent: 410,
            delivered: 398,
            created_at: "2026-02-02",
        },
    ];

    const demoTranslator = {
        Campaign: "Campaign",
        Campaigns: "Campaigns",
        "No records found!": "No records found!",
        "Are you sure you want to delete the record?":
            "Are you sure you want to delete the record?",
    };

    const recordsToShow = isDemo ? demoRecords : props.records || [];
    const translatorToShow = isDemo ? demoTranslator : props.translator;

    const statusOrder = [
        { label: "Running", key: "running" },
        { label: "Scheduled", key: "scheduled" },
        { label: "Completed", key: "completed" },
        { label: "DRAFT", key: "draft" },
    ];

    const summary = useMemo(() => {
        const counts = {};
        (recordsToShow || []).forEach((r) => {
            const key = String(r.status || "unknown").toLowerCase();
            counts[key] = (counts[key] || 0) + 1;
        });
        const total = Object.values(counts).reduce((a, b) => a + b, 0);
        return { counts, total };
    }, [recordsToShow]);

    const statusStyles = {
        running: "bg-[#05CD00]",
        scheduled: "bg-[#F9DA00]",
        completed: "bg-[#bf00ff]",
        draft: "bg-white/60",
        unknown: "bg-white/30",
    };

    const badgeStyles = {
        running: "text-[#05CD00] bg-[#05CD00]/15 border-[#05CD00]/40",
        scheduled: "text-[#F9DA00] bg-[#F9DA00]/15 border-[#F9DA00]/40",
        completed: "text-[#00D8E5] bg-[#00D8E5]/15 border-[#00D8E5]/40",
        draft: "text-white/80 bg-white/10 border-white/30",
        unknown: "text-white/70 bg-white/10 border-white/10",
    };

    const [filters, setFilters] = useState({
        status: "All",
        range: "All",
        audience: "All sizes",
        search: "",
    });

    const campaignHeaders = {
        name: { label: "Campaign", type: "text" },
        service: { label: "Channel", type: "text" },
        audience: { label: "Audience", type: "text" },
        status: { label: "Status", type: "text" },
        scheduled_at: { label: "Scheduled", type: "text" },
        sent: { label: "Sent", type: "text" },
        delivered: { label: "Delivered", type: "text" },
        created_at: { label: "Created", type: "text" },
    };

    const displayRecords = isDemo
        ? recordsToShow.filter((record) => {
              if (
                  filters.status !== "All" &&
                  String(record.status || "").toLowerCase() !==
                      filters.status.toLowerCase()
              )
                  return false;
              if (
                  filters.search &&
                  !String(record.name || "")
                      .toLowerCase()
                      .includes(filters.search.toLowerCase())
              )
                  return false;
              return true;
          })
        : recordsToShow;

    function formatAudience(value, fallback) {
        if (value === undefined || value === null || value === "") {
            return fallback || "-";
        }
        if (typeof value === "number") {
            return `${value.toLocaleString()} contacts`;
        }
        if (!Number.isNaN(Number(value))) {
            return `${Number(value).toLocaleString()} contacts`;
        }
        return value;
    }

    function handleSearch() {
        Inertia.get(route("listCampaign"), {
            search: filters.search || "",
        });
    }

    return (
        <Authenticated
            auth={props.auth}
            errors={props.errors}
            current_page={props.current_page}
            navigationMenu={props.menuBar}
        >
            <div className="dashboard-page px-4 sm:px-6 lg:px-8 relative">
                <div className="relative z-10">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="text-2xl font-semibold text-white">
                        {props.plural}
                    </div>
                    <Link
                        href={route("createCampaign")}
                        className="inline-flex items-center justify-center rounded-lg bg-[#BF00FF] px-5 py-2 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(191,0,255,0.25)] transition hover:bg-[#9c00d9]"
                    >
                        NEW CAMPAIGN
                    </Link>
                </div>

                <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
                    <div className="rounded-2xl bg-[#170024]/80 backdrop-blur-sm p-6">
                        <div className="grid gap-4 md:grid-cols-3">
                            <div>
                                <div className="text-xs font-semibold uppercase text-white/60">
                                    Status
                                </div>
                                <select
                                    value={filters.status}
                                    onChange={(event) =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            status: event.target.value,
                                        }))
                                    }
                                    className="mt-2 w-full rounded-xl border-0 bg-[#202020] px-3 py-2 text-sm text-white focus:outline-none focus:ring-[#BF00FF]/40"
                                >
                                    <option>All</option>
                                    {statusOrder.map((status) => (
                                        <option key={status.key}>
                                            {status.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <div className="text-xs font-semibold uppercase text-white/60">
                                    Scheduled Range
                                </div>
                                <select
                                    value={filters.range}
                                    onChange={(event) =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            range: event.target.value,
                                        }))
                                    }
                                    className="mt-2 w-full rounded-xl border-0 bg-[#202020] px-3 py-2 text-sm text-white focus:outline-none focus:ring-[#BF00FF]/40"
                                >
                                    <option>All</option>
                                    <option>Last 7 days</option>
                                    <option>Next 7 days</option>
                                    <option>This month</option>
                                </select>
                            </div>
                            <div>
                                <div className="text-xs font-semibold uppercase text-white/60">
                                    Audience Size
                                </div>
                                <select
                                    value={filters.audience}
                                    onChange={(event) =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            audience: event.target.value,
                                        }))
                                    }
                                    className="mt-2 w-full rounded-xl border-0 bg-[#202020] px-3 py-2 text-sm text-white focus:outline-none focus:ring-[#BF00FF]/40"
                                >
                                    <option>All sizes</option>
                                    <option>0-500 contacts</option>
                                    <option>500-2,000 contacts</option>
                                    <option>2,000+ contacts</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-4 relative">
                            <MagnifyingGlassIcon className="h-5 w-5 text-white/50 absolute left-4 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={filters.search}
                                onChange={(event) =>
                                    setFilters((prev) => ({
                                        ...prev,
                                        search: event.target.value,
                                    }))
                                }
                                onKeyDown={(event) => {
                                    if (event.key === "Enter") handleSearch();
                                }}
                                placeholder="Search"
                                className="w-full rounded-2xl border-0 bg-[#202020] py-3 pl-12 pr-4 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-[#BF00FF]/40"
                            />
                        </div>
                    </div>

                    <div className="rounded-2xl bg-[#170024]/80 backdrop-blur-sm p-6">
                        <div className="text-white font-semibold mb-4">
                            Campaign status breakdown
                            {isDemo ? " (demo data)" : ""}
                        </div>
                        <div className="space-y-5">
                            {statusOrder.map((status) => {
                                const count = summary.counts[status.key] || 0;
                                const pct =
                                    summary.total > 0
                                        ? Math.round(
                                              (count / summary.total) * 100,
                                          )
                                        : 0;
                                return (
                                    <div key={status.key}>
                                        <div className="flex justify-between text-xs text-white/70 mb-2">
                                            <span>{status.label}</span>
                                            <span>
                                                {count} / {summary.total} (
                                                {pct}%)
                                            </span>
                                        </div>
                                        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                                            <div
                                                className={classNames(
                                                    "h-2 rounded-full",
                                                    statusStyles[status.key] ??
                                                        statusStyles.unknown,
                                                )}
                                                style={{
                                                    width: `${pct}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="mt-8 rounded-2xl bg-[#170024]/80 backdrop-blur-sm p-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="text-sm text-white/70 font-semibold">
                            Campaigns
                        </div>
                        <button
                            type="button"
                            className="inline-flex items-center justify-center rounded-lg border-0 bg-white/5 px-3 py-2 text-white/80 hover:bg-white/10"
                        >
                            <AdjustmentsHorizontalIcon className="h-4 w-4" />
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <ListViewTable
                            records={displayRecords}
                            customHeader={campaignHeaders}
                            fetchFields={false}
                            hideToolMenu={true}
                            disableSorting={true}
                            emptyStateText={translatorToShow["No records found!"] ?? "No records found!"}
                            renderCell={({ name, record }) => {
                                if (name === "name") {
                                    return (
                                        <Link
                                            href={route("detailCampaign", {
                                                id: record.id,
                                            })}
                                            className="hover:text-[#BF00FF] text-white font-medium"
                                        >
                                            {record.name ?? "-"}
                                        </Link>
                                    );
                                }

                                if (name === "audience") {
                                    return formatAudience(
                                        record.audience ??
                                            record.audience_size ??
                                            record.total_contacts,
                                        record.conditions
                                            ? "Filtered"
                                            : "All contacts",
                                    );
                                }

                                if (name === "status") {
                                    const statusKey = String(
                                        record.status || "unknown",
                                    ).toLowerCase();

                                    return (
                                        <span
                                            className={classNames(
                                                "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold",
                                                badgeStyles[statusKey] ??
                                                    badgeStyles.unknown,
                                            )}
                                        >
                                            {record.status ?? "Unknown"}
                                        </span>
                                    );
                                }

                                if (name === "sent") {
                                    return record.sent ?? record.sent_count ?? "-";
                                }

                                if (name === "delivered") {
                                    return (
                                        record.delivered ??
                                        record.delivered_count ??
                                        "-"
                                    );
                                }
                            }}
                        />
                    </div>
                </div>

                {props.paginator && props.paginator.total ? (
                    <div className="mt-6 text-white/70">
                        <Pagination
                            module={props.module ?? "Campaign"}
                            paginator={props.paginator}
                            translator={translatorToShow}
                        />
                    </div>
                ) : null}
                </div>
            </div>
        </Authenticated>
    );
}

export default List;
