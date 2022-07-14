import React from 'react';
import Authenticated from "../../Layouts/Authenticated";
import Pagination from "../../Components/Pagination";

function MessageListing(props) 
{
    return (
        <Authenticated>
            <div className="px-4 sm:px-6 lg:px-8 bg-[#FBFBFBBF]">
                <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">Messages</h2>
                </div>
                <div className="mt-8 flex flex-col">
                    <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                                <table className="min-w-full divide-y divide-[#D9D9D9]">
                                    <thead>
                                        <tr>
                                            {Object.entries(props.list_view_columns).map(([name, label]) => (
                                                <th
                                                    key={name}
                                                    scope="col"
                                                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-[#3D4459] sm:pl-6"
                                                >
                                                    {label}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className=" bg-white">
                                        {Object.entries(props.messsage_list).map(([key, message]) => (
                                            <tr key={key}>
                                                {Object.entries(props.list_view_columns).map(([name, label], k) => (
                                                    <>
                                                        {name == 'status' ?
                                                            <td className="whitespace-nowrap px-2 py-2 text-sm text-[#3D4459]">
                                                              
                                                                {message[name] == 'Queued' && 
                                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800"> {message[name]} </span>
                                                                || message[name] == 'Failed' &&
                                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800"> {message[name]} </span>
                                                                || <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800"> {message[name]} </span>
                                                                } 
                                                            </td>
                                                        :
                                                            <td className="whitespace-nowrap px-2 py-2 text-sm text-[#3D4459]">
                                                                {message[name]} 
                                                            </td>
                                                        }
                                                    </>
                                                ))}
                                            </tr>
                                        ))}

                                        {Object.entries(props.messsage_list).length == 0 &&
                                            <tr>
                                                <td colspan={Object.entries(props.list_view_columns).length} >
                                                    <div className="relative px-6 py-5 flex items-center space-x-3 hover:bg-gray-50 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary">
                                                        No messages sent/received yet for your account(s).
                                                    </div>
                                                </td>   
                                            </tr>
                                        }
                                    </tbody>
                                </table>
                            </div>

                            <Pagination paginator={props.paginator} />
                            
                        </div>
                    </div>
                </div>
            </div>
        </Authenticated>
    );
}

export default MessageListing;