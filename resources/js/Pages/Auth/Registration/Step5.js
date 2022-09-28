import React, {useState} from "react";
import { Fragment } from 'react';
import { CheckIcon, XIcon, ChevronRightIcon} from "@heroicons/react/solid";
import { Link } from "@inertiajs/inertia-react";
import { get } from "lodash";
import axios from "axios";
import { Inertia } from '@inertiajs/inertia';

const tiers = [
    { name: 'Lite', href: '#', priceMonthly: 0, currency: '€',description: '' , original: 'lite'},
    { name: 'Pro', href: '#', priceMonthly: 49, currency: '€',description: '' , original: 'pro'},
    {
      name: 'Business',
      href: '#',
      priceMonthly: 99,
      currency: '€',
      description: '',
      original: 'business'
    },
    {
      name: 'Enterprise',
      href: '#',
      priceMonthly: 'custom',
      currency: '',
      description: '',
      original: 'enterprise'
    },
];

const sections = [
{
    features: [
    { name: 'Max Social Accounts per Channel (e.g 1 WABA, 1 IG, 1FB)', tiers: { Lite: '1', Pro: '2', Business: '3', Enterprise: 'Custom' } },
    { name: 'Max User per Workspace', tiers: { Lite: '1', Pro: '10', Business: '25', Enterprise: 'infinite' } },
    { name: 'Automations - Workflow Builder', tiers: { Lite: false, Pro: '10000', Business: '25000', Enterprise: true } },
    { name: 'Sales Opportunities', tiers: { Lite: false, Pro: true, Business: true, Enterprise: true } },
    { name: 'Sales Category', tiers: { Lite: false, Pro: true, Business: true, Enterprise: true } },
    { name: 'Sales Orders', tiers: { Lite: false, Pro: true, Business: true, Enterprise: true } },
    ]
},
];

function classNames(...classes) {
   return classes.filter(Boolean).join(' ')
}

export default function Step5 (props) {

    function Subscribe(plan){
        let confirm = window.confirm(['Are you sure to subscribe this plan']);
        if(!confirm) {
            return;
        }
   
        Inertia.post(route('subscribe_plan',{'plan': plan}), {user_id: props.user_id, is_register_step: true }, {
            onSuccess: (response) => {
                props.setOpenTab(6);
            }
        });
        props.setOpenTab(6);
    }
//console.log( 'Step 5 proops:' , props);

    return (
        <div className="h-full w-full bg-blue-50 flex justify-center items-center">
            <div className="max-w-7xl flex mx-auto items-center px-10">
                <div className="w-full bg-white self-stretch flex justify-center py-24 rounded-xl px-4 lg:px-10">
                    <div className="py-8">
                        <div className="flex justify-center px-4">
                            <img
                                src="./img/onemessage-logo.png"
                                alt="One message logo"
                                className="w-1/2"
                            />
                        </div>
                        <div className="flex justify-center">
                            <div className="font-semibold text-lg">Choose Your Plan First!</div>
                        </div> 

                        <div>
                          <div className="bg-white">
                            <div className="mx-auto max-w-7xl bg-white py-16 sm:py-8 sm:px-6 lg:px-8">
                                <div className="hidden lg:block">
                                <table className="h-px w-full table-fixed">
                                    <caption className="sr-only">Pricing plan comparison</caption>
                                    <thead>
                                    <tr>
                                        <th className="px-6 pb-4 text-left text-sm font-medium text-gray-900" scope="col">
                                        </th>
                                        {tiers.map((tier) => (
                                        <th
                                            key={tier.name}
                                            className="w-1/5 px-6 pb-4 text-center text-lg font-medium leading-6 text-gray-900"
                                            scope="col"
                                        >
                                            <p className="px-6 py-2 rounded">
                                                {tier.name}
                                            </p>
                                        </th>
                                        ))}
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 border-t border-gray-200">
                                    {sections.map((section) => (
                                        <Fragment key={section.name}>
                                        {section.features.map((feature) => (
                                            <tr key={feature.name}>
                                            <th className="py-5 px-6 text-left text-sm font-normal text-gray-500" scope="row">
                                                {feature.name}
                                            </th>
                                            {tiers.map((tier) => (
                                                <td key={tier.name} className="py-5 px-6">
                                                {typeof feature.tiers[tier.name] === 'string' ? (
                                                    <span className="block text-sm text-gray-700">{feature.tiers[tier.name]}</span>
                                                ) : (
                                                    <>
                                                    {feature.tiers[tier.name] === true ? (
                                                        <CheckIcon className="h-5 w-5 text-green-500" aria-hidden="true" />
                                                    ) : (
                                                        <XIcon className="h-5 w-5 text-red-900" aria-hidden="true" />
                                                    )}
                                                    <span className="sr-only">
                                                        {feature.tiers[tier.name] === true ? 'Included' : 'Not included'} in {tier.name}
                                                    </span>
                                                    </>
                                                )}
                                                </td>
                                            ))}
                                            </tr>
                                        ))}
                                        </Fragment>
                                    ))}
                                     <tr>
                                        <th className="py-8 px-6 text-left align-top text-sm font-medium text-gray-900" scope="row">
                                        Pricing
                                        </th>
                                        {tiers.map((tier) => (
                                        <td key={tier.name} className="h-full py-8 px-6 align-top">
                                            <div className="relative table h-full">
                                            <p>
                                                <span className="text-4xl font-bold tracking-tight text-gray-900">{tier.priceMonthly}{tier.currency}</span>{' '}
                                                <span className="text-base font-medium text-gray-500">/mo</span>
                                            </p>
                                            </div>
                                        </td>
                                        ))}
                                    </tr>
                                    </tbody>
                                    <tfoot>
                                    <tr className="border-t border-gray-200">
                                        <th className="px-6 pt-5" scope="row">
                                        <Link
                                                href={route('showPlan')}
                                                className="w-full inline-flex justify-end rounded-md border border-transparent shadow-sm px-4 py-2 bg-gray-300 hover:bg-primary hover:text-white text-semibold font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm "
                                                >
                                                See plan and prices in detiles
                                                <span className="flex justify-end pt-1"><ChevronRightIcon className="h-4 w-4"/></span>
                                        </Link>
                                        </th>
                                        {tiers.map((tier) => (
                                        <td key={tier.name} className="px-6 pt-5">
                                            <button
                                                className={classNames(
                                                    props.plan == tier.original
                                                    ?"block w-full rounded-md border border-indigo-800 bg-indigo-600 py-2 text-center text-sm font-semibold text-white hover:bg-gray-900"
                                                    :"block w-full rounded-md border border-gray-800 bg-gray-800 py-2 text-center text-sm font-semibold text-white hover:bg-gray-900"
                                                )}
                                                onClick={() => Subscribe(tier.original)}
                                            >
                                                Buy {tier.name}
                                            </button>
                                        </td>
                                        ))}
                                    </tr>
                                    </tfoot>
                                </table>
                                </div>
                            </div>
                          </div>
                        </div>
            
                        <div className="flex justify-end mr-6">
                            <button
                                type="button"
                                className="w-full inline-flex justify-start rounded-md border border-transparent shadow-sm px-4 py-2 bg-gray-900 hover:bg-gray-200 hover:text-gray-900 text-semibold font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                                onClick={() => props.setOpenTab(6)}
                            >
                                Skip
                                <span className="flex justify-end pt-1"><ChevronRightIcon className="h-4 w-4"/></span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}