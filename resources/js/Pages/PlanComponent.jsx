import { Fragment, useEffect, useRef, useState } from "react";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { Dialog, Transition } from "@headlessui/react";
import {
    Elements,
    CardElement,
    useElements,
    useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { router as Inertia } from "@inertiajs/react";
import nProgress from "nprogress";
import axios from "axios";
import notie from "notie";

const PLAN_ORDER = ["PRO", "BUSINESS", "ENTERPRISE", "PLATINUM"];

const PRICING_PLANS = [
    {
        planId: "PRO",
        backendFallbackId: "PRO",
        name: "Pro",
        monthlyBundleChats: "5.000",
        monthlyPrice: 599,
        annualMonthlyPrice: 569.05,
        dedicatedServer: false,
        longTermStorage: false,
        featured: false,
        bestFor: "For small teams that want a reliable starting plan.",
        description:
            "Simple monthly pricing with enough capacity for smaller support and sales teams.",
        summaryPoints: [
            "5,000 bundled active chats per month",
            "Monthly billing available",
            "Easy starting plan for smaller teams",
        ],
        buttonText: "Choose plan",
    },
    {
        planId: "BUSINESS",
        backendFallbackId: "BUSINESS",
        name: "Business",
        monthlyBundleChats: "10.000",
        monthlyPrice: 899,
        annualMonthlyPrice: 854.05,
        dedicatedServer: false,
        longTermStorage: false,
        featured: true,
        bestFor:
            "For growing teams that need more volume and more flexibility.",
        description:
            "A balanced SaaS plan for businesses that want more capacity without moving yet to dedicated infrastructure.",
        summaryPoints: [
            "10,000 bundled active chats per month",
            "Best value for growing companies",
            "Clear monthly or annual billing",
        ],
        buttonText: "Choose plan",
    },
    {
        planId: "ENTERPRISE",
        backendFallbackId: "ENTERPRISE",
        name: "Enterprise",
        monthlyBundleChats: "25.000",
        monthlyPrice: 1999,
        annualMonthlyPrice: 1899.05,
        dedicatedServer: true,
        longTermStorage: true,
        featured: false,
        bestFor: "For larger operations that need infrastructure included.",
        description:
            "Built for teams that need dedicated resources, stronger performance, and long-term data handling.",
        summaryPoints: [
            "25,000 bundled active chats per month",
            "Dedicated server included",
            "Long-term document storage included",
        ],
        buttonText: "Choose plan",
    },
    {
        planId: "PLATINUM",
        backendFallbackId: "CUSTOM",
        name: "Platinum",
        monthlyBundleChats: "40.000",
        monthlyPrice: 2849,
        annualMonthlyPrice: 2706.55,
        dedicatedServer: true,
        longTermStorage: true,
        featured: false,
        bestFor:
            "For high-volume teams that want the highest standard capacity.",
        description:
            "Our most advanced standard plan for organizations managing high conversation volume at scale.",
        summaryPoints: [
            "40,000 bundled active chats per month",
            "Dedicated server included",
            "Long-term document storage included",
        ],
        buttonText: "Choose plan",
    },
];

const ADD_ONS = [
    {
        id: "ADDITIONAL_WABA",
        name: "Additional WABA",
        price: 50,
        description:
            "Monthly cost for each additional WABA outside the selected plan.",
    },
    {
        id: "ADDITIONAL_WA_API_NUMBER",
        name: "Additional WA API number",
        price: 10,
        description: "Monthly cost for each additional WhatsApp API number.",
    },
    {
        id: "ADDITIONAL_INSTAGRAM",
        name: "Additional Instagram integration",
        price: 5,
        description: "Monthly cost for each additional Instagram integration.",
    },
    {
        id: "ADDITIONAL_FACEBOOK",
        name: "Additional Facebook integration",
        price: 5,
        description: "Monthly cost for each additional Facebook integration.",
    },
];

const TEMPLATE_PRICING = [
    {
        id: "MARKETING_TEMPLATE",
        name: "Marketing Template",
        priceLabel: "€0,0572 per message",
    },
    {
        id: "UTILITY_TEMPLATE",
        name: "Utility / Service Template",
        priceLabel: "€0,0319 per message",
    },
];

function t(translator, key) {
    return translator?.[key] ?? key;
}

function normalizePlanId(value) {
    return String(value || "")
        .trim()
        .toUpperCase()
        .replace(/\s+/g, "_");
}

function normalizeBackendPlanId(value) {
    const normalized = normalizePlanId(value);

    const aliasMap = {
        CUSTOM: "PLATINUM",
    };

    return aliasMap[normalized] ?? normalized;
}

function formatEuro(value) {
    if (value === null || value === undefined || value === "") return "-";

    return new Intl.NumberFormat("it-IT", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number(value));
}

function formatEuroNumber(value) {
    if (value === null || value === undefined || value === "") return "-";

    return new Intl.NumberFormat("it-IT", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number(value));
}

function getMonthlySaving(plan) {
    const saving = Number(plan.monthlyPrice) - Number(plan.annualMonthlyPrice);
    return saving > 0 ? saving : 0;
}

function FeatureStatusBadge({ included, translator }) {
    return included ? (
        <span className="inline-flex min-w-[112px] items-center justify-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">
            <CheckIcon className="h-4 w-4" />
            {t(translator, "Included")}
        </span>
    ) : (
        <span className="inline-flex min-w-[112px] items-center justify-center gap-1 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/65">
            <XMarkIcon className="h-4 w-4" />
            {t(translator, "Not included")}
        </span>
    );
}

function IntroPill({ children }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium leading-6 text-white/78">
            {children}
        </div>
    );
}

function PlanCard({ plan, translator, onChoose }) {
    const isFeatured = plan.featured;
    const monthlySaving = getMonthlySaving(plan);

    return (
        <article
            className={[
                "relative flex h-full min-h-[860px] flex-col rounded-[28px] border bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-7",
                isFeatured
                    ? "border-[#d000ff]/55 ring-1 ring-[#d000ff]/30"
                    : "border-white/12",
            ].join(" ")}
        >
            {isFeatured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#ff2bd6] to-[#9d00ff] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-white shadow-[0_10px_25px_rgba(208,0,255,0.35)]">
                    {t(translator, "Most popular")}
                </div>
            )}

            <div className={`flex h-full flex-col ${isFeatured ? "pt-3" : ""}`}>
                <div className="min-h-[250px]">
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1 pr-2">
                            <h2 className="text-3xl font-bold leading-tight text-white">
                                {t(translator, plan.name)}
                            </h2>

                            <p className="mt-3 min-h-[72px] text-sm leading-7 text-white/76">
                                {t(translator, plan.bestFor)}
                            </p>
                        </div>

                        <div className="shrink-0 rounded-full border border-white/20 bg-white/5 px-3 py-2 text-center">
                            <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/60">
                                {t(translator, "Chats")}
                            </div>
                            <div className="text-sm font-bold text-white">
                                {plan.monthlyBundleChats}
                            </div>
                        </div>
                    </div>

                    <p className="mt-5 min-h-[98px] text-sm leading-7 text-white/62">
                        {t(translator, plan.description)}
                    </p>
                </div>

                <div className="mt-6 flex min-h-[320px] flex-col rounded-3xl border border-white/10 bg-black/15 p-5">
                    <div>
                        <div className="text-sm font-semibold text-white/60">
                            {t(translator, "Monthly fee")}
                        </div>

                        <div className="mt-4 flex items-end gap-1.5 whitespace-nowrap">
                            <span className="text-[34px] font-bold leading-none tracking-tight text-white sm:text-[38px] tabular-nums">
                                {formatEuroNumber(plan.monthlyPrice)}
                            </span>
                            <span className="pb-0.5 text-[26px] font-bold leading-none text-white sm:text-[28px]">
                                €
                            </span>
                        </div>

                        <div className="mt-2 text-sm text-white/65">
                            {t(translator, "per month")}
                        </div>
                    </div>

                    <div className="mt-6 rounded-2xl border border-[#d8b4fe]/25 bg-[#7b1fa2]/10 p-4">
                        <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#d7b3ff]">
                            {t(translator, "Annual plan")}
                        </div>

                        <div className="mt-3 flex items-end gap-1.5 whitespace-nowrap">
                            <span className="text-[26px] font-bold leading-none tracking-tight text-white tabular-nums">
                                {formatEuroNumber(plan.annualMonthlyPrice)}
                            </span>
                            <span className="pb-0.5 text-[20px] font-bold leading-none text-white">
                                €
                            </span>
                        </div>

                        <div className="mt-2 text-sm text-white/65">
                            {t(translator, "per month")}
                        </div>

                        <p className="mt-3 text-sm font-medium leading-6 text-emerald-300">
                            {t(translator, "Save")} {formatEuro(monthlySaving)}{" "}
                            {t(translator, "per month")}
                        </p>
                    </div>
                </div>

                <div className="mt-6 min-h-[190px]">
                    <div className="text-sm font-semibold uppercase tracking-[0.14em] text-white/55">
                        {t(translator, "What is included")}
                    </div>

                    <ul className="mt-4 space-y-3">
                        {plan.summaryPoints.map((point) => (
                            <li
                                key={`${plan.planId}-${point}`}
                                className="flex items-start gap-3 text-sm leading-7 text-white/84"
                            >
                                <CheckIcon className="mt-1 h-4 w-4 shrink-0 text-[#d000ff]" />
                                <span>{t(translator, point)}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between gap-4 py-2">
                        <span className="text-sm leading-6 text-white/78">
                            {t(translator, "Dedicated server")}
                        </span>
                        <FeatureStatusBadge
                            included={plan.dedicatedServer}
                            translator={translator}
                        />
                    </div>

                    <div className="my-2 h-px bg-white/8" />

                    <div className="flex items-center justify-between gap-4 py-2">
                        <span className="text-sm leading-6 text-white/78">
                            {t(translator, "Document storage over 30 days")}
                        </span>
                        <FeatureStatusBadge
                            included={plan.longTermStorage}
                            translator={translator}
                        />
                    </div>
                </div>

                <div className="mt-auto pt-8">
                    <button
                        type="button"
                        onClick={() => onChoose(plan.planId)}
                        className={[
                            "w-full rounded-2xl px-6 py-4 text-base font-bold transition",
                            isFeatured
                                ? "bg-gradient-to-r from-[#ff2bd6] to-[#9d00ff] text-white shadow-[0_12px_30px_rgba(208,0,255,0.35)] hover:opacity-95"
                                : "border border-white/20 bg-white/[0.04] text-white hover:border-[#d000ff]/60 hover:bg-white/10",
                        ].join(" ")}
                    >
                        {t(translator, plan.buttonText)}
                    </button>
                </div>
            </div>
        </article>
    );
}

export default function PlanSubscription(props) {
    const [showForm, setShowForm] = useState(false);
    const [subscriptionId, setSubscriptionId] = useState(null);
    const [status, setStatus] = useState("new");

    const availablePlansFromBackend = Array.isArray(props.plans)
        ? props.plans
        : [];
    const hasPlans = availablePlansFromBackend.length > 0;

    const visiblePlans = PRICING_PLANS;

    useEffect(() => {
        if (props.status) {
            setStatus("update");
        }
    }, [props.status]);

    useEffect(() => {
        if (props.errors?.message) {
            notie.alert({
                type: "warning",
                text: props.errors.message,
                time: 5,
            });
        }
    }, [props.errors?.message]);

    function getMatchedBackendPlanId(planId) {
        if (!hasPlans) {
            const matchedStaticPlan = PRICING_PLANS.find(
                (plan) =>
                    normalizePlanId(plan.planId) === normalizePlanId(planId),
            );

            return matchedStaticPlan?.backendFallbackId ?? planId;
        }

        const found = availablePlansFromBackend.find(
            (plan) =>
                normalizeBackendPlanId(
                    plan?.plan ?? plan?.plan_id ?? plan?.name,
                ) === normalizePlanId(planId),
        );

        if (found?.plan_id) return found.plan_id;

        const matchedStaticPlan = PRICING_PLANS.find(
            (plan) => normalizePlanId(plan.planId) === normalizePlanId(planId),
        );

        return matchedStaticPlan?.backendFallbackId ?? planId;
    }

    function checkToChangePlan(nextPlanId) {
        const currentPlanId = normalizeBackendPlanId(
            props.company?.plan ?? props.company?.plan_id,
        );
        const normalizedNextPlanId = normalizeBackendPlanId(nextPlanId);

        if (!currentPlanId || !PLAN_ORDER.includes(currentPlanId)) {
            return true;
        }

        const currentIndex = PLAN_ORDER.indexOf(currentPlanId);
        const nextIndex = PLAN_ORDER.indexOf(normalizedNextPlanId);

        if (nextIndex === -1) return true;

        if (currentIndex < nextIndex) {
            return true;
        }

        if (currentIndex === nextIndex) {
            if (status !== "new") {
                notie.alert({
                    type: "error",
                    text: t(props.translator, "You are already in this plan."),
                    time: 5,
                });
                return false;
            }

            return true;
        }

        notie.alert({
            type: "warning",
            text: t(
                props.translator,
                "You are not able to downgrade your plan.",
            ),
            time: 5,
        });

        return false;
    }

    function buySubscription(planId) {
        const backendPlanId = getMatchedBackendPlanId(planId);

        if (!checkToChangePlan(backendPlanId)) return;

        if (status === "update") {
            confirmToSubscribe(backendPlanId);
            return;
        }

        setSubscriptionId(backendPlanId);
        setShowForm(true);
    }

    function confirmToSubscribe(planId) {
        const confirmUpdate = window.confirm(
            t(props.translator, "Are you sure you want to update your plan?"),
        );

        if (!confirmUpdate) return;

        const url = route("subscribe_plan", { plan: planId });
        const data = {
            status: "update",
            user_id: props.user.id,
        };

        Inertia.post(url, data, {
            onSuccess: () => {
                notie.alert({
                    type: "success",
                    text: t(props.translator, "Your plan has been updated."),
                    time: 5,
                });
            },
            onError: () => {
                notie.alert({
                    type: "error",
                    text: t(
                        props.translator,
                        "Something went wrong while updating the plan.",
                    ),
                    time: 5,
                });
            },
        });
    }

    async function Subscribe() {
        if (!subscriptionId) return;

        try {
            await axios.post(
                route("subscribe_plan", { plan: subscriptionId }),
                {
                    user_id: props.user.id,
                    is_register_step: true,
                    status: "new",
                },
            );

            props.redirectDashBoard();
        } catch (error) {
            notie.alert({
                type: "error",
                text:
                    error?.response?.data?.message ||
                    t(props.translator, "Unable to complete the subscription."),
                time: 5,
            });
        }
    }

    function redirectToHome() {
        if (status === "update") {
            Inertia.get(route("home"), {}, {});
        }
    }

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#08050d] text-white">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-1/2 top-0 h-[380px] w-[380px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(173,58,255,0.24),transparent_70%)]" />
                <div className="absolute -left-24 top-60 h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle_at_center,rgba(114,0,255,0.12),transparent_70%)]" />
                <div className="absolute -right-24 bottom-20 h-[340px] w-[340px] rounded-full bg-[radial-gradient(circle_at_center,rgba(0,92,255,0.10),transparent_72%)]" />
            </div>

            <div className="relative mx-auto max-w-[1640px] px-4 py-14 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl text-center">
                    <button
                        type="button"
                        onClick={redirectToHome}
                        className="mx-auto inline-flex items-center justify-center"
                    >
                        <span className="text-5xl font-semibold tracking-tight sm:text-6xl">
                            <span className="text-[#7c5cff]">all</span>
                            <span className="text-white">message</span>
                        </span>
                    </button>

                    <div className="mx-auto mt-8 max-w-3xl">
                        <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl">
                            {t(
                                props.translator,
                                "Simple pricing for growing teams",
                            )}
                        </h1>

                        <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-white/72">
                            {t(
                                props.translator,
                                "Choose the plan that fits your monthly WhatsApp volume. Clear prices, simple comparison, and no confusion.",
                            )}
                        </p>
                    </div>
                </div>

                <div className="mx-auto mt-10 grid max-w-6xl gap-4 md:grid-cols-3">
                    <IntroPill>
                        <span className="font-semibold text-white">
                            {t(props.translator, "Monthly or annual billing.")}
                        </span>{" "}
                        {t(
                            props.translator,
                            "Annual billing gives you a monthly saving.",
                        )}
                    </IntroPill>

                    <IntroPill>
                        <span className="font-semibold text-white">
                            {t(props.translator, "Easy comparison.")}
                        </span>{" "}
                        {t(
                            props.translator,
                            "You can quickly see which plans include dedicated infrastructure and long-term storage.",
                        )}
                    </IntroPill>

                    <IntroPill>
                        <span className="font-semibold text-white">
                            {t(props.translator, "Business is recommended.")}
                        </span>{" "}
                        {t(
                            props.translator,
                            "It is the best fit for many growing SaaS teams.",
                        )}
                    </IntroPill>
                </div>

                <section className="mt-12">
                    <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h2 className="text-3xl font-bold text-white">
                                {t(props.translator, "Plans")}
                            </h2>
                            <p className="mt-2 text-base leading-7 text-white/68">
                                {t(
                                    props.translator,
                                    "Start with a clear monthly price. Upgrade when your conversation volume grows.",
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="mx-auto grid max-w-[1560px] items-stretch gap-6 xl:grid-cols-2 2xl:grid-cols-4">
                        {visiblePlans.map((plan) => (
                            <PlanCard
                                key={plan.planId}
                                plan={plan}
                                translator={props.translator}
                                onChoose={buySubscription}
                            />
                        ))}
                    </div>
                </section>

                <section className="mt-14 overflow-hidden rounded-3xl border border-white/12 bg-[#110814]/85 shadow-[0_18px_40px_rgba(0,0,0,0.30)]">
                    <div className="border-b border-white/10 px-6 py-6 sm:px-8">
                        <h3 className="text-3xl font-bold text-white">
                            {t(props.translator, "Quick comparison")}
                        </h3>
                        <p className="mt-2 text-base leading-7 text-white/68">
                            {t(
                                props.translator,
                                "See all plans side by side before making your choice.",
                            )}
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left">
                            <thead className="bg-white/5">
                                <tr className="text-sm text-white/75">
                                    <th className="px-5 py-4 font-semibold sm:px-6">
                                        {t(props.translator, "Plan")}
                                    </th>
                                    <th className="px-5 py-4 font-semibold sm:px-6">
                                        {t(
                                            props.translator,
                                            "Bundled active chats",
                                        )}
                                    </th>
                                    <th className="px-5 py-4 font-semibold sm:px-6">
                                        {t(props.translator, "Monthly fee")}
                                    </th>
                                    <th className="px-5 py-4 font-semibold sm:px-6">
                                        {t(props.translator, "Annual plan fee")}
                                    </th>
                                    <th className="px-5 py-4 font-semibold sm:px-6">
                                        {t(
                                            props.translator,
                                            "Dedicated server",
                                        )}
                                    </th>
                                    <th className="px-5 py-4 font-semibold sm:px-6">
                                        {t(
                                            props.translator,
                                            "30+ day document storage",
                                        )}
                                    </th>
                                    <th className="px-5 py-4 font-semibold text-right sm:px-6">
                                        {t(props.translator, "Action")}
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-white/10">
                                {visiblePlans.map((plan) => (
                                    <tr
                                        key={`comparison-${plan.planId}`}
                                        className="text-sm text-white/85"
                                    >
                                        <td className="whitespace-nowrap px-5 py-5 font-semibold text-white sm:px-6">
                                            {t(props.translator, plan.name)}
                                        </td>
                                        <td className="whitespace-nowrap px-5 py-5 sm:px-6">
                                            {plan.monthlyBundleChats}
                                        </td>
                                        <td className="whitespace-nowrap px-5 py-5 sm:px-6">
                                            {formatEuro(plan.monthlyPrice)}
                                        </td>
                                        <td className="px-5 py-5 sm:px-6">
                                            <div className="whitespace-nowrap font-semibold text-white">
                                                {formatEuro(
                                                    plan.annualMonthlyPrice,
                                                )}
                                            </div>
                                            <div className="mt-1 whitespace-nowrap text-xs text-emerald-300">
                                                {t(props.translator, "Save")}{" "}
                                                {formatEuro(
                                                    getMonthlySaving(plan),
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-5 py-5 sm:px-6">
                                            <FeatureStatusBadge
                                                included={plan.dedicatedServer}
                                                translator={props.translator}
                                            />
                                        </td>
                                        <td className="px-5 py-5 sm:px-6">
                                            <FeatureStatusBadge
                                                included={plan.longTermStorage}
                                                translator={props.translator}
                                            />
                                        </td>
                                        <td className="px-5 py-5 text-right sm:px-6">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    buySubscription(plan.planId)
                                                }
                                                className="whitespace-nowrap rounded-xl border border-white/20 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-white transition hover:border-[#d000ff]/60 hover:bg-white/10"
                                            >
                                                {t(props.translator, "Select")}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="mt-12 rounded-3xl border border-white/12 bg-[#110814]/85 p-6 sm:p-8">
                    <div className="max-w-3xl">
                        <h3 className="text-3xl font-bold text-white">
                            {t(props.translator, "Optional add-ons")}
                        </h3>
                        <p className="mt-2 text-base leading-7 text-white/68">
                            {t(
                                props.translator,
                                "These add-ons are billed monthly and can be added on top of the selected plan.",
                            )}
                        </p>
                    </div>

                    <div className="mt-6 grid gap-5 lg:grid-cols-2">
                        {ADD_ONS.map((addOn) => (
                            <div
                                key={addOn.id}
                                className="rounded-3xl border border-white/12 bg-white/[0.03] p-6"
                            >
                                <div className="flex h-full flex-col gap-5 md:flex-row md:items-start md:justify-between">
                                    <div className="max-w-xl">
                                        <h4 className="text-2xl font-bold leading-tight text-white">
                                            {t(props.translator, addOn.name)}
                                        </h4>
                                        <p className="mt-3 text-base leading-7 text-white/72">
                                            {t(
                                                props.translator,
                                                addOn.description,
                                            )}
                                        </p>
                                    </div>

                                    <span className="inline-flex w-fit shrink-0 rounded-full border border-[#d7b3ff]/35 bg-[#d000ff]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#e9cfff]">
                                        {formatEuro(addOn.price)} /{" "}
                                        {t(props.translator, "month")}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 rounded-3xl border border-white/12 bg-white/[0.03] p-6">
                        <h4 className="text-2xl font-bold text-white">
                            {t(props.translator, "Template pricing")}
                        </h4>

                        <ul className="mt-4 space-y-3">
                            {TEMPLATE_PRICING.map((item) => (
                                <li
                                    key={item.id}
                                    className="flex items-start justify-between gap-4 rounded-2xl border border-white/8 bg-black/10 px-4 py-4"
                                >
                                    <span className="text-base font-medium text-white/85">
                                        {t(props.translator, item.name)}
                                    </span>
                                    <span className="shrink-0 text-base font-semibold text-white">
                                        {t(props.translator, item.priceLabel)}
                                    </span>
                                </li>
                            ))}
                        </ul>

                        <p className="mt-5 text-sm leading-7 text-white/68">
                            {t(
                                props.translator,
                                "For Marketing and Utility templates, ONE applies the same Meta pricing with no markup.",
                            )}
                        </p>
                    </div>
                </section>

                <section className="mt-12 rounded-3xl border border-white/12 bg-white/5 p-6 sm:p-8">
                    <div className="grid gap-8 md:grid-cols-2">
                        <div>
                            <h4 className="text-3xl font-bold text-white">
                                One S.r.l.
                            </h4>
                            <div className="mt-5 space-y-3 text-base leading-7 text-white/72">
                                <p>
                                    <span className="font-semibold text-white">
                                        {t(props.translator, "VAT")}:
                                    </span>{" "}
                                    IT10071971211
                                </p>
                                <p>
                                    <span className="font-semibold text-white">
                                        {t(props.translator, "REA")}:
                                    </span>{" "}
                                    1079019
                                </p>
                                <p>
                                    <span className="font-semibold text-white">
                                        {t(props.translator, "Tax Code")}:
                                    </span>{" "}
                                    10071971211
                                </p>
                                <p>
                                    <span className="font-semibold text-white">
                                        {t(props.translator, "Certified Email")}
                                        :
                                    </span>{" "}
                                    one@pec.cloud
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4 text-base leading-7 text-white/72">
                            <p>
                                <span className="font-semibold text-white">
                                    {t(props.translator, "Sales email")}:
                                </span>{" "}
                                <a
                                    className="text-white underline decoration-white/20 underline-offset-4 hover:text-[#f0d7ff]"
                                    href="mailto:sales@otech.one"
                                >
                                    sales@otech.one
                                </a>
                            </p>

                            <p>
                                <span className="font-semibold text-white">
                                    {t(props.translator, "Support email")}:
                                </span>{" "}
                                <a
                                    className="text-white underline decoration-white/20 underline-offset-4 hover:text-[#f0d7ff]"
                                    href="mailto:support@otech.one"
                                >
                                    support@otech.one
                                </a>
                            </p>

                            <p>
                                <span className="font-semibold text-white">
                                    {t(
                                        props.translator,
                                        "Operational office (IT)",
                                    )}
                                    :
                                </span>{" "}
                                Via Fabio Filzi, 27, 20124 Milano MI
                            </p>

                            <p>
                                <span className="font-semibold text-white">
                                    {t(
                                        props.translator,
                                        "Operational office (UK)",
                                    )}
                                    :
                                </span>{" "}
                                Marlborough House, 298 Regents Park Rd, N3 2SZ
                                London
                            </p>
                        </div>
                    </div>
                </section>
            </div>

            {showForm && (
                <BuyPlan
                    setShowForm={setShowForm}
                    Subscribe={Subscribe}
                    translator={props.translator}
                    stripe_public_key={props.stripe_public_key}
                />
            )}
        </div>
    );
}

const BuyPlan = (props) => {
    const [formErrors] = useState({});
    const [stripePromise, setStripePromise] = useState(null);
    const [intent, setIntent] = useState({});
    const cancelButtonRef = useRef(null);

    useEffect(() => {
        if (props.stripe_public_key) {
            setStripePromise(loadStripe(props.stripe_public_key));
            createStripeSetupIntent();
        }
    }, [props.stripe_public_key]);

    async function createStripeSetupIntent() {
        try {
            const response = await axios({
                method: "get",
                url: route("createStripeSetupIntent"),
            });

            if (response.status === 200) {
                setIntent(response.data.intent || {});
            }
        } catch (error) {
            notie.alert({
                type: "error",
                text:
                    error?.response?.data?.message ||
                    t(props.translator, "Unable to initialize card setup."),
                time: 5,
            });
        }
    }

    return (
        <Transition.Root show={true} as={Fragment}>
            <Dialog
                as="div"
                className="relative z-20"
                initialFocus={cancelButtonRef}
                onClose={() => props.setShowForm(false)}
            >
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 z-20 overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel className="relative w-full max-w-xl transform overflow-hidden rounded-3xl border border-white/12 bg-[#120815] text-left shadow-[0_30px_60px_rgba(0,0,0,0.55)] transition-all">
                                <div className="border-b border-white/10 bg-white/5 px-6 py-5">
                                    <Dialog.Title className="text-2xl font-bold text-white">
                                        {t(props.translator, "Add your card")}
                                    </Dialog.Title>
                                    <p className="mt-2 text-sm leading-6 text-white/65">
                                        {t(
                                            props.translator,
                                            "Enter your payment card to continue with the selected plan.",
                                        )}
                                    </p>
                                </div>

                                {Object.keys(formErrors).length > 0 && (
                                    <div className="p-4">
                                        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
                                            {Object.values(formErrors).map(
                                                (error, idx) => (
                                                    <p key={idx}>{error}</p>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="p-6 sm:p-8">
                                    {stripePromise && intent.client_secret ? (
                                        <Elements
                                            stripe={stripePromise}
                                            options={{
                                                clientSecret:
                                                    intent.client_secret,
                                            }}
                                        >
                                            <Form
                                                Subscribe={props.Subscribe}
                                                setShowForm={props.setShowForm}
                                                translator={props.translator}
                                            />
                                        </Elements>
                                    ) : (
                                        <div className="text-base text-white/65">
                                            {t(
                                                props.translator,
                                                "Loading payment form...",
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="border-t border-white/10 bg-white/5 px-6 py-4 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="button"
                                        className="mt-3 inline-flex w-full justify-center rounded-2xl border border-white/20 bg-white/5 px-5 py-3 text-base font-semibold text-white/75 shadow-sm hover:bg-white/10 sm:ml-3 sm:mt-0 sm:w-auto"
                                        onClick={() => props.setShowForm(false)}
                                        ref={cancelButtonRef}
                                    >
                                        {t(props.translator, "Cancel")}
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
};

const Form = (props) => {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);

    const cardElementOptions = {
        style: {
            base: {
                color: "#ffffff",
                fontSize: "18px",
                fontFamily: "inherit",
                "::placeholder": {
                    color: "rgba(255,255,255,0.5)",
                },
            },
            invalid: {
                color: "#fca5a5",
            },
        },
    };

    async function handleSubmit(event) {
        event.preventDefault();

        if (!stripe || !elements) return;

        const element = elements.getElement(CardElement);

        setLoading(true);

        const result = await stripe.createPaymentMethod({
            type: "card",
            card: element,
        });

        if (result.error) {
            notie.alert({
                type: "error",
                text: result.error.message,
                time: 5,
            });
            setLoading(false);
            return;
        }

        try {
            nProgress.start();
            nProgress.inc(0.2);

            const response = await axios({
                method: "post",
                url: route("relatePaymentMethod"),
                data: {
                    id: result.paymentMethod.id,
                },
            });

            nProgress.done(true);

            notie.alert({
                type: "success",
                text: response.data.message,
                time: 5,
            });

            if (response.data.status === true) {
                await props.Subscribe();
                props.setShowForm(false);
            }
        } catch (error) {
            nProgress.done(true);

            notie.alert({
                type: "error",
                text:
                    error?.response?.data?.message ||
                    t(props.translator, "Unable to save the payment method."),
                time: 5,
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <label className="mb-3 block text-sm font-semibold uppercase tracking-[0.14em] text-white/60">
                {t(props.translator, "Card details")}
            </label>

            <div className="rounded-2xl border border-white/15 bg-[#0F0B1A] p-4">
                <CardElement options={cardElementOptions} />
            </div>

            <div className="pt-8">
                <button
                    type="submit"
                    disabled={!stripe || loading}
                    className="flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-[#ff2bd6] to-[#9d00ff] px-8 py-4 text-lg font-bold text-white shadow-[0_12px_25px_rgba(191,0,255,0.35)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading
                        ? t(props.translator, "Loading...")
                        : t(props.translator, "Subscribe")}
                </button>
            </div>
        </form>
    );
};
