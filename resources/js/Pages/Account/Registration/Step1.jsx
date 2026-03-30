import React from "react";
import Dropdown from "@/Components/Forms/Dropdown";
import { Link } from "@inertiajs/react";
import {
    PhotoIcon,
    UserGroupIcon,
} from "@heroicons/react/24/solid";

const serivceOption = {
    whatsapp: "Whatsapp",
    instagram: "Instagram",
    facebook: "Facebook",
    email: "Email",
};

const platformNotes = {
    whatsapp: "Best for businesses that need verified outbound messaging and templates.",
    instagram: "Connect an Instagram business profile to manage DMs in one place.",
    facebook: "Bring Facebook page conversations into the workspace.",
    email: "Use your existing mailbox with SMTP settings.",
};

export default function Step1(props) {
    const selectedService = props.lockedService || props.data?.service || "";
    const helperNote = platformNotes[selectedService] || platformNotes.whatsapp;
    const lockedService = Boolean(props.lockedService);
    const isSocialOauthService =
        selectedService === "instagram" || selectedService === "facebook";

    const oauthHref =
        selectedService === "instagram"
            ? route(
                  "connect_instagram",
                  props.data["profile_list"] &&
                      props.data["profile_list"] !== "new"
                      ? { account_id: props.data["profile_list"] }
                      : {},
              )
            : route(
                  "connect_face_book",
                  props.data["profile_list"] &&
                      props.data["profile_list"] !== "new"
                      ? {
                            service: selectedService,
                            account_id: props.data["profile_list"],
                        }
                      : { service: selectedService },
              );

    const oauthButtonClassName =
        selectedService === "instagram"
            ? "inline-flex items-center justify-center rounded-2xl border border-[#f04d64]/70 bg-[linear-gradient(135deg,#f58529_0%,#dd2a7b_45%,#8134af_75%,#515bd4_100%)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-[#dd2a7b]/40"
            : "inline-flex items-center justify-center rounded-2xl border border-[#1877F2]/80 bg-[#1877F2] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#166FE5] hover:border-[#166FE5] focus:outline-none focus:ring-2 focus:ring-[#1877F2]/40";

    const oauthLabel =
        selectedService === "instagram"
            ? "Connect with Instagram"
            : `${props.translator["Continue with"]} Facebook`;

    const oauthHelperText =
        selectedService === "instagram"
            ? "Sign in with Instagram to connect the professional account."
            : "Sign in with Facebook to import the business profile.";

    const heading =
        selectedService === "instagram"
            ? "Connect Instagram"
            : selectedService === "facebook"
              ? "Connect Facebook"
              : selectedService === "email"
                ? "Connect Email"
                : selectedService === "whatsapp"
                  ? "Connect WhatsApp"
                  : "Choose platform";

    const subtitle =
        lockedService
            ? "Complete the setup for this channel only."
            : "Select the channel you want to connect.";

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h2 className="text-xl font-semibold text-white">
                    {heading}
                </h2>
                <p className="text-sm text-white/60">
                    {subtitle}
                </p>
            </div>

            <div className="space-y-5">
                {lockedService ? (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-white/60">
                        <div className="font-medium text-white/85">
                            {serivceOption[selectedService]}
                        </div>
                        <p className="mt-1 leading-6">{helperNote}</p>
                    </div>
                ) : (
                    <div>
                        <label
                            htmlFor="service"
                            className="block text-sm font-medium text-white/80"
                        >
                            {props.translator["Select platform"]}
                        </label>
                        <div className="mt-3">
                            <Dropdown
                                id="service"
                                name="service"
                                options={serivceOption}
                                handleChange={props.formHandler}
                                emptyOption="Select platform"
                                value={selectedService}
                                required={true}
                                className="h-11 rounded-2xl border-white/15 bg-[#0F0B1A]/90 text-base"
                            />
                        </div>
                    </div>
                )}

                {props.error && (
                    <div className="rounded-2xl border border-red-500/20 bg-red-500/8 px-4 py-3 text-sm text-red-200">
                        {props.error}
                    </div>
                )}

                {isSocialOauthService ? (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="text-sm text-white/65">
                                {oauthHelperText}
                            </div>
                            <a
                                href={oauthHref}
                                className={oauthButtonClassName}
                            >
                                {selectedService === "instagram" ? (
                                    <PhotoIcon className="mr-2.5 h-5 w-5" />
                                ) : (
                                    <UserGroupIcon className="mr-2.5 h-5 w-5" />
                                )}
                                {oauthLabel}
                            </a>
                        </div>
                    </div>
                ) : (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-white/60">
                        <div className="font-medium text-white/85">
                            {selectedService ? serivceOption[selectedService] : "WhatsApp"}
                        </div>
                        <p className="mt-1 leading-6">{helperNote}</p>
                    </div>
                )}
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <Link
                    href={route("social_profile")}
                    className="inline-flex items-center justify-center rounded-2xl border border-white/25 bg-transparent px-5 py-3 text-sm font-medium text-white transition hover:border-white/40 hover:bg-white/6"
                >
                    {props.translator["Cancel"]}
                </Link>
                <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-[#140816] transition hover:bg-white/90"
                    onClick={() => props.serviceHandler()}
                >
                    {props.translator["Next"]}
                </button>
            </div>
        </div>
    );
}
