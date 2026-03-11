import React ,{ useEffect } from 'react';
import Authenticated from '@/Layouts/Authenticated';
import { Head, Link } from '@inertiajs/react';
import Moment from 'moment';
import ListViewTable from "@/Components/Views/List/ListViewTable";

function Dashboard(props) 
{
    const userHeaders = {
        name: { label: 'Name', type: 'text' },
        email: { label: 'Email', type: 'text' },
        status: { label: 'status', type: 'text' },
        role: { label: 'role', type: 'text' },
        created_at: { label: 'create at', type: 'text' },
    };

    function removeUser(id)
    {
        axios.get("user/delete", {
            params:{'id': id}
        })
        .then(res => {
            window.location.reload();
        })
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
                { props.auth.user.role == 'Admin' &&
                <Link
                    href={route('create_user')}
                    className='ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                >
                    Create new User
                </Link>
                }
                </div> 
            </div>}
        >
        <Head title="Users" />

        <div className="">
        <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col">
              <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                  <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                    <ListViewTable
                        records={props.users.data}
                        customHeader={userHeaders}
                        fetchFields={false}
                        hideToolMenu={true}
                        disableSorting={true}
                        theme="light"
                        forceActionColumn={true}
                        renderCell={({ name, record }) => {
                            if (name === "name") {
                                return (
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                            <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gray-500">
                                                <span className="text-xl font-medium leading-none text-white">
                                                    {record.name[0]}
                                                </span>
                                            </span>
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">
                                                <Link href={route('detailUser', [record.id])}>
                                                    {record.name}
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }

                            if (name === "status") {
                                return record.status != 0 ? (
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                        Active
                                    </span>
                                ) : (
                                    <span className="px-2 inline-flex text-xs leading-5 text-black-800">
                                        Inactive
                                    </span>
                                );
                            }

                            if (name === "created_at") {
                                return Moment(record.created_at).format('MMM DD, Y');
                            }
                        }}
                        renderActionCell={({ record }) => (
                            <div className="-mt-px flex divide-x divide-gray-200 justify-end">
                                <Link href={route('editUser', [record.id])} className="px-2 text-indigo-600 hover:text-indigo-900">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                </Link>
                                <a href="#" onClick={() => { if (window.confirm('Do you want delete the user?')) { removeUser(record.id); } }} className="px-2 text-indigo-600 hover:text-indigo-900">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </a>
                            </div>
                        )}
                    />
                  </div>
                </div>
              </div>
            </div>
             </div>
              </div>
            </div>
        </div>
        </Authenticated>

    );
}

export default Dashboard;












