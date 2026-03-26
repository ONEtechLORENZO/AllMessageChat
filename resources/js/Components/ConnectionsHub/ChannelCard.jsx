import React from "react";
import { Link } from "@inertiajs/react";
import { TrashIcon } from "@heroicons/react/24/outline";
import StatusBadge from "./StatusBadge";

function renderAction(action) {
    if (!action) {
        return null;
    }

    const commonClassName =
        action.className ||
        "inline-flex h-9 items-center justify-center rounded-full border border-white/10 bg-white/5 px-3.5 text-sm font-semibold text-white transition hover:bg-white/10";

    if (action.kind === "button") {
        return (
            <button
                key={action.label}
                type="button"
                onClick={action.onClick}
                className={commonClassName}
            >
                {action.label}
            </button>
        );
    }

    if (action.external) {
        return (
            <a
                key={action.label}
                href={action.href}
                className={commonClassName}
            >
                {action.label}
            </a>
        );
    }

    return (
        <Link key={action.label} href={action.href} className={commonClassName}>
            {action.label}
        </Link>
    );
}

export default function ChannelCard({
    title,
    detail,
    status,
    icon: Icon,
    iconClassName,
    primaryAction,
    disconnectAction,
}) {
    const showStatusBadge = status !== "not_connected";

    return (
        <article className="rounded-xl bg-[#12041f]/68 px-3.5 py-2.5 shadow-[0_8px_20px_rgba(0,0,0,0.14)] ring-1 ring-white/[0.03]">
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 flex-1 items-center gap-2.5">
                    <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconClassName}`}
                    >
                        <Icon className="h-4.5 w-4.5" />
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                            <h3 className="text-[15px] font-semibold text-white">
                                {title}
                            </h3>
                            {showStatusBadge ? (
                                <StatusBadge status={status} />
                            ) : null}
                        </div>
                        <p className="mt-0.5 truncate text-sm text-white/68">
                            {detail}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-auto sm:pl-3">
                    {renderAction(primaryAction)}

                    {disconnectAction?.kind === "button" && (
                        <button
                            type="button"
                            onClick={disconnectAction.onClick}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/8 bg-white/[0.04] text-white/70 transition hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-200"
                            aria-label={disconnectAction.label}
                            title={disconnectAction.label}
                        >
                            <TrashIcon className="h-4.5 w-4.5" />
                        </button>
                    )}
                </div>
            </div>
        </article>
    );
}
