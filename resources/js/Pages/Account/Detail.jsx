import React, { Fragment, useMemo, useRef, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import Authenticated from '@/Layouts/Authenticated';
import { router as Inertia } from '@inertiajs/react';
import { Head, Link } from '@inertiajs/react';
import PristineJS from 'pristinejs';
import Input from '@/Components/Forms/Input';
import { defaultPristineConfig } from '@/Pages/Constants';
import {
    ArrowTopRightOnSquareIcon,
    ChevronLeftIcon,
    ClipboardDocumentIcon,
    LinkIcon,
    PencilSquareIcon,
    PlusIcon,
    TrashIcon,
    XMarkIcon,
} from '@heroicons/react/24/solid';
import Checkbox from '@/Components/Forms/Checkbox';

function Detail(props) {
    const [webhookData, setWebhookData] = useState({});
    const [incomingUrlModalOpen, setIncomingUrlModalOpen] = useState(false);
    const [selectedTab, selectTab] = useState('info');
    const [copiedWebhookId, setCopiedWebhookId] = useState(null);
    const cancelButtonRef = useRef(null);

    const tabs = [
        { name: 'Info', page: 'info' },
        { name: 'WebHooks', page: 'webhooks' },
    ];

    const visibleWebhookEvents = useMemo(() => {
        const facebookHooks = ['received', 'read', 'sent'];

        return Object.keys(props.webhook_events).filter((eventName) => {
            if (props.account.service !== 'whatsapp' && !facebookHooks.includes(eventName)) {
                return false;
            }

            return true;
        });
    }, [props.account.service, props.webhook_events]);

    function classNames(...classes) {
        return classes.filter(Boolean).join(' ');
    }

    function handleWebhookFormChange(event) {
        const { name, type, checked, value, files } = event.target;
        const newState = { ...webhookData };

        if (type === 'file' && files) {
            newState[name] = files[0];
        } else {
            newState[name] = type === 'checkbox' ? checked : value;
        }

        setWebhookData(newState);
    }

    function processWebhookForm() {
        const pristine = new PristineJS(document.getElementById('new_incoming_url'), defaultPristineConfig);
        const isValidated = pristine.validate(
            document.querySelectorAll('input[data-pristine-required], select[data-pristine-required]')
        );

        if (!isValidated) {
            return false;
        }

        let eventName = 'create_webhook_event';
        let eventParams = { id: props.account.id };
        if (webhookData.id) {
            eventName = 'update_webhook_url';
            eventParams = { id: props.account.id, webhook_id: webhookData.id };
        }

        Inertia.post(route(eventName, eventParams), webhookData, {
            onSuccess: () => {
                setIncomingUrlModalOpen(false);
                setWebhookData({});
            },
        });
    }

    function deleteWebhookEvent(id) {
        const confirmation = window.confirm(props.translator['Are you sure you want to delete this webhook event?']);
        if (!confirmation) {
            return;
        }

        Inertia.post(route('delete_webhook_event', id), {});
    }

    function editWebhookEvent(data) {
        setWebhookData(data);
        setIncomingUrlModalOpen(true);
    }

    function openWebhookForm() {
        setWebhookData({});
        setIncomingUrlModalOpen(true);
    }

    async function copyWebhookUrl(id, url) {
        if (!navigator?.clipboard?.writeText) {
            return;
        }

        await navigator.clipboard.writeText(url);
        setCopiedWebhookId(id);
        window.setTimeout(() => setCopiedWebhookId(null), 1800);
    }

    function closeWebhookModal() {
        setIncomingUrlModalOpen(false);
        setWebhookData({});
    }

    function formatEventLabel(eventName) {
        const webhookEvent = props.webhook_events[eventName];
        if (!webhookEvent) {
            return eventName;
        }

        return props.translator[webhookEvent.label] || webhookEvent.label;
    }

    return (
        <Authenticated auth={props.auth} errors={props.errors}>
            <Head title={props.translator['Profile Info']} />

            <div className="mx-auto max-w-7xl space-y-6 px-4 pb-8 pt-2 sm:px-6 lg:px-8">
                <div className="space-y-3">
                    <Link
                        className="inline-flex items-center gap-2 text-sm font-semibold text-white/80 transition hover:text-white"
                        href={route('social_profile')}
                    >
                        <ChevronLeftIcon className="h-4 w-4" />
                        {props.translator['Back to list view']}
                    </Link>
                    <div className="space-y-1">
                        <h1 className="text-3xl font-semibold tracking-tight text-white">
                            {props.account.service} {props.translator['channels']}
                        </h1>
                        <p className="text-lg font-semibold text-white/80">
                            {props.account.company_name} - {props.translator[props.account.category]}
                        </p>
                    </div>
                </div>

                <div className="border-b border-white/10">
                    <nav className="-mb-px flex gap-6" aria-label="Tabs">
                        {tabs.map((tab) => (
                            <button
                                key={tab.name}
                                type="button"
                                className={classNames(
                                    tab.page === selectedTab
                                        ? 'border-fuchsia-500 text-white'
                                        : 'border-transparent text-white/55 hover:border-white/15 hover:text-white/80',
                                    'border-b-2 px-1 py-3 text-sm font-semibold transition'
                                )}
                                onClick={() => selectTab(tab.page)}
                            >
                                {props.translator[tab.name]}
                            </button>
                        ))}
                    </nav>
                </div>

                {selectedTab === 'info' && (
                    <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#140816]/70 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-3xl">
                        <div className="space-y-4">
                            {Object.keys(props.field_info).map((key, index) => {
                                let labelClass = 'text-sm';

                                if (props.field_info[key].show && !props.field_info[key].show.includes(props.account.service)) {
                                    return null;
                                }
                                if (!props.field_info[key].label) {
                                    return null;
                                }
                                if (
                                    props.field_info[key].fb_show &&
                                    !props.field_info[key].fb_show.includes(props.account.service_engine)
                                ) {
                                    return null;
                                }
                                if (
                                    props.field_info[key].user_show &&
                                    !props.field_info[key].user_show.includes(props.auth.user.role)
                                ) {
                                    return null;
                                }

                                if (key === 'company_name') {
                                    labelClass = 'text-xl font-semibold';
                                }

                                return (
                                    <div
                                        key={key}
                                        className={classNames(
                                            index % 2 === 0 ? 'bg-white/[0.02]' : 'bg-transparent',
                                            'grid items-center gap-3 rounded-2xl px-4 py-4 sm:grid-cols-3 sm:gap-4'
                                        )}
                                    >
                                        <dt className="text-sm font-medium text-white/55">
                                            {props.field_info[key].label}
                                        </dt>
                                        {props.field_info[key].type === 'image' ? (
                                            <img
                                                src={`/image/profile/${props.account.id}`}
                                                alt="Profile picture"
                                                className="h-64 w-64 rounded-2xl object-cover"
                                            />
                                        ) : (
                                            <dd className={`sm:col-span-2 mb-0 overflow-x-auto text-white ${labelClass}`}>
                                                {key === 'api_partner' ? <>{props.account[key] && <>Checked</>}</> : <>{props.account[key]}</>}
                                            </dd>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-6">
                            <Link
                                className="inline-flex items-center rounded-full bg-fuchsia-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-fuchsia-500"
                                href={route('edit_account', props.account.id)}
                            >
                                {props.translator['Edit']}
                            </Link>
                        </div>
                    </div>
                )}

                {selectedTab === 'webhooks' && (
                    <div className="space-y-4">
                        {/* Header */}
                        <div className="rounded-2xl bg-[linear-gradient(135deg,#6b21a8,#4c1d95)] p-6 shadow-lg">
                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <div className="max-w-2xl space-y-1">
                                    <h2 className="text-xl font-extrabold uppercase tracking-wide text-white">Webhook Endpoints</h2>
                                    <p className="text-sm text-purple-200/80">
                                        Manage delivery and status callbacks for this channel. The URL shown here comes from the
                                        saved webhook record for this account, not from a frontend hardcode.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={openWebhookForm}
                                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#5b6af0] px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-[#4a58e0]"
                                >
                                    <PlusIcon className="h-4 w-4" />
                                    +{props.translator['Add Webhook URL']}
                                </button>
                            </div>
                        </div>

                        {/* Webhook cards */}
                        <div className="space-y-3">
                            {props.events.map((data) => {
                                const enabledEvents = visibleWebhookEvents.filter((eventName) => !!data[eventName]);

                                return (
                                    <div
                                        key={data.id}
                                        className="overflow-hidden rounded-2xl bg-[#1a1a2e] shadow-lg"
                                    >
                                        {/* Card top row */}
                                        <div className="flex flex-col gap-4 p-5 md:flex-row md:items-start md:justify-between">
                                            {/* Left: name + meta + event pills */}
                                            <div className="min-w-0 flex-1 space-y-3">
                                                <div>
                                                    <h3 className="text-lg font-extrabold uppercase tracking-wider text-white">{data.name_url}</h3>
                                                    <p className="text-xs text-white/45">
                                                        Created by {data.created_by} on{' '}
                                                        {new Date(data.created_at).toLocaleDateString('en-US')}
                                                    </p>
                                                </div>

                                                {enabledEvents.length > 0 && (
                                                    <div className="flex flex-wrap gap-2">
                                                        {enabledEvents.map((eventName) => (
                                                            <span
                                                                key={eventName}
                                                                className="rounded-md bg-[#22c55e] px-3 py-1 text-xs font-semibold text-white"
                                                            >
                                                                {formatEventLabel(eventName)}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Right: Edit / Delete */}
                                            <div className="flex shrink-0 items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => editWebhookEvent(data)}
                                                    className="rounded-lg bg-[#5b6af0] px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-[#4a58e0]"
                                                >
                                                    {props.translator['Edit']}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => deleteWebhookEvent(data.id)}
                                                    className="rounded-lg bg-[#d946a8] px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-[#c0389a]"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>

                                        {/* Callback URL box */}
                                        <div className="mx-5 mb-5 rounded-xl bg-[#0d0d1a] px-4 py-3">
                                            <div className="mb-2 flex items-center justify-between gap-3">
                                                <span className="text-xs font-semibold text-white/50">Callback URL</span>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => copyWebhookUrl(data.id, data.callback_url)}
                                                        className="rounded-lg bg-[#5b6af0] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#4a58e0]"
                                                    >
                                                        {copiedWebhookId === data.id ? 'Copied' : 'Copy'}
                                                    </button>
                                                    <a
                                                        href={data.callback_url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="rounded-lg bg-[#d946a8] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#c0389a]"
                                                    >
                                                        open
                                                    </a>
                                                </div>
                                            </div>
                                            <p className="overflow-x-auto whitespace-nowrap text-sm font-medium text-[#4ade80]">
                                                {data.callback_url}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}

                            {props.events.length === 0 && (
                                <div className="rounded-2xl bg-[#1a1a2e] px-6 py-12 text-center text-white/45">
                                    {props.translator['Webhooks not configured yet.']}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <Transition.Root show={incomingUrlModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" initialFocus={cancelButtonRef} onClose={closeWebhookModal}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                                enterTo="opacity-100 translate-y-0 sm:scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            >
                                <Dialog.Panel className="relative w-full max-w-3xl overflow-hidden rounded-[28px] border border-white/10 bg-[#12041f]/95 p-6 text-left shadow-[0_30px_120px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-8">
                                    <button
                                        type="button"
                                        ref={cancelButtonRef}
                                        onClick={closeWebhookModal}
                                        className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/70 transition hover:bg-white/[0.08] hover:text-white"
                                    >
                                        <XMarkIcon className="h-5 w-5" />
                                    </button>

                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-fuchsia-200">
                                                <LinkIcon className="h-3.5 w-3.5" />
                                                {webhookData.id ? props.translator['Update'] : props.translator['Add']} Webhook
                                            </div>
                                            <div>
                                                <Dialog.Title as="h3" className="text-3xl font-semibold tracking-tight text-white">
                                                    {webhookData.id ? props.translator['Update'] : props.translator['Add']} Webhook
                                                </Dialog.Title>
                                                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">
                                                    {
                                                        props.translator[
                                                            'Create a new WhatsApp Webhook URL to receive notifications about events like sent, failed etc...'
                                                        ]
                                                    }
                                                </p>
                                            </div>
                                        </div>

                                        <form id="new_incoming_url" className="space-y-6">
                                            <div className="grid gap-4 md:grid-cols-2">
                                                <div className="space-y-2">
                                                    <label htmlFor="name_url" className="block text-sm font-medium text-white/80">
                                                        Name
                                                    </label>
                                                    <Input
                                                        name="name_url"
                                                        value={webhookData.name_url || ''}
                                                        required={true}
                                                        id="name_url"
                                                        placeholder={props.translator['Name of URL']}
                                                        handleChange={handleWebhookFormChange}
                                                        className="border-white/10 bg-white/[0.04] px-4 py-3 text-white placeholder:text-white/30 focus:border-fuchsia-500 focus:ring-fuchsia-500"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label htmlFor="callback_url" className="block text-sm font-medium text-white/80">
                                                        Webhook URL
                                                    </label>
                                                    <Input
                                                        name="callback_url"
                                                        value={webhookData.callback_url || ''}
                                                        required={true}
                                                        id="callback_url"
                                                        placeholder={props.translator['Callback URL']}
                                                        handleChange={handleWebhookFormChange}
                                                        className="border-white/10 bg-white/[0.04] px-4 py-3 text-white placeholder:text-white/30 focus:border-fuchsia-500 focus:ring-fuchsia-500"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between gap-3">
                                                    <div>
                                                        <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-white">
                                                            Event subscriptions
                                                        </h4>
                                                        <p className="mt-1 text-sm text-white/55">
                                                            Select which delivery events should trigger a callback.
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="grid gap-3 md:grid-cols-2">
                                                    {visibleWebhookEvents.map((eventName) => (
                                                        <label
                                                            key={eventName}
                                                            htmlFor={eventName}
                                                            className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-fuchsia-400/25 hover:bg-white/[0.05]"
                                                        >
                                                            <div className="pt-0.5">
                                                                <Checkbox
                                                                    id={eventName}
                                                                    name={eventName}
                                                                    handleChange={handleWebhookFormChange}
                                                                    value={webhookData[eventName]}
                                                                />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <div className="text-sm font-semibold text-white">
                                                                    {formatEventLabel(eventName)}
                                                                </div>
                                                                <p className="text-sm leading-5 text-white/55">
                                                                    {props.webhook_events[eventName].help_text}
                                                                </p>
                                                            </div>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </form>

                                        <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-end">
                                            <button
                                                type="button"
                                                onClick={closeWebhookModal}
                                                className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white/80 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
                                            >
                                                {props.translator['Close']}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={processWebhookForm}
                                                className="inline-flex items-center justify-center rounded-full bg-fuchsia-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-fuchsia-500"
                                            >
                                                {webhookData.id ? props.translator['Update'] : props.translator['Create']}
                                            </button>
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

export default Detail;
