import React, { useState, useCallback, useRef, Fragment, useEffect } from "react";
import { Dialog, Transition } from '@headlessui/react'
import Dropdown from './Dropdown';
import Axios from "axios";

function Action(props){

    const cancelButtonRef = useRef(null);
    const [accountList , setAccountList] = useState();
    useEffect(()=>{
        if(props.actionData.type == 'send_message'){
            getAccountList();    
        }
    });
    
    /**
     * Get account list
     */
    function getAccountList(){
        
        Axios.get(route('get_account_list')).then((response) => {
            nProgress.done(true);
            if(response.data.status !== false) {
                setData(response.data.record);
            }
            else {
                notie.alert({type: 'error', text: response.data.message, time: 5});
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
                                          <div className="sm:flex sm:items-start">
                                              <div className="mt-3 text-center sm:mt-0 sm:text-left">
                                                  <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                                                      {props.actionData.heading}
                                                  </Dialog.Title>
                                              </div>
                                          </div>
                                      </div>
      
                                      <form id='form'>
                                          <div className='p-4 space-y-4'>
                                              <div className='form-group' >
                                                
                                                    {props.actionData.type == 'send_message' &&
                                                        <div>
                                                            <div class="flex flex-wrap -mx-3 mb-6">
                                                                <div class="w-full px-3">
                                                                <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="grid-password">
                                                                    Select account
                                                                </label>
                                                                <Dropdown
                                                                    id={'select_account'}
                                                                    name={'select_account'}
                                                                    options={{}}
                                                                    handleChange={handleChange}
                                                                    emptyOption={'Select'}
                                                                   // value={field_value}
                                                                    required={field_info.is_mandatory === 1 ? true : false}
                                                                   // readOnly={(readOnly) ? '' : 'disabled'}
                                                                />
                                                                <p class="text-gray-600 text-xs italic">Send a message via selected account</p>
                                                                </div>
                                                            </div>

                                                        </div>
                                                    }
                                                  
                                              </div>
                                          </div>
                                      </form>
 
                                      <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                        <button
                                            type="button"
                                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                                            //onClick={props.setShowAction(selected)}
                                        >
                                            Save
                                        </button>
                                        <button
                                            type="button"
                                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                            onClick={() => props.setShowAction(false)}
                                            ref={cancelButtonRef}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                     
                                    
                                  </Dialog.Panel>
                              </Transition.Child>
                          </div>
                      </div>
                  </Dialog>
                </Transition.Root>
    )
}
export default Action;