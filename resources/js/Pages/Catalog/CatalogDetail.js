import React, { useState } from "react";
import { Disclosure } from '@headlessui/react'
import { ChevronDownIcon } from "@heroicons/react/outline";

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

const catalogMenu = {
    'commerce' : 'E-commerce', 
};

export default function CatalogDetail(props) {

    const [record, setRecord] = useState(props.record);

    return(
        <div className="bg-gray-50 ">
            <dl className="text-gray-200 divide-y">
                <Disclosure as="div" key='General' className="" defaultOpen>
                    {({ open }) => (
                    <>
                        <dt className="p-2 bg-gray-200 rounded-lg">
                            <Disclosure.Button className="flex w-full items-start align-items-center justify-between text-left text-gray-500">
                                <span className="px-2 -mb-px font-semibold text-gray-800 rounded-t">{props.translator['General']}</span>
                                <span className="ml-6 flex h-7 items-center">
                                <ChevronDownIcon
                                    className={classNames(open ? '-rotate-180' : 'rotate-0', 'h-4 w-4 transform')}
                                    aria-hidden="true"
                                />
                                </span>
                            </Disclosure.Button>
                        </dt>
                        <Disclosure.Panel as="dd" className="mt-2 pr-12">
                        <div className="divide-y divide-gray-200">
                            {Object.entries(props.defaultHeader).map( ([key, field]) => {
                                let field_value = '';
                                
                                field_value = record[key] ? record[key] : '-';

                                if(key == 'catalog_type') {
                                    field_value = catalogMenu[field_value];
                                } else if (key == 'business_id'){
                                    field_value = field_value['name'];
                                }
                                
                                return(
                                    <div className="py-2 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-4">
                                        <dt className="text-sm font-medium text-gray-500"> {props.translator[field.label]} </dt>
                                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 flex"> 
                                            {field_value} 
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
    )
}