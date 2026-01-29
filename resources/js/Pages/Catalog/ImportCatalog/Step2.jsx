import React, { useEffect, useState } from "react";
import notie from 'notie';
import nProgress from 'nprogress';
import Axios from "axios";
import Dropdown from "@/Components/Forms/Dropdown";
import { ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/24/solid';
import { AiOutlineArrowRight } from "react-icons/ai";

export default function Step2(props) {

    const [fbBusinessOption, setFbBusinessOption] = useState({});
    const [fbBusinessId, setFbBusinessId] = useState();
    
    useEffect( () => {
        if(props.fbToken) {
            fetchBusinessAccount();
        }
    }, [props]);

    function fetchBusinessAccount() {
        let url = route('fetchBusinessAccount', {token : props.fbToken});
        
        Axios.post(url).then( (response) => {
            if(response.data.status !== false) {
                setFbBusinessOption(response.data.businessAccount);
            } else {
                notie.alert({type: 'error', text: 'Your Business account has been not founded.', time: 5}); 
            }
        });
    }

    function scheduleCatalog() {

        if(fbBusinessId) {
            nProgress.start(0.5);
            nProgress.inc(0.2);
            Axios({
                method: 'post',
                url: route('schedule_business_catalog', {businessId : fbBusinessId, fbToken : props.fbToken} ),
            })
            .then( (response) => {
                nProgress.done();
                if(response.data.status){
                   props.setTab('catalog'); 
                } else {
                  notie.alert({type: 'error', text: response.data.message, time: 5}); 
                }
            }); 
        } else {
            notie.alert({type: 'warning', text: 'Please select your Business Account first.', time: 5});
        }
    }

    return (
        <>
          <div className="flex-1">
                <div className="flex !gap-2 items-center">
                    <span>Meta Profile</span>
                    <AiOutlineArrowRight/>
                    <span className="text-[#7c3aed]">Meta Business</span>
                </div>
                
                <div className="space-y-3">
                    <div className="text-center flex justify-center flex-col items-center !gap-4">
                        <label
                            htmlFor="first-name"
                            className="block col-span-4 text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
                        >
                            Select Business
                        </label>     
                        <div className="w-1/2"> 
                            <Dropdown
                                id={'business_id'}
                                name={'business_id'}
                                options={fbBusinessOption ? fbBusinessOption : {}}
                                handleChange={(e)=> setFbBusinessId(e.target.value)}
                                emptyOption={'Select'}
                                value={fbBusinessId}
                            />
                        </div>               
                    </div>
                </div>
            </div>

            <div className="h-16 flex items-center justify-between">
                <button 
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#7c3aed] text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => props.setTab('meta_profile')}
                >
                 Back <ChevronLeftIcon className="w-4 h-4 text-white mt-1"/>
                </button>                
                <button 
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#7c3aed] text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => scheduleCatalog()}
                >
                 Next <ChevronRightIcon className="w-4 h-4 text-white mt-1"/>
                </button>
            </div>
        </>
    );
}









