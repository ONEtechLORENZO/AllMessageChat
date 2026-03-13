import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { router as Inertia, usePage } from "@inertiajs/react";
import {
    ArrowUpIcon,
    ArrowLeftIcon,
    EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";

const STORAGE_KEY = "dashboard-command-assistant-state";

function buildWelcomeMessage(pageTitle) {
    return {
        id: "assistant-welcome",
        role: "assistant",
        content: "",
        suggestions: [],
    };
}

function normalizeMessages(messages, fallbackMessage) {
    if (!Array.isArray(messages)) {
        return fallbackMessage.content ? [fallbackMessage] : [];
    }

    const filtered = messages.filter((message) => {
        if (!message || typeof message !== "object") {
            return false;
        }

        const content =
            typeof message.content === "string" ? message.content.trim() : "";
        const suggestions = Array.isArray(message.suggestions)
            ? message.suggestions
            : [];

        return content !== "" || suggestions.length > 0;
    });

    if (filtered.length > 0) {
        return filtered;
    }

    return fallbackMessage.content ? [fallbackMessage] : [];
}

function sanitizePageProps(props) {
    if (!props || typeof props !== "object") {
        return {};
    }

    const excludedKeys = new Set([
        "auth",
        "errors",
        "ziggy",
        "flash",
        "translator",
        "translations",
    ]);

    const trimValue = (value, depth = 0) => {
        if (depth > 3) {
            return null;
        }

        if (value == null) {
            return value;
        }

        if (typeof value === "string") {
            return value.length > 280 ? `${value.slice(0, 280)}...` : value;
        }

        if (typeof value === "number" || typeof value === "boolean") {
            return value;
        }

        if (Array.isArray(value)) {
            return value.slice(0, 15).map((item) => trimValue(item, depth + 1));
        }

        if (typeof value === "object") {
            return Object.entries(value)
                .slice(0, 20)
                .reduce((result, [key, item]) => {
                    if (excludedKeys.has(key)) {
                        return result;
                    }

                    const trimmed = trimValue(item, depth + 1);
                    if (trimmed !== null && trimmed !== undefined) {
                        result[key] = trimmed;
                    }

                    return result;
                }, {});
        }

        return null;
    };

    return Object.entries(props).reduce((result, [key, value]) => {
        if (excludedKeys.has(key)) {
            return result;
        }

        const trimmed = trimValue(value);
        if (trimmed !== null && trimmed !== undefined) {
            result[key] = trimmed;
        }

        return result;
    }, {});
}

export default function CommandAssistant() {
    const page = usePage();
    const pageTitle =
        page?.props?.current_page ??
        page?.props?.plural ??
        page?.props?.pageTitle ??
        "the dashboard";

    const defaultMessage = useMemo(
        () => buildWelcomeMessage(pageTitle),
        [pageTitle],
    );
    const pageContext = useMemo(
        () => ({
            url: page.url,
            component: page.component,
            title: pageTitle,
            props: sanitizePageProps(page.props),
        }),
        [page.component, page.props, page.url, pageTitle],
    );
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState(
        defaultMessage.content ? [defaultMessage] : [],
    );
    const scrollRef = useRef(null);

    useEffect(() => {
        const stored = sessionStorage.getItem(STORAGE_KEY);
        if (!stored) {
            return;
        }

        try {
            const parsed = JSON.parse(stored);
            setIsOpen(Boolean(parsed.isOpen));
            setMessages(normalizeMessages(parsed.messages, defaultMessage));
        } catch {
            setMessages(defaultMessage.content ? [defaultMessage] : []);
        }
    }, [defaultMessage]);

    useEffect(() => {
        sessionStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
                isOpen,
                messages,
            }),
        );
    }, [isOpen, messages]);

    useEffect(() => {
        if (!scrollRef.current) return;
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages, isOpen, isLoading]);

    function appendMessage(message) {
        setMessages((current) => [...current, message]);
    }

    function pushCommand(command) {
        const trimmed = command.trim();
        if (!trimmed || isLoading) {
            return;
        }

        appendMessage({
            id: `user-${Date.now()}`,
            role: "user",
            content: trimmed,
        });
        setInput("");
        setIsLoading(true);

        axios
            .post(route("assistant.command"), {
                command: trimmed,
                page: pageContext,
            })
            .then((response) => {
                const payload = response.data ?? {};
                appendMessage({
                    id: `assistant-${Date.now()}`,
                    role: "assistant",
                    content: payload.message ?? "I processed that request.",
                    suggestions: payload.suggestions ?? [],
                });

                if (payload.action?.type === "visit" && payload.action.url) {
                    window.setTimeout(() => {
                        Inertia.visit(payload.action.url);
                    }, 500);
                }
            })
            .catch(() => {
                appendMessage({
                    id: `assistant-error-${Date.now()}`,
                    role: "assistant",
                    content:
                        "I could not complete that request. Try a more specific command like 'create a campaign called launch_offer' or 'search contacts for mario'.",
                });
            })
            .finally(() => {
                setIsLoading(false);
            });
    }

    function handleSubmit(event) {
        event.preventDefault();
        pushCommand(input);
    }

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen((current) => !current)}
                className="assistant-launcher group fixed bottom-5 right-4 z-[90] flex h-15 w-15 items-center justify-center overflow-hidden rounded-[24px] border border-cyan-300/30 bg-[radial-gradient(circle_at_30%_20%,rgba(56,189,248,0.22),transparent_35%),linear-gradient(180deg,rgba(23,31,53,0.95),rgba(7,10,20,0.96))] shadow-[0_18px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-[0_24px_80px_rgba(34,211,238,0.18)]"
            >
                <div className="assistant-launcher-ring absolute inset-1.5 rounded-[20px]" />
                <div className="relative flex h-10 w-10 items-center justify-center rounded-full border border-cyan-300/40 bg-black/35 text-sm font-semibold text-white">
                    AI
                </div>
            </button>

            {!isOpen ? (
                null
            ) : null}

            {isOpen ? (
                <div className="assistant-panel fixed bottom-20 right-4 z-[95] flex w-[min(320px,calc(100vw-1rem))] flex-col overflow-hidden rounded-[28px] border border-white/12 bg-[radial-gradient(circle_at_50%_18%,rgba(85,98,255,0.18),transparent_28%),radial-gradient(circle_at_50%_52%,rgba(57,189,255,0.12),transparent_30%),linear-gradient(180deg,#0b1020_0%,#09111f_56%,#070d18_100%)] shadow-[0_32px_100px_rgba(0,0,0,0.62)] backdrop-blur-2xl max-md:bottom-18 max-md:left-3 max-md:right-3 max-md:w-auto">
                    <div className="relative px-4 pb-4 pt-4">
                        <div className="flex items-center justify-between">
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-white/[0.03] text-white/80 transition hover:bg-white/[0.08] hover:text-white"
                            >
                                <ArrowLeftIcon className="h-4 w-4" />
                            </button>

                            <div className="flex min-w-0 flex-col items-center px-3 text-center">
                                <div className="text-sm font-semibold tracking-[0.08em] text-white">
                                    Enzo
                                </div>
                            </div>

                            <button
                                type="button"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-white/[0.03] text-white/80 transition hover:bg-white/[0.08] hover:text-white"
                            >
                                <EllipsisHorizontalIcon className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="assistant-stage relative mt-5 overflow-hidden rounded-[24px] px-4 pb-5 pt-4">
                            <div className="assistant-stage-glow" />
                            <div className="assistant-particles" aria-hidden="true">
                                {Array.from({ length: 16 }).map((_, index) => (
                                    <span
                                        key={`particle-${index}`}
                                        className={`assistant-particle assistant-particle-${(index % 8) + 1}`}
                                    />
                                ))}
                            </div>

                            <div className="mx-auto flex flex-col items-center">
                                <div className="assistant-orb-shell relative">
                                    <div className="assistant-orb-core">
                                        <div className="assistant-orb-grid" />
                                        <div className="assistant-orb-swirl assistant-orb-swirl-a" />
                                        <div className="assistant-orb-swirl assistant-orb-swirl-b" />
                                        <div className="assistant-orb-swirl assistant-orb-swirl-c" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div
                        ref={scrollRef}
                        className="flex max-h-[20vh] min-h-[88px] flex-col gap-3 overflow-y-auto px-4 py-3"
                    >
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={
                                    message.role === "user"
                                        ? "ml-auto max-w-[88%] rounded-[18px] rounded-br-md border border-cyan-300/30 bg-cyan-400/14 px-3 py-2 text-sm leading-5 text-white"
                                        : "mr-auto max-w-[92%] rounded-[18px] rounded-bl-md border border-white/10 bg-white/[0.04] px-3 py-2 text-sm leading-5 text-white/88"
                                }
                            >
                                <div>{message.content}</div>
                            </div>
                        ))}

                        {isLoading ? (
                            <div className="mr-auto max-w-[80%] rounded-[20px] rounded-bl-md border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white/70">
                                Working on it...
                            </div>
                        ) : null}
                    </div>

                    <div className="border-t border-white/10 px-4 py-4">
                        <form onSubmit={handleSubmit} className="flex items-end gap-2">
                            <div className="relative flex-1">
                                <textarea
                                    rows={1}
                                    value={input}
                                    onChange={(event) => setInput(event.target.value)}
                                    placeholder="Ask assistant..."
                                    className="min-h-[44px] w-full resize-none rounded-[18px] border border-white/12 bg-white/[0.03] px-4 py-2.5 text-sm leading-5 text-white placeholder:text-white/28 focus:border-cyan-300/40 focus:outline-none focus:ring-0"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className="inline-flex h-11 w-11 items-center justify-center rounded-[18px] border border-cyan-300/20 bg-[linear-gradient(180deg,rgba(19,42,68,0.95),rgba(10,28,49,0.98))] text-white shadow-[0_12px_30px_rgba(34,211,238,0.12)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <ArrowUpIcon className="h-4 w-4" />
                            </button>
                        </form>
                    </div>
                </div>
            ) : null}
        </>
    );
}
