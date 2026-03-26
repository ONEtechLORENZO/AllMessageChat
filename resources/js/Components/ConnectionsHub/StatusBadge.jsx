import React from "react";
import {
    CheckCircleIcon,
    ExclamationTriangleIcon,
    MinusCircleIcon,
    WrenchScrewdriverIcon,
} from "@heroicons/react/24/solid";

const STATUS_META = {
    connected: {
        label: "Connected",
        className: "bg-emerald-500/12 text-emerald-100",
        icon: CheckCircleIcon,
    },
    needs_setup: {
        label: "Needs setup",
        className: "bg-amber-500/12 text-amber-100",
        icon: WrenchScrewdriverIcon,
    },
    reconnect_required: {
        label: "Not connected",
        className: "bg-slate-500/12 text-slate-100",
        icon: ExclamationTriangleIcon,
    },
    not_connected: {
        label: "Not connected",
        className: "bg-slate-500/12 text-slate-100",
        icon: MinusCircleIcon,
    },
};

export function getConnectionStatusMeta(status) {
    return STATUS_META[status] || STATUS_META.not_connected;
}

export default function StatusBadge({ status }) {
    const meta = getConnectionStatusMeta(status);
    const Icon = meta.icon;

    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${meta.className}`}
        >
            <Icon className="h-3 w-3" />
            {meta.label}
        </span>
    );
}
