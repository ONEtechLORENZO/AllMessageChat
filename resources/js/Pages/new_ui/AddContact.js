import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";

import { BsPlusLg } from "react-icons/bs";
import Step1 from "./AddContact/Step1";
import Step2 from "./AddContact/Step2";
import Step3 from "./AddContact/Step3";

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
                                                Add contact
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-[#D4D4D4] flex justify-center items-center">
                                                    <svg
                                                        width={22}
                                                        height={22}
                                                        viewBox="0 0 22 22"
                                                        fill="none"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                        <path
                                                            opacity="0.2"
                                                            d="M11.2548 13.75C8.35534 13.75 6.00484 11.2876 6.00484 8.25C6.00484 5.21243 8.35534 2.75 11.2548 2.75C14.1543 2.75 16.5048 5.21243 16.5048 8.25C16.5048 11.2876 14.1543 13.75 11.2548 13.75Z"
                                                            fill="#FBFBFB"
                                                        />
                                                        <path
                                                            d="M2.73179 18.2192C3.9563 16.0094 5.91632 14.3508 8.23609 13.5614C7.12417 12.8687 6.26009 11.8127 5.7766 10.5557C5.2931 9.29865 5.21694 7.91006 5.5598 6.60327C5.90266 5.29647 6.64559 4.14375 7.67445 3.32219C8.7033 2.50062 9.96118 2.05566 11.2548 2.05566C12.5485 2.05566 13.8064 2.50062 14.8352 3.32219C15.8641 4.14375 16.607 5.29647 16.9499 6.60327C17.2927 7.91006 17.2166 9.29865 16.7331 10.5557C16.2496 11.8127 15.3855 12.8687 14.2736 13.5614C16.5934 14.3508 18.5534 16.0094 19.7779 18.2192C19.8292 18.2973 19.8646 18.3856 19.8818 18.4787C19.899 18.5718 19.8977 18.6676 19.8779 18.7601C19.858 18.8526 19.8201 18.9398 19.7666 19.0162C19.713 19.0926 19.645 19.1566 19.5667 19.2042C19.4884 19.2517 19.4016 19.2818 19.3116 19.2925C19.2217 19.3032 19.1307 19.2943 19.0442 19.2664C18.9577 19.2384 18.8777 19.1921 18.8091 19.1302C18.7406 19.0683 18.685 18.9922 18.6459 18.9067C17.8958 17.5489 16.818 16.4216 15.5208 15.6379C14.2235 14.8541 12.7523 14.4416 11.2548 14.4416C9.75733 14.4416 8.28615 14.8541 6.98889 15.6379C5.69163 16.4216 4.6139 17.5489 3.86382 18.9067C3.82468 18.9922 3.76909 19.0683 3.70054 19.1302C3.63199 19.1921 3.55196 19.2384 3.46548 19.2664C3.37901 19.2943 3.28795 19.3032 3.19803 19.2925C3.10811 19.2818 3.02127 19.2517 2.94298 19.2042C2.86469 19.1566 2.79663 19.0926 2.74308 19.0162C2.68953 18.9398 2.65165 18.8526 2.63182 18.7601C2.61198 18.6676 2.61063 18.5718 2.62783 18.4787C2.64503 18.3856 2.68043 18.2973 2.73179 18.2192ZM15.8486 8.25047C15.8486 7.29865 15.5792 6.3682 15.0744 5.57679C14.5696 4.78538 13.8522 4.16855 13.0128 3.8043C12.1734 3.44006 11.2497 3.34475 10.3586 3.53044C9.46754 3.71614 8.64901 4.17448 8.00657 4.84752C7.36412 5.52056 6.9266 6.37807 6.74935 7.3116C6.5721 8.24513 6.66307 9.21277 7.01077 10.0921C7.35845 10.9715 7.94725 11.7231 8.70269 12.2519C9.45812 12.7807 10.3463 13.063 11.2548 13.063C12.4732 13.063 13.6416 12.5559 14.5031 11.6534C15.3646 10.7509 15.8486 9.52683 15.8486 8.25047Z"
                                                            fill="#7666B4"
                                                        />
                                                    </svg>
                                                </div>
                                                <div className="flex text-white gap-1.5 items-center text-sm">
                                                    <BsPlusLg/>
                                                    Add photo
                                                </div>                                                
                                            </div>
                                            <ul className="divide-y w-full pl-0">
                                                <li className="flex text-[#AA94FF] gap-2 items-center w-full !p-3">
                                                  <div className="w-3 h-3 bg-white rounded-full"></div>
                                                  General info
                                                </li>
                                                <li className="flex text-white gap-2 items-center w-full !p-3">
                                                  <div className="w-3 h-3 border border-[#9A9A9A] rounded-full"></div>
                                                  Personal info
                                                </li>
                                                <li className="flex text-white gap-2 items-center w-full !p-3">
                                                  <div className="w-3 h-3 border border-[#9A9A9A] rounded-full"></div>
                                                  Organization
                                                </li>
                                                <li className="flex text-white gap-2 items-center w-full !p-3">
                                                  <div className="w-3 h-3 border border-[#9A9A9A] rounded-full"></div>
                                                  Location
                                                </li>
                                                <li className="flex text-white gap-2 items-center w-full !p-3">
                                                  <div className="w-3 h-3 border border-[#9A9A9A] rounded-full"></div>
                                                  Socials
                                                </li>
                                                <li className="flex text-white gap-2 items-center w-full !p-3">
                                                  <div className="w-3 h-3 border border-[#9A9A9A] rounded-full"></div>
                                                  Other information
                                                </li>
                                                <li className="flex text-white gap-2 items-center w-full !p-3">
                                                  <div className="w-3 h-3 border border-[#9A9A9A] rounded-full"></div>
                                                  Notes
                                                </li>
                                                <li className="flex text-white gap-2 items-center w-full !p-3 !border-0">
                                                  <div className="w-3 h-3 rounded-full"></div>
                                                  <div className="flex text-white gap-1.5 items-center text-sm cursor-pointer">
                                                    <BsPlusLg/>
                                                    Add custom section
                                                </div>
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

                                                <Step3/>

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
<textarea rows="3" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"></textarea>
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
                                                <button type="button" class="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">Cancel</button>
                                                <button type="button" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm">Add contact</button>

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
