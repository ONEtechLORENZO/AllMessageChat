import React from 'react';
import Authenticated from '@/Layouts/Authenticated';
import { Head, Link } from '@inertiajs/inertia-react';
import Moment from 'moment';

export default function UserDetail(props) {
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
                    
                      <div class="sm:col-span-1">
                        <dt class="text-sm font-medium text-gray-500">
                          Name
                        </dt>
                        <dd class="mt-1 text-sm text-gray-900">
                          {props.user.name}
                        </dd>
                      </div>
                    
                      <div class="sm:col-span-1">
                        <dt class="text-sm font-medium text-gray-500">
                          Email
                        </dt>
                        <dd class="mt-1 text-sm text-gray-900">
                            {props.user.email}
                        </dd>
                      </div>
                    
                      <div class="sm:col-span-1">
                        <dt class="text-sm font-medium text-gray-500">
                          Role
                        </dt>
                        <dd class="mt-1 text-sm text-gray-900">
                          {props.user.role}
                        </dd>
                      </div>
                    
                      <div class="sm:col-span-1">
                        <dt class="text-sm font-medium text-gray-500">
                          Active Status
                        </dt>
                        <dd class="mt-1 text-sm text-gray-900">
                         {props.user.status ? 'Active' : 'Inactive' }
                        </dd>
                      </div>
                    
                      <div class="sm:col-span-1">
                        <dt class="text-sm font-medium text-gray-500">
                          Created At
                        </dt>
                        <dd class="mt-1 text-sm text-gray-900">
                          {Moment(props.user.created_at).format('MMM DD, Y')}
                        </dd>
                      </div>
                    
                  </dl>
                </div>

        </Authenticated>
    );
}
