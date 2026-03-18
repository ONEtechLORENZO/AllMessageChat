export const CUSTOM_SMTP_PROVIDER = "custom";

export const SMTP_PROVIDER_OPTIONS = {
    gmail: "Gmail",
    google_workspace: "Google Workspace",
    microsoft_365_outlook: "Microsoft 365 / Outlook",
    sendgrid: "SendGrid",
    mailgun: "Mailgun",
    custom: "Custom SMTP",
};

export const SMTP_PROVIDER_PRESETS = {
    gmail: {
        smtp_host: "smtp.gmail.com",
        smtp_port: "587",
        smtp_encryption: "tls",
    },
    google_workspace: {
        smtp_host: "smtp.gmail.com",
        smtp_port: "587",
        smtp_encryption: "tls",
    },
    microsoft_365_outlook: {
        smtp_host: "smtp.office365.com",
        smtp_port: "587",
        smtp_encryption: "tls",
    },
    sendgrid: {
        smtp_host: "smtp.sendgrid.net",
        smtp_port: "587",
        smtp_encryption: "tls",
    },
    mailgun: {
        smtp_host: "smtp.mailgun.org",
        smtp_port: "587",
        smtp_encryption: "tls",
    },
};

export const SMTP_ENCRYPTION_OPTIONS = {
    tls: "TLS (recommended)",
    ssl: "SSL",
    none: "None",
};

export function inferEmailProvider(data = {}) {
    const host = String(data.smtp_host || "").trim().toLowerCase();
    const port = String(data.smtp_port || "").trim();
    const encryption = String(data.smtp_encryption || "")
        .trim()
        .toLowerCase();

    if (!host && !port && !encryption) {
        return "";
    }

    for (const [provider, preset] of Object.entries(SMTP_PROVIDER_PRESETS)) {
        if (
            host === preset.smtp_host.toLowerCase() &&
            port === String(preset.smtp_port) &&
            encryption === preset.smtp_encryption
        ) {
            return provider;
        }
    }

    return CUSTOM_SMTP_PROVIDER;
}

export function getInitialEmailProvider(data = {}) {
    return data.smtp_provider || inferEmailProvider(data) || "";
}

export function withEmailProviderDefaults(
    data = {},
    provider,
    { preserveExisting = false } = {},
) {
    const next = {
        ...data,
        smtp_provider: provider || "",
    };

    const preset = provider ? SMTP_PROVIDER_PRESETS[provider] : null;
    if (!preset) {
        if (
            provider === CUSTOM_SMTP_PROVIDER &&
            !next.smtp_encryption
        ) {
            return {
                ...next,
                smtp_encryption: "tls",
            };
        }

        return next;
    }

    return {
        ...next,
        smtp_host:
            preserveExisting && next.smtp_host
                ? next.smtp_host
                : preset.smtp_host,
        smtp_port:
            preserveExisting && next.smtp_port
                ? next.smtp_port
                : preset.smtp_port,
        smtp_encryption:
            preserveExisting && next.smtp_encryption
                ? next.smtp_encryption
                : preset.smtp_encryption,
    };
}
