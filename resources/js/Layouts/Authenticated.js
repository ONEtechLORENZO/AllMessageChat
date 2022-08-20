import React, { useState, Fragment } from "react";
import ApplicationLogo from "@/Components/ApplicationLogo";
import Dropdown from "@/Components/Dropdown";
import ResponsiveNavLink from "@/Components/ResponsiveNavLink";
import { Link } from "@inertiajs/inertia-react";
// import { Disclosure, Menu, Transition } from '@headlessui/react'
import { Dialog, Transition } from "@headlessui/react";
import {
    BellIcon,
    CalendarIcon,
    ChartBarIcon,
    FolderIcon,
    HomeIcon,
    ChatAltIcon,
    InboxIcon,
    MenuAlt2Icon,
    ChatAlt2Icon,
    CurrencyDollarIcon,
    IdentificationIcon,
    TagIcon,
    ViewListIcon,
    BriefcaseIcon,
    UsersIcon,
    XIcon,
    ChevronRightIcon,
    ChevronLeftIcon,
    MenuIcon,
} from "@heroicons/react/outline";                                                                      
import {NotifiIcon} from '../Pages/icons'
import SelectCompany from "@/Pages/Company/SelectCompany";

const navigation = [
    {
        name: "Dashboard",
        href: route("dashboard"),
        icon: HomeIcon,
    },
    {
        name: "Messages",
        href: route("message_list"),
        icon: ChatAltIcon,
    },
    {
        name: "Contacts",
        href: route("listContact"),
        icon: IdentificationIcon,
        
    },
    {
        name: "Chat",
        href: route("chat_list"),
        icon: ChatAlt2Icon,
        
    },
    {
        name: "Wallet",
        href: route("wallet"),
        icon: BriefcaseIcon,
        
    },
    {
        name: "Pricing",
        href: route("listPrice"),
        icon: CurrencyDollarIcon,
        
    },
    {
        name: "Users",
        href: route("listUser"),
        icon: UsersIcon,
        
    },

    // { name: "Opportunities", href: "#", icon: CalendarIcon, current: false },
    // { name: "Automations", href: "#", icon: InboxIcon, current: false },
    // { name: "Integrations", href: "#", icon: ChartBarIcon, current: false },
    // { name: "Reports", href: "#", icon: ChartBarIcon, current: false },
];
const userNavigation = [
    { name: "Your Profile", href: "#" },
    { name: "Settings", href: "#" },
    { name: "Sign out", href: "#" },
];

function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
}

export default function Authenticated({ auth, header, children, hideHeader , current_page}) 
{
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [showSidebarText, setShowSidebarText] = useState(false);

    const [selectCompanyModal, setSelectedCompany] = useState(false);

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
                            {showSidebarText ? (
                                <ChevronRightIcon />
                            ) : (
                                <ChevronLeftIcon />
                            )}
                        </div>
                        <div className="mt-2 flex-grow flex flex-col">
                            <nav className="flex-1 px-2 pb-4 space-y-1">
                                {navigation.map((item) => (
                                    <>
                                        {(((item.name == 'Pricing' || 
                                            item.name == 'Users') && 
                                           // auth.user.role != 'regular') 
                                           (auth.user.role == 'global_admin' || auth.user.role != 'admin') )
                                        || (item.name != 'Pricing' && 
                                        item.name != 'Users')) &&
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className={classNames(
                                               // (item.name == 'Tags' ||item.name == 'Lists')?  "text-[#3D4459]  hover:text-primary pl-6":
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
                                        }
                                    </>
                                ))}
                            </nav>
                        </div>
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
                                        <NotifiIcon/>
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
                                                    {auth && auth.user && (auth.user.role == 'admin' || auth.user.role == 'global_admin') &&
                                                    <>
                                                        {/* <Dropdown.Link href={route('settings')} method="get" as="button">
                                                            Settings
                                                        </Dropdown.Link> */}
                                                        <button className="block w-full px-4 py-2 text-left text-sm leading-5 text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 transition duration-150 ease-in-out" onClick={() => setSelectedCompany(true)} as="button">
                                                            Switch company
                                                        </button>
                                                    </>
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
                openModal = {selectCompanyModal}
                setSelectedCompany = {setSelectedCompany}
            />

        </>
    );
}