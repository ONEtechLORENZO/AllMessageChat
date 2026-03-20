import React from "react";
import {
    ClockIcon,
    KeyIcon,
    ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { GlassCard } from "@/Pages/Subscription/company";

const apiReferenceData = {
    baseUrl: "https://api.onemessage.example/v1",
    version: "2026-02-01",
    format: "JSON",
    authHeader: "Authorization: Bearer <api_token>",
    rateLimits: [
        { plan: "Starter", limit: "60 req/min", burst: "120" },
        { plan: "Pro", limit: "300 req/min", burst: "600" },
        { plan: "Enterprise", limit: "Custom", burst: "Custom" },
    ],
};

export default function ApiReferenceOverviewCards({
    translator = {},
    className = "",
}) {
    return (
        <div className={["grid grid-cols-1 gap-4 lg:grid-cols-3", className].filter(Boolean).join(" ")}>
            <GlassCard className="bg-[#170024]/80">
                <div className="flex items-center gap-3 text-lg font-semibold text-white">
                    <ShieldCheckIcon className="h-5 w-5" />
                    <span className="text-[#03cada]">
                        {translator["Overview"] ?? "Overview"}
                    </span>
                </div>
                <div className="mt-4 space-y-3 text-sm">
                    <div className="flex items-center justify-between text-white">
                        <span className="text-[#878787]">
                            {translator["Base URL"] ?? "Base URL"}
                        </span>
                        <span className="rounded-md bg-[#12001d]/90 px-3 py-1 font-mono text-xs">
                            {apiReferenceData.baseUrl}
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-white">
                        <span className="text-[#878787]">
                            {translator["Version"] ?? "Version"}
                        </span>
                        <span className="font-mono text-xs">
                            {apiReferenceData.version}
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-white">
                        <span className="text-[#878787]">
                            {translator["Format"] ?? "Format"}
                        </span>
                        <span className="font-mono text-xs">
                            {apiReferenceData.format}
                        </span>
                    </div>
                </div>
            </GlassCard>

            <GlassCard className="bg-[#170024]/80">
                <div className="flex items-center gap-3 text-lg font-semibold text-white">
                    <KeyIcon className="h-5 w-5" />
                    <span className="text-[#ecdc00]">
                        {translator["Authentication"] ?? "Authentication"}
                    </span>
                </div>
                <p className="mt-4 text-sm text-[#878787]">
                    {translator[
                        "Use a personal access token or OAuth token to authenticate requests."
                    ] ??
                        "Use a personal access token or OAuth token to authenticate requests."}
                </p>
                <div className="mt-4">
                    <div className="text-sm font-semibold text-white">
                        {translator["HTTP Header"] ?? "HTTP Header"}
                    </div>
                    <pre className="mt-2 overflow-x-auto rounded-lg bg-[#12001d]/90 p-3 text-xs text-white">
                        {apiReferenceData.authHeader}
                    </pre>
                </div>
            </GlassCard>

            <GlassCard className="bg-[#170024]/80">
                <div className="flex items-center gap-3 text-lg font-semibold text-white">
                    <ClockIcon className="h-5 w-5" />
                    <span className="text-[#ed0820]">
                        {translator["Rate Limits"] ?? "Rate Limits"}
                    </span>
                </div>
                <div className="mt-4 space-y-3">
                    {apiReferenceData.rateLimits.map((limit) => (
                        <div
                            key={limit.plan}
                            className="flex items-center justify-between rounded-xl bg-[#12001d]/90 px-4 py-3"
                        >
                            <div className="text-sm font-semibold text-white">
                                {translator[limit.plan] ?? limit.plan}
                            </div>
                            <div className="text-xs text-[#878787]">
                                {limit.limit} - {translator["Burst"] ?? "Burst"} {translator[limit.burst] ?? limit.burst}
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
    );
}
