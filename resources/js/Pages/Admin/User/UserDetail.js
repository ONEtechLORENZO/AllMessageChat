import React, {useState} from 'react';
import Authenticated from '@/Layouts/Authenticated';
import { Head, Link } from '@inertiajs/inertia-react';
import Moment from 'moment';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

export default function UserDetail(props) {

    const fieldList = [
        {value: props.user.name, label: 'Name'},
        {value: props.user.email, label: 'Email'},
        {value: props.user.role, label: 'Role'},
        {value: props.token, label: 'Token' , action:'regenarate'},
        {value: (props.user.status == 1) ? 'Active': 'Inactive', label: 'Active Status'},
        {value: Moment(props.user.created_at).format('MMM DD, Y'), label: 'Created At'},
    ];
    const [spinClass , setSpinClass] = useState([]);
    const [token , setToken ]= useState(props.token);
    
    // Update Token
    function updateToken(){
        confirmAlert({
            title: 'Confirm to change the token',
            message: 'Are you sure to do this.',
            buttons: [
                {
                    label: 'Yes',
                    onClick: () => {
                        setSpinClass('animate-spin');

                        axios({
                            method: 'post',
                            url: route('regenerate_token'),
                            data: {
                                user_id: props.user.id,
                            }
                        })
                        .then( (response) =>{
                            setToken(response.data.token);
                            setSpinClass(' ');
                        });
                    }
                },    
                {
                    label: 'No',
                   onClick: () => '',
                }
        ]
    });

    }

    return (
        <Authenticated
            auth={props.auth}
            errors={props.errors}
            header={<div className="flex justify-between"> 
                <div> 
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">Users</h2>
                </div> 
                <div>
                <Link
                    href={"/admin/user/edit/" + props.user.id}
                    className='ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                >
                    Edit User
                </Link>
                </div> 
            </div>}
        >
        <Head title="User Detail" />

            <div class="mt-6 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                  <dl class="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                    {fieldList && fieldList.map((field) => {
                      return (
                          <>
                          <div class="sm:col-span-1">
                            <dt class="text-sm font-medium text-gray-500">
                              {field.label}
                            </dt>
                            <dd class="mt-1 text-sm text-gray-900">
                                { field.hasOwnProperty('action') ?
                                    <>
                                    {token}
                                    <span class="cursor-pointer" title="Regenarate Token">
                                        <svg xmlns="http://www.w3.org/2000/svg" onClick={updateToken} class={"h-5 w-5 " + spinClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                    </span>
                                    </>
                                : <> {field.value} </>
                                }

                            </dd>
                          </div>
                          </>
                        )
                    })}
                  </dl>
                </div>

        </Authenticated>
    );
}
