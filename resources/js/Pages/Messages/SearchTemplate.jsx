import React, { Fragment, useState } from 'react'
import { Listbox, Transition } from '@headlessui/react';
import { PlusIcon } from "@heroicons/react/24/outline";
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export default function SearchTemplate(props) {
    const filterTemplatesByAccount = props.filterTemplatesByAccount ?? true;
    const filterTemplatesByService = props.filterTemplatesByService ?? false;
    const templateService = String(props.templateService || '').toLowerCase();
    const isDarkTheme = props.theme === 'dark';
    const hideTemplateSearch = props.hideTemplateSearch === true;
    const filteredTemplates = (props.templates || []).filter((template) => {
        if (!filterTemplatesByAccount) {
            return true;
        }

        if (String(template.account_id) !== String(props.selectedAccount)) {
            return false;
        }

        if (filterTemplatesByService && templateService) {
            const service = String(template.service || '').toLowerCase();
            if (service && service !== templateService) {
                return false;
            }
        }

        return true;
    });
    const availableNavigators = [
        {name: 'template_search', label: 'Template'},
        ...(props.allowProducts === false ? [] : [{name: 'product_search', label: 'Product'}]),
        ...(props.allowInteractiveMessages === false
            ? []
            : [{name: 'interactive_template_search', label: 'Interactive Message'}]),
    ];

    const [tab, setTab] = useState(availableNavigators[0]?.name || 'template_search');
    const panelClassName = isDarkTheme
        ? 'absolute z-10 -ml-6 w-60 !px-5 rounded-2xl border border-white/10 bg-[#18101f] py-3 text-base shadow-[0_18px_48px_rgba(0,0,0,0.38)] focus:outline-none sm:ml-auto sm:w-96 sm:text-sm bottom-full h-60 overflow-auto'
        : 'absolute z-10 -ml-6 w-60 !px-5 rounded-lg bg-white py-3 text-base shadow ring-1 ring-black ring-opacity-5 focus:outline-none sm:ml-auto sm:w-96 sm:text-sm bottom-full h-60 overflow-auto';
    const tabActiveClassName = isDarkTheme
        ? 'border-[#A31EFF] text-[#C78DFF]'
        : 'border-indigo-500 text-indigo-600';
    const tabInactiveClassName = isDarkTheme
        ? 'border-transparent text-white/60 hover:text-white hover:border-white/15'
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300';
    const optionActiveClassName = isDarkTheme
        ? 'bg-[#2a1736] text-white'
        : 'bg-gray-100';
    const optionInactiveClassName = isDarkTheme
        ? 'bg-transparent text-white/88'
        : 'bg-white';
    const emptyStateClassName = isDarkTheme
        ? 'px-3 py-2 text-sm text-white/45'
        : 'px-3 py-2 text-sm text-gray-400';
    const triggerClassName = isDarkTheme
        ? 'relative inline-flex h-10 w-10 items-center justify-center rounded-xl text-white/60 transition hover:bg-white/8 hover:text-white'
        : 'relative -m-2 inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-400 hover:text-gray-500';

    return(

        <Listbox  horizontal >
            {({ open }) => (
                <>
                <Listbox.Label className="sr-only">Templates</Listbox.Label>
                    <div className="relative inline-flex items-center">
                        <Listbox.Button className={triggerClassName}>
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
                        <Listbox.Options className={panelClassName}>
                        
                        <div className='px-2 py-3'>
                            <div className="hidden sm:block">
                                <div className={isDarkTheme ? "border-b border-white/10" : "border-b border-gray-200"}>
                                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                                        {availableNavigators.map((navigator) => (
                                            <div
                                                className={classNames(
                                                navigator.name == tab
                                                    ? tabActiveClassName
                                                    : tabInactiveClassName,
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
                                            {!hideTemplateSearch && (
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
                                            )}
                                    
                                            {filteredTemplates.map((template) => {
                                                return(
                                                    <Listbox.Option
                                                        key={template.template_uid || template.id || template.name}
                                                        className={({ active }) =>
                                                            classNames(
                                                                active ? optionActiveClassName : optionInactiveClassName,
                                                                'relative cursor-pointer select-none rounded-xl py-2 px-3 transition-colors'
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
                                            {filteredTemplates.length === 0 && (
                                                <div className={emptyStateClassName}>
                                                    No templates found.
                                                </div>
                                            )}
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
                                                            onChange={(e) => props.searchProduct && props.searchProduct(e.target.value)}
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
                                            {(!props.interactiveMessages || props.interactiveMessages.length === 0) && (
                                                <div className="px-3 py-2 text-sm text-gray-400">
                                                    No interactive messages found.
                                                </div>
                                            )}
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












