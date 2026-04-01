import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import SearchTemplate from "./SearchTemplate";
import Axios from "axios";

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
            if (template.name.indexOf(key) !== -1) {
                templateList.push(template);
            }
        });

        setTemplates(templateList);
    }

    function searchInteractiveMessages(key) {
        const templateList = [];

        (props.interactiveMessages || []).forEach((interactiveMessage) => {
            if (interactiveMessage.name.indexOf(key) !== -1) {
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
            <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#120816] text-white shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
                <div className="flex items-start justify-between border-b border-white/8 px-6 py-5">
                    <div>
                        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-white/35">
                            Email
                        </div>
                        <h2 className="mt-2 text-2xl font-semibold text-white">
                            New Message
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={props.onClose}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-white/55 transition hover:bg-white/8 hover:text-white"
                    >
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-6">
                    <div className="space-y-5">
                        <div>
                            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-white/35">
                                Receiver
                            </label>
                            <input
                                type="text"
                                name="destination"
                                value={props.data.destination || ""}
                                onChange={props.onChange}
                                placeholder="name@example.com"
                                className="block w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-white/30 focus:border-[#A31EFF]/50 focus:outline-none focus:ring-0"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-white/35">
                                Subject
                            </label>
                            <input
                                type="text"
                                name="email_subject"
                                value={props.data.email_subject || ""}
                                onChange={props.onChange}
                                placeholder="Write a subject"
                                className="block w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-white/30 focus:border-[#A31EFF]/50 focus:outline-none focus:ring-0"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-white/35">
                                Message
                            </label>
                            <textarea
                                rows={8}
                                name="content"
                                value={props.data.content || ""}
                                onChange={props.onChange}
                                placeholder="Write your email..."
                                disabled={
                                    props.data.template_id ||
                                    props.data.catalog_id
                                        ? true
                                        : false
                                }
                                className="block min-h-[260px] w-full resize-y rounded-2xl border border-white/8 bg-[#0f0915] px-4 py-3 text-sm leading-6 text-white placeholder-white/30 focus:border-[#A31EFF]/50 focus:outline-none focus:ring-0"
                            />
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/8 px-6 py-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-wrap items-center gap-3">
                            <label className="relative inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl text-white/60 transition hover:bg-white/8 hover:text-white">
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
                                <span className="rounded-full bg-white/[0.05] px-3 py-1 text-xs text-white/65">
                                    {attachedFileName}
                                </span>
                            ) : null}
                        </div>

                        <div className="flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={props.onClose}
                                className="inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium text-white/65 transition hover:bg-white/8 hover:text-white"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={props.onSend}
                                disabled={props.sending}
                                className="inline-flex min-w-[132px] items-center justify-center rounded-xl bg-[#A31EFF] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#8a19d9] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {props.sending ? "Sending..." : "Send email"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EmailComposeModal;
