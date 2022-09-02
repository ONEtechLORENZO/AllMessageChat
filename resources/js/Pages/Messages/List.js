import React ,{ useEffect , useState } from 'react';
import Authenticated from '@/Layouts/Authenticated';
import { Head, Link } from '@inertiajs/inertia-react';
import { ChatAlt2 } from '@heroicons/react/solid'
import Pagination from "react-js-pagination";
import Dropdown from '@/Components/Forms/Dropdown';

import Moment from 'moment';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Dashboard(props) {


    const listColumn = [
        {label: 'Time'},
        {label: 'Account'},
        {label: 'Message Content'},
        {label: 'Direction'},
        {label: 'Sender'},
///        {label: 'Country'},
        {label: 'Recipient'},
        {label: 'Status'},
    ];
    
    const [messages , setMessages ]= useState(props.messages);
    const [searchKey , setSearchKey] = useState({
        messageStatus: '',
        messageDirection: '',
        messageContent: ''
    });
    
    const messageStatus = [
        {value: 'Delivered' , label: 'Delivered'},
        {value: 'Queued' , label: 'Queued'},
        {value: 'Failed' , label: 'Failed' }
    ];
    const messageDirection = [
        {value: "Out" , label: 'Out'},
        {value: "In" , label: 'In'}
    ];

    const [pageInfo , setPageInfo] = useState({
        currentPage: props.currentPage,
        totalMessages: props.totalMessages,
        limit: props.limit,
    });

    // List messages based on Key
    function searchKeyChangeEvent(event){
        const name = event.target.name;
        const value = event.target.value;
        
        let newState = Object.assign({}, searchKey);
        newState[name] = value;
        
        setSearchKey(newState);
    }
    function applySearchValue(){
        axios({
            method: 'post',
            url: route('searchContent'),
            data: {
                key: searchKey
            }
        })
        .then( (response) =>{
            setMessages( response.data.messages );
            setPageInfo(response.data);
        });

    }

    return (
        <Authenticated
            auth={props.auth}
            errors={props.errors}
            header={<div className="flex justify-between"> 
                <div> 
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">Message Log</h2>
                </div> 
                <div class="grid grid-cols-1 gap-5 sm:grid-cols-3 w-1/2">
                    <div class="">
                        <Dropdown
                            required={false}
                            id="messageDirection"
                            name="messageDirection"
                            handleChange={searchKeyChangeEvent}
                            options={messageDirection}
                            value={searchKey.messageDirection}
                            />

                    </div>
                    <div class=""> 
                        <Dropdown
                            required={false}
                            id="status"
                            name="messageStatus"
                            handleChange={searchKeyChangeEvent}
                            options={messageStatus}
                            value={searchKey.messageStatus}
                            />
                    </div>
                    <div className="relative flex items-stretch flex-grow focus-within:z-10">
                    <input type="text" name="messageContent" value={searchKey.messageContent} onChange={(e) => searchKeyChangeEvent(e)} className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md" id="search-content" /> 
                    <button
                        onClick={applySearchValue}
                        type="button"
                        className="relative inline-flex items-center ml-2 space-x-2 px-4 py-2 border border-blue-300 text-sm font-medium rounded-md text-gray-700 bg-blue-50 hover:bg-blue-400 hover:text-white-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <span>Search</span>
                    </button>
                    </div>
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
                    <table className="min-w-full divide-y divide-gray-200 table-auto">
                      <thead className="bg-gray-50">
                        <tr>
                          { listColumn && listColumn.map((column) => {
                            return(
                                <>
                                  <th
                                    scope="col"
                                    className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider"
                                  >
                                    {column.label}
                                  </th>
                                </>
                              )
                          })}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {messages.data.map((message) => (
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
                              <div className="text-sm text-gray-500">{message.display_name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" title={message.content}> 
                              {( (message.content.length ) > 20) ? 
                                <>  {message.content.substring( 0, 20 ) + '...'} </>
                                : <> {message.content} </>
                              }
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-gray-500 text-sm font-medium">
                              {message.direction}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-gray-500 text-sm font-medium">
                              {message.sender}
                            </td>
                            {/*
                            <td className="px-6 py-4 whitespace-nowrap text-right text-gray-500 text-sm font-medium">
                              {message.country}
                            </td>
                            */}
                            <td className="px-6 py-4 whitespace-nowrap text-right text-gray-500 text-sm font-medium">
                               {message.destinations}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                {message.status == 'Queued' && 
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800"> {message.status} </span>
                                  || message.status == 'Failed' &&
                                     <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800"> {message.status} </span>
                                  || <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800"> {message.status} </span>
                                } 
                            </td>
                            </tr>
                        ))}
                        {messages.data.length == 0 && 
                            <tr> <td colspan="4" class="p-4"> <span class="px-6 py-4 whitespace-nowrap text-right text-gray-500 text-sm font-medium"> No conversation start yet. </span> </td></tr> 
                        } 
                      </tbody>
                    </table>
                  </div>

                            <div class="p-5 text-center" >
                                <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                <Link
                                    href= { pageInfo.currentPage != 1 ?
                                          "list?page=1" 
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
                                         "list?page=" + (parseInt(pageInfo.currentPage) - 1) 
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
                                          "list?page=" + (parseInt(pageInfo.currentPage) + 1) 
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
                                          "list?page=" + Math.ceil(pageInfo.totalMessages / pageInfo.limit)
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
              </div>
            </div>
        </div>
        </Authenticated>

    );
}
