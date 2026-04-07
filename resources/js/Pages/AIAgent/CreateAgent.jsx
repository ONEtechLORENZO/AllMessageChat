import React, { useEffect, useRef, useState } from "react";
import Authenticated from "@/Layouts/Authenticated";
import { Head, Link } from "@inertiajs/react";
import {
    PaperAirplaneIcon,
    UserCircleIcon,
    CheckIcon,
    ArrowLeftIcon,
} from "@heroicons/react/24/solid";
import axios from "axios";
import { streamAgentResponse } from "@/lib/responseStream";

function generateAgentKey() {
    const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "agnt_";

    for (let i = 0; i < 26; i += 1) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return result;
}

export default function CreateAgent(props) {
    const locale = props.defaultLocale === "it" ? "it" : "en";
    const isItalian = locale === "it";

    const t = isItalian
        ? {
              pageTitle: "Crea AI Agent",
              back: "Torna indietro",
              subtitle:
                  "Progetta i tuoi agenti AI con piena personalizzazione.",
              agentName: "Nome agente",
              agentNamePlaceholder: "Scrivi il nome del tuo agente",
              toneLabel: "Scegli il tono del tuo agente",
              tonePlaceholder: "Scegli il comportamento del tuo agente",
              modelLabel: "Seleziona modello",
              modelPlaceholder: "Seleziona un modello",
              systemInstructions: "System instructions",
              systemInstructionsPlaceholder: "Sei un assistente utile...",
              emptyChat: "Testa il tuo agente inviando un messaggio qui sotto.",
              testPlaceholder: "Scrivi qui le domande per testare il tuo AGENT",
              save: "Salva agente",
              saving: "Salvataggio…",
              saved: "Agente salvato!",
              clear: "Pulisci",
              thinking: "Sto pensando…",
              noResponse: "Nessuna risposta.",
              openAiMissing:
                  "Il test live non è disponibile finché OPENAI_ONE_API_KEY non è configurata nel file .env.",
              saveSuccess: "Agente salvato con successo.",
              saveError: "Impossibile salvare l'agente.",
              validationMessage:
                  "Compila nome, tono, modello e istruzioni di sistema prima di continuare.",
              testError: "Errore: impossibile raggiungere l'agente.",
              testDisabledUnsaved:
                  "Salva l'agente prima di testarlo con l'assistente OpenAI.",
          }
        : {
              pageTitle: "Create AI Agent",
              back: "Back",
              subtitle: "Design your own AI agents with full customization.",
              agentName: "Agent Name",
              agentNamePlaceholder: "Write your Agent name",
              toneLabel: "Choose The Tone Preset",
              tonePlaceholder: "Choose the behaviour of your agent",
              modelLabel: "Select Model",
              modelPlaceholder: "Select a model",
              systemInstructions: "System instructions",
              systemInstructionsPlaceholder: "You are a helpful assistant...",
              emptyChat: "Test your agent by sending a message below.",
              testPlaceholder: "Write here the questions to test your AGENT",
              save: "Save Agent",
              saving: "Saving…",
              saved: "Agent Saved!",
              clear: "Clear",
              thinking: "Thinking…",
              noResponse: "No response.",
              openAiMissing:
                  "Live testing is unavailable until OPENAI_ONE_API_KEY is configured in your .env file.",
              saveSuccess: "Agent saved successfully.",
              saveError: "Could not save the agent.",
              validationMessage:
                  "Fill in name, tone, model, and system instructions before continuing.",
              testError: "Error: could not reach the agent.",
              testDisabledUnsaved:
                  "Save the agent before testing it with the OpenAI assistant.",
          };

    const tonePresets = props.tonePresets ?? [];
    const models = props.models ?? [];

    const [persistedForm, setPersistedForm] = useState({
        agentName: props.agent?.name || "",
        tonePresetKey: props.agent?.tone_preset_key || "",
        model: props.agent?.model || "",
        systemInstructions: props.agent?.system_instructions || "",
        agentId: props.agent?.id || null,
        assistantId: props.agent?.assistant_id || "",
    });

    const [agentName, setAgentName] = useState(persistedForm.agentName);
    const [tonePresetKey, setTonePresetKey] = useState(
        persistedForm.tonePresetKey,
    );
    const [model, setModel] = useState(persistedForm.model);
    const [systemInstructions, setSystemInstructions] = useState(
        persistedForm.systemInstructions,
    );
    const [agentId, setAgentId] = useState(persistedForm.agentId);
    const [assistantId, setAssistantId] = useState(persistedForm.assistantId);
    const [agentKey] = useState(() => props.agent?.key || generateAgentKey());
    const [chatMessages, setChatMessages] = useState([]);
    const [testInput, setTestInput] = useState("");
    const [isTesting, setIsTesting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [saveFeedback, setSaveFeedback] = useState("");
    const [threadId, setThreadId] = useState(null);
    const [copiedIdentifier, setCopiedIdentifier] = useState(false);
    const chatContainerRef = useRef(null);
    const chatEndRef = useRef(null);
    const visibleIdentifier = assistantId || "";

    const hasFormChanges =
        agentName !== persistedForm.agentName ||
        tonePresetKey !== persistedForm.tonePresetKey ||
        model !== persistedForm.model ||
        systemInstructions !== persistedForm.systemInstructions;
    const hasChanges =
        hasFormChanges || testInput.trim() !== "" || chatMessages.length > 0;

    const canSave =
        agentName.trim() && tonePresetKey && model && systemInstructions.trim();
    const canTest =
        agentName.trim() &&
        tonePresetKey &&
        model &&
        systemInstructions.trim() &&
        testInput.trim();
    const canUsePlayground = Boolean(agentId) && !hasFormChanges;

    useEffect(() => {
        const container = chatContainerRef.current;

        if (!container) {
            return;
        }

        container.scrollTo({
            top: container.scrollHeight,
            behavior: "smooth",
        });
    }, [chatMessages, isTesting]);

    async function handleSave() {
        if (!canSave) {
            setSaveFeedback(t.validationMessage);
            return;
        }

        setIsSaving(true);
        setSaveFeedback("");

        try {
            const response = await axios.post(route("ai_agent.save"), {
                agent_id: agentId,
                key: agentKey,
                name: agentName,
                tone_preset_key: tonePresetKey,
                model,
                system_instructions: systemInstructions,
                locale,
            });

            const returnedId = response?.data?.agent?.id;
            const returnedAssistantId = response?.data?.agent?.assistant_id || "";
            if (returnedId) {
                setAgentId(returnedId);
            }
            setAssistantId(returnedAssistantId);

            setPersistedForm({
                agentName,
                tonePresetKey,
                model,
                systemInstructions,
                agentId: returnedId || agentId,
                assistantId: returnedAssistantId,
            });
            setThreadId(null);
            setChatMessages([]);

            setSaved(true);
            setSaveFeedback(t.saveSuccess);
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            const message =
                error?.response?.data?.message ||
                (error?.response?.data?.errors
                    ? Object.values(error.response.data.errors).flat()[0]
                    : null);

            setSaveFeedback(message || t.saveError);
        } finally {
            setIsSaving(false);
        }
    }

    async function handleTestSend() {
        const message = testInput.trim();

        if (!message) {
            return;
        }

        if (
            !agentName.trim() ||
            !tonePresetKey ||
            !model ||
            !systemInstructions.trim()
        ) {
            setChatMessages((prev) => [
                ...prev,
                { role: "assistant", content: t.validationMessage },
            ]);
            return;
        }

        if (!canUsePlayground) {
            setChatMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: t.testDisabledUnsaved,
                },
            ]);
            return;
        }

        if (!props.openAiConfigured) {
            setChatMessages((prev) => [
                ...prev,
                { role: "assistant", content: t.openAiMissing },
            ]);
            return;
        }

        const userMessage = { role: "user", content: message };
        const nextMessages = [...chatMessages, userMessage];

        setChatMessages([
            ...nextMessages,
            { role: "assistant", content: "", isStreaming: true },
        ]);
        setTestInput("");
        setIsTesting(true);

        try {
            await streamAgentResponse({
                url: route("ai_agent.test"),
                body: {
                    agent_id: agentId,
                    message,
                    thread_id: threadId,
                },
                onMeta: (payload) => {
                    if (payload?.thread_id) {
                        setThreadId(payload.thread_id);
                    }
                },
                onDelta: (delta) => {
                    setChatMessages((prev) => {
                        const updated = [...prev];
                        const lastIndex = updated.length - 1;

                        if (
                            lastIndex < 0 ||
                            updated[lastIndex].role !== "assistant"
                        ) {
                            updated.push({
                                role: "assistant",
                                content: delta,
                                isStreaming: true,
                            });
                            return updated;
                        }

                        updated[lastIndex] = {
                            ...updated[lastIndex],
                            content: `${updated[lastIndex].content || ""}${delta}`,
                            isStreaming: true,
                        };

                        return updated;
                    });
                },
                onError: (messageText) => {
                    setChatMessages((prev) => {
                        const updated = [...prev];
                        const lastIndex = updated.length - 1;
                        const errorText = `Error: ${messageText}`;

                        if (
                            lastIndex < 0 ||
                            updated[lastIndex].role !== "assistant"
                        ) {
                            updated.push({
                                role: "assistant",
                                content: errorText,
                                isStreaming: false,
                            });
                            return updated;
                        }

                        updated[lastIndex] = {
                            ...updated[lastIndex],
                            content: errorText,
                            isStreaming: false,
                        };

                        return updated;
                    });
                },
                onDone: () => {
                    setChatMessages((prev) => {
                        const updated = [...prev];
                        const lastIndex = updated.length - 1;

                        if (
                            lastIndex >= 0 &&
                            updated[lastIndex].role === "assistant"
                        ) {
                            updated[lastIndex] = {
                                ...updated[lastIndex],
                                content:
                                    updated[lastIndex].content || t.noResponse,
                                isStreaming: false,
                            };
                        }

                        return updated;
                    });
                },
            });
        } catch (error) {
            setChatMessages((prev) => {
                const updated = [...prev];
                const lastIndex = updated.length - 1;
                const fallbackMessage = error?.message || t.testError;

                if (lastIndex < 0 || updated[lastIndex].role !== "assistant") {
                    updated.push({
                        role: "assistant",
                        content: fallbackMessage,
                        isStreaming: false,
                    });
                    return updated;
                }

                updated[lastIndex] = {
                    ...updated[lastIndex],
                    content: fallbackMessage,
                    isStreaming: false,
                };

                return updated;
            });
        } finally {
            setIsTesting(false);
        }
    }

    function handleClear() {
        setAgentName(persistedForm.agentName);
        setTonePresetKey(persistedForm.tonePresetKey);
        setModel(persistedForm.model);
        setSystemInstructions(persistedForm.systemInstructions);
        setChatMessages([]);
        setTestInput("");
        setSaveFeedback("");
        setSaved(false);
        setAgentId(persistedForm.agentId);
        setAssistantId(persistedForm.assistantId);
        setThreadId(null);
    }

    async function handleCopyIdentifier() {
        if (!visibleIdentifier) {
            return;
        }

        try {
            await navigator.clipboard.writeText(visibleIdentifier);
            setCopiedIdentifier(true);
            window.setTimeout(() => setCopiedIdentifier(false), 2000);
        } catch {
            setCopiedIdentifier(false);
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
            disableContentScroll={true}
        >
            <Head title={t.pageTitle} />

            <div className="-mt-1 px-6 pb-6 pt-5 sm:-mt-2 sm:px-10 sm:pt-6">
                <div className="mb-3 flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">
                            <span className="text-[#BF00FF]">AI</span>
                            <span className="ml-2 text-xl font-extrabold uppercase tracking-widest text-white/90">
                                AGENT
                            </span>
                        </h1>
                        <p className="mt-1 text-sm text-white/50">
                            {t.subtitle}
                        </p>
                    </div>

                    <Link
                        href={route("ai_agent.choose")}
                        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-semibold text-white/70 no-underline transition hover:bg-white/[0.06] hover:text-white hover:no-underline"
                    >
                        <ArrowLeftIcon className="h-4 w-4" />
                        {t.back}
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div className="rounded-2xl bg-[linear-gradient(160deg,#2d1060,#1a0a3a)] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
                        <div className="mb-4">
                            <label className="mb-2 block text-sm font-bold text-white">
                                {t.agentName}
                            </label>

                            <input
                                type="text"
                                value={agentName}
                                onChange={(e) => setAgentName(e.target.value)}
                                placeholder={t.agentNamePlaceholder}
                                className="w-full rounded-xl bg-[#1a0a2e] px-4 py-3 text-sm text-white placeholder:text-white/50 focus:outline-none focus:bg-[#220d3a] transition"
                            />
                            <div className="group mt-2 flex items-center gap-3 px-1">
                                <p className="min-w-0 flex-1 break-all font-mono text-xs text-[#BF00FF]">
                                    {visibleIdentifier}
                                </p>
                                {visibleIdentifier ? (
                                    <button
                                        type="button"
                                        onClick={handleCopyIdentifier}
                                        className="pointer-events-none inline-flex shrink-0 items-center rounded-lg border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-white/85 opacity-0 transition hover:bg-white/[0.1] group-hover:pointer-events-auto group-hover:opacity-100"
                                    >
                                        {copiedIdentifier ? "Copied" : "Copy"}
                                    </button>
                                ) : null}
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="mb-2 block text-sm font-bold text-white">
                                {t.toneLabel}
                            </label>

                            <select
                                value={tonePresetKey}
                                onChange={(e) =>
                                    setTonePresetKey(e.target.value)
                                }
                                className="w-full appearance-none rounded-xl bg-[#1a0a2e] px-4 py-3 text-sm text-white focus:outline-none cursor-pointer transition hover:bg-[#220d3a]"
                            >
                                <option value="" className="bg-[#1a0a2e]">
                                    {t.tonePlaceholder}
                                </option>

                                {tonePresets.map((preset) => (
                                    <option
                                        key={preset.value}
                                        value={preset.value}
                                        className="bg-[#1a0a2e]"
                                    >
                                        {preset.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="mb-2 block text-sm font-bold text-white">
                                {t.modelLabel}
                            </label>

                            <select
                                value={model}
                                onChange={(e) => setModel(e.target.value)}
                                className="w-full appearance-none rounded-xl bg-[#1a0a2e] px-4 py-3 text-sm text-white focus:outline-none cursor-pointer transition hover:bg-[#220d3a]"
                            >
                                <option value="" className="bg-[#1a0a2e]">
                                    {t.modelPlaceholder}
                                </option>

                                {models.map((item) => (
                                    <option
                                        key={item.value}
                                        value={item.value}
                                        className="bg-[#1a0a2e]"
                                    >
                                        {item.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-bold text-white">
                                {t.systemInstructions}
                            </label>

                            <textarea
                                value={systemInstructions}
                                onChange={(e) =>
                                    setSystemInstructions(e.target.value)
                                }
                                placeholder={t.systemInstructionsPlaceholder}
                                rows={5}
                                className="w-full resize-none overflow-y-auto rounded-xl bg-[#1a0a2e] px-4 py-3 text-sm text-white placeholder:text-white/50 focus:outline-none focus:bg-[#220d3a] transition"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
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
                                    onClick={handleClear}
                                    disabled={!hasChanges}
                                    className={`Btn ai-clear-chat-btn ${!hasChanges ? "opacity-40 cursor-not-allowed pointer-events-none" : ""}`}
                                    aria-label={t.clear}
                                >
                                    <span className="sign" aria-hidden="true">
                                        <svg viewBox="0 0 24 24">
                                            <path d="M9 3h6l1 2h4v2H4V5h4l1-2z" />
                                            <path d="M6 9h12l-1 12H7L6 9z" />
                                        </svg>
                                    </span>
                                    <span className="text">{t.clear}</span>
                                </button>
                            </div>
                        </div>

                        {!props.openAiConfigured && (
                            <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
                                {t.openAiMissing}
                            </div>
                        )}

                        <div
                            ref={chatContainerRef}
                            className="flex-1 rounded-2xl bg-[#0a0212] p-4 min-h-[340px] max-h-[400px] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#7c3aed]/60"
                        >
                            {chatMessages.length === 0 ? (
                                <div className="flex h-full items-center justify-center text-sm text-white/20">
                                    {t.emptyChat}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {chatMessages.map((msg, index) => (
                                        <div
                                            key={`${msg.role}-${index}`}
                                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                        >
                                            <div
                                                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-6 whitespace-pre-wrap ${
                                                    msg.role === "user"
                                                        ? "bg-[#7c3aed] text-white"
                                                        : "bg-[#1a0a2e] text-white/85"
                                                }`}
                                            >
                                                {msg.content ||
                                                    (msg.isStreaming
                                                        ? t.thinking
                                                        : "")}
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={chatEndRef} />
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-2 rounded-2xl bg-[#2d1060] border border-[#7c3aed]/40 px-4 py-2 shadow-[0_4px_20px_rgba(124,58,237,0.2)]">
                            <input
                                type="text"
                                value={testInput}
                                onChange={(e) => setTestInput(e.target.value)}
                                disabled={!canUsePlayground}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        handleTestSend();
                                    }
                                }}
                                placeholder={t.testPlaceholder}
                                className={`flex-1 bg-transparent py-2 text-sm text-white placeholder:text-white/60 focus:outline-none ${!canUsePlayground ? "opacity-50 cursor-not-allowed" : ""}`}
                            />

                            <button
                                type="button"
                                onClick={handleTestSend}
                                disabled={
                                    isTesting || !canTest || !canUsePlayground
                                }
                                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#BF00FF] text-white transition hover:bg-[#a100df] shadow-[0_4px_16px_rgba(191,0,255,0.4)] disabled:opacity-40"
                            >
                                <PaperAirplaneIcon className="h-4 w-4" />
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={isSaving || !canSave}
                            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(90deg,#7c3aed,#BF00FF)] py-3.5 text-sm font-bold uppercase tracking-widest text-white shadow-[0_6px_24px_rgba(191,0,255,0.35)] transition hover:brightness-110 disabled:opacity-40"
                        >
                            {saved ? (
                                <>
                                    <CheckIcon className="h-4 w-4" />
                                    {t.saved}
                                </>
                            ) : isSaving ? (
                                t.saving
                            ) : (
                                t.save
                            )}
                        </button>

                        {saveFeedback ? (
                            <div className="text-center text-sm text-white/70">
                                {saveFeedback}
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </Authenticated>
    );
}
