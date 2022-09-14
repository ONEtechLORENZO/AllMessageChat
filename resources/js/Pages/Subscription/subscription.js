import React from "react";
import Authenticated from "@/Layouts/Authenticated";
import { Fragment } from 'react';
import { CheckIcon, XIcon  } from "@heroicons/react/solid";
import { Inertia } from "@inertiajs/inertia";

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
    name: 'Features',
    features: [
    { name: 'Target', tiers: { Lite: 'Freelance', Pro: 'Small Business',Business: 'Medium Business', Enterprise:'Large Business' } },
    { name: 'Setup per Workspace', tiers: { Lite: '0€', Pro: '0€',Business: '0€', Enterprise:'Custom' } },
    { name: 'Monthly Fee per Workspace', tiers: { Lite: '0€', Pro: '49€',Business: '99€', Enterprise:'350€/Max 10.000 messages month 500€ /max 25.000 messages month' } },
    { name: 'Included Channels', tiers: { Lite: 'Whatsapp, Instagram, Facebook', Pro: 'Whatsapp, Instagram, Facebook',Business: 'Whatsapp, Instagram, Facebook', Enterprise:'Whatsapp, Instagram, Facebook,custom' } },
    { name: 'Max Social Accounts per Channel (e.g 1 WABA, 1 IG, 1 FB)', tiers: { Lite: '1', Pro: '2',Business: '3', Enterprise:'custom' } },
    { name: 'Official Whatsapp Business API', tiers: { Lite: '0€/month/number', Pro: '0€/month/number',Business: '0€/month/number', Enterprise:'0€/month/number'} },
    { name: 'Unofficial Whatsapp Business API', tiers: { Lite: '45€/month/number', Pro: '45€/month/number',Business: '45€/month/number', Enterprise:'NO'} },
    { name: 'Account Facebook e Instagram', tiers: { Lite: '0€/mese/account', Pro: '0€/mese/account',Business: '0€/mese/account', Enterprise:'0€/mese/numero'} },
    { name: 'Max Users per Workspace', tiers: { Lite: '1', Pro: '10',Business: '25', Enterprise:'infinite' } },
    { name: 'Users included in the workspace', tiers: { Lite: '1', Pro: '3',Business: '5', Enterprise:'custom' } },
    { name: 'Cost for Extra Users', tiers: { Lite: '-', Pro: '5€/user/month',Business: '5€/user/month', Enterprise:'custom' } },
    { name: 'CRM Contacts', tiers: { Lite: 'infinite', Pro: 'infinite',Business: 'infinite', Enterprise:'infinite' } }
    ],
},
{
    name: 'Message Costs',
    features: [
    { name: 'Chat Cost (for WABA Only)', tiers: { Lite: 'Different from Country to Country', Pro: true, Business: true, Enterprise: true } },
    { name: 'Cost per Message', tiers: { Lite: '0.0017€', Pro: '0.0017€',Business: '0.0017€', Enterprise:'custom' } },
    { name: 'Cost per Allegato', tiers: { Lite: '0.0027€', Pro: '0.0027€',Business: '0.0027€', Enterprise:'custom' } },
    { name: 'Ciclo di fatturazione', tiers: { Lite: 'Prepagato', Pro: 'Prepagato',Business: 'Prepagato', Enterprise:'Postpagato' } },
    ],
},
{
    name: 'Altre Funzionalità',
    features: [
    { name: 'Contacts', tiers: { Lite: true, Pro: true, Business: true, Enterprise: true } },
    { name: 'Lists & Tags', tiers: { Lite: true, Pro: true, Business: true, Enterprise: true } },
    { name: 'Custom Fields', tiers: { Lite: true, Pro: true, Business: true, Enterprise: true } },
    { name: 'MultiChannel Chat', tiers: { Lite: true, Pro: true, Business: true, Enterprise: true } },
    { name: 'Broadcast Campaigns', tiers: { Lite: true, Pro: true, Business: true, Enterprise: true } },
    { name: 'Automations - Workflow Builder', tiers: { Lite: false, Pro: '10000', Business: '25000', Enterprise: true } },
    { name: 'Sales Opportunities', tiers: { Lite: false, Pro: true, Business: true, Enterprise: true } },
    { name: 'Sales Category', tiers: { Lite: false, Pro: true, Business: true, Enterprise: true } },
    { name: 'Sales Orders', tiers: { Lite: false, Pro: true, Business: true, Enterprise: true } },
    { name: 'Receive Lead Via Webhook', tiers: { Lite: false, Pro: true, Business: true, Enterprise: true } },
    { name: 'Zapier Integrations', tiers: { Lite: false, Pro: true, Business: true, Enterprise: true } },
    { name: 'API', tiers: { Lite: false, Pro: false, Business: false, Enterprise: true } },
    { name: 'Custom Integrations', tiers: { Lite: false, Pro: false, Business: false, Enterprise: true } },
    ],
},
];

function classNames(...classes) {
   return classes.filter(Boolean).join(' ')
}

export default function Subscription(props){

    function Subscribe(plan){
        let confirm = window.confirm(['Are you sure to subscribe this plan']);
        if(!confirm) {
            return;
        }
   
        Inertia.post(route('subscribe_plan',{'plan' : plan}), '', {
            onSuccess: (response) => {

            }
        });
    }

    return(
    <Authenticated
      auth={props.auth}
      errors={props.errors}
    >
        <div>
         <div className="bg-white">
          <div className="mx-auto max-w-7xl bg-white py-16 sm:py-24 sm:px-6 lg:px-8">
            <div className="hidden lg:block">
            <table className="h-px w-full table-fixed">
                <caption className="sr-only">Pricing plan comparison</caption>
                <thead>
                <tr>
                    <th className="px-6 pb-4 text-left text-sm font-medium text-gray-900" scope="col">
                    <span className="sr-only">Feature by</span>
                    <span className="sr-only">Plans</span>
                    </th>
                    {tiers.map((tier) => (
                    <th
                        key={tier.name}
                        className="w-1/5 px-6 pb-4 text-left text-lg font-medium leading-6 text-gray-900"
                        scope="col"
                    >
                        {tier.name}
                    </th>
                    ))}
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 border-t border-gray-200">
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
                        <p className="mt-4 mb-16 text-sm text-gray-500">{tier.description}</p>
                        <button
                            className={classNames(
                                props.plan == tier.original
                                ?"5 absolute bottom-0 block w-full flex-grow rounded-md border border-indigo-600 bg-indigo-600 py-2 text-center text-sm font-semibold text-white hover:bg-gray-900"
                                :"5 absolute bottom-0 block w-full flex-grow rounded-md border border-gray-800 bg-gray-800 py-2 text-center text-sm font-semibold text-white hover:bg-gray-900"
                            )}
                            onClick={() => Subscribe(tier.original)}
                        >
                            Buy {tier.name}
                        </button>
                        </div>
                    </td>
                    ))}
                </tr>
                {sections.map((section) => (
                    <Fragment key={section.name}>
                    <tr>
                        <th
                        className="bg-gray-50 py-3 pl-6 text-left text-sm font-medium text-gray-900"
                        colSpan={4}
                        scope="colgroup"
                        >
                        {section.name}
                        </th>
                    </tr>
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
                </tbody>
                <tfoot>
                <tr className="border-t border-gray-200">
                    <th className="sr-only" scope="row">
                    Choose your plan
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
    </Authenticated>
    );
}