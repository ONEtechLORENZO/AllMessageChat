import React from "react";
import Dropdown from '@/Components/Forms/Dropdown';
import { Link } from "@inertiajs/inertia-react";

const serivceOption = {
    'whatsapp' : 'Whatsapp',
    'instagram' : 'Instagram'
}

export default function Step1(props){

    //select the service 
    function serviceHandler(event){
        const value = event.target.value;
        if(value){
            props.setService(value);
        }
    }

    return(
        <div className='p-4'>
        <form id='form p-2'>
            <div className='p-2'>
                <div className='font-bold text-lg'>
                    Link Account
                </div>
                <div className='pt-2 text-gray-500 text-sm'>
                    Connect your account to your OneMessage Workspace
                </div>
            </div>
            <hr></hr>
            <div className='p-2'>
                <div className='grid grid-cols-2'>
                    <div className='text-lg font-medium flex items-center'>Channel</div>
                    <div className='flex justify-start'>
                        <Dropdown 
                          id='service'
                          name='service'
                          options={serivceOption}
                          handleChange={props.formHandler}
                          emptyOption='select'
                          value={props.data['service']}
                          required={true}
                        />
                    </div>
                </div>
                <div className='text-gray-500 pt-4 text-sm'>
                    WABA means Whatsapp Business API.<br></br>
                    Best for Big Business who want to connect via offical whatsapp (improve the short description).
                </div>
            </div>  
        </form>

        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={() => props.serviceHandler()}
            >
                Next
            </button>
            <Link
             href={route('dashboard')}
             className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
             Cancel
            </Link>
        </div>
       </div> 
    );
}