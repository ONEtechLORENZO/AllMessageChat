import { SettingIcon } from "./icons";
import React ,{ useEffect , useState , Fragment} from 'react';
import { Head, useForm, Link, InertiaLink } from '@inertiajs/inertia-react';
import { SearchIcon } from "@heroicons/react/outline";
import Authenticated from "../../Layouts/Authenticated";


export default function Messages(props) {
    const fieldList = {
        'id': 'ID',
        'content': 'Content',
        'account_name': 'Account name',
        'mode': 'Mode',
        'sender': 'Sender',
        'destination': 'Destination',
        'status': 'Status',
        'date': 'Date'
    }
    const[messages, setMessages] = useState(props.messsage_list);
    const[pageInfo, setPageInfo] = useState(props);

    return (
        <Authenticated>
            <div className="px-4 sm:px-6 lg:px-8 bg-[#FBFBFBBF]">
                <div className="mt-8 flex flex-col">
                    <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                                <table className="min-w-full divide-y divide-[#D9D9D9]">
                                    <thead>
                                        <tr>
                                            {Object.entries(fieldList).map(([name, label], j) => (
                                                <th
                                                    scope="col"
                                                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-[#3D4459] sm:pl-6"
                                                >
                                                    {label}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className=" bg-white">
                                        {Object.entries(messages).map(([key, message], j) => (

                                            <tr key={key}>
                                                {Object.entries(fieldList).map(([name, label], k) => (
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
                                        {Object.entries(messages).length == 0 &&
                                            <tr><td className = "" colspan={Object.entries(fieldList).length} >
                                                <div className="relative px-6 py-5 flex items-center space-x-3 hover:bg-gray-50 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary">
                                                    Messages not yet created.
                                                </div>
                                            </td></tr>
                                        }
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div class="p-5 text-center" >
                                <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                <Link
                                    href= { pageInfo.currentPage != 1 ?
                                          "messages?page=1" 
                                        : '#' 
                                    }    
                                    class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-100"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                                    </svg>
                                </Link>
                                <Link
                                    href= { pageInfo.currentPage != 1 ?
                                         "messages?page=" + (parseInt(pageInfo.currentPage) - 1) 
                                        : '#'
                                    }    
                                    class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-100"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                                    </svg>
                                  </Link>

                                  <span
                                    class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-100"
                                >
                                   {((pageInfo.currentPage - 1) * pageInfo.limit) +1 } - {pageInfo.currentPage * pageInfo.limit} of {pageInfo.totalMessages}
                                  </span>

                                  <Link
                                    href= {  Math.ceil(pageInfo.totalMessages / pageInfo.limit) != pageInfo.currentPage ?
                                          "messages?page=" + (parseInt(pageInfo.currentPage) + 1) 
                                        :  '#' 
                                    }

                                    class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-100"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                  </Link>
                                  <Link
                                    href= {  Math.ceil(pageInfo.totalMessages / pageInfo.limit) != pageInfo.currentPage ?
                                          "messages?page=" + Math.ceil(pageInfo.totalMessages / pageInfo.limit)
                                        : '#' 
                                    }
                                    class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                                    </svg>
                                  </Link>

                                </nav>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </Authenticated>
    );
}
