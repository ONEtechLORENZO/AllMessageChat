import { LinkIcon } from "@heroicons/react/24/outline";

export default function StepEmail({
    setCurrentPage,
    translator,
    googleConfigured,
}) {
    const buttonBase =
        "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition";

    return (
        <div className="space-y-6 p-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white/55">
                Gmail Only
            </div>

            <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-white">
                    {translator?.["Connect Gmail"] ?? "Connect Gmail"}
                </h2>
                <p className="max-w-2xl text-sm leading-6 text-white/60">
                    Gmail is the only supported email integration. We use Google
                    OAuth to link the mailbox, send mail, and sync inbox and sent
                    threads without storing raw SMTP credentials.
                </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                <div className="flex items-start gap-4">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#4285F4]/15 text-[#8ab4ff]">
                        <LinkIcon className="h-6 w-6" />
                    </div>
                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-white">
                            Google OAuth mailbox link
                        </h3>
                        <ul className="space-y-2 text-sm text-white/65">
                            <li>Send email through the Gmail API</li>
                            <li>Sync inbox and sent threads into chat</li>
                            <li>Store OAuth tokens encrypted at rest</li>
                            <li>Never expose tokens back to the frontend</li>
                        </ul>
                    </div>
                </div>
            </div>

            {!googleConfigured && (
                <div className="rounded-3xl border border-amber-500/20 bg-amber-500/10 px-5 py-4 text-sm text-amber-100">
                    Google OAuth is not configured yet. Add the Google client ID,
                    client secret, and redirect URI before linking Gmail.
                </div>
            )}

            <div className="flex justify-between pt-2">
                <button
                    type="button"
                    onClick={() => setCurrentPage(1)}
                    className={`${buttonBase} border border-white/10 bg-white/5 text-white/75 hover:bg-white/10 hover:text-white`}
                >
                    {translator?.["Back"] ?? "Back"}
                </button>

                {googleConfigured ? (
                    <a
                        href={route("connect_gmail")}
                        className={`${buttonBase} bg-[#4285F4] text-white hover:bg-[#3674db]`}
                    >
                        {translator?.["Connect with Google"] ??
                            "Connect with Google"}
                    </a>
                ) : (
                    <button
                        type="button"
                        disabled
                        className={`${buttonBase} cursor-not-allowed bg-white/10 text-white/35`}
                    >
                        {translator?.["Connect with Google"] ??
                            "Connect with Google"}
                    </button>
                )}
            </div>
        </div>
    );
}
