import React ,{ useEffect , useState } from 'react';
import Authenticated from '@/Layouts/Authenticated';
import { Head, Link } from '@inertiajs/react';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid'
import Pagination from "react-js-pagination";
import Dropdown from '@/Components/Forms/Dropdown';
import ListViewTable from '@/Components/Views/List/ListViewTable';

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

    const messageHeaders = {
        created_at: { label: 'Time', type: 'text' },
        display_name: { label: 'Account', type: 'text' },
        content: { label: 'Message Content', type: 'text' },
        direction: { label: 'Direction', type: 'text' },
        sender: { label: 'Sender', type: 'text' },
        destinations: { label: 'Recipient', type: 'text' },
        status: { label: 'Status', type: 'text' },
    };

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
                    <h2 className="font-semibold text-xl text-white leading-tight">Message Log</h2>
                </div> 
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 w-1/2">
                    <div className="">
                        <Dropdown
                            required={false}
                            id="messageDirection"
                            name="messageDirection"
                            handleChange={searchKeyChangeEvent}
                            options={messageDirection}
                            value={searchKey.messageDirection}
                            />

                    </div>
                    <div className=""> 
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
                    <input type="text" name="messageContent" value={searchKey.messageContent} onChange={(e) => searchKeyChangeEvent(e)} className="shadow-sm bg-[#0F0B1A] text-white placeholder-[#878787] focus:ring-[#BF00FF]/60 focus:border-[#BF00FF]/60 block w-full sm:text-sm border-white/10 rounded-md" id="search-content" /> 
                    <button
                        onClick={applySearchValue}
                        type="button"
                        className="relative inline-flex items-center ml-2 space-x-2 px-4 py-2 border border-[#BF00FF]/50 text-sm font-medium rounded-md text-white bg-[#BF00FF] hover:bg-[#9c00d9] focus:outline-none focus:ring-1 focus:ring-[#BF00FF]/60 focus:border-[#BF00FF]/60"
                    >
                        <span>Search</span>
                    </button>
                    </div>
                </div> 
            </div>}
        >
        <Head title="Message Log" />

        <div className="">
        <div className="bg-[#120b1f]/80 border border-white/10 overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.35)] rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col">
              <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                  <div className="shadow overflow-hidden border-b border-white/10 sm:rounded-lg">
                    <ListViewTable
                        records={messages.data}
                        customHeader={messageHeaders}
                        fetchFields={false}
                        hideToolMenu={true}
                        disableSorting={true}
                        emptyStateText="No conversation start yet."
                        renderCell={({ name, record }) => {
                            if (name === 'created_at') {
                                return (
                                    <div className="flex items-center">
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-white/80">
                                                <Link href={'/admin/user/' + record.id}>
                                                    {Moment(record.created_at).format(' DD-MM-Y hh:mm:ss')}
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }

                            if (name === 'content') {
                                return record.content.length > 20
                                    ? `${record.content.substring(0, 20)}...`
                                    : record.content;
                            }

                            if (name === 'status') {
                                if (record.status == 'Queued') {
                                    return (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-500/20 text-yellow-200">
                                            {record.status}
                                        </span>
                                    );
                                }

                                if (record.status == 'Failed') {
                                    return (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-500/20 text-red-200">
                                            {record.status}
                                        </span>
                                    );
                                }

                                return (
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-500/20 text-emerald-200">
                                        {record.status}
                                    </span>
                                );
                            }
                        }}
                    />
                  </div>

                            <div className="p-5 text-center" >
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                <Link
                                    href= { pageInfo.currentPage != 1 ?
                                          "list?page=1" 
                                        : '#' 
                                    }    
                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-white/10 bg-white/10 text-sm font-medium text-white/70 hover:bg-white/20"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                                    </svg>
                                </Link>
                                <Link
                                    href= { pageInfo.currentPage != 1 ?
                                         "list?page=" + (parseInt(pageInfo.currentPage) - 1) 
                                        : '#'
                                    }    
                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-white/10 bg-white/10 text-sm font-medium text-white/70 hover:bg-white/20"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                    </svg>
                                  </Link>

                                  <span
                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-white/10 bg-white/10 text-sm font-medium text-white/70 hover:bg-white/20"
                                >
                                   {((pageInfo.currentPage - 1) * pageInfo.limit) +1 } - {pageInfo.currentPage * pageInfo.limit} of {pageInfo.totalMessages}
                                  </span>

                                  <Link
                                    href= {  Math.ceil(pageInfo.totalMessages / pageInfo.limit) != pageInfo.currentPage ?
                                          "list?page=" + (parseInt(pageInfo.currentPage) + 1) 
                                        :  '#' 
                                    }

                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-white/10 bg-white/10 text-sm font-medium text-white/70 hover:bg-white/20"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                  </Link>
                                  <Link
                                    href= {  Math.ceil(pageInfo.totalMessages / pageInfo.limit) != pageInfo.currentPage ?
                                          "list?page=" + Math.ceil(pageInfo.totalMessages / pageInfo.limit)
                                        : '#' 
                                    }
                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-white/10 bg-white/10 text-sm font-medium text-white/70 hover:bg-white/20"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
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












