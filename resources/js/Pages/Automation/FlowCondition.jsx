import React, { useState, useCallback, useRef, Fragment, useEffect } from "react";
import { Dialog, Transition } from '@headlessui/react'
import Axios from "axios";
import FilterGroups from '../Campaign/FilterGroups';

function FlowCondition(props){

    const cancelButtonRef = useRef(null);
    const [actionData , setActionData] = useState({});
    const [options, setOptions] = useState({});
    const [filter, setFilter] = useState(props.filter);
    useEffect(()=>{
        
    }, []);

    
    /**
     * Get account list
     */
    function getActionData(action_type){
        var url = route('get_action_data') + '?action_type='+action_type;
        Axios.get(url).then((response) => {
            
            if(response.data.status !== false) {
                setOptions(response.data.result);
            }
        });
    }

    return(
        <Transition.Root show={true} as={Fragment}>
                  <Dialog as="div" className="relative z-10" initialFocus={cancelButtonRef} onClose={() => {}} >
                      <Transition.Child
                          as={Fragment}
                          enter="ease-out duration-300"
                          enterFrom="opacity-0"
                          enterTo="opacity-100"
                          leave="ease-in duration-200"
                          leaveFrom="opacity-100"
                          leaveTo="opacity-0"
                      >
                          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                      </Transition.Child>
      
                      <div className="fixed z-10 inset-0 overflow-y-auto">
                          <div className="flex items-end sm:items-center justify-center min-h-full p-4 text-center sm:p-0">
                              <Transition.Child
                                  as={Fragment}
                                  enter="ease-out duration-300"
                                  enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                                  enterTo="opacity-100 translate-y-0 sm:scale-100"
                                  leave="ease-in duration-200"
                                  leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                                  leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                              >
                                  <Dialog.Panel className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-xl sm:w-full">
                                      <div className="bg-gray-50 px-4 pt-5 pb-4 sm:p-4 sm:pb-4">
                                          <div className="sm:flex sm:items-start ">
                                              <div className="mt-3 text-center sm:mt-0 sm:text-left w-1/2 ">
                                                        <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                                                            Conditions
                                                        </Dialog.Title>
                                                    </div>
                                                    <div className="w-1/2 text-right">
                                                        <button
                                                            className="border-1 border-indigo-300"
                                                            onClick={() => props.setShowCondition(false)}
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                                 <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                          </div>
                                      </div>
      
                                      <FilterGroups
                                            {...props}
                                        />
                                    
                                  </Dialog.Panel>
                              </Transition.Child>
                          </div>
                      </div>
                  </Dialog>
                </Transition.Root>
    )
}
export default FlowCondition;









