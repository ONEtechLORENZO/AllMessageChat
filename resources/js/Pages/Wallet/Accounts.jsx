import React, { useEffect, useMemo, useState } from "react";
import { confirmAlert } from "react-confirm-alert";
import nProgress from "nprogress";
import axios from "axios";
import {
    TrashIcon,
} from "@heroicons/react/24/solid";
import { BsFacebook, BsInstagram, BsWhatsapp } from "react-icons/bs";
import { GoMail } from "react-icons/go";

const SERVICE_ORDER = ["whatsapp", "facebook", "instagram", "email"];
const STATUS_PRIORITY = {
    reconnect_required: 0,
    needs_setup: 1,
    connected: 2,
    not_connected: 3,
};

function connectionModalHref(service, account) {
    const params = { service };

    if (account?.id) {
        params.account_id = account.id;
    }

    return route("account_registration", params);
}

function profileManageHref(service, status, account) {
    if (status === "connected" && account?.id) {
        return route("account_view", account.id);
    }

    if (status === "needs_setup" && account?.id) {
        return route("edit_account", account.id);
    }

    return connectionModalHref(service, account);
}

const SERVICE_DEFINITIONS = {
    whatsapp: {
        label: "WhatsApp",
        icon: BsWhatsapp,
        iconClassName:
            "bg-emerald-500/12 text-emerald-300 ring-1 ring-emerald-400/20",
        emptyIdentity: "No WhatsApp channel connected",
    },
    facebook: {
        label: "Facebook",
        icon: BsFacebook,
        iconClassName:
            "bg-sky-500/12 text-sky-300 ring-1 ring-sky-400/20",
        emptyIdentity: "No Facebook channel connected",
    },
    instagram: {
        label: "Instagram",
        icon: BsInstagram,
        iconClassName:
            "bg-fuchsia-500/12 text-fuchsia-300 ring-1 ring-fuchsia-400/20",
        emptyIdentity: "No Instagram channel connected",
    },
    email: {
        label: "Email",
        icon: GoMail,
        iconClassName:
            "bg-amber-500/12 text-amber-300 ring-1 ring-amber-400/20",
        emptyIdentity: "No email channel connected",
    },
};

function hasConnectionError(account) {
    return (
        account?.connection_status === "connection_error" ||
        account?.connection_status === "error" ||
        account?.status === "Inactive"
    );
}

function normalizeStatus(account) {
    if (!account) {
        return "not_connected";
    }

    if (account.service === "facebook") {
        switch (account.connection_status) {
            case "connected":
                return "connected";
            case "oauth_connected_pending_page":
                return "needs_setup";
            case "connection_error":
                return "not_connected";
            case "not_connected":
                return "not_connected";
            default:
                return account.fb_page_name ? "connected" : "needs_setup";
        }
    }

    if (account.service === "email") {
        if (
            account.gmail_connected ||
            account.connection_status === "connected" ||
            account.status === "Active"
        ) {
            return "connected";
        }

        if (
            account.connection_status === "connection_error" ||
            account.status === "Inactive"
        ) {
            return "not_connected";
        }

        return account.id ? "needs_setup" : "not_connected";
    }

    if (account.service === "instagram") {
        if (
            account.legacy_connection ||
            account.connection_model === "legacy_page_linked" ||
            account.requires_reconnect
        ) {
            return "needs_setup";
        }

        if (account.connection_status === "connected") {
            return "connected";
        }

        if (account.connection_status === "incomplete") {
            return "needs_setup";
        }

        if (account.connection_status === "error") {
            return "not_connected";
        }

        return account.id ? "not_connected" : "not_connected";
    }

    if (
        account.connection_status === "connected" ||
        account.status === "Active"
    ) {
        return "connected";
    }

    if (
        account.connection_status === "connection_error" ||
        account.status === "Inactive"
    ) {
        return "not_connected";
    }

    if (account.connection_status === "not_connected") {
        return "not_connected";
    }

    return account.id ? "needs_setup" : "not_connected";
}

function serviceDetail(service, status, account, profileCount) {
    if (!account) {
        return SERVICE_DEFINITIONS[service].emptyIdentity;
    }

    if (service === "facebook") {
        if (status === "connected") {
            return account.fb_page_name || "Facebook connected";
        }

        if (status === "needs_setup") {
            return "Page not selected";
        }

        if (status === "reconnect_required") {
            return "Connect Facebook again";
        }

        if (hasConnectionError(account)) {
            return "Connect Facebook again";
        }

        return "No Facebook account connected";
    }

    if (service === "instagram") {
        if (status === "connected") {
            const instagramHandle =
                account.instagram_username || account.insta_user_name;

            if (instagramHandle) {
                return instagramHandle.startsWith("@")
                    ? instagramHandle
                    : `@${instagramHandle}`;
            }

            if (profileCount > 1) {
                return `${profileCount} Instagram accounts connected`;
            }

            return (
                account.instagram_name ||
                account.company_name ||
                "Instagram connected"
            );
        }

        if (status === "needs_setup") {
            if (
                account.legacy_connection ||
                account.connection_model === "legacy_page_linked" ||
                account.requires_reconnect
            ) {
                return "Legacy Instagram connection. Reconnect to upgrade";
            }

            return account.connection_setup?.message || "Connect Instagram";
        }

        if (hasConnectionError(account)) {
            return "Connect Instagram again";
        }

        return "No Instagram account connected";
    }

    if (service === "email") {
        if (status === "connected") {
            return (
                account.email ||
                account.display_name ||
                account.company_name ||
                "Email connected"
            );
        }

        if (status === "needs_setup") {
            return "Finish email setup";
        }

        if (status === "reconnect_required") {
            return "Connect email again";
        }

        if (hasConnectionError(account)) {
            return "Connect email again";
        }

        return "No email account connected";
    }

    if (status === "connected") {
        return (
            account.company_name ||
            account.src_name ||
            account.phone_number ||
            "WhatsApp connected"
        );
    }

    if (status === "needs_setup") {
        return "Finish WhatsApp setup";
    }

    if (status === "reconnect_required") {
        return "Connect WhatsApp again";
    }

    if (hasConnectionError(account)) {
        return "Connect WhatsApp again";
    }

    return "No WhatsApp account connected";
}

function buildChannelCard(service, serviceAccounts, onDelete) {
    const sortedAccounts = [...serviceAccounts].sort(
        (left, right) =>
            STATUS_PRIORITY[normalizeStatus(left)] -
            STATUS_PRIORITY[normalizeStatus(right)],
    );
    const account = sortedAccounts[0] || null;
    const status = normalizeStatus(account);
    const definition = SERVICE_DEFINITIONS[service];
    const profileCount = serviceAccounts.length;
    let disconnectAction = null;

    if (account?.id) {
        disconnectAction = {
            label: "Disconnect",
            kind: "button",
            onClick: () => onDelete(account.id),
        };
    }

    return {
        service,
        title: definition.label,
        icon: definition.icon,
        iconClassName: definition.iconClassName,
        status,
        detail: serviceDetail(service, status, account, profileCount),
        primaryActionHref: profileManageHref(service, status, account),
        disconnectAction,
    };
}

export default function Accounts(props) {
    const [accounts, setAccountList] = useState(props.accounts || []);

    useEffect(() => {
        setAccountList(props.accounts || []);
    }, [props.accounts]);

    function deleteAccount(accountId) {
        confirmAlert({
            customUI: ({ onClose }) => (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#140816]/95 p-6 text-white shadow-2xl ring-1 ring-white/5">
                        <div className="space-y-2">
                            <div className="inline-flex rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-red-200">
                                Delete Connection
                            </div>
                            <h2 className="text-3xl font-semibold text-white">
                                {props.translator["Confirm to Delete"]}
                            </h2>
                            <p className="text-sm leading-6 text-white/60">
                                {props.translator["Are you sure to do this?"]}
                            </p>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    onClose();
                                }}
                                className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
                            >
                                {props.translator["No"] || "No"}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    nProgress.start(0.5);
                                    nProgress.inc(0.2);
                                    axios({
                                        method: "post",
                                        url: route("delete_account"),
                                        data: {
                                            id: accountId,
                                        },
                                    })
                                        .then((response) => {
                                            setAccountList((current) =>
                                                current.filter(
                                                    (account) =>
                                                        account.id !==
                                                        accountId
                                                )
                                            );
                                            nProgress.done();
                                            onClose();
                                        })
                                        .catch(() => {
                                            nProgress.done();
                                        });
                                }}
                                className="inline-flex items-center rounded-full bg-red-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-400"
                            >
                                {props.translator["Yes"]}
                            </button>
                        </div>
                    </div>
                </div>
            ),
        });
    }

    const channelCards = useMemo(() => {
        const accountsByService = accounts.reduce((carry, account) => {
            const service = account.service;

            if (!carry[service]) {
                carry[service] = [];
            }

            carry[service].push(account);
            return carry;
        }, {});

        return SERVICE_ORDER.map((service) =>
            buildChannelCard(
                service,
                accountsByService[service] || [],
                deleteAccount,
            ),
        );
    }, [accounts]);

    return (
        <div className="mx-auto max-w-7xl">
            <div className="grid gap-10 lg:grid-cols-[minmax(240px,360px)_minmax(0,1fr)] lg:items-start xl:gap-16">
                <div className="space-y-8 pt-2 lg:sticky lg:top-24">
                    <div className="space-y-5">
                        <p className="text-4xl font-black leading-[0.92] tracking-tight text-transparent bg-gradient-to-r from-fuchsia-300 via-violet-400 to-fuchsia-500 bg-clip-text sm:text-5xl xl:text-6xl">
                        </p>

                        <p className="max-w-[27rem] text-base leading-7 text-white/68">
                            <span className="block">
                               
                            </span>
                            <span className="block">
                              
                            </span>
                        </p>
                    </div>

                    <div className="hidden min-h-[24rem] items-center gap-8 pt-24 lg:flex xl:pt-52">
                        <div className="space-y-5">
                            <p className="text-3xl font-light uppercase tracking-[0.08em] text-white/90">
                                Connect Channel
                            </p>
                            <a
                                href={route("account_registration", { service: "whatsapp" })}
                                className="connect-btn"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                    <polyline points="12 5 19 12 12 19" />
                                </svg>
                                <span className="connect-btn-text">Connect</span>
                            </a>
                        </div>
                        <div className="h-72 w-px bg-gradient-to-b from-transparent via-[#7c3aed] to-transparent opacity-90" />
                    </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2 xl:gap-6">
                    {channelCards.map((card) => {
                        const Icon = card.icon;
                        const hasAccount = Boolean(card.disconnectAction);

                        return (
                            <div
                                key={card.service}
                                className="group relative flex min-h-[20rem] flex-col overflow-hidden rounded-[2rem] bg-[linear-gradient(160deg,rgba(28,12,44,0.98),rgba(16,8,28,0.99))] p-7 shadow-[0_32px_80px_rgba(0,0,0,0.4)] ring-1 ring-white/[0.07] transition hover:ring-white/[0.14] hover:shadow-[0_36px_90px_rgba(0,0,0,0.5)]"
                            >
                                {/* Large background watermark icon */}
                                <div className="pointer-events-none absolute -right-6 -top-6 opacity-[0.07]">
                                    <Icon className="h-56 w-56" />
                                </div>

                                {/* Subtle top glow accent */}
                                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                                <div className="mb-5 flex justify-center">
                                    <div
                                        className={`flex h-28 w-28 items-center justify-center rounded-full ${card.iconClassName} shadow-[0_20px_50px_rgba(0,0,0,0.25)]`}
                                    >
                                        <Icon className="h-16 w-16" />
                                    </div>
                                </div>

                                <div className="relative mt-2 space-y-2 text-left">
                                    <h2 className="text-2xl font-extrabold text-white">
                                        {card.title}
                                    </h2>
                                    <p className="min-h-[3.5rem] max-w-[16rem] text-base leading-5 text-white/60">
                                        {card.detail}
                                    </p>
                                </div>

                                <div className="mt-auto flex items-end justify-between gap-3 pt-2">
                                    <a
                                        href={card.primaryActionHref}
                                        className="inline-flex h-11 min-w-[9.25rem] items-center justify-center rounded-[1rem] border border-white/70 bg-white/[0.04] px-5 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
                                    >
                                        Manage
                                    </a>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            hasAccount &&
                                            card.disconnectAction.onClick()
                                        }
                                        disabled={!hasAccount}
                                        className={`inline-flex h-11 w-11 items-center justify-center transition ${hasAccount
                                            ? "text-red-400 hover:text-red-300"
                                            : "cursor-not-allowed text-white/15"
                                            }`}
                                        aria-label={
                                            hasAccount
                                                ? `Delete ${card.title} connection`
                                                : `${card.title} not connected`
                                        }
                                    >
                                        <TrashIcon className="h-6 w-6" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
