import React, { useEffect, useMemo, useState } from "react";
import { Link } from "@inertiajs/react";
import { confirmAlert } from "react-confirm-alert";
import nProgress from "nprogress";
import axios from "axios";
import {
    ChatBubbleLeftRightIcon,
    EnvelopeIcon,
    PhotoIcon,
    UserGroupIcon,
} from "@heroicons/react/24/solid";
import ChannelCard from "@/Components/ConnectionsHub/ChannelCard";

const SERVICE_ORDER = ["whatsapp", "facebook", "instagram", "email"];
const STATUS_PRIORITY = {
    reconnect_required: 0,
    needs_setup: 1,
    connected: 2,
    not_connected: 3,
};

const SERVICE_DEFINITIONS = {
    whatsapp: {
        label: "WhatsApp",
        icon: ChatBubbleLeftRightIcon,
        iconClassName: "bg-emerald-500/10 text-emerald-200",
        emptyIdentity: "No WhatsApp channel connected",
    },
    facebook: {
        label: "Facebook",
        icon: UserGroupIcon,
        iconClassName: "bg-blue-500/10 text-blue-200",
        emptyIdentity: "No Facebook channel connected",
    },
    instagram: {
        label: "Instagram",
        icon: PhotoIcon,
        iconClassName: "bg-pink-500/10 text-pink-200",
        emptyIdentity: "No Instagram channel connected",
    },
    email: {
        label: "Email",
        icon: EnvelopeIcon,
        iconClassName: "bg-sky-500/10 text-sky-200",
        emptyIdentity: "No email channel connected",
    },
};

function hasConnectionError(account) {
    return (
        account?.connection_status === "connection_error" ||
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
            if (account.insta_user_name) {
                return account.insta_user_name.startsWith("@")
                    ? account.insta_user_name
                    : `@${account.insta_user_name}`;
            }

            if (profileCount > 1) {
                return `${profileCount} Instagram accounts connected`;
            }

            return account.company_name || "Instagram connected";
        }

        if (status === "needs_setup") {
            return "Finish Instagram setup";
        }

        if (status === "reconnect_required") {
            return "Connect Instagram again";
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

function reconnectAction(service, account) {
    if (service === "facebook" || service === "instagram") {
        const params = account?.id
            ? { service, account_id: account.id }
            : { service };

        return {
            label: "Connect",
            href: route("connect_face_book", params),
        };
    }

    if (service === "email") {
        return {
            label: "Connect",
            href: account?.id
                ? route("connect_gmail", { account_id: account.id })
                : route("connect_gmail"),
        };
    }

    return {
        label: "Manage",
        href: account?.id ? route("edit_account", account.id) : route("account_registration"),
    };
}

function primaryAction(service, status, account) {
    if (status === "connected") {
        return {
            label: "Manage",
            href: account?.id
                ? route("account_view", account.id)
                : route("account_registration"),
            className:
                "inline-flex h-9 items-center justify-center rounded-full border border-white/12 bg-white/[0.06] px-3.5 text-sm font-semibold text-white transition hover:bg-white/[0.1]",
        };
    }

    if (status === "needs_setup") {
        return {
            label: "Finish setup",
            href: account?.id
                ? route("edit_account", account.id)
                : route("account_registration"),
            className:
                "inline-flex h-9 items-center justify-center rounded-full bg-amber-400 px-3.5 text-sm font-semibold text-[#12041f] transition hover:bg-amber-300",
        };
    }

    if (status === "reconnect_required") {
        const reconnect = reconnectAction(service, account);

        return {
            ...reconnect,
            className:
                "inline-flex h-9 items-center justify-center rounded-full bg-blue-600 px-3.5 text-sm font-semibold text-white transition hover:bg-blue-500",
        };
    }

    return {
        label: "Connect",
        href:
            hasConnectionError(account) && account?.id
                ? reconnectAction(service, account).href
                : route("account_registration"),
        className:
            "inline-flex h-9 items-center justify-center rounded-full bg-blue-600 px-3.5 text-sm font-semibold text-white transition hover:bg-blue-500",
    };
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
        primaryAction: primaryAction(service, status, account),
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
                                            setAccountList(response.data.accounts || []);
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
        <div className="mx-auto max-w-4xl space-y-3">
            <div className="flex justify-end">
                <Link
                    href={route("account_registration")}
                    className="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
                >
                    Connect channel
                </Link>
            </div>

            <div className="space-y-2">
                {channelCards.map((card) => (
                    <ChannelCard key={card.service} {...card} />
                ))}
            </div>
        </div>
    );
}
