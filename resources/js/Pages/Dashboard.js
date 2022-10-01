import React,{useState,useEffect} from 'react';
import Authenticated from '@/Layouts/Authenticated';
import { Head, Link } from '@inertiajs/inertia-react';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

export default function Dashboard(props) {
    
    const[ deleteAccoutId , setDeleteAccountId] = useState('');
    const[ accounts , setAccountList] = useState(props.accounts);
   

    //console.log('Records dash'+props)
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
//console.log(props.auth.user);

    return (
        <Authenticated
            auth={props.auth}
            errors={props.errors}
            current_page='Dashboard' 
            header={<div className="flex justify-between"> 
                <div> 
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">{props.translator['Dashboard']}</h2>
                </div> 
                <div className='flex'>
                    {props.auth.user.fb_token != '' ? 
                        <a
                            href={route('connect_face_book')}
                            className='ml-3 inline-flex align-middle justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                        >
                            <img
                                src="./img/fb-Icon.png"
                                alt="FB"
                                className="pr-2 h-7 w-8"
                            />
                            <span className='mt-1'> Connect with Facebook </span>
                        </a>
                    :
                        <>
                            <a href='#' className="rounded-md bg-blue-50 p-4 flex">
                                <div className="ml-3 flex-1 md:flex md:justify-between">
                                    <p className="text-sm text-blue-700">Connected with Facebook</p>
                                </div>
                            </a>
                        </>
                    }

                <Link
                    href={route('account_registration')}
                    className='ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                >
                    {props.translator['Create a new social profile']}
                </Link>
                </div> 
            </div>}
        >
            
            <Head title={props.translator['Dashboard']} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="pb-5">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">{props.translator['Business profiles']}</h3>
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
                                                      onClick={(e) => deleteAccount(account.id)}
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
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">{props.translator['No profile']}</h3>
                                    <p className="mt-1 text-sm text-gray-500">{props.translator['Get started by creating a new social profile.']}</p>
                                    <div className="mt-6">
                                        <Link href={route('account_registration')} className="underline text-sm text-indigo-600 hover:text-indigo-900">
                                            {props.translator['Click here to create a new social profile']}
                                        </Link>
                                    </div>
                              </div>
                            : ''}

                            
                    </div>

                    <div className='clear'></div>
                    
                </div>
            </div>

        </Authenticated>
    );
}
