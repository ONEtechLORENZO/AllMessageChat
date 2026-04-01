import { GoMail } from "react-icons/go";

export default function StepEmail({
    setCurrentPage,
    translator,
    googleConfigured,
    lockedService,
}) {
    return (
        <div className="flex flex-col items-center text-center space-y-6 px-4 py-2">

            {/* Title */}
            <div className="space-y-1 pt-2">
                <h1 className="text-2xl font-black uppercase tracking-wider text-white leading-tight">
                    Google OAuth<br />Mailbox Link
                </h1>
            </div>

            {/* Feature list */}
            <ul className="space-y-2 text-sm text-white/65">
                <li>Send email through the Gmail API</li>
                <li>Sync inbox and sent threads into chat</li>
                <li>Store OAuth tokens encrypted at rest</li>
                <li>Never expose tokens back to the frontend</li>
            </ul>

            {/* Warning */}
            {!googleConfigured && (
                <p className="text-sm text-amber-400 leading-relaxed max-w-xs">
                    Google OAuth is not configured yet. Add the Google client ID,
                    client secret, and redirect URI before linking Gmail
                </p>
            )}

            {/* Connect with Google button */}
            <div className="w-full pt-1">
                {googleConfigured ? (
                    <a
                        href={route("connect_gmail")}
                        className="flex items-center justify-center gap-3 w-full rounded-full py-3 px-6 text-sm font-semibold text-white bg-gradient-to-r from-[#f58529] via-[#dd2a7b] to-[#8134af] hover:opacity-90 transition"
                    >
                        <GoMail size={20} />
                        {translator?.["Connect with Google"] ?? "Connect with Google"}
                    </a>
                ) : (
                    <button
                        type="button"
                        disabled
                        className="flex items-center justify-center gap-3 w-full rounded-full py-3 px-6 text-sm font-semibold text-white/40 bg-gradient-to-r from-[#f58529]/40 via-[#dd2a7b]/40 to-[#8134af]/40 cursor-not-allowed"
                    >
                        <GoMail size={20} />
                        {translator?.["Connect with Google"] ?? "Connect with Google"}
                    </button>
                )}
            </div>

            {/* Cancel button */}
            <div className="w-full flex justify-start">
                <button
                    type="button"
                    onClick={() => {
                        if (lockedService) {
                            window.location.href = route("social_profile");
                            return;
                        }
                        setCurrentPage(1);
                    }}
                    className="inline-flex items-center justify-center rounded-full bg-violet-600 hover:bg-violet-500 px-6 py-2.5 text-sm font-semibold text-white transition"
                >
                    {translator?.["Cancel"] ?? "Cancel"}
                </button>
            </div>
        </div>
    );
}
