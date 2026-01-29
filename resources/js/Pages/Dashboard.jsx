import React,{useState,useEffect} from 'react';
import Authenticated from '@/Layouts/Authenticated';
import { Head, Link } from '@inertiajs/react';
import Accounts from './Wallet/Accounts';

export default function Dashboard(props) {

    return (
        <Authenticated
            auth={props.auth}
            errors={props.errors}
            current_page={'Social Profiles'} 
            message={props.message}
            navigationMenu={props.menuBar}
        >
            
            <Head title={props.translator['Your Social Channels']} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="pb-4">
                        <h3 className="text-2xl leading-6 font-semibold text-[#393939]">{props.translator['Your Social Channels']}</h3>
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









