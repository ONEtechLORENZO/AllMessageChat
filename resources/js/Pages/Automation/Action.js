import React, { useState, useCallback, useRef, Fragment, useEffect } from "react";
import { Dialog, Transition } from '@headlessui/react'
import Dropdown from "@/Components/Forms/Dropdown";
import Axios from "axios";

function Action(props){

    const cancelButtonRef = useRef(null);
    const [actionData , setActionData] = useState({});
    const [options, setOptions] = useState({});

    useEffect(()=>{
        
        if(props.actionData.node_data){
            setActionData(props.actionData.node_data);
        } else {
            var newActionData = Object.assign({}, actionData);
            newActionData['type'] = props.actionData.type;
            setActionData(newActionData);
        
        }
        getActionData(props.actionData.type);        
    }, []);

    function handleChange(event){
        console.log(event);
        var name = event.target.name;
        var value = event.target.value;

        var newActionData = Object.assign({}, actionData);
        newActionData[name] = value;
        setActionData(newActionData);
    }
    
    /**
     * Get account list
     */
    function getActionData(action_type){
        var url = route('get_account_list') + '?action_type='+action_type;
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
                                                        {props.actionData.heading}
                                                        </Dialog.Title>
                                                    </div>
                                                    <div className="w-1/2 text-right">
                                                        <button
                                                            className="border-1 border-indigo-300"
                                                            onClick={() => props.setShowAction(false)}
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                                                 <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                          </div>
                                      </div>
      
                                      <form id='form'>
                                          <div className='p-4 space-y-4'>
                                              <div className='form-group' >
                                                
                                                    {actionData.type == 'send_message' &&
                                                        <div>
                                                            <div class="flex flex-wrap -mx-3 mb-6">
                                                                <div class="w-full px-3">
                                                                <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="grid-password">
                                                                    Select account
                                                                </label>
                                                                <Dropdown
                                                                    id={'select_account'}
                                                                    name={'select_account'}
                                                                    options={options.account_list}
                                                                    handleChange={handleChange}
                                                                    emptyOption={'Select'}
                                                                    value={actionData.select_account}
                                                                    required={ true }
                                                                />
                                                                <p class="text-gray-600 text-xs italic">Send a message using the selected account</p>
                                                                </div>
                                                            </div>
                                                            <div class="flex flex-wrap -mx-3 mb-6">
                                                                <div class="w-full px-3">
                                                                <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="grid-password">
                                                                    Select Template
                                                                </label>
                                                                <Dropdown
                                                                    id={'select_template'}
                                                                    name={'select_template'}
                                                                    options={options.template_list}
                                                                    handleChange={handleChange}
                                                                    emptyOption={'Select'}
                                                                    value={actionData.select_template}
                                                                    required={ true }
                                                                />
                                                                <p class="text-gray-600 text-xs italic">Send a message using the template</p>
                                                                </div>
                                                            </div>

                                                        </div>
                                                    }
                                                    {actionData.type == 'tag_contact' &&
                                                        <div>
                                                            <div class="flex flex-wrap -mx-3 mb-6">
                                                                <div class="w-full px-3">
                                                                <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="grid-password">
                                                                    Select Tag
                                                                </label>
                                                                <Dropdown
                                                                    id={'select_tag'}
                                                                    name={'select_tag'}
                                                                    options={options.tag_list}
                                                                    handleChange={handleChange}
                                                                    emptyOption={'Select'}
                                                                    value={actionData.select_tag}
                                                                    required={ true }
                                                                />
                                                                <p class="text-gray-600 text-xs italic">Relate the tag to the contact</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    }
                                                    {actionData.type == 'list_contact' &&
                                                        <div>
                                                            <div class="flex flex-wrap -mx-3 mb-6">
                                                                <div class="w-full px-3">
                                                                <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="grid-password">
                                                                    Select List
                                                                </label>
                                                                <Dropdown
                                                                    id={'select_list'}
                                                                    name={'select_list'}
                                                                    options={options.list_list}
                                                                    handleChange={handleChange}
                                                                    emptyOption={'Select'}
                                                                    value={actionData.select_list}
                                                                    required={ true }
                                                                />
                                                                <p class="text-gray-600 text-xs italic">Relate the List to the contact</p>
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
                                            onClick={() => props.saveActionData(props.actionData.node_id, actionData)}
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