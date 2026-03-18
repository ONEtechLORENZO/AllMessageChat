import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { router as Inertia, usePage } from "@inertiajs/react";
import {
    ArrowUpIcon,
    ArrowLeftIcon,
    EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";

const STORAGE_KEY = "dashboard-command-assistant-state";
const EXCLUDED_KEYS = new Set([
    "auth",
    "errors",
    "ziggy",
    "flash",
    "translator",
    "translations",
]);

function buildWelcomeMessage(pageTitle) {
    return {
        id: "assistant-welcome",
        role: "assistant",
        content: "",
        suggestions: [],
        assistantResponse: null,
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
                    if (EXCLUDED_KEYS.has(key)) {
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
        if (EXCLUDED_KEYS.has(key)) {
            return result;
        }

        const trimmed = trimValue(value);
        if (trimmed !== null && trimmed !== undefined) {
            result[key] = trimmed;
        }

        return result;
    }, {});
}

function resolveAssistantPayload(payload) {
    const assistantResponse =
        payload?.assistant_response && typeof payload.assistant_response === "object"
            ? payload.assistant_response
            : null;

    return {
        assistantResponse,
        reply:
            assistantResponse?.reply ??
            payload?.message ??
            "I processed that request.",
        action: assistantResponse?.action ?? payload?.action ?? null,
        assistantState:
            assistantResponse?.assistant_state ??
            payload?.assistant_state ??
            null,
        suggestions: Array.isArray(payload?.suggestions) ? payload.suggestions : [],
        toolResult:
            payload?.tool_result && typeof payload.tool_result === "object"
                ? payload.tool_result
                : null,
    };
}

function safeCurrentRouteName() {
    try {
        return route().current() ?? null;
    } catch {
        return null;
    }
}

function extractObjectSummary(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return null;
    }

    const entries = Object.entries(value)
        .filter(([key, entry]) => !EXCLUDED_KEYS.has(key) && entry != null)
        .slice(0, 8)
        .map(([key, entry]) => [key, typeof entry === "string" ? entry.slice(0, 120) : entry]);

    if (entries.length === 0) {
        return null;
    }

    return Object.fromEntries(entries);
}

function inferModule(page, pageTitle) {
    const source = [
        page?.component,
        pageTitle,
        page?.props?.current_page,
        page?.props?.plural,
        page?.url,
    ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

    const modules = [
        "campaign",
        "template",
        "contact",
        "lead",
        "product",
        "order",
        "automation",
        "interactive message",
        "role",
        "api",
        "support request",
        "billing",
        "wallet",
        "account",
        "catalog",
        "message",
        "chat",
        "company",
        "user",
    ];

    return modules.find((module) => source.includes(module)) ?? null;
}

function inferPageMode(page) {
    const source = [page?.component, page?.url, page?.props?.current_page]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

    if (source.includes("create") || source.includes("new")) {
        return "create";
    }
    if (source.includes("edit") || source.includes("update")) {
        return "edit";
    }
    if (source.includes("detail") || source.includes("show")) {
        return "detail";
    }
    return "list";
}

function inferWorkspaceName(props) {
    return (
        props?.workspace ??
        props?.workspace_name ??
        props?.company?.company_name ??
        props?.company?.name ??
        props?.currentCompany?.company_name ??
        props?.currentCompany?.name ??
        null
    );
}

function inferSelectedProfile(props) {
    const candidate =
        props?.account ??
        props?.selected_account ??
        props?.selected_profile ??
        props?.profile ??
        null;

    if (!candidate) {
        return null;
    }

    if (typeof candidate === "string") {
        return candidate;
    }

    return (
        candidate.company_name ??
        candidate.name ??
        candidate.service ??
        candidate.id ??
        null
    );
}

function summarizePageProps(props) {
    const keys = Object.keys(props ?? {}).filter((key) => !EXCLUDED_KEYS.has(key));
    const highlights = [];

    if (props?.current_page) highlights.push(`page ${props.current_page}`);
    if (props?.plural) highlights.push(`module ${props.plural}`);
    if (Array.isArray(props?.records)) highlights.push(`${props.records.length} records`);
    if (Array.isArray(props?.data)) highlights.push(`${props.data.length} data rows`);
    if (props?.record?.id) highlights.push(`focused record ${props.record.id}`);

    return highlights.length > 0
        ? highlights.join(", ")
        : `visible props: ${keys.slice(0, 8).join(", ") || "none"}`;
}

function collectVisibleActions(page, props, module, mode) {
    const actions = new Set(["answer_page_question"]);

    if (mode === "list") {
        actions.add("search");
        actions.add("open_list");
    }
    if (mode === "create") {
        actions.add("create");
    }
    if (mode === "edit") {
        actions.add("update");
    }
    if (mode === "detail") {
        actions.add("open_detail");
    }
    if (props?.record?.id || props?.id) {
        actions.add("update");
        actions.add("delete");
    }
    if (module) {
        actions.add(`navigate_${module}`);
    }
    if (page?.url?.includes("template")) {
        actions.add("edit_template_content");
        actions.add("submit_template");
    }

    return Array.from(actions);
}

function collectVisibleFilters(props) {
    const filterKeys = [
        "search",
        "searchKey",
        "filter",
        "filter_id",
        "sort_by",
        "sort_order",
        "start_date",
        "end_date",
        "current_page",
        "search_tab",
    ];

    return filterKeys.reduce((result, key) => {
        if (props?.[key] !== undefined && props[key] !== null && props[key] !== "") {
            result[key] = props[key];
        }
        return result;
    }, {});
}

function collectVisibleForms(props) {
    const forms = [];

    if (Array.isArray(props?.fields)) {
        forms.push({
            source: "fields",
            count: props.fields.length,
        });
    }

    for (const [key, value] of Object.entries(props ?? {})) {
        if (EXCLUDED_KEYS.has(key) || !value || typeof value !== "object" || Array.isArray(value)) {
            continue;
        }

        const fieldNames = Object.keys(value).filter((field) =>
            ["name", "title", "email", "phone", "status", "description", "body", "header", "footer"].includes(field),
        );

        if (fieldNames.length > 0) {
            forms.push({
                source: key,
                fields: fieldNames.slice(0, 8),
            });
        }
    }

    return forms.slice(0, 5);
}

function collectVisibleDataSummary(props) {
    const summary = [];

    for (const [key, value] of Object.entries(props ?? {})) {
        if (EXCLUDED_KEYS.has(key)) {
            continue;
        }

        if (Array.isArray(value)) {
            summary.push({
                source: key,
                type: "list",
                count: value.length,
                sample: value.slice(0, 3).map((item) => extractObjectSummary(item) ?? item),
            });
            continue;
        }

        const objectSummary = extractObjectSummary(value);
        if (objectSummary && (value.id !== undefined || key === "record")) {
            summary.push({
                source: key,
                type: "record",
                sample: objectSummary,
            });
        }
    }

    return summary.slice(0, 8);
}

function findFocusedRecord(props) {
    const directCandidates = ["record", "campaign", "contact", "lead", "product", "order", "automation", "template", "account", "company"];

    for (const key of directCandidates) {
        const value = props?.[key];
        if (value && typeof value === "object" && !Array.isArray(value) && value.id !== undefined) {
            return extractObjectSummary(value);
        }
    }

    for (const value of Object.values(props ?? {})) {
        if (value && typeof value === "object" && !Array.isArray(value) && value.id !== undefined) {
            return extractObjectSummary(value);
        }
    }

    return null;
}

function inferOpenSection(props) {
    return (
        props?.current_page ??
        props?.search_tab ??
        props?.tab ??
        props?.activeTab ??
        null
    );
}

function collectValidationRules(props) {
    if (Array.isArray(props?.fields)) {
        return props.fields.slice(0, 20).map((field) => ({
            name: field?.name ?? field?.label ?? null,
            required: Boolean(field?.required),
            type: field?.type ?? null,
        }));
    }

    return [];
}

function buildRuntimeContext(page, pageTitle, assistantState, lastResult) {
    const props = sanitizePageProps(page?.props);
    const module = inferModule(page, pageTitle);
    const mode = inferPageMode(page);

    return {
        url: page?.url ?? null,
        component: page?.component ?? null,
        title: pageTitle,
        route_name: safeCurrentRouteName(),
        module,
        page_mode: mode,
        workspace_name: inferWorkspaceName(props),
        selected_profile_or_null: inferSelectedProfile(props),
        short_page_summary: summarizePageProps(props),
        allowed_page_actions: collectVisibleActions(page, props, module, mode),
        visible_filters_json: collectVisibleFilters(props),
        visible_forms_json: collectVisibleForms(props),
        visible_data_summary_json: collectVisibleDataSummary(props),
        focused_record_json_or_null: findFocusedRecord(props),
        open_section_or_tab: inferOpenSection(props),
        assistant_state_json: assistantState ?? null,
        last_result_json_or_null: lastResult ?? null,
        page_validation_rules_json: collectValidationRules(props),
        props,
    };
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
    const [isOpen, setIsOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState(
        defaultMessage.content ? [defaultMessage] : [],
    );
    const [assistantState, setAssistantState] = useState(null);
    const [lastResult, setLastResult] = useState(null);
    const pageContext = useMemo(
        () => buildRuntimeContext(page, pageTitle, assistantState, lastResult),
        [assistantState, lastResult, page, pageTitle],
    );
    const scrollRef = useRef(null);
    const panelRef = useRef(null);
    const launcherRef = useRef(null);

    useEffect(() => {
        const stored = sessionStorage.getItem(STORAGE_KEY);
        if (!stored) {
            return;
        }

        try {
            const parsed = JSON.parse(stored);
            setIsOpen(Boolean(parsed.isOpen));
            setMessages(normalizeMessages(parsed.messages, defaultMessage));
            setAssistantState(parsed.assistantState ?? null);
            setLastResult(parsed.lastResult ?? null);
        } catch {
            setMessages(defaultMessage.content ? [defaultMessage] : []);
            setAssistantState(null);
            setLastResult(null);
        }
    }, [defaultMessage]);

    useEffect(() => {
        sessionStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
                isOpen,
                messages,
                assistantState,
                lastResult,
            }),
        );
    }, [assistantState, isOpen, lastResult, messages]);

    useEffect(() => {
        if (!scrollRef.current) return;
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages, isOpen, isLoading]);

    useEffect(() => {
        if (!isOpen) {
            return undefined;
        }

        function handlePointerDown(event) {
            const target = event.target;

            if (
                panelRef.current?.contains(target) ||
                launcherRef.current?.contains(target)
            ) {
                return;
            }

            setIsOpen(false);
            setIsMenuOpen(false);
        }

        document.addEventListener("mousedown", handlePointerDown);
        document.addEventListener("touchstart", handlePointerDown);

        return () => {
            document.removeEventListener("mousedown", handlePointerDown);
            document.removeEventListener("touchstart", handlePointerDown);
        };
    }, [isOpen]);

    function appendMessage(message) {
        setMessages((current) => [...current, message]);
    }

    function resetConversation() {
        const nextMessages = defaultMessage.content ? [defaultMessage] : [];
        setMessages(nextMessages);
        setAssistantState(null);
        setLastResult(null);
        setInput("");
        setIsMenuOpen(false);
        sessionStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
                isOpen: true,
                messages: nextMessages,
                assistantState: null,
                lastResult: null,
            }),
        );
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
            assistantResponse: null,
        });
        setInput("");
        setIsLoading(true);

        axios
            .post(route("assistant.command"), {
                command: trimmed,
                page: pageContext,
                assistant_state: assistantState,
            })
            .then((response) => {
                const payload = response.data ?? {};
                const normalized = resolveAssistantPayload(payload);
                setAssistantState(normalized.assistantState);
                setLastResult(
                    normalized.toolResult ?? {
                        ok: normalized.assistantResponse?.status === "completed",
                        message: normalized.reply,
                        next_action: normalized.action,
                    },
                );
                appendMessage({
                    id: `assistant-${Date.now()}`,
                    role: "assistant",
                    content: normalized.reply,
                    suggestions: normalized.suggestions,
                    assistantResponse: normalized.assistantResponse,
                });

                if (
                    normalized.action?.type === "visit" &&
                    normalized.action.url
                ) {
                    window.setTimeout(() => {
                        Inertia.visit(normalized.action.url);
                    }, 500);
                }
            })
            .catch(() => {
                setLastResult({
                    error: true,
                    message: "assistant_request_failed",
                });
                appendMessage({
                    id: `assistant-error-${Date.now()}`,
                    role: "assistant",
                    content:
                        "I could not complete that request. Try a more specific command like 'create a campaign called launch_offer' or 'search contacts for mario'.",
                    assistantResponse: null,
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

    function handleInputKeyDown(event) {
        if (event.key !== "Enter" || event.shiftKey) {
            return;
        }

        event.preventDefault();
        pushCommand(input);
    }

    return (
        <>
            <button
                ref={launcherRef}
                type="button"
                onClick={() => setIsOpen((current) => !current)}
                className="assistant-launcher group fixed bottom-5 right-4 z-[90] flex h-[64px] w-[64px] items-center justify-center overflow-hidden rounded-full bg-[radial-gradient(circle_at_50%_35%,rgba(191,0,255,0.28),transparent_42%),linear-gradient(180deg,rgba(31,31,31,0.98),rgba(20,20,20,0.98))] shadow-[0_22px_60px_rgba(0,0,0,0.56),0_0_38px_rgba(191,0,255,0.18)] backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-[0_28px_90px_rgba(191,0,255,0.22)]"
            >
                <div className="assistant-launcher-ring absolute inset-[5px] rounded-full" />
                <div className="assistant-launcher-core relative flex h-[46px] w-[46px] items-center justify-center rounded-full bg-[radial-gradient(circle_at_35%_28%,rgba(171,92,255,0.34),transparent_30%),linear-gradient(180deg,rgba(31,31,31,0.94),rgba(16,16,16,0.98))] text-[13px] font-semibold tracking-[0.08em] text-white">
                    En
                </div>
            </button>

            {!isOpen ? (
                null
            ) : null}

            {isOpen ? (
                <div
                    ref={panelRef}
                    className="assistant-panel fixed bottom-20 right-4 z-[95] flex w-[min(328px,calc(100vw-1rem))] flex-col overflow-hidden rounded-[30px] bg-[#1f1f1f] shadow-[0_32px_110px_rgba(0,0,0,0.66)] backdrop-blur-2xl max-md:bottom-18 max-md:left-3 max-md:right-3 max-md:w-auto"
                >
                    <div className="relative px-4 pb-4 pt-4">
                        <div className="flex items-center justify-between">
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.03] text-white/80 transition hover:bg-white/[0.08] hover:text-white"
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
                                onClick={() => setIsMenuOpen((current) => !current)}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.03] text-white/80 transition hover:bg-white/[0.08] hover:text-white"
                            >
                                <EllipsisHorizontalIcon className="h-4 w-4" />
                            </button>
                        </div>

                        {isMenuOpen ? (
                            <div className="absolute right-4 top-14 z-10 min-w-[144px] rounded-2xl border border-white/10 bg-[#171717] p-1.5 shadow-[0_20px_40px_rgba(0,0,0,0.45)]">
                                <button
                                    type="button"
                                    onClick={resetConversation}
                                    className="flex w-full items-center rounded-[14px] px-3 py-2 text-left text-sm text-white/88 transition hover:bg-white/[0.06] hover:text-white"
                                >
                                    Restart chat
                                </button>
                            </div>
                        ) : null}

                        <div className="assistant-stage relative mt-5 overflow-hidden rounded-[26px] px-4 pb-5 pt-4">
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
                                        ? "ml-auto max-w-[88%] rounded-[18px] rounded-br-md bg-[linear-gradient(180deg,rgba(122,46,255,0.22),rgba(191,0,255,0.12))] px-3 py-2 text-sm leading-5 text-white"
                                        : "mr-auto max-w-[92%] rounded-[18px] rounded-bl-md bg-white/[0.05] px-3 py-2 text-sm leading-5 text-white/88"
                                }
                            >
                                <div>{message.content}</div>
                            </div>
                        ))}

                        {isLoading ? (
                            <div className="mr-auto max-w-[80%] rounded-[20px] rounded-bl-md bg-white/[0.05] px-3.5 py-2.5 text-sm text-white/70">
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
                                    onKeyDown={handleInputKeyDown}
                                    placeholder="Ask assistant..."
                                    className="min-h-[44px] w-full resize-none rounded-[18px] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] px-4 py-2.5 text-sm leading-5 text-white placeholder:text-white/28 focus:outline-none focus:ring-0"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className="inline-flex h-11 w-11 items-center justify-center rounded-[18px] bg-[linear-gradient(180deg,rgba(62,18,102,0.92),rgba(22,9,38,0.98))] text-white shadow-[0_12px_30px_rgba(191,0,255,0.18)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
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
