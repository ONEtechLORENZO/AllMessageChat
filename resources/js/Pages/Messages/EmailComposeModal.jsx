import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { EnvelopeIcon } from "@heroicons/react/24/solid";
import Axios from "axios";

import SearchTemplate from "./SearchTemplate";
import { AttachIcon } from "../icons";

function EmailComposeModal(props) {
    const [templates, setTemplates] = useState(props.templates || []);
    const [products, setProducts] = useState(props.products || []);
    const [interactiveMessages, setInteractiveMessages] = useState(
        props.interactiveMessages || [],
    );

    function searchTemplates(key) {
        const templateList = [];

        (props.templates || []).forEach((template) => {
            if (String(template.name || "").indexOf(key) !== -1) {
                templateList.push(template);
            }
        });

        setTemplates(templateList);
    }

    function searchInteractiveMessages(key) {
        const templateList = [];

        (props.interactiveMessages || []).forEach((interactiveMessage) => {
            if (String(interactiveMessage.name || "").indexOf(key) !== -1) {
                templateList.push(interactiveMessage);
            }
        });

        setInteractiveMessages(templateList);
    }

    function searchProduct(key) {
        const url = route("search_product", { search: key });

        Axios.get(url).then((response) => {
            if (response.data.status === true) {
                setProducts(response.data.products);
            }
        });
    }

    if (!props.open) {
        return null;
    }

    const attachedFileName =
        props.data?.attachment instanceof File
            ? props.data.attachment.name
            : props.data?.attachment || "";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#08030d]/75 px-4 py-6 backdrop-blur-sm">
            <div className="relative w-full max-w-5xl overflow-hidden rounded-[32px] bg-[radial-gradient(circle_at_0%_0%,rgba(124,58,237,0.32),rgba(20,8,22,0.92)_55%,rgba(8,4,16,0.98)_100%)] text-white shadow-[0_28px_100px_rgba(0,0,0,0.55)]">
                <button
                    type="button"
                    onClick={props.onClose}
                    className="absolute right-6 top-6 z-20 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-violet-600/90 text-white shadow-[0_16px_34px_rgba(124,58,237,0.25)] transition hover:bg-violet-600"
                    aria-label="Close"
                >
                    <XMarkIcon className="h-5 w-5" />
                </button>

                <div className="grid max-h-[92vh] grid-cols-1 overflow-hidden md:grid-cols-[360px_1fr]">
                    <div className="relative bg-[linear-gradient(180deg,rgba(124,58,237,0.98),rgba(168,85,247,0.92))] px-8 py-10 md:px-10 md:py-12">
                        <div className="pointer-events-none absolute inset-0 overflow-hidden">
                            <svg
                                viewBox="0 0 240 240"
                                className="absolute -right-16 top-10 h-[260px] w-[260px] opacity-[0.16]"
                                fill="none"
                            >
                                <path
                                    d="M40 78c0-10 8-18 18-18h124c10 0 18 8 18 18v86c0 10-8 18-18 18H58c-10 0-18-8-18-18V78Z"
                                    stroke="white"
                                    strokeWidth="10"
                                    opacity="0.9"
                                />
                                <path
                                    d="M52 84l68 50 68-50"
                                    stroke="white"
                                    strokeWidth="10"
                                    strokeLinejoin="round"
                                    opacity="0.9"
                                />
                            </svg>
                        </div>

                        <div className="relative z-10 flex h-full flex-col">
                            <div className="text-2xl font-black tracking-wide text-white">
                                EMAIL
                            </div>

                            <div className="flex flex-1 flex-col items-center justify-center text-center">
                                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15">
                                    <EnvelopeIcon className="h-8 w-8 text-white" />
                                </div>
                                <div className="text-4xl font-black uppercase tracking-tight text-white">
                                    NEW MESSAGE
                                </div>
                                <p className="mt-4 max-w-[220px] text-sm leading-6 text-white/80">
                                    Compose new message for all of your users
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="relative bg-[radial-gradient(circle_at_20%_0%,rgba(217,70,239,0.16),rgba(18,8,22,0.92)_55%,rgba(8,4,16,0.98)_100%)] px-8 py-10 md:px-12 md:py-12">
                        <div className="space-y-7">
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-white/90">
                                    Receiver
                                </label>
                                <input
                                    type="text"
                                    name="destination"
                                    value={props.data.destination || ""}
                                    onChange={props.onChange}
                                    placeholder="name@example.com"
                                    className="block w-full rounded-2xl border-0 bg-black/35 px-5 py-3.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/25"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-white/90">
                                    Subject
                                </label>
                                <input
                                    type="text"
                                    name="email_subject"
                                    value={props.data.email_subject || ""}
                                    onChange={props.onChange}
                                    placeholder="write a subject"
                                    className="block w-full rounded-2xl border-0 bg-black/35 px-5 py-3.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/25"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-white/90">
                                    Message
                                </label>
                                <textarea
                                    name="content"
                                    value={props.data.content || ""}
                                    onChange={props.onChange}
                                    placeholder="write your email"
                                    disabled={
                                        props.data.template_id ||
                                        props.data.catalog_id
                                            ? true
                                            : false
                                    }
                                    className="block min-h-[240px] w-full resize-none rounded-2xl border-0 bg-black/30 px-5 py-4 text-sm leading-6 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/25 disabled:opacity-70"
                                />
                            </div>
                        </div>

                        <div className="mt-10 flex items-center justify-center">
                            <div className="h-px w-2/3 bg-fuchsia-500/40" />
                        </div>

                        <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex flex-wrap items-center gap-4">
                                <label className="relative inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl text-white/80 transition hover:bg-white/10 hover:text-white">
                                    <AttachIcon />
                                    <input
                                        className="absolute inset-0 cursor-pointer opacity-0"
                                        type="file"
                                        name="attachment"
                                        onChange={props.onChange}
                                    />
                                </label>

                                <SearchTemplate
                                    templates={templates}
                                    products={products}
                                    interactiveMessages={interactiveMessages}
                                    searchProduct={searchProduct}
                                    searchTemplates={searchTemplates}
                                    searchInteractiveMessages={
                                        searchInteractiveMessages
                                    }
                                    setInteractiveMessage={
                                        props.setInteractiveMessage
                                    }
                                    setProductInfo={props.setProductInfo}
                                    setTemplateInfo={props.setTemplateInfo}
                                    selectedAccount={props.selectedAccount}
                                    allowProducts={false}
                                    allowInteractiveMessages={false}
                                    theme="dark"
                                    hideTemplateSearch={true}
                                    filterTemplatesByService={true}
                                    templateService="email"
                                />

                                {attachedFileName ? (
                                    <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs text-white/70">
                                        {attachedFileName}
                                    </span>
                                ) : null}
                            </div>

                            <div className="flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={props.onClose}
                                    className="inline-flex min-w-[120px] items-center justify-center rounded-xl bg-violet-600/80 px-6 py-2.5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(124,58,237,0.18)] transition hover:bg-violet-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={props.onSend}
                                    disabled={props.sending}
                                    className="inline-flex min-w-[120px] items-center justify-center rounded-xl bg-[#BF00FF] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(191,0,255,0.22)] transition hover:bg-[#a100df] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {props.sending ? "Sending..." : "Send"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EmailComposeModal;

