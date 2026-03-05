import React, { useEffect, useRef, useState, Fragment } from "react";
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

export default function ContactSelection(props) {
    const cancelButtonRef = useRef(null);

    const [isOpen, setIsOpen] = useState(true);
    const [createForm, setCreateForm] = useState(false);

    const [contactList, setContactList] = useState([]);     // must be array
    const [selectedContact, setSelectedContact] = useState([]); // must be array for isMulti
    const [errors, setErrors] = useState({});               // you used setErrors but never defined it

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
                        <DialogBackdrop className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                    </TransitionChild>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
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
                                <DialogPanel className="relative w-full max-w-lg transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:p-6">
                                    <div>
                                        <DialogTitle className="text-xl font-medium leading-6 text-gray-900">
                                            {props.translator["Select Contact"]}
                                            <span className="float-right">
                                                <button
                                                    type="button"
                                                    onClick={() => setCreateForm(true)}
                                                    className="text-sm text-indigo-900"
                                                >
                                                    {props.translator["Add a contact"]}
                                                </button>
                                            </span>
                                        </DialogTitle>

                                        <div className="mt-2">
                                            <CreatableSelect
                                                isMulti
                                                value={selectedContact}
                                                options={contactList}
                                                onInputChange={handleInputChange}
                                                onChange={(v) => setSelectedContact(v ?? [])}
                                            />
                                            {/* If you want to show errors somewhere, `errors` is now available */}
                                        </div>
                                    </div>

                                    <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                                        <button
                                            type="button"
                                            className="w-full self-end inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
                                            onClick={addContacts}
                                        >
                                            {props.translator["Add"]}
                                        </button>

                                        <button
                                            ref={cancelButtonRef}
                                            type="button"
                                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                                            onClick={closeModal}
                                        >
                                            {props.translator["Cancel"]}
                                        </button>
                                    </div>
                                </DialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </Dialog>
            </Transition>

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
