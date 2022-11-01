import React from "react";
import { Disclosure } from '@headlessui/react'
import { ChevronDownIcon } from "@heroicons/react/outline";

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export function DetailContainer(props) {

    return(
        <div id="tab-contents">
            <div className="bg-gray-50">
                <dl className="text-gray-200 divide-y">
                    <Disclosure as="div" key='General' className="" defaultOpen>
                        {({ open }) => (
                        <>
                            <dt className="pt-2">
                                <Disclosure.Button className="flex w-full items-start justify-between text-left text-gray-500">
                                    <span className="px-2 -mb-px font-semibold text-gray-800 rounded-t opacity-70">{props.header}</span>
                                    <span className="ml-6 flex h-7 items-center">
                                    <ChevronDownIcon
                                        className={classNames(open ? '-rotate-180' : 'rotate-0', 'h-4 w-4 transform')}
                                        aria-hidden="true"
                                    />
                                    </span>
                                </Disclosure.Button>
                            </dt>
                            <Disclosure.Panel as="dd" className="mt-2 pr-12">
                            <div>
                                {props.fields.map( (field) => {
                                    return(
                                        <div className="py-4 sm:py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                            <dt className="text-sm font-medium text-gray-500"> {field.label} </dt>
                                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 flex"> 
                                                {props.record[field.name] ? props.record[field.name] : '-'}
                                            </dd>
                                        </div>
                                    )                                              
                                })}
                            </div>
                            </Disclosure.Panel>
                        </>
                        )}
                    </Disclosure>
                </dl>
            </div>
        </div>
    );
}