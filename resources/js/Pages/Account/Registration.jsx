import React, { useEffect, useMemo, useState } from "react";
import Authenticated from "@/Layouts/Authenticated";
import Input from "@/Components/Forms/Input";
import PristineJS from "pristinejs";
import { Head, useForm, Link } from "@inertiajs/react";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import Dropdown from "@/Components/Forms/Dropdown";
import InputError from "@/Components/Forms/InputError";
import { defaultPristineConfig } from "@/Pages/Constants";
import axios from "axios";

function Registration(props) {
    const { data, setData, post, processing, errors, register, reset } =
        useForm({
            id: "",
            company_name: "",
            company_type: "",
            website: "",
            email: "",
            service: "",
            estimated_launch_date: "",
            type_of_integration: "",
            phone_number: "",
            //  src_name: '',
            display_name: "",
            business_manager_id: "",
            profile_picture: "",
            profile_description: "",
            api_partner_name: "",
            api_partner: false,
            terms_condition: false,
            oba: false,
            api_token: "",
            callback_url: "",
            meta_page_id: "",
            meta_page_name: "",
            instagram_account_id: "",
            instagram_username: "",
            instagram_name: "",
            enqueued: false,
            failed: false,
            read: false,
            sent: false,
            delivered: false,
            delete: false,
            template_events: false,
            account_related_events: false,
        });

    const company_types = {
        "Sole Proprietorship": props.translator["Sole Proprietorship"],
        Partnership: props.translator["Partnership"],
        "Limited Liability Company (LLC)":
            props.translator["Limited Liability Company (LLC)"],
        Corporation: props.translator["Corporation"],
    };

    const integrations = {
        Website: props.translator["Website"],
        Support: props.translator["Support"],
    };

    const services = {
        whatsapp: "WhatsApp",
        instagram: "Instagram",
        facebook: "Facebook",
        email: "Email",
    };

    const service_engine = {
        gupshup: "GupShup",
        facebook: "Facebook",
    };

    const statusOptions = {
        New: "New",
        Draft: "Draft",
        Active: "Active",
        Inactive: "Inactive",
    };

    const [checked, setChecked] = useState(false);
    const [facebookSetup, setFacebookSetup] = useState(
        props.facebook_setup || null,
    );
    const [facebookSetupLoading, setFacebookSetupLoading] = useState(false);
    const [facebookSetupError, setFacebookSetupError] = useState("");
    const [facebookAutoSelecting, setFacebookAutoSelecting] = useState(false);
    const [facebookAutoSelectionKey, setFacebookAutoSelectionKey] =
        useState("");
    const [instagramSetup, setInstagramSetup] = useState(
        props.instagram_setup || null,
    );
    const [instagramSetupLoading, setInstagramSetupLoading] = useState(false);
    const [instagramSetupError, setInstagramSetupError] = useState("");
    const gmailConnected = Boolean(data.gmail_connected);
    const gmailConnectUrl = data.id
        ? route("connect_gmail", { account_id: data.id })
        : route("connect_gmail");
    const lastSyncLabel = data.sync_last_at
        ? new Date(data.sync_last_at).toLocaleString()
        : "";
    const facebookPageOptions = useMemo(() => {
        const options = {};

        (facebookSetup?.available_pages || []).forEach((page) => {
            options[page.id] = page.name;
        });

        return options;
    }, [facebookSetup]);
    const facebookReconnectUrl = data.id
        ? route("connect_face_book", { service: "facebook", account_id: data.id })
        : route("connect_face_book", "facebook");
    const facebookSetupStatus = facebookSetup?.status || data.connection_status;
    const facebookSelectedPageId =
        facebookSetup?.page_id || data.fb_phone_number_id || "";
    const facebookSelectedPageName =
        facebookSetup?.page_name || data.fb_page_name || "";
    const facebookAccountName =
        facebookSetup?.account_name || data.profile_name || data.company_name;
    const facebookRequiresCompletion =
        data.service === "facebook" &&
        (facebookSetupStatus === "oauth_connected_pending_page" ||
            (!facebookSelectedPageName && !facebookSelectedPageId));
    const hasAvailableFacebookPages =
        (facebookSetup?.available_pages || []).length > 0;
    const facebookNeedsNewConnect =
        facebookSetupStatus === "connection_error" ||
        (!facebookSetupLoading &&
            !hasAvailableFacebookPages &&
            !facebookRequiresCompletion);
    const facebookSingleAvailablePage =
        (facebookSetup?.available_pages || []).length === 1
            ? facebookSetup.available_pages[0]
            : null;
    const instagramConnectUrl = data.id
        ? route("connect_instagram", { account_id: data.id })
        : route("connect_instagram");
    const instagramSetupStatus =
        instagramSetup?.status || data.connection_status || "incomplete";
    const instagramSetupMessage =
        instagramSetup?.message ||
        data.connection_error ||
        "Connect Instagram to continue.";
    const instagramRequiresReconnect = Boolean(
        instagramSetup?.requires_reconnect ?? data.requires_reconnect,
    );
    const instagramSelectedAccountId =
        instagramSetup?.selected_instagram_account?.id ||
        data.instagram_account_id ||
        "";
    const instagramSelectedAccountName =
        instagramSetup?.selected_instagram_account?.name ||
        data.instagram_name ||
        "";
    const instagramSelectedUsername =
        instagramSetup?.selected_instagram_account?.username ||
        data.instagram_username ||
        "";
    const instagramOAuthConnected = Boolean(instagramSetup?.oauth_connected);
    const instagramConnected =
        instagramSetupStatus === "connected" &&
        Boolean(instagramSelectedAccountId || data.instagram_account_id);
    const facebookStatusBadgeMeta =
        facebookSetupStatus === "connected"
            ? {
                  label: "Connected",
                  className: "bg-emerald-500/15 text-emerald-200",
              }
            : facebookNeedsNewConnect
              ? {
                    label: "Not connected",
                    className: "bg-slate-500/15 text-slate-100",
                }
              : {
                    label: "Needs setup",
                    className: "bg-amber-500/15 text-amber-200",
                };

    useEffect(() => {
        let newData = Object.assign({}, data);
        if (typeof props.account !== "undefined") {
            newData = Object.assign({}, props.account);
        }

        if (props.events) {
            Object.entries(props.events).map(function ([index, value]) {
                if (index == "callback_url") {
                    newData[index] = value;
                } else if (
                    index != "id" &&
                    index != "created_at" &&
                    index != "updated_at" &&
                    index != "account_id"
                ) {
                    newData[index] = value == 1 ? true : false;
                }
            });
        }
        setData(newData);

        if (newData.service === "facebook" && newData.id) {
            refreshFacebookSetup(newData.id);
        }

        if (newData.service === "instagram" && newData.id) {
            refreshInstagramSetup(newData.id);
        }
    }, []);

    function refreshFacebookSetup(accountId) {
        setFacebookSetupLoading(true);
        setFacebookSetupError("");

        axios
            .get(route("meta_facebook_setup", { account: accountId }))
            .then((response) => {
                const setup = response.data;
                setFacebookSetup(setup);
                setData((prev) => ({
                    ...prev,
                    connection_status: setup.status,
                    connection_status_label: setup.status_label,
                    fb_phone_number_id: setup.page_id || prev.fb_phone_number_id || "",
                    fb_page_name: setup.page_name || prev.fb_page_name || "",
                    page_label: setup.page_name || "Not selected",
                }));
            })
            .catch(() => {
                setFacebookSetupError(
                    "Unable to load the Facebook Page selection state.",
                );
            })
            .finally(() => setFacebookSetupLoading(false));
    }

    function refreshInstagramSetup(accountId) {
        setInstagramSetupLoading(true);
        setInstagramSetupError("");

        axios
            .get(route("instagram_status", { account: accountId }))
            .then((response) => {
                const setup = response.data;
                setInstagramSetup(setup);
                setData((prev) => ({
                    ...prev,
                    requires_reconnect: Boolean(setup.requires_reconnect),
                    connection_status: setup.status,
                    connection_status_label: setup.status_label,
                    instagram_account_id:
                        setup.selected_instagram_account?.id || "",
                    instagram_username:
                        setup.selected_instagram_account?.username || "",
                    instagram_name:
                        setup.selected_instagram_account?.name || "",
                }));
            })
            .catch(() => {
                setInstagramSetupError(
                    "Unable to load the Instagram connection state.",
                );
            })
            .finally(() => setInstagramSetupLoading(false));
    }

    function saveFacebookPageSelection(pageId = data.fb_phone_number_id, { auto = false } = {}) {
        if (!data.id || !pageId) {
            setFacebookSetupError(
                "Select a Facebook Page to finish setup.",
            );
            return;
        }

        if (auto) {
            setFacebookAutoSelecting(true);
        }

        setFacebookSetupLoading(true);
        setFacebookSetupError("");

        axios
            .post(route("meta_facebook_page", { account: data.id }), {
                page_id: pageId,
            })
            .then((response) => {
                const setup = response.data.setup;
                setFacebookSetup(setup);
                setData((prev) => ({
                    ...prev,
                    status: response.data.account.status,
                    connection_status: setup.status,
                    connection_status_label: setup.status_label,
                    fb_phone_number_id: setup.page_id || "",
                    fb_page_name: setup.page_name || "",
                    page_label: setup.page_name || "Not selected",
                }));
            })
            .catch((error) => {
                setFacebookSetupError(
                    error.response?.data?.message ||
                        (auto
                            ? "Facebook account connected, but we could not finish setup automatically. Please choose the Facebook Page manually."
                            : "Unable to save the selected Facebook Page."),
                );
            })
            .finally(() => {
                setFacebookSetupLoading(false);
                if (auto) {
                    setFacebookAutoSelecting(false);
                }
            });
    }

    useEffect(() => {
        if (
            data.service !== "facebook" ||
            !data.id ||
            facebookSetupStatus !== "oauth_connected_pending_page" ||
            !facebookSingleAvailablePage ||
            facebookSetupLoading ||
            facebookAutoSelecting
        ) {
            return;
        }

        const nextKey = `${data.id}:${facebookSingleAvailablePage.id}`;
        if (facebookAutoSelectionKey === nextKey) {
            return;
        }

        setFacebookAutoSelectionKey(nextKey);
        setData((prev) => ({
            ...prev,
            fb_phone_number_id: facebookSingleAvailablePage.id,
            fb_page_name:
                facebookSingleAvailablePage.name || prev.fb_page_name || "",
        }));
        saveFacebookPageSelection(facebookSingleAvailablePage.id, {
            auto: true,
        });
    }, [
        data.service,
        data.id,
        facebookSetupStatus,
        facebookSingleAvailablePage,
        facebookSetupLoading,
        facebookAutoSelecting,
        facebookAutoSelectionKey,
    ]);

    /**
     * Validate the form and submit
     */
    function validateAndSubmitForm() {
        if (facebookRequiresCompletion) {
            setFacebookSetupError(
                hasAvailableFacebookPages
                    ? "Select a Facebook Page to finish setup."
                    : "Facebook account connected, but no Pages were returned. Check Page access and permissions, then connect Facebook again.",
            );
            return false;
        }

        if (data.service === "instagram" && !instagramConnected) {
            setInstagramSetupError(
                instagramSetupMessage ||
                    "Finish the Instagram setup steps before saving.",
            );
            return false;
        }

        // if(!data.id){
        //     if((document.getElementById("terms_condition").checked)==false)
        //     {
        //     notie.alert({type: 'warning', text: 'Please read and agree to our terms and conditions',position:'top'});
        //     }
        // }

        var pristine = new PristineJS(
            document.getElementById("account_registration"),
            defaultPristineConfig,
        );
        let is_validated = pristine.validate(
            document.querySelectorAll(
                'input[data-pristine-required="true"], select[data-pristine-required="true"], textarea[data-pristine-required="true"]',
            ),
        );

        if (!is_validated) {
            return false;
        }
        post(route("store_account_registration"));
    }

    /**
     * Handle input change
     */
    function handleChange(event) {
        const name = event.target.name;
        const value =
            event.target.type === "checkbox"
                ? event.target.checked
                : event.target.value;
        let newState = Object.assign({}, data);
        if (event.target.type == "file" && event.target.files) {
            newState[name] = event.target.files[0];
        } else {
            newState[name] = value;
        }
        if (name == "fb_phone_number_id") {
            newState["fb_page_name"] =
                facebookPageOptions[value] || props.pages[value] || "";
        }
        if (
            name == "business_manager_id" &&
            value &&
            props.whatsapp_account_id[value]
        ) {
            newState["fb_business_name"] = value
                ? props.whatsapp_account_id[value]["name"]
                : "";
        }
        if (
            name == "fb_phone_number_id" &&
            data.business_manager_id &&
            props.whatsapp_account_id[data.business_manager_id]
        ) {
            newState["fb_waba_name"] =
                props.whatsapp_account_id[data.business_manager_id][
                    "whatsapp_account"
                ][value]["name"];
            newState["fb_whatsapp_account_id"] =
                props.whatsapp_account_id[data.business_manager_id][
                    "whatsapp_account"
                ][value]["waba_id"];
        }

        setData(newState);
    }

    return (
        <Authenticated
            auth={props.auth}
            errors={props.errors}
            header={
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => window.history.back()}
                        className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/10 px-3 py-2 text-sm font-medium text-white/90 transition hover:bg-white/20"
                    >
                        <ArrowLeftIcon className="h-4 w-4" />
                        Back
                    </button>
                    <h2 className="font-semibold text-xl text-white leading-tight">
                        {props.translator["Account Registration"]}
                    </h2>
                </div>
            }
        >
            <Head title={props.translator["Account Registration"]} />
            <div className="py-12 px-24">
                <form
                    className="space-y-6"
                    action="#"
                    method="POST"
                    id="account_registration"
                >
                    <input type="hidden" value={data.id} name="id" />
                    <div className="space-y-10">
                        {/* ── Account Information ── */}
                        <div className="md:grid md:grid-cols-3 md:gap-8">
                            {/* Left: bare text, no box */}
                            <div className="md:col-span-1">
                                <h3 className="text-xl font-black uppercase tracking-wide text-white">
                                    {props.translator["Account Information"]}
                                </h3>
                                <p className="mt-2 text-sm leading-6 text-white/50">
                                    {props.translator["Enter your company information. We will be using this information to create your business account"]}
                                </p>
                            </div>

                            {/* Right: themed card */}
                            <div className="mt-6 md:mt-0 md:col-span-2">
                                <div className="relative overflow-hidden rounded-2xl bg-[#7c3aed] p-7 shadow-[0_12px_40px_rgba(124,58,237,0.4)]">
                                    {/* Decorative people icon */}
                                    <div className="pointer-events-none absolute right-4 top-4 opacity-20">
                                        <svg viewBox="0 0 80 60" className="h-28 w-28 text-white" fill="currentColor">
                                            <circle cx="28" cy="18" r="13"/>
                                            <path d="M0 56c0-15.464 12.536-28 28-28s28 12.536 28 28H0Z"/>
                                            <circle cx="56" cy="14" r="10" opacity="0.7"/>
                                            <path d="M38 56c0-12.15 8.059-22.5 19.5-26.5C75.5 33.5 80 44 80 56H38Z" opacity="0.7"/>
                                        </svg>
                                    </div>

                                    <div className="relative z-10 grid grid-cols-6 gap-5">
                                        <div className="form-group col-span-6 sm:col-span-4">
                                            <label htmlFor="company_name" className="block text-sm font-semibold text-white/90">
                                                {props.translator["Name"]}
                                                <span className="text-red-300 mx-1">*</span>
                                            </label>
                                            <div className="mt-2">
                                                <Input
                                                    name="company_name"
                                                    value={data.company_name}
                                                    required={true}
                                                    id="company_name"
                                                    placeholder={props.translator["Enter your Account name"]}
                                                    handleChange={handleChange}
                                                    className="!bg-white/15 !border-white/10 ring-1 ring-white/10 text-white placeholder:text-white/40 !focus:ring-white/30 backdrop-blur-sm rounded-xl"
                                                />
                                            </div>
                                            <InputError message={errors.company_name} />
                                        </div>

                                        {props.auth.user.role == "admin" && (
                                            <>
                                                {/* <div className="form-group col-span-6 sm:col-span-4">
                                                    <label htmlFor="service_engine" className="block text-sm font-medium text-gray-700" >
                                                        Service Engine
                                                        <span className="text-sm text-red-700 mx-1"> * </span>
                                                    </label>
                                                    <div className="mt-1">
                                                        <Dropdown
                                                            required={true}
                                                            id="service_engine"
                                                            name="service_engine"
                                                            handleChange={handleChange}
                                                            options={service_engine}
                                                            value={(data.service_engine) ? data.service_engine : 'gupshup'}
                                                        />
                                                    </div>
                                                    <InputError message={errors.service_engine} />
                                                </div>
                                                <div className="form-group col-span-6 sm:col-span-4">
                                                    <label htmlFor="status" className="block text-sm font-medium text-gray-700" >
                                                        Status
                                                    </label>
                                                    <div className="mt-1">
                                                        <Dropdown
                                                            required={true}
                                                            id="status"
                                                            name="status"
                                                            handleChange={handleChange}
                                                            options={statusOptions}
                                                            value={(data.status) ? data.status : 'New'}

                                                        />
                                                    </div>
                                                    <InputError message={errors.status} />
                                                </div> */}
                                            </>
                                        )}
                                        <div className="form-group col-span-6 sm:col-span-4">
                                            <label
                                                htmlFor="services"
                                                className="block text-sm font-semibold text-white/90"
                                            >
                                                {props.translator["Service"]}
                                                <span className="text-red-300 mx-1">
                                                    {" "}
                                                    *{" "}
                                                </span>
                                            </label>
                                            <div className="mt-1">
                                                <Dropdown
                                                    required={true}
                                                    id="service"
                                                    name="service"
                                                    handleChange={handleChange}
                                                    options={services}
                                                    value={data.service}
                                                    readOnly={"disabled"}
                                                    className="disabled:opacity-100 disabled:text-white"
                                                />
                                            </div>
                                            <InputError
                                                message={errors.service}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {data.service == "whatsapp" ? (
                            <div className="md:grid md:grid-cols-3 md:gap-8">
                                {/* Left: bare text */}
                                <div className="md:col-span-1">
                                    <h3 className="text-xl font-black uppercase tracking-wide text-white">
                                        {props.translator["Whatsapp Information"]}
                                    </h3>
                                    <p className="mt-2 text-sm leading-6 text-white/50">
                                        {props.translator["Information will be used to create your whatsapp business account"]}
                                    </p>
                                </div>

                                {/* Right: themed dark card */}
                                <div className="mt-6 md:mt-0 md:col-span-2">
                                    <div className="relative overflow-hidden rounded-2xl bg-[#1a0a2e] p-7 shadow-[0_12px_40px_rgba(0,0,0,0.4)]">
                                        {/* WhatsApp decorative icon */}
                                        <div className="pointer-events-none absolute right-4 top-4 opacity-[0.07]">
                                            <svg viewBox="0 0 24 24" className="h-36 w-36 text-white" fill="currentColor">
                                                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 15 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M8.53 7.33C8.37 7.33 8.1 7.39 7.87 7.64C7.65 7.89 7 8.5 7 9.71C7 10.93 7.89 12.1 8 12.27C8.14 12.44 9.76 14.94 12.25 16C12.84 16.27 13.3 16.42 13.66 16.53C14.25 16.72 14.79 16.69 15.22 16.63C15.7 16.56 16.68 16.03 16.89 15.45C17.1 14.87 17.1 14.38 17.04 14.27C16.97 14.17 16.81 14.1 16.56 13.98C16.31 13.86 15.09 13.26 14.87 13.18C14.64 13.1 14.5 13.06 14.31 13.31C14.22 13.46 13.9 13.93 13.73 14.12C13.57 14.31 13.41 14.33 13.16 14.21C12.91 14.1 12.07 13.83 11.07 12.9C10.33 12.2 9.81 11.37 9.65 11.12C9.49 10.87 9.65 10.74 9.78 10.61C9.89 10.5 10.03 10.33 10.15 10.17C10.27 10.01 10.31 9.89 10.39 9.73C10.47 9.56 10.43 9.4 10.37 9.28C10.31 9.17 9.8 7.94 9.59 7.43C9.38 6.93 9.17 7 9 6.99C8.84 6.99 8.68 6.99 8.53 7.33Z"/>
                                            </svg>
                                        </div>
                                        <div className="relative z-10 grid grid-cols-6 gap-5">
                                            {props.company.service_engine ==
                                                "Facebook" &&
                                            data.service_engine ==
                                                "facebook" ? (
                                                <>
                                                    <div className="form-group col-span-6 sm:col-span-4">
                                                        <label
                                                            htmlFor="business_manager_id"
                                                            className="block text-sm font-semibold text-white/90"
                                                        >
                                                            Business Manager
                                                        </label>
                                                        <div className="mt-1 flex rounded-md shadow-sm">
                                                            <select
                                                                required={true}
                                                                name="business_manager_id"
                                                                className="mt-2 block w-full rounded-xl bg-white/8 px-4 py-2.5 text-sm text-white border border-white/10 ring-1 ring-white/10 focus:outline-none backdrop-blur-sm"
                                                                value={
                                                                    data.business_manager_id
                                                                }
                                                                id="business_manager_id"
                                                                onChange={
                                                                    handleChange
                                                                }
                                                            >
                                                                <option value="">
                                                                    {" "}
                                                                    Select{" "}
                                                                </option>

                                                                {Object.entries(
                                                                    props.whatsapp_account_id,
                                                                ).map(
                                                                    ([
                                                                        id,
                                                                        account,
                                                                    ]) => {
                                                                        return (
                                                                            <option
                                                                                value={
                                                                                    id
                                                                                }
                                                                            >
                                                                                {" "}
                                                                                {
                                                                                    account.name
                                                                                }{" "}
                                                                            </option>
                                                                        );
                                                                    },
                                                                )}
                                                            </select>
                                                        </div>
                                                        <InputError
                                                            message={
                                                                errors.business_manager_id
                                                            }
                                                        />
                                                    </div>
                                                    {data.business_manager_id && (
                                                        <div className="form-group col-span-6 sm:col-span-4">
                                                            <label
                                                                htmlFor="fb_phone_number_id"
                                                                className="block text-sm font-semibold text-white/90"
                                                            >
                                                                Whatsapp Account
                                                            </label>

                                                            <div className="mt-1 flex rounded-md shadow-sm">
                                                                <select
                                                                    required={
                                                                        true
                                                                    }
                                                                    name="fb_phone_number_id"
                                                                    className="mt-2 block w-full rounded-xl bg-white/8 px-4 py-2.5 text-sm text-white border border-white/10 ring-1 ring-white/10 focus:outline-none backdrop-blur-sm"
                                                                    value={
                                                                        data.fb_phone_number_id
                                                                    }
                                                                    id="fb_phone_number_id"
                                                                    onChange={
                                                                        handleChange
                                                                    }
                                                                >
                                                                    <option value="">
                                                                        {" "}
                                                                        Select{" "}
                                                                    </option>

                                                                    {Object.entries(
                                                                        props
                                                                            .whatsapp_account_id[
                                                                            data
                                                                                .business_manager_id
                                                                        ][
                                                                            "whatsapp_account"
                                                                        ],
                                                                    ).map(
                                                                        ([
                                                                            id,
                                                                            account,
                                                                        ]) => {
                                                                            return (
                                                                                <option
                                                                                    value={
                                                                                        id
                                                                                    }
                                                                                >
                                                                                    {" "}
                                                                                    {
                                                                                        account.name
                                                                                    }{" "}
                                                                                </option>
                                                                            );
                                                                        },
                                                                    )}
                                                                </select>
                                                            </div>
                                                            <InputError
                                                                message={
                                                                    errors.fb_phone_number_id
                                                                }
                                                            />
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <>
                                                    <div className="form-group col-span-6 sm:col-span-4">
                                                        <label
                                                            htmlFor="phone_number"
                                                            className="block text-sm font-semibold text-white/90"
                                                        >
                                                            {
                                                                props
                                                                    .translator[
                                                                    "Display Name"
                                                                ]
                                                            }
                                                        </label>
                                                        <div className="mt-2">
                                                            <Input
                                                                required={true}
                                                                name="display_name"
                                                                value={
                                                                    data.display_name
                                                                }
                                                                id="display_name"
                                                                placeholder=""
                                                                handleChange={
                                                                    handleChange
                                                                }
                                                                className="!bg-white/8 !border-white/10 ring-1 ring-white/10 text-white placeholder:text-white/35 backdrop-blur-sm rounded-xl"
                                                            />
                                                        </div>
                                                        <InputError
                                                            message={
                                                                errors.display_name
                                                            }
                                                        />
                                                    </div>
                                                    <div className="form-group col-span-6 sm:col-span-4">
                                                        <label
                                                            htmlFor="phone_number"
                                                            className="block text-sm font-semibold text-white/90"
                                                        >
                                                            {
                                                                props
                                                                    .translator[
                                                                    "Phone number"
                                                                ]
                                                            }
                                                        </label>
                                                        <div className="mt-2">
                                                            <Input
                                                                required={true}
                                                                name="phone_number"
                                                                value={
                                                                    data.phone_number
                                                                }
                                                                id="phone_number"
                                                                placeholder=""
                                                                handleChange={
                                                                    handleChange
                                                                }
                                                                className="!bg-white/8 !border-white/10 ring-1 ring-white/10 text-white placeholder:text-white/35 backdrop-blur-sm rounded-xl"
                                                            />
                                                        </div>
                                                        <InputError
                                                            message={
                                                                errors.phone_number
                                                            }
                                                        />
                                                    </div>

                                                    <div className="form-group col-span-6 sm:col-span-4">
                                                        <div className="flex items-start">
                                                            <div className="flex items-center h-5">
                                                                <input
                                                                    type="checkbox"
                                                                    id="api_partner"
                                                                    name="api_partner"
                                                                    checked={
                                                                        data.api_partner
                                                                    }
                                                                    onChange={
                                                                        handleChange
                                                                    }
                                                                />
                                                                <div className="ml-3 text-sm">
                                                                    <label
                                                                        htmlFor="api_partner"
                                                                        className="font-semibold text-white/90"
                                                                    >
                                                                        {
                                                                            props
                                                                                .translator[
                                                                                "Api partner?"
                                                                            ]
                                                                        }
                                                                    </label>
                                                                </div>
                                                            </div>
                                                            <InputError
                                                                message={
                                                                    errors.api_partner
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                    {data.api_partner && (
                                                        <div className="form-group col-span-6 sm:col-span-4">
                                                            <label
                                                                htmlFor="api_partner_name"
                                                                className="block text-sm font-semibold text-white/90"
                                                            >
                                                                {
                                                                    props
                                                                        .translator[
                                                                        "API partner Name"
                                                                    ]
                                                                }
                                                            </label>
                                                            <div className="mt-2">
                                                                <Input
                                                                    required={
                                                                        true
                                                                    }
                                                                    name="api_partner_name"
                                                                    value={
                                                                        data.api_partner_name
                                                                    }
                                                                    id="api_partner_name"
                                                                    placeholder=""
                                                                    handleChange={
                                                                        handleChange
                                                                    }
                                                                    className="!bg-white/8 !border-white/10 ring-1 ring-white/10 text-white placeholder:text-white/35 backdrop-blur-sm rounded-xl"
                                                                />
                                                            </div>
                                                            <InputError
                                                                message={
                                                                    errors.api_partner_name
                                                                }
                                                            />
                                                        </div>
                                                    )}
                                                    <div className="form-group col-span-6 sm:col-span-4">
                                                        <label
                                                            htmlFor="business_manager_id"
                                                            className="block text-sm font-semibold text-white/90"
                                                        >
                                                            Facebook BM ID
                                                        </label>
                                                        <div className="mt-2">
                                                            <Input
                                                                name="business_manager_id"
                                                                value={
                                                                    data.business_manager_id
                                                                }
                                                                id="business_manager_id"
                                                                placeholder=""
                                                                handleChange={
                                                                    handleChange
                                                                }
                                                                className="!bg-white/8 !border-white/10 ring-1 ring-white/10 text-white placeholder:text-white/35 backdrop-blur-sm rounded-xl"
                                                            />
                                                        </div>
                                                        <InputError
                                                            message={
                                                                errors.business_manager_id
                                                            }
                                                        />
                                                    </div>
                                                </>
                                            )}

                                            {/* <div className="form-group col-span-6 sm:col-span-4">
                                                <label htmlFor="src_name" className="block text-sm font-medium text-gray-700" >
                                                    {props.translator["Source Name"]}
                                                </label>
                                                <div className="mt-1 flex rounded-md shadow-sm">
                                                    <Input
                                                        required={true}
                                                        name="src_name"
                                                        value={data.src_name}
                                                        id="src_name"
                                                        placeholder=""
                                                        handleChange={handleChange}
                                                    />
                                                </div>
                                                <InputError message={errors.src_name} />
                                            </div> */}

                                            {/*
                                                <div className="form-group col-span-6 sm:col-span-4">
                                                    <label htmlFor="profile_picture" className="block text-sm font-medium text-gray-700">
                                                        Profile picture
                                                    </label>
                                                    <div className="mt-1 flex rounded-md">
                                                        {data.profile_picture ?
                                                        <FileInput accept="image/png, image/jpeg, image/jpg" name='profile_picture' id='profile_picture' handleChange={handleChange} />
                                                        :<FileInput accept="image/png, image/jpeg, image/jpg"  required={true} name='profile_picture' id='profile_picture' handleChange={handleChange} />
                                                        }
                                                    </div>
                                                    <p className="mt-2 text-sm text-gray-500">500px by 500px with 100px magin</p>
                                                    <InputError message={errors.profile_picture} />
                                                </div>

                                                <div className="form-group col-span-6 sm:col-span-4">
                                                    <label htmlFor="profile_description" className="block text-sm font-medium text-gray-700">
                                                        Profile description
                                                    </label>
                                                    <div className="mt-1 flex rounded-md shadow-sm">
                                                        <TextArea required={true} name='profile_description' value={data.profile_description} id='profile_description' placeholder='' handleChange={handleChange} />
                                                    </div>
                                                    <p className="mt-2 text-sm text-gray-500">Max 139 characters</p>
                                                    <InputError message={errors.profile_description} />
                                                </div>

                                                <div className="form-group col-span-6 sm:col-span-4">
                                                    <div className="flex items-start">
                                                        <div className="flex items-center h-5">
                                                            <Checkbox
                                                                id="oba"
                                                                name="oba"
                                                                handleChange={handleChange}
                                                                value={data.oba}
                                                            />
                                                        </div>
                                                        <div className="ml-3 text-sm">
                                                            <label htmlFor="oba" className="font-medium text-gray-700">
                                                                Official business account
                                                            </label>
                                                            <p className="text-gray-500">Request for Whatsapp official business account (OBA).</p>
                                                        </div>
                                                        <InputError message={errors.oba} />
                                                    </div>
                                                </div>
                                            */}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : data.service == "email" ? (
                            <div className="bg-[#140816]/70 backdrop-blur-3xl border border-white/10 ring-1 ring-white/5 shadow px-4 py-5 sm:rounded-2xl sm:p-6">
                                <div className="md:grid md:grid-cols-3 md:gap-6">
                                    <div className="md:col-span-1">
                                        <h3 className="text-lg font-semibold leading-6 text-white">
                                            Gmail Connection
                                        </h3>
                                        <p className="mt-1 text-sm text-[#878787]">
                                            Gmail is the only supported email
                                            integration. We connect the mailbox
                                            with Google OAuth and keep tokens
                                            encrypted server-side.
                                        </p>
                                    </div>
                                    <div className="mt-5 md:mt-0 md:col-span-2">
                                        <div className="grid grid-cols-6 gap-6">
                                            <div className="form-group col-span-6 sm:col-span-4">
                                                <label
                                                    htmlFor="display_name"
                                                    className="block text-sm font-medium text-[#878787]"
                                                >
                                                    Sender Name
                                                </label>
                                                <div className="mt-1 flex rounded-md shadow-sm">
                                                    <Input
                                                        name="display_name"
                                                        value={
                                                            data.display_name
                                                        }
                                                        id="display_name"
                                                        placeholder="e.g. Acme Support"
                                                        handleChange={
                                                            handleChange
                                                        }
                                                        className="bg-[#0F0B1A] text-white border-white/10 placeholder:text-[#6c6c6c] focus:ring-[#1C9AE1] focus:border-[#1C9AE1]"
                                                    />
                                                </div>
                                                <InputError
                                                    message={
                                                        errors.display_name
                                                    }
                                                />
                                            </div>
                                            <div className="form-group col-span-6 sm:col-span-4">
                                                <label className="block text-sm font-medium text-[#878787]">
                                                    Gmail Address
                                                </label>
                                                <div className="mt-1 rounded-xl border border-white/10 bg-[#0F0B1A] px-4 py-3 text-sm text-white">
                                                    {data.email ||
                                                        "Not connected"}
                                                </div>
                                            </div>
                                            <div className="form-group col-span-6">
                                                <div className="rounded-2xl border border-white/10 bg-black/20 px-5 py-4">
                                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                                        <div className="space-y-2">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-medium text-white">
                                                                    Connection
                                                                    status
                                                                </span>
                                                                <span
                                                                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                                        gmailConnected
                                                                            ? "bg-emerald-500/15 text-emerald-200"
                                                                            : "bg-amber-500/15 text-amber-200"
                                                                    }`}
                                                                >
                                                                    {gmailConnected
                                                                        ? "Connected"
                                                                        : "Not connected"}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-[#878787]">
                                                                Connect a Gmail
                                                                mailbox to send
                                                                email, sync
                                                                Inbox and Sent,
                                                                and keep email
                                                                threads inside
                                                                the chat inbox.
                                                            </p>
                                                            {lastSyncLabel && (
                                                                <p className="text-xs text-white/45">
                                                                    Last sync:{" "}
                                                                    {
                                                                        lastSyncLabel
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                        <a
                                                            href={
                                                                props.googleConfigured
                                                                    ? gmailConnectUrl
                                                                    : "#"
                                                            }
                                                            className={`inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition ${
                                                                props.googleConfigured
                                                                    ? "bg-[#4285F4] text-white hover:bg-[#3674db]"
                                                                    : "cursor-not-allowed bg-white/10 text-white/35"
                                                            }`}
                                                            onClick={(
                                                                event,
                                                            ) => {
                                                                if (
                                                                    !props.googleConfigured
                                                                ) {
                                                                    event.preventDefault();
                                                                }
                                                            }}
                                                        >
                                                            {gmailConnected
                                                                ? "Reconnect Gmail"
                                                                : "Connect with Google"}
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                            {!props.googleConfigured && (
                                                <div className="form-group col-span-6">
                                                    <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                                                        Google OAuth is not
                                                        configured yet. Add the
                                                        Google client ID, client
                                                        secret, and redirect URI
                                                        before linking Gmail.
                                                    </div>
                                                </div>
                                            )}
                                            {gmailConnected && (
                                                <div className="form-group col-span-6">
                                                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/70">
                                                        OAuth tokens are stored
                                                        encrypted and are never
                                                        returned to this form.
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : data.service == "facebook" ? (
                            <div className="bg-[#140816]/70 backdrop-blur-3xl border border-white/10 ring-1 ring-white/5 shadow px-4 py-5 sm:rounded-2xl sm:p-6">
                                <div className="md:grid md:grid-cols-3 md:gap-6">
                                    <div className="md:col-span-1">
                                        <h3 className="text-lg font-semibold leading-6 text-white">
                                            Facebook Page
                                        </h3>
                                        <p className="mt-1 text-sm text-[#878787]">
                                            Facebook login only connects the account. Choose the Facebook Page to finish setup.
                                        </p>
                                    </div>
                                    <div className="mt-5 md:mt-0 md:col-span-2">
                                        <div className="grid grid-cols-6 gap-6">
                                            {facebookRequiresCompletion && (
                                                <div className="form-group col-span-6">
                                                    <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3">
                                                        <div className="text-sm font-semibold text-amber-100">
                                                            Facebook account connected
                                                        </div>
                                                        <div className="mt-1 text-sm text-amber-50/90">
                                                            Select a Facebook Page to finish setup.
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="form-group col-span-6">
                                                <div className="rounded-2xl border border-white/10 bg-black/20 px-5 py-4">
                                                    <div className="space-y-3">
                                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                            <div>
                                                                <div className="text-sm font-medium text-white">
                                                                    {facebookAccountName}
                                                                </div>
                                                                <div className="text-xs uppercase tracking-[0.2em] text-white/45">
                                                                    Facebook
                                                                </div>
                                                            </div>
                                                            <span
                                                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${facebookStatusBadgeMeta.className}`}
                                                            >
                                                                {facebookStatusBadgeMeta.label}
                                                            </span>
                                                        </div>
                                                        <div className="grid gap-3 text-sm text-white/80 sm:grid-cols-2">
                                                            <div>
                                                                <div className="text-white/45">
                                                                    Account
                                                                </div>
                                                                <div>
                                                                    {facebookRequiresCompletion
                                                                        ? "Facebook account connected"
                                                                        : facebookNeedsNewConnect
                                                                          ? "Connect Facebook again"
                                                                          : "Facebook Page connected"}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <div className="text-white/45">Page</div>
                                                                <div>
                                                                    {facebookSelectedPageName ||
                                                                        "Not selected"}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-sm text-white/65">
                                                            {facebookRequiresCompletion
                                                                ? "Select a Facebook Page to finish setup."
                                                                : facebookNeedsNewConnect
                                                                  ? "Connect Facebook again to continue."
                                                                  : "This Facebook channel is ready to use."}
                                                        </div>
                                                        {facebookAutoSelecting && (
                                                            <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-sm text-blue-100">
                                                                One Facebook Page was found. Finishing setup automatically...
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="form-group col-span-6 sm:col-span-4">
                                                <label
                                                    htmlFor="fb_phone_number_id"
                                                    className="block text-sm font-medium text-[#878787]"
                                                >
                                                    Choose the Facebook Page
                                                </label>

                                                <div className="mt-1 flex rounded-md shadow-sm">
                                                    <Dropdown
                                                        required={true}
                                                        id="fb_phone_number_id"
                                                        name="fb_phone_number_id"
                                                        handleChange={handleChange}
                                                        options={facebookPageOptions}
                                                        value={facebookSelectedPageId}
                                                        className="bg-[#0F0B1A] text-white border-white/10"
                                                        disabled={!hasAvailableFacebookPages}
                                                        emptyOption="Select a Facebook Page"
                                                    />
                                                </div>
                                                <InputError message={errors.fb_phone_number_id} />
                                            </div>

                                            <div className="form-group col-span-6">
                                                <div className="flex flex-wrap gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={
                                                            facebookNeedsNewConnect
                                                                ? () => {
                                                                      window.location.href =
                                                                          facebookReconnectUrl;
                                                                  }
                                                                : saveFacebookPageSelection
                                                        }
                                                        disabled={
                                                            facebookNeedsNewConnect
                                                                ? false
                                                                : facebookSetupLoading ||
                                                                  facebookAutoSelecting ||
                                                                  !hasAvailableFacebookPages ||
                                                                  !facebookSelectedPageId
                                                        }
                                                        className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                                    >
                                                        {facebookNeedsNewConnect
                                                            ? "Connect Facebook"
                                                            : facebookSetupStatus === "connected"
                                                            ? "Update Page"
                                                            : "Finish setup"}
                                                    </button>
                                                </div>
                                            </div>

                                            {facebookSetupLoading && (
                                                <div className="form-group col-span-6">
                                                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/70">
                                                        Loading Facebook connection details...
                                                    </div>
                                                </div>
                                            )}

                                            {facebookSetupError && (
                                                <div className="form-group col-span-6">
                                                    <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                                                        {facebookSetupError}
                                                    </div>
                                                </div>
                                            )}

                                            {!facebookSetupLoading &&
                                                !hasAvailableFacebookPages && (
                                                    <div className="form-group col-span-6">
                                                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                                                            <div className="text-sm font-semibold text-white">
                                                                No Facebook Pages found
                                                            </div>
                                                            <div className="mt-1 text-sm text-white/70">
                                                                Facebook account connected, but Meta did not return any Pages. Check that this user manages a Facebook Page and granted the required permissions, then connect Facebook again.
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : data.service == "instagram" ? (
                            <div className="bg-[#140816]/70 backdrop-blur-3xl border border-white/10 ring-1 ring-white/5 shadow px-4 py-5 sm:rounded-2xl sm:p-6">
                                <div className="md:grid md:grid-cols-3 md:gap-6">
                                    <div className="md:col-span-1">
                                        <h3 className="text-lg font-semibold leading-6 text-white">
                                            Instagram connection
                                        </h3>
                                        <p className="mt-1 text-sm text-[#878787]">
                                            Connect Instagram directly with
                                            Instagram Login to manage DMs in
                                            one place.
                                        </p>
                                    </div>
                                    <div className="mt-5 space-y-5 md:mt-0 md:col-span-2">
                                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
                                            <div className="flex flex-wrap items-start justify-between gap-4">
                                                <div>
                                                    <div className="text-sm font-semibold text-white">
                                                        Connect Instagram
                                                    </div>
                                                    <div className="mt-1 text-sm text-white/70">
                                                        {instagramConnected
                                                            ? "Instagram professional account connected."
                                                            : instagramOAuthConnected
                                                              ? "Instagram Login authorization completed."
                                                              : "Connect your Instagram professional account to start."}
                                                    </div>
                                                </div>
                                                <span
                                                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                        instagramConnected
                                                            ? "bg-emerald-500/15 text-emerald-200"
                                                            : "bg-slate-500/15 text-slate-100"
                                                    }`}
                                                >
                                                    {instagramConnected
                                                        ? "Connected"
                                                        : "Not connected"}
                                                </span>
                                            </div>
                                            {!instagramConnected && (
                                                <div className="mt-4">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            window.location.href =
                                                                instagramConnectUrl;
                                                        }}
                                                        className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                                                    >
                                                        {instagramRequiresReconnect
                                                            ? "Reconnect Instagram"
                                                            : "Connect Instagram"}
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {instagramConnected && (
                                                <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 space-y-4">
                                                    <div className="flex flex-wrap items-start justify-between gap-4">
                                                        <div>
                                                            <div className="text-sm font-semibold text-white">
                                                                Connected Instagram professional account
                                                            </div>
                                                            <div className="mt-1 text-sm text-white/70">
                                                                Ready to manage Instagram DMs
                                                            </div>
                                                        </div>
                                                        <span
                                                            className="inline-flex rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-200"
                                                        >
                                                            Connected
                                                        </span>
                                                    </div>

                                                    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                                                        Instagram connected
                                                        {instagramSelectedAccountName
                                                            ? `: ${instagramSelectedAccountName}`
                                                            : instagramSelectedUsername
                                                              ? `: @${instagramSelectedUsername.replace(
                                                                    /^@/,
                                                                    "",
                                                                )}`
                                                              : ""}
                                                    </div>
                                                </div>
                                            )}

                                        {instagramOAuthConnected &&
                                            !instagramConnected && (
                                                <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 space-y-4">
                                                    <div className="flex flex-wrap items-start justify-between gap-4">
                                                        <div>
                                                            <div className="text-sm font-semibold text-white">
                                                                Complete Instagram Login authorization
                                                            </div>
                                                            <div className="mt-1 text-sm text-white/70">
                                                                {instagramSetupMessage}
                                                            </div>
                                                        </div>
                                                        <span className="inline-flex rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-semibold text-amber-200">
                                                            Needs setup
                                                        </span>
                                                    </div>

                                                    <div className="flex flex-wrap gap-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                window.location.href =
                                                                    instagramConnectUrl;
                                                            }}
                                                            className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                                                        >
                                                            Connect Instagram
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                        {instagramSetupLoading && (
                                            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/70">
                                                Loading Instagram connection details...
                                            </div>
                                        )}

                                        {instagramSetupError && (
                                            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                                                {instagramSetupError}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            ""
                        )}
                    </div>
                    {!data.id && (
                        <div className="form-group col-span-6 sm:col-span-4">
                            <div className="flex items-start">
                                <div className="flex items-center h-5">
                                    <input
                                        type="checkbox"
                                        id="terms_condition"
                                        name="terms_condition"
                                        data-pristine-required={true}
                                        checked={data.terms_condition}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label
                                        htmlFor="terms_condition"
                                        title="Click here to read it"
                                        className="font-medium text-gray-700"
                                    >
                                        <span>
                                            {
                                                props.translator[
                                                    "Do you agree with our"
                                                ]
                                            }
                                            <a
                                                href="http://www.google.com"
                                                target="_blank"
                                                className="text-indigo-600 mx-1"
                                            >
                                                {
                                                    props.translator[
                                                        "terms and conditions?"
                                                    ]
                                                }
                                            </a>
                                        </span>
                                    </label>
                                </div>

                                <InputError message={errors.terms_condition} />
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3">
                        <Link
                            href={route("social_profile")}
                            className="inline-flex items-center justify-center rounded-xl bg-[#2d1060] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3d1a80] focus:outline-none"
                        >
                            {props.translator["Cancel"]}
                        </Link>

                        {!facebookRequiresCompletion &&
                            (data.service !== "instagram" ||
                                instagramConnected) && (
                            <button
                                type="button"
                                id="save"
                                title=""
                                onClick={validateAndSubmitForm}
                                className="inline-flex items-center justify-center rounded-xl bg-[#BF00FF] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(191,0,255,0.35)] transition hover:bg-[#a100df] focus:outline-none"
                            >
                                {props.translator["Save"]}
                            </button>
                            )}
                    </div>
                </form>
            </div>
        </Authenticated>
    );
}

export default Registration;
