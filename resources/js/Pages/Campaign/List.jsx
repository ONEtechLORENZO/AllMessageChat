import Authenticated from "../../Layouts/Authenticated";
import { Link, router as Inertia } from "@inertiajs/react";
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon } from "@heroicons/react/24/solid";
import { useMemo, useState } from "react";
import Pagination from "@/Components/Pagination";

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
            status: "Paused",
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

    const summary = useMemo(() => {
        const counts = {};
        (recordsToShow || []).forEach((r) => {
            const key = r.status || "Unknown";
            counts[key] = (counts[key] || 0) + 1;
        });
        const total = Object.values(counts).reduce((a, b) => a + b, 0);
        return { counts, total };
    }, [recordsToShow]);

    const statusOrder = [
        "Running",
        "Scheduled",
        "Draft",
        "Paused",
        "Completed",
    ];

    const statusStyles = {
        running: "bg-emerald-400/90",
        scheduled: "bg-sky-400/90",
        draft: "bg-amber-400/90",
        paused: "bg-orange-400/90",
        completed: "bg-purple-400/90",
        unknown: "bg-white/30",
    };

    const badgeStyles = {
        running: "text-emerald-200 bg-emerald-500/15 border-emerald-500/30",
        scheduled: "text-sky-200 bg-sky-500/15 border-sky-500/30",
        draft: "text-amber-200 bg-amber-500/15 border-amber-500/30",
        paused: "text-orange-200 bg-orange-500/15 border-orange-500/30",
        completed: "text-purple-200 bg-purple-500/15 border-purple-500/30",
        unknown: "text-white/70 bg-white/10 border-white/10",
    };

    const [filters, setFilters] = useState({
        status: "All",
        range: "All",
        audience: "All sizes",
        search: "",
    });

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
            <div className="px-4 sm:px-6 lg:px-8">
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
                    <div className="rounded-2xl bg-[#140816]/70 backdrop-blur-3xl border border-white/10 ring-1 ring-white/5 p-6">
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
                                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#0F0B1A] px-3 py-2 text-sm text-white focus:border-[#BF00FF]/60 focus:outline-none focus:ring-[#BF00FF]/60"
                                >
                                    <option>All</option>
                                    {statusOrder.map((status) => (
                                        <option key={status}>{status}</option>
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
                                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#0F0B1A] px-3 py-2 text-sm text-white focus:border-[#BF00FF]/60 focus:outline-none focus:ring-[#BF00FF]/60"
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
                                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#0F0B1A] px-3 py-2 text-sm text-white focus:border-[#BF00FF]/60 focus:outline-none focus:ring-[#BF00FF]/60"
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
                                className="w-full rounded-2xl border border-white/10 bg-[#0F0B1A] py-3 pl-12 pr-4 text-sm text-white placeholder-white/50 focus:border-[#BF00FF]/60 focus:outline-none focus:ring-[#BF00FF]/60"
                            />
                        </div>
                    </div>

                    <div className="rounded-2xl bg-[#140816]/70 backdrop-blur-3xl border border-white/10 ring-1 ring-white/5 p-6">
                        <div className="text-white font-semibold mb-4">
                            Campaign status breakdown
                            {isDemo ? " (demo data)" : ""}
                        </div>
                        <div className="space-y-5">
                            {statusOrder.map((status) => {
                                const count = summary.counts[status] || 0;
                                const pct =
                                    summary.total > 0
                                        ? Math.round(
                                              (count / summary.total) * 100,
                                          )
                                        : 0;
                                const key = status.toLowerCase();
                                return (
                                    <div key={status}>
                                        <div className="flex justify-between text-xs text-white/70 mb-2">
                                            <span>{status}</span>
                                            <span>
                                                {count} / {summary.total} (
                                                {pct}%)
                                            </span>
                                        </div>
                                        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                                            <div
                                                className={classNames(
                                                    "h-2 rounded-full",
                                                    statusStyles[key] ??
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

                <div className="mt-8 rounded-2xl bg-[#140816]/70 backdrop-blur-3xl border border-white/10 ring-1 ring-white/5 p-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="text-sm text-white/70 font-semibold">
                            Campaigns
                        </div>
                        <button
                            type="button"
                            className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white/80 hover:bg-white/10"
                        >
                            <AdjustmentsHorizontalIcon className="h-4 w-4" />
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm text-white/80">
                            <thead className="text-xs uppercase text-white/40">
                                <tr>
                                    {[
                                        "Campaign",
                                        "Channel",
                                        "Audience",
                                        "Status",
                                        "Scheduled",
                                        "Sent",
                                        "Delivered",
                                        "Created",
                                    ].map((label) => (
                                        <th
                                            key={label}
                                            className="pb-3 border-b border-white/10 font-semibold"
                                        >
                                            {label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {displayRecords.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="py-6 text-center text-white/50"
                                        >
                                            {translatorToShow[
                                                "No records found!"
                                            ] ?? "No records found!"}
                                        </td>
                                    </tr>
                                ) : (
                                    displayRecords.map((record) => {
                                        const statusKey = String(
                                            record.status || "unknown",
                                        ).toLowerCase();
                                        return (
                                            <tr key={record.id}>
                                                <td className="py-4 font-medium text-white">
                                                    <Link
                                                        href={route(
                                                            "detailCampaign",
                                                            { id: record.id },
                                                        )}
                                                        className="hover:text-[#BF00FF]"
                                                    >
                                                        {record.name ?? "-"}
                                                    </Link>
                                                </td>
                                                <td className="py-4 text-white/70">
                                                    {record.service ?? "-"}
                                                </td>
                                                <td className="py-4 text-white/70">
                                                    {formatAudience(
                                                        record.audience ??
                                                            record.audience_size ??
                                                            record.total_contacts,
                                                        record.conditions
                                                            ? "Filtered"
                                                            : "All contacts",
                                                    )}
                                                </td>
                                                <td className="py-4">
                                                    <span
                                                        className={classNames(
                                                            "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold",
                                                            badgeStyles[
                                                                statusKey
                                                            ] ??
                                                                badgeStyles.unknown,
                                                        )}
                                                    >
                                                        {record.status ??
                                                            "Unknown"}
                                                    </span>
                                                </td>
                                                <td className="py-4 text-white/70">
                                                    {record.scheduled_at ??
                                                        "-"}
                                                </td>
                                                <td className="py-4 text-white/70">
                                                    {record.sent ??
                                                        record.sent_count ??
                                                        "-"}
                                                </td>
                                                <td className="py-4 text-white/70">
                                                    {record.delivered ??
                                                        record.delivered_count ??
                                                        "-"}
                                                </td>
                                                <td className="py-4 text-white/70">
                                                    {record.created_at ??
                                                        "-"}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
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
        </Authenticated>
    );
}

export default List;
