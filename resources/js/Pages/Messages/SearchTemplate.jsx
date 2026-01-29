import React, { Fragment, useState } from 'react'
import { Listbox, Transition } from '@headlessui/react';
import { PlusIcon } from "@heroicons/react/24/outline";
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

const navigators = [
    {name: 'template_search', label: 'Template'},
    {name: 'product_search', label: 'Product'},
    {name: 'interactive_template_search', label: 'Interactive Message'},
];

export default function SearchTemplate(props) {

    const [tab, setTab] = useState('template_search');

    return(

        <Listbox  horizontal >
            {({ open }) => (
                <>
                <Listbox.Label className="sr-only">Templates</Listbox.Label>
                    <div className="relative">
                        <Listbox.Button className="relative -m-2 inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-400 hover:text-gray-500">
                            <span className="flex items-center justify-center">
                                <span>
                                    <PlusIcon className="h-6 w-6 flex-shrink-0" aria-hidden="true" />
                                    <span className="sr-only"> Choose your template  </span>
                                </span>
                            </span>
                        </Listbox.Button>

                        <Transition
                            show={open}
                            as={Fragment}
                            leave="transition ease-in duration-100"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                        <Listbox.Options className="absolute z-10 -ml-6 w-60 !px-5 rounded-lg bg-white py-3 text-base shadow ring-1 ring-black ring-opacity-5 focus:outline-none sm:ml-auto sm:w-96 sm:text-sm bottom-full h-60 overflow-auto">
                        
                        <div className='px-2 py-3'>
                            <div className="hidden sm:block">
                                <div className="border-b border-gray-200">
                                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                                        {navigators.map((navigator) => (
                                            <div
                                                className={classNames(
                                                navigator.name == tab
                                                    ? 'border-indigo-500 text-indigo-600'
                                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                                                'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm'
                                                )}
                                                onClick={() => setTab(navigator.name)}
                                            >
                                                {navigator.label}
                                            </div>
                                        ))}
                                    </nav>
                                </div>

                                <div className="py-3">
                                    {tab == 'template_search' ? 
                                        <>
                                            <div className="flex items-center !mb-4">
                                                <span className="ml-3 block truncate font-medium">
                                                    <div className="relative rounded-md shadow-sm">
                                                        <div className="absolute inset-y-0 left-0 pl-1s flex items-center pointer-events-none">
                                                            <span className="text-gray-500 sm:text-sm">
                                                                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                                            </span>
                                                        </div>
                                                        <input 
                                                            name="search_template"
                                                            id="search_template"
                                                            placeholder="Search template"
                                                            onChange={(e) => props.searchTemplates(e.target.value)}
                                                            className={` appearance-none block w-full pl-6 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-skin-primary focus:border-skin-primary sm:text-sm`} 
                                                        />
                                                    </div>
                                                </span>
                                            </div>
                                    
                                            {props.templates && (props.templates).map((template) => {
                                                if(template.account_id != props.selectedAccount) {
                                                    return false;
                                                }
                                                return(
                                                    <Listbox.Option
                                                        key={template.value}
                                                        className={({ active }) =>
                                                            classNames(
                                                                active ? 'bg-gray-100' : 'bg-white',
                                                                'relative cursor-default select-none py-2 px-3'
                                                            )
                                                        }
                                                        onClick={()=> props.setTemplateInfo(template)}
                                                    >
                                                        <div className="flex items-center">
                                                            <span className="ml-3 block truncate font-medium">{template.name}</span>
                                                        </div>
                                                    </Listbox.Option>
                                                )
                                            })}
                                        </>
                                    : ''}

                                    {tab == 'product_search' ? 
                                        <>
                                            <div className="flex items-center !mb-4">
                                                <span className="ml-3 block truncate font-medium">
                                                    <div className="relative rounded-md shadow-sm">
                                                        <div className="absolute inset-y-0 left-0 pl-1s flex items-center pointer-events-none">
                                                            <span className="text-gray-500 sm:text-sm">
                                                                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                                            </span>
                                                        </div>
                                                        <input 
                                                            name="product_search"
                                                            id="product_search"
                                                            placeholder="Search Product"
                                                            onChange={(e) => props.searchProduct(e.target.value)}
                                                            className={` appearance-none block w-full pl-6 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-skin-primary focus:border-skin-primary sm:text-sm`} 
                                                        />
                                                    </div>
                                                </span>
                                            </div>
                                    
                                            {props.products && (props.products).map((product, key) => {
                                                
                                                return(
                                                    <Listbox.Option
                                                        key={product.id}
                                                        className={({ active }) =>
                                                            classNames(
                                                                active ? 'bg-gray-100' : 'bg-white',
                                                                'relative cursor-default select-none py-2 px-3'
                                                            )
                                                        }
                                                        onClick={() => props.setProductInfo(product)}
                                                    >
                                                        <div className="flex items-center">
                                                            <span className="ml-3 block truncate font-medium">{product.name}</span>
                                                        </div>
                                                    </Listbox.Option>
                                                )
                                            })}
                                        </>
                                    : ''}

                                    {tab == 'interactive_template_search' ? 
                                        <>
                                            <div className="flex items-center !mb-4">
                                                <span className="ml-3 block truncate font-medium">
                                                    <div className="relative rounded-md shadow-sm">
                                                        <div className="absolute inset-y-0 left-0 pl-1s flex items-center pointer-events-none">
                                                            <span className="text-gray-500 sm:text-sm">
                                                                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                                            </span>
                                                        </div>
                                                        <input 
                                                            name="interactive_template_search"
                                                            id="interactive_template_search"
                                                            placeholder="Search Interactive Message"
                                                            onChange={(e) => props.searchInteractiveMessages(e.target.value)}
                                                            className={` appearance-none block w-full pl-6 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-skin-primary focus:border-skin-primary sm:text-sm`} 
                                                        />
                                                    </div>
                                                </span>
                                            </div>
                                    
                                            {props.interactiveMessages && (props.interactiveMessages).map((interactiveMessage, key) => {
                                                
                                                return(
                                                    <Listbox.Option
                                                        key={interactiveMessage.id}
                                                        className={({ active }) =>
                                                            classNames(
                                                                active ? 'bg-gray-100' : 'bg-white',
                                                                'relative cursor-default select-none py-2 px-3'
                                                            )
                                                        }
                                                        onClick={() => props.setInteractiveMessage(interactiveMessage)}
                                                    >
                                                        <div className="flex items-center">
                                                            <span className="ml-3 block truncate font-medium">{interactiveMessage.name}</span>
                                                        </div>
                                                    </Listbox.Option>
                                                )
                                            })}
                                        </>
                                    : ''}   
                                </div>
                            </div>
                        </div>
                                
                        </Listbox.Options>
                        </Transition>
                    </div>
                </>
            )}
        </Listbox>
    );
}












