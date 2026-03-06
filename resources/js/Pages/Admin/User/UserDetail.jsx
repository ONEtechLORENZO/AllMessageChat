import React, { Fragment, useRef, useEffect, useState } from 'react';
import Authenticated from '@/Layouts/Authenticated';
import { router as Inertia } from "@inertiajs/react";
import { Head, Link, useForm } from '@inertiajs/react';
import { Dialog, Transition } from '@headlessui/react'
import PristineJS from 'pristinejs';
import notie from 'notie';
import Input from '@/Components/Forms/Input';
import InputError from '@/Components/Forms/InputError';
import { currencies, countries } from '@/Pages/Constants';
import { BriefcaseIcon } from '@heroicons/react/24/solid';

export default function UserDetail(props) {

    const fieldList = {
        'Personal Information': {
            'first_name': { 'value': props.user.first_name, 'label': props.translator['First Name'], 'type': 'text', 'required': true },
            'last_name': { 'value': props.user.last_name, 'label': props.translator['Last Name'], 'type': 'text', 'required': true },
            'email': { 'value': props.user.email, 'label': (props.translator['Email']), 'type': 'email', 'required': true },
            'phone_number': { 'value': props.user.phone_number, 'label': (props.translator['Phone number']), 'type': 'text', 'required': false },
            'language': { 'value': props.user.language, 'label': (props.translator['Language']), 'type': 'select', 'required': false, 'options': { 'en': 'English', 'it': 'Italy' } },
            //  'currency': {'value': props.user.currency, 'label': (props.translator['Currency']), 'type': 'select', 'required': false, 'options': currencies },
            // 'time_zone': {'value': props.user.time_zone, 'label':(props.translator['Time Zone']), 'type': 'select', 'required': false , 'options': props.time_zone },
            //   'token': {'value': props.token, 'label': (props.translator['Token']) , action:'regenarate', 'type': 'text', 'required': false },
            'status': { 'value': (props.user.status == 1) ? 'Active' : 'Inactive', 'label': (props.translator['Active Status']), 'type': 'checkbox', 'required': false },

        },
        // 'Billing Information': {
        //     'company_address': {'value': props.user.company_address, 'label': (props.translator['Company Address']), 'type': 'textarea', 'required': false },
        //     'company_country': {'value': props.user.company_country, 'label': (props.translator['Company Country']), 'type': 'select', 'required': false, 'options': countries },
        //     'company_vat_id': {'value': props.user.company_vat_id, 'label': (props.translator['Company VAT ID']), 'type': 'text', 'required': false },
        //     'codice_destinatario': {'value': props.user.codice_destinatario, 'label': 'Company Codice Destinatario', 'type': 'text', 'required': false },
        //     'email': {'value': props.user.email, 'label': (props.translator['Admin email for invoices']), 'type': 'email', 'required': false },
        // }
    };

    const [spinClass, setSpinClass] = useState([]);
    const [relatedCompanies, setrelatedCompanies] = useState(props.companies);
    const [token, setToken] = useState(props.token);
    const [errors, setErrors] = useState({});
    const { data, setData, post, processing, reset } = useForm({});
    const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
    const [addCash, setAddCash] = useState(false);
    const [walletCash, setWalletCash] = useState({});
    const cancelButtonRef = useRef(null);


    /**
     * Handle input change
     */
    function handleChange(event) {
        const name = event.target.name;
        const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
        let newState = Object.assign({}, data);
        newState[name] = value;
        setData(newState);
    }

    // Update Token
    function updateToken() {
        axios({
            method: 'post',
            url: route('regenerate_token'),
            data: {
                user_id: props.user.id,
            }
        })
            .then((response) => {
                setToken(response.data.token);
                setSpinClass(' ');
            });
    }

    function setImpersonate() {
        var data = {
            user_id: props.user.id
        }
        if (!confirm('Do you want to change the user?')) {
            return false;
        }

        Inertia.post(route('change_log_in_user'), data, {
            onSuccess: (response) => {
                console.log(response);
            },
            onError: (errors) => {
                setErrors(errors)
            }
        });
    }

    /**
     * Open modal for change the password
     */
    function createNewPassword() {
        var pristine = new PristineJS(document.getElementById("user_new_password"));
        Inertia.post(route('change_password', props.user.id), data, {
            onSuccess: (response) => {
                setChangePasswordModalOpen(false);
                notie.alert({ type: 'success', text: 'Password changed successfully', time: 5 });
            },
            onError: (errors) => {
                setErrors(errors)
            }
        });
    }

    //wallet amount 
    function walletHandler(event) {
        let newCompany = Object.assign({}, walletCash);
        const name = event.target.name;
        let result = event.target.value;

        if (result) {
            result = result.replace(/[^0-9\.]/g, '');
            if (result.split('.').length > 2) {
                result = result.replace(/\.+$/, "")
            }

        }
        newCompany[name] = result;
        setWalletCash(newCompany);
    }

    function closeWallet() {
        setAddCash(false);
        setWalletCash({});
    }

    //add cash in wallet
    function addWalletAmount() {

        if (walletCash['selected_company'] && walletCash['wallet_amount']) {

            Inertia.post(route('wallet_amount'), walletCash, {
                onSuccess: (response) => {
                    closeWallet();
                    notie.alert({ type: 'success', text: 'Credit added successfully.', time: 5 });
                }
            });
        }
    }

    var isChangePassword = false;
    if ((props.user.id == props.current_user.id) || (props.current_user.role != 'regular')) {
        isChangePassword = true;
    }

    return (
        <Authenticated
            auth={props.auth}
            errors={props.errors}
            header={<div className="flex justify-between">
                <div>
                    <h2 className="font-semibold text-xl text-white leading-tight">{props.translator['Users']}</h2>
                </div>
                <div className='flex gap-3'>
                    <Link
                        href={route('wallet')}
                        className="bg-white/10 py-2 px-4 border border-white/10 rounded-md shadow-sm text-sm font-medium text-white/90 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0b0815] focus:ring-[#BF00FF]/60"
                    >
                        <span className='flex gap-1'>
                            <BriefcaseIcon className='h-4 w-4' /> {props.translator['Wallet']}
                        </span>
                    </Link>
                    {isChangePassword &&
                        <button
                            onClick={() => setChangePasswordModalOpen(true)}
                            className="bg-white/10 py-2 px-4 border border-white/10 rounded-md shadow-sm text-sm font-medium text-white/90 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0b0815] focus:ring-[#BF00FF]/60"
                        >
                            {props.translator['Change Password']}
                        </button>
                    }
                    {props.current_user.role == 'global_admin' &&
                        <button
                            onClick={() => setImpersonate()}
                            className="bg-white/10 py-2 px-4 border border-white/10 rounded-md shadow-sm text-sm font-medium text-white/90 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0b0815] focus:ring-[#BF00FF]/60"
                        >
                            Impersonate User
                        </button>
                    }
                    {props.current_user.role == 'global_admin' &&
                        <Link
                            href={route('updateUserSubscription', [props.user.id])}
                            className="bg-white/10 py-2 px-4 border border-white/10 rounded-md shadow-sm text-sm font-medium text-white/90 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0b0815] focus:ring-[#BF00FF]/60"
                        >
                            Change Plan
                        </Link>
                    }
                    {props.current_user.role == 'global_admin' &&
                        <button
                            onClick={() => setAddCash(true)}
                            className="bg-white/10 py-2 px-4 border border-white/10 rounded-md shadow-sm text-sm font-medium text-white/90 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0b0815] focus:ring-[#BF00FF]/60"
                        >
                            Add Credit
                        </button>
                    }
                    <Link
                        href={props.current_user.role == 'global_admin' ? route('edit_global_user', [props.user.id]) : route('editUser', [props.user.id])}
                        className='ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#BF00FF] hover:bg-[#9c00d9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0b0815] focus:ring-[#BF00FF]/60'
                    >
                        {props.translator['Edit User']}
                    </Link>
                </div>
            </div>}
        >
            <Head title={props.translator['User Detail']} />

            <div className="py-12">
                {Object.entries(fieldList).map(([title, fields]) => {
                    return (
                        <div key={title} className="max-w-7xl mx-auto sm:px-6 lg:px-8 mt-4">
                            <div className="bg-[#120b1f]/80 border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.35)] overflow-hidden sm:rounded-lg">
                                <div className="px-4 py-5 sm:px-6">
                                    <h3 className="text-lg leading-6 font-medium text-white">{props.translator[title]}</h3>
                                </div>
                                <div className="border-t border-white/10">
                                    <dl>
                                        {Object.entries(fields).map(([key, field], index) => {
                                            let showField = true;
                                            let bg_color = 'bg-white/5';
                                            if (index % 2 == 0) {
                                                bg_color = 'bg-white/[0.02]';
                                            }

                                            if (key == 'status' && props.current_user.role == 'regular') {
                                                showField = false;
                                            }

                                            if (key == 'codice_destinatario' && fields.company_country.value != 'Italy') {
                                                showField = false;
                                            }

                                            if (field.hasOwnProperty('options')) {
                                                field.value = field.options[field.value];
                                            }

                                            if (showField) {
                                                return (
                                                    <div key={key} className={`${bg_color} px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6`}>
                                                        <dt className="text-sm font-medium text-white/60">{field.label}</dt>
                                                        <dd className="mt-1 text-sm text-white/90 sm:mt-0 sm:col-span-2">
                                                            {field.value}
                                                        </dd>
                                                    </div>
                                                );
                                            }
                                        })}

                                    </dl>
                                </div>
                            </div>
                        </div>
                    )
                })}
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 mt-4">
                    <div className="bg-[#120b1f]/80 border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.35)] overflow-hidden sm:rounded-lg">
                        <div className="px-4 py-5 sm:px-6">
                            <h3 className="text-lg leading-6 font-medium text-white">{props.translator['User Related Workspaces']}</h3>
                        </div>
                        <div className="border-t border-white/10">
                            <dl>

                                <dd className="mt-1 text-sm text-white/90 sm:mt-0 sm:col-span-2">
                                    <ul className="bg-white/5 rounded-lg border border-white/10 w-full text-white/80">
                                        {relatedCompanies && Object.entries(relatedCompanies).map(([key, company]) => (
                                            <li
                                                key={company.id ?? key}
                                                className="cursor-pointer px-6 py-2 border-b border-white/10 w-full rounded-t-lg hover:bg-white/5"
                                            >
                                                {company.name}
                                            </li>
                                        ))}

                                    </ul>
                                </dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>


            <Transition.Root show={changePasswordModalOpen} as={Fragment}>
                <Dialog as="div" className="fixed z-10 inset-0 overflow-y-auto" initialFocus={cancelButtonRef} onClose={setChangePasswordModalOpen}>
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity" />
                        </Transition.Child>

                        {/* This element is to trick the browser into centering the modal contents. */}
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
                            &#8203;
                        </span>
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <div className="inline-block align-bottom bg-[#120b1f]/95 border border-white/10 rounded-lg px-4 pt-5 pb-4 text-left shadow-[0_20px_40px_rgba(0,0,0,0.45)] transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                                <div>
                                    <div className="">
                                        <Dialog.Title as="h3" className="text-xl leading-6 font-medium text-white">
                                            {props.translator['Change Password']}
                                        </Dialog.Title>
                                        <div className="mt-2">
                                            <form id="user_new_password">

                                                {(props.user.role == 'regualar') || (props.user.id == props.current_user.id) &&
                                                    <div className="grid gap-6">
                                                        <div className="form-group col-span-6 sm:col-span-4">
                                                            <label htmlFor="current_password" className="block text-sm font-medium text-white/70">
                                                                {props.translator['Current Password']}
                                                            </label>
                                                            <div className="mt-1 flex rounded-md shadow-sm">
                                                                <Input
                                                                    type="password"
                                                                    minlength="8"
                                                                    name='current_password'
                                                                    required={true}
                                                                    id='current_password'
                                                                    placeholder={props.translator['Current Password']}
                                                                    handleChange={handleChange}
                                                                    className="bg-[#0F0B1A] text-white placeholder-[#878787] border-white/10 focus:ring-[#BF00FF]/60 focus:border-[#BF00FF]/60"
                                                                />
                                                            </div>
                                                            <InputError message={errors.current_password} />
                                                        </div>
                                                    </div>
                                                }

                                                <div className="grid gap-6 mt-3">
                                                    <div className="form-group col-span-6 sm:col-span-4">
                                                        <label htmlFor="new_password" className="block text-sm font-medium text-white/70">
                                                            {props.translator['New Password']}
                                                        </label>
                                                        <div className="mt-1 flex rounded-md shadow-sm">
                                                            <Input
                                                                type="password"
                                                                minlength="8"
                                                                name='new_password'
                                                                required={true}
                                                                id='new_password'
                                                                placeholder={props.translator['New Password']}
                                                                handleChange={handleChange}
                                                                className="bg-[#0F0B1A] text-white placeholder-[#878787] border-white/10 focus:ring-[#BF00FF]/60 focus:border-[#BF00FF]/60"
                                                            />
                                                        </div>
                                                        <InputError message={errors.new_password} />
                                                    </div>
                                                </div>
                                                <div className="grid gap-6 mt-3">
                                                    <div className="form-group col-span-6 sm:col-span-4">
                                                        <label htmlFor="confirm_password" className="block text-sm font-medium text-white/70">
                                                            {props.translator['Confirm Password']}
                                                        </label>
                                                        <div className="mt-1 flex rounded-md shadow-sm">
                                                            <Input
                                                                type="password"
                                                                minlength="8"
                                                                name='confirm_password'
                                                                required={true}
                                                                id='confirm_password'
                                                                placeholder={props.translator['Confirm Password']}
                                                                handleChange={handleChange}
                                                                className="bg-[#0F0B1A] text-white placeholder-[#878787] border-white/10 focus:ring-[#BF00FF]/60 focus:border-[#BF00FF]/60"
                                                            />
                                                        </div>
                                                        <InputError message={errors.confirm_password} />
                                                    </div>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                                    <button
                                        type="button"
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#BF00FF] text-base font-medium text-white hover:bg-[#9c00d9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0b0815] focus:ring-[#BF00FF]/60 sm:col-start-2 sm:text-sm"
                                        onClick={() => createNewPassword()}
                                    >
                                        {props.translator['Change']}
                                    </button>
                                    <button
                                        type="button"
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-white/15 shadow-sm px-4 py-2 bg-white/10 text-base font-medium text-white/80 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0b0815] focus:ring-[#BF00FF]/60 sm:mt-0 sm:col-start-1 sm:text-sm"
                                        onClick={() => setChangePasswordModalOpen(false)}
                                    >
                                        {props.translator['Close']}
                                    </button>
                                </div>
                            </div>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition.Root>

            <Transition.Root show={addCash} as={Fragment}>
                <Dialog as="div" className="fixed z-10 inset-0 overflow-y-auto" initialFocus={cancelButtonRef} onClose={setAddCash}>
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity" />
                        </Transition.Child>

                        {/* This element is to trick the browser into centering the modal contents. */}
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
                            &#8203;
                        </span>
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <div className="inline-block align-bottom bg-[#120b1f]/95 border border-white/10 rounded-lg px-4 pt-5 pb-4 text-left shadow-[0_20px_40px_rgba(0,0,0,0.45)] transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                                <div>
                                    <div className="">
                                        <Dialog.Title as="h3" className="text-xl leading-6 font-medium text-white">
                                            Add Cash
                                        </Dialog.Title>
                                        <div className="mt-2">
                                            <form id="add_cash">

                                                <div className="grid gap-6 mt-3">
                                                    <div className="form-group col-span-6 sm:col-span-4">
                                                        <label htmlFor="confirm_password" className="block text-sm font-medium text-white/70">
                                                            Wallet Amount
                                                        </label>
                                                        <div className="mt-1 flex rounded-md shadow-sm">
                                                            <Input
                                                                type="text"
                                                                minlength="8"
                                                                name='wallet_amount'
                                                                required={true}
                                                                id='wallet_amount'
                                                                placeholder='$'
                                                                handleChange={walletHandler}
                                                                value={walletCash['wallet_amount']}
                                                                className="bg-[#0F0B1A] text-white placeholder-[#878787] border-white/10 focus:ring-[#BF00FF]/60 focus:border-[#BF00FF]/60"
                                                            />
                                                        </div>
                                                        <InputError message={errors.confirm_password} />
                                                    </div>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                                    <button
                                        type="button"
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#BF00FF] text-base font-medium text-white hover:bg-[#9c00d9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0b0815] focus:ring-[#BF00FF]/60 sm:col-start-2 sm:text-sm"
                                        onClick={() => addWalletAmount()}
                                    >
                                        Add
                                    </button>
                                    <button
                                        type="button"
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-white/15 shadow-sm px-4 py-2 bg-white/10 text-base font-medium text-white/80 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0b0815] focus:ring-[#BF00FF]/60 sm:mt-0 sm:col-start-1 sm:text-sm"
                                        onClick={() => closeWallet()}
                                    >
                                        {props.translator['Close']}
                                    </button>
                                </div>
                            </div>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition.Root>
        </Authenticated>
    );
}












