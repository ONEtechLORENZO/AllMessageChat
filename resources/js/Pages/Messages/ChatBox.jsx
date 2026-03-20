import { useState } from "react";
import SearchTemplate from "./SearchTemplate";
import Axios from "axios";

import { AttachIcon } from "../icons";

function ChatBox(props) {
    const [templates, setTemplates] = useState(props.templates);
    const [products, setProducts] = useState(props.products);
    const [interactiveMessages, setInteractiveMessage] = useState(
        props.interactiveMessages,
    );
    const isEmail = props.containerCategory == "email";

    function searchTemplates(key) {
        const templateList = [];
        props.templates.map((template) => {
            if (template.name.indexOf(key) !== -1) {
                templateList.push(template);
            }
        });
        setTemplates(templateList);
    }

    function searchInteractiveMessages(key) {
        const templateList = [];
        props.interactiveMessages.map((interactiveMessage) => {
            if (interactiveMessage.name.indexOf(key) !== -1) {
                templateList.push(interactiveMessage);
            }
        });
        setInteractiveMessage(templateList);
    }

    function searchProduct(key) {
        const url = route("search_product", { search: key });
        Axios.get(url).then((response) => {
            if (response.data.status === true) {
                setProducts(response.data.products);
            }
        });
    }

    const sharedActions = (
        <>
            <button
                type="button"
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl text-white/60 transition hover:bg-white/8 hover:text-white"
            >
                <AttachIcon />
                <input
                    className="absolute inset-0 cursor-pointer opacity-0"
                    type="file"
                    name="attachment"
                    onChange={(e) => props.handleChange(e)}
                />
                <span className="sr-only">Attach a file</span>
            </button>

            {(props.containerCategory == "whatsapp" ||
                props.containerCategory == "email") && (
                <div className="flow-root">
                    <SearchTemplate
                        templates={templates}
                        products={products}
                        interactiveMessages={interactiveMessages}
                        searchProduct={searchProduct}
                        searchTemplates={searchTemplates}
                        searchInteractiveMessages={searchInteractiveMessages}
                        setInteractiveMessage={props.setInteractiveMessage}
                        setProductInfo={props.setProductInfo}
                        setTemplateInfo={props.setTemplateInfo}
                        selectedAccount={props.selectedAccount}
                        allowProducts={isEmail ? false : undefined}
                        allowInteractiveMessages={isEmail ? false : undefined}
                        theme={isEmail ? "dark" : undefined}
                        hideTemplateSearch={isEmail}
                    />
                </div>
            )}

            {(props.data.template_id || props.data.catalog_id) && (
                <button
                    type="button"
                    title="Clear template"
                    className="cursor-pointer text-white/70 transition hover:text-white"
                    onClick={() => props.clearContent()}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="w-6 h-6"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                </button>
            )}
        </>
    );

    if (isEmail) {
        return (
            <div className="min-w-0 flex-1 overflow-hidden rounded-[20px] bg-[#160b1e]">
                <form action="#">
                    <div className="px-4 py-2.5">
                        <div className="flex items-center justify-between gap-3">
                            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30">
                                Reply
                            </div>
                            <span className="text-[11px] text-white/32">
                                {props.logo}
                            </span>
                        </div>
                        <input
                            type="text"
                            name="email_subject"
                            value={props.data.email_subject || ""}
                            onChange={(e) => props.handleChange(e)}
                            placeholder="Subject"
                            className="mt-2 block w-full rounded-lg bg-white/[0.025] px-3 py-2 text-sm text-white placeholder-white/35 focus:outline-none focus:ring-0"
                        />
                    </div>

                    <div className="px-4 py-3">
                        <label htmlFor="content" className="sr-only">
                            Write your email reply
                        </label>
                        <textarea
                            rows={3}
                            id="content"
                            onChange={(e) => props.handleChange(e)}
                            onKeyUp={(e) => props.handleKeyUp(e)}
                            name="content"
                            disabled={
                                props.data.template_id || props.data.catalog_id
                                    ? true
                                    : false
                            }
                            value={props.data.content}
                            className="block min-h-[88px] w-full resize-y rounded-xl bg-[#120916] px-3 py-2.5 text-sm leading-6 text-white placeholder-white/32 focus:outline-none focus:ring-0"
                            placeholder="Write a reply..."
                            defaultValue=""
                        />
                    </div>

                    <div className="flex flex-col gap-2 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-wrap items-center gap-2">
                            {sharedActions}
                        </div>

                        <button
                            type="button"
                            onClick={props.sendMessage}
                            className="inline-flex items-center justify-center rounded-lg border border-transparent bg-[#A31EFF] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#8a19d9] focus:outline-none focus:ring-2 focus:ring-[#A31EFF]/60 focus:ring-offset-0"
                        >
                            Send reply
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
                <span className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-[#A31EFF]/25">
                    <span className="text-2xl font-medium leading-none text-white">
                        {props.logo}
                    </span>
                </span>
            </div>
            <div className="min-w-0 flex-1 bg-white/5 rounded-2xl p-4">
                <form action="#">
                    <div className="focus-within:border-[#A31EFF]/70">
                        <label htmlFor="comment" className="sr-only">
                            Add your comment
                        </label>
                        <textarea
                            rows={1}
                            id="content"
                            onChange={(e) => props.handleChange(e)}
                            onKeyUp={(e) => props.handleKeyUp(e)}
                            name="content"
                            disabled={
                                props.data.template_id || props.data.catalog_id
                                    ? true
                                    : false
                            }
                            value={props.data.content}
                            className="block w-full resize-none border-0 border-b border-transparent p-0 pb-2 focus:border-[#A31EFF]/70 focus:ring-0 sm:text-sm bg-transparent text-white placeholder-white/40 min-h-8 max-h-32 overflow-y-auto"
                            placeholder="Add your comment..."
                            defaultValue=""
                        />
                    </div>
                    <div className="flex justify-between pt-2">
                        <div className="flex items-center space-x-5">
                            {sharedActions}
                        </div>
                        <div className="flex-shrink-0">
                            <button
                                type="button"
                                onClick={props.sendMessage}
                                className="inline-flex items-center rounded-md border border-transparent bg-[#A31EFF] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#8a19d9] focus:outline-none focus:ring-2 focus:ring-[#A31EFF]/60 focus:ring-offset-0"
                            >
                                Post
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ChatBox;
