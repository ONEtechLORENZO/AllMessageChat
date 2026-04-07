import React from "react";
import Authenticated from "@/Layouts/Authenticated";
import { Head, Link } from "@inertiajs/react";
import OrbitingTextRings from "@/Components/OrbitingTextRings";
import oneTechLogo from "../../../../public/images/O-logootech.svg";

const cards = [
    {
        key: "use_our_agents",
        title: "USE OUR\nAGENTS",
        description:
            "Use ONE TECH Agents to deploy task-specific agents for support, triage, and customer sales automation.",
        buttonLabel: "Browse Agents",
        href: "/ai-agent/agents",
        icon: (
            <img
                src={oneTechLogo}
                alt="ONE TECH"
                className="h-12 w-12 object-contain"
            />
        ),
    },
    {
        key: "create_custom_agent",
        title: "CREATE A\nCUSTOM AGENT",
        description:
            "Build your own AI agents and customize them your way with a more flexible workflow.",
        buttonLabel: "Create Agent",
        href: "/ai-agent/create",
        icon: (
            <svg
                viewBox="0 0 24 24"
                className="h-11 w-11 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M20 21a8 8 0 0 0-16 0" />
                <circle cx="12" cy="8" r="5" />
            </svg>
        ),
    },
];

function AgentCard({ title, description, buttonLabel, icon, href }) {
    const handleNavigate = () => {
        if (href) {
            window.location.assign(href);
        }
    };

    return (
        <div
            className={`group relative overflow-hidden rounded-2xl bg-[#160830] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.5)] transition hover:bg-[#1e0d40] ${href ? "cursor-pointer" : ""}`}
            onClick={handleNavigate}
            role={href ? "link" : undefined}
            tabIndex={href ? 0 : undefined}
            onKeyDown={(event) => {
                if (href && (event.key === "Enter" || event.key === " ")) {
                    event.preventDefault();
                    handleNavigate();
                }
            }}
        >
            <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#7c3aed]/20 blur-2xl transition duration-500 group-hover:bg-[#9333ea]/30" />
            <div className="relative z-10 flex items-start gap-5">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[#2e1060] transition group-hover:bg-[#3d1a80]">
                    {icon}
                </div>

                <div className="min-w-0 flex-1">
                    <h3 className="whitespace-pre-line text-2xl font-black uppercase leading-tight tracking-tight text-[#ff6a35] sm:text-3xl">
                        {title}
                    </h3>
                    <div className="mt-3 h-px w-full bg-white/[0.08]" />
                    <p className="mt-3 text-sm leading-6 text-white/55">
                        {description}
                    </p>
                </div>

                <a
                    href={href ?? "#"}
                    onClick={(event) => {
                        event.preventDefault();
                        handleNavigate();
                    }}
                    className="custom-button ml-4 mt-1 shrink-0"
                >
                    <span className="button-background" />
                    <span className="button-content">
                        {buttonLabel}
                        <span className="button-icon" aria-hidden="true">
                            <svg
                                viewBox="0 0 24 24"
                                className="h-5 w-5"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M5 12h14" />
                                <path d="M13 6l6 6-6 6" />
                            </svg>
                        </span>
                    </span>
                </a>
            </div>
        </div>
    );
}

export default function ChooseAgent(props) {
    const agents = props.agents || [];

    return (
        <Authenticated
            auth={props.auth}
            errors={props.errors}
            current_page="AI Agent"
            message={props.message}
            navigationMenu={props.menuBar}
            subduedBackground={true}
            hidePageTitle={true}
            disableContentScroll={true}
        >
            <Head title="AI Agent" />

            <div className="flex h-full overflow-hidden">
                <aside className="w-64 shrink-0 border-r border-white/5 bg-[#0b0118] px-4 py-6">
                    <h2 className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-white/40">
                        Your Agents
                    </h2>
                    <div className="mt-2 h-px bg-white/[0.07]" />

                    <div className="mt-4 space-y-1">
                        {agents.length === 0 ? (
                            <p className="mt-6 text-center text-xs text-white/20">
                                No agents created yet.
                            </p>
                        ) : (
                            agents.map((agent) => (
                                <Link
                                    key={agent.id}
                                    href={route("ai_agent.create") + "?agent=" + agent.id}
                                    className="group flex flex-col rounded-xl px-3 py-2.5 transition hover:bg-[#2d1060]"
                                >
                                    <span className="truncate text-sm font-semibold text-white/85 group-hover:text-white">
                                        {agent.name}
                                    </span>
                                    <span className="mt-0.5 truncate font-mono text-[10px] text-white/30 group-hover:text-white/50">
                                        {agent.key}
                                    </span>
                                </Link>
                            ))
                        )}
                    </div>
                </aside>

                <div className="relative flex-1 overflow-hidden px-6 py-6 sm:px-8 lg:px-10">
                    <div className="pointer-events-none fixed -right-69 -top-99 z-[1] opacity-[0.38]">
                        <OrbitingTextRings
                            text="one tech • "
                            size={980}
                            strokeColor="#28004D"
                            glowColor="rgba(40,0,77,0.25)"
                            className="mix-blend-screen"
                        />
                    </div>

                    <div className="relative z-10 mx-auto flex min-h-[calc(100vh-140px)] w-full max-w-5xl items-center py-10">
                        <div className="w-full">
                            <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-[300px_1fr] lg:gap-8">
                                <div className="relative overflow-hidden rounded-2xl bg-[#7c3aed] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
                                    <div className="pointer-events-none absolute inset-0">
                                        <svg
                                            className="absolute inset-0 h-full w-full opacity-[0.07]"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <defs>
                                                <pattern
                                                    id="dots"
                                                    x="0"
                                                    y="0"
                                                    width="20"
                                                    height="20"
                                                    patternUnits="userSpaceOnUse"
                                                >
                                                    <circle cx="2" cy="2" r="1.5" fill="white" />
                                                </pattern>
                                            </defs>
                                            <rect width="100%" height="100%" fill="url(#dots)" />
                                        </svg>
                                    </div>

                                    <div className="relative z-10 flex h-full flex-col">
                                        <div className="mb-8 mt-24">
                                            <h2 className="text-5xl font-black uppercase leading-none tracking-tight text-white">
                                                CHOOSE
                                                <br />
                                                AGENT
                                            </h2>
                                            <p className="mt-5 text-sm leading-7 text-white/75">
                                                Pick a ready-made agent flow created by ONE TECH or build a custom one from scratch.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-5">
                                    {cards.map((card) => (
                                        <AgentCard key={card.key} {...card} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Authenticated>
    );
}
