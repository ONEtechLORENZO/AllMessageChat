import React, { useState, useCallback, useRef, Fragment } from "react";
import { Dialog, Transition } from '@headlessui/react'
import { RadioGroup } from '@headlessui/react'

function Trigger(props){

    const [open, setOpen] = useState(true);
    const cancelButtonRef = useRef(null);
    
    const [selected, setSelected] = useState('')

    function classNames(...classes) {
        return classes.filter(Boolean).join(' ')
    }
  
    return(
        <Transition.Root show={open} as={Fragment}>
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
                                                <div className="flex justify-between w-full">
                                                    <div className="mt-3 text-center sm:mt-0 sm:text-left">
                                                        <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                                                        {props.heading}
                                                        </Dialog.Title>
                                                    </div>
                                                    <div>
                                                        <button
                                                            className="border-1 border-indigo-300"
                                                            onClick={() => props.setShowOptions(false)}
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                                                 <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                          </div>
                                      </div>
      
                                      <form id='form'>
                                          <div className='p-4 space-y-4'>
                                              <div className='form-group' >
                                                
                                                 
                                                  <div className="space-y-4">
                                                    <ul class="grid gap-6 w-full md:grid-cols-2">
                                                        {Object.entries(props.options).map(([key, plan]) => {
                                                          return(
                                                            <li className="border-1 border-gray-100">
                                                                <input type="radio" id={plan.name} name="trigger" value={plan.name} class="hidden peer" onClick={() => props.saveData(plan.name)} required />
                                                                <label for={plan.name} 
                                                                    class={"inline-flex justify-between items-center p-5 w-full text-gray-500 bg-white rounded-lg border border-gray-200 cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-blue-500 peer-checked:border-blue-600 peer-checked:text-blue-600 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700 " + (selected == plan.name  ? 'text-blue-500 border-blue-600' : '' )}          
                                                                    >                        
                                                                    <div class="block">
                                                                        <div class="w-full "> {plan.label} </div>
                                                                    </div>
                                                                </label>
                                                         
                                                            
                                                            </li>
                                                          )
                                                        })}
                                                    </ul>
                                                  </div>
                                              </div>
                                          </div>
                                      </form>
{/* 
                                      <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                        <button
                                            type="button"
                                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                                            onClick={props.saveData(selected)}
                                        >
                                            Save
                                        </button>
                                        <button
                                            type="button"
                                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                            onClick={() => props.setShowOptions(false)}
                                            ref={cancelButtonRef}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                     */}
                                    
                                  </Dialog.Panel>
                              </Transition.Child>
                          </div>
                      </div>
                  </Dialog>
                </Transition.Root>
    )
}
export default Trigger;