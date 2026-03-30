import React from "react";

function applySampleData(value = "", sampleData = {}) {
    return String(value).replace(/{{\s*([a-zA-Z0-9_]+)\s*}}|{\s*([a-zA-Z0-9_]+)\s*}/g, (_, doubleKey, singleKey) => {
        const variableName = doubleKey || singleKey;
        return sampleData[variableName] ?? "";
    });
}

function ButtonRow({ buttons = [], sampleData = {} }) {
    if (!buttons.length) return null;

    return (
        <div className="mt-3 flex flex-wrap gap-2">
            {buttons.map((button, index) => (
                <span
                    key={`preview-button-${index}`}
                    className="rounded-full border border-fuchsia-400/30 bg-fuchsia-500/10 px-3 py-1 text-xs font-semibold text-fuchsia-100"
                >
                    {applySampleData(button.title || button.type, sampleData)}
                </span>
            ))}
        </div>
    );
}

function CardPreview({ card, sampleData = {} }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            {card.image_url ? (
                <div className="mb-3 h-32 rounded-xl bg-cover bg-center" style={{ backgroundImage: `url(${card.image_url})` }} />
            ) : (
                <div className="mb-3 flex h-32 items-center justify-center rounded-xl bg-white/5 text-sm text-white/35">
                    Image preview
                </div>
            )}
            <div className="text-sm font-semibold text-white">
                {applySampleData(card.title || "Card title", sampleData)}
            </div>
            {card.subtitle ? (
                <div className="mt-1 text-sm text-white/60">
                    {applySampleData(card.subtitle, sampleData)}
                </div>
            ) : null}
            <ButtonRow buttons={card.buttons || []} sampleData={sampleData} />
        </div>
    );
}

export default function SharedPreviewPanel({
    channel = "facebook",
    payload = {},
    sampleData = {},
}) {
    const channelLabel = channel === "instagram" ? "Instagram DM preview" : "Messenger preview";

    return (
        <div className="rounded-[28px] border border-white/10 bg-[#100517]/85 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.35)] ring-1 ring-white/5 backdrop-blur-xl">
            <div className="mb-2 text-center text-2xl font-semibold text-white">Message Preview</div>
            <div className="mb-6 text-center text-sm text-white/55">Showing preview with sample data</div>
            <div className="mx-auto w-full max-w-[360px] rounded-[32px] border border-white/10 bg-black/25 p-4">
                <div className="rounded-[24px] bg-[#171019] p-4">
                    <div className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-white/40">
                        {channelLabel}
                    </div>

                    {payload.type === "text" ? (
                        <div className="max-w-[260px] whitespace-pre-wrap break-words rounded-[24px] bg-fuchsia-500/20 px-4 py-3 text-sm leading-6 text-white">
                            {applySampleData(payload.body || "Hi John, welcome to our service 👋", sampleData)}
                        </div>
                    ) : null}

                    {payload.type === "media" ? (
                        <div className="space-y-3">
                            {payload.body ? (
                                <div className="max-w-[260px] whitespace-pre-wrap break-words rounded-[24px] bg-fuchsia-500/20 px-4 py-3 text-sm leading-6 text-white">
                                    {applySampleData(payload.body, sampleData)}
                                </div>
                            ) : null}
                            <div className="max-w-[260px] rounded-[24px] border border-white/10 bg-black/20 p-3 text-sm text-white/70">
                                {payload.media_type === "video" ? "Video" : "Image"} attachment
                            </div>
                        </div>
                    ) : null}

                    {payload.type === "card" ? <CardPreview card={payload} sampleData={sampleData} /> : null}

                    {payload.type === "carousel" ? (
                        <div className="space-y-3">
                            {(payload.cards || []).map((card, index) => (
                                <CardPreview
                                    key={`carousel-card-${index}`}
                                    card={card}
                                    sampleData={sampleData}
                                />
                            ))}
                        </div>
                    ) : null}

                    {payload.type === "quick_replies" ? (
                        <div>
                            <div className="max-w-[260px] whitespace-pre-wrap break-words rounded-[24px] bg-fuchsia-500/20 px-4 py-3 text-sm leading-6 text-white">
                                {applySampleData(payload.body || "Hi John, how can we help today?", sampleData)}
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {(payload.quick_replies || []).map((reply, index) => (
                                    <span
                                        key={`quick-reply-${index}`}
                                        className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-white/80"
                                    >
                                        {applySampleData(reply.title || "Reply", sampleData)}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
