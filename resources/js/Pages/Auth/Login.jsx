import React, { useEffect, useMemo, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { createTranslator, getLocale, setLocale } from '@/i18n/translator';

export default function Login({ status, canResetPassword, translator, locale }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [language, setLanguage] = useState(
        (locale ?? getLocale()).toUpperCase(),
    );
    const t = translator ?? createTranslator({}, getLocale());

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener("mousemove", handleMouseMove);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            reset('password');
        };
    }, []);

    const topError = useMemo(() => {
        return errors.email || errors.password || null;
    }, [errors.email, errors.password]);

    const onHandleChange = (event) => {
        setData(event.target.name, event.target.type === 'checkbox' ? event.target.checked : event.target.value);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    function handleLanguageChange(nextLanguage) {
        setLocale(nextLanguage.toLowerCase());
        setLanguage(nextLanguage);
        window.location.reload();
    }

    return (
        <>
            <Head title="Allmessage Chat - Login" />

            <div className="min-h-screen bg-black text-white relative overflow-hidden flex flex-col font-sans">

                {/* 1. Dynamic Grid Background */}
                <div
                    className="absolute inset-0 opacity-40 pointer-events-none"
                    style={{
                        backgroundSize: "50px 50px",
                        backgroundImage:
                            "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
                        maskImage: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, black 0%, transparent 70%)`,
                        WebkitMaskImage: `radial-gradient(1000px circle at ${mousePosition.x}px ${mousePosition.y}px, black 0%, transparent 80%)`,
                    }}
                />

                {/* 2. Floating Glow Orbs */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div
                        className="absolute h-[600px] w-[600px] rounded-full bg-[#BF00FF] opacity-20 mix-blend-screen blur-[120px] transition-transform duration-700 ease-out"
                        style={{
                            top: "10%",
                            left: "20%",
                            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`
                        }}
                    />
                    <div
                        className="absolute h-[600px] w-[600px] rounded-full bg-[#BF00FF] opacity-20 mix-blend-screen blur-[130px] transition-transform duration-700 ease-out"
                        style={{
                            bottom: "10%",
                            right: "20%",
                            transform: `translate(${mousePosition.x * -0.02}px, ${mousePosition.y * -0.02}px)`
                        }}
                    />
                </div>

                {/* 3. Logo */}
                <div className="absolute top-0 left-0 p-8 z-20">
                    <Link href="/">
                        <img
                            src="/images/logo-w.png"
                            alt="Allmessage Chat"
                            className="h-14 w-auto select-none opacity-90 hover:opacity-100 transition-opacity"
                            draggable="false"
                        />
                    </Link>
                </div>
                <div className="absolute top-0 right-0 p-8 z-20">
                    <div
                        className="inline-grid grid-cols-2 items-stretch rounded-full bg-black/70 ring-1 ring-white/15 overflow-hidden"
                        data-selected={language.toLowerCase()}
                        aria-label={t["Language"] ?? "Language"}
                    >
                        <button
                            type="button"
                            onClick={() => handleLanguageChange("IT")}
                            aria-pressed={language === "IT"}
                            className={`px-2 py-0.5 text-[8px] font-semibold uppercase leading-none transition-colors duration-200 ${
                                language === "IT"
                                    ? "bg-[#38bdf8] text-white rounded-l-full"
                                    : "text-white/60 hover:text-white/90"
                            }`}
                        >
                            IT
                        </button>
                        <button
                            type="button"
                            onClick={() => handleLanguageChange("EN")}
                            aria-pressed={language === "EN"}
                            className={`px-2 py-0.5 text-[8px] font-semibold uppercase leading-none transition-colors duration-200 ${
                                language === "EN"
                                    ? "bg-[#38bdf8] text-white rounded-r-full"
                                    : "text-white/60 hover:text-white/90"
                            }`}
                        >
                            EN
                        </button>
                    </div>
                </div>

                {/* 4. Main Content Area */}
                <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pb-32">

                    {/* Hero Text */}
                    <div className="mb-10 text-center relative z-20 animate-tech-focus">
                        <h2 className="text-3xl md:text-3xl font-bold mb-4 flex items-baseline justify-center flex-wrap gap-3">
                            The all in{" "}
                            <span className="tech-gradient-text text-7xl md:text-8xl px-2 pb-2 font-extrabold tracking-tighter">
                                ONE
                            </span>{" "}
                            platform
                        </h2>
                    </div>

                    {/* Login Card */}
                    <div className="w-full max-w-[420px]">
                        {/* Removed 'border border-white/10' and 'ring-1 ring-white/5' classes below */}
                        <div className="relative rounded-3xl bg-white/5 backdrop-blur-3xl shadow-[0_0_80px_-20px_rgba(191,0,255,0.3)] overflow-hidden group transition-all duration-500 hover:shadow-[0_0_100px_-20px_rgba(191,0,255,0.5)]">

                            {/* Card Top Border Gradient */}
                            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#BF00FF]/50 to-transparent opacity-70" />

                            <div className="p-8 sm:p-10 relative z-10">
                                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-center mb-8">
                                    {t["Welcome back"] ?? "Welcome back"}
                                </h1>

                                {/* Status Messages */}
                                {status && (
                                    <div className="mb-6 rounded-xl border border-cyan-300/30 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100 flex items-center gap-3">
                                        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {status}
                                    </div>
                                )}

                                {/* Error Messages */}
                                {topError && (
                                    <div className="mb-6 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100 flex items-center gap-3">
                                        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {topError}
                                    </div>
                                )}

                                <form onSubmit={submit} className="space-y-5">

                                    {/* Email Input */}
                                    <div className="relative group/input">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within/input:text-white/90 transition-colors pointer-events-none duration-300">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <input
                                            name="email"
                                            type="text"
                                            value={data.email}
                                            onChange={onHandleChange}
                                            required
                                            placeholder={
                                                t["Email address"] ??
                                                "Email address"
                                            }
                                            className="w-full rounded-2xl border border-white/10 bg-white/[0.03] pl-12 pr-5 py-4 text-base text-white placeholder:text-white/30 outline-none transition-all duration-300 focus:border-[#BF00FF]/50 focus:bg-white/[0.08] focus:ring-4 focus:ring-[#BF00FF]/10 hover:border-white/20 hover:bg-white/[0.05]"
                                        />
                                    </div>

                                    {/* Password Input */}
                                    <div className="relative group/input">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within/input:text-white/90 transition-colors pointer-events-none duration-300">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        </div>
                                        <input
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            value={data.password}
                                            onChange={onHandleChange}
                                            required
                                            placeholder={t["Password"] ?? "Password"}
                                            className="w-full rounded-2xl border border-white/10 bg-white/[0.03] pl-12 pr-12 py-4 text-base text-white placeholder:text-white/30 outline-none transition-all duration-300 focus:border-[#BF00FF]/50 focus:bg-white/[0.08] focus:ring-4 focus:ring-[#BF00FF]/10 hover:border-white/20 hover:bg-white/[0.05]"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-0 top-0 bottom-0 px-4 text-white/40 hover:text-white transition-colors focus:outline-none"
                                        >
                                            {showPassword ? (
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                            )}
                                        </button>
                                    </div>

                                    {/* Remember Me & Forgot Password */}
                                    <div className="flex items-center justify-between text-sm">
                                        <label className="flex items-center cursor-pointer group/check">
                                            <input
                                                type="checkbox"
                                                name="remember"
                                                checked={data.remember}
                                                onChange={onHandleChange}
                                                className="w-4 h-4 rounded border-white/10 bg-white/5 text-[#BF00FF] focus:ring-[#BF00FF]/50 transition-all"
                                            />
                                            <span className="ml-2 text-white/50 group-hover/check:text-white/80 transition-colors">
                                                {t["Remember me"] ?? "Remember me"}
                                            </span>
                                        </label>
                                        {canResetPassword && (
                                            <Link
                                                href={route("password.request")}
                                                className="font-medium text-[#BF00FF] hover:text-[#d946ef] transition-colors hover:underline underline-offset-4"
                                            >
                                                {t["Forgot password?"] ??
                                                    "Forgot password?"}
                                            </Link>
                                        )}
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="relative w-full rounded-2xl px-5 py-4 text-base font-bold tracking-wide overflow-hidden text-white shadow-[0_0_20px_rgba(191,0,255,0.3)] hover:shadow-[0_0_30px_rgba(191,0,255,0.5)] active:scale-[0.99] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed animate-tech-focus group/btn"
                                    >
                                        {/* Button Background */}
                                        <div className="absolute inset-0 tech-gradient-bg opacity-100 animate-liquid-gradient pointer-events-none rounded-2xl" />

                                        {/* Hover Shine Effect */}
                                        <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-20 bg-gradient-to-r from-transparent via-white to-transparent -skew-x-12 translate-x-[-100%] transition-opacity pointer-events-none rounded-2xl" />

                                        <span className="relative z-10 flex items-center justify-center gap-2">
                                            {processing && (
                                                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            )}
                                            {processing
                                                ? t["Signing in..."] ??
                                                  "Signing in..."
                                                : t["Sign in"] ?? "Sign in"}
                                        </span>
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="absolute bottom-6 left-0 right-0 z-20 text-center px-4 pointer-events-none">
                    <div className="pointer-events-auto space-y-4">
                        <p className="text-xs text-white/40 leading-relaxed max-w-sm mx-auto">
                            By continuing, you agree to the <a href="#" className="hover:text-white transition-colors underline decoration-white/10 underline-offset-2">Privacy Policy</a> and <a href="#" className="hover:text-white transition-colors underline decoration-white/10 underline-offset-2">Terms of Use</a>.
                        </p>
                        <p className="text-xs text-white/40 font-light">
                            Any questions? Write to <a href="mailto:support@otech.one" className="text-white/60 hover:text-[#c084fc] transition-colors border-b border-white/10 hover:border-[#c084fc] pb-0.5">support@otech.one</a>
                        </p>
                    </div>
                </div>
            </div>

            {/* Self-contained Styles with Autofill Fix */}
            <style>{`
                /* FIX: Override Chrome/Safari Autofill Background & Text Color */
                input:-webkit-autofill,
                input:-webkit-autofill:hover, 
                input:-webkit-autofill:focus, 
                input:-webkit-autofill:active {
                    -webkit-text-fill-color: white !important;
                    caret-color: white !important;
                    transition: background-color 9999s ease-in-out 0s;
                }

                /* Gradient Definition */
                .tech-gradient-text {
                    background: linear-gradient(to right, #BF00FF, #6366f1, #d946ef, #BF00FF);
                    background-size: 200% auto;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    filter: drop-shadow(0 0 10px rgba(191, 0, 255, 0.3));
                    animation: liquid-gradient 3s linear infinite;
                }

                .tech-gradient-bg {
                    background: linear-gradient(to right, #BF00FF, #6366f1, #d946ef, #BF00FF);
                    background-size: 200% auto;
                }

                /* Keyframes */
                @keyframes liquid-gradient {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }

                @keyframes tech-focus {
                    0% {
                        filter: blur(12px) brightness(2);
                        opacity: 0;
                        transform: scale(0.95);
                        letter-spacing: 0.1em;
                    }
                    40% {
                        opacity: 0.8;
                        filter: blur(4px) brightness(1.5);
                    }
                    100% {
                        filter: blur(0) brightness(1);
                        opacity: 1;
                        transform: scale(1);
                        letter-spacing: normal;
                    }
                }

                .animate-tech-focus {
                    animation: tech-focus 1.2s cubic-bezier(0.16, 1, 0.3, 1) both;
                }

                .animate-liquid-gradient {
                    animation: liquid-gradient 3s linear infinite;
                }
            `}</style>
        </>
    );
}












