import React, { useMemo } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import Authenticated from "@/Layouts/Authenticated";
import InputError from "@/Components/Forms/InputError";
import notie from "notie";
import {
    ChevronLeftIcon,
    EnvelopeIcon,
    EyeIcon,
} from "@heroicons/react/24/outline";

function resolvePlaceholderValue(sampleData, path) {
    return path.split(".").reduce((value, segment) => {
        if (value === null || value === undefined) {
            return undefined;
        }

        return value[segment];
    }, sampleData);
}

function substitutePlaceholders(content, sampleData) {
    if (!content) {
        return "";
    }

    return content.replace(/{{\s*([\w.]+)\s*}}/g, (match, key) => {
        const value = resolvePlaceholderValue(sampleData, key);

        if (value === undefined || value === null) {
            return match;
        }

        return String(value);
    });
}

function buildPreviewDocument(html) {
    return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <base target="_blank" />
    <style>
      :root {
        color-scheme: light;
      }
      body {
        margin: 0;
        padding: 24px;
        background: #f3f4f6;
        color: #111827;
        font-family: Arial, Helvetica, sans-serif;
      }
      .email-shell {
        max-width: 640px;
        margin: 0 auto;
        background: #ffffff;
        border-radius: 18px;
        border: 1px solid #e5e7eb;
        overflow: hidden;
        box-shadow: 0 24px 60px rgba(15, 23, 42, 0.12);
      }
      .email-shell__body {
        padding: 28px;
      }
      img {
        max-width: 100%;
        height: auto;
      }
    </style>
  </head>
  <body>
    <div class="email-shell">
      <div class="email-shell__body">${html}</div>
    </div>
  </body>
</html>`;
}

function parseSampleData(rawSampleData) {
    if (!rawSampleData || !rawSampleData.trim()) {
        return {
            values: {},
            error: "",
        };
    }

    try {
        const parsed = JSON.parse(rawSampleData);

        if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") {
            return {
                values: {},
                error: "Sample data must be a JSON object.",
            };
        }

        return {
            values: parsed,
            error: "",
        };
    } catch (error) {
        return {
            values: {},
            error: "Sample data is not valid JSON. Preview is showing raw placeholders.",
        };
    }
}

export default function EmailTemplateEditor(props) {
    const { data, setData, post, processing, errors } = useForm({
        template_name: props.template?.name ?? "",
        subject: props.template?.email_subject ?? "",
        html_body: props.template?.html_body ?? "",
        text_body: props.template?.text_body ?? "",
        sample_data: props.template?.sample_data
            ? JSON.stringify(props.template.sample_data, null, 2)
            : "",
    });

    const parsedSampleData = useMemo(
        () => parseSampleData(data.sample_data),
        [data.sample_data],
    );
    const previewHtml = useMemo(
        () => substitutePlaceholders(data.html_body, parsedSampleData.values),
        [data.html_body, parsedSampleData.values],
    );
    const previewText = useMemo(
        () => substitutePlaceholders(data.text_body, parsedSampleData.values),
        [data.text_body, parsedSampleData.values],
    );
    const previewDocument = useMemo(() => {
        if (!previewHtml.trim()) {
            return "";
        }

        try {
            return buildPreviewDocument(previewHtml);
        } catch (error) {
            return "";
        }
    }, [previewHtml]);

    function handleChange(event) {
        const { name, value } = event.target;
        setData(name, value);
    }

    function saveTemplate(event) {
        event.preventDefault();

        post(route("store_template", [props.template.account_id, props.template.id]), {
            preserveScroll: true,
            onSuccess: () => {
                notie.alert({
                    type: "success",
                    text: "Email template saved successfully",
                    time: 5,
                });
            },
            onError: () => {
                notie.alert({
                    type: "warning",
                    text: "Please fix the template form errors.",
                    time: 5,
                });
            },
        });
    }

    return (
        <Authenticated
            auth={props.auth}
            errors={props.errors}
            navigationMenu={props.menuBar}
            current_page="Templates"
            hidePageTitle
        >
            <Head title={data.template_name || "Email Template"} />

            <div className="dashboard-page relative pt-4 pb-8">
                <div className="relative z-10 mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="space-y-3">
                            <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-fuchsia-200">
                                Email Template Editor
                            </div>
                            <div>
                                <h1 className="one-tech-special text-4xl font-black tracking-tight text-white sm:text-5xl">
                                    {data.template_name || "Untitled email template"}
                                </h1>
                                <p className="mt-2 max-w-3xl text-sm leading-7 text-white/60">
                                    Keep the email flow simple: define the subject,
                                    write the HTML body, optionally add plain text
                                    and sample data, then save the template for
                                    future use across chat, campaigns, automation,
                                    and API sending.
                                </p>
                            </div>
                        </div>

                        <Link
                            href={route("account_templates", {
                                account_id: props.template.account_id,
                            })}
                            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
                        >
                            <ChevronLeftIcon className="h-4 w-4" />
                            Back
                        </Link>
                    </div>

                    <form onSubmit={saveTemplate} className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_420px]">
                        <EditorCard>
                            <div className="space-y-6">
                                <section className="space-y-4">
                                    <div className="flex items-center gap-2 text-white">
                                        <EnvelopeIcon className="h-5 w-5 text-fuchsia-300" />
                                        <h2 className="text-lg font-semibold">
                                            Template Details
                                        </h2>
                                    </div>

                                    <div className="grid gap-5">
                                        <div>
                                            <label
                                                htmlFor="template_name"
                                                className="mb-2 block text-sm font-medium text-white/80"
                                            >
                                                Template Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                id="template_name"
                                                name="template_name"
                                                value={data.template_name}
                                                onChange={handleChange}
                                                className="w-full rounded-2xl border border-white/10 bg-[#171717] px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-fuchsia-500/60 focus:outline-none"
                                                placeholder="Internal template name"
                                            />
                                            <InputError message={errors.template_name} />
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="subject"
                                                className="mb-2 block text-sm font-medium text-white/80"
                                            >
                                                Subject <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                id="subject"
                                                name="subject"
                                                value={data.subject}
                                                onChange={handleChange}
                                                className="w-full rounded-2xl border border-white/10 bg-[#171717] px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-fuchsia-500/60 focus:outline-none"
                                                placeholder="Subject line"
                                            />
                                            <InputError message={errors.subject} />
                                        </div>
                                    </div>
                                </section>

                                <section className="space-y-4 border-t border-white/10 pt-6">
                                    <div className="flex items-center gap-2 text-white">
                                        <EyeIcon className="h-5 w-5 text-fuchsia-300" />
                                        <h2 className="text-lg font-semibold">
                                            Content
                                        </h2>
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="html_body"
                                            className="mb-2 block text-sm font-medium text-white/80"
                                        >
                                            HTML Body <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            id="html_body"
                                            name="html_body"
                                            value={data.html_body}
                                            onChange={handleChange}
                                            rows={16}
                                            className="w-full rounded-2xl border border-white/10 bg-[#12041f] px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-fuchsia-500/60 focus:outline-none"
                                            placeholder={"<h1>Hello {{first_name}}</h1>\n<p>Welcome to {{company}}.</p>"}
                                        />
                                        <p className="mt-2 text-xs text-white/45">
                                            Use simple placeholders like
                                            {" "}
                                            <code>{"{{first_name}}"}</code>,
                                            {" "}
                                            <code>{"{{company}}"}</code>, or
                                            {" "}
                                            <code>{"{{email}}"}</code>.
                                        </p>
                                        <InputError message={errors.html_body} />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="text_body"
                                            className="mb-2 block text-sm font-medium text-white/80"
                                        >
                                            Plain Text Body
                                        </label>
                                        <textarea
                                            id="text_body"
                                            name="text_body"
                                            value={data.text_body}
                                            onChange={handleChange}
                                            rows={8}
                                            className="w-full rounded-2xl border border-white/10 bg-[#12041f] px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-fuchsia-500/60 focus:outline-none"
                                            placeholder={"Hello {{first_name}},\nWelcome to {{company}}."}
                                        />
                                        <p className="mt-2 text-xs text-white/45">
                                            Optional, but recommended for clients
                                            that prefer plain text.
                                        </p>
                                        <InputError message={errors.text_body} />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="sample_data"
                                            className="mb-2 block text-sm font-medium text-white/80"
                                        >
                                            Variables / Sample Data
                                        </label>
                                        <textarea
                                            id="sample_data"
                                            name="sample_data"
                                            value={data.sample_data}
                                            onChange={handleChange}
                                            rows={8}
                                            className="w-full rounded-2xl border border-white/10 bg-[#12041f] px-4 py-3 font-mono text-sm text-white placeholder:text-white/35 focus:border-fuchsia-500/60 focus:outline-none"
                                            placeholder={'{\n  "first_name": "Maria",\n  "company": "Aessefin",\n  "email": "maria@example.com"\n}'}
                                        />
                                        <p className="mt-2 text-xs text-white/45">
                                            Optional JSON object used only for preview
                                            substitution in this MVP.
                                        </p>
                                        <InputError message={errors.sample_data} />
                                    </div>
                                </section>

                                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-6">
                                    <Link
                                        href={route("account_templates", {
                                            account_id: props.template.account_id,
                                        })}
                                        className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
                                    >
                                        Back
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex items-center justify-center rounded-2xl bg-fuchsia-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-fuchsia-500 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        Save Template
                                    </button>
                                </div>
                            </div>
                        </EditorCard>

                        <EditorCard className="h-fit">
                            <div className="space-y-5">
                                <div>
                                    <div className="text-sm font-semibold uppercase tracking-[0.22em] text-fuchsia-200/80">
                                        Preview
                                    </div>
                                    <h2 className="mt-2 text-3xl font-semibold text-white">
                                        Email Preview
                                    </h2>
                                    <p className="mt-2 text-sm leading-6 text-white/55">
                                        Preview renders the HTML body with sample
                                        placeholders substituted when valid JSON
                                        data is provided.
                                    </p>
                                </div>

                                {parsedSampleData.error ? (
                                    <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
                                        {parsedSampleData.error}
                                    </div>
                                ) : null}

                                <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#0f0917]">
                                    <div className="border-b border-white/10 bg-white/[0.03] px-5 py-4">
                                        <div className="text-xs uppercase tracking-[0.22em] text-white/35">
                                            Subject
                                        </div>
                                        <div className="mt-2 text-lg font-semibold text-white">
                                            {data.subject || "No subject"}
                                        </div>
                                    </div>

                                    <div className="bg-[#e5e7eb] p-4">
                                        {previewDocument ? (
                                            <iframe
                                                title="Email HTML preview"
                                                srcDoc={previewDocument}
                                                className="h-[520px] w-full rounded-3xl border-0 bg-white"
                                            />
                                        ) : (
                                            <div className="flex h-[520px] items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white px-6 text-center text-sm text-slate-500">
                                                Add HTML content to render the email
                                                preview.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="rounded-[28px] border border-white/10 bg-[#0f0917] p-5">
                                    <div className="text-xs uppercase tracking-[0.22em] text-white/35">
                                        Plain Text Preview
                                    </div>
                                    <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-4">
                                        <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-6 text-white/75">
                                            {previewText || "No plain text body provided."}
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        </EditorCard>
                    </form>
                </div>
            </div>
        </Authenticated>
    );
}

function EditorCard({ className = "", children }) {
    return (
        <div
            className={[
                "rounded-[32px] border border-white/10 bg-[#170024]/80 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.38)] backdrop-blur-sm",
                className,
            ].join(" ")}
        >
            {children}
        </div>
    );
}
