import React, {useEffect, useState} from "react";
import Authenticated from "@/Layouts/Authenticated";
import { Fragment } from 'react';
import { CheckIcon, XIcon  } from "@heroicons/react/solid";
import { Inertia } from "@inertiajs/inertia";
import { Link } from "@inertiajs/inertia-react";
import notie from 'notie';

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
      currency: '€',
      description: '',
      original: 'enterprise'
    },
];

const sections = [
{
    name: 'Features',
    features: [
    { label: 'Target', name:'target', add: '', tiers: { lite: 'Freelance', pro: 'Small business',business: 'Medium Business', enterprise:'Large Business', 'category':'' , 'add_on': '€' } },
    { label: 'Setup per Workspace', name:'setup_workspace', add: '€', tiers: { lite: '0€', pro: '0€',business: '0€', enterprise:'Custom', 'category': 'monthly_workspace', 'add_on': '€' } },
    { label: 'Monthly Fee per Workspace', name:'monthly_workspace', add: '€', tiers: { lite: '0€', pro: '49€',business: '99€', enterprise:'350€/Max 10.000 messages month 500€ /max 25.000 messages month', 'category': 'monthly_workspace', 'add_on': '€'   } },
    { label: 'Included Channels', name:'channels', add: '', tiers: { lite: 'Whatsapp, Instagram, Facebook', pro: 'Whatsapp, Instagram, Facebook',business: 'Whatsapp, Instagram, Facebook', enterprise:'Whatsapp, Instagram, Facebook,custom', 'category': '' , 'add_on': '€' } },
    { label: 'Max Social Accounts per Channel (e.g 1 WABA, 1 IG, 1 FB)', name:'accounts', add: '', tiers: { lite: '1', pro: '2',business: '3', enterprise:'custom', 'category': 'accounts', 'add_on': ' '} },
    { label: 'Official Whatsapp Business API', name:'offical_whatsapp', add: '€/month/number', tiers: { lite: '0€/month/number', pro: '0€/month/number',business: '0€/month/number', enterprise:'0€/month/number', 'category': '' , 'add_on': '' } },
    { label: 'Unofficial Whatsapp Business API', name:'unoffical_whatsapp', add: '€/month/number', tiers: { lite: '45€/month/number', pro: '45€/month/number',business: '45€/month/number', enterprise:'NO', 'category': '', 'add_on': '€'  } },
    { label: 'Account Facebook e Instagram', name:'facebook', add: '€/mese/account', tiers: { lite: '0€/mese/account', pro: '0€/mese/account',business: '0€/mese/account', enterprise:'0€/mese/numero', 'category': '' , 'add_on': '€' } },
    { label: 'Max Users per Workspace', name:'users', add: '', tiers: { lite: '1', pro: '10',business: '25', enterprise:'infinite', 'category': 'users', 'add_on': ' '   } },
    { label: 'Users included in the workspace', name:'include_users', add: '€', tiers: { lite: '1', pro: '3',business: '5', enterprise:'custom', 'category': 'include_users', 'add_on': '€'   } },
    { label: 'Cost for Extra Users', name:'extra_users', add: '€/user/month', tiers: { lite: '-', pro: '5€/user/month',business: '5€/user/month', enterprise:'custom', 'category': 'extra_users', 'add_on': '€/user/month'   } },
    { label: 'CRM Contacts', name:'crm_contacts', add: '', tiers: { lite: 'infinite', pro: 'infinite',business: 'infinite', enterprise:'infinite', 'category': '' , 'add_on': '€'  } }
    ],
},
{
    name: 'Message Costs',
    features: [
    { label: 'Chat Cost (for WABA Only)', name:'chat_cost', add: '', tiers: { lite: 'Different from Country to Country', pro: true, business: true, enterprise: true, 'category': '', 'add_on': ''  } },
    { label: 'Cost per Message', name:'per_message', add: '€', tiers: { lite: '0.0017€', pro: '0.0017€',business: '0.0017€', enterprise:'custom', 'category': 'per_message', 'add_on': '€' }},
    { label: 'Cost per Allegato', name:'per_allegato', add: '€', tiers: { lite: '0.0027€', pro: '0.0027€',business: '0.0027€', enterprise:'custom', 'category': 'per_allegato', 'add_on': '€'  } },
    { label: 'Ciclo di fatturazione', name:'fatturazione', add: '', tiers: { lite: 'Prepagato', pro: 'Prepagato',business: 'Prepagato', enterprise:'Postpagato', 'category': '' , 'add_on': '' } },
    ],
},
{
    name: 'Altre Funzionalità',
    features: [
    { label: 'Contacts', name:'contacts', add: '', tiers: { lite: true, pro: true, business: true, enterprise: true, 'category': '' } },
    { label: 'Lists & Tags', name:'lists_tags', add: '', tiers: { lite: true, pro: true, business: true, enterprise: true , 'category': ''} },
    { label: 'Custom Fields', name:'custom_fields', add: '', tiers: { lite: true, pro: true, business: true, enterprise: true, 'category': '' } },
    { label: 'MultiChannel Chat', name:'multichannel_chat', add: '', tiers: { lite: true, pro: true, business: true, enterprise: true, 'category': '' } },
    { label: 'Broadcast Campaigns', name:'campaigns', add: '', tiers: { lite: true, pro: true, business: true, enterprise: true, 'category': '' } },
    { label: 'Automations - Workflow Builder', name:'workflow', add: '', tiers: { lite: false, pro: '10000', business: '25000', enterprise: true, 'category': 'workflow' , 'add_on': ''} },
    { label: 'Sales Opportunities', name:'opportunities', add: '', tiers: { lite: false, pro: true, business: true, enterprise: true, 'category': '' } },
    { label: 'Sales Category', name:'category', add: '', tiers: { lite: false, pro: true, business: true, enterprise: true, 'category': '' } },
    { label: 'Sales Orders', name:'orders', add: '', tiers: { lite: false, pro: true, business: true, enterprise: true, 'category': '' } },
    { label: 'Receive Lead Via Webhook', name:'lead_webhook', add: '', tiers: { lite: false, pro: true, business: true, enterprise: true, 'category': '' } },
    { label: 'Zapier Integrations', name:'integrations', add: '', tiers: { lite: false, pro: true, business: true, enterprise: true, 'category': '' } },
    { label: 'API', name:'api', add: '', tiers: { lite: false, pro: false, business: false, enterprise: true, 'category': '' } },
    { label: 'Custom Integrations', name:'custom_integrations', add: '', tiers: { lite: false, pro: false, business: false, enterprise: true, 'category': '' } },
    ],
},
];

function classNames(...classes) {
   return classes.filter(Boolean).join(' ')
}

export default function Subscription(props){

    const [plans, setPlans] = useState(props.plans);

    function Subscribe(plan){
        let confirm = window.confirm(['Are you sure to subscribe this plan']);
        if(!confirm) {
            return;
        }
   
        Inertia.post(route('subscribe_plan',{'plan': plan}), {user_id: props.user_id}, {
            onSuccess: (response) => {

            },
            onError: (errors) => {
               if(errors) {
                notie.alert({type: 'error', text: errors.message, time: 5});
               }
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
          <div className="mx-auto max-w-7xl bg-white py-16 sm:py-8 sm:px-6 lg:px-8">
            {props.auth.user.role == 'global_admin' &&
                <div className="flex justify-end">
                    <Link
                        href={route('listPlan')}
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gray-200 hover:bg-gray-500 hover:text-white text-base font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                        Plan Configuration
                    </Link>
                </div>  
            }
            <div className="hidden lg:block mt-10">
            <table className="h-px w-full table-fixed">
                <caption className="sr-only">Pricing plan comparison</caption>
                <thead>
                <tr>
                    <th className="px-6 pb-4 text-left text-sm font-medium text-gray-900" scope="col">
                    <span className="sr-only">Feature by</span>
                    <span className="sr-only">Plans</span>
                    </th>
                    {Object.entries(plans).map( ([key,plan]) => (
                        <th
                            key={plan.id}
                            className="w-1/5 px-6 pb-4 text-left text-lg font-medium leading-6 text-gray-900"
                            scope="col"
                        >
                            {key}
                        </th>
                    ))}
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 border-t border-gray-200">
                <tr>
                    <th className="py-8 px-6 text-left align-top text-sm font-medium text-gray-900" scope="row">
                    Pricing
                    </th>
                    {Object.entries(plans).map(([key, plan]) => (
                    <td key={key} className="h-full py-8 px-6 align-top">
                        <div className="relative table h-full">
                        <p>
                            <span className="text-4xl font-bold tracking-tight text-gray-900">{plan.price}
                            {plan.price.toLowerCase() != 'custom' ? '€':'' }
                            </span>{' '}
                            <span className="text-base font-medium text-gray-500">/mo</span>
                        </p>
                        <p className="mt-4 mb-16 text-sm text-gray-500">{''}</p>
                        <button
                            className={classNames(
                                (props.current_plan == plan.plan || props.current_plan == plan.plan_id)
                                ?"5 absolute bottom-0 block w-full flex-grow rounded-md border border-indigo-600 bg-indigo-600 py-2 text-center text-sm font-semibold text-white hover:bg-gray-900"
                                :"5 absolute bottom-0 block w-full flex-grow rounded-md border border-gray-800 bg-gray-800 py-2 text-center text-sm font-semibold text-white hover:bg-gray-900"
                            )}
                            onClick={() => Subscribe(plan.plan_id)}
                        >
                            Buy {plan.plan}
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
                        <tr key={feature.label}>
                        <th className="py-5 px-6 text-left text-sm font-normal text-gray-500" scope="row">
                            {feature.label} 
                        </th>
                        {Object.entries(plans).map(([key, plan]) => (
                            <td key={key} className="py-5 px-6">
                            {feature.name && plan[feature.name] ? 
                             <>
                              {section.name != 'Altre Funzionalità'?
                                <span className="block text-sm text-gray-700">{plan[feature.name]}
                                {plan[feature.name].toLowerCase() == 'custom'|| plan[feature.name].toLowerCase() == 'infinite'|| plan[feature.name] == '-' 
                                ? ''
                                : feature.add }
                                </span>
                              : (section.name == 'Altre Funzionalità') && (plan[feature.name] != 'true' && plan[feature.name] != 'false') ?
                                <span className="block text-sm text-gray-700">
                                    {plan[feature.name]} 
                                </span>
                              :
                              <>
                                {plan[feature.name] == 'true' ? (
                                    <CheckIcon className="h-5 w-5 text-green-500" aria-hidden="true" />
                                ): (
                                    <XIcon className="h-5 w-5 text-red-900" aria-hidden="true" />
                                )}
                              </>
                              }
                             </>
                            : 
                             <>
                               {typeof feature.tiers[plan.plan] === 'string'? (
                                    <>
                                      <span className="block text-sm text-gray-700">{feature.tiers[plan.plan]}</span>
                                    </>
                                ) : (
                                    <>
                                        {feature.tiers[plan.plan] === true ? (
                                            <CheckIcon className="h-5 w-5 text-green-500" aria-hidden="true" />
                                        ) : (
                                            <XIcon className="h-5 w-5 text-red-900" aria-hidden="true" />
                                        )}
                                    </>
                                )}
                             </>
                            }    
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
                    {Object.entries(plans).map(([key, plan]) => (
                    <td key={plan.id} className="px-6 pt-5">
                        <button
                            className={classNames(
                                props.current_plan == plan.plan
                                ?"block w-full rounded-md border border-indigo-800 bg-indigo-600 py-2 text-center text-sm font-semibold text-white hover:bg-gray-900"
                                :"block w-full rounded-md border border-gray-800 bg-gray-800 py-2 text-center text-sm font-semibold text-white hover:bg-gray-900"
                            )}
                            onClick={() => Subscribe(plan.plan_id)}
                        >
                            Buy {key}
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