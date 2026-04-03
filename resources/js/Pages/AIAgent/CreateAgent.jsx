import React, { useState, useRef } from "react";
import Authenticated from "@/Layouts/Authenticated";
import { Head } from "@inertiajs/react";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import { UserCircleIcon } from "@heroicons/react/24/solid";
import axios from "axios";

const TONE_PRESETS = [
    { value: "", label: "Choose the behaviour of your agent" },
    { value: "professional", label: "Professional" },
    { value: "friendly", label: "Friendly" },
    { value: "concise", label: "Concise" },
    { value: "empathetic", label: "Empathetic" },
    { value: "formal", label: "Formal" },
];

const AI_MODELS = [
    { value: "gpt-4o", label: "GPT-4o" },
    { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
    { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
    { value: "claude-3-5-sonnet", label: "Claude 3.5 Sonnet" },
    { value: "claude-3-opus", label: "Claude 3 Opus" },
];

export default function CreateAgent(props) {
    const [agentName, setAgentName] = useState("");
    const [tone, setTone] = useState("");
    const [model, setModel] = useState("");
    const [systemInstructions, setSystemInstructions] = useState("");
    const [chatMessages, setChatMessages] = useState([]);
    const [testInput, setTestInput] = useState("");
    const [isTesting, setIsTesting] = useState(false);
    const chatEndRef = useRef(null);

    function scrollToBottom() {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    async function handleTestSend() {
        const msg = testInput.trim();
        if (!msg) return;

        const userMsg = { role: "user", content: msg };
        setChatMessages((prev) => [...prev, userMsg]);
        setTestInput("");
        setIsTesting(true);

        try {
            const response = await axios.post(route("ai_agent.test"), {
                message: msg,
                agent_name: agentName,
                tone,
                model,
                system_instructions: systemInstructions,
            });
            const assistantMsg = {
                role: "assistant",
                content: response.data.reply ?? "No response.",
            };
            setChatMessages((prev) => [...prev, assistantMsg]);
        } catch {
            setChatMessages((prev) => [
                ...prev,
                { role: "assistant", content: "Error: could not reach the agent." },
            ]);
        } finally {
            setIsTesting(false);
            setTimeout(scrollToBottom, 50);
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
            <Head title="Create AI Agent" />

            <div className="px-6 py-6 sm:px-10">
                {/* Page header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-black tracking-tight">
                        <span className="text-[#BF00FF]">AI</span>
                        <span className="ml-2 text-xl font-extrabold uppercase tracking-widest text-white/90">AGENT</span>
                    </h1>
                    <p className="mt-1 text-sm text-white/50">
                        Design your own AI agents with full customization.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Left — Configuration panel */}
                    <div className="rounded-2xl bg-[linear-gradient(160deg,#2d1060,#1a0a3a)] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
                        {/* Agent Name */}
                        <div className="mb-5">
                            <label className="mb-2 block text-sm font-bold text-white">
                                Agent Name
                            </label>
                            <input
                                type="text"
                                value={agentName}
                                onChange={(e) => setAgentName(e.target.value)}
                                placeholder="Write your Agent name"
                                className="w-full rounded-xl bg-[#1a0a2e] px-4 py-3 text-sm text-white placeholder:text-white/50 focus:outline-none focus:bg-[#220d3a] transition"
                            />
                        </div>

                        {/* Tone Preset */}
                        <div className="mb-5">
                            <label className="mb-2 block text-sm font-bold text-white">
                                Choose The Tone Preset
                            </label>
                            <select
                                value={tone}
                                onChange={(e) => setTone(e.target.value)}
                                className="w-full appearance-none rounded-xl bg-[#1a0a2e] px-4 py-3 text-sm text-white focus:outline-none cursor-pointer transition hover:bg-[#220d3a]"
                            >
                                {TONE_PRESETS.map((t) => (
                                    <option key={t.value} value={t.value} className="bg-[#1a0a2e]">
                                        {t.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Select Model */}
                        <div className="mb-5">
                            <label className="mb-2 block text-sm font-bold text-white">
                                Select Model
                            </label>
                            <select
                                value={model}
                                onChange={(e) => setModel(e.target.value)}
                                className="w-full appearance-none rounded-xl bg-[#1a0a2e] px-4 py-3 text-sm text-white focus:outline-none cursor-pointer transition hover:bg-[#220d3a]"
                            >
                                <option value="" className="bg-[#1a0a2e]">Select a model</option>
                                {AI_MODELS.map((m) => (
                                    <option key={m.value} value={m.value} className="bg-[#1a0a2e]">
                                        {m.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* System Instructions */}
                        <div>
                            <label className="mb-2 block text-sm font-bold text-white">
                                System instructions
                            </label>
                            <textarea
                                value={systemInstructions}
                                onChange={(e) => setSystemInstructions(e.target.value)}
                                placeholder="Train your agent by writing prompts"
                                rows={7}
                                className="w-full resize-none rounded-xl bg-[#1a0a2e] px-4 py-3 text-sm text-white placeholder:text-white/50 focus:outline-none focus:bg-[#220d3a] transition"
                            />
                        </div>
                    </div>

                    {/* Right — Preview / Test panel */}
                    <div className="flex flex-col gap-3">
                        {/* Agent header bar */}
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex flex-1 items-center gap-3 rounded-2xl bg-[linear-gradient(90deg,#5b21b6,#7c3aed)] px-5 py-3 shadow-[0_4px_20px_rgba(124,58,237,0.35)]">
                                <UserCircleIcon className="h-8 w-8 shrink-0 text-white/90" />
                                <span className="text-sm font-black uppercase tracking-widest text-white">
                                    {agentName || "AGENT NAME"}
                                </span>
                            </div>
                            <div className="w-[125px] shrink-0 flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setChatMessages([])}
                                    className="Btn ai-clear-chat-btn"
                                    aria-label="Clear"
                                >
                                    <span className="sign" aria-hidden="true">
                                        <svg viewBox="0 0 24 24">
                                            <path d="M9 3h6l1 2h4v2H4V5h4l1-2z" />
                                            <path d="M6 9h12l-1 12H7L6 9z" />
                                        </svg>
                                    </span>
                                    <span className="text">Clear</span>
                                </button>
                            </div>
                        </div>

                        {/* Chat area */}
                        <div className="flex-1 rounded-2xl bg-[#0a0212] p-4 min-h-[340px] max-h-[400px] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#7c3aed]/60">
                            {chatMessages.length === 0 ? (
                                <div className="flex h-full items-center justify-center text-sm text-white/20">
                                    Test your agent by sending a message below.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {chatMessages.map((msg, i) => (
                                        <div
                                            key={i}
                                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                        >
                                            <div
                                                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-6 ${
                                                    msg.role === "user"
                                                        ? "bg-[#7c3aed] text-white"
                                                        : "bg-[#1a0a2e] text-white/85"
                                                }`}
                                            >
                                                {msg.content}
                                            </div>
                                        </div>
                                    ))}
                                    {isTesting && (
                                        <div className="flex justify-start">
                                            <div className="rounded-2xl bg-[#1a0a2e] px-4 py-2.5 text-sm text-white/40">
                                                Thinking…
                                            </div>
                                        </div>
                                    )}
                                    <div ref={chatEndRef} />
                                </div>
                            )}
                        </div>

                        {/* Test input */}
                        <div className="flex items-center gap-2 rounded-2xl bg-[#2d1060] border border-[#7c3aed]/40 px-4 py-2 shadow-[0_4px_20px_rgba(124,58,237,0.2)]">
                            <input
                                type="text"
                                value={testInput}
                                onChange={(e) => setTestInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        handleTestSend();
                                    }
                                }}
                                placeholder="Write here the questions to test your AGENT"
                                className="flex-1 bg-transparent py-2 text-sm text-white placeholder:text-white/60 focus:outline-none"
                            />
                            <button
                                type="button"
                                onClick={handleTestSend}
                                disabled={isTesting || !testInput.trim()}
                                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#BF00FF] text-white transition hover:bg-[#a100df] shadow-[0_4px_16px_rgba(191,0,255,0.4)] disabled:opacity-40"
                            >
                                <PaperAirplaneIcon className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Authenticated>
    );
}
