import React from "react";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/solid";

export default function SharedButtonEditor({
    buttons = [],
    onChange,
    onAdd,
    onRemove,
    allowedTypes = ["web_url", "postback"],
    channel = "facebook",
}) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-base font-medium text-white">Buttons</div>
                    <div className="text-sm text-white/55">
                        Add up to 3 actions for this card.
                    </div>
                </div>
                <button
                    type="button"
                    onClick={onAdd}
                    className="inline-flex items-center gap-2 rounded-full bg-fuchsia-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-fuchsia-500"
                >
                    <PlusIcon className="h-4 w-4" />
                    Add button
                </button>
            </div>

            {buttons.map((button, index) => (
                <div
                    key={`button-${index}`}
                    className="rounded-2xl border border-white/10 bg-[#12041f] p-4"
                >
                    <div className="grid gap-4 md:grid-cols-2">
                        <label className="block">
                            <span className="mb-2 block text-sm font-medium text-white/70">
                                Button Type
                            </span>
                            <select
                                value={button.type || allowedTypes[0]}
                                onChange={(event) =>
                                    onChange(index, "type", event.target.value)
                                }
                                className="w-full rounded-xl border border-white/10 bg-[#171717] px-4 py-3 text-sm text-white focus:border-fuchsia-500/60 focus:outline-none"
                            >
                                {allowedTypes.map((type) => (
                                    <option key={type} value={type}>
                                        {type.replace(/_/g, " ")}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="block">
                            <span className="mb-2 block text-sm font-medium text-white/70">
                                Title
                            </span>
                            <input
                                type="text"
                                value={button.title || ""}
                                onChange={(event) =>
                                    onChange(index, "title", event.target.value)
                                }
                                className="w-full rounded-xl border border-white/10 bg-[#171717] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-fuchsia-500/60 focus:outline-none"
                            />
                        </label>

                        {button.type === "web_url" ? (
                            <label className="block md:col-span-2">
                                <span className="mb-2 block text-sm font-medium text-white/70">
                                    URL
                                </span>
                                <input
                                    type="url"
                                    value={button.url || ""}
                                    onChange={(event) =>
                                        onChange(index, "url", event.target.value)
                                    }
                                    className="w-full rounded-xl border border-white/10 bg-[#171717] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-fuchsia-500/60 focus:outline-none"
                                />
                            </label>
                        ) : null}

                        {button.type === "postback" ? (
                            <label className="block md:col-span-2">
                                <span className="mb-2 block text-sm font-medium text-white/70">
                                    Postback Value
                                </span>
                                <input
                                    type="text"
                                    value={button.payload || ""}
                                    onChange={(event) =>
                                        onChange(index, "payload", event.target.value)
                                    }
                                    className="w-full rounded-xl border border-white/10 bg-[#171717] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-fuchsia-500/60 focus:outline-none"
                                />
                            </label>
                        ) : null}

                        {button.type === "phone_number" && channel === "facebook" ? (
                            <label className="block md:col-span-2">
                                <span className="mb-2 block text-sm font-medium text-white/70">
                                    Phone Number
                                </span>
                                <input
                                    type="text"
                                    value={button.phone_number || ""}
                                    onChange={(event) =>
                                        onChange(index, "phone_number", event.target.value)
                                    }
                                    className="w-full rounded-xl border border-white/10 bg-[#171717] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-fuchsia-500/60 focus:outline-none"
                                />
                            </label>
                        ) : null}
                    </div>

                    <div className="mt-4 flex justify-end">
                        <button
                            type="button"
                            onClick={() => onRemove(index)}
                            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white/75 transition hover:bg-white/[0.08]"
                        >
                            <TrashIcon className="h-4 w-4" />
                            Remove
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
