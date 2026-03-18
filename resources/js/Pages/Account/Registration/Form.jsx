import { Fragment, useEffect, useRef, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import Authenticated from "@/Layouts/Authenticated";
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
import { router as Inertia } from "@inertiajs/react";
import {
    getInitialEmailProvider,
    withEmailProviderDefaults,
} from "./emailProviderPresets";

const mandatoryField = ["display_name", "phone_number", "company_name"];

export function GlassCard({ className = "", children }) {
    return (
        <div
            className={[
                "relative rounded-3xl bg-[#140816]/70 backdrop-blur-3xl group",
                "border border-white/10 ring-1 ring-white/5",
                "transition-all duration-500 hover:border-[#38bdf8]/50 hover:-translate-y-3 hover:scale-[1.02]",
                "hover:shadow-[0_20px_40px_-15px_rgba(56,189,248,0.3)]",
                className,
            ].join(" ")}
        >
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#38bdf8]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-30" />
            <div className="p-6 relative z-10 flex flex-col h-full">
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

    useEffect(() => {
        setData({});
    }, []);

    function serviceHandler() {
        const service = data.service;

        // Save account based on selected profile
        if (data.profile_list) {
            nProgress.start(0.5);
            nProgress.inc(0.2);
            let url = route("store_account_registration");

            Inertia.post(url, data, {
                onSuccess: (response) => {
                    console.log(response);
                },
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

    // Get all the value in the form page
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

        if (field_name === "smtp_provider") {
            newData = withEmailProviderDefaults(newData, value);
        }

        if (
            field_name === "service" &&
            value === "email" &&
            !newData.smtp_provider
        ) {
            newData = withEmailProviderDefaults(
                newData,
                getInitialEmailProvider(newData),
                { preserveExisting: true },
            );
        }

        setData(newData);

        // Fetch exist social profile
        if (field_name == "service" && value) {
            fetchExistProfiles(value);
        }
    }

    /**
     * Fetch exist Social profile list
     */
    function fetchExistProfiles(service) {
        nProgress.start(0.5);
        nProgress.inc(0.2);

        axios
            .get(route("fetch_social_profile_pages", { service: service }))
            .then((response) => {
                nProgress.done(true);
                setSocialProfiles(response.data.social_profiles);
            });
    }

    /**
     * Phone number change event
     */
    function changePhoneNumber(value, name) {
        let newData = Object.assign({}, data);
        let phoneNumber = "+" + value;
        newData[name] = phoneNumber;
        setData(newData);
    }

    //check the conditions
    function checkAllPermissioin(event) {
        let newCheck = Object.assign({}, checkPermission);
        const name = event.target.name;
        const value = event.target.checked;
        newCheck[name] = value;
        setPermission(newCheck);
    }

    //validate to check the all conditions
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

    //save the account details
    function saveAccount() {
        let checkfield = mandatoryfieldCheck();
        let validate = validateRequest();

        if (validate && checkfield) {
            nProgress.start(0.5);
            nProgress.inc(0.2);

            let url = route("store_account_registration");
            axios.post(url, data).then((response) => {
                nProgress.done(true);
                setAccountid(response.data.account_id);
                setCurrentPage(4);
            });
        }
    }

    return (
        <Authenticated auth={props.auth} errors={props.errors}>
            <Transition.Root show={open} as={Fragment}>
                <Dialog
                    as="div"
                    className="relative z-10"
                    initialFocus={cancelButtonRef}
                    onClose={() => {}}
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
                        <div className="fixed inset-0 bg-black/70 transition-opacity" />
                    </Transition.Child>

                    <div className="fixed z-10 inset-0 overflow-y-auto">
                        <div className="flex items-end sm:items-center justify-center min-h-full p-4 text-center sm:p-0">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                                enterTo="opacity-100 translate-y-0 sm:scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            >
                                <Dialog.Panel className="relative text-left transform transition-all sm:my-8 sm:w-1/2">
                                    <div className="w-full">
                                        <div
                                            className={
                                                curretpage == 1
                                                    ? "block"
                                                    : "hidden"
                                            }
                                        >
                                            <GlassCard>
                                                <Step1
                                                    data={data}
                                                    setOpen={setOpen}
                                                    formHandler={formHandler}
                                                    serviceHandler={
                                                        serviceHandler
                                                    }
                                                    socialProfiles={
                                                        socialProfiles
                                                    }
                                                    {...props}
                                                />
                                            </GlassCard>
                                        </div>

                                        <div
                                            className={
                                                curretpage == 2
                                                    ? "block"
                                                    : "hidden"
                                            }
                                        >
                                            <GlassCard>
                                                <Step2
                                                    data={data}
                                                    formHandler={formHandler}
                                                    setCurrentPage={
                                                        setCurrentPage
                                                    }
                                                    setAddField={setAddField}
                                                    legalEntityName={
                                                        legalEntityName
                                                    }
                                                    changePhoneNumber={
                                                        changePhoneNumber
                                                    }
                                                    translator={
                                                        props.translator
                                                    }
                                                    {...props}
                                                />
                                            </GlassCard>
                                        </div>

                                        <div
                                            className={
                                                curretpage == 3
                                                    ? "block"
                                                    : "hidden"
                                            }
                                        >
                                            <GlassCard>
                                                <Step3
                                                    data={data}
                                                    formHandler={formHandler}
                                                    addfield={addfield}
                                                    checkPermission={
                                                        checkPermission
                                                    }
                                                    checkAllPermissioin={
                                                        checkAllPermissioin
                                                    }
                                                    validateRequest={
                                                        validateRequest
                                                    }
                                                    saveAccount={saveAccount}
                                                    changePhoneNumber={
                                                        changePhoneNumber
                                                    }
                                                    {...props}
                                                />
                                            </GlassCard>
                                        </div>

                                        <div
                                            className={
                                                curretpage == 4
                                                    ? "block"
                                                    : "hidden"
                                            }
                                        >
                                            <GlassCard>
                                                <Step4
                                                    accountId={accountId}
                                                    {...props}
                                                    data={data}
                                                />
                                            </GlassCard>
                                        </div>

                                        <div
                                            className={
                                                curretpage == 5
                                                    ? "block"
                                                    : "hidden"
                                            }
                                        >
                                            <GlassCard>
                                                <Step5 />
                                            </GlassCard>
                                        </div>

                                        <div
                                            className={
                                                curretpage == 6
                                                    ? "block"
                                                    : "hidden"
                                            }
                                        >
                                            <GlassCard>
                                                <Step6
                                                    setCurrentPage={
                                                        setCurrentPage
                                                    }
                                                    {...props}
                                                />
                                            </GlassCard>
                                        </div>

                                        <div
                                            className={
                                                curretpage == 7
                                                    ? "block"
                                                    : "hidden"
                                            }
                                        >
                                            <GlassCard>
                                                <Step7
                                                    setCurrentPage={
                                                        setCurrentPage
                                                    }
                                                    {...props}
                                                />
                                            </GlassCard>
                                        </div>

                                        <div
                                            className={
                                                curretpage == 8
                                                    ? "block"
                                                    : "hidden"
                                            }
                                        >
                                            <GlassCard>
                                                <StepEmail
                                                    data={data}
                                                    formHandler={formHandler}
                                                    setCurrentPage={setCurrentPage}
                                                    setAccountid={setAccountid}
                                                    {...props}
                                                />
                                            </GlassCard>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>
        </Authenticated>
    );
}
