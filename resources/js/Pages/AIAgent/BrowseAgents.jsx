import React, { useMemo, useState } from "react";
import axios from "axios";
import Authenticated from "@/Layouts/Authenticated";
import { Head } from "@inertiajs/react";

function AgentCard({ agent, tall = false, onClick }) {
    return (
        <button
            type="button"
            onClick={() => onClick(agent)}
            className={`group relative overflow-hidden rounded-[28px] border border-white/10 bg-[#0f1322]/70 p-8 text-left shadow-[0_24px_60px_rgba(0,0,0,0.45)] transition duration-500 hover:-translate-y-2 hover:scale-[1.01] ${tall ? "min-h-[340px]" : "min-h-[260px]"}`}
        >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent opacity-70" />
            <div className="relative z-10 flex h-full flex-col gap-6">
                <div className="flex items-center justify-between">
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white/80">
                        {agent.tag}
                    </span>
                    <span
                        className="h-1.5 w-1.5 rounded-full shadow-[0_0_8px_currentColor]"
                        style={{ backgroundColor: agent.accent, color: agent.accent }}
                    />
                </div>

                <div className="flex flex-1 flex-col gap-3">
                    <div className="flex flex-col gap-2">
                        <h3
                            className="text-3xl font-black tracking-tight transition-colors"
                            style={{ color: agent.accent }}
                        >
                            {agent.title}
                        </h3>
                        <div
                            className="h-1 w-12 origin-left scale-x-0 rounded-full transition-transform duration-500 group-hover:scale-x-100"
                            style={{ backgroundColor: agent.accent }}
                        />
                    </div>
                    <p className="text-sm font-medium leading-relaxed text-[#9aa3c7] opacity-80 transition-opacity group-hover:opacity-100 md:text-[15px]">
                        {agent.description}
                    </p>
                </div>

                <div
                    className="mt-auto flex translate-y-2 items-center pt-4 text-xs font-bold uppercase tracking-widest opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100"
                    style={{ color: agent.accent }}
                >
                    Launch Agent
                    <svg
                        className="ml-2 h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                </div>
            </div>
        </button>
    );
}

function AgentChatModal({ agent, messages, input, loading, error, onChange, onClose, onSend }) {
    function handleKeyDown(event) {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            onSend(event);
        }
    }

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm">
            <div className="relative flex h-[min(86vh,760px)] w-full max-w-5xl flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#0c101c] shadow-[0_0_60px_rgba(0,0,0,0.65)]">
                <div className="absolute -right-24 top-[-20%] h-[420px] w-[420px] rounded-full blur-[120px]" style={{ backgroundColor: `${agent.accent}22` }} />

                <div className="relative z-10 flex items-center justify-between border-b border-white/10 bg-white/[0.02] px-6 py-5 backdrop-blur-xl">
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-[#131620] text-lg font-black text-white shadow-2xl">
                            {agent.title.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight text-white">
                                {agent.title}
                            </h2>
                            <p className="mt-1 text-sm text-[#9aa3c7]">
                                {agent.description}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#9aa3c7] transition hover:bg-white/10 hover:text-white"
                    >
                        Close
                    </button>
                </div>

                <div className="relative z-10 flex-1 overflow-y-auto px-6 py-6">
                    <div className="mx-auto flex h-full max-w-4xl flex-col gap-4">
                        {messages.map((message, index) => (
                            <div
                                key={`${message.role}-${index}`}
                                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[85%] rounded-3xl px-5 py-4 text-sm leading-7 shadow-[0_10px_30px_rgba(0,0,0,0.25)] ${
                                        message.role === "user"
                                            ? "bg-[#7c3aed] text-white"
                                            : "border border-white/10 bg-white/[0.04] text-[#e7e7f0]"
                                    }`}
                                >
                                    {message.content}
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="flex justify-start">
                                <div className="rounded-3xl border border-white/10 bg-white/[0.04] px-5 py-4 text-sm text-[#9aa3c7]">
                                    Thinking...
                                </div>
                            </div>
                        )}

                        {error ? (
                            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                                {error}
                            </div>
                        ) : null}
                    </div>
                </div>

                <form
                    onSubmit={onSend}
                    className="relative z-10 border-t border-white/10 bg-[#0f1322]/90 px-6 py-5"
                >
                    <div className="mx-auto flex max-w-4xl items-end gap-4">
                        <textarea
                            value={input}
                            onChange={(event) => onChange(event.target.value)}
                            onKeyDown={handleKeyDown}
                            rows={3}
                            placeholder={`Write a message to ${agent.title}`}
                            className="min-h-[84px] flex-1 resize-none rounded-3xl border border-white/10 bg-[#131620] px-5 py-4 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-white/20"
                        />
                        <button
                            type="submit"
                            disabled={loading || input.trim() === ""}
                            className="h-[56px] rounded-2xl bg-[linear-gradient(90deg,#7c3aed,#a855f7)] px-6 text-sm font-black uppercase tracking-wider text-white shadow-[0_15px_40px_rgba(124,58,237,0.35)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            Send
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function BrowseAgents(props) {
    const agents = props.agents ?? [];
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const leftColumn = useMemo(() => agents.filter((_, index) => index % 2 === 0), [agents]);
    const rightColumn = useMemo(() => agents.filter((_, index) => index % 2 === 1), [agents]);

    function openAgent(agent) {
        setSelectedAgent(agent);
        setMessages([{ role: "assistant", content: agent.greeting }]);
        setInput("");
        setError("");
    }

    async function handleSend(event) {
        event.preventDefault();

        if (!selectedAgent || loading) {
            return;
        }

        const content = input.trim();
        if (content === "") {
            return;
        }

        const nextMessages = [...messages, { role: "user", content }];
        setMessages(nextMessages);
        setInput("");
        setLoading(true);
        setError("");

        try {
            const response = await axios.post("/ai-agent/chat", {
                agent: selectedAgent.id,
                messages: nextMessages,
            });

            setMessages((current) => [
                ...current,
                {
                    role: "assistant",
                    content: response.data.reply ?? "No reply received.",
                },
            ]);
        } catch (requestError) {
            setError(
                requestError?.response?.data?.message ??
                    "The AI agent could not answer right now. Please check the OpenAI configuration and try again.",
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <Authenticated
            auth={props.auth}
            errors={props.errors}
            current_page="AI Agent"
            message={props.message}
            navigationMenu={props.menuBar}
            subduedBackground={true}
            hidePageTitle={true}
        >
            <Head title="Browse AI Agents" />

            <div className="relative overflow-hidden px-4 py-10 sm:px-6 lg:px-10">
                <div className="pointer-events-none absolute left-[-10%] top-20 h-[460px] w-[460px] rounded-full bg-[#7c3aed]/10 blur-[120px]" />
                <div className="pointer-events-none absolute right-[-10%] top-0 h-[520px] w-[520px] rounded-full bg-[#6d28d9]/15 blur-[150px]" />

                <div className="relative z-10 mx-auto max-w-[1400px] py-6">
                    {!props.openAiConfigured ? (
                        <div className="mb-6 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-5 py-4 text-sm text-amber-100">
                            OpenAI is not configured yet in this project. Add the OpenAI environment values in <code>.env</code> to activate the live agents.
                        </div>
                    ) : null}

                    <section className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:gap-24" aria-label="AI Agents by ONE">
                        <div className="relative flex flex-col gap-6 lg:sticky lg:top-28">
                            <h1 className="text-4xl font-light tracking-tighter text-white md:text-5xl lg:text-6xl">
                                AI Agents
                                <span className="my-2 block text-2xl font-normal opacity-50 md:text-3xl">
                                    by
                                </span>
                                <strong className="block text-5xl font-black text-[#BF00FF] md:text-6xl lg:text-7xl">
                                    ONE
                                </strong>
                            </h1>

                            <p className="max-w-[32ch] text-lg font-medium leading-relaxed text-[#9aa3c7] md:text-xl">
                                Choose a specialized industry to configure the intelligent agent. The demo adapts its tone, vocabulary, and business guidance to the selected domain.
                            </p>

                            <div className="mt-4 inline-flex w-fit items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/90">
                                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                                Live Demo
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div className="flex flex-col gap-6">
                                {leftColumn.map((agent, index) => (
                                    <AgentCard
                                        key={agent.id}
                                        agent={agent}
                                        tall={index % 2 === 1}
                                        onClick={openAgent}
                                    />
                                ))}
                            </div>
                            <div className="flex flex-col gap-6 sm:pt-20">
                                {rightColumn.map((agent, index) => (
                                    <AgentCard
                                        key={agent.id}
                                        agent={agent}
                                        tall={index % 2 === 1}
                                        onClick={openAgent}
                                    />
                                ))}
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            {selectedAgent ? (
                <AgentChatModal
                    agent={selectedAgent}
                    messages={messages}
                    input={input}
                    loading={loading}
                    error={error}
                    onChange={setInput}
                    onClose={() => {
                        setSelectedAgent(null);
                        setMessages([]);
                        setInput("");
                        setError("");
                    }}
                    onSend={handleSend}
                />
            ) : null}
        </Authenticated>
    );
}
