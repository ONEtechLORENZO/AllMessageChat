import React, { useState } from "react";
import WalletTab from "./WalletTab";
import WalletUsage from "./Expenses";
import Authenticated from "@/Layouts/Authenticated";
import { Head } from "@inertiajs/inertia-react";
import MessageTransaction from "./MsgTransaction";
import ListView from "@/Components/Views/List/Index2";

import Expenses from './Expenses';
import Wallet from "./Index";

import { Dialog, Transition } from '@headlessui/react'
import { FiChevronRight } from "react-icons/fi";


import { FiInfo } from "react-icons/fi";

import PricesInvoices from "./PricesInvoices";

function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
}

const tabs = [
    { label: 'Wallet & Usages', name: 'Wallet', href: '#',current: false, page: 'Wallet' },
    { label: 'Expenses', name: 'Expenses', href: '#',current: true, page: 'Expenses' },
    { label: 'See prices', name: 'See prices', href: '#',current: false, hasModal: true, page : 'price' },       
];

function WalletIndex(props)
{
    const [currentTab, setCurrentTab] = useState(props.current_page);
    
    return (
        <Authenticated
            auth={props.auth}
            errors={props.errors}
            current_page= {'Billing'}
            navigationMenu={props.menuBar}
        >
        <Head title={props.translator['Billing']} />

        <div className="hidden sm:block p-4">
        {/* <Expenses/> */}
        {/* <WalletTab/> */}
     {/*<PricesInvoices/>*/}
         <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 border-b border-[#B9B9B9]" aria-label="Tabs">
                {tabs.map((tab) => (
                    <a
                        active
                        href={tab.href}
                        className={classNames(
                            tab.page == currentTab
                            ? `${tab.hasModal ? '' : 'border-indigo-500 text-indigo-600'}`
                            : `border-transparent text-gray-500 ${tab.hasModal ? '' : 'hover:text-gray-700 hover:border-gray-300'}`,
                        `whitespace-nowrap  px-1 border-b-2 font-medium text-sm ${tab.hasModal ? 'bg-white rounded-full shadow-card py-1 self-center' : 'py-3'}`
                        )}
                        onClick={() => setCurrentTab(tab.page)}
                    >
                        {props.translator[tab.name]}
                    </a>
                ))} 
            </nav>

            <div className="py-4">

             {currentTab && currentTab == 'Wallet' ? 
                <WalletTab {...props} />
             : ''}

             {currentTab && currentTab == 'Expenses' ? 
                <WalletUsage {...props} />
             : ''}

             {currentTab && currentTab == 'Invoice' ? 
                <PricesInvoices translator={props.translator}/>
             : ''}

            </div>

            <Transition appear show={currentTab == "price" } as={React.Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => {setCurrentTab('Wallet')}}>
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-50" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={React.Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden text-left align-middle shadow-xl transition-all">
                  
                  
                  <Dialog.Title
                    as="h3"
                    className="text-base font-semibold leading-6 text-gray-900 bg-white !px-4 !py-2 !rounded-md shadow-card flex !gap-2 items-center"
                  >
                    Conversation prices  <FiInfo/>
                  </Dialog.Title>
                  <div className="mt-2 bg-white p-6 !rounded-md shadow-card space-y-5">
                    <p className="text-sm text-gray-500">
                    It means a conversation started by a user or by your business and lasting a maximum of 24 hours, after 24 hours a new conversation is counted.
                    </p>

                    <div className="flex justify-between items-center">
                        <div className="flex !gap-3">
                            <svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M7.79805 2H16.198C19.398 2 21.998 4.6 21.998 7.8V16.2C21.998 17.7383 21.387 19.2135 20.2993 20.3012C19.2116 21.3889 17.7363 22 16.198 22H7.79805C4.59805 22 1.99805 19.4 1.99805 16.2V7.8C1.99805 6.26174 2.60912 4.78649 3.69683 3.69878C4.78454 2.61107 6.25979 2 7.79805 2ZM7.59805 4C6.64327 4 5.72759 4.37928 5.05246 5.05442C4.37733 5.72955 3.99805 6.64522 3.99805 7.6V16.4C3.99805 18.39 5.60805 20 7.59805 20H16.398C17.3528 20 18.2685 19.6207 18.9436 18.9456C19.6188 18.2705 19.998 17.3548 19.998 16.4V7.6C19.998 5.61 18.388 4 16.398 4H7.59805ZM17.248 5.5C17.5796 5.5 17.8975 5.6317 18.1319 5.86612C18.3664 6.10054 18.498 6.41848 18.498 6.75C18.498 7.08152 18.3664 7.39946 18.1319 7.63388C17.8975 7.8683 17.5796 8 17.248 8C16.9165 8 16.5986 7.8683 16.3642 7.63388C16.1297 7.39946 15.998 7.08152 15.998 6.75C15.998 6.41848 16.1297 6.10054 16.3642 5.86612C16.5986 5.6317 16.9165 5.5 17.248 5.5ZM11.998 7C13.3241 7 14.5959 7.52678 15.5336 8.46447C16.4713 9.40215 16.998 10.6739 16.998 12C16.998 13.3261 16.4713 14.5979 15.5336 15.5355C14.5959 16.4732 13.3241 17 11.998 17C10.672 17 9.4002 16.4732 8.46251 15.5355C7.52483 14.5979 6.99805 13.3261 6.99805 12C6.99805 10.6739 7.52483 9.40215 8.46251 8.46447C9.4002 7.52678 10.672 7 11.998 7ZM11.998 9C11.2024 9 10.4393 9.31607 9.87673 9.87868C9.31412 10.4413 8.99805 11.2044 8.99805 12C8.99805 12.7956 9.31412 13.5587 9.87673 14.1213C10.4393 14.6839 11.2024 15 11.998 15C12.7937 15 13.5568 14.6839 14.1194 14.1213C14.682 13.5587 14.998 12.7956 14.998 12C14.998 11.2044 14.682 10.4413 14.1194 9.87868C13.5568 9.31607 12.7937 9 11.998 9Z" fill="#8071B8" />
                            </svg>
                            <svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M11.998 2C6.35805 2 1.99805 6.13 1.99805 11.7C1.99805 14.61 3.18805 17.14 5.13805 18.87C5.29805 19 5.39805 19.22 5.40805 19.44L5.45805 21.22C5.49805 21.79 6.06805 22.16 6.58805 21.93L8.56805 21.06C8.73805 21 8.92805 20.97 9.09805 21C9.99805 21.27 10.998 21.4 11.998 21.4C17.638 21.4 21.998 17.27 21.998 11.7C21.998 6.13 17.638 2 11.998 2ZM17.998 9.46L15.068 14.13C14.598 14.86 13.598 15.05 12.898 14.5L10.558 12.77C10.4542 12.6921 10.3279 12.65 10.198 12.65C10.0682 12.65 9.9419 12.6921 9.83805 12.77L6.67805 15.17C6.25805 15.5 5.70805 15 5.99805 14.54L8.92805 9.87C9.39805 9.14 10.398 8.95 11.098 9.47L13.438 11.23C13.5419 11.3079 13.6682 11.35 13.798 11.35C13.9279 11.35 14.0542 11.3079 14.158 11.23L17.318 8.83C17.738 8.5 18.288 9 17.998 9.46Z" fill="#8071B8" />
                            </svg>
                        </div>
                        <span className="text-[#363740] text-[13px] flex !gap-2 items-center">€0,05 <FiChevronRight className="cursor-pointer" size={'1.5rem'}/></span>
                    </div>

                    <div className="flex justify-between items-center">
                        <div className="flex !gap-3">
                            <svg width={24} height={25} viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M20.149 4.35885C19.1539 3.35367 17.9686 2.55668 16.6623 2.01439C15.3559 1.47209 13.9546 1.19533 12.5402 1.20026C6.61376 1.20026 1.78361 6.03041 1.78361 11.9568C1.78361 13.8563 2.28291 15.7016 3.21638 17.3297L1.69678 22.9088L7.39527 21.4109C8.96914 22.2684 10.7384 22.7243 12.5402 22.7243C18.4666 22.7243 23.2968 17.8941 23.2968 11.9677C23.2968 9.09131 22.1788 6.3886 20.149 4.35885ZM12.5402 20.9008C10.9338 20.9008 9.35989 20.4666 7.9814 19.6525L7.65577 19.4571L4.26924 20.3472L5.17014 17.0475L4.95306 16.711C4.06056 15.2858 3.58666 13.6384 3.58542 11.9568C3.58542 7.029 7.6015 3.01292 12.5293 3.01292C14.9173 3.01292 17.1641 3.94639 18.8465 5.63966C19.6796 6.46888 20.3397 7.45521 20.7888 8.54146C21.2378 9.62772 21.4668 10.7923 21.4624 11.9677C21.4841 16.8955 17.468 20.9008 12.5402 20.9008ZM17.4463 14.2145C17.175 14.0843 15.8507 13.433 15.612 13.3353C15.3623 13.2485 15.1886 13.2051 15.0041 13.4656C14.8196 13.7369 14.3094 14.3448 14.1575 14.5184C14.0055 14.703 13.8427 14.7247 13.5713 14.5836C13.3 14.4533 12.4317 14.1603 11.4113 13.2485C10.6081 12.5321 10.0763 11.6529 9.91346 11.3816C9.7615 11.1102 9.89175 10.9691 10.0329 10.828C10.1523 10.7086 10.3042 10.5132 10.4345 10.3613C10.5647 10.2093 10.619 10.0899 10.7058 9.91624C10.7927 9.73172 10.7492 9.57976 10.6841 9.44951C10.619 9.31925 10.0763 7.99503 9.85919 7.45232C9.6421 6.93132 9.41416 6.99644 9.25135 6.98559H8.73034C8.54582 6.98559 8.26361 7.05071 8.01396 7.32207C7.77517 7.59343 7.0805 8.24468 7.0805 9.5689C7.0805 10.8931 8.04653 12.1739 8.17678 12.3476C8.30703 12.5321 10.0763 15.2457 12.7681 16.4071C13.4085 16.6893 13.9078 16.8521 14.2986 16.9715C14.939 17.1777 15.5251 17.1452 15.9919 17.0801C16.5129 17.0041 17.5874 16.4288 17.8045 15.7993C18.0325 15.1697 18.0325 14.6378 17.9565 14.5184C17.8805 14.3991 17.7177 14.3448 17.4463 14.2145Z" fill="#8071B8" />
                            </svg>
                        </div>
                        <p className="text-[#363740] text-[13px] flex !gap-2 items-center">€0,10 +  <span className="text-[#4175DC]">Meta costs</span></p>
                    </div>

                  </div>                  
                </Dialog.Panel>
                
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
         </div>
        </div>    

        

        </Authenticated>
    )
}

export default WalletIndex;