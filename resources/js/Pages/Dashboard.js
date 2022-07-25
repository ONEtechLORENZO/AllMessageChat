import React,{useState} from 'react';
import Authenticated from '@/Layouts/Authenticated';
import { Head, Link } from '@inertiajs/inertia-react';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

export default function Dashboard(props) {
    
    const[ deleteAccoutId , setDeleteAccountId] = useState('');
    const[ accounts , setAccountList] = useState(props.accounts);

    // Delete Account
    function deleteAccount(event){
        var accountId = event.target.dataset.account_id;
        setDeleteAccountId(accountId);

        confirmAlert({
            title: 'Confirm to Delete',
            message: 'Are you sure to do this.',
            buttons: [
            {
              label: 'Yes',
              onClick: () => {
                axios({
                    method: 'post',
                    url: route( 'delete_account'),
                    data: {
                        id: accountId
                    }
                })
                .then( (response) =>{
                    setAccountList(response.data.accounts);
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
                            {accounts.map((account) => {
                                let status_class_names = 'bg-yellow-100 text-yellow-800';
                                if(account.status == 'Success') {
                                    status_class_names = 'bg-green-100 text-green-800';
                                }
                                else if(account.status == 'Rejected') {
                                    status_class_names = 'bg-red-100 text-red-800';
                                }

                                return (
                                    <li key={account.id} className="px-6 py-4">
                                        <div className="flex justify-between">
                                            <div className="flex">
                                            <h2>
                                                <Link href={route('account_view', account.id)}>
                                                    {account.company_name} ({account.service})
                                                </Link>
                                            </h2>
                                            <span className={`ml-3 text-sm inline-flex items-center px-2 py-0.5 rounded font-medium ${status_class_names}`}>
                                                {account.status}
                                            </span>
                                            </div>
                                            
                                            <div className='inline-flex'>
                                                  <button
                                                      onClick={(e) => deleteAccount(e)}
                                                      data-account_id={account.id}
                                                      type="button"
                                                      className="inline-flex items-center px-4 py-1 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                                      >
                                                      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                      </svg>
                                                  </button>
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                        {!accounts || accounts.length == 0 ? 
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

                    <div className='clear'></div>
                    
                </div>

                <div className='new-dash mt-10 p-3 text-[#3D4459]'>
                

                    <div class="bg-white rounded-md shadow w-full py-8 flex items-center flex-col sm:flex-row">
                        <div className='mx-10'>
                        <svg width={80} height={83} fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M57.333 25.076V9.888c0-3.61 0-5.415-.759-6.524a4.333 4.333 0 0 0-2.847-1.825c-1.324-.225-2.96.531-6.232 2.044l-38.44 17.77c-2.918 1.348-4.377 2.023-5.446 3.07a8.682 8.682 0 0 0-2.108 3.3C1 29.133 1 30.743 1 33.963v21.495m58.5-2.17h.043M1 38.965v28.646c0 4.862 0 7.292.945 9.15a8.674 8.674 0 0 0 3.787 3.793c1.854.946 4.28.946 9.135.946h50.266c4.854 0 7.281 0 9.135-.946a8.674 8.674 0 0 0 3.787-3.794C79 74.903 79 72.473 79 67.611V38.965c0-4.861 0-7.292-.945-9.15a8.673 8.673 0 0 0-3.787-3.793c-1.854-.946-4.28-.946-9.135-.946H14.867c-4.854 0-7.281 0-9.135.946a8.674 8.674 0 0 0-3.787 3.794C1 31.673 1 34.104 1 38.966Zm60.667 14.323c0 1.199-.97 2.17-2.167 2.17a2.168 2.168 0 0 1-2.167-2.17c0-1.198.97-2.17 2.167-2.17 1.197 0 2.167.972 2.167 2.17Z" stroke="#3D4459" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                        </svg>

                        </div>
                        <div className='text-[#3D4459] space-y-2'>
                            <h2 className='text-lg font-semibold'>Hi User Name!</h2>
                            <p className='text-sm'>Welcome to your Wallet</p>
                            <p className='text-sm'>Here you can see your payments, change your pay mathod and get your invoices.</p>
                        </div>
                    </div>

                    <div class="sm:grid grid-cols-2 gap-4 mt-4">

                        <div>

                            <div class="bg-white rounded-md shadow w-full flex p-8 sm:items-end justify-between flex-col sm:flex-row gap-4 sm:gap-0">
                                <div className='space-y-6'>
                                        <h4 className='font-semibold text-base'>Available Balance</h4>
                                        <p className='text-primary font-semibold text-2xl'>$ 12.03</p>
                                </div>
                                <div>
                                    <button type='button' className='inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bg-primary/80'>
                                    Add Balance
                                    </button>
                                </div>
                            </div>

                            <h4 class="mt-3"><span className='font-semibold text-base'>This Month</span></h4>

                            <div class="grid grid-cols-2 gap-4 mt-4">

                                <div class="bg-white rounded-md shadow w-full space-y-6 p-4 md:p-8 flex flex-col justify-center md:justify-start">
                                    <span className='font-semibold text-base'>Total Spent</span>
                                    <div className='flex justify-between flex-col md:flex-row gap-3 md:gap-0'>
                                        <div className='flex gap-1'>
                                            <svg width={21} height={21} fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M6 8.5h.01m4.49 0h.01m4.49 0h.01M5.5 16v2.335c0 .533 0 .8.11.937a.5.5 0 0 0 .39.188c.176 0 .384-.167.8-.5l2.385-1.908c.488-.39.731-.585 1.002-.724.241-.122.497-.212.762-.267.299-.061.61-.061 1.235-.061H14.7c1.68 0 2.52 0 3.162-.327a3 3 0 0 0 1.311-1.311c.327-.642.327-1.482.327-3.162V5.8c0-1.68 0-2.52-.327-3.162a3 3 0 0 0-1.311-1.311C17.22 1 16.38 1 14.7 1H6.3c-1.68 0-2.52 0-3.162.327a3 3 0 0 0-1.311 1.311C1.5 3.28 1.5 4.12 1.5 5.8V12c0 .93 0 1.395.102 1.777a3 3 0 0 0 2.122 2.12C4.105 16 4.57 16 5.5 16Zm1-7.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Zm4.5 0a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Zm4.5 0a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Z" stroke="#3D4459" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            121
                                        </div>
                                        <div className='text-base font-semibold text-primary'>$ 12.03</div>

                                    </div>
                                </div>

                                <div class="bg-white rounded-md shadow w-full space-y-6 p-4 md:p-8 flex flex-col justify-center md:justify-start">
                                    <span className='font-semibold text-base'>Business Initiated Chat</span>
                                    <div className='flex justify-between flex-col md:flex-row gap-3 md:gap-0'>
                                        <div className='flex gap-1'>
                                            <svg width={21} height={21} fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M6 8.5h.01m4.49 0h.01m4.49 0h.01M5.5 16v2.335c0 .533 0 .8.11.937a.5.5 0 0 0 .39.188c.176 0 .384-.167.8-.5l2.385-1.908c.488-.39.731-.585 1.002-.724.241-.122.497-.212.762-.267.299-.061.61-.061 1.235-.061H14.7c1.68 0 2.52 0 3.162-.327a3 3 0 0 0 1.311-1.311c.327-.642.327-1.482.327-3.162V5.8c0-1.68 0-2.52-.327-3.162a3 3 0 0 0-1.311-1.311C17.22 1 16.38 1 14.7 1H6.3c-1.68 0-2.52 0-3.162.327a3 3 0 0 0-1.311 1.311C1.5 3.28 1.5 4.12 1.5 5.8V12c0 .93 0 1.395.102 1.777a3 3 0 0 0 2.122 2.12C4.105 16 4.57 16 5.5 16Zm1-7.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Zm4.5 0a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Zm4.5 0a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Z" stroke="#3D4459" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            121
                                        </div>
                                        <div className='text-base font-semibold text-primary'>$ 12.03</div>

                                    </div>
                                </div>

                                <div class="bg-white rounded-md shadow w-full space-y-6 p-4 md:p-8 flex flex-col justify-center md:justify-start">
                                    <span className='font-semibold text-base'>User Initiated Chat</span>
                                    <div className='flex justify-between flex-col md:flex-row gap-3 md:gap-0'>
                                        <div className='flex gap-1'>
                                            <svg width={21} height={21} fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M6 8.5h.01m4.49 0h.01m4.49 0h.01M5.5 16v2.335c0 .533 0 .8.11.937a.5.5 0 0 0 .39.188c.176 0 .384-.167.8-.5l2.385-1.908c.488-.39.731-.585 1.002-.724.241-.122.497-.212.762-.267.299-.061.61-.061 1.235-.061H14.7c1.68 0 2.52 0 3.162-.327a3 3 0 0 0 1.311-1.311c.327-.642.327-1.482.327-3.162V5.8c0-1.68 0-2.52-.327-3.162a3 3 0 0 0-1.311-1.311C17.22 1 16.38 1 14.7 1H6.3c-1.68 0-2.52 0-3.162.327a3 3 0 0 0-1.311 1.311C1.5 3.28 1.5 4.12 1.5 5.8V12c0 .93 0 1.395.102 1.777a3 3 0 0 0 2.122 2.12C4.105 16 4.57 16 5.5 16Zm1-7.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Zm4.5 0a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Zm4.5 0a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Z" stroke="#3D4459" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            121
                                        </div>
                                        <div className='text-base font-semibold text-primary'>$ 12.03</div>

                                    </div>
                                </div>

                                <div class="bg-white rounded-md shadow w-full space-y-6 p-4 md:p-8 flex flex-col justify-center md:justify-start">
                                    <span className='font-semibold text-base'>Free Entry Point chats</span>
                                    <div className='flex justify-between flex-col md:flex-row gap-3 md:gap-0'>
                                        <div className='flex gap-1'>
                                            <svg width={21} height={21} fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M6 8.5h.01m4.49 0h.01m4.49 0h.01M5.5 16v2.335c0 .533 0 .8.11.937a.5.5 0 0 0 .39.188c.176 0 .384-.167.8-.5l2.385-1.908c.488-.39.731-.585 1.002-.724.241-.122.497-.212.762-.267.299-.061.61-.061 1.235-.061H14.7c1.68 0 2.52 0 3.162-.327a3 3 0 0 0 1.311-1.311c.327-.642.327-1.482.327-3.162V5.8c0-1.68 0-2.52-.327-3.162a3 3 0 0 0-1.311-1.311C17.22 1 16.38 1 14.7 1H6.3c-1.68 0-2.52 0-3.162.327a3 3 0 0 0-1.311 1.311C1.5 3.28 1.5 4.12 1.5 5.8V12c0 .93 0 1.395.102 1.777a3 3 0 0 0 2.122 2.12C4.105 16 4.57 16 5.5 16Zm1-7.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Zm4.5 0a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Zm4.5 0a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Z" stroke="#3D4459" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            121
                                        </div>
                                        <div className='text-base font-semibold text-primary'>$ 12.03</div>

                                    </div>
                                </div>

                                <div class="bg-white rounded-md shadow w-full space-y-6 p-4 md:p-8 flex flex-col justify-center md:justify-start">
                                    <span className='font-semibold text-base'>Messages</span>
                                    <div className='flex justify-between flex-col md:flex-row gap-3 md:gap-0'>
                                        <div className='flex gap-1'>
                                            <svg width={21} height={21} fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M6 8.5h.01m4.49 0h.01m4.49 0h.01M5.5 16v2.335c0 .533 0 .8.11.937a.5.5 0 0 0 .39.188c.176 0 .384-.167.8-.5l2.385-1.908c.488-.39.731-.585 1.002-.724.241-.122.497-.212.762-.267.299-.061.61-.061 1.235-.061H14.7c1.68 0 2.52 0 3.162-.327a3 3 0 0 0 1.311-1.311c.327-.642.327-1.482.327-3.162V5.8c0-1.68 0-2.52-.327-3.162a3 3 0 0 0-1.311-1.311C17.22 1 16.38 1 14.7 1H6.3c-1.68 0-2.52 0-3.162.327a3 3 0 0 0-1.311 1.311C1.5 3.28 1.5 4.12 1.5 5.8V12c0 .93 0 1.395.102 1.777a3 3 0 0 0 2.122 2.12C4.105 16 4.57 16 5.5 16Zm1-7.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Zm4.5 0a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Zm4.5 0a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Z" stroke="#3D4459" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            121
                                        </div>
                                        <div className='text-base font-semibold text-primary'>$ 12.03</div>

                                    </div>
                                </div>

                                <div class="bg-white rounded-md shadow w-full space-y-6 p-4 md:p-8 flex flex-col justify-center md:justify-start">
                                    <span className='font-semibold text-base'>Media</span>
                                    <div className='flex justify-between flex-col md:flex-row gap-3 md:gap-0'>
                                        <div className='flex gap-1'>
                                            <svg width={21} height={21} viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M19.5 9.44839L10.4733 18.4626C8.42055 20.5125 5.09235 20.5125 3.03958 18.4626C0.986807 16.4126 0.986808 13.0891 3.03958 11.0391L12.0663 2.02496C13.4348 0.658346 15.6536 0.658346 17.0221 2.02496C18.3906 3.39158 18.3906 5.6073 17.0221 6.97392L8.34939 15.6346C7.66513 16.3179 6.55573 16.3179 5.87148 15.6346C5.18722 14.9513 5.18722 13.8434 5.87148 13.1601L13.4822 5.55993" stroke="#3D4459" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            121
                                        </div>
                                        <div className='text-base font-semibold text-primary'>$ 12.03</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="space-y-4 mt-4 sm:mt-0">

                            <div class="bg-white rounded-md shadow w-full p-4 md:p-8">
                             <span className='font-semibold text-base'>Your Payment Method</span>  

                              <div className='payment-list mt-4 space-y-6'>
                                    <div className='payment-item sm:flex gap-4 space-y-2 sm:space-y-0'>
                                        <div className='w-40 h-20 bg-red-200 rounded-lg '>

                                        </div>
                                        <div >
                                            <h5 className='text-sm font-semibold'>Visa</h5>
                                            <div className='mt-3'>
                                                <p>Debit </p>
                                                <p>************0991</p>
                                            </div>
                                        </div>
                                    </div> 

                                    <div className='payment-item sm:flex space-y-2 sm:space-y-0  gap-4 '>
                                        <div className='w-40 h-20 bg-red-200 rounded-lg '>

                                        </div>
                                        <div >
                                            <h5 className='text-sm font-semibold'>Visa</h5>
                                            <div className='mt-3'>
                                                <p>Debit </p>
                                                <p>************0991</p>
                                            </div>
                                        </div>
                                    </div> 
                               </div> 

                               <div className='w-full flex justify-end mt-4'>
                                <button type='button' className='inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bg-primary/80'>
                                Add a Payment Method
                                    </button>
                                </div> 

                               
                            </div>



                            <div class="bg-white rounded-md shadow w-full flex justify-between items-center p-4 md:p-8">
                                <h5 className='text-base font-semibold'>See Transations History</h5>
                                <button type='button' className='inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-700 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bg-gray-800'>
                                See Details
                                    </button>
                            </div>

                            <div class="bg-white rounded-md shadow w-full flex justify-between items-center p-4 md:p-8">
                                <h5 className='text-base font-semibold'>Download your VAT Invoices</h5>
                                <button type='button' className='inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-700 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bg-gray-800'>
                                Go to Invoices
                                    </button>
                            </div>

                        </div>

                    </div>

                    
                </div>
            </div>
        </Authenticated>
    );
}
