import React ,{ useEffect , useState , Fragment} from 'react';
import { Head, useForm, Link, InertiaLink } from '@inertiajs/inertia-react';
import MessageList from "./MessageList";
import Layout from "./Layout";

import {
    DotsVerticalIcon,
    BellIcon,
    PlusSmIcon,
    SearchIcon,
    MenuIcon
} from "@heroicons/react/outline";
import { MailIcon } from "@heroicons/react/solid";
import { Dialog, Menu, Transition } from "@headlessui/react";

import {
    SmileEmoji,
    AttachIcon,
    WhatsAppIcon,
    NotifiIcon,
    InstaIcon,
    SettingIcon,
} from "./icons";

const userNavigation = [
    { name: "Your Profile", href: "#" },
    { name: "Settings", href: "#" },
    { name: "Sign out", href: "#" },
];

const tabs = [
    { name: "All Chats", href: "#", count: "2", current: false },
    { name: "Unread", href: "#", count: "", current: false },
    { name: "Archived", href: "#", count: "", current: true },
    { name: "Add Column", href: "#", current: false },
];

function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
}

export default function ChatList(props) {
    const [selectedContact, setSelectedContact] =  useState(props.selected_contact);
    const [messages , setMessages] = useState(props.messages);
    const[containerCategory, setContainerCategory] = useState(props.category);

    const [chatList , setChatList ]= useState(props.contact_list);
    const [data, setData] = useState({
        destination: '',
        chennal: containerCategory,
        content: ''
    });

    const [time, setTime] = useState(Date.now());

    useEffect(() => {
        const interval = setInterval(() => getMessageList(), 5000);
        return () => {
            clearInterval(interval);
        };
    }, []);

    // Update select contact
    function updateContactData(contact){
        /*
       // setSelectedContact(contact);
        //getMessageList(contact);
        let newState = Object.assign({}, data);
        newState['destination'] = chatList[contact].number;
        setData(newState);
        */
    }

    // Update content 
    function handleChange(e){
        let newState = Object.assign({}, data);
        newState[e.target.name] = e.target.value;
        setData(newState);
    }

    // Return conversation history
    function getMessageList(){
        
        if(!selectedContact){
            return false;
        }
        console.log('fetch message list')
        axios({
            method: 'get',
            url: route('get_message_list', {'contact_id': selectedContact,
                'category': containerCategory, 'mode': 'ajax'}),
        })
        .then( (response) =>{
           // console.log(response.data)
            setMessages(response.data);
        });
    }

    // Send content to selected contact
    function sendMessage(){
        //let data = Object.assign({}, data);
        data['destination'] = chatList[selectedContact].number;

        if(data.content){
            axios({
                method: 'post',
                url: route('send_message_to_contact'),
                data: data
            })
            .then( (response) =>{
              //  console.log(response.data);
                if(response.data.status == 'Queued'){
                    let newState = Object.assign({}, data);
                    newState['content'] = '';
                    setData(newState);
                }
                getMessageList()
               // return inertia(route('get_message_list', {'contact_id': contactId,'category': containerCategory}));
            });
        }
    }

    return (
        <Layout>
            <div className="flex">
                <div className="w-1/3">
                    <div className="flex justify-between items-center p-3 md:hidden">
                        <div>
                            <svg
                                width={43}
                                height={46}
                                viewBox="0 0 43 46"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                xmlnsXlink="http://www.w3.org/1999/xlink"
                            >
                                <rect
                                    width="42.7131"
                                    height="45.877"
                                    fill="url(#pattern0)"
                                />
                                <defs>
                                    <pattern
                                        id="pattern0"
                                        patternContentUnits="objectBoundingBox"
                                        width={1}
                                        height={1}
                                    >
                                        <use
                                            xlinkHref="#image0_269_882"
                                            transform="translate(0 0.0266793) scale(0.00283158 0.0026363)"
                                        />
                                    </pattern>
                                    <image
                                        id="image0_269_882"
                                        width={327}
                                        height={346}
                                        xlinkHref="data:image/png;base64,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"
                                    />
                                </defs>
                            </svg>
                        </div>
                        <div className="flex gap-2 justify-center items-center">
                            <NotifiIcon/>
                            <div className="w-9 h-9 bg-[#9BFFF2] rounded-md">
                                <MenuIcon/>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-between p-4">
                        <div className="w-10 h-10 bg-white shadow-sm flex items-center justify-center">
                            <SettingIcon />
                        </div>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <SearchIcon
                                    className="h-5 w-5 text-gray-400"
                                    aria-hidden="true"
                                />
                            </div>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                className="focus:ring-indigo-500 focus:border-indigo-500 border-0 block w-full pl-10 sm:text-sm  rounded-md"
                                placeholder="you@example.com"
                            />
                        </div>
                        <button
                            type="button"
                            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-[4px] text-white bg-primary hover:bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:bg-primary"
                        >
                            New Message
                        </button>
                    </div>
                    <div>
                        <div className="border-b border-gray-200">
                            <nav
                                className="mt-2 -mb-px flex space-x-3 pl-2"
                                aria-label="Tabs"
                            >
                                {tabs.map((tab) => (
                                    <a
                                        key={tab.name}
                                        href={tab.href}
                                        className={classNames(
                                            tab.current
                                                ? "border-purple-500 text-primary"
                                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200",
                                            "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-base"
                                        )}
                                    >
                                        {tab.name}
                                        {tab.count ? (
                                            <span
                                                className={classNames(
                                                    tab.current
                                                        ? "bg-purple-100 text-primary"
                                                        : "bg-gray-100 text-gray-900",
                                                    "hidden ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium md:inline-block"
                                                )}
                                            >
                                                {tab.count}
                                            </span>
                                        ) : null}
                                    </a>
                                ))}
                            </nav>
                        </div>
                    </div>
                    <nav
                        className="flex-1 min-h-0 overflow-y-auto  h-[calc(100vh-158px)]"
                        aria-label="Directory"
                    >
                        <div className="relative">
                            <ul
                                role="list"
                                className="relative z-0 divide-y divide-gray-100"
                            >           
                                  
                                {Object.entries(chatList).map(([id, person], j) => (
                                    <li key={id}  onClick={() => updateContactData(id)} >
                                        <div className="relative px-6 py-5 flex items-center space-x-3 hover:bg-gray-50 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary">
                                            <div className="w-2.5 h-2.5 self-stretch bg-red-600 rounded-full"></div>
                                            <div className="flex-shrink-0">
                                                <span className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-gray-500">
                                                    <span className="text-2xl font-medium leading-none text-white">
                                                        {(person.name).substring(0,2)}
                                                    </span>
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <Link
                                                  //  onClick={()=> getMessageList(id)}
                                                     href={route('chat_list', {'contact_id': id,
                                                     'category': containerCategory} )}
                                                    className="focus:outline-none"
                                                >
                                                    {/* Extend touch target to entire panel */}
                                                    <span
                                                        className="absolute inset-0"
                                                        aria-hidden="true"
                                                    />
                                                    <p className="text-sm font-semibold text-[#3D4459]">
                                                        {person && (person.name) ?
                                                            <>{person.name}</>
                                                            : 
                                                            <>{person.number}</>
                                                        }
                                                    </p>
                                                    <p className="text-sm text-[#3D4459] truncate">
                                                        Junior Developer
                                                    </p>
                                                    <p className="text-sm text-[#7A7A7A] truncate">
                                                        Text Message Preview
                                                    </p>
                                                </Link>
                                            </div>
                                            <div className="cursor-pointer">
                                                <DotsVerticalIcon
                                                    className="h-4 w-4"
                                                    aria-hidden="true"
                                                />
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </nav>
                </div>
                <div className="w-2/3">
                        <div className="flex-1 p:2 sm:p-3 pr-0 justify-between flex flex-col h-screen bg-gray-100">
                        {selectedContact &&
                            <>
                            <div className="flex sm:items-center justify-between py-3 border-b-2 border-gray-200">
                                <div className="relative flex items-center space-x-4">
                                    <div className="flex gap-1">
                                        {/* <span className="text-yellow-500">
                                            <svg width={14} height={14}>
                                                <circle
                                                    cx={6}
                                                    cy={6}
                                                    r={6}
                                                    fill="currentColor"
                                                />
                                            </svg>
                                        </span> */}
                                        <div className="relative">
                                        <span className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-gray-500">
                                                    <span className="text-3xl font-medium leading-none text-white">
                                                        {(chatList[selectedContact].name).substring(0,2)}
                                                    </span>
                                                </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col leading-tight">
                                        <div className="text-sm font-semibold mt-1 flex items-center">
                                            <span className="text-[#3D4459] mr-3">
                                                { chatList[selectedContact].name }
                                            </span>
                                        </div>
                                        <span className="text-sm font-normal text-[#3D4459]">
                                            Junior Developer
                                        </span>
                                    </div>
                                    <DotsVerticalIcon
                                        className="h-4 w-4"
                                        aria-hidden="true"
                                    />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="ml-4 flex items-center md:ml-6">
                                        <button
                                            type="button"
                                            className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                            <span className="sr-only">
                                                View notifications
                                            </span>
                                            <NotifiIcon />
                                        </button>

                                        {/* Profile dropdown */}
                                        <Menu as="div" className="ml-3 relative">
                                            <div>
                                                <Menu.Button className="max-w-xs  p-2 flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                                    <img
                                                        className="h-8 w-8 rounded-full"
                                                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                                                        alt=""
                                                    />
                                                    <span className="ml-2">
                                                        Mario Verdi
                                                    </span>
                                                </Menu.Button>
                                            </div>
                                            <Transition
                                                as={Fragment}
                                                enter="transition ease-out duration-100"
                                                enterFrom="transform opacity-0 scale-95"
                                                enterTo="transform opacity-100 scale-100"
                                                leave="transition ease-in duration-75"
                                                leaveFrom="transform opacity-100 scale-100"
                                                leaveTo="transform opacity-0 scale-95"
                                            >
                                                <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 py-1 focus:outline-none">
                                                    {userNavigation.map((item) => (
                                                        <Menu.Item key={item.name}>
                                                            {({ active }) => (
                                                                <a
                                                                    href={item.href}
                                                                    className={classNames(
                                                                        active
                                                                            ? "bg-gray-100"
                                                                            : "",
                                                                        "block py-2 px-4 text-sm text-gray-700"
                                                                    )}
                                                                >
                                                                    {item.name} 
                                                                </a>
                                                            )}
                                                        </Menu.Item>
                                                    ))}
                                                </Menu.Items>
                                            </Transition>
                                        </Menu>
                                    </div>
                                </div>
                            </div>
                            <MessageList 
                                messages = {messages}
                            />

                            <div className="border-t-2  border-gray-200 px-4 pt-4 mb-2 sm:mb-0">
                                <div className="flex gap-4 items-end">
                                    <div className="flex flex-col gap-1 ">
                                        <div className="flex rounded-md bg-white h-7 w-7 justify-center items-center cursor-pointer">
                                            <SmileEmoji />
                                        </div>
                                        <div className="flex rounded-md bg-white h-7 w-7 justify-center items-center cursor-pointer">
                                            <AttachIcon />
                                        </div>
                                    </div>

                                    <div className="relative flex flex-1">
                                        <input
                                            type="text"
                                            onChange={(e) => handleChange(e)}
                                            name="content"
                                            value={data.content}
                                            placeholder="Write your message!"
                                            className="w-full focus:outline-none border-0 focus:placeholder-gray-400 text-gray-600 placeholder-gray-600 pl-3 bg-white rounded-2xl rounded-br-none py-3"
                                        />
                                        <div className="absolute right-0 items-center inset-y-0 hidden sm:flex">
                                            {/* <button
                                            type="button"
                                            className="inline-flex items-center justify-center rounded-full h-10 w-10 transition duration-500 ease-in-out text-gray-500 hover:bg-gray-300 focus:outline-none"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                className="h-6 w-6 text-gray-600"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                        </button> */}
                                            <button
                                                type="button"
                                                onClick={sendMessage}
                                                className="inline-flex items-center justify-center rounded-lg px-4 py-3 transition duration-500 ease-in-out text-[#A31EFF] focus:outline-none"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                    className="h-6 w-6 ml-2 transform rotate-90"
                                                >
                                                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-1 ">
                                        <div className="flex rounded-md bg-white h-7 w-7 justify-center items-center cursor-pointer">
                                            
                                            <Menu as="div" className="ml-3 relative">
                                            <div>
                                            
                                                <Menu.Button className="max-w-xs  p-2 flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2">
                                                    {containerCategory == 'whatsapp' ?
                                                        <WhatsAppIcon />
                                                    :
                                                        <InstaIcon />
                                                    }
                                                </Menu.Button>
                                            </div>
                                            <Transition
                                                as={Fragment}
                                                enter="transition ease-out duration-100"
                                                enterFrom="transform opacity-0 scale-95"
                                                enterTo="transform opacity-100 scale-100"
                                                leave="transition ease-in duration-75"
                                                leaveFrom="transform opacity-100 scale-100"
                                                leaveTo="transform opacity-0 scale-95"
                                            >
                                                <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 py-1 focus:outline-none">
                                                  
                                                        <Menu.Item >
                                                            {containerCategory != 'whatsapp' ?
                                                                //<span onClick={() => getMessageList()} className= "block py-2 px-4 text-sm text-gray-700">
                                                                <Link href={route('chat_list', {'contact_id': selectedContact, 'category': 'whatsapp'})}> 
                                                                    <WhatsAppIcon />
                                                                </Link>
                                                                :
                                                                <Link href={route('chat_list', {'contact_id': selectedContact, 'category': 'instagram'})} className= "block py-2 px-4 text-sm text-gray-700">
                                                                    <InstaIcon />                                                               
                                                                </Link>
                                                            }
                                                    </Menu.Item>
                                                    
                                                </Menu.Items>
                                            </Transition>
                                        </Menu>
                                        </div>
                                        <div className="flex rounded-md bg-white h-7 w-7 justify-center items-center cursor-pointer">
                                            <PlusSmIcon
                                                className="h-6 w-6"
                                                aria-hidden="true"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            </>
                        }
                        </div>
                    
                </div>
            </div>
        </Layout>
    );
}