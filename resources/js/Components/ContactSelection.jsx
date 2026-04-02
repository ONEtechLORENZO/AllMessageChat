import React, { useEffect, useMemo, useRef, useState, Fragment } from "react";
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
    DialogTitle,
    Transition,
    TransitionChild,
} from "@headlessui/react";
import CreatableSelect from "react-select/creatable";
import nProgress from "nprogress";
import Axios from "axios";
import { router } from "@inertiajs/react";
import NewForm from "./Forms/NewForm";
import { PlusIcon, UserPlusIcon, XMarkIcon } from "@heroicons/react/24/solid";

export default function ContactSelection(props) {
    const cancelButtonRef = useRef(null);

    const [isOpen, setIsOpen] = useState(true);
    const startWithCreateForm = props.startWithCreateForm ?? false;
    const [createForm, setCreateForm] = useState(startWithCreateForm);

    const [contactList, setContactList] = useState([]);     // must be array
    const [selectedContact, setSelectedContact] = useState([]); // must be array for isMulti
    const [errors, setErrors] = useState({});               // you used setErrors but never defined it

    const selectStyles = useMemo(() => ({
        control: (base, state) => ({
            ...base,
            minHeight: 56,
            backgroundColor: "rgba(255,255,255,0.04)",
            borderColor: state.isFocused ? "rgba(217, 70, 239, 0.75)" : "rgba(255,255,255,0.10)",
            boxShadow: state.isFocused ? "0 0 0 1px rgba(217, 70, 239, 0.65)" : "none",
            borderRadius: 18,
            color: "#fff",
            paddingLeft: 6,
            transition: "all 150ms ease",
            "&:hover": {
                borderColor: "rgba(217, 70, 239, 0.55)",
            },
        }),
        menu: (base) => ({
            ...base,
            backgroundColor: "#12041f",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 18,
            overflow: "hidden",
            boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
        }),
        menuList: (base) => ({
            ...base,
            padding: 8,
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isFocused
                ? "rgba(217,70,239,0.14)"
                : state.isSelected
                    ? "rgba(217,70,239,0.22)"
                    : "transparent",
            color: "#fff",
            borderRadius: 12,
            cursor: "pointer",
        }),
        input: (base) => ({
            ...base,
            color: "#fff",
        }),
        placeholder: (base) => ({
            ...base,
            color: "rgba(255,255,255,0.35)",
        }),
        singleValue: (base) => ({
            ...base,
            color: "#fff",
        }),
        multiValue: (base) => ({
            ...base,
            backgroundColor: "rgba(217,70,239,0.18)",
            borderRadius: 9999,
            padding: "2px 4px",
        }),
        multiValueLabel: (base) => ({
            ...base,
            color: "#f5d0fe",
            fontWeight: 600,
        }),
        multiValueRemove: (base) => ({
            ...base,
            color: "#f5d0fe",
            borderRadius: 9999,
            ":hover": {
                backgroundColor: "rgba(255,255,255,0.12)",
                color: "#fff",
            },
        }),
        indicatorSeparator: (base) => ({
            ...base,
            backgroundColor: "rgba(255,255,255,0.10)",
        }),
        dropdownIndicator: (base) => ({
            ...base,
            color: "rgba(255,255,255,0.60)",
            ":hover": {
                color: "#fff",
            },
        }),
        clearIndicator: (base) => ({
            ...base,
            color: "rgba(255,255,255,0.60)",
            ":hover": {
                color: "#fff",
            },
        }),
        noOptionsMessage: (base) => ({
            ...base,
            color: "rgba(255,255,255,0.55)",
        }),
        loadingMessage: (base) => ({
            ...base,
            color: "rgba(255,255,255,0.55)",
        }),
    }), []);

    useEffect(() => {
        getUserContacts("");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function closeModal() {
        setIsOpen(false);
        props.setShowForm(false);
    }

    /**
     * Get User contact list
     */
    function getUserContacts(key) {
        nProgress.start();
        nProgress.inc(0.2);

        let url = route("get_user_contacts_list");
        url += `?parent=${props.parent_module}`;

        if (props.parent_id) url += `&record=${props.parent_id}`;
        if (key) url += `&key=${encodeURIComponent(key)}`;

        Axios.get(url)
            .then((response) => {
                setContactList(response?.data?.records ?? []);
            })
            .catch(() => {
                setContactList([]);
            })
            .finally(() => {
                nProgress.done(true);
            });
    }

    /**
     * react-select calls onInputChange with (newValue, actionMeta)
     */
    function handleInputChange(value) {
        if (value) getUserContacts(value);
        return value; // recommended by react-select so it doesn't clear input unexpectedly
    }

    function addContacts() {
        const data = {
            contacts: selectedContact,
            parent: props.parent_module,
            record: props.parent_id ? props.parent_id : "",
        };

        router.post(route("store_user_contact_list"), data, {
            onSuccess: () => closeModal(),
            onError: (errs) => setErrors(errs ?? {}),
        });
    }

    function hideForm() {
        setCreateForm(false);
        if (startWithCreateForm) {
            closeModal();
        }
    }

    function addNewContact() {
        Axios.get(route("new_contact")).then((response) => {
            if (response?.data?.status === true) {
                const contact = response.data.contact;
                if (!contact) return;

                const id = contact.id;
                const first = contact.first_name ?? "";
                const last = contact.last_name ?? "";
                const label = `${first} ${last}`.trim();

                const newItem = { label, value: id };

                setSelectedContact((prev) => [...(prev ?? []), newItem]);
            }
        });
    }

    return (
        <>
            {!startWithCreateForm && (
            <Transition show={isOpen} as={Fragment}>
                <Dialog
                    open={isOpen}
                    onClose={closeModal}
                    initialFocus={cancelButtonRef}
                    className="relative z-10"
                >
                    {/* Backdrop */}
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <DialogBackdrop className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity" />
                    </TransitionChild>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-6">
                            {/* Panel */}
                            <TransitionChild
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                                enterTo="opacity-100 translate-y-0 sm:scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            >
                                <DialogPanel className="relative w-full max-w-2xl transform overflow-hidden rounded-[28px] border border-white/10 bg-[#12041f]/95 p-6 text-left shadow-[0_30px_120px_rgba(0,0,0,0.45)] transition-all backdrop-blur-xl sm:my-8 sm:p-8">
                                    <button
                                        type="button"
                                        ref={cancelButtonRef}
                                        onClick={closeModal}
                                        className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/70 transition hover:bg-white/[0.08] hover:text-white"
                                    >
                                        <XMarkIcon className="h-5 w-5" />
                                    </button>

                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-fuchsia-200">
                                                <UserPlusIcon className="h-3.5 w-3.5" />
                                                {props.translator["Select Contact"]}
                                            </div>

                                            <div className="flex flex-col gap-4 border-b border-white/10 pb-5 md:flex-row md:items-start md:justify-between">
                                                <div className="space-y-2">
                                                    <DialogTitle className="text-3xl font-semibold tracking-tight text-white">
                                                        {props.translator["Select Contact"]}
                                                    </DialogTitle>
                                                    <p className="max-w-xl text-sm leading-6 text-white/60">
                                                        Add one or more existing contacts to this conversation, or create a new one without leaving the chat flow.
                                                    </p>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => setCreateForm(true)}
                                                    className="inline-flex items-center justify-center gap-2 rounded-full border border-fuchsia-400/20 bg-fuchsia-500/10 px-4 py-2.5 text-sm font-semibold text-fuchsia-100 transition hover:bg-fuchsia-500/20"
                                                >
                                                    <PlusIcon className="h-4 w-4" />
                                                    {props.translator["Add a contact"]}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between gap-3">
                                                <label className="text-sm font-semibold uppercase tracking-[0.2em] text-white/45">
                                                    Contacts
                                                </label>
                                                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-white/65">
                                                    {selectedContact.length} selected
                                                </span>
                                            </div>

                                            <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                                                <CreatableSelect
                                                    isMulti
                                                    value={selectedContact}
                                                    options={contactList}
                                                    onInputChange={handleInputChange}
                                                    onChange={(v) => setSelectedContact(v ?? [])}
                                                    placeholder="Search or select contacts..."
                                                    styles={selectStyles}
                                                    theme={(theme) => ({
                                                        ...theme,
                                                        borderRadius: 18,
                                                        colors: {
                                                            ...theme.colors,
                                                            primary: "#d946ef",
                                                            primary25: "rgba(217,70,239,0.14)",
                                                            neutral0: "transparent",
                                                            neutral80: "#ffffff",
                                                        },
                                                    })}
                                                />
                                            </div>

                                            {errors.contacts && (
                                                <p className="text-sm text-red-300">{errors.contacts}</p>
                                            )}
                                        </div>

                                        <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-end">
                                            <button
                                                type="button"
                                                className="inline-flex w-full justify-center rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white/80 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white sm:w-auto"
                                                onClick={closeModal}
                                            >
                                                {props.translator["Cancel"]}
                                            </button>

                                            <button
                                                type="button"
                                                className="inline-flex w-full justify-center rounded-full bg-fuchsia-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-fuchsia-500 sm:w-auto"
                                                onClick={addContacts}
                                            >
                                                {props.translator["Add"]}
                                            </button>
                                        </div>
                                    </div>
                                </DialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </Dialog>
            </Transition>
            )}

            {createForm ? (
                <NewForm
                    module={"Contact"}
                    translator={props.translator}
                    hideForm={hideForm}
                    parent_module={props.parent_module}
                    parent_id={props.parent_id ? props.parent_id : ""}
                    parent_name={props.parent_name}
                    getUserContacts={getUserContacts}
                    addNewContact={addNewContact}
                    newcontact={true}
                />
            ) : null}
        </>
    );
}
