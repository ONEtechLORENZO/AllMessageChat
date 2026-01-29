import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";

import { BsPlusLg } from "react-icons/bs";

import Step4 from "./Step4";

export default function AddContact() {
    let [isOpen, setIsOpen] = useState(true);

    function closeModal() {
        setIsOpen(false);
    }

    function openModal() {
        setIsOpen(true);
    }

    return (
        <>
            <div className="fixed inset-0 flex items-center justify-center">
                <button
                    type="button"
                    onClick={openModal}
                    className="rounded-md bg-black bg-opacity-20 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
                >
                    Open dialog
                </button>
            </div>

            <Transition appear show={isOpen} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={closeModal}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-25" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-4xl max-h-[640px] transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                                    <div className="flex min-h-[300px]">
                                        <div className="w-2/6 bg-[#3F3F3F] text-white flex flex-col gap-4 items-center p-6 overflow-y-auto max-h-[640px]">
                                            <div className="text-xl font-semibold">
                                            Import Catalog
                                            </div>
                                            
                                            <ul className="divide-y w-full pl-0">
                                                <li className="flex text-[#AA94FF] gap-2 items-center w-full !p-3">
                                                  <div className="w-3 h-3 bg-white rounded-full"></div>
                                                  Select meta profile
                                                </li>
                                                <li className="flex text-white gap-2 items-center w-full !p-3">
                                                  <div className="w-3 h-3 border border-[#9A9A9A] rounded-full"></div>
                                                  Map fields
                                                </li>
                                                <li className="flex text-white gap-2 items-center w-full !p-3">
                                                  <div className="w-3 h-3 border border-[#9A9A9A] rounded-full"></div>
                                                  Select catalog
                                                </li>
                                                <li className="flex text-white gap-2 items-center w-full !p-3">
                                                  <div className="w-3 h-3 border border-[#9A9A9A] rounded-full"></div>
                                                  Map fields
                                                </li>
                                                <li className="flex text-white gap-2 items-center w-full !p-3">
                                                  <div className="w-3 h-3 border border-[#9A9A9A] rounded-full"></div>
                                                  Set schedule 
                                                </li>                                                                                              
                                            </ul>
                                        </div>
                                        <div className="w-4/6 !p-6 flex flex-col">
                                            
                                           {/* STEP1 */}
                                            {/* <Step1/> */}

                                             {/* STEP1 END */}

                                             {/* STEP 2 */}

                                             {/* <Step2/> */}
                                             {/* STEP2 END */}

                                              {/* STEP 3 */}

                                             <Step4/>

                                             {/* STEP3 END */}

                                             {/* STEP 4 */}

                                             <div className="flex-1 hidden">
                                                <div className="space-y-2">
                                                    <div className="sm:grid sm:grid-cols-12 sm:gap-4">
                                                        <label htmlFor="first-name" className="block col-span-4 text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">Country</label>
                                                        <div className="mt-1 col-span-8 !sm:mt-0">
                                                            <input type="text"  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500  sm:text-sm" />
                                                        </div>
                                                    </div>
                                                    <div className="sm:grid sm:grid-cols-12 sm:gap-4">
                                                        <label htmlFor="first-name" className="block col-span-4 text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">State</label>
                                                        <div className="mt-1 col-span-8 !sm:mt-0">
                                                            <input type="text"  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500  sm:text-sm" />
                                                        </div>
                                                    </div>
                                                    <div className="sm:grid sm:grid-cols-12 sm:gap-4">
                                                        <label htmlFor="first-name" className="block col-span-4 text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">City</label>
                                                        <div className="mt-1 col-span-8 !sm:mt-0">
                                                            <input type="text"  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500  sm:text-sm" />
                                                        </div>
                                                    </div>
                                                    <div className="sm:grid sm:grid-cols-12 sm:gap-4">
                                                        <label htmlFor="first-name" className="block col-span-4 text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">Street</label>
                                                        <div className="mt-1 col-span-8 !sm:mt-0">
                                                            <input type="text"  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500  sm:text-sm" />
                                                        </div>
                                                    </div>
                                                    <div className="sm:grid sm:grid-cols-12 sm:gap-4">
                                                        <label htmlFor="first-name" className="block col-span-4 text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">Zip Code
                                                        </label>
                                                        <div className="mt-1 col-span-8 !sm:mt-0">
                                                            <input type="text"  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500  sm:text-sm" />
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-1 items-center text-[#545CD8] cursor-pointer">
                                                        <svg width={13} height={12} viewBox="0 0 13 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <rect x="5.25482" width={2} height={12} fill="#545CD8" />
                                                            <rect x="12.2548" y={5} width={2} height={12} transform="rotate(90 12.2548 5)" fill="#545CD8" />
                                                        </svg>
                                                        Add custom</div>
                                                </div>
                                             </div>

                                             {/* STEP 4 END */}

                                              {/* STEP 5 */}

                                              <div className="flex-1 hidden">
                                                <div className="space-y-2"></div>
                                              </div>
                                              {/* STEP 5 END */}

                                              {/* STEP 6 */}

                                             <div className="flex-1 hidden">
                                                <div className="space-y-2">
                                                    <div className="sm:grid sm:grid-cols-12 sm:gap-4">
                                                        <label htmlFor="first-name" className="block col-span-4 text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">Origin</label>
                                                        <div className="mt-1 col-span-8 !sm:mt-0">
                                                            <input type="text"  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500  sm:text-sm" />
                                                        </div>
                                                    </div>
                                                    <div className="sm:grid sm:grid-cols-12 sm:gap-4">
                                                        <label htmlFor="first-name" className="block col-span-4 text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">Source
                                                        </label>
                                                        <div className="mt-1 col-span-8 !sm:mt-0">
                                                            <input type="text"  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500  sm:text-sm" />
                                                        </div>
                                                    </div>
                                                    <div className="sm:grid sm:grid-cols-12 sm:gap-4">
                                                        <label htmlFor="first-name" className="block col-span-4 text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">Medium</label>
                                                        <div className="mt-1 col-span-8 !sm:mt-0">
                                                            <input type="text"  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500  sm:text-sm" />
                                                        </div>
                                                    </div>
                                                    <div className="sm:grid sm:grid-cols-12 sm:gap-4">
                                                        <label htmlFor="first-name" className="block col-span-4 text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">Campaign
                                                        </label>
                                                        <div className="mt-1 col-span-8 !sm:mt-0">
                                                            <input type="text"  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500  sm:text-sm" />
                                                        </div>
                                                    </div>
                                                    <div className="sm:grid sm:grid-cols-12 sm:gap-4">
                                                        <label htmlFor="first-name" className="block col-span-4 text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">Content</label>
                                                        <div className="mt-1 col-span-8 !sm:mt-0">
                                                            <input type="text"  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500  sm:text-sm" />
                                                        </div>
                                                    </div>
                                                    <div className="sm:grid sm:grid-cols-12 sm:gap-4">
                                                        <label htmlFor="first-name" className="block col-span-4 text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">Term
                                                        </label>
                                                        <div className="mt-1 col-span-8 !sm:mt-0">
                                                            <input type="text"  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500  sm:text-sm" />
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-1 items-center text-[#545CD8] cursor-pointer">
                                                        <svg width={13} height={12} viewBox="0 0 13 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <rect x="5.25482" width={2} height={12} fill="#545CD8" />
                                                            <rect x="12.2548" y={5} width={2} height={12} transform="rotate(90 12.2548 5)" fill="#545CD8" />
                                                        </svg>
                                                        Add custom</div>
                                                </div>
                                             </div>

                                             {/* STEP6 END */}

                                              {/* STEP 7 */}
                                              <div className="flex-1 hidden">
                                                <div className="space-y-2">

                                                    <label className="flex gap-1">General note <svg width={15} height={14} viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M10.9734 4.94918L4.22799 11.6946C4.09671 11.8259 3.91866 11.8996 3.73301 11.8996H3.05486C2.66826 11.8996 2.35486 11.5862 2.35486 11.1996V10.5215C2.35486 10.3358 2.42861 10.1578 2.55988 10.0265L9.30529 3.28107M10.9734 4.94918L9.30529 3.28107M10.9734 4.94918C11.5294 4.39314 12.7527 3.39228 11.8074 2.44702C10.8622 1.50176 9.86133 2.72504 9.30529 3.28107" stroke="#363740" />
</svg>
</label>    
<textarea rows="3" className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"></textarea>
<div className="flex gap-1 items-center text-[#545CD8] cursor-pointer">
                                                        <svg width={13} height={12} viewBox="0 0 13 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <rect x="5.25482" width={2} height={12} fill="#545CD8" />
                                                            <rect x="12.2548" y={5} width={2} height={12} transform="rotate(90 12.2548 5)" fill="#545CD8" />
                                                        </svg>
                                                        Add note</div>

                                                </div>
                                            </div>



                                            {/* STEP7 END */}


                                            <div className="h-16 flex items-center justify-between">
                                                <button type="button" className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">Cancel</button>
                                                <button type="button" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm">Add contact</button>

                                            </div>


                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    );
}









