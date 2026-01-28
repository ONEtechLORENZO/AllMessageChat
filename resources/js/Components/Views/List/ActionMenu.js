import React, {Fragment} from 'react';
import { PencilAltIcon, TrashIcon, DotsVerticalIcon, EyeIcon, LinkIcon, DownloadIcon } from '@heroicons/react/solid';
import { Link } from '@inertiajs/inertia-react';
import { Menu, Transition } from '@headlessui/react'

export default function ActionMenu(props) {

    return(
        <Menu as="div" className="inline-block text-left">
            <div>
                <Menu.Button className="inline-flex w-full justify-center rounded-md  px-4 py-2 text-sm font-medium text-[#363740] hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
                    <DotsVerticalIcon className='w-4 h-4 cursor-pointer'/> 
                </Menu.Button>
            </div>
            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
            <Menu.Items className="absolute z-20 right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="px-1 py-1 ">
                    {props.actions && props.actions.detail === true ? 
                        <Menu.Item>
                        {({ active }) => (
                            <Link href={route('detail'+props.module , {id: props.record.id})} className='flex gap-2 p-2 items-center text-gray-700'>
                                <EyeIcon className='w-4 h-4 cursor-pointer text-gray-600'/> {props.translator['View']}
                            </Link>
                        )}
                    </Menu.Item>
                    : ''}
                    {props.actions && props.actions.edit === true? 
                        <Menu.Item>
                            {({ active }) => (
                                <>
                                 {props.edit_link ?
                                    <Link className='flex gap-2 p-2 items-center text-gray-700'
                                        href={route(props.edit_link, props.record.id)}
                                    > 
                                        <PencilAltIcon className='h-4 w-4 cursor-pointer text-indigo-700' /> {props.translator['Edit']} 
                                    </Link>
                                : 
                                    <button className='flex gap-2 p-2 items-center text-gray-700' onClick={() => props.showEditForm(props.record.id)}>
                                        <PencilAltIcon className='w-4 h-4 cursor-pointer text-indigo-700'/> {props.translator['Edit']}
                                    </button>
                                }
                                </>
                            )}
                        </Menu.Item>
                    : ''}
                     {((props.actions && props.actions.delete === true && props.module != 'User')) || (props.record.is_custom == '1') ?
                        <Menu.Item>
                            {({ active }) => (
                                <button className='flex gap-2 p-2 items-center text-gray-700' onClick={() => props.deleteRecord(props.record.id)}>
                                  <TrashIcon className='w-4 h-4 cursor-pointer text-red-500'/> {props.translator['Delete']}
                                </button>
                            )}
                        </Menu.Item>
                    :''}
                    {props.actions.download === true && props.module === 'Document' ?
                        <Menu.Item>
                            {({ active }) => (                                                            
                                <a href={route('download_document',props.record.id)} className="flex px-2 text-gray-700"><DownloadIcon className='h-4 w-4 cursor-pointer m-1 text-indigo-700' /> Download</a>
                            )}
                        </Menu.Item>
                    : ''}
                    {props.actions.download === true && props.record.status === 'success' ? 
                        <Menu.Item>
                            {({ active }) => (                                                            
                                <a href={route('invoices',props.record.id)} className="flex px-2 text-gray-700" ><DownloadIcon className='h-4 w-4 cursor-pointer text-indigo-700' /> Download</a>
                            )}
                        </Menu.Item>
                    : ''}

                    {(props.actions && props.actions.unlink === true && props.module == 'User')  ?
                        <Menu.Item>
                            {({ active }) => (  
                               <button className='flex gap-2 p-2 items-center text-gray-700' onClick={() => props.unlinkRecord(props.record.id)} >
                                 <LinkIcon className='h-4 w-4 text-red-600 cursor-pointer text-red-500'/> Unlink
                               </button>
                            )}
                        </Menu.Item>
                    : ''}
                </div>
            </Menu.Items>
            </Transition>
        </Menu>
    );
}