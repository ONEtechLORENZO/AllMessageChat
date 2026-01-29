import React, {useState, useEffect} from "react";
import Dropdown from "@/Components/Forms/Dropdown";
import Axios from "axios";
import notie from 'notie';
import { ChevronRightIcon } from '@heroicons/react/24/solid';
import { AiOutlineArrowRight } from "react-icons/ai";

export default function Step3(props) {

    const [catalogOptions, setCatalogOptions] = useState({});
    
    useEffect( () => {
        fetchCatalogSchedularList();
    }, []);

    function fetchCatalogSchedularList() {
        let url = route('catalog_list', {token : props.fbToken});
        Axios.get(url).then( (response) => {
            if(response.data.status !== false) {
                setCatalogOptions(response.data.catalogOptions);
            }
        });
    }

    function nextSelection() {
        if(props.catalogId) {
            props.setTab('map_fields');
        } else {
            notie.alert({type: 'warning', text: 'Please select catalog', time: 5}); 
        }
    }
    
    return (
        <>
          <div className="flex-1">
               <div className="flex !gap-2 items-center">
                    <span>Meta Profile </span>
                    <AiOutlineArrowRight/>
                    <span>Meta Business </span>
                    <AiOutlineArrowRight/>
                    <span className="text-[#7c3aed]">Meta Catalog </span>
                </div>
                <div className="space-y-3">
                    <div className="text-center flex justify-center flex-col items-center !gap-4">
                        <label
                            htmlFor="first-name"
                            className="block col-span-4 text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
                        >
                            Select Catalog
                        </label>                    
                        <div className="w-1/2"> 
                            <Dropdown
                                id={'catalog_id'}
                                name={'catalog_id'}
                                options={catalogOptions ? catalogOptions : {}}
                                handleChange={(e) => props.setCatalogId(e.target.value)}
                                emptyOption={'Select'}
                                value={props.catalogId ? props.catalogId :''}
                            />
                        </div> 
                    </div>
                </div>
            </div>

            <div className="h-16 flex items-center justify-between">
              <button type="button" className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm" onClick={() => props.setShowImport(false)}>Cancel</button>
              <button 
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#7c3aed] text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => nextSelection()}
                >
                 Next <ChevronRightIcon className="w-4 h-4 text-white mt-1"/>
               </button>
            </div>
        </>
    );
}









