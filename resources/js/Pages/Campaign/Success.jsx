import React, { useEffect, useMemo } from "react";
import Authenticated from "@/Layouts/Authenticated";
import { Link } from "@inertiajs/react";

function formatDateTime(value) {
    if (!value) return "";
    const date = new Date(value.replace(" ", "T"));
    if (Number.isNaN(date.getTime())) return value;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export default function CampaignSuccess(props) {
    const translator = props.translator ?? {};
    const lastCampaign = useMemo(() => props.campaign ?? null, [props.campaign]);

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            window.location.href = "/campaigns";
        }, 4000);
        return () => window.clearTimeout(timeout);
    }, []);

    return (
        <Authenticated
            auth={props.auth}
            errors={props.errors}
            current_page={props.current_page}
            navigationMenu={props.menuBar}
        >
            <div className="dashboard-page px-6 py-10 relative">
                <div className="purple-giant-arc" aria-hidden="true"></div>
                <div className="relative z-10 max-w-4xl mx-auto rounded-3xl bg-[#170024]/80 backdrop-blur-3xl border-0 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)] p-8 text-white">
                    <div className="flex flex-col gap-3">
                        <div className="inline-flex items-center gap-3">
                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#38bdf8]/20 text-[#38bdf8]">
                                <svg
                                    className="h-5 w-5"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M16.704 5.29a1 1 0 010 1.415l-7.5 7.5a1 1 0 01-1.415 0l-3-3a1 1 0 111.415-1.414L8.5 12.086l6.793-6.793a1 1 0 011.411-.003z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </span>
                            <div className="text-2xl font-semibold">
                                {
                                    translator[
                                        "Campaign scheduled successfully"
                                    ]
                                }
                            </div>
                        </div>
                        <div className="text-white/70">
                            {
                                translator[
                                    "Your campaign is ready. You can review it in the Campaigns list."
                                ]
                            }
                        </div>
                    </div>

                    {lastCampaign && (
                        <div className="mt-6 rounded-2xl border-0 bg-[#0F0B1A]/80 p-5">
                            <div className="text-sm font-semibold text-white/80">
                                {translator["Summary"]}
                            </div>
                            <div className="mt-4 grid gap-2 text-sm text-white/70">
                                <div>
                                    <span className="font-medium text-white/80">
                                        {translator["Name"]}:
                                    </span>{" "}
                                    {lastCampaign.name}
                                </div>
                                <div>
                                    <span className="font-medium text-white/80">
                                        {translator["Account"]}:
                                    </span>{" "}
                                    {lastCampaign.account || "-"}
                                </div>
                                <div>
                                    <span className="font-medium text-white/80">
                                        {translator["Channel"]}:
                                    </span>{" "}
                                    {lastCampaign.channel || "-"}
                                </div>
                                <div>
                                    <span className="font-medium text-white/80">
                                        {translator["Scheduled"]}:
                                    </span>{" "}
                                    {formatDateTime(lastCampaign.scheduled_at)}
                                </div>
                                <div>
                                    <span className="font-medium text-white/80">
                                        {translator["Audience"]}:
                                    </span>{" "}
                                    {lastCampaign.audience || "-"}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mt-8 flex flex-wrap gap-3">
                        <Link
                            href={route("listCampaign")}
                            className="inline-flex items-center px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-widest text-white tech-gradient-btn animate-liquid-gradient transition ease-in-out duration-150"
                        >
                            {translator["Back to Campaigns"]}
                        </Link>
                    </div>
                </div>
            </div>
        </Authenticated>
    );
}
