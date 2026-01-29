import { Fragment, useEffect, useRef, useState } from 'react'

import { HiMagnifyingGlass,HiOutlineChevronDown } from "react-icons/hi2";
import { Menu, Transition } from '@headlessui/react'
import { HiOutlineChevronRight } from "react-icons/hi";

import { BsChevronBarLeft,BsChevronBarRight,BsChevronLeft,BsChevronRight } from "react-icons/bs";


export default function Listing() {

    const [currentTab, setCurrentTab] = useState("Catalogs");
    
    function classNames(...classes) {
        return classes.filter(Boolean).join(" ");
    }
    
    const tabs = [
        {
            label: "Catalogs",
            name: "Catalogs",
            href: "#",
            current: false,
            page: "Catalogs",
        },
        {
            label: "Orders",
            name: "Orders",
            href: "#",
            current: true,
            page: "Orders",
        },
        
    ];
    return (
        <div className="p-4">
            <nav
                className="-mb-px flex space-x-8 border-b border-[#B9B9B9]"
                aria-label="Tabs"
            >
                {tabs.map((tab) => (
                    <a
                        active
                        href={tab.href}
                        className={classNames(
                            tab.page == currentTab
                                ? "border-indigo-500 text-indigo-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
                            "whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm"
                        )}
                        onClick={() => setCurrentTab(tab.page)}
                    >
                        {tab.name}
                    </a>
                ))}
            </nav>

            <div className="!mt-4 grid grid-cols-12 !gap-5">
                <div className="col-span-4 flex flex-col !gap-2">
                    
                    <div className='text-base text-[#363740] font-semibold'>Catalog list</div>

                    <div className="grid gap-2 grid-cols-2">
                        <button className="btn btn-primary">Create New Catalog</button>
                        <button className="btn btn-primary">Import catalog</button>
                    </div>
                    <div className="card !shadow-card justify-between items-center flex-row !px-4 !py-2.5">
                        <div className="flex items-center gap-1.5">
                            <HiMagnifyingGlass/>
                            <input type="text" name="search" id="search" className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-md sm:text-sm border-gray-300 pl-9 appearance-none py-2 border  shadow-sm placeholder-gray-400 focus:outline-none focus:ring-skin-primary focus:border-skin-primary" placeholder="Search" value="" />
                        </div>
                       
                        <svg width={20} height={20} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17.9453 13.5703L14.8203 16.6953H14.8125C14.8047 16.7109 14.7891 16.7188 14.7734 16.7344L14.75 16.75L14.7188 16.7734L14.6953 16.7891L14.6719 16.8047H14.6406L14.6172 16.8203H14.5859L14.5547 16.8359H14.1953L14.1641 16.8203H14.1328L14.1094 16.8047H14.0781L14.0547 16.7891L14.0312 16.7734L14 16.75L13.9766 16.7344L13.9375 16.6953H13.9297L10.8047 13.5703C10.705 13.4489 10.6541 13.2947 10.6618 13.1378C10.6695 12.9809 10.7353 12.8325 10.8464 12.7214C10.9575 12.6103 11.1059 12.5445 11.2628 12.5368C11.4197 12.5291 11.5739 12.58 11.6953 12.6797L13.75 14.7422V8.75C13.75 8.58424 13.8158 8.42527 13.9331 8.30806C14.0503 8.19085 14.2092 8.125 14.375 8.125C14.5408 8.125 14.6997 8.19085 14.8169 8.30806C14.9342 8.42527 15 8.58424 15 8.75V14.7422L17.0547 12.6797C17.1761 12.58 17.3303 12.5291 17.4872 12.5368C17.6441 12.5445 17.7925 12.6103 17.9036 12.7214C18.0147 12.8325 18.0805 12.9809 18.0882 13.1378C18.0959 13.2947 18.045 13.4489 17.9453 13.5703ZM9.375 9.375H3.75C3.58424 9.375 3.42527 9.44085 3.30806 9.55806C3.19085 9.67527 3.125 9.83424 3.125 10C3.125 10.1658 3.19085 10.3247 3.30806 10.4419C3.42527 10.5592 3.58424 10.625 3.75 10.625H9.375C9.54076 10.625 9.69973 10.5592 9.81694 10.4419C9.93415 10.3247 10 10.1658 10 10C10 9.83424 9.93415 9.67527 9.81694 9.55806C9.69973 9.44085 9.54076 9.375 9.375 9.375ZM3.75 5.625H14.375C14.5408 5.625 14.6997 5.55915 14.8169 5.44194C14.9342 5.32473 15 5.16576 15 5C15 4.83424 14.9342 4.67527 14.8169 4.55806C14.6997 4.44085 14.5408 4.375 14.375 4.375H3.75C3.58424 4.375 3.42527 4.44085 3.30806 4.55806C3.19085 4.67527 3.125 4.83424 3.125 5C3.125 5.16576 3.19085 5.32473 3.30806 5.44194C3.42527 5.55915 3.58424 5.625 3.75 5.625ZM8.125 14.375H3.75C3.58424 14.375 3.42527 14.4408 3.30806 14.5581C3.19085 14.6753 3.125 14.8342 3.125 15C3.125 15.1658 3.19085 15.3247 3.30806 15.4419C3.42527 15.5592 3.58424 15.625 3.75 15.625H8.125C8.29076 15.625 8.44973 15.5592 8.56694 15.4419C8.68415 15.3247 8.75 15.1658 8.75 15C8.75 14.8342 8.68415 14.6753 8.56694 14.5581C8.44973 14.4408 8.29076 14.375 8.125 14.375Z" fill="black" />
                        </svg>
                    </div>

                 

                    <div className="space-y-2">
                        <div className="card !shadow-card flex-row justify-between items-center !py-2 !px-4">
                            <div className="flex !gap-2">
                                <div className="flex flex-col !gap-1">
                                    <span className="font-semibold text-sm text-black">Catalog Title</span>
                                    <span className="text-[12px] text-[#878787]">ID 342651</span>
                                </div> 
                                <span className="bg-[#9F9F9F] text-white !py-1 !px-2 !rounded self-start">Facebook</span>
                            </div>
                            <svg width={3} height={16} viewBox="0 0 3 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1.5 3.5C2.32843 3.5 3 2.82843 3 2C3 1.17157 2.32843 0.5 1.5 0.5C0.671573 0.5 0 1.17157 0 2C0 2.82843 0.671573 3.5 1.5 3.5Z" fill="black" />
                                <path d="M1.5 9.5C2.32843 9.5 3 8.82843 3 8C3 7.17157 2.32843 6.5 1.5 6.5C0.671573 6.5 0 7.17157 0 8C0 8.82843 0.671573 9.5 1.5 9.5Z" fill="black" />
                                <path d="M1.5 15.5C2.32843 15.5 3 14.8284 3 14C3 13.1716 2.32843 12.5 1.5 12.5C0.671573 12.5 0 13.1716 0 14C0 14.8284 0.671573 15.5 1.5 15.5Z" fill="black" />
                            </svg>
                        </div>
                        
                        <div className="card !shadow-card flex-row justify-between items-center !py-2 !px-4">
                            <div className="flex !gap-2">
                                <div className="flex flex-col !gap-1">
                                    <span className="font-semibold text-sm text-black">Catalog Title</span>
                                    <span className="text-[12px] text-[#878787]">ID 342651</span>
                                </div> 
                                <span className="bg-[#9F9F9F] text-white !py-1 !px-2 !rounded self-start">Facebook</span>
                            </div>
                            <svg width={3} height={16} viewBox="0 0 3 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1.5 3.5C2.32843 3.5 3 2.82843 3 2C3 1.17157 2.32843 0.5 1.5 0.5C0.671573 0.5 0 1.17157 0 2C0 2.82843 0.671573 3.5 1.5 3.5Z" fill="black" />
                                <path d="M1.5 9.5C2.32843 9.5 3 8.82843 3 8C3 7.17157 2.32843 6.5 1.5 6.5C0.671573 6.5 0 7.17157 0 8C0 8.82843 0.671573 9.5 1.5 9.5Z" fill="black" />
                                <path d="M1.5 15.5C2.32843 15.5 3 14.8284 3 14C3 13.1716 2.32843 12.5 1.5 12.5C0.671573 12.5 0 13.1716 0 14C0 14.8284 0.671573 15.5 1.5 15.5Z" fill="black" />
                            </svg>
                        </div>

                        <div className='card !shadow-card !p-4 justify-between flex-row'>

                            <span>1-10 of 97</span>

                            <div className='flex !gap-6'>
                            <BsChevronBarLeft size={'1.2rem'} className='cursor-pointer'/>
                            <BsChevronLeft size={'1.2rem'} className='cursor-pointer'/>                        
                            <BsChevronRight size={'1.2rem'} className='cursor-pointer'/>
                            <BsChevronBarRight size={'1.2rem'} className='cursor-pointer'/>
                            </div>

                        </div>
                        
                    </div>
                </div>
                <div className="col-span-8 space-y-2">
                    <div className='text-base text-[#363740] font-semibold'>Products</div>
                    <button className="btn btn-primary">Add product</button>
                    <div className="card !shadow-card justify-between items-center flex-row !px-4 !py-2.5">
                        <div className="flex items-center gap-1.5">
                            <HiMagnifyingGlass/>
                            <input type="text" name="search" id="search" className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-md sm:text-sm border-gray-300 pl-9 appearance-none py-2 border  shadow-sm placeholder-gray-400 focus:outline-none focus:ring-skin-primary focus:border-skin-primary" placeholder="Search" value="" />

                            <svg width={20} height={20} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M17.6637 3.66953C17.6637 2.74953 16.9175 2.00391 15.9975 2.00391C15.0775 2.00391 14.3312 2.74953 14.3312 3.66953C14.3312 4.47516 14.9037 5.14766 15.6644 5.30203V16.6645H16.3306V5.30203C17.0912 5.14766 17.6637 4.47516 17.6637 3.66953V3.66953ZM15.9975 4.66953C15.4462 4.66953 14.9981 4.22141 14.9981 3.67016C14.9981 3.11891 15.4462 2.67078 15.9975 2.67078C16.5487 2.67078 16.9969 3.11891 16.9969 3.67016C16.9969 4.22141 16.5487 4.66953 15.9975 4.66953Z" fill="#363740" />
                                <path d="M4.3356 14.6984V3.33594H3.66935V14.6984C2.90873 14.8528 2.33685 15.5247 2.33685 16.3309C2.33685 17.2509 3.0831 17.9972 4.0031 17.9972C4.9231 17.9972 5.66935 17.2509 5.66935 16.3309C5.66935 15.5247 5.09685 14.8528 4.33623 14.6984H4.3356ZM4.00248 17.3309C3.45123 17.3309 3.0031 16.8828 3.0031 16.3316C3.0031 15.7803 3.45123 15.3322 4.00248 15.3322C4.55373 15.3322 5.00185 15.7803 5.00185 16.3316C5.00185 16.8828 4.55373 17.3309 4.00248 17.3309Z" fill="#363740" />
                                <path d="M10.3331 8.36719V3.33594H9.66687V8.36719C8.90624 8.52156 8.33374 9.19406 8.33374 9.99969C8.33374 10.8053 8.90624 11.4778 9.66687 11.6322V16.6634H10.3331V11.6322C11.0937 11.4778 11.6662 10.8053 11.6662 9.99969C11.6662 9.19406 11.0937 8.52156 10.3331 8.36719V8.36719ZM9.99999 10.9991C9.44874 10.9991 9.00062 10.5509 9.00062 9.99969C9.00062 9.44844 9.44874 9.00031 9.99999 9.00031C10.5512 9.00031 10.9994 9.44844 10.9994 9.99969C10.9994 10.5509 10.5512 10.9991 9.99999 10.9991Z" fill="#363740" />
                            </svg>

                        </div>
                       
                        <div className='flex gap-1 items-center'>
                            <svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8.50129 9.98648L7.93579 10.552L12 14.6162L16.0643 10.552L15.4988 9.98648L12.3998 13.0855V0.427734H11.6003V13.0855L8.50129 9.98648Z" fill="#363740" />
                                <path d="M13.9995 4.42578V5.22528H19.1978V18.8198H4.80377V5.22528H10.002V4.42578H4.00427V19.62H19.998V4.42578H13.9995Z" fill="#363740" />
                            </svg>


                        Export
                        </div>
                    </div>

                    <div className='card !shadow-card !p-4'>
                        <table>
                            <thead>
                                <tr className='font-semibold text-[#3D4459]'>
                                    <th className='!pb-2'>Title</th>
                                    <th className='!pb-2'>In stock</th>
                                    <th className='!pb-2'>Variants</th>
                                    <th className='!pb-2'>Price</th>
                                    <th className='!pb-2'></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>
                                        <div className='flex items-center !gap-2'>
                                            <img src='./img/square-img.png' className='w-8 h-8' />
                                            <div className='flex flex-col'>
                                                <span className='text-sm font-semibold '>Product Title</span>
                                                <span className='text-[12px] text-[#878787]'>Product Title</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>45</td>
                                    <td>4 sizes</td>
                                    <td>€180.00</td>
                                    <td><HiOutlineChevronRight className='text-[#545CD8]'/> </td>
                                </tr>

                                <tr>
                                    <td>
                                        <div className='flex items-center !gap-2'>
                                            <img src='./img/square-img.png' className='w-8 h-8' />
                                            <div className='flex flex-col'>
                                                <span className='text-sm font-semibold '>Product Title</span>
                                                <span className='text-[12px] text-[#878787]'>Product Title</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>45</td>
                                    <td>4 sizes</td>
                                    <td>€180.00</td>
                                    <td><HiOutlineChevronRight className='text-[#545CD8]'/> </td>
                                </tr>

                                <tr>
                                    <td>
                                        <div className='flex items-center !gap-2'>
                                            <img src='./img/square-img.png' className='w-8 h-8' />
                                            <div className='flex flex-col'>
                                                <span className='text-sm font-semibold '>Product Title</span>
                                                <span className='text-[12px] text-[#878787]'>Product Title</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>45</td>
                                    <td>4 sizes</td>
                                    <td>€180.00</td>
                                    <td><HiOutlineChevronRight className='text-[#545CD8]'/> </td>
                                </tr>

                                <tr>
                                    <td>
                                        <div className='flex items-center !gap-2'>
                                            <img src='./img/square-img.png' className='w-8 h-8' />
                                            <div className='flex flex-col'>
                                                <span className='text-sm font-semibold '>Product Title</span>
                                                <span className='text-[12px] text-[#878787]'>Product Title</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>45</td>
                                    <td>4 sizes</td>
                                    <td>€180.00</td>
                                    <td><HiOutlineChevronRight className='text-[#545CD8]'/> </td>
                                </tr>

                                <tr>
                                    <td>
                                        <div className='flex items-center !gap-2'>
                                            <img src='./img/square-img.png' className='w-8 h-8' />
                                            <div className='flex flex-col'>
                                                <span className='text-sm font-semibold '>Product Title</span>
                                                <span className='text-[12px] text-[#878787]'>Product Title</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>45</td>
                                    <td>4 sizes</td>
                                    <td>€180.00</td>
                                    <td><HiOutlineChevronRight className='text-[#545CD8]'/> </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className='card !shadow-card !p-4 justify-between flex-row'>

                        <span>1-10 of 97</span>

                        <div className='flex !gap-6'>
                        <BsChevronBarLeft size={'1.2rem'} className='cursor-pointer'/>
                        <BsChevronLeft size={'1.2rem'} className='cursor-pointer'/>                        
                        <BsChevronRight size={'1.2rem'} className='cursor-pointer'/>
                        <BsChevronBarRight size={'1.2rem'} className='cursor-pointer'/>
                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
}









