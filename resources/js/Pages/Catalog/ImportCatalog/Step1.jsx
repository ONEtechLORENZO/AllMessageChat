import React, { useEffect, useState } from "react";
import Axios from "axios";
import Dropdown from "@/Components/Forms/Dropdown";
import notie from 'notie';
import { ChevronRightIcon } from '@heroicons/react/24/solid';

export default function Step1(props) {

    const [options, setOptions] = useState();

    useEffect( () => {
        fetchfbAccounts();
    },[]);

    function fetchfbAccounts() {
        let url = route('facebook_app_list');
        Axios.get(url).then( (resposne) => {
           if(resposne.data.status !== false) {
             setOptions(resposne.data.fbApplist);
           }
        })
    }

    function setAppName() {
        if(props.fbToken) {
            props.setTab('business');
        } else {
            notie.alert({type: 'warning', text: 'Select your FaceBook account', time: 5}); 
        }
    }

    return (
        <>
            <div className="flex-1">
                {options && Object.keys(options).length !== 0 ? 
                    <div className="space-y-2">
                        <div className="text-center flex justify-center flex-col items-center !gap-4">
                            <label htmlFor="first-name" className="block col-span-4 text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"> Select Meta profile </label>                    
                            <div className="w-1/2"> 
                                <Dropdown
                                    id={'account_name'}
                                    name={'account_name'}
                                    options={options ? options :{}}
                                    handleChange={(e) => props.setfbToken(e.target.value)}
                                    emptyOption={'Select'}
                                    value={props.fbToken}
                                />
                            </div> 
                        </div>
                    </div>
                : '' }

                {options && Object.keys(options).length !== 0 ? 
                   <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-gray-400"></div>
                        <span className="flex-shrink mx-1text-gray-400">( or )</span>
                        <div className="flex-grow border-t border-gray-400"></div>
                    </div>
                : ''}

                <div className="space-y-2">                    
                    <div className='text-gray-500 pt-4 text-sm mt-1 text-center'>
                        <a
                            href={route('connect_face_book' , 'fb_token')}
                            className='ml-3 inline-flex align-middle justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                        >
                            <div className="ml-3 text-sm flex md:flex md:justify-between ">
                                <img className="img" src="https://static.xx.fbcdn.net/rsrc.php/v3/yq/r/_9VQFvOk7ZC.png" alt="" width="34" height="24" />
                                <span className=" pl-3 p-2">  {props.translator['Continue with']} Facebook  </span>
                            </div>
                        </a>
                    </div>
                </div>
            </div>

            <div className="h-16 flex items-center justify-between">
              <button type="button" className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm" onClick={() => props.setShowImport(false)}>Cancel</button>
              <button 
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#7c3aed] text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setAppName()}
                >
                 Next <ChevronRightIcon className="w-4 h-4 text-white mt-1"/>
                </button>
            </div>
        </>
    );
}












