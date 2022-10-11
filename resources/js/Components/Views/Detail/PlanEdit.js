import React, {useEffect, useState} from "react";
import Input from "@/Components/Forms/Input";
import { PencilIcon } from "@heroicons/react/outline";
import notie from 'notie';
import { Inertia } from "@inertiajs/inertia";

const planfields = [
    {
        group: 'Features',
        features: [
        { name: 'target', label: 'Target'},
        { name: 'setup_workspace', label: 'Setup per Workspace'},
        { name: 'monthly_workspace', label: 'Fee per Workspace'},
        { name: 'channels', label: 'Included Channels'},
        { name: 'accounts', label: 'Max Social Accounts per Channel'},
        { name: 'offical_whatsapp', label: 'Official Whatsapp Business API'},
        { name: 'unoffical_whatsapp', label: 'UnOfficial Whatsapp Business API'},
        { name: 'facebook', label: 'Account Facebook e Instagram'},
        { name: 'users', label: 'Max Users'},
        { name: 'include_users', label: 'User Include'},
        { name: 'extra_users', label: 'Extra Users'},
        { name: 'crm_contacts', label: 'CRM Contacts'},
    ]
    },
    {
        group: 'Message Costs',
        features: [
            { name: 'chat_cost', label: 'Chat Cost (for WABA Only)'},
            { name: 'per_message', label: 'Cost per Message'},
            { name: 'per_allegato', label: 'Cost per Allegato'},
            { name: 'fatturazione', label: 'Ciclo di fatturazione'}
        ]
    },
    {
        group: 'Altre Funzionalità',
        features: [
            { name: 'contacts', label: 'Contacts'},
            { name: 'lists_tags', label: 'Lists & Tags'},
            { name: 'custom_fields', label: 'Custom Fields'},
            { name: 'multichannel_chat', label: 'MultiChannel Chat'},
            { name: 'campaigns', label: 'Broadcast Campaigns'},
            { name: 'workflow', label: 'Automations - Workflow Builder'},
            { name: 'opportunities', label: 'Sales Opportunities'},
            { name: 'category', label: 'Sales Category'},
            { name: 'orders', label: 'Sales Orders'},
            { name: 'lead_webhook', label: 'Receive Lead Via Webhook'},
            { name: 'integrations', label: 'Zapier Integrations'},
            { name: 'api', label: 'API'},
            { name: 'custom_integrations', label: 'Custom Integrations'},
        ]
    },
];

const allowfields = [
    { id: 'true', title: 'Allow' },
    { id: 'false', title: 'Not Allow' },
    { id: '', title: 'Manual' },
];

export default function SubscriptionPlan (props) {

    const [view, setView] = useState('detail');
    const [subscriptionPlan, setSubscriptionPlan] = useState(props.subscriptionPlan);
    const [data, setData] = useState({});

    useEffect( () => {
        if(props.subscriptionPlan) {
            setData(props.subscriptionPlan);
        }
    },[subscriptionPlan])

    function planHandler (event) {
        let newData = Object.assign({}, data);
        const name = event.target.name;
        const value = event.target.value;
        newData[name] = value;
        setData(newData);
    }

    function configHandler (name, value) {
        let newData = Object.assign({}, data);
        newData[name] = value;
        setData(newData);
    }

    // Change of view
    function viewHandler (view) {
        if(view == 'detail') { 
            if(!data.id) {
                setData({});
            } else {
                setData(subscriptionPlan);
            }
        }  
        setView(view);
    }

    function savePlan () {
        let validate = true;

        (planfields).map( (plan) => (
            (plan.features).map( (field) => {
                if(!data[field.name] && validate) {
                   validate = false;
                }
            })
        ));

        if(!validate) {
            notie.alert({type: 'error', text: 'Please fill all the field', time: 5});
            return false;
        }

        // Insert plan name and id
        data['plan'] = props.record.name; 
        data['price'] = props.record.amount;
        data['plan_id'] = props.record.id; 
        
        Inertia.post(route('plan_save'), data, {
            onSuccess : (response) => {
                setSubscriptionPlan(data);
                setView('detail');
            }
        });
        
    }

    return(
        <div>
            <div className="flex justify-end">
                {view == 'detail' ? 
                  <div className="flex">
                    <button
                        type="button"
                        className="inline-flex items-center rounded-md border border-transparent bg-indigo-500 hover:bg-indigo-700 px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        onClick={() => viewHandler('edit')}
                    >
                        Edit
                        <span className="pl-2"><PencilIcon className="h-4 w-4"/></span>
                    </button>
                  </div>  
                : 
                  <div className="flex">
                    <div> 
                        <button
                            type="button"
                            className="inline-flex items-center rounded-md border border-transparent bg-indigo-500 hover:bg-indigo-700 px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            onClick={() => viewHandler('detail')}
                        >
                            Back
                        </button>
                    </div>
                    <div className="px-4">
                        <button
                            type="button"
                            className="inline-flex items-center rounded-md border border-transparent bg-green-500 hover:bg-green-700 px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            onClick={() => savePlan()}
                        >
                            Save
                        </button>
                    </div>
                  </div>  
                }
                
            </div>
            <div className="bg-gray-50">
                <dl className="text-gray-200">
                {planfields.map( (plans) => (
                     <>
                        <dt className="pt-2">
                         <span className="px-2 -mb-px font-semibold text-gray-800 rounded-t opacity-70">{plans.group}</span>
                        </dt>
                        <div> 
                            {(plans.features).map( (field) => {

                                let field_name = field.name;

                                return( 
                                    <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                        <dt className="text-sm font-medium text-gray-500"> {field.label} </dt>
                                        {view == 'edit' ? 
                                         <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 flex">
                                         {plans.group != 'Altre Funzionalità' ? 
                                           <div className="w-1/2">
                                             <Input
                                                 type="text"
                                                 className={`mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-skin-primary focus:border-skin-primary sm:text-sm`}
                                                 id={field_name}
                                                 name={field_name}
                                                 value={data[field_name] ? data[field_name] : ''}
                                                 handleChange={planHandler}
                                             />
                                           </div>
                                         : 
                                         <div>
                                             <fieldset className="mt-4">
                                                 <div className="space-y-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-10">
                                                     {allowfields.map((allow) => (
                                                         <div key={allow.id} className="flex items-center">
                                                             <input
                                                                 id={field_name}
                                                                 name={field_name}
                                                                 value={data[field_name] ? data[field_name] : ''}
                                                                 type="radio"
                                                                 defaultChecked={data && data[field_name] ? data[field_name] == allow.id : ''}
                                                                 className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                                 onChange={() => configHandler(field_name, allow.id)}
                                                             />
                                                             <label htmlFor={allow.id} className="ml-3 block text-sm font-medium text-gray-700">
                                                             {allow.title}
                                                             </label>
                                                         </div>
                                                     ))}
                                                     {data && (data[field_name] || data[field_name] == '' ) && (data[field_name] != 'true' && data[field_name] != 'false') ?
                                                       <div>
                                                         <Input
                                                             type="text"
                                                             className={`mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-skin-primary focus:border-skin-primary sm:text-sm`}
                                                             id={field_name}
                                                             name={field_name}
                                                             value={data[field_name] ? data[field_name] : ''}
                                                             handleChange={planHandler}
                                                         />
                                                       </div>
                                                     : ''}
                                                 </div>
                                             </fieldset>
                                          </div>
                                         }
                                         </dd>
                                        : 
                                         <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 flex">
                                            {subscriptionPlan && subscriptionPlan[field_name] ? subscriptionPlan[field_name] : '-'}
                                         </dd>    
                                        }
                                        
                                    </div>
                                )
                            })}
                        </div>
                     </>
                ))}    
                </dl>
            </div>
        </div>
    );
}