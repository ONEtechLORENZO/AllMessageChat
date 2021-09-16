import React from 'react';
import Authenticated from '@/Layouts/Authenticated';
import { Head, Link } from '@inertiajs/inertia-react';

export default function Dashboard(props) {
    return (
        <Authenticated
            auth={props.auth}
            errors={props.errors}
            header={<div className="flex justify-between"> 
                <div> 
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">Dashboard</h2>
                </div> 
                <div>
                <Link
                    href={route('account_registration')}
                    className='ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                >
                    Create new account
                </Link>
                </div> 
            </div>}
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="pb-5">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Business profiles</h3>
                    </div>
                    <div className="bg-white shadow overflow-hidden rounded-md">
                        <ul role="list" className="divide-y divide-gray-200">
                            {props.accounts.map((account) => {
                                let status_class_names = 'bg-yellow-100 text-yellow-800';
                                if(account.status == 'Success') {
                                    status_class_names = 'bg-green-100 text-green-800';
                                }
                                else if(account.status == 'Rejected') {
                                    status_class_names = 'bg-red-100 text-red-800';
                                }

                                return (
                                    <li key={account.id} className="px-6 py-4">
                                        <div className="flex">
                                            <h2><Link href={route('account_view', account.id)}>{account.display_name}</Link></h2>
                                            <span className={`ml-3 text-sm inline-flex items-center px-2 py-0.5 rounded font-medium ${status_class_names}`}>
                                                {account.status}
                                            </span>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                        {!props.accounts || props.accounts.length == 0 ? 
                            <div className="text-center py-12">
                                <svg
                                    className="mx-auto h-12 w-12 text-gray-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    aria-hidden="true"
                                >
                                    <path
                                        vectorEffect="non-scaling-stroke"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                                    />
                                </svg>
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No account</h3>
                                    <p className="mt-1 text-sm text-gray-500">Get started by creating a new account.</p>
                                    <div className="mt-6">
                                        <Link href={route('account_registration')} className="underline text-sm text-indigo-600 hover:text-indigo-900">
                                            Click here to create new account
                                        </Link>
                                    </div>
                              </div>
                            : ''}
                    </div>
                </div>
            </div>
        </Authenticated>
    );
}
