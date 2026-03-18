import React from "react";
import Dropdown from "@/Components/Forms/Dropdown";
import { Link } from "@inertiajs/react";

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
    const selectedService = props.data?.service || "";
    const helperNote = platformNotes[selectedService] || platformNotes.whatsapp;

    const showLinkedProfileSelector =
        (selectedService == "instagram" ||
            selectedService == "facebook" ||
            (selectedService == "whatsapp" &&
                props.company.service_engine == "Facebook")) &&
        selectedService !== "email" &&
        props.socialProfiles;

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h2 className="text-xl font-semibold text-white">
                    Choose platform
                </h2>
                <p className="text-sm text-white/60">
                    Select the channel you want to connect.
                </p>
            </div>

            <div className="space-y-5">
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

                {props.error && (
                    <div className="rounded-2xl border border-red-500/20 bg-red-500/8 px-4 py-3 text-sm text-red-200">
                        {props.error}
                    </div>
                )}

                {showLinkedProfileSelector ? (
                    <>
                        <div>
                            <label
                                htmlFor="profile_list"
                                className="block text-sm font-medium text-white/80"
                            >
                                {props.translator["Choose Linked Profile"]}
                            </label>
                            <div className="mt-3">
                                <select
                                    required={true}
                                    name="profile_list"
                                    className="block h-11 w-full rounded-2xl border border-white/15 bg-[#0F0B1A]/90 px-4 text-white shadow-sm focus:border-white/25 focus:outline-none focus:ring-2 focus:ring-white/10 sm:text-sm"
                                    value={props.data["profile_list"] || ""}
                                    id="profile_list"
                                    onChange={props.formHandler}
                                >
                                    <option value="new" className="bg-[#0F0B1A] text-white">
                                        New profile
                                    </option>

                                    {Object.entries(props.socialProfiles).map(
                                        ([id, account]) => (
                                            <option
                                                key={id}
                                                value={id}
                                                className="bg-[#0F0B1A] text-white"
                                            >
                                                {account.name}
                                            </option>
                                        ),
                                    )}
                                </select>
                            </div>
                        </div>

                        {props.data["profile_list"] &&
                        props.data["profile_list"] != "new" ? null : (
                            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="text-sm text-white/65">
                                        Sign in with Facebook to import the business profile.
                                    </div>
                                    <a
                                        href={route(
                                            "connect_face_book",
                                            props.data["service"],
                                        )}
                                        className="inline-flex items-center justify-center rounded-2xl border border-[#1877F2]/80 bg-[#1877F2] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#166FE5] hover:border-[#166FE5] focus:outline-none focus:ring-2 focus:ring-[#1877F2]/40"
                                    >
                                        <img
                                            className="mr-2.5"
                                            src="https://static.xx.fbcdn.net/rsrc.php/v3/yq/r/_9VQFvOk7ZC.png"
                                            alt=""
                                            width="22"
                                            height="16"
                                        />
                                        {props.translator["Continue with"]} Facebook
                                    </a>
                                </div>
                            </div>
                        )}
                    </>
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
