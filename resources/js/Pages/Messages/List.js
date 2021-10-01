import React ,{ useEffect } from 'react';
import Authenticated from '@/Layouts/Authenticated';
import { Head, Link } from '@inertiajs/inertia-react';
import { ChatAlt2 } from '@heroicons/react/solid'

import Moment from 'moment';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Dashboard(props) {

  // Delete Record 
  function removeToCollection(id){
    axios.delete("/admin/user/delete", {
      params:{'id': id}
    })
    .then(res => {
      console.log(res,'Deleted Successfully.');
    })
  }

    const listColumn = [
        {label: 'Time'},
        {label: 'Account'},
        {label: 'Chennel'},
        {label: 'Message Content'},
        {label: 'Direction'},
        {label: 'Sender'},
        {label: 'Country'},
        {label: 'Recipient'},
        {label: 'Status'},
    ];

 
    return (
        <Authenticated
            auth={props.auth}
            errors={props.errors}
            header={<div className="flex justify-between"> 
                <div> 
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">Message Log</h2>
                </div> 
                <div>
                
                </div> 
            </div>}
        >
        <Head title="Message Log" />

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
                        {props.messages.map((message) => (
                          <tr key={message.name}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-500">
                                    <Link href={"/admin/user/" +message.id }> {Moment(message.created_at).format(' DD-MM-Y hh:mm:ss')} </Link>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap ">
                              <div className="text-sm text-gray-500">{message.account_id}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                {message.channel}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"> 
                              {message.content}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-gray-500 text-sm font-medium">
                              {message.direction}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-gray-500 text-sm font-medium">
                              {message.sender}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-gray-500 text-sm font-medium">
                              {message.country}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-gray-500 text-sm font-medium">
                              {message.recipient}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                {message.status}
                              </span>  
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
