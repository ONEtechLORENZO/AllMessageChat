import React,{useState,useEffect} from 'react';
import Authenticated from '@/Layouts/Authenticated';
import { Head, Link } from '@inertiajs/inertia-react';
import Accounts from './Wallet/Accounts';

export default function Dashboard(props) {

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
                    {props.auth.user.fb_token ? 
                        <a href='#' className="rounded-md bg-blue-50 p-4 flex">
                            <div className="ml-3 flex-1 md:flex md:justify-between">
                                <p className="text-sm text-blue-700">Connected with Facebook</p>
                            </div>
                        </a>
                    :
                        <>
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
            message={props.message}
        >
            
            <Head title={props.translator['Dashboard']} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="pb-5">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">{props.translator['Business profiles']}</h3>
                    </div>
                        <Accounts 
                        accounts={props.accounts}
                        createAccount={true}
                        {...props}
                        />
                    <div className='clear'></div>
                    
                </div>
            </div>
            

        </Authenticated>
    );
}
