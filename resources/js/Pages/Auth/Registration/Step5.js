import React, {useState, useEffect} from "react";
import { Fragment } from 'react';
import { CheckIcon, XIcon, ChevronRightIcon} from "@heroicons/react/solid";
import { Link } from "@inertiajs/inertia-react";
import axios from "axios";
import { Inertia } from '@inertiajs/inertia';

const tiers = [
    { name: 'Lite', href: '#', priceMonthly: 0, currency: '€',description: '' , original: 'lite', label : 'Lite'},
    { name: 'Pro', href: '#', priceMonthly: 49, currency: '€',description: '' , original: 'pro', label : 'Pro'},
    {name: 'Business', href: '#', priceMonthly: 99, currency: '€', description: '', original: 'business', label : 'Business'},
];

const sections = [
    { label: 'Max Social Accounts per Channel (e.g 1 WABA, 1 IG, 1FB)', name:'accounts' },
    { label: 'Max User per Workspace',name: 'users' },
    { label: 'Automations - Workflow Builder', name: 'workflow' },
    { label: 'Sales Opportunities',  name: 'opportunities' },
    { label: 'Sales Category',name: 'category' },
    { label: 'Sales Orders',name: 'orders' },
];

function classNames(...classes) {
   return classes.filter(Boolean).join(' ')
}

export default function Step5 (props) {

    const [plans, setPlans] = useState();

    useEffect( () => {
        getPlanDetails();
    },[]);

    function Subscribe(plan_id, name){
       
        let confirm = window.confirm(['Are you sure to subscribe this plan']);
        if(!confirm) {
            return;
        }
        if(name == 'Lite') {
            props.setOpenTab(4);
            props.setStripe(true);
            return false;
        }

        if(!props.stripe) {
           props.setOpenTab(4);
           return false;
        }

        Inertia.post(route('subscribe_plan',{'plan': plan_id}), {user_id: props.user.user_id, is_register_step: true }, {
            onSuccess: (response) => {
                props.setOpenTab(5);
            }
        });
    }

    function getPlanDetails() {

        var url = route('get_plan');
        axios.get(url).then( (response) => {
            if(response.data){
                setPlans(response.data.plans);
            }
        });
    }

    return (
        <div className="h-full w-full bg-blue-50 flex justify-center items-center">
            <div className="max-w-7xl flex mx-auto items-center px-10">
                <div className="w-full bg-white flex justify-center py-8 rounded-xl px-4 lg:px-10 shadow-2xl">
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
                                        {plans && plans.map( (plan) => (
                                            <th
                                            key={plan.id}
                                            className="w-1/5 px-6 pb-4 text-center text-lg font-medium leading-6 text-gray-900"
                                            scope="col"
                                        >
                                            <p className="px-6 py-2 rounded">
                                                {plan.plan}
                                            </p>
                                        </th>
                                        ))}
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 border-t border-gray-200">
                                     {sections.map( (section) => (
                                        <Fragment key={section.name}>
                                            <tr key={section.name}>
                                            <th className="py-5 px-6 text-left text-sm font-normal text-gray-500" scope="row">
                                                {section.label}
                                            </th>
                                            {plans && plans.map( (plan) => {
                                                let value = plan[section.name];
                                                
                                                if(value == 'true') {
                                                    value = <CheckIcon className="h-5 w-5 text-green-500" aria-hidden="true" />
                                                }else if(value == 'false') {
                                                    value =  <XIcon className="h-5 w-5 text-red-900" aria-hidden="true" />
                                                }

                                                return(
                                                    <td key={plan.name} className="py-5 px-6">
                                                        {value}
                                                    </td>
                                                )
                                            })}
                                            </tr>
                                        </Fragment>
                                     ))}
                                     <tr>
                                        <th className="py-8 px-6 text-left align-top text-sm font-medium text-gray-900" scope="row">
                                        Pricing
                                        </th>
                                        {plans && plans.map( (plan) => (
                                          <td key={plan.id} className="h-full py-8 px-6 align-top">
                                            <div className="relative table h-full">
                                            <p>
                                                <span className="text-3xl font-bold tracking-tight text-gray-900">{plan.price} {plan.currency}</span>{' '}
                                                <span className="text-base font-medium text-gray-500">/{plan.period}</span>
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
                                           See plan and prices in details
                                            <span className="flex justify-end pt-1"><ChevronRightIcon className="h-4 w-4"/></span>
                                        </Link>
                                        </th>
                                        {plans && plans.map( (plan) => (
                                          <td key={plan.id} className="px-6 pt-5">
                                             <button
                                                 className={classNames(
                                                     plan.price == '0'
                                                     ?"block w-full rounded-md border border-indigo-800 bg-indigo-600 py-2 text-center text-sm font-semibold text-white hover:bg-gray-900"
                                                     :"block w-full rounded-md border border-gray-800 bg-gray-800 py-2 text-center text-sm font-semibold text-white hover:bg-gray-900"
                                                 )}
                                                 onClick={() => Subscribe(plan.plan_id, plan.plan)}
                                             >
                                                {plan && plan.plan == 'Lite' && plan.price == '0' ? 'Start from free' : <>Buy {plan.plan}</>}
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
                                onClick={() => props.setOpenTab(4)}
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