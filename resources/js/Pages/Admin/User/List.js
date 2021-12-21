import React ,{ useEffect } from 'react';
import Authenticated from '@/Layouts/Authenticated';
import { Head, Link } from '@inertiajs/inertia-react';
import Moment from 'moment';

export default function Dashboard(props) {

  // Delete Record 
  function removeUser(id){
    axios.get("user/delete", {
      params:{'id': id}
    })
    .then(res => {
      window.location.reload();
    })
  }

    const listColumn = [
        {label: 'Name'},
        {label: 'Email'},
        {label: 'status'},
        {label: 'role'},
        {label: 'create at'},
        {label: 'action'},
    ];

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
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col">
              <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                  <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          { listColumn && listColumn.map((column) => {
                            return(
                                <>
                                  <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                  >
                                    {column.label}
                                  </th>
                                </>
                              )
                          })}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {props.users.map((person) => (
                          <tr key={person.name}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                    <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gray-500">
                                        <span className="text-xl font-medium leading-none text-white">{person.name[0]}</span>
                                    </span>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    <Link  href={route('user_detail' , [person.id])} > {person.name} </Link>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{person.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {person.status != 0
                                  ? <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800"> Active </span>
                                  : <span className="px-2 inline-flex text-xs leading-5 text-black-800"> Inactive </span>
                                }
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{person.role}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"> 
                              {Moment(person.created_at).format('MMM DD, Y')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="-mt-px flex divide-x divide-gray-200">
                              <Link href={route('edit_user' , [person.id])} className="px-2 text-indigo-600 hover:text-indigo-900">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                              </Link>

                              <a href='#' onClick={() => {if(window.confirm('Do you want delete the user?')){removeUser(person.id)};}} className="px-2 text-indigo-600 hover:text-indigo-900" >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </a>
                              </div>
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
              </div>
            </div>
        </div>
        </Authenticated>

    );
}
