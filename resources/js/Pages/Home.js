import React,{useState,useEffect} from 'react';
import Authenticated from '@/Layouts/Authenticated';
import { Head, Link } from '@inertiajs/inertia-react';

export default function Home(props) {

    return (
        <Authenticated
            auth={props.auth}
            errors={props.errors}
            current_page='Home' 
            message={props.message}
        >
            
            <Head title={'Home'} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div class="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2">              
                        <div class="overflow-hidden rounded-lg bg-white shadow">
                            <div class="p-3">
                                <div class="flex items-center">
                                <div class="flex-shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                </div>
                                <div class="ml-5 w-0 flex-1">
                                    <dl>
                                    <dt class="truncate text-lg font-medium text-gray-500">Hi <b> {props.auth.user.name}</b></dt>
                                    <dd>
                                        <div class="text-sm font-medium text-gray-900 mt-3">It's a beautiful day to sell through your chats.</div>
                                        <div class="text-sm font-medium text-gray-900 mt-3">Use OneMessage to learn more about your customers, capture leads, create automations, send messages and geek out on analytics.</div>
                                        <div class="text-sm font-medium text-gray-900 mt-3">All the best!</div>
                                    </dd>
                                    </dl>
                                </div>
                                </div>
                            </div>
                        </div>              
                    </div>
                    <div className='clear'></div>
                </div>

                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 mt-5">
                    <div class="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2">              
                        <div class="overflow-hidden rounded-lg bg-white shadow">
                            <div class="p-3">
                                <div class="flex items-center">
                                <div class="flex-shrink-0">
                                    
                                </div>
                                <div class="p-2 w-0 flex-1">
                                    <dl>
                                    <dt class="truncate text-lg font-medium text-gray-500 text-center"> 
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 inline-flex items-center" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                    </dt>
                                    <dd>
                                        <div class="text-sm font-medium text-gray-900 mt-3 text-center">  
                                            <Link
                                                href={route('wallet_subscription' , {tab: 2})}
                                            >
                                                Please click here to create your Social Profile to start Chatting
                                            </Link> 
                                        </div>
                                    </dd>
                                    </dl>
                                </div>
                                </div>
                            </div>
                        </div>              
                    </div>
                    <div className='clear'></div>
                </div>
            </div>
            

        </Authenticated>
    );
}
