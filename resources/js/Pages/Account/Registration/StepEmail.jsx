import { useMemo, useState } from "react";
import axios from "axios";
import nProgress from "nprogress";
import notie from "notie";
import {
    CUSTOM_SMTP_PROVIDER,
    SMTP_ENCRYPTION_OPTIONS,
    SMTP_PROVIDER_OPTIONS,
    getInitialEmailProvider,
} from "./emailProviderPresets";

export default function StepEmail({ data, formHandler, setCurrentPage, setAccountid, translator }) {
    const [saving, setSaving] = useState(false);
    const selectedProvider = useMemo(
        () => getInitialEmailProvider(data),
        [data],
    );
    const isCustomSmtp = selectedProvider === CUSTOM_SMTP_PROVIDER;

    function validate() {
        if (!data.company_name) {
            notie.alert({ type: "warning", text: "Account name is required", time: 4 });
            return false;
        }
        if (!selectedProvider) {
            notie.alert({ type: "warning", text: "Provider is required", time: 4 });
            return false;
        }
        if (!data.email) {
            notie.alert({ type: "warning", text: "Sender email is required", time: 4 });
            return false;
        }
        // Basic e-mail format check
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            notie.alert({ type: "warning", text: "Please enter a valid email address", time: 4 });
            return false;
        }
        if (!data.service_token) {
            notie.alert({ type: "warning", text: "SMTP password or API key is required", time: 4 });
            return false;
        }
        if (isCustomSmtp && (!data.smtp_host || !data.smtp_port || !data.smtp_encryption)) {
            notie.alert({ type: "warning", text: "Custom SMTP requires host, port, and encryption", time: 4 });
            return false;
        }
        return true;
    }

    function save() {
        if (!validate()) return;

        setSaving(true);
        nProgress.start(0.5);
        nProgress.inc(0.2);

        const payload = {
            service:          "email",
            company_name:     data.company_name  || "",
            display_name:     data.display_name  || "",
            email:            data.email         || "",
            smtp_provider:    selectedProvider   || "",
            smtp_host:        data.smtp_host      || "",
            smtp_port:        data.smtp_port      || "587",
            smtp_encryption:  data.smtp_encryption || "tls",
            service_token:    data.service_token  || "",
        };

        axios.post(route("store_account_registration"), payload)
            .then((response) => {
                nProgress.done(true);
                setSaving(false);
                if (response.data?.account_id) {
                    setAccountid(response.data.account_id);
                    setCurrentPage(4); // Success / confirmation page
                }
            })
            .catch(() => {
                nProgress.done(true);
                setSaving(false);
                notie.alert({ type: "error", text: "Failed to save. Please check your details.", time: 5 });
            });
    }

    return (
        <div className="p-6 space-y-6">
            <div>
                <h2 className="text-lg font-bold text-white">
                    {translator?.["Email Account Setup"] ?? "Email Account Setup"}
                </h2>
                <p className="mt-1 text-sm text-[#878787]">
                    {translator?.["Configure your outbound email settings"] ??
                        "Configure your outbound email settings to start sending and receiving messages."}
                </p>
            </div>

            {/* Account name */}
            <Field label="Account Name" required>
                <input
                    name="company_name"
                    value={data.company_name || ""}
                    onChange={formHandler}
                    placeholder="e.g. Sales Team"
                    className={inputCls}
                />
            </Field>

            {/* Sender display name */}
            <Field label="Sender Name">
                <input
                    name="display_name"
                    value={data.display_name || ""}
                    onChange={formHandler}
                    placeholder="e.g. Acme Support"
                    className={inputCls}
                />
            </Field>

            {/* Sender email address */}
            <Field label="Sender Email" required>
                <input
                    type="email"
                    name="email"
                    value={data.email || ""}
                    onChange={formHandler}
                    placeholder="you@example.com"
                    className={inputCls}
                />
            </Field>

            <hr className="border-white/10" />
            <p className="text-xs font-semibold uppercase tracking-widest text-white/40">
                SMTP Configuration
            </p>

            <Field label="Provider" required>
                <select
                    name="smtp_provider"
                    value={selectedProvider}
                    onChange={formHandler}
                    className={inputCls}
                >
                    <option value="" className="bg-[#0F0B1A]">
                        Select provider
                    </option>
                    {Object.entries(SMTP_PROVIDER_OPTIONS).map(([value, label]) => (
                        <option key={value} value={value} className="bg-[#0F0B1A]">
                            {label}
                        </option>
                    ))}
                </select>
                <p className="mt-2 text-xs text-[#878787]">
                    Preset providers auto-fill SMTP host, port, and encryption. Choose Custom SMTP for manual setup.
                </p>
            </Field>

            {/* SMTP Host */}
            <Field label="SMTP Host" required={isCustomSmtp}>
                <input
                    name="smtp_host"
                    value={data.smtp_host || ""}
                    onChange={formHandler}
                    placeholder="smtp.example.com"
                    className={inputCls}
                />
            </Field>

            {/* SMTP Port + Encryption (inline) */}
            <div className="grid grid-cols-2 gap-4">
                <Field label="SMTP Port" required={isCustomSmtp}>
                    <input
                        name="smtp_port"
                        value={data.smtp_port || "587"}
                        onChange={formHandler}
                        placeholder="587"
                        className={inputCls}
                    />
                </Field>
                <Field label="Encryption" required={isCustomSmtp}>
                    <select
                        name="smtp_encryption"
                        value={data.smtp_encryption || "tls"}
                        onChange={formHandler}
                        className={inputCls}
                    >
                        {Object.entries(SMTP_ENCRYPTION_OPTIONS).map(([val, label]) => (
                            <option key={val} value={val} className="bg-[#0F0B1A]">
                                {label}
                            </option>
                        ))}
                    </select>
                </Field>
            </div>

            {/* SMTP Password / API Key */}
            <Field label="SMTP Password / API Key" required>
                <input
                    type="password"
                    name="service_token"
                    value={data.service_token || ""}
                    onChange={formHandler}
                    placeholder="••••••••"
                    className={inputCls}
                    autoComplete="new-password"
                />
            </Field>

            {/* Actions */}
            <div className="flex justify-between pt-2">
                <button
                    type="button"
                    onClick={() => setCurrentPage(1)}
                    className="btn btn-light text-white/70 hover:text-white"
                >
                    {translator?.["Back"] ?? "Back"}
                </button>
                <button
                    type="button"
                    onClick={save}
                    disabled={saving}
                    className="inline-flex items-center justify-center rounded-full bg-[#BF00FF] px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                >
                    {saving
                        ? (translator?.["Saving..."] ?? "Saving…")
                        : (translator?.["Save"] ?? "Save")}
                </button>
            </div>
        </div>
    );
}

// ── small helpers ────────────────────────────────────────────────────────────

const inputCls =
    "mt-1 block w-full rounded-md border border-white/20 bg-[#0F0B1A] px-3 py-2 text-white placeholder:text-[#6c6c6c] focus:outline-none focus:ring-2 focus:ring-[#BF00FF] focus:border-[#BF00FF] sm:text-sm";

function Field({ label, required = false, children }) {
    return (
        <div>
            <label className="block text-sm font-medium text-[#878787]">
                {label}
                {required && <span className="ml-1 text-red-500">*</span>}
            </label>
            {children}
        </div>
    );
}
