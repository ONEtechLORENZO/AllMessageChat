import React ,{useEffect, useState}from "react";
import Authenticated from "../../Layouts/Authenticated";
import Input from "@/Components/Forms/Input";
import { PencilIcon, CheckIcon, XIcon } from "@heroicons/react/solid";
import { Inertia } from "@inertiajs/inertia";
import { Link } from "@inertiajs/inertia-react";

const planfields = [
    { label: 'Target', name:'target'},
    { name: 'setup_workspace', label: 'Setup per Workspace'},
    { name: 'monthly_workspace', label: 'Fee per Workspace'},
    { label: 'Included Channels', name:'channels'},
    { name: 'accounts', label: 'Max Accounts'},
    { label: 'Official Whatsapp Business API', name:'offical_whatsapp'},
    { label: 'UnOfficial Whatsapp Business API', name:'unoffical_whatsapp'},
    { label: 'Account Facebook e Instagram', name:'facebook'},
    { name: 'users', label: 'Max Users'},
    { name: 'include_users', label: 'User Include'},
    { name: 'extra_users', label: 'Extra Users'},
    { label: 'CRM Contacts', name:'crm_contacts'},
    { label: 'Chat Cost (for WABA Only)', name:'chat_cost'},
    { name: 'per_message', label: 'Per Message'},
    { name: 'per_allegato', label: 'Per Allegato'},
    { label: 'Ciclo di fatturazione', name:'fatturazione'},
    { label: 'Contacts', name:'contacts'},
    { label: 'Lists & Tags', name:'lists_tags'},
    { label: 'Custom Fields', name:'custom_fields'},
    { label: 'MultiChannel Chat', name:'multichannel_chat'},
    { label: 'Broadcast Campaigns', name:'campaigns'},
    { name: 'workflow', label: 'Workflow Builder'},
    { label: 'Sales Opportunities', name:'opportunities'},
    { label: 'Sales Category', name:'category'},
    { label: 'Sales Orders', name:'orders'},
    { label: 'Receive Lead Via Webhook', name:'lead_webhook'},
    { label: 'Zapier Integrations', name:'integrations'},
    { label: 'API', name:'api'},
    { label: 'Custom Integrations', name:'custom_integrations'}
    
];

export default function PlanController (props) {

    const [plans, setPlans] = useState([]);
    const [temp, setTemp] = useState({});

    useEffect ( () => {
        setPlans(props.plans)
    },[props]);

    function placeHandler (event) {
        let newPlan = Object.assign({} ,temp);
        let value = event.target.value;
       
        newPlan['value'] = value;
        setTemp(newPlan);
    }
    
    function editPlan(plan, name, value) {
        let newPlan = Object.assign({} ,temp);
        newPlan['id'] = plan;
        newPlan['name'] = name;
        newPlan['value'] = value;
        setTemp(newPlan);
    }

    function cancelPlan () {
        setTemp({});
    }

    function savePlan() {

        if(!temp.value){
            temp['value'] = '-';
        } 

        Inertia.post(route('subscription_save'), temp, {
            onSuccess: (response) => {
                setTemp({});
            }
        });

    }

    return (
        <Authenticated
            auth={props.auth}
            errors={props.errors}
        >
          <div>
            <div className="px-4 sm:px-6 lg:px-8 h-screen">
                <div className="grid grid-cols-2">
                    <div className="flex content-start">
                      <h1 className="text-xl font-semibold text-gray-900">Plan Details</h1>
                    </div>
                    <div className="flex justify-end">
                        <Link
                            href={route('updateSubscription')}
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gray-200 hover:bg-gray-500 hover:text-white text-base font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                            >
                            Go Back
                        </Link>
                    </div>
                </div>
                <div className="mt-8 flex flex-col">
                    <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-300">
                            <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                Name
                                </th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                Lite
                                </th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                Pro
                                </th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                Business
                                </th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                Enterprise
                                </th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {planfields.map((field) => (
                                    <tr key={field.name}>
                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{field.label}</td>
                                    {Object.entries(plans).map(([key,plan]) => {
                                        return (
                                         <td key={key} className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 w-56">
                                           {temp && temp['id'] == plan.id && temp['name'] == field.name?
                                                <div className="flex w-full">
                                                    <Input
                                                        type="text"
                                                        className={`mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-skin-primary focus:border-skin-primary sm:text-sm`}
                                                        id={key}
                                                        name={field.name}
                                                        value={temp.value}
                                                        handleChange={placeHandler}
                                                    />
                                                    <div className="px-2 py-4 text-gray-900"><CheckIcon className="h-4 w-4 text-green-900"  onClick={() => savePlan()}/></div>
                                                    <div className="px-2 py-4 text-gray-900"><XIcon className="h-4 w-4 text-red-900"  onClick={() => cancelPlan()}/></div>
                                                </div> 
                                            : 
                                                <div className="flex w-40">
                                                  <div className="flex truncate">
                                                   {plan[field.name]}
                                                  </div>   
                                                  <div className="flex">
                                                     <span className="px-2"><PencilIcon className="h-4 w-4" onClick={() => editPlan(plan.id, field.name, plan[field.name])}/></span>
                                                  </div>
                                                </div>
                                            }
                                            </td>
                                        )
                                    })}
                                    </tr>
                                ))} 
                            </tbody>
                        </table>
                        </div>
                    </div>
                    </div>
                </div>
            </div>
          </div>
        </Authenticated>
    );
}