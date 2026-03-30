import React, { useEffect, useMemo, useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import Authenticated from "@/Layouts/Authenticated";
import notie from "notie";
import SharedButtonEditor from "./Internal/SharedButtonEditor";
import SharedPreviewPanel from "./Internal/SharedPreviewPanel";

const FACEBOOK_VARIABLES = {
    first_name: "First Name",
    last_name: "Last Name",
    email: "Email",
    phone_number: "Phone Number",
};

const FACEBOOK_SAMPLE_DATA = {
    first_name: "John",
    last_name: "Doe",
    email: "john@example.com",
    phone_number: "+39 320 000 0000",
};

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

function defaultPayload(type) {
    switch (type) {
        case "media":
            return { type: "media", media_type: "image", media_url: "", body: "" };
        case "card":
            return { type: "card", title: "", subtitle: "", image_url: "", buttons: [] };
        case "carousel":
            return {
                type: "carousel",
                cards: [{ title: "", subtitle: "", image_url: "", buttons: [] }],
            };
        case "quick_replies":
            return {
                type: "quick_replies",
                body: "",
                quick_replies: [{ title: "", payload: "" }],
            };
        case "text":
        default:
            return { type: "text", body: "" };
    }
}

function insertAtPath(payload, path, value) {
    const next = clone(payload);
    const segments = path.split(".");
    let current = next;

    for (let i = 0; i < segments.length - 1; i += 1) {
        current = current[segments[i]];
    }

    const currentValue = String(current[segments[segments.length - 1]] || "");
    const separator = currentValue !== "" && !/\s$/.test(currentValue) ? " " : "";
    current[segments[segments.length - 1]] = `${currentValue}${separator}${value}`;
    return next;
}

function setAtPath(payload, path, value) {
    const next = clone(payload);
    const segments = path.split(".");
    let current = next;

    for (let i = 0; i < segments.length - 1; i += 1) {
        current = current[segments[i]];
    }

    current[segments[segments.length - 1]] = value;
    return next;
}

function extractVariables(payload) {
    const matches = new Set();
    const walk = (value) => {
        if (Array.isArray(value)) {
            value.forEach(walk);
            return;
        }
        if (value && typeof value === "object") {
            Object.values(value).forEach(walk);
            return;
        }
        if (typeof value !== "string") return;

        const regex = /{{\s*([a-zA-Z0-9_]+)\s*}}|{\s*([a-zA-Z0-9_]+)\s*}/g;
        let match;
        while ((match = regex.exec(value)) !== null) {
            matches.add(match[1] || match[2]);
        }
    };

    walk(payload);
    return Array.from(matches);
}

function buildFacebookValidation(payload) {
    const variables = extractVariables(payload);
    const usedVariables = variables.filter(Boolean);
    const unsupportedVariables = usedVariables.filter(
        (variableName) => !Object.prototype.hasOwnProperty.call(FACEBOOK_VARIABLES, variableName),
    );

    const issues = [
        ...unsupportedVariables.map(
            (variableName) =>
                `{${variableName}} is not supported. Use First Name, Last Name, Email, or Phone Number only.`,
        ),
    ];

    return {
        usedVariables: usedVariables.filter((variableName) =>
            Object.prototype.hasOwnProperty.call(FACEBOOK_VARIABLES, variableName),
        ),
        unsupportedVariables,
        issues,
    };
}

function defaultVariableInsertPath(type) {
    switch (type) {
        case "card":
            return "title";
        case "carousel":
            return "cards.0.title";
        case "text":
        case "media":
        case "quick_replies":
        default:
            return "body";
    }
}

export default function InternalTemplateEditor(props) {
    const channel = String(props.channel || props.template?.service || "facebook");
    const isFacebookTemplate = channel === "facebook";
    const isInstagramTemplate = channel === "instagram";
    const isMetaSocialTemplate = isFacebookTemplate || isInstagramTemplate;
    const buildFormFromTemplate = (template) => ({
        template_name: template?.name || "",
        type: template?.type || "text",
        status: template?.status || "draft",
        payload_json:
            template?.payload_json && typeof template.payload_json === "object"
                ? clone(template.payload_json)
                : defaultPayload(template?.type || "text"),
    });

    const [form, setForm] = useState(buildFormFromTemplate(props.template));

    useEffect(() => {
        setForm(buildFormFromTemplate(props.template));
    }, [props.template?.id, props.template?.updated_at]);

    const [processing, setProcessing] = useState(false);
    const [focusedPath, setFocusedPath] = useState("");
    const [errors, setErrors] = useState({});
    const channelTitle = channel === "instagram" ? "Instagram Message Template" : "Facebook Message Template";
    const buttonTypes =
        channel === "instagram"
            ? ["web_url", "postback"]
            : ["web_url", "postback", "phone_number"];

    const facebookValidation = useMemo(
        () => (isFacebookTemplate ? buildFacebookValidation(form.payload_json) : { usedVariables: [], issues: [] }),
        [form.payload_json, isFacebookTemplate],
    );
    const blockingIssues = [
        ...(isFacebookTemplate ? facebookValidation.issues : []),
        ...(isMetaSocialTemplate && form.payload_json?.type === "media" && !form.payload_json?.media_url?.trim()
            ? ["Media templates require a media URL."]
            : []),
    ];
    const availableFields = isMetaSocialTemplate ? FACEBOOK_VARIABLES : props.fields;

    function setPayload(path, value) {
        setForm((current) => ({
            ...current,
            payload_json: setAtPath(current.payload_json, path, value),
        }));
    }

    function changeType(nextType) {
        setForm((current) => ({
            ...current,
            type: nextType,
            payload_json: defaultPayload(nextType),
        }));
        setFocusedPath("");
    }

    function updateButtons(path, index, key, value) {
        setForm((current) => {
            const payload = clone(current.payload_json);
            const buttons = path.split(".").reduce((acc, segment) => acc[segment], payload);
            buttons[index] = { ...buttons[index], [key]: value };
            return { ...current, payload_json: payload };
        });
    }

    function addButton(path) {
        setForm((current) => {
            const payload = clone(current.payload_json);
            const buttons = path.split(".").reduce((acc, segment) => acc[segment], payload);
            if (buttons.length >= 3) return current;
            buttons.push({ type: buttonTypes[0], title: "", url: "", payload: "", phone_number: "" });
            return { ...current, payload_json: payload };
        });
    }

    function removeButton(path, index) {
        setForm((current) => {
            const payload = clone(current.payload_json);
            const buttons = path.split(".").reduce((acc, segment) => acc[segment], payload);
            buttons.splice(index, 1);
            return { ...current, payload_json: payload };
        });
    }

    function addCarouselCard() {
        setForm((current) => ({
            ...current,
            payload_json: {
                ...current.payload_json,
                cards: [
                    ...(current.payload_json.cards || []),
                    { title: "", subtitle: "", image_url: "", buttons: [] },
                ].slice(0, 10),
            },
        }));
    }

    function removeCarouselCard(index) {
        setForm((current) => ({
            ...current,
            payload_json: {
                ...current.payload_json,
                cards: (current.payload_json.cards || []).filter((_, cardIndex) => cardIndex !== index),
            },
        }));
    }

    function addQuickReply() {
        setForm((current) => ({
            ...current,
            payload_json: {
                ...current.payload_json,
                quick_replies: [
                    ...(current.payload_json.quick_replies || []),
                    { title: "", payload: "" },
                ].slice(0, 11),
            },
        }));
    }

    function updateQuickReply(index, key, value) {
        setForm((current) => ({
            ...current,
            payload_json: {
                ...current.payload_json,
                quick_replies: (current.payload_json.quick_replies || []).map((item, replyIndex) =>
                    replyIndex === index ? { ...item, [key]: value } : item,
                ),
            },
        }));
    }

    function removeQuickReply(index) {
        setForm((current) => ({
            ...current,
            payload_json: {
                ...current.payload_json,
                quick_replies: (current.payload_json.quick_replies || []).filter((_, replyIndex) => replyIndex !== index),
            },
        }));
    }

    function insertVariable(fieldName) {
        const targetPath = focusedPath || defaultVariableInsertPath(form.type);
        setForm((current) => ({
            ...current,
            payload_json: insertAtPath(
                current.payload_json,
                targetPath,
                isFacebookTemplate ? `{${fieldName}}` : `{{${fieldName}}}`,
            ),
        }));
        if (!focusedPath) {
            setFocusedPath(targetPath);
        }
    }

    function saveTemplate(statusAction = "save") {
        if (statusAction && typeof statusAction === "object" && typeof statusAction.preventDefault === "function") {
            statusAction.preventDefault();
            statusAction = "save";
        }

        if (statusAction === "activate" && blockingIssues.length) {
            setErrors((current) => ({
                ...current,
                payload_json: blockingIssues.join(" "),
                status_action: "This template cannot be activated until all variable errors are resolved.",
            }));
            return;
        }

        setProcessing(true);
        const nextErrors = { ...errors };
        delete nextErrors.status_action;
        if (!blockingIssues.length) {
            delete nextErrors.payload_json;
        }
        setErrors(nextErrors);

        const nextStatus =
            statusAction === "activate"
                ? "active"
                : statusAction === "draft"
                    ? "draft"
                    : isFacebookTemplate && form.status === "active" && blockingIssues.length
                        ? "draft"
                        : form.status;

        const payloadJson = clone(form.payload_json);
        if (isFacebookTemplate && Object.prototype.hasOwnProperty.call(payloadJson, "fallback_values")) {
            delete payloadJson.fallback_values;
        }

        router.post(route("store_template", [props.template.account_id, props.template.id]), {
            ...form,
            payload_json: payloadJson,
            status: nextStatus,
            status_action: statusAction,
        }, {
            preserveScroll: true,
            preserveState: false,
            onSuccess: () => {
                setErrors({});
                notie.alert({
                    type: "success",
                    text: "Template saved successfully",
                    time: 4,
                });
                router.reload({
                    only: ["template", "channel", "fields", "sampleData"],
                    preserveScroll: true,
                });
            },
            onError: (nextErrors) => setErrors(nextErrors || {}),
            onFinish: () => setProcessing(false),
        });
    }

    return (
        <Authenticated auth={props.auth} errors={props.errors} navigationMenu={props.menuBar}>
            <Head title={props.template?.name || "Template"} />

            <div className="mx-auto max-w-7xl px-4 pb-8 pt-2 sm:px-6 lg:px-8">
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_380px]">
                    <div className="space-y-6">
                        <div className="rounded-[28px] border border-white/10 bg-[#140816]/75 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.35)] ring-1 ring-white/5 backdrop-blur-3xl">
                            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-5">
                                <div>
                                    <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-fuchsia-200">
                                        {channel}
                                    </div>
                                    <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
                                        {channelTitle}
                                    </h1>
                                    <p className="mt-2 max-w-3xl text-sm leading-6 text-white/60">
                                        {isFacebookTemplate
                                            ? "Manage your reusable Facebook message template for campaigns."
                                            : isInstagramTemplate
                                                ? "Manage your reusable Instagram message template for campaigns."
                                                : "Create and manage reusable messages for campaigns and automations."}
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    <Link
                                        href={route("account_templates", { account_id: props.template.account_id })}
                                        className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white/80 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
                                    >
                                        Back
                                    </Link>
                                    <button
                                        type="button"
                                        disabled={processing}
                                        onClick={() => saveTemplate("save")}
                                        className="inline-flex items-center rounded-full bg-fuchsia-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-fuchsia-500 disabled:opacity-60"
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>

                            <div className="mt-6 grid gap-6">
                                {blockingIssues.length > 0 ? (
                                    <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-4 text-sm text-amber-50">
                                        <div className="font-semibold text-white">Please fix the following issues:</div>
                                        <ul className="mt-2 list-disc space-y-1 pl-5">
                                            {blockingIssues.map((issue) => (
                                                <li key={issue}>{issue}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : null}

                                {!isMetaSocialTemplate ? (
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <label className="block md:col-span-2">
                                            <span className="mb-2 block text-sm font-medium text-white/70">Template name</span>
                                            <input
                                                type="text"
                                                value={form.template_name}
                                                onChange={(event) => setForm((current) => ({ ...current, template_name: event.target.value }))}
                                                placeholder="e.g. Welcome message, Promo April"
                                                className="w-full rounded-xl border border-white/10 bg-[#171717] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-fuchsia-500/60 focus:outline-none"
                                            />
                                        </label>

                                        <label className="block">
                                            <span className="mb-2 block text-sm font-medium text-white/70">Message format</span>
                                            <select
                                                value={form.type}
                                                onChange={(event) => changeType(event.target.value)}
                                                className="w-full rounded-xl border border-white/10 bg-[#171717] px-4 py-3 text-sm text-white focus:border-fuchsia-500/60 focus:outline-none"
                                            >
                                                <option value="text">Text</option>
                                                <option value="media">Media</option>
                                                <option value="card">Card</option>
                                                <option value="carousel">Carousel</option>
                                                {!isInstagramTemplate && (
                                                    <option value="quick_replies">Quick replies</option>
                                                )}
                                            </select>
                                            <p className="mt-2 text-sm text-white/50">
                                                Defines how the message will be structured when sent.
                                            </p>
                                        </label>
                                    </div>
                                ) : null}

                                {isMetaSocialTemplate ? (
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="rounded-xl border border-white/10 bg-[#171717] px-4 py-3">
                                            <div className="mb-2 block text-sm font-medium text-white/70">Status</div>
                                            <div className="text-sm font-semibold text-white">
                                                {form.status === "active" ? "Active" : "Draft"}
                                            </div>
                                        </div>
                                        <div className="flex items-end">
                                            <button
                                                type="button"
                                                onClick={() => saveTemplate(form.status === "active" ? "draft" : "activate")}
                                                className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
                                            >
                                                {form.status === "active" ? "Move to Draft" : "Activate Template"}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <label className="block">
                                            <span className="mb-2 block text-sm font-medium text-white/70">Template status</span>
                                            <select
                                                value={form.status}
                                                onChange={(event) =>
                                                    setForm((current) => ({
                                                        ...current,
                                                        status: event.target.value,
                                                    }))
                                                }
                                                className="w-full rounded-xl border border-white/10 bg-[#171717] px-4 py-3 text-sm text-white focus:border-fuchsia-500/60 focus:outline-none"
                                            >
                                                <option value="draft">Draft</option>
                                                <option value="active">Active</option>
                                                <option value="archived">Archived</option>
                                            </select>
                                            <p className="mt-2 text-sm text-white/50">
                                                Only active templates can be used in campaigns.
                                            </p>
                                        </label>

                                        <div className="rounded-xl border border-white/10 bg-[#171717] px-4 py-3 text-sm text-white">
                                            Available for campaigns
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-6">
                                {form.type === "text" ? (
                                    <label className="block">
                                        <span className="mb-2 block text-sm font-medium text-white/70">Message content</span>
                                        <textarea
                                            value={form.payload_json.body || ""}
                                            onFocus={() => setFocusedPath("body")}
                                            onChange={(event) => setPayload("body", event.target.value)}
                                            rows={6}
                                            placeholder="Hi {first_name}, welcome to our service 👋"
                                            className="w-full rounded-2xl border border-white/10 bg-[#12041f] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-fuchsia-500/60 focus:outline-none"
                                        />
                                        <p className="mt-2 text-sm text-white/50">
                                            Use variables like {"{first_name}"} to personalize messages.
                                        </p>
                                    </label>
                                ) : null}

                                {form.type === "media" ? (
                                    <div className="grid gap-4">
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <label className="block">
                                                <span className="mb-2 block text-sm font-medium text-white/70">Media Type</span>
                                                <select
                                                    value={form.payload_json.media_type || "image"}
                                                    onChange={(event) => setPayload("media_type", event.target.value)}
                                                    className="w-full rounded-xl border border-white/10 bg-[#171717] px-4 py-3 text-sm text-white focus:border-fuchsia-500/60 focus:outline-none"
                                                >
                                                    <option value="image">Image</option>
                                                    <option value="video">Video</option>
                                                </select>
                                            </label>
                                            <label className="block">
                                                <span className="mb-2 block text-sm font-medium text-white/70">Media URL</span>
                                                <input
                                                    type="url"
                                                    value={form.payload_json.media_url || ""}
                                                    onChange={(event) => setPayload("media_url", event.target.value)}
                                                    placeholder="https://example.com/media.mp4"
                                                    className="w-full rounded-xl border border-white/10 bg-[#171717] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-fuchsia-500/60 focus:outline-none"
                                                />
                                            </label>
                                        </div>

                                        <label className="block">
                                            <span className="mb-2 block text-sm font-medium text-white/70">Message content</span>
                                            <textarea
                                                value={form.payload_json.body || ""}
                                                onFocus={() => setFocusedPath("body")}
                                                onChange={(event) => setPayload("body", event.target.value)}
                                                rows={4}
                                                placeholder="Hi {first_name}, welcome to our service 👋"
                                                className="w-full rounded-2xl border border-white/10 bg-[#12041f] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-fuchsia-500/60 focus:outline-none"
                                            />
                                            <p className="mt-2 text-sm text-white/50">
                                                Use variables like {"{first_name}"} to personalize messages.
                                            </p>
                                        </label>
                                    </div>
                                ) : null}

                                {form.type === "card" ? (
                                    <div className="space-y-5">
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <label className="block">
                                                <span className="mb-2 block text-sm font-medium text-white/70">Title</span>
                                                <input
                                                    type="text"
                                                    value={form.payload_json.title || ""}
                                                    onFocus={() => setFocusedPath("title")}
                                                    onChange={(event) => setPayload("title", event.target.value)}
                                                    className="w-full rounded-xl border border-white/10 bg-[#171717] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-fuchsia-500/60 focus:outline-none"
                                                />
                                            </label>
                                            <label className="block">
                                                <span className="mb-2 block text-sm font-medium text-white/70">Subtitle</span>
                                                <input
                                                    type="text"
                                                    value={form.payload_json.subtitle || ""}
                                                    onFocus={() => setFocusedPath("subtitle")}
                                                    onChange={(event) => setPayload("subtitle", event.target.value)}
                                                    className="w-full rounded-xl border border-white/10 bg-[#171717] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-fuchsia-500/60 focus:outline-none"
                                                />
                                            </label>
                                        </div>

                                        <label className="block">
                                            <span className="mb-2 block text-sm font-medium text-white/70">Image URL</span>
                                            <input
                                                type="url"
                                                value={form.payload_json.image_url || ""}
                                                onChange={(event) => setPayload("image_url", event.target.value)}
                                                className="w-full rounded-xl border border-white/10 bg-[#171717] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-fuchsia-500/60 focus:outline-none"
                                            />
                                        </label>

                                        <SharedButtonEditor
                                            channel={channel}
                                            buttons={form.payload_json.buttons || []}
                                            allowedTypes={buttonTypes}
                                            onAdd={() => addButton("buttons")}
                                            onRemove={(index) => removeButton("buttons", index)}
                                            onChange={(index, key, value) => updateButtons("buttons", index, key, value)}
                                        />
                                    </div>
                                ) : null}

                                {form.type === "carousel" ? (
                                    <div className="space-y-5">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="text-base font-medium text-white">Cards</div>
                                                <div className="text-sm text-white/55">Add up to 10 cards to the carousel.</div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={addCarouselCard}
                                                className="inline-flex items-center rounded-full bg-fuchsia-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-fuchsia-500"
                                            >
                                                Add card
                                            </button>
                                        </div>

                                        {(form.payload_json.cards || []).map((card, cardIndex) => (
                                            <div key={`card-${cardIndex}`} className="rounded-2xl border border-white/10 bg-[#12041f] p-5">
                                                <div className="grid gap-4 md:grid-cols-2">
                                                    <label className="block">
                                                        <span className="mb-2 block text-sm font-medium text-white/70">Title</span>
                                                        <input
                                                            type="text"
                                                            value={card.title || ""}
                                                            onFocus={() => setFocusedPath(`cards.${cardIndex}.title`)}
                                                            onChange={(event) => setPayload(`cards.${cardIndex}.title`, event.target.value)}
                                                            className="w-full rounded-xl border border-white/10 bg-[#171717] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-fuchsia-500/60 focus:outline-none"
                                                        />
                                                    </label>
                                                    <label className="block">
                                                        <span className="mb-2 block text-sm font-medium text-white/70">Subtitle</span>
                                                        <input
                                                            type="text"
                                                            value={card.subtitle || ""}
                                                            onFocus={() => setFocusedPath(`cards.${cardIndex}.subtitle`)}
                                                            onChange={(event) => setPayload(`cards.${cardIndex}.subtitle`, event.target.value)}
                                                            className="w-full rounded-xl border border-white/10 bg-[#171717] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-fuchsia-500/60 focus:outline-none"
                                                        />
                                                    </label>
                                                </div>

                                                <label className="mt-4 block">
                                                    <span className="mb-2 block text-sm font-medium text-white/70">Image URL</span>
                                                    <input
                                                        type="url"
                                                        value={card.image_url || ""}
                                                        onChange={(event) => setPayload(`cards.${cardIndex}.image_url`, event.target.value)}
                                                        className="w-full rounded-xl border border-white/10 bg-[#171717] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-fuchsia-500/60 focus:outline-none"
                                                    />
                                                </label>

                                                <div className="mt-4">
                                                    <SharedButtonEditor
                                                        channel={channel}
                                                        buttons={card.buttons || []}
                                                        allowedTypes={buttonTypes}
                                                        onAdd={() => addButton(`cards.${cardIndex}.buttons`)}
                                                        onRemove={(index) => removeButton(`cards.${cardIndex}.buttons`, index)}
                                                        onChange={(index, key, value) =>
                                                            updateButtons(`cards.${cardIndex}.buttons`, index, key, value)
                                                        }
                                                    />
                                                </div>

                                                <div className="mt-4 flex justify-end">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeCarouselCard(cardIndex)}
                                                        className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white/75 transition hover:bg-white/[0.08]"
                                                    >
                                                        Remove card
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : null}

                                {form.type === "quick_replies" ? (
                                    <div className="space-y-5">
                                        <label className="block">
                                            <span className="mb-2 block text-sm font-medium text-white/70">Message content</span>
                                            <textarea
                                                value={form.payload_json.body || ""}
                                                onFocus={() => setFocusedPath("body")}
                                                onChange={(event) => setPayload("body", event.target.value)}
                                                rows={5}
                                                placeholder="Hi {first_name}, welcome to our service 👋"
                                                className="w-full rounded-2xl border border-white/10 bg-[#12041f] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-fuchsia-500/60 focus:outline-none"
                                            />
                                            <p className="mt-2 text-sm text-white/50">
                                                Use variables like {"{first_name}"} to personalize messages.
                                            </p>
                                        </label>

                                        <div className="flex items-center justify-between">
                                            <div className="text-base font-medium text-white">Quick replies</div>
                                            <button
                                                type="button"
                                                onClick={addQuickReply}
                                                className="inline-flex items-center rounded-full bg-fuchsia-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-fuchsia-500"
                                            >
                                                Add reply
                                            </button>
                                        </div>

                                        {(form.payload_json.quick_replies || []).map((quickReply, index) => (
                                            <div key={`reply-${index}`} className="grid gap-4 rounded-2xl border border-white/10 bg-[#12041f] p-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                                                <input
                                                    type="text"
                                                    value={quickReply.title || ""}
                                                    onChange={(event) => updateQuickReply(index, "title", event.target.value)}
                                                    placeholder="Reply label"
                                                    className="w-full rounded-xl border border-white/10 bg-[#171717] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-fuchsia-500/60 focus:outline-none"
                                                />
                                                <input
                                                    type="text"
                                                    value={quickReply.payload || ""}
                                                    onChange={(event) => updateQuickReply(index, "payload", event.target.value)}
                                                    placeholder="Payload value"
                                                    className="w-full rounded-xl border border-white/10 bg-[#171717] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-fuchsia-500/60 focus:outline-none"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeQuickReply(index)}
                                                    className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white/75 transition hover:bg-white/[0.08]"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : null}

                                {isMetaSocialTemplate ? (
                                    <div className="rounded-2xl border border-white/10 bg-[#12041f] p-5">
                                        <div className="text-base font-semibold text-white">Variables</div>
                                        <p className="mt-2 text-sm leading-6 text-white/55">
                                            Click a variable to insert it into the message.
                                        </p>
                                        <div className="mt-4 flex flex-wrap gap-2.5">
                                            {Object.entries(availableFields || {}).map(([fieldName, fieldLabel]) => (
                                                <button
                                                    key={fieldName}
                                                    type="button"
                                                    onClick={() => insertVariable(fieldName)}
                                                    className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/85 transition hover:bg-white/[0.08]"
                                                >
                                                    {fieldLabel}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ) : null}
                                </div>

                                {errors.payload_json ? (
                                    <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                                        {errors.payload_json}
                                    </div>
                                ) : null}
                                {errors.status_action ? (
                                    <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                                        {errors.status_action}
                                    </div>
                                ) : null}
                            </div>
                        </div>

                    </div>

                    <div className="space-y-6">
                        <SharedPreviewPanel
                            channel={channel}
                            payload={form.payload_json}
                            sampleData={isFacebookTemplate ? FACEBOOK_SAMPLE_DATA : props.sampleData}
                        />
                    </div>
                </div>
            </div>
        </Authenticated>
    );
}
