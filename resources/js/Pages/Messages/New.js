import { Fragment } from "react";

import Layout from "./Layout";

import {
    DotsVerticalIcon,
    BellIcon,
    PlusSmIcon,
    SearchIcon,
} from "@heroicons/react/outline";
import { MailIcon } from "@heroicons/react/solid";
import { Dialog, Menu, Transition } from "@headlessui/react";

import {
    SmileEmoji,
    AttachIcon,
    WhatsAppIcon,
    NotifiIcon,
    SettingIcon,
} from "./icons";

const directory = [
    {
        id: 1,
        name: "Leslie Abbott",
        role: "Co-Founder / CEO",
        imageUrl:
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    {
        id: 2,
        name: "Hector Adams",
        role: "VP, Marketing",
        imageUrl:
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    {
        id: 3,
        name: "Blake Alexander",
        role: "Account Coordinator",
        imageUrl:
            "https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    {
        id: 4,
        name: "Fabricio Andrews",
        role: "Senior Art Director",
        imageUrl:
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },

    {
        id: 5,
        name: "Angela Beaver",
        role: "Chief Strategy Officer",
        imageUrl:
            "https://images.unsplash.com/photo-1501031170107-cfd33f0cbdcc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    {
        id: 6,
        name: "Yvette Blanchard",
        role: "Studio Artist",
        imageUrl:
            "https://images.unsplash.com/photo-1506980595904-70325b7fdd90?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    {
        id: 7,
        name: "Lawrence Brooks",
        role: "Content Specialist",
        imageUrl:
            "https://images.unsplash.com/photo-1513910367299-bce8d8a0ebf6?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },

    {
        id: 8,
        name: "Jeffrey Clark",
        role: "Senior Art Director",
        imageUrl:
            "https://images.unsplash.com/photo-1517070208541-6ddc4d3efbcb?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    {
        id: 9,
        name: "Kathryn Cooper",
        role: "Associate Creative Director",
        imageUrl:
            "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },

    {
        id: 10,
        name: "Alicia Edwards",
        role: "Junior Copywriter",
        imageUrl:
            "https://images.unsplash.com/photo-1509783236416-c9ad59bae472?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    {
        id: 11,
        name: "Benjamin Emerson",
        role: "Director, Print Operations",
        imageUrl:
            "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    {
        id: 12,
        name: "Jillian Erics",
        role: "Designer",
        imageUrl:
            "https://images.unsplash.com/photo-1504703395950-b89145a5425b?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    {
        id: 13,
        name: "Chelsea Evans",
        role: "Human Resources Manager",
        imageUrl:
            "https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },

    {
        id: 14,
        name: "Michael Gillard",
        role: "Co-Founder / CTO",
        imageUrl:
            "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    {
        id: 15,
        name: "Dries Giuessepe",
        role: "Manager, Business Relations",
        imageUrl:
            "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },

    {
        id: 16,
        name: "Jenny Harrison",
        role: "Studio Artist",
        imageUrl:
            "https://images.unsplash.com/photo-1507101105822-7472b28e22ac?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    {
        id: 17,
        name: "Lindsay Hatley",
        role: "Front-end Developer",
        imageUrl:
            "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    {
        id: 18,
        name: "Anna Hill",
        role: "Partner, Creative",
        imageUrl:
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },

    {
        id: 19,
        name: "Courtney Samuels",
        role: "Designer",
        imageUrl:
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    {
        id: 20,
        name: "Tom Simpson",
        role: "Director, Product Development",
        imageUrl:
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },

    {
        id: 21,
        name: "Floyd Thompson",
        role: "Principal Designer",
        imageUrl:
            "https://images.unsplash.com/photo-1463453091185-61582044d556?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    {
        id: 22,
        name: "Leonard Timmons",
        role: "Senior Designer",
        imageUrl:
            "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    {
        id: 23,
        name: "Whitney Trudeau",
        role: "Copywriter",
        imageUrl:
            "https://images.unsplash.com/photo-1517365830460-955ce3ccd263?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },

    {
        id: 24,
        name: "Kristin Watson",
        role: "VP, Human Resources",
        imageUrl:
            "https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    {
        id: 25,
        name: "Emily Wilson",
        role: "VP, User Experience",
        imageUrl:
            "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },

    {
        id: 26,
        name: "Emma Young",
        role: "Senior Front-end Developer",
        imageUrl:
            "https://images.unsplash.com/photo-1505840717430-882ce147ef2d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
];

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

console.log(directory);

function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
}

export default function New() {
    return (
        <Layout>
            {/* Directory list */}
            <div className="flex">
                <div className="w-1/3">
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
                    <div >
                        <div className="border-b border-gray-200">
                            <nav
                                className="mt-2 -mb-px flex space-x-8 pl-2"
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
                        className="flex-1 min-h-0 overflow-y-auto  h-[calc(100vh-130px)]"
                        aria-label="Directory"
                    >
                        <div className="relative">
                            <ul
                                role="list"
                                className="relative z-0 divide-y divide-gray-100"
                            >
                                {directory.map((person) => (
                                    <li key={person.id}>
                                        <div className="relative px-6 py-5 flex items-center space-x-3 hover:bg-gray-50 focus-within:ring-2 focus-within:ring-inset focus-within:ring-pink-500">
                                            <div className="w-2.5 h-2.5 self-stretch bg-red-600 rounded-full"></div>
                                            <div className="flex-shrink-0">
                                                <img
                                                    className="h-14 w-14 rounded-full"
                                                    src={person.imageUrl}
                                                    alt=""
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <a
                                                    href="#"
                                                    className="focus:outline-none"
                                                >
                                                    {/* Extend touch target to entire panel */}
                                                    <span
                                                        className="absolute inset-0"
                                                        aria-hidden="true"
                                                    />
                                                    <p className="text-sm font-semibold text-[#3D4459]">
                                                        {person.name}
                                                    </p>
                                                    <p className="text-sm text-[#3D4459] truncate">
                                                        {person.role}
                                                    </p>
                                                    <p className="text-sm text-[#7A7A7A] truncate">
                                                        Text Message Preview
                                                    </p>
                                                </a>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </nav>
                </div>
                <div className="w-2/3">
                    <div className="flex-1 p:2 sm:p-6 justify-between flex flex-col h-screen bg-gray-100">
                        <div className="flex sm:items-center justify-between py-3 border-b-2 border-gray-200">
                            <div className="relative flex items-center space-x-4">
                                <div className="flex gap-1">
                                    <span className="text-yellow-500">
                                        <svg width={14} height={14}>
                                            <circle
                                                cx={6}
                                                cy={6}
                                                r={6}
                                                fill="currentColor"
                                            />
                                        </svg>
                                    </span>
                                    <div className="relative">
                                        <img
                                            src="https://images.unsplash.com/photo-1549078642-b2ba4bda0cdb?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=3&w=144&h=144"
                                            alt=""
                                            className="w-10 h-10 rounded-full"
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col leading-tight">
                                    <div className="text-sm font-semibold mt-1 flex items-center">
                                        <span className="text-[#3D4459] mr-3">
                                            Anderson Vanhron
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
                        <div
                            id="messages"
                            className="flex flex-col space-y-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch"
                        >
                            <div className="chat-message">
                                <div className="flex items-end">
                                    <div className="flex flex-col space-y-2 text-sm max-w-xs mx-2 order-2 items-start">
                                        <div>
                                            <span className="px-4 py-2 rounded-lg inline-block rounded-bl-none bg-white text-[#3D4459]">
                                                Can be verified on any platform
                                                using docker
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="chat-message">
                                <div className="flex items-end justify-end">
                                    <div className="flex flex-col space-y-2 text-sm max-w-xs mx-2 order-1 items-end">
                                        <div>
                                            <span className="px-4 py-2 rounded-lg inline-block rounded-br-none bg-white text-[#3D4459]">
                                                Your error message says
                                                permission denied, npm global
                                                installs must be given root
                                                privileges.
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="chat-message">
                                <div className="flex items-end">
                                    <div className="flex flex-col space-y-2 text-sm max-w-xs mx-2 order-2 items-start">
                                        <div>
                                            <span className="px-4 py-2 rounded-lg inline-block bg-white text-[#3D4459]">
                                                Command was run with root
                                                privileges. I'm sure about that.
                                            </span>
                                        </div>
                                        <div>
                                            <span className="px-4 py-2 rounded-lg inline-block bg-white text-[#3D4459]">
                                                I've update the description so
                                                it's more obviously now
                                            </span>
                                        </div>
                                        <div>
                                            <span className="px-4 py-2 rounded-lg inline-block bg-white text-[#3D4459]">
                                                FYI
                                                https://askubuntu.com/a/700266/510172
                                            </span>
                                        </div>
                                        <div>
                                            <span className="px-4 py-2 rounded-lg inline-block rounded-bl-none bg-white text-[#3D4459]">
                                                Check the line above (it ends
                                                with a # so, I'm running it as
                                                root )
                                                <pre>
                                                    # npm install -g
                                                    @vue/devtools
                                                </pre>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="chat-message">
                                <div className="flex items-end justify-end">
                                    <div className="flex flex-col space-y-2 text-sm max-w-xs mx-2 order-1 items-end">
                                        <div>
                                            <span className="px-4 py-2 rounded-lg inline-block rounded-br-none bg-white text-[#3D4459] ">
                                                Any updates on this issue? I'm
                                                getting the same error when
                                                trying to install devtools.
                                                Thanks
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="chat-message">
                                <div className="flex items-end">
                                    <div className="flex flex-col space-y-2 text-sm max-w-xs mx-2 order-2 items-start">
                                        <div>
                                            <span className="px-4 py-2 rounded-lg inline-block rounded-bl-none bg-white text-[#3D4459]">
                                                Thanks for your message David. I
                                                thought I'm alone with this
                                                issue. Please, ? the issue to
                                                support it :)
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="chat-message">
                                <div className="flex items-end justify-end">
                                    <div className="flex flex-col space-y-2 text-sm max-w-xs mx-2 order-1 items-end">
                                        <div>
                                            <span className="px-4 py-2 rounded-lg inline-block bg-white text-[#3D4459] ">
                                                Are you using sudo?
                                            </span>
                                        </div>
                                        <div>
                                            <span className="px-4 py-2 rounded-lg inline-block rounded-br-none bg-white text-[#3D4459] ">
                                                Run this command sudo chown -R
                                                `whoami` /Users/{"{"}
                                                {"{"}your_user_profile{"}"}
                                                {"}"}/.npm-global/ then install
                                                the package globally without
                                                using sudo
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="chat-message">
                                <div className="flex items-end">
                                    <div className="flex flex-col space-y-2 text-sm max-w-xs mx-2 order-2 items-start">
                                        <div>
                                            <span className="px-4 py-2 rounded-lg inline-block bg-white text-[#3D4459]">
                                                It seems like you are from Mac
                                                OS world. There is no /Users/
                                                folder on linux ?
                                            </span>
                                        </div>
                                        <div>
                                            <span className="px-4 py-2 rounded-lg inline-block rounded-bl-none bg-white text-[#3D4459]">
                                                I have no issue with any other
                                                packages installed with root
                                                permission globally.
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="chat-message">
                                <div className="flex items-end justify-end">
                                    <div className="flex flex-col space-y-2 text-sm max-w-xs mx-2 order-1 items-end">
                                        <div>
                                            <span className="px-4 py-2 rounded-lg inline-block rounded-br-none bg-white text-[#3D4459] ">
                                                yes, I have a mac. I never had
                                                issues with root permission as
                                                well, but this helped me to
                                                solve the problem
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="chat-message">
                                <div className="flex items-end">
                                    <div className="flex flex-col space-y-2 text-sm max-w-xs mx-2 order-2 items-start">
                                        <div>
                                            <span className="px-4 py-2 rounded-lg inline-block bg-white text-[#3D4459]">
                                                I get the same error on Arch
                                                Linux (also with sudo)
                                            </span>
                                        </div>
                                        <div>
                                            <span className="px-4 py-2 rounded-lg inline-block bg-white text-[#3D4459]">
                                                I also have this issue, Here is
                                                what I was doing until now:
                                                #1076
                                            </span>
                                        </div>
                                        <div>
                                            <span className="px-4 py-2 rounded-lg inline-block rounded-bl-none bg-white text-[#3D4459]">
                                                even i am facing
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
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
                                        <WhatsAppIcon />
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
                    </div>
                </div>
            </div>
        </Layout>
    );
}
