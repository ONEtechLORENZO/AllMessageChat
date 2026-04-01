import { Fragment, useEffect, useRef, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Head, Link, router as Inertia } from "@inertiajs/react";
import {
    XMarkIcon,
} from "@heroicons/react/24/outline";
import { BsFacebook, BsInstagram } from "react-icons/bs";
import { GoMail } from "react-icons/go";
import Authenticated from "@/Layouts/Authenticated";
import Accounts from "@/Pages/Wallet/Accounts";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";
import Step4 from "./Step4";
import Step5 from "./Step5";
import Step6 from "./Step6";
import Step7 from "./Step7";
import StepEmail from "./StepEmail";
import axios from "axios";
import notie from "notie";
import nProgress from "nprogress";

const mandatoryField = ["display_name", "phone_number", "company_name"];

const LEFT_PANEL_CONFIG = {
    facebook: {
        name: "FACEBOOK",
        description: "Bring Facebook page conversations into your workspace for unified messaging.",
        Icon: BsFacebook,
    },
    instagram: {
        name: "INSTAGRAM",
        description: "Connect your Instagram business profile to manage DMs in one place.",
        Icon: BsInstagram,
    },
    email: {
        name: "GMAIL",
        description: "Link your Gmail inbox to sync emails and reply directly from the workspace.",
        Icon: GoMail,
    },
};

export function GlassCard({ className = "", children }) {
    return (
        <div
            className={[
                "relative rounded-3xl bg-[#140816]/88 backdrop-blur-3xl",
                "border border-white/10 ring-1 ring-white/5",
                className,
            ].join(" ")}
        >
            <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-30" />
            <div className="relative z-10 flex h-full flex-col p-6">
                {children}
            </div>
        </div>
    );
}

export default function AccountRegistration(props) {
    const cancelButtonRef = useRef(null);
    const [open, setOpen] = useState(true);
    const [curretpage, setCurrentPage] = useState(1);
    const [data, setData] = useState({});
    const [addfield, setAddField] = useState(false);
    const [checkPermission, setPermission] = useState({});
    const [accountId, setAccountid] = useState();
    const [socialProfiles, setSocialProfiles] = useState();
    const lockedService = props.service || "";

    useEffect(() => {
        const initialService = props.service || "";
        const initialData = initialService
            ? {
                  service: initialService,
                  ...(props.presetAccountId
                      ? { profile_list: String(props.presetAccountId) }
                      : {}),
              }
            : {};

        setData(initialData);

        if (initialService === "email") {
            setCurrentPage(8);
        } else if (initialService === "whatsapp") {
            setCurrentPage(6);
        } else {
            setCurrentPage(1);
        }

        if (initialService === "facebook" || initialService === "instagram") {
            fetchExistProfiles(initialService);
        }
    }, [props.service, props.presetAccountId]);

    function flowMeta(service, page) {
        if (service === "facebook" || service === "instagram") {
            return { totalSteps: 1, progressStep: 1 };
        }

        if (service === "email") {
            return { totalSteps: 1, progressStep: 1 };
        }

        if (service === "whatsapp") {
            const stepMap = {
                6: 1,
                2: 2,
                7: 2,
                3: 3,
                4: 4,
            };

            return {
                totalSteps: 4,
                progressStep: stepMap[page] || 1,
            };
        }

        return {
            totalSteps: 1,
            progressStep: 1,
        };
    }

    const { totalSteps, progressStep } = flowMeta(
        data.service || lockedService,
        curretpage,
    );
    const activeServiceLabel = {
        whatsapp: "Connect WhatsApp",
        facebook: "Connect Facebook",
        instagram: "Connect Instagram",
        email: "Connect Email",
    }[data.service || lockedService];

    function closeModal() {
        setOpen(false);
        Inertia.get(route("social_profile"));
    }

    function serviceHandler() {
        const service = data.service;

        if (data.profile_list) {
            nProgress.start(0.5);
            nProgress.inc(0.2);
            Inertia.post(route("store_account_registration"), data, {
                onSuccess: () => {},
            });
            return false;
        }

        if (service == "whatsapp") {
            setCurrentPage(6);
        } else if (service == "email") {
            setCurrentPage(8);
        }
        return false;
    }

    function formHandler(event) {
        let newData = Object.assign({}, data);
        const field_name = event.target.name;
        let value = "";
        if (field_name == "phone_number") {
            value = event.target.value.replace(/\D/g, "");
        } else {
            value =
                event.target.type === "checkbox"
                    ? event.target.checked
                    : event.target.value;
        }
        newData[field_name] = value;

        setData(newData);

        if (field_name == "service" && value) {
            fetchExistProfiles(value);
        }
    }

    function fetchExistProfiles(service) {
        nProgress.start(0.5);
        nProgress.inc(0.2);

        axios
            .get(route("fetch_social_profile_pages", { service }))
            .then((response) => {
                nProgress.done(true);
                setSocialProfiles(response.data.social_profiles);
            });
    }

    function changePhoneNumber(value, name) {
        let newData = Object.assign({}, data);
        let phoneNumber = "+" + value;
        newData[name] = phoneNumber;
        setData(newData);
    }

    function checkAllPermissioin(event) {
        let newCheck = Object.assign({}, checkPermission);
        const name = event.target.name;
        const value = event.target.checked;
        newCheck[name] = value;
        setPermission(newCheck);
    }

    function validateRequest() {
        let checklength = Object.keys(checkPermission).length;
        let validate = true;
        if (checklength == 3) {
            Object.entries(checkPermission).map((check) => {
                if (!check[1]) {
                    validate = false;
                }
            });
        } else {
            validate = false;
        }

        if (!validate || checklength != 3) {
            notie.alert({
                type: "warning",
                text: "Please check the terms & condiitions",
                time: 5,
            });
        }

        return validate;
    }

    function legalEntityName(id, name) {
        let newUser = Object.assign({}, data);
        newUser[name] = id;
        setData(newUser);
    }

    function mandatoryfieldCheck() {
        let check = true;

        if (data) {
            mandatoryField.map((field) => {
                if (!data[field]) {
                    check = false;
                }
            });
        } else {
            check = false;
        }

        if (!data || !check) {
            notie.alert({
                type: "warning",
                text: "Please fill the mandatory field",
                time: 5,
            });
        }
        return check;
    }

    function saveAccount() {
        let checkfield = mandatoryfieldCheck();
        let validate = validateRequest();

        if (validate && checkfield) {
            nProgress.start(0.5);
            nProgress.inc(0.2);

            axios.post(route("store_account_registration"), data).then((response) => {
                nProgress.done(true);
                setAccountid(response.data.account_id);
                setCurrentPage(4);
            });
        }
    }

    const stepCardClassName = "bg-white/[0.02] border-white/10";
    const isTwoPanelService = ["facebook", "instagram", "email"].includes(lockedService);
    const leftPanel = LEFT_PANEL_CONFIG[lockedService] || null;

    return (
        <Authenticated
            auth={props.auth}
            errors={props.errors}
            current_page={"Social Profiles"}
            navigationMenu={props.menuBar}
            subduedBackground={true}
        >
            <Head title={props.translator["Link Account"]} />

            <div className="px-4 pb-8 pt-5 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl">
                    <Accounts accounts={props.accounts} createAccount={true} {...props} />
                </div>
            </div>

            <Transition.Root show={open} as={Fragment}>
                <Dialog
                    as="div"
                    className="relative z-30"
                    initialFocus={cancelButtonRef}
                    onClose={closeModal}
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
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] transition-opacity" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 sm:p-6 lg:p-8">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 translate-y-6 sm:scale-95"
                                enterTo="opacity-100 translate-y-0 sm:scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                                leaveTo="opacity-0 translate-y-6 sm:scale-95"
                            >
                                {isTwoPanelService && leftPanel ? (
                                    /* ── Two-panel layout for Facebook / Instagram / Email ── */
                                    <Dialog.Panel className="relative w-full max-w-3xl overflow-hidden rounded-[28px] shadow-[0_24px_70px_rgba(0,0,0,0.45)] transition-all flex min-h-[520px]">
                                        {/* Left panel – purple branding */}
                                        <div className="relative hidden sm:flex w-[42%] flex-col items-center justify-center p-8 overflow-hidden bg-gradient-to-br from-violet-600 via-purple-700 to-purple-900">
                                            {/* Watermark icon */}
                                            <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.08]">
                                                <leftPanel.Icon style={{ width: 220, height: 220 }} />
                                            </div>
                                            {/* Glow blobs */}
                                            <div className="pointer-events-none absolute -top-16 -left-16 h-64 w-64 rounded-full bg-fuchsia-500/25 blur-3xl" />
                                            <div className="pointer-events-none absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-violet-400/20 blur-3xl" />

                                            <div className="relative z-10 text-center space-y-5">
                                                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-white/15 backdrop-blur-sm shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
                                                    <leftPanel.Icon style={{ width: 40, height: 40, color: "white" }} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold tracking-[0.28em] uppercase text-white/50 mb-1">Connect</p>
                                                    <h1 className="text-3xl font-black uppercase tracking-wider text-white leading-none">
                                                        {leftPanel.name}
                                                    </h1>
                                                </div>
                                                <p className="text-sm text-white/60 leading-relaxed max-w-[16rem] mx-auto">
                                                    {leftPanel.description}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Right panel – dark content */}
                                        <div className="flex-1 bg-[rgba(20,8,30,0.98)] flex flex-col text-left relative">
                                            {/* Close button */}
                                            <button
                                                ref={cancelButtonRef}
                                                type="button"
                                                onClick={closeModal}
                                                className="absolute top-4 right-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/60 transition hover:bg-white/10 hover:text-white"
                                                aria-label="Close dialog"
                                            >
                                                <XMarkIcon className="h-4 w-4" />
                                            </button>

                                            <div className="flex-1 flex flex-col justify-center p-7 pt-12">
                                                <div className={curretpage == 1 ? "block" : "hidden"}>
                                                    <Step1
                                                        data={data}
                                                        setOpen={setOpen}
                                                        formHandler={formHandler}
                                                        serviceHandler={serviceHandler}
                                                        socialProfiles={socialProfiles}
                                                        lockedService={lockedService}
                                                        presetAccountId={props.presetAccountId}
                                                        {...props}
                                                    />
                                                </div>
                                                <div className={curretpage == 8 ? "block" : "hidden"}>
                                                    <StepEmail
                                                        data={data}
                                                        formHandler={formHandler}
                                                        setCurrentPage={setCurrentPage}
                                                        setAccountid={setAccountid}
                                                        lockedService={lockedService}
                                                        {...props}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </Dialog.Panel>
                                ) : (
                                /* ── Standard layout for WhatsApp and other services ── */
                                <Dialog.Panel className="relative w-full max-w-4xl overflow-hidden rounded-[28px] border border-white/15 bg-[rgba(24,10,34,0.96)] text-left shadow-[0_24px_70px_rgba(0,0,0,0.38)] ring-1 ring-white/10 transition-all">

                                    <div className="relative">
                                        <div className="border-b border-white/10 px-6 py-4 sm:px-7">
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <Dialog.Title className="text-2xl font-semibold text-white">
                                                        {activeServiceLabel ||
                                                            props.translator[
                                                                "Link Account"
                                                            ]}
                                                    </Dialog.Title>
                                                    <p className="mt-1 text-sm text-white/55">
                                                        {activeServiceLabel
                                                            ? "Complete the setup for this channel."
                                                            : "Connect a channel to your workspace."}
                                                    </p>
                                                </div>

                                                <button
                                                    ref={cancelButtonRef}
                                                    type="button"
                                                    onClick={closeModal}
                                                    className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/70 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
                                                    aria-label="Close dialog"
                                                >
                                                    <XMarkIcon className="h-5 w-5" />
                                                </button>
                                            </div>

                                            <div className="mt-4 grid gap-2 sm:grid-cols-[auto,1fr] sm:items-center">
                                                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/40">
                                                    Step {progressStep} of {totalSteps}
                                                </div>
                                                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                                                    <div
                                                        className="h-full rounded-full bg-white/70 transition-all duration-300"
                                                        style={{
                                                            width: `${(progressStep / totalSteps) * 100}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-5 sm:p-6">
                                            <div className={curretpage == 1 ? "block" : "hidden"}>
                                                <GlassCard className={stepCardClassName}>
                                                    <Step1
                                                        data={data}
                                                        setOpen={setOpen}
                                                        formHandler={formHandler}
                                                        serviceHandler={serviceHandler}
                                                        socialProfiles={socialProfiles}
                                                        lockedService={lockedService}
                                                        presetAccountId={props.presetAccountId}
                                                        {...props}
                                                    />
                                                </GlassCard>
                                            </div>

                                            <div className={curretpage == 2 ? "block" : "hidden"}>
                                                <GlassCard className={stepCardClassName}>
                                                    <Step2
                                                        data={data}
                                                        formHandler={formHandler}
                                                        setCurrentPage={setCurrentPage}
                                                        setAddField={setAddField}
                                                        legalEntityName={legalEntityName}
                                                        changePhoneNumber={changePhoneNumber}
                                                        translator={props.translator}
                                                        {...props}
                                                    />
                                                </GlassCard>
                                            </div>

                                            <div className={curretpage == 3 ? "block" : "hidden"}>
                                                <GlassCard className={stepCardClassName}>
                                                    <Step3
                                                        data={data}
                                                        formHandler={formHandler}
                                                        addfield={addfield}
                                                        checkPermission={checkPermission}
                                                        checkAllPermissioin={checkAllPermissioin}
                                                        validateRequest={validateRequest}
                                                        saveAccount={saveAccount}
                                                        changePhoneNumber={changePhoneNumber}
                                                        {...props}
                                                    />
                                                </GlassCard>
                                            </div>

                                            <div className={curretpage == 4 ? "block" : "hidden"}>
                                                <GlassCard className={stepCardClassName}>
                                                    <Step4
                                                        accountId={accountId}
                                                        {...props}
                                                        data={data}
                                                    />
                                                </GlassCard>
                                            </div>

                                            <div className={curretpage == 5 ? "block" : "hidden"}>
                                                <GlassCard className={stepCardClassName}>
                                                    <Step5 />
                                                </GlassCard>
                                            </div>

                                            <div className={curretpage == 6 ? "block" : "hidden"}>
                                                <GlassCard className={stepCardClassName}>
                                                    <Step6
                                                        setCurrentPage={setCurrentPage}
                                                        {...props}
                                                    />
                                                </GlassCard>
                                            </div>

                                            <div className={curretpage == 7 ? "block" : "hidden"}>
                                                <GlassCard className={stepCardClassName}>
                                                    <Step7
                                                        setCurrentPage={setCurrentPage}
                                                        {...props}
                                                    />
                                                </GlassCard>
                                            </div>

                                            <div className={curretpage == 8 ? "block" : "hidden"}>
                                                <GlassCard className={stepCardClassName}>
                                                    <StepEmail
                                                        data={data}
                                                        formHandler={formHandler}
                                                        setCurrentPage={setCurrentPage}
                                                        setAccountid={setAccountid}
                                                        lockedService={lockedService}
                                                        {...props}
                                                    />
                                                </GlassCard>
                                            </div>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                                )}
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>
        </Authenticated>
    );
}
