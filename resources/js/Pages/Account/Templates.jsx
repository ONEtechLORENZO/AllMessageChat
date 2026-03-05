import React, { useState, useEffect, useMemo } from 'react';
import Authenticated from '@/Layouts/Authenticated';
import { Head, Link, router as Inertia } from '@inertiajs/react';
import { TrashIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { FolderPlusIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import notie from 'notie';
import nProgress from 'nprogress';

function Templates(props) {
    const [templates, setTemplates] = useState(props.templates ?? []);
    const [selectedAccountId, setSelectedAccountId] = useState(
        props.account?.id ? String(props.account.id) : '',
    );
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setTemplates(props.templates ?? []);
        setSelectedAccountId(props.account?.id ? String(props.account.id) : '');
        setIsLoading(false);
    }, [props.templates, props.account?.id]);

    const resolvedAccount = useMemo(() => {
        if (props.account?.id) return props.account;
        if (!selectedAccountId) return null;
        return (
            props.accounts?.find(
                (account) => String(account.id) === String(selectedAccountId),
            ) ?? null
        );
    }, [props.account, props.accounts, selectedAccountId]);


    function handleAccountChange(event) {
        const nextId = event.target.value;
        setSelectedAccountId(nextId);
        setTemplates([]);
        setIsLoading(!!nextId);
        Inertia.get(
            route('account_templates', { account_id: nextId }),
            {},
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
                onFinish: () => setIsLoading(false),
            },
        );
    }

    function refreshTemplates() {
        if (!selectedAccountId) return;
        setIsLoading(true);
        Inertia.get(
            route('account_templates', { account_id: selectedAccountId }),
            {},
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
                onFinish: () => setIsLoading(false),
            },
        );
    }

    function syncTemplates() {
        if (!selectedAccountId) return;
        nProgress.start(0.5);
        nProgress.inc(0.2);
        axios.get(route('sync_templates', { account: selectedAccountId })).then(() => {
            nProgress.done();
            notie.alert({ type: 'success', text: 'Template synced successfully', time: 5 });
            refreshTemplates();
        });
    }

    function deleteTemplate(id) {
        const confirmation = window.confirm(
            props.translator['Are you sure you want to delete this Templete?'],
        );
        if (confirmation) {
            axios.post(route('delete_template', id)).then(() => {
                refreshTemplates();
            });
        }
    }

    const hasAccount = !!resolvedAccount;

    return (
        <Authenticated
            auth={props.auth}
            errors={props.errors}
            current_page={props.current_page}
            navigationMenu={props.menuBar}
        >
            <Head title={props.translator['Templates'] ?? 'Templates'} />

            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-1">
                        <h3 className="text-2xl font-semibold text-white">
                            {props.translator['Templates'] ?? 'Templates'}
                        </h3>
                        {hasAccount ? (
                            <p className="text-sm text-white/60">
                                {resolvedAccount.company_name} -{' '}
                                {props.translator[resolvedAccount.category] ??
                                    resolvedAccount.category}
                            </p>
                        ) : (
                            <p className="text-sm text-white/60">
                                {props.translator['Select an account to view templates.'] ??
                                    'Select an account to view templates.'}
                            </p>
                        )}
                    </div>

                    <div className="min-w-[260px]">
                        <label
                            htmlFor="account_id"
                            className="block text-sm font-medium text-white/80"
                        >
                            {props.translator['Account'] ?? 'Account'}
                        </label>
                        <select
                            id="account_id"
                            name="account_id"
                            value={selectedAccountId}
                            onChange={handleAccountChange}
                            className="mt-2 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white focus:border-white/30 focus:outline-none"
                        >
                            <option value="">
                                {props.translator['Select account'] ?? 'Select account'}
                            </option>
                            {props.accounts?.map((account) => (
                                <option key={account.id} value={account.id}>
                                    {account.company_name} ({account.service})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="bg-[#140816]/70 backdrop-blur-3xl border border-white/10 ring-1 ring-white/5 shadow overflow-hidden sm:rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-white/60">
                            {hasAccount
                                ? props.translator['Templates for this account'] ??
                                  'Templates for this account'
                                : props.translator['Choose an account to see templates'] ??
                                  'Choose an account to see templates'}
                        </div>
                        <button
                            onClick={() => syncTemplates()}
                            disabled={!hasAccount || isLoading}
                            style={{ backgroundColor: "#BF00FF", borderColor: "#BF00FF" }}
                            className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:w-auto sm:text-sm hover:opacity-90 disabled:opacity-60"
                        >
                            {props.translator['Sync Templates']}
                        </button>
                    </div>

                    <div className="overflow-hidden mt-4">
                        {!hasAccount ? (
                            <div className="text-center py-10">
                                <FolderPlusIcon className="mx-auto h-12 w-12 text-white/40" />
                                <h3 className="mt-3 text-sm font-medium text-white">
                                    {props.translator['Select an account to continue'] ??
                                        'Select an account to continue'}
                                </h3>
                                <p className="mt-1 text-sm text-white/50">
                                    {props.translator['You can only view templates after choosing an account.'] ??
                                        'You can only view templates after choosing an account.'}
                                </p>
                            </div>
                        ) : isLoading ? (
                            <div className="text-center py-10 text-white/70 text-sm">
                                {props.translator['Loading templates...'] ?? 'Loading templates...'}
                            </div>
                        ) : (
                            <div className="space-y-4">
                            {templates.map((data) => {
                                let status_class_names = 'text-[#E68D08]';
                                if ((data.status || '').toLowerCase() == 'approved') {
                                    status_class_names = 'text-[#25B222]';
                                } else if (
                                    data.status == 'rejected' ||
                                    (data.status || '').indexOf('REJECTED') != -1
                                ) {
                                    status_class_names = 'text-[#E68D08]';
                                }

                                return (
                                    <div
                                        key={data.id}
                                        className="pt-3 bg-white drop-shadow rounded-md grid grid-cols-12 px-6 py-4"
                                    >
                                        <div className="col-span-6 flex flex-col">
                                            <Link
                                                className="text-[#393939] text-base font-semibold"
                                                href={route('template_detail_view', [data.account_id, data.id])}
                                            >
                                                {data.name}
                                            </Link>
                                            <span className="truncate">
                                                {props.translator['Created by']} {data.creater_name?.name ?? ''}{' '}
                                                {data.created_at
                                                    ? `on ${new Date(data.created_at).toLocaleDateString('en-US')}`
                                                    : ''}
                                            </span>
                                            <span className="truncate">{data.language}</span>
                                        </div>

                                        <span
                                            className={`ml-3 text-sm inline-flex items-center px-2 col-span-5 py-0.5 rounded font-semibold ${status_class_names}`}
                                        >
                                            {/* {(data.status).toUpperCase()} */}
                                        </span>
                                            <div className="flex gap-1 justify-end items-center">
                                                <TrashIcon
                                                    className="h-6 w-6 cursor-pointer text-[#6C757D]"
                                                    onClick={() => deleteTemplate(data.id)}
                                                />
                                            <span>
                                                <Link
                                                    className="text-[#393939] text-base font-semibold"
                                                    href={route('template_detail_view', [data.account_id, data.id])}
                                                >
                                                    <ChevronRightIcon className="text-primary h-6 w-6" />
                                                </Link>
                                            </span>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                        )}

                        {hasAccount && (!templates || templates.length == 0) ? (
                            <div className="text-center py-12">
                                <FolderPlusIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">
                                    {props.translator['No templates found']}
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    {props.translator['Sync templates or choose another account to continue.'] ??
                                        'Sync templates or choose another account to continue.'}
                                </p>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </Authenticated>
    );
}

export default Templates;
