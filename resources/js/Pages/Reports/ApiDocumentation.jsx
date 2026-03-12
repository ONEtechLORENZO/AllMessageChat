import React, { useMemo, useState } from "react";
import { Head } from "@inertiajs/react";
import Authenticated from "@/Layouts/Authenticated";
import {
    ChevronDownIcon,
    ClockIcon,
    CodeBracketIcon,
    KeyIcon,
    ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { GlassCard } from "@/Pages/Subscription/company";

function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
}

export default function ApiDocumentation(props) {
    const translator = props.translator || {};
    const pageTitle = translator["API Documentation"] ?? "API Documentation";
    const [openEndpoint, setOpenEndpoint] = useState("GET /workspaces");

    const apiData = useMemo(
        () => ({
            baseUrl: "https://api.onemessage.example/v1",
            version: "2026-02-01",
            format: "JSON",
            authHeader: "Authorization: Bearer <api_token>",
            endpoints: [
                {
                    method: "GET",
                    path: "/workspaces",
                    title: "List workspaces",
                    description:
                        "Returns a paginated list of workspaces the token can access.",
                    params: [
                        { name: "limit", type: "integer", required: false, description: "Max records per page (1-100)." },
                        { name: "cursor", type: "string", required: false, description: "Pagination cursor from previous response." },
                    ],
                    headers: [
                        { name: "Authorization", value: "Bearer <api_token>" },
                    ],
                    requestExample: "GET /workspaces?limit=20",
                    responseExample: `{
  "data": [
    { "id": "ws_9z7", "name": "Acme Workspace", "status": "active" }
  ],
  "meta": { "next_cursor": "cur_91aa", "request_id": "req_56bf" }
}`,
                },
                {
                    method: "GET",
                    path: "/workspaces/{id}",
                    title: "Retrieve a workspace",
                    description:
                        "Fetch a single workspace by ID.",
                    params: [
                        { name: "id", type: "string", required: true, description: "Workspace identifier." },
                    ],
                    headers: [
                        { name: "Authorization", value: "Bearer <api_token>" },
                    ],
                    requestExample: "GET /workspaces/ws_9z7",
                    responseExample: `{
  "data": { "id": "ws_9z7", "name": "Acme Workspace", "status": "active" }
}`,
                },
                {
                    method: "PATCH",
                    path: "/workspaces/{id}",
                    title: "Update workspace",
                    description:
                        "Update editable fields on a workspace.",
                    params: [
                        { name: "id", type: "string", required: true, description: "Workspace identifier." },
                    ],
                    headers: [
                        { name: "Authorization", value: "Bearer <api_token>" },
                        { name: "Idempotency-Key", value: "dedupe_123" },
                    ],
                    requestExample: `PATCH /workspaces/ws_9z7
{
  "name": "Acme Operations",
  "time_zone": "Europe/Rome"
}`,
                    responseExample: `{
  "data": { "id": "ws_9z7", "name": "Acme Operations", "status": "active" }
}`,
                },
                {
                    method: "POST",
                    path: "/messages",
                    title: "Send message",
                    description:
                        "Send a message through a connected channel.",
                    params: [
                        { name: "to", type: "string", required: true, description: "Recipient identifier." },
                        { name: "channel", type: "string", required: true, description: "whatsapp | instagram | facebook." },
                        { name: "content", type: "string", required: true, description: "Message body." },
                    ],
                    headers: [
                        { name: "Authorization", value: "Bearer <api_token>" },
                        { name: "Idempotency-Key", value: "msg_901" },
                    ],
                    requestExample: `POST /messages
{
  "to": "+15551234567",
  "channel": "whatsapp",
  "content": "Hello from OneMessage!"
}`,
                    responseExample: `{
  "data": { "id": "msg_482", "status": "queued" }
}`,
                },
            ],
            rateLimits: [
                { plan: "Starter", limit: "60 req/min", burst: "120" },
                { plan: "Pro", limit: "300 req/min", burst: "600" },
                { plan: "Enterprise", limit: "Custom", burst: "Custom" },
            ],
        }),
        [],
    );

    return (
        <Authenticated
            auth={props.auth}
            errors={props.errors}
            navigationMenu={props.menuBar}
            current_page={props.current_page ?? "API Documentation"}
        >
            <Head title={pageTitle} />

            <div className="dashboard-page relative pt-4 pb-8">
                <div className="purple-giant-arc" aria-hidden="true"></div>
                <div className="relative z-10 space-y-8 px-4 sm:px-6 lg:px-8">
                    <div className="pb-4">
                        <h2 className="mb-2 flex flex-wrap items-baseline gap-x-3 leading-none">
                            <span className="one-tech-special text-4xl font-black tracking-tight sm:text-5xl">
                                {pageTitle}
                            </span>
                        </h2>
                        <p className="text-sm text-[#878787] mt-1">
                            {translator[
                                "Get everything you need to integrate your workspace, send messages, and monitor usage."
                            ] ??
                                "Get everything you need to integrate your workspace, send messages, and monitor usage."}
                        </p>
                    </div>

                    <div className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            <GlassCard className="bg-[#170024]/80">
                                <div className="flex items-center gap-3 text-white text-lg font-semibold">
                                    <ShieldCheckIcon className="h-5 w-5" />
                                    <span className="text-[#03cada]">
                                        {translator["Overview"] ?? "Overview"}
                                    </span>
                                </div>
                                <div className="mt-4 space-y-3 text-sm">
                                    <div className="flex items-center justify-between text-white">
                                        <span className="text-[#878787]">
                                            Base URL
                                        </span>
                                        <span className="font-mono text-xs bg-[#12001d]/90 px-3 py-1 rounded-md">
                                            {apiData.baseUrl}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-white">
                                        <span className="text-[#878787]">
                                            Version
                                        </span>
                                        <span className="font-mono text-xs">
                                            {apiData.version}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-white">
                                        <span className="text-[#878787]">
                                            Format
                                        </span>
                                        <span className="font-mono text-xs">
                                            {apiData.format}
                                        </span>
                                    </div>
                                </div>
                            </GlassCard>

                            <GlassCard className="bg-[#170024]/80">
                                <div className="flex items-center gap-3 text-white text-lg font-semibold">
                                    <KeyIcon className="h-5 w-5" />
                                    <span className="text-[#ecdc00]">
                                        {translator["Authentication"] ??
                                            "Authentication"}
                                    </span>
                                </div>
                                <p className="text-[#878787] text-sm mt-4">
                                    {translator[
                                        "Use a personal access token or OAuth token to authenticate requests."
                                    ] ??
                                        "Use a personal access token or OAuth token to authenticate requests."}
                                </p>
                                <div className="mt-4">
                                    <div className="text-white text-sm font-semibold">
                                        HTTP Header
                                    </div>
                                    <pre className="mt-2 text-xs text-white bg-[#12001d]/90 rounded-lg p-3 overflow-x-auto">
                                        {apiData.authHeader}
                                    </pre>
                                </div>
                            </GlassCard>

                            <GlassCard className="bg-[#170024]/80">
                                <div className="flex items-center gap-3 text-white text-lg font-semibold">
                                    <ClockIcon className="h-5 w-5" />
                                    <span className="text-[#ed0820]">
                                        {translator["Rate Limits"] ??
                                            "Rate Limits"}
                                    </span>
                                </div>
                                <div className="mt-4 space-y-3">
                                    {apiData.rateLimits.map((limit) => (
                                        <div
                                            key={limit.plan}
                                            className="flex items-center justify-between bg-[#12001d]/90 rounded-xl px-4 py-3"
                                        >
                                            <div className="text-white text-sm font-semibold">
                                                {limit.plan}
                                            </div>
                                            <div className="text-xs text-[#878787]">
                                                {limit.limit} - Burst{" "}
                                                {limit.burst}
                                            </div>
                                        </div>
                                    ))}
                                    <p className="text-xs text-[#878787]">
                                        {translator[
                                            "Rate limits reset every minute. Exceeding limits returns 429 with a Retry-After header."
                                        ] ??
                                            "Rate limits reset every minute. Exceeding limits returns 429 with a Retry-After header."}
                                    </p>
                                </div>
                            </GlassCard>
                        </div>

                    <GlassCard className="bg-[#170024]/80">
                        <div className="flex items-center gap-3 text-white text-lg font-semibold">
                            <CodeBracketIcon className="h-5 w-5" />
                            <span className="text-[#08e1ed]">
                                {translator["Endpoints"] ?? "Endpoints"}
                            </span>
                        </div>
                        <div className="mt-4 space-y-3">
                            {apiData.endpoints.map((endpoint, index) => {
                                const key = `${endpoint.method} ${endpoint.path}`;
                                const isOpen = openEndpoint === key;

                                return (
                                    <div
                                        key={key}
                                        className={classNames(
                                            "rounded-2xl overflow-hidden bg-[#12001d]/90",
                                            index !== apiData.endpoints.length - 1
                                                ? "border-b border-white/10"
                                                : "",
                                        )}
                                    >
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setOpenEndpoint(
                                                    isOpen ? "" : key,
                                                )
                                            }
                                            className="w-full flex items-center justify-between gap-4 px-4 py-3 text-left"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span
                                                    className={classNames(
                                                        "text-xs font-semibold px-2 py-1 rounded-full border",
                                                        endpoint.method ===
                                                            "GET"
                                                            ? "text-emerald-200 bg-emerald-500/10 border-emerald-400/20"
                                                            : endpoint.method ===
                                                                "POST"
                                                                ? "text-sky-200 bg-sky-500/10 border-sky-400/20"
                                                                : "text-amber-200 bg-amber-500/10 border-amber-400/20",
                                                    )}
                                                >
                                                    {endpoint.method}
                                                </span>
                                                <span className="font-mono text-xs text-white">
                                                    {endpoint.path}
                                                </span>
                                                <span className="text-sm text-[#878787]">
                                                    {endpoint.title}
                                                </span>
                                            </div>
                                            <ChevronDownIcon
                                                className={classNames(
                                                    isOpen
                                                        ? "rotate-180 text-white"
                                                        : "text-white/60",
                                                    "h-5 w-5 transition-transform",
                                                )}
                                            />
                                        </button>

                                        {isOpen && (
                                            <div className="px-4 pb-4">
                                                <p className="text-sm text-white/80">
                                                    {endpoint.description}
                                                </p>

                                                <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                    <div className="bg-[#12001d]/90 rounded-xl p-3">
                                                        <div className="text-xs uppercase tracking-wide text-[#878787]">
                                                            Parameters
                                                        </div>
                                                        <div className="mt-2 space-y-2 text-xs text-white/90">
                                                            {endpoint.params
                                                                .length ? (
                                                                endpoint.params.map(
                                                                    (
                                                                        param,
                                                                    ) => (
                                                                        <div
                                                                            key={
                                                                                param.name
                                                                            }
                                                                            className="flex items-start justify-between gap-3"
                                                                        >
                                                                            <div className="font-mono">
                                                                                {
                                                                                    param.name
                                                                                }
                                                                            </div>
                                                                            <div className="text-white/70">
                                                                                {
                                                                                    param.type
                                                                                }{" "}
                                                                                -{" "}
                                                                                {param.required
                                                                                    ? "required"
                                                                                    : "optional"}
                                                                            </div>
                                                                            <div className="text-[#878787]">
                                                                                {
                                                                                    param.description
                                                                                }
                                                                            </div>
                                                                        </div>
                                                                    ),
                                                                )
                                                            ) : (
                                                                <div className="text-[#878787]">
                                                                    No parameters
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="bg-[#12001d]/90 rounded-xl p-3">
                                                        <div className="text-xs uppercase tracking-wide text-[#878787]">
                                                            Headers
                                                        </div>
                                                        <div className="mt-2 space-y-2 text-xs text-white/90">
                                                            {endpoint.headers.map(
                                                                (header) => (
                                                                    <div
                                                                        key={
                                                                            header.name
                                                                        }
                                                                        className="flex items-center justify-between gap-3"
                                                                    >
                                                                        <div className="font-mono">
                                                                            {
                                                                                header.name
                                                                            }
                                                                        </div>
                                                                        <div className="text-white/70">
                                                                            {
                                                                                header.value
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                ),
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                    <div>
                                                        <div className="text-xs uppercase tracking-wide text-[#878787]">
                                                            Example Request
                                                        </div>
                                                        <pre className="mt-2 text-xs text-white bg-[#12001d]/90 rounded-lg p-3 overflow-x-auto">
                                                            {
                                                                endpoint.requestExample
                                                            }
                                                        </pre>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs uppercase tracking-wide text-[#878787]">
                                                            Example Response
                                                        </div>
                                                        <pre className="mt-2 text-xs text-white bg-[#12001d]/90 rounded-lg p-3 overflow-x-auto">
                                                            {
                                                                endpoint.responseExample
                                                            }
                                                        </pre>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </GlassCard>
                    </div>
                </div>
            </div>
        </Authenticated>
    );
}
