import React, { useMemo } from "react";
import Authenticated from "../../Layouts/Authenticated";
import ListView from "@/Components/Views/List/Index2";

function List(props) {
    const isDemo = !props.records || props.records.length === 0;

    const demoHeaders = {
        name: { label: "Name", type: "text" },
        status: { label: "Status", type: "text" },
        service: { label: "Service", type: "text" },
        scheduled_at: { label: "Scheduled", type: "text" },
    };

    const demoRecords = [
        {
            id: 1,
            name: "Spring Launch",
            status: "Scheduled",
            service: "WhatsApp",
            scheduled_at: "2026-02-20 10:00",
        },
        {
            id: 2,
            name: "Win-back Flow",
            status: "Running",
            service: "Instagram",
            scheduled_at: "2026-02-12 09:00",
        },
        {
            id: 3,
            name: "Cart Abandon",
            status: "Paused",
            service: "Facebook",
            scheduled_at: "2026-02-05 18:30",
        },
        {
            id: 4,
            name: "VIP Offer",
            status: "Scheduled",
            service: "WhatsApp",
            scheduled_at: "2026-02-25 14:15",
        },
        {
            id: 5,
            name: "New Products",
            status: "Completed",
            service: "Telegram",
            scheduled_at: "2026-01-28 11:45",
        },
        {
            id: 6,
            name: "Weekly Digest",
            status: "Running",
            service: "WhatsApp",
            scheduled_at: "2026-02-12 07:30",
        },
    ];

    const demoActions = {
        create: false,
        detail: false,
        edit: false,
        delete: false,
        export: false,
        import: false,
        search: false,
        filter: false,
        select_field: false,
        mass_edit: false,
        merge: false,
    };

    const demoTranslator = {
        Campaign: "Campaign",
        Campaigns: "Campaigns",
        "No records found!": "No records found!",
        "Are you sure you want to delete the record?":
            "Are you sure you want to delete the record?",
    };

    const headersToShow = isDemo ? demoHeaders : props.list_view_columns;
    const recordsToShow = isDemo ? demoRecords : props.records;
    const actionsToShow = isDemo ? demoActions : props.actions;
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

    return (
        <Authenticated
            auth={props.auth}
            errors={props.errors}
            current_page={props.current_page}
            navigationMenu={props.menuBar}
        >
            <div className="font-semibold text-2xl text-white !px-4 !mb-6 ml-3">
                {props.plural}
            </div>

            <div className="px-4 sm:px-6 lg:px-8 mb-4">
                <div className="rounded-2xl bg-[#140816]/70 backdrop-blur-3xl border border-white/10 ring-1 ring-white/5 p-4">
                    <div className="text-white/90 text-sm mb-3">
                        Campaign status breakdown
                        {isDemo ? " (demo data)" : ""}
                    </div>
                    <div className="flex gap-4 flex-wrap">
                        {Object.entries(summary.counts).map(
                            ([status, count]) => {
                                const pct =
                                    summary.total > 0
                                        ? Math.round(
                                              (count / summary.total) * 100,
                                          )
                                        : 0;
                                return (
                                    <div
                                        key={status}
                                        className="min-w-[180px] flex-1"
                                    >
                                        <div className="flex justify-between text-xs text-white/70 mb-1">
                                            <span>{status}</span>
                                            <span>
                                                {count} / {summary.total} (
                                                {pct}%)
                                            </span>
                                        </div>
                                        <div className="h-2 rounded bg-white/10 overflow-hidden">
                                            <div
                                                className="h-2 rounded bg-cyan-400/70"
                                                style={{
                                                    width: `${pct}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            },
                        )}
                    </div>
                </div>
            </div>

            <ListView
                headers={headersToShow}
                {...props}
                records={recordsToShow}
                actions={actionsToShow}
                translator={translatorToShow}
                module={props.module ?? "Campaign"}
                paginator={props.paginator ?? { currentPage: 1 }}
            />
        </Authenticated>
    );
}

export default List;
