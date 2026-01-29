import React, {useEffect, useState} from "react";
import Workspace from "@/Pages/Plans/workspace";
import { TrashIcon } from '@heroicons/react/24/solid';
import { router as Inertia } from "@inertiajs/react";
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import notie from 'notie';

const workspacefield = [
    'name', 'email', 'company_country', 'currency'
];

export default function WorkspacePlan (props) {

    const [workspaces, setWorkspaces] = useState(props.workspaces);
    const [showWorkspace, setShowWorkSpace] = useState(false); 

    function deleteCustomPlan(company_id) {

        let data = {'company_id' : company_id, 'plan_id' : props.plan_id};

        confirmAlert({
            message: ('Are you sure you want to delete plan for this company?'),
            buttons: [
                {
                    label: ('Confirm'),
                    onClick: () => {
                        Inertia.post(route('delete_customplan'), data, {
                            onSuccess: (response) => {
                                if(response){
                                    setWorkspaces(response.props.workspaces);
                                    notie.alert({ type: 'success', text: 'Successfully delete custom plan for this comapany', time: 5 });
                                }
                            }
                        });
                    }
                }, {
                    label: 'No',
                }]
        });
    }

    return(
        <div>
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="sm:flex sm:items-center">
                    <div className="sm:flex-auto">
                    {/* <h1 className="text-xl font-semibold text-gray-900">Plan related Workspace</h1> */}
                    </div>
                    <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                    <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
                        onClick={() => setShowWorkSpace(true)}
                    >
                        Workspace
                    </button>
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
                                 Workspace Name
                                </th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                 Email
                                </th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                 Country
                                </th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                 Currency
                                </th>
                                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                 <span className="sr-only">Edit</span>
                                </th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {workspaces && workspaces.map( (workspace) => (
                                    <tr key={workspace.id}>
                                    {workspacefield.map( (field) => (
                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                            {workspace[field]}
                                        </td>
                                    ))}
                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                           <TrashIcon className='h-4 w-4 text-red-600 cursor-pointer' onClick={() =>deleteCustomPlan(workspace.id)} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        </div>
                    </div>
                    </div>
                </div>
            </div>

            {showWorkspace &&
             <Workspace 
              plan_id={props.plan_id}
              setWorkspaces={setWorkspaces}
              setShowWorkSpace={setShowWorkSpace}
             />
            }
        </div>
    );
}












