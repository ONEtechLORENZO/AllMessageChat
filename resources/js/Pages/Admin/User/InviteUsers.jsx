import { Fragment, useEffect, useRef, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import Axios from "axios";
import notie from 'notie';
import nProgress, { settings } from 'nprogress';
import Creatable from 'react-select/creatable';

function InviteUser(props) {
    const [open, setOpen] = useState(true)
    const [issueFlag, setIssueFlag] = useState(true)
    const [emails, setEmails] = useState(null);
    const cancelButtonRef = useRef(null)
    const [invite, setInvite] = useState(true);
    const [errors, setErrors] = useState(null);
    const [control, setControl] = useState();
    const [inputValue, setInputValue] = useState("");
    const selectStyles = {
        control: (base, state) => ({
            ...base,
            backgroundColor: "#0F0B1A",
            borderColor: state.isFocused ? "rgba(191,0,255,0.6)" : "rgba(255,255,255,0.15)",
            boxShadow: state.isFocused ? "0 0 0 2px rgba(191,0,255,0.25)" : "none",
            minHeight: "42px",
        }),
        menu: (base) => ({
            ...base,
            backgroundColor: "#120815",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#fff",
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isFocused ? "rgba(191,0,255,0.15)" : "#120815",
            color: "#fff",
        }),
        multiValue: (base) => ({
            ...base,
            backgroundColor: "rgba(191,0,255,0.2)",
        }),
        multiValueLabel: (base) => ({
            ...base,
            color: "#fff",
        }),
        multiValueRemove: (base) => ({
            ...base,
            color: "#fff",
            ":hover": {
                backgroundColor: "rgba(191,0,255,0.35)",
                color: "#fff",
            },
        }),
        input: (base) => ({
            ...base,
            color: "#fff",
        }),
        placeholder: (base) => ({
            ...base,
            color: "rgba(255,255,255,0.5)",
        }),
        singleValue: (base) => ({
            ...base,
            color: "#fff",
        }),
    };

    useEffect(() => {
        checkInviteAccess();
    }, []);

    function checkInviteAccess() {
        Axios.get(route('max_users')).then((response) => {
            let result = response.data.result;
            setInvite(result.access);
            setControl(result);
        });
    }

    function checkToInvite() {
        let message = "";
        let check = true;

        if (control.remain != '-') {
            if (invite) {
                let count = emails.length;
                if (control.remain < count) {
                    message = 'You has been invite more user your current plan';
                    check = false;
                }
            } else {
                message = "Please update your plan";
                check = false;
            }
        }
        setErrors(message);

        return check;
    }

    /**
     * Send invite link
     */
    function sendInviteLink() {

        if (emails) {
            let issue = true;

            Object.entries(emails).map(([key, email]) => {
                var isValid = isEmail(email.value);

                if (!isValid && issue) {
                    issue = false;
                }
            })
            setIssueFlag(issue);
            if (issue) {
                let checkInvite = checkToInvite();
                if (checkInvite) {
                    nProgress.start(0.5);
                    nProgress.inc(0.2);
                    Axios.post(route('send_invite_link'), { email: emails }).then((response) => {

                        if (response.data.result == 'success') {
                            nProgress.done();
                            props.setInviteUser(false);
                            notie.alert({ type: 'success', text: 'Invitation sent successfully', time: 5 });
                        }
                    });
                }
            }

        }
    }

    function isEmail(val) {
        let regEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!regEmail.test(val)) {
            return false;
        } else {
            return true;
        }
    }

    function addEmailFromInput() {
        const value = (inputValue || "").trim();
        if (!value) {
            return;
        }
        const isValid = isEmail(value);
        if (!isValid) {
            setIssueFlag(false);
            setErrors(props.translator['Please enter valid email']);
            return;
        }
        setIssueFlag(true);
        setErrors(null);
        const exists = (emails || []).some((item) => item.value === value);
        if (exists) {
            setInputValue("");
            return;
        }
        const next = [...(emails || []), { label: value, value }];
        setEmails(next);
        setInputValue("");
    }

    return (
        <Transition.Root show={open} as={Fragment}>
            <Dialog as="div" className="relative z-10" initialFocus={cancelButtonRef} onClose={() => { }} >
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
                            <Dialog.Panel className="relative rounded-2xl border border-white/10 bg-[#120815] text-left overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.55)] transform transition-all sm:my-8 sm:max-w-xl sm:w-full p-1">
                                <div className="bg-white/5 px-4 pb-2 sm:p-3 sm:pb-2">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mt-3 text-center sm:mt-0 sm:text-left">
                                            <Dialog.Title as="h3" className="text-lg leading-6 font-semibold text-white flex">
                                                {props.translator['Invite people']} {control && control.remain != '-' && <div className='text-sm text-red-400 justify-center flex px-2'>({(control.max_user) - control.remain + '/' + control.max_user})</div>}
                                            </Dialog.Title>
                                        </div>
                                    </div>
                                </div>

                                {errors &&
                                    <div className='text-sm text-red-400 justify-center flex'> <small> {errors}</small> </div>
                                }

                                <form id='form'>
                                    <div className='px-4 py-2 space-y-4'>
                                        <div className='form-group' >
                                            <label className="block text-sm font-medium text-white/70 py-2">
                                                {props.translator['Email addresses']}
                                            </label>
                                            <p className="text-xs text-white/50">Type an email and press Enter.</p>
                                            <div className="mt-1">
                                                <Creatable
                                                    isMulti
                                                    value={emails}
                                                    onChange={setEmails}
                                                    styles={selectStyles}
                                                    inputValue={inputValue}
                                                    onInputChange={(val) => setInputValue(val)}
                                                    onKeyDown={(event) => {
                                                        if (event.key === "Enter") {
                                                            event.preventDefault();
                                                            addEmailFromInput();
                                                        }
                                                    }}
                                                    formatCreateLabel={(val) => `Add "${val}"`}
                                                    menuIsOpen={false}
                                                    noOptionsMessage={() => null}
                                                    components={{
                                                        DropdownIndicator: null,
                                                        IndicatorSeparator: null,
                                                    }}
                                                    placeholder="Enter email address"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </form>

                                <div className="bg-white/5 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="button"
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#BF00FF] text-base font-medium text-white hover:bg-[#a100df] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#BF00FF]/40 sm:ml-3 sm:w-auto sm:text-sm"
                                        onClick={() => sendInviteLink()}
                                    >
                                        {props.translator['Send invite']}
                                    </button>
                                    <button
                                        type="button"
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-white/20 shadow-sm px-4 py-2 bg-white/5 text-base font-medium text-white/70 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#BF00FF]/40 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                        onClick={() => props.setInviteUser(false)}
                                        ref={cancelButtonRef}
                                    >
                                        {props.translator['Cancel']}
                                    </button>
                                    {!issueFlag &&
                                        <span className='text-sm text-red-400'> <small>  {props.translator['Please enter valid email']} </small> </span>
                                    }
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    )
}

export default InviteUser;












