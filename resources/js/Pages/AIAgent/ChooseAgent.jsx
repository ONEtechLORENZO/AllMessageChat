import React from "react";
import Authenticated from "@/Layouts/Authenticated";
import { Head, Link } from "@inertiajs/react";
import oneTechLogo from "../../../../public/images/O-logootech.svg";

const cards = [
    {
        key: "use_our_agents",
        title: "USE OUR\nAGENTS",
        description:
            "Use ONE TECH Agents to deploy task-specific agents for support, triage, and customer sales automation.",
        buttonLabel: "Browse Agents",
        href: null,
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
    const Wrapper = href ? Link : "button";
    const wrapperProps = href ? { href } : { type: "button", onClick: () => {} };

    return (
        <div className="group relative overflow-hidden rounded-2xl bg-[#160830] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.5)] transition hover:bg-[#1e0d40]">
            {/* Subtle glow orb */}
            <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#7c3aed]/20 blur-2xl transition duration-500 group-hover:bg-[#9333ea]/30" />

            <div className="relative z-10 flex items-start gap-5">
                {/* Icon */}
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[#2e1060] shadow-[0_4px_20px_rgba(124,58,237,0.4)] transition group-hover:bg-[#3d1a80]">
                    {icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <h3 className="whitespace-pre-line text-2xl font-black uppercase leading-tight tracking-tight text-[#ff6a35] sm:text-3xl">
                        {title}
                    </h3>
                    <div className="mt-3 h-px w-full bg-white/[0.08]" />
                    <p className="mt-3 text-sm leading-6 text-white/55">
                        {description}
                    </p>
                </div>

                {/* Button */}
                <Wrapper
                    {...wrapperProps}
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
                </Wrapper>
            </div>
        </div>
    );
}

export default function ChooseAgent(props) {
    return (
        <Authenticated
            auth={props.auth}
            errors={props.errors}
            current_page="AI Agent"
            message={props.message}
            navigationMenu={props.menuBar}
            subduedBackground={true}
        >
            <Head title="AI Agent" />

            <div className="dashboard-page relative px-4 py-6 sm:px-6 lg:px-8">
                <div className="relative z-10 mx-auto flex min-h-[calc(100vh-140px)] w-full max-w-6xl items-center py-10">
                    <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-[320px_1fr] lg:gap-8">

                        {/* ── Left panel ── */}
                        <div className="relative overflow-hidden rounded-2xl bg-[#7c3aed] p-8 shadow-[0_20px_60px_rgba(124,58,237,0.5)]">
                            {/* Background decoration */}
                            <div className="pointer-events-none absolute inset-0">
                                <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
                                <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-[#BF00FF]/30 blur-3xl" />
                                {/* Grid dots */}
                                <svg className="absolute inset-0 h-full w-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
                                    <defs>
                                        <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                                            <circle cx="2" cy="2" r="1.5" fill="white" />
                                        </pattern>
                                    </defs>
                                    <rect width="100%" height="100%" fill="url(#dots)" />
                                </svg>
                            </div>

                            <div className="relative z-10 flex h-full flex-col">
                                <div className="mt-24 mb-8">
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

                        {/* ── Right panel — stacked cards ── */}
                        <div className="flex flex-col gap-5">
                            {cards.map(({ key, ...card }) => (
                                <AgentCard key={key} {...card} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Authenticated>
    );
}
