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

            <div className="!mt-4 grid grid-cols-12 items-center !gap-5">
               
                <div className="col-span-6 space-y-2">
                    <div className='text-base text-[#363740] font-semibold'>All you Products</div>
                    <div className="grid gap-2 grid-cols-2">
                        <button type="button" class="btn btn-primary">Create New Catalog</button>
                        <button type="button" class="w-full  justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">Import catalog</button>
                    </div>
                    <div className="card !shadow-card justify-between items-center flex-row !px-4 !py-2.5">
                        <span>Select catalog</span>
                        <select>
                            <option>Select</option>
                        </select>
                    </div>
                    <div className="card !shadow-card justify-between items-center flex-row !px-4 !py-2.5">
                        <div className="flex items-center gap-1.5">
                            <HiMagnifyingGlass/>
                            <input type="text" name="search" id="search" class="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-md sm:text-sm border-gray-300 pl-9 appearance-none py-2 border  shadow-sm placeholder-gray-400 focus:outline-none focus:ring-skin-primary focus:border-skin-primary" placeholder="Search" value="" />

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

                <div className='col-span-6 space-y-2'>
                    <div className='text-base text-[#363740] font-semibold text-center'>Product details</div>
                    <div className='card !shadow-card !py-6 !px-4 !gap-4'>
                            <div className='flex !gap-4'>
                                <div className='flex !gap-1 self-start space-y-2 '>
                                    <img src='./img/square-img.png' className='w-auto h-[150px]' />
                                    <div className='flex flex-col justify-between'>
                                        <img src='./img/square-img.png' className='w-8 h-8' />  
                                        <img src='./img/square-img.png' className='w-8 h-8' />  
                                        <img src='./img/square-img.png' className='w-8 h-8' />
                                        <div className='w-8 h-8 relative'>
                                            <img src='./img/square-img.png' className='w-full h-full' />
                                        </div>
                                    </div>
                                </div>
                                <div className='space-y-2'>
                                    <div>
                                        <label className='font-semibold text-sm text-black block'>Product Title</label>
                                        <span className='text-[#3D4459] text-[13px] pt-0.5'>ID 342651</span>
                                    </div>
                                    <div>
                                        <label className='font-semibold text-sm text-black block'>Category</label>
                                        <span className='text-[#3D4459] text-[13px] pt-0.5'>ID 342651</span>
                                    </div>
                                    <div>
                                        <label className='font-semibold text-sm text-black block'>Price</label>
                                        <span className='text-[#3D4459] text-[13px] pt-0.5'>ID 342651</span>
                                    </div>
                                    <div>
                                        <label className='font-semibold text-sm text-black block'>Variations</label>
                                        <span className='text-[#3D4459] text-[13px] pt-0.5'>ID 342651</span>
                                    </div>                                    
                                </div>

                            </div>

                            <div>
                                <label className='font-semibold text-sm text-black block'>Description</label>

                                <div className='flex !gap-1'>
                                   
                                    <textarea
                                    rows={4}
                                    name="comment"
                                    id="comment"
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    defaultValue={''}
                                    />
                                    <svg width={20} height={20} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M7.5 14.9993C7.04167 14.9993 6.64944 14.8363 6.32333 14.5102C5.99667 14.1835 5.83333 13.791 5.83333 13.3327V3.33268C5.83333 2.87435 5.99667 2.48185 6.32333 2.15518C6.64944 1.82907 7.04167 1.66602 7.5 1.66602H15C15.4583 1.66602 15.8508 1.82907 16.1775 2.15518C16.5036 2.48185 16.6667 2.87435 16.6667 3.33268V13.3327C16.6667 13.791 16.5036 14.1835 16.1775 14.5102C15.8508 14.8363 15.4583 14.9993 15 14.9993H7.5ZM4.16667 18.3327C3.70833 18.3327 3.31583 18.1696 2.98917 17.8435C2.66306 17.5168 2.5 17.1243 2.5 16.666V5.83268C2.5 5.59657 2.58 5.39852 2.74 5.23852C2.89944 5.07907 3.09722 4.99935 3.33333 4.99935C3.56944 4.99935 3.7675 5.07907 3.9275 5.23852C4.08694 5.39852 4.16667 5.59657 4.16667 5.83268V16.666H12.5C12.7361 16.666 12.9342 16.746 13.0942 16.906C13.2536 17.0655 13.3333 17.2632 13.3333 17.4993C13.3333 17.7355 13.2536 17.9332 13.0942 18.0927C12.9342 18.2527 12.7361 18.3327 12.5 18.3327H4.16667Z" fill="#B4B5BF" />
                                    </svg>

                                </div>

                            </div>

                            <div>
                                <label className='font-semibold text-sm text-black block'>Availability</label>

                                <div className='flex !gap-1'>
                                   
                                 <div className='text-[12px]'><span className='font-semibold'>Total:</span><span>26</span></div>

                                <svg width={17} height={8} viewBox="0 0 17 8" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M16.3536 4.35355C16.5488 4.15829 16.5488 3.84171 16.3536 3.64645L13.1716 0.464466C12.9763 0.269204 12.6597 0.269204 12.4645 0.464466C12.2692 0.659728 12.2692 0.976311 12.4645 1.17157L15.2929 4L12.4645 6.82843C12.2692 7.02369 12.2692 7.34027 12.4645 7.53553C12.6597 7.7308 12.9763 7.7308 13.1716 7.53553L16.3536 4.35355ZM0 4.5H16V3.5H0V4.5Z" fill="#363740" />
</svg>

                                <div className='flex !gap-3'>
                                <div className='text-[12px]'><span >5</span><span className='font-semibold'>M</span></div>
                                <div className='text-[12px]'><span >7</span><span className='font-semibold'>S</span></div>
                                <div className='text-[12px]'><span >5</span><span className='font-semibold'>L</span></div>
                                <div className='text-[12px]'><span >0</span><span className='font-semibold'>XL</span></div>

                                </div>
                                

                                </div>

                            </div>
                            <div>
                                <label className='font-semibold text-sm text-black block'>Website link</label>

                                <div className='flex !gap-1'>
                                <input
                                    type="text"
                                    className="block w-full max-w-[300px] rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-500 sm:text-sm"
                                    
                                    />
                                    <svg width={20} height={20} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M7.5 14.9993C7.04167 14.9993 6.64944 14.8363 6.32333 14.5102C5.99667 14.1835 5.83333 13.791 5.83333 13.3327V3.33268C5.83333 2.87435 5.99667 2.48185 6.32333 2.15518C6.64944 1.82907 7.04167 1.66602 7.5 1.66602H15C15.4583 1.66602 15.8508 1.82907 16.1775 2.15518C16.5036 2.48185 16.6667 2.87435 16.6667 3.33268V13.3327C16.6667 13.791 16.5036 14.1835 16.1775 14.5102C15.8508 14.8363 15.4583 14.9993 15 14.9993H7.5ZM4.16667 18.3327C3.70833 18.3327 3.31583 18.1696 2.98917 17.8435C2.66306 17.5168 2.5 17.1243 2.5 16.666V5.83268C2.5 5.59657 2.58 5.39852 2.74 5.23852C2.89944 5.07907 3.09722 4.99935 3.33333 4.99935C3.56944 4.99935 3.7675 5.07907 3.9275 5.23852C4.08694 5.39852 4.16667 5.59657 4.16667 5.83268V16.666H12.5C12.7361 16.666 12.9342 16.746 13.0942 16.906C13.2536 17.0655 13.3333 17.2632 13.3333 17.4993C13.3333 17.7355 13.2536 17.9332 13.0942 18.0927C12.9342 18.2527 12.7361 18.3327 12.5 18.3327H4.16667Z" fill="#B4B5BF" />
                                    </svg>

                                </div>

                            </div>


                    </div>
                </div>
            </div>
        </div>
    );
}
