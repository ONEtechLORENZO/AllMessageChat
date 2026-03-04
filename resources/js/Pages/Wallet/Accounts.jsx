import React ,{ useState } from "react";
import { Link } from '@inertiajs/react';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import Alert from '@/Components/Alert';
import { Badge } from "reactstrap";
import { router as Inertia } from "@inertiajs/react";
import nProgress from 'nprogress';

import { PencilSquareIcon, ChevronLeftIcon, TrashIcon, PlusIcon, ChevronRightIcon  } from '@heroicons/react/24/solid';

export default function Accounts(props) {

    const[ deleteAccoutId , setDeleteAccountId] = useState('');
    const[ accounts , setAccountList] = useState(props.accounts);
   
    const tabs = [
        { name: 'Whatsapp', href: '#', current: true, page: 'whatsapp' },
        { name: 'Instagram', href: '#', current: false , page: 'instagram' },
        { name: 'Facebook', href: '#', current: false , page: 'facebook' },
      ];
    
    function classNames(...classes) {
        return classes.filter(Boolean).join(' ')
    }
    const [page, setPage] = useState('whatsapp');


    // Delete Account
    function deleteAccount(accountId){
       
        setDeleteAccountId(accountId);

        confirmAlert({
            title: (props.translator['Confirm to Delete']),
            message: (props.translator['Are you sure to do this?']),
            buttons: [
            {
              label: (props.translator['Yes']),
              onClick: () => {
                nProgress.start(0.5);
                nProgress.inc(0.2);
                axios({
                    method: 'post',
                    url: route( 'delete_account'),
                    data: {
                        id: accountId
                    }
                })
                .then( (response) =>{
                    setAccountList(response.data.accounts);
                    nProgress.done();
                });

              }
            },
            {
              label: 'No',
              onClick: () => setDeleteAccountId('')
            }
          ]
        });
    }

    return (
        <>
        <div className="grid gap-4 grid-cols-2 border-[#B9B9B9] border-b">
            
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                {tabs.map((tab) => (
                <a
                    key={tab.name}
                    href={tab.href}
                    className={classNames(
                    tab.page == page
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                    'whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm'
                    )}
                    aria-current={tab.current ? 'page' : undefined}
                    onClick={() => setPage(tab.page)}
                >
                    {tab.name}
                </a>
                ))}
            </nav>
               
            <div className="flex justify-end items-center">
                <Link
                        href={route('account_registration')}
                        className='ml-3 btn btn-primary'
                    >
                        {props.translator['Link Social Profile']}
                </Link>
            </div>
        </div>

        <div className="grid gap-4 grid-cols-1">
            <div className=" overflow-hidden ">
                <div className="space-y-4 my-4">
                    {accounts && accounts.map((account) => {
                        let status_class_names = 'text-[#e6e60b]';
                        if(account.status == 'Active') {
                            status_class_names = 'text-[#0be651]';
                        }
                        else if(account.status == 'Inactive') {
                            status_class_names = 'text-[#f50515]';
                        }
                        if(account.service != page){
                            return true;
                        }

                        return (
                            <div
                                key={account.id}
                                className="pt-3 bg-[#140816]/70 backdrop-blur-3xl drop-shadow rounded-2xl grid grid-cols-12 px-6 py-4"
                            >

                                <div className='col-span-6 flex flex-col'>
                                    <Link
                                        className="text-white text-base font-semibold"
                                        href={route('account_view', account.id)}
                                    >
                                        {account.company_name} ({account.service})
                                    </Link>
                                    <span className="truncate text-white">
                                        Account Id : {account.id}
                                    </span>
                                    {(account.service == 'instagram' || account.service == 'facebook') &&
                                        <span className="truncate text-[#878787]">
                                            Page name : {account.fb_page_name}
                                        </span>
                                    }
                                </div>

                                <span className={`ml-3 text-sm inline-flex items-center px-2 col-span-5 py-0.5 rounded font-semibold ${status_class_names}`}>
                                    {account.status}
                                </span>
                                
                                <div className='inline-flex'>
                                    <button
                                        onClick={(e) => deleteAccount(account.id)}
                                        type="button"
                                        className="inline-flex items-center px-4 py-1 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                        >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                                
                            </div>
                        );
                    })}
                </div>

                {!accounts ||accounts.length == 0 && 
                    <div className="text-center py-12 mt-5">
                            <p className="mt-1 text-sm text-gray-500 w-1/3 border-2 p-3 ml-4" >
                            {props.translator['Hi']} {props.auth.user.name}, {props.translator['you have not linked any social account to your OneMessage yet. To do this']} <a href="#" className="text-indigo-500" onClick={() => {Inertia.get(route('account_registration'));} }>{props.translator['click']}</a> {props.translator['here or the blue button at the top right. Good work!']}
                            </p>
                    </div>
                }

{/* 
                {!accounts || accounts.length == 0 ? 
                    <>
                    {props.createAccount ? 
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
                            <h3 className="mt-2 text-sm font-medium text-gray-900">{props.translator['No profile']}</h3>
                            <p className="mt-1 text-sm text-gray-500">{props.translator['Get started by creating a new social profile.']}</p>
                            <div className="mt-6">
                                <Link href={route('account_registration')} className="underline text-sm text-indigo-600 hover:text-indigo-900">
                                    {props.translator['Click here to create a new social profile']}
                                </Link>
                            </div>
                        </div>
                    : 
                        <Alert type='info' message= {props.translator['No records']} hideClose={true} />
                    }
                    </>
                : ''}
                 */}

            </div>
        </div>
        </>
    );
}












