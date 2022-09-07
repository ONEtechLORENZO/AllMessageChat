import React, { useState, Fragment, useEffect } from "react";
import ApplicationLogo from "@/Components/ApplicationLogo";
import Dropdown from "@/Components/Dropdown";
import { Inertia } from '@inertiajs/inertia';
import ResponsiveNavLink from "@/Components/ResponsiveNavLink";
import { Link } from "@inertiajs/inertia-react";
import { Dialog, Transition } from "@headlessui/react";
import {
    HomeIcon,
    ChatAltIcon,
    ChatAlt2Icon,
    IdentificationIcon,
    OfficeBuildingIcon,
    BriefcaseIcon,
    UsersIcon,
    XIcon,
    SpeakerphoneIcon,
    ChevronRightIcon,
    ChevronLeftIcon,
    ServerIcon,
    EyeIcon,
    ShoppingCartIcon,
    ShoppingBagIcon,
    ChevronDownIcon
} from "@heroicons/react/outline";                                                                      
import SelectCompany from "@/Pages/Company/SelectCompany";
import { CurrencyDollarIcon } from "@heroicons/react/solid";
import axios from "axios";
import Notification from "./Notification";


const navigation = [
    {
        name: "Dashboard",
        href: route("dashboard"),
        icon: HomeIcon,
        show: ['all'],
        subMenu : [{
            name: 'test',
            href : route("listContact")
        }]
    },
    {
        name: "Contacts",
        href: route("listContact"),
        icon: IdentificationIcon,
        show: ['all'],
    },    
    {
        name: "Opportunity",
        href: route("listOpportunity"),
        icon: EyeIcon,
        show: ['all'],
    },    
    {
        name: "Orders",
        href: route("listOrder"),
        icon: ShoppingBagIcon,
        show: ['all'],
    },    
    {
        name: "Product",
        href: route("listProduct"),
        icon: ShoppingCartIcon,
        show: ['all'],
    },    
    
    {
        name: "Chat",
        href: route("chat_list"),
        icon: ChatAlt2Icon,
        show: ['all'],
        
    },{
        name: "Company",
        href: route("listCompany"),
        icon: OfficeBuildingIcon,
        show: ['admin'],
    },
    {
        name: "Campaigns",
        href: route("listCampaign"),
        icon: SpeakerphoneIcon,
        show: ['all'],
    },
    {
        name: "Wallet",
        href: route("wallet"),
        icon: BriefcaseIcon,
        show: ['all'],
    },    
    {
        name: "Users",
        href: route("show_Users"),
        icon: UsersIcon,
        show: ['admin'],
    },

    {
        name: "Reports",
        href: route("listMessage"),
        icon: ChatAltIcon,
        show: ['all'],
    },
];

const globalAdminLinks = [
    {
        name: "Pricing",
        href: route("listPrice"),
        icon: CurrencyDollarIcon,
    },
    {
        name: "Users",
        href: route("list_global_user"),
        icon: UsersIcon,
    },
];

function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
}

export default function Authenticated({ auth, header, children, hideHeader , current_page}) 
{
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [showSidebarText, setShowSidebarText] = useState(true);

    const [selectCompanyModal, setSelectedCompany] = useState(false);

    const[returnMainUser , setReturnMainUser] = useState(false);
    const[menuDropdownActive , setMenuDropdownActive] = useState({});

    const [notifications, setNotifications] = useState();
    
    const [count, setCount] = useState();
    const [id, setId] = useState();

    useEffect(() => {
        getNotifications();
        axios.get(route('get_session_value')).then((response) => {
            if(response.data.session_value){
                setReturnMainUser(response.data.session_value);
            }
        });

        console.count()

       // drownDownToggleAction();
    },[])

    // function drownDownToggleAction(){

    //     const toggleElements = document.querySelectorAll('.gio-menu-item');
    //     toggleElements.forEach(el => {
    //     el.addEventListener('click', function() {
    //         console.count()
    //         this.querySelector('.gio-dropdown-icon').classList.toggle('rotate-180');
    //     });
    //     });

    // }

    function drownDownToggleAction(e,item){
        console.log(e)
        e.preventDefault();
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();

        if(!item.subMenu) return;

        // const dataset = e.target.dataset;
        // debugger;
        // console.log(dataset.index)

        // if(navigation[index].hasOwnProperty('drop')){
        //     navigation[index].drop = !navigation[index].drop
        // }else{           
        //     navigation[index].drop = true;
        // }

        const DropdownActive = menuDropdownActive;
        const menu = item.name;
        
        if(DropdownActive.hasOwnProperty(menu)){
            DropdownActive[menu] = !DropdownActive[menu]
        }else{
            DropdownActive[menu] = {};
            DropdownActive[menu] = true;
        }

        setMenuDropdownActive(DropdownActive);

    }

    function setImpersonate(){
        var data = {
            user_id: returnMainUser
        }
        Inertia.post(route('set_global_user'), data, {
            onSuccess: (response) => {
                console.log(response);
            },
            onError: (errors) => {
                setErrors(errors)
            }
        });
    }

    function getNotifications(){
        var url = route('notification');
        axios.get(url).then((response) => {
          setCount(response.data.count);
          setNotifications(response.data.notifications);
          setId(response.data.id);
        });
    }

    function notificationClick(){
        var url = route('clickNotification')+'?id='+ id;
        axios.get(url).then((response) => {
    
        });
    }

    function showMore(){
        var url = route('showMore');
        axios.get(url).then((response) => {
            setCount(response.data.count);
            setId(response.data.id)

            let newState = Object.assign({}, notifications);
            newState = {...newState, ...response.data.notifications};
            setNotifications(newState);
        });
    }

    return (
        <>
            <div className="flex min-h-screen bg-[#f6f6f6]">
                <Transition.Root show={sidebarOpen} as={Fragment}>
                    <Dialog
                        as="div"
                        className="relative z-40 md:hidden"
                        onClose={setSidebarOpen}
                    >
                        <Transition.Child
                            as={Fragment}
                            enter="transition-opacity ease-linear duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="transition-opacity ease-linear duration-300"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
                        </Transition.Child>

                        <div className="fixed inset-0 flex z-40">
                            <Transition.Child
                                as={Fragment}
                                enter="transition ease-in-out duration-300 transform"
                                enterFrom="-translate-x-full"
                                enterTo="translate-x-0"
                                leave="transition ease-in-out duration-300 transform"
                                leaveFrom="translate-x-0"
                                leaveTo="-translate-x-full"
                            >
                                <Dialog.Panel className="relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-white">
                                    <Transition.Child
                                        as={Fragment}
                                        enter="ease-in-out duration-300"
                                        enterFrom="opacity-0"
                                        enterTo="opacity-100"
                                        leave="ease-in-out duration-300"
                                        leaveFrom="opacity-100"
                                        leaveTo="opacity-0"
                                    >
                                        <div className="absolute top-0 right-0 -mr-12 pt-2">
                                            <button
                                                type="button"
                                                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                                                onClick={() =>
                                                    setSidebarOpen(false)
                                                }
                                            >
                                                <span className="sr-only">
                                                    Close sidebar
                                                </span>
                                                <XIcon
                                                    className="h-6 w-6 text-white"
                                                    aria-hidden="true"
                                                />
                                            </button>
                                        </div>
                                    </Transition.Child>
                                    <div className="flex-shrink-0 flex items-center px-4">
                                        <ApplicationLogo className="block h-9 w-auto text-gray-500" />
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>

                            <div
                                className="flex-shrink-0 w-14"
                                aria-hidden="true"
                            >
                                {/* Dummy element to force sidebar to shrink to fit close icon */}
                            </div>
                        </div>
                    </Dialog>
                </Transition.Root>

                {/* Static sidebar for desktop */}
                <div
                    className={`transition-all hidden md:flex ${
                        showSidebarText ? "md:w-64" : "md:w-auto"
                    } md:flex-col`}
                >
                    {/* Sidebar component, swap this element with another sidebar if you like */}
                    <div className="flex flex-col flex-grow border-r border-gray-200 pt-5 bg-[#F6FFFD] overflow-y-auto">
                        <div className="flex items-center flex-shrink-0 px-4">
                            <ApplicationLogo className="block h-9 w-auto text-gray-500" />
                        </div>
                        <div
                            className="mt-4 mx-4 h-7 w-7 bg-white flex justify-center items-center shadow-sm text-[#3D4459] cursor-pointer"
                            onClick={() => setShowSidebarText(!showSidebarText)}
                        >
                            {showSidebarText ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                        </div>
                        <div className="mt-2 flex-grow flex flex-col">
                            <nav className="flex-1 px-2 pb-4 space-y-1 gio-navbar">
                                <ul>
                                {navigation.map((item,index) => {
                                    if(item.show != 'all' && !item.show.includes(auth.user.role)) {
                                        return;
                                    }
                                    return (
                                        <li data-index={index}  onClick={(e)=>{drownDownToggleAction(e,item)}}>
                                            <Link
                                                preserveState
                                                key={item.name}
                                                href={item.href}
                                                className={classNames(
                                                    (item.name == current_page)
                                                        ? "text-primary"                                                    
                                                        :"text-[#3D4459]  hover:text-primary",
                                                        "group flex items-center px-2 py-2 text-sm font-medium rounded-md gio-menu-item"
                                                )}                                                
                                            >
                                                <item.icon
                                                    className={classNames(
                                                        (item.name == current_page)
                                                            ? "text-primary"
                                                            : "text-[#3D4459] group-hover:text-primary",
                                                        "mr-3 flex-shrink-0 h-6 w-6"
                                                        
                                                    )}
                                                    
                                                    aria-hidden="true"
                                                   
                                                />
                                                {showSidebarText ? <div data-index={index} className="flex justify-between items-center flex-1">{item.name} {item.subMenu ? <ChevronDownIcon data-index={index} className={` ${(menuDropdownActive[item.name] ? 'rotate-180' : '')} h-6 w-6 gio-dropdown-icon  transition-all`} /> : '' }  </div>: ""}
                                            </Link>
                                            {
                                                showSidebarText && menuDropdownActive[item.name] == true && item.subMenu ?

                                                <ul>

                                                    { item.subMenu.map((subItem,index) => {
                                                    return <li><Link href={subItem.href}>{subItem.name}</Link></li>                          
                                                        }) }

                                                </ul> : ''

                                            }
                                           
                                        </li>
                                    );
                                })}
                                </ul>
                            </nav>
                        </div>
                        {auth.user.role == 'global_admin' ?
                            <div className="flex-shrink-0 flex">
                                <nav className="flex-1 px-2 pb-4 space-y-1 gio-navbar">
                                    {globalAdminLinks.map((item) => {
                                        return (
                                            
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                className={classNames(
                                                    (item.name == current_page)
                                                        ? "text-primary"                                                    
                                                        :"text-[#3D4459]  hover:text-primary",
                                                        "group flex items-center px-2 py-2 text-sm font-medium rounded-md"
                                                )}
                                            >
                                                <item.icon
                                                    className={classNames(
                                                        (item.name == current_page)
                                                            ? "text-primary"
                                                            : "text-[#3D4459] group-hover:text-primary",
                                                        "mr-3 flex-shrink-0 h-6 w-6"
                                                        
                                                    )}
                                                    aria-hidden="true"
                                                />
                                                {showSidebarText ? item.name: ""}
                                            </Link>
                                            
                                        );
                                    })}
                                </nav>
                            </div>
                        : ''}
                    </div>
                </div>
                <div className="flex flex-col flex-1 bg-[#FBFBFBBF]">
                    {hideHeader !== true ?
                    <div className="py-4 px-6">
                        <nav>
                            <div>
                                <div className="flex justify-between h-16">
                                    <div className="flex">
                                    </div>

                                    <div className="hidden sm:flex sm:items-center sm:ml-6"> 
                                        <div className="ml-3 relative">
                                            <Notification 
                                                notificationClick={notificationClick}
                                                showMore={showMore}
                                                count={count}
                                                notifications={notifications}
                                            />
                                        </div>
                                        <div className="ml-3 relative">
                                            <Dropdown>
                                                <Dropdown.Trigger>
                                                    <span className="inline-flex rounded-md">
                                                        <button
                                                            type="button"
                                                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500  hover:text-gray-700 focus:outline-none transition ease-in-out duration-150"
                                                        >
                                                            {auth && auth.user && auth.user.imageUrl ?
                                                                <img className="h-8 w-8 rounded-full mr-2" src={auth.user.imageUrl} alt="" /> 
                                                            : ''}

                                                            {auth && auth.user ? auth.user.name : ''}
                                                            <svg
                                                                className="ml-2 -mr-0.5 h-4 w-4"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                viewBox="0 0 20 20"
                                                                fill="currentColor"
                                                            >
                                                                <path
                                                                    fillRule="evenodd"
                                                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                                    clipRule="evenodd"
                                                                />
                                                            </svg>
                                                        </button>
                                                    </span>
                                                </Dropdown.Trigger>

                                                <Dropdown.Content>
                                                    <Dropdown.Link href={route('profile')} method="get" as="button">
                                                        Profile
                                                    </Dropdown.Link>

                                                    <button className="block w-full px-4 py-2 text-left text-sm leading-5 text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 transition duration-150 ease-in-out" onClick={() => setSelectedCompany(true)} as="button">
                                                        Switch company
                                                    </button>

                                                    {auth && auth.user && auth.user.role == 'global_admin' ?
                                                        <Dropdown.Link href={route('settings')} method="get" as="button">
                                                            Settings
                                                        </Dropdown.Link>
                                                    : ''}

                                                    {returnMainUser &&
                                                        <button className="block w-full px-4 py-2 text-left text-sm leading-5 text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 transition duration-150 ease-in-out" 
                                                        onClick={() => setImpersonate()} 
                                                        as="button">
                                                            Return to global admin
                                                        </button>
                                                    }

                                                    <Dropdown.Link href={route('logout')} method="post" as="button">
                                                        Log Out
                                                    </Dropdown.Link>
                                                </Dropdown.Content>
                                            </Dropdown>
                                        </div>
                                    </div>

                                    <div className="-mr-2 flex items-center sm:hidden">
                                        <button
                                            onClick={() => setShowingNavigationDropdown((previousState) => !previousState)}
                                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 focus:text-gray-500 transition duration-150 ease-in-out"
                                        >
                                            <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                                <path
                                                    className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M4 6h16M4 12h16M4 18h16"
                                                />
                                                <path
                                                    className={showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M6 18L18 6M6 6l12 12"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className={(showingNavigationDropdown ? 'block' : 'hidden') + ' sm:hidden'}>
                                <div className="pt-2 pb-3 space-y-1">
                                    <ResponsiveNavLink href={route('dashboard')} active={route().current('dashboard')}>
                                        Dashboard
                                    </ResponsiveNavLink>
                                </div>

                                <div className="pt-4 pb-1 border-t border-gray-200">
                                    <div className="px-4">
                                        <div className="font-medium text-base text-gray-800">{auth && auth.user && auth.user.name ? auth.user.name : ''}</div>
                                        <div className="font-medium text-sm text-gray-500">{auth && auth.user && auth.user.email ? auth.user.email : ''}</div>
                                    </div>

                                    <div className="mt-3 space-y-1">
                                        <ResponsiveNavLink method="post" href={route('logout')} as="button">
                                            Log Out
                                        </ResponsiveNavLink>
                                    </div>
                                </div>
                            </div>
                        </nav>
                    </div> : ''}

                    {header && (
                        <header className="bg-white shadow">
                            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">{header}</div>
                        </header>
                    )}

                    <main>{children}</main>
                </div>
            </div>

            {/* Select company */}
            <SelectCompany
                openModal={selectCompanyModal}
                setSelectedCompany={setSelectedCompany}
            />

        </>
    );
}