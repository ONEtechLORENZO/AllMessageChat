import React from "react";
import { Link } from "@inertiajs/react";

// ── per-service config ────────────────────────────────────────────────────────

const SERVICE_CONFIG = {
    email: {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
                <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
                <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
            </svg>
        ),
        accentColor: "text-[#BF00FF]",
        ringColor: "ring-[#BF00FF]/30",
        bgColor: "bg-[#BF00FF]/10",
        title: "Email account connected",
        subtitle: "Your email account has been successfully added to the workspace.",
        description: "You can now send and receive emails, use templates, campaigns, and automations with this account.",
        helperText: "You can update SMTP settings later from account details.",
        primaryLabel: "Go to Social Profiles",
        primaryRoute: "social_profile",
        secondaryLabel: "Go to Dashboard",
        secondaryRoute: "dashboard",
    },
    whatsapp: {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
                <path fillRule="evenodd" d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z" clipRule="evenodd" />
            </svg>
        ),
        accentColor: "text-[#25D366]",
        ringColor: "ring-[#25D366]/30",
        bgColor: "bg-[#25D366]/10",
        title: "WhatsApp account submitted",
        subtitle: "Your request has been successfully submitted.",
        description: "It will be processed as soon as possible (within 48 hours). You will receive a notification with a link via email into your workspace.",
        helperText: "You can monitor progress in the \"My Requests\" section.",
        primaryLabel: "Go to My Request",
        primaryRoute: "social_profile",
        secondaryLabel: "Go to Dashboard",
        secondaryRoute: "dashboard",
    },
    instagram: {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
                <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm4.28 10.28a.75.75 0 000-1.06l-3-3a.75.75 0 10-1.06 1.06l1.72 1.72H8.25a.75.75 0 000 1.5h5.69l-1.72 1.72a.75.75 0 101.06 1.06l3-3z" clipRule="evenodd" />
            </svg>
        ),
        accentColor: "text-[#E1306C]",
        ringColor: "ring-[#E1306C]/30",
        bgColor: "bg-[#E1306C]/10",
        title: "Instagram account connected",
        subtitle: "Your Instagram account has been successfully linked to the workspace.",
        description: "You can now receive and reply to Instagram messages directly from your inbox.",
        helperText: "You can manage page settings from account details.",
        primaryLabel: "Go to Social Profiles",
        primaryRoute: "social_profile",
        secondaryLabel: "Go to Dashboard",
        secondaryRoute: "dashboard",
    },
    facebook: {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
                <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm4.28 10.28a.75.75 0 000-1.06l-3-3a.75.75 0 10-1.06 1.06l1.72 1.72H8.25a.75.75 0 000 1.5h5.69l-1.72 1.72a.75.75 0 101.06 1.06l3-3z" clipRule="evenodd" />
            </svg>
        ),
        accentColor: "text-[#1877F2]",
        ringColor: "ring-[#1877F2]/30",
        bgColor: "bg-[#1877F2]/10",
        title: "Facebook account connected",
        subtitle: "Your Facebook page has been successfully linked to the workspace.",
        description: "You can now receive and reply to Facebook messages directly from your inbox.",
        helperText: "You can manage page settings from account details.",
        primaryLabel: "Go to Social Profiles",
        primaryRoute: "social_profile",
        secondaryLabel: "Go to Dashboard",
        secondaryRoute: "dashboard",
    },
};

const DEFAULT_CONFIG = {
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
            <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
        </svg>
    ),
    accentColor: "text-[#BF00FF]",
    ringColor: "ring-[#BF00FF]/30",
    bgColor: "bg-[#BF00FF]/10",
    title: "Account submitted",
    subtitle: "Your account has been successfully submitted.",
    description: "You can now use this account across messages, templates, campaigns, and automations.",
    helperText: "You can update settings later from account details.",
    primaryLabel: "Go to Social Profiles",
    primaryRoute: "social_profile",
    secondaryLabel: "Go to Dashboard",
    secondaryRoute: "dashboard",
};

// ── component ─────────────────────────────────────────────────────────────────

export default function Step4({ accountId, data, translator }) {
    const service = data?.service;
    const cfg = (service && SERVICE_CONFIG[service]) ? SERVICE_CONFIG[service] : DEFAULT_CONFIG;

    return (
        <div className="p-8 flex flex-col items-center text-center max-w-md mx-auto">

            {/* Check + service icon */}
            <div className="relative mb-6">
                {/* outer glow ring */}
                <div className={`w-20 h-20 rounded-full ${cfg.bgColor} ring-1 ${cfg.ringColor} flex items-center justify-center`}>
                    <span className={cfg.accentColor}>{cfg.icon}</span>
                </div>
                {/* green checkmark badge */}
                <span className="absolute -bottom-1 -right-1 flex items-center justify-center w-7 h-7 rounded-full bg-[#0be651] shadow-[0_0_10px_rgba(11,230,81,0.5)]">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-[#0a1a0f]">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                </span>
            </div>

            {/* Title + subtitle */}
            <h2 className="text-xl font-bold text-white leading-snug">
                {cfg.title}
            </h2>
            <p className="mt-2 text-sm text-[#878787]">
                {cfg.subtitle}
            </p>

            {/* Divider */}
            <div className="w-12 h-px bg-white/10 my-5" />

            {/* Description */}
            <p className="text-sm text-white/70 leading-relaxed">
                {cfg.description}
            </p>

            {/* Helper text */}
            <p className="mt-3 text-xs text-white/30 italic">
                {cfg.helperText}
            </p>

            {/* Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full">
                <Link
                    href={route(cfg.primaryRoute)}
                    className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-[#BF00FF] px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                >
                    {cfg.primaryLabel}
                </Link>
                <Link
                    href={route(cfg.secondaryRoute)}
                    className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-6 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
                >
                    {cfg.secondaryLabel}
                </Link>
                {accountId && (
                    <Link
                        href={route("account_view", accountId)}
                        className="text-sm text-[#BF00FF] hover:underline hover:opacity-90 transition mt-1 sm:mt-0"
                    >
                        Open Account Details →
                    </Link>
                )}
            </div>
        </div>
    );
}
