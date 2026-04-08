import React from "react";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

export default function showThemedConfirm({
    eyebrow = "Confirm",
    title = "Confirm action",
    message = "Are you sure you want to continue?",
    confirmLabel = "Confirm",
    cancelLabel = "No",
    overlayClassName = "!bg-[rgba(4,1,12,0.18)] !backdrop-blur-none",
    confirmButtonClassName = "bg-[#ff2b3a] hover:bg-[#ff4150]",
}) {
    return new Promise((resolve) => {
        let settled = false;

        const finish = (value) => {
            if (settled) return;
            settled = true;
            resolve(value);
        };

        confirmAlert({
            overlayClassName,
            closeOnEscape: true,
            closeOnClickOutside: true,
            onKeypressEscape: () => finish(false),
            onClickOutside: () => finish(false),
            afterClose: () => finish(false),
            customUI: ({ onClose }) => (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                    <div className="w-full max-w-md rounded-3xl border border-white/30 bg-gradient-to-br from-[#24112d] via-[#1b0b23] to-[#120616] p-6 text-white shadow-[0_30px_80px_rgba(0,0,0,0.55)] ring-1 ring-white/15">
                        <div className="space-y-2">
                            <div className="inline-flex rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-red-200">
                                {eyebrow}
                            </div>
                            <h2 className="text-2xl font-semibold text-white">
                                {title}
                            </h2>
                            <p className="text-sm leading-6 text-white/60">
                                {message}
                            </p>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    finish(false);
                                    onClose();
                                }}
                                className="inline-flex min-w-[120px] items-center justify-center rounded-full border border-white/30 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
                            >
                                {cancelLabel}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    finish(true);
                                    onClose();
                                }}
                                className={`inline-flex min-w-[156px] items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold text-white transition ${confirmButtonClassName}`}
                            >
                                {confirmLabel}
                            </button>
                        </div>
                    </div>
                </div>
            ),
        });
    });
}
