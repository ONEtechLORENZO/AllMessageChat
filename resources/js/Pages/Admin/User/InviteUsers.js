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
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
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
                            <Dialog.Panel className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-xl sm:w-full p-1">
                                <div className="bg-gray-50 px-4 pb-2 sm:p-3 sm:pb-2">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mt-3 text-center sm:mt-0 sm:text-left">
                                            <Dialog.Title as="h3" className="text-lg leading-6 font-semibold text-gray-900 flex">
                                                {props.translator['Invite people']} {control && control.remain != '-' && <div className='text-sm text-red-500 justify-center flex px-2'>({(control.max_user) - control.remain + '/' + control.max_user})</div>}
                                            </Dialog.Title>
                                        </div>
                                    </div>
                                </div>

                                {errors &&
                                    <div className='text-sm text-red-500 justify-center flex'> <small> {errors}</small> </div>
                                }

                                <form id='form'>
                                    <div className='px-4 py-2 space-y-4'>
                                        <div className='form-group' >
                                            <label className="block text-sm font-medium text-gray-700 py-2">
                                                {props.translator['Email addresses']}
                                            </label>
                                            <div className="mt-1">
                                                <Creatable
                                                    isMulti
                                                    value={emails}
                                                    onChange={setEmails}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </form>

                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="button"
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                                        onClick={() => sendInviteLink()}
                                    >
                                        {props.translator['Send invite']}
                                    </button>
                                    <button
                                        type="button"
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                        onClick={() => props.setInviteUser(false)}
                                        ref={cancelButtonRef}
                                    >
                                        {props.translator['Cancel']}
                                    </button>
                                    {!issueFlag &&
                                        <span className='text-sm text-red-500'> <small>  {props.translator['Please enter valid email']} </small> </span>
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