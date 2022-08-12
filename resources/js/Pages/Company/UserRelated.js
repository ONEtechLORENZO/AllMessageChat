import { Link } from '@inertiajs/inertia-react';
import React from 'react';

function UserRelated(props)
{
    return (
        <div>
            
                <div class="flex items-center justify-center h-screen">
                    <div class="p-1 rounded shadow-lg w-1/2 border-1 border-offset-2  bg-gradient-to-r from-blue-500 via-green-500 to-purple-500">
                        <div class="flex flex-col items-center p-4 space-y-2 bg-white">
                            {props.result == 'success' ?
                                <svg xmlns="http://www.w3.org/2000/svg" class="text-green-600 w-28 h-28" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                :
                                <svg xmlns="http://www.w3.org/2000/svg" class="text-red-600 w-28 h-28" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            }
                            
                            {props.result == 'success' ?
                                <>
                                    <h1 class="text-4xl font-bold font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
                                        Thank You !
                                    </h1>
                                    <p>Thank you for being so interested! Check your account linked to the company.</p>
                                </>
                            :
                                <>
                                    <h1 class="text-4xl font-bold font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
                                        Invalid unique id
                                    </h1>
                                    <p>Your unique id is invalid. </p>
                                 </>
                            }
                        
                            <Link
                                href={route('login')}
                                class="inline-flex items-center px-4 py-2 text-white bg-indigo-600 border border-indigo-600 rounded rounded-full hover:bg-indigo-700 focus:outline-none focus:ring">
                                
                                <span class="text-sm font-medium">
                                Log in
                                </span>
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-3" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </div>
        </div>
    )
}

export default UserRelated;