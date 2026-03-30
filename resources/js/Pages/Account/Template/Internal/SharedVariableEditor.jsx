import React from "react";

function formatFieldLabel(label = "") {
    const normalized = String(label)
        .replace(/_/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    if (!normalized) return "";

    const titleCased = normalized.replace(/\w\S*/g, (word) => {
        const lower = word.toLowerCase();
        if (lower === "whatsapp") return "WhatsApp";
        return lower.charAt(0).toUpperCase() + lower.slice(1);
    });

    return titleCased;
}

export default function SharedVariableEditor({
    fields = {},
    variables = [],
    onInsert,
    focusedFieldLabel,
    channel = "facebook",
}) {
    const wrapToken = (value) => (channel === "facebook" ? `{${value}}` : `{{${value}}}`);

    return (
        <div className="rounded-[28px] border border-white/10 bg-[#140816]/75 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.35)] ring-1 ring-white/5 backdrop-blur-3xl">
            <div className="space-y-2">
                <h3 className="text-xl font-semibold text-white">Personalization Variables</h3>
                <p className="text-sm text-white/60">
                    Insert contact data into your message using variables.
                </p>
                <p className="text-sm text-white/50">Click a field to add it to the message.</p>
                <p className="text-sm text-white/45">
                    {focusedFieldLabel
                        ? `Inserting into: ${focusedFieldLabel}`
                        : "Click inside the message and select a variable to insert it."}
                </p>
            </div>

            {variables.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                    {variables.map((variable) => (
                        <span
                            key={variable}
                            className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-100"
                        >
                            {wrapToken(variable)}
                        </span>
                    ))}
                </div>
            ) : null}

            <div className="mt-5 flex flex-wrap gap-2">
                {Object.entries(fields || {}).map(([fieldName, fieldLabel]) => (
                    <button
                        key={fieldName}
                        type="button"
                        onClick={() => onInsert(fieldName)}
                        className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/80 transition hover:bg-white/[0.08]"
                    >
                        {formatFieldLabel(fieldLabel)}
                    </button>
                ))}
            </div>
        </div>
    );
}
