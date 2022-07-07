import { SettingIcon } from "./icons";

import { SearchIcon } from "@heroicons/react/outline";
import { useState } from "react";
import Authenticated from "../../Layouts/Authenticated";


export default function Contact(props) {
    const[contacts, setContacts] = useState(props.contacts)

    return (
        <Authenticated>
            <div className="px-4 sm:px-6 lg:px-8 bg-[#FBFBFBBF]">
                <div className="sm:flex sm:items-center sm:justify-between">
                    <div className="flex gap-3">
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
                                className="focus:ring-indigo-500 focus:border-primary/50 border-0 block w-full pl-10 sm:text-sm  rounded-md"
                                placeholder="Search"
                            />
                        </div>
                        <div className="flex items-center text-[#3D4459] gap-2 ml-5">
                            <svg
                                width={22}
                                height={20}
                                viewBox="0 0 22 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M21 19V17C21 15.1362 19.7252 13.5701 18 13.126M14.5 1.29076C15.9659 1.88415 17 3.32131 17 5C17 6.67869 15.9659 8.11585 14.5 8.70924M16 19C16 17.1362 16 16.2044 15.6955 15.4693C15.2895 14.4892 14.5108 13.7105 13.5307 13.3045C12.7956 13 11.8638 13 10 13H7C5.13623 13 4.20435 13 3.46927 13.3045C2.48915 13.7105 1.71046 14.4892 1.30448 15.4693C1 16.2044 1 17.1362 1 19M12.5 5C12.5 7.20914 10.7091 9 8.5 9C6.29086 9 4.5 7.20914 4.5 5C4.5 2.79086 6.29086 1 8.5 1C10.7091 1 12.5 2.79086 12.5 5Z"
                                    stroke="#3D4459"
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                            <div><span className="font-semibold">{Object.keys(contacts).length}</span> Contacts</div>
                        </div>
                    </div>
                    <div className="mt-4 sm:mt-0 sm:ml-16 flex gap-3">
                        <button
                            type="button"
                            className="inline-flex items-center px-2.5 py-1.5 border-0 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3D4459]"
                        >
                            <svg
                                className="-ml-0.5 mr-2 h-4 w-4"
                                viewBox="0 0 16 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M14.75 10.25V11.15C14.75 12.4101 14.75 13.0402 14.5048 13.5215C14.289 13.9448 13.9448 14.289 13.5215 14.5048C13.0402 14.75 12.4101 14.75 11.15 14.75H4.85C3.58988 14.75 2.95982 14.75 2.47852 14.5048C2.05516 14.289 1.71095 13.9448 1.49524 13.5215C1.25 13.0402 1.25 12.4101 1.25 11.15V10.25M11.75 6.5L8 10.25M8 10.25L4.25 6.5M8 10.25V1.25"
                                    stroke="#3D4459"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                            Import
                        </button>
                        <button
                            type="button"
                            className="inline-flex items-center px-2.5 py-1.5 border-0 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3D4459]"
                        >
                            <svg
                                className="-ml-0.5 mr-2 h-4 w-4"
                                viewBox="0 0 16 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M14.75 8V11.15C14.75 12.4101 14.75 13.0402 14.5048 13.5215C14.289 13.9448 13.9448 14.289 13.5215 14.5048C13.0402 14.75 12.4101 14.75 11.15 14.75H4.85C3.58988 14.75 2.95982 14.75 2.47852 14.5048C2.05516 14.289 1.71095 13.9448 1.49524 13.5215C1.25 13.0402 1.25 12.4101 1.25 11.15V8M11 4.25L8 1.25M8 1.25L5 4.25M8 1.25V10.25"
                                    stroke="#3D4459"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                            Export
                        </button>
                        <button
                            type="button"
                            className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
                        >
                            New Contact
                        </button>
                    </div>
                </div>
                <div className="mt-8 flex flex-col">
                    <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                                <table className="min-w-full divide-y divide-[#D9D9D9]">
                                    <thead>
                                        <tr>
                                            <th></th>
                                            <th
                                                scope="col"
                                                className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-[#3D4459] sm:pl-6"
                                            >
                                                Name
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-3 py-3.5 text-left text-sm font-semibold text-[#3D4459]"
                                            >
                                                LastName
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-3 py-3.5 text-left text-sm font-semibold text-[#3D4459]"
                                            >
                                                Number
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-3 py-3.5 text-left text-sm font-semibold text-[#3D4459]"
                                            >
                                                Email
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-3 py-3.5 text-left text-sm font-semibold text-[#3D4459]"
                                            >
                                                List
                                            </th>
                                            <th
                                                scope="col"
                                                className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                                            ></th>
                                        </tr>
                                    </thead>
                                    <tbody className=" bg-white">
                                        {Object.entries(contacts).map(([id, person], j) => (
                                            <tr key={person.id}>
                                                <td
                                                    scope="col"
                                                    className="relative w-12 px-6 sm:w-16 sm:px-8"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/80 sm:left-6"
                                                    />
                                                </td>
                                                <td className="whitespace-nowrap py-3 pl-4 pr-3 text-sm sm:pl-6">
                                                    <div className="flex items-center">
                                                        <div className="h-10 w-10 flex-shrink-0">
                                                            <span className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-gray-500">
                                                                <span className="text-2xl font-medium leading-none text-white">
                                                                    {(person.logo).substring(0,2)}
                                                                </span>
                                                            </span>
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="font-medium text-[#3D4459]">
                                                                {person.name}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-2 py-2 text-sm text-[#3D4459]">
                                                    {person.last_name}
                                                </td>
                                                <td className="whitespace-nowrap px-2 py-2 text-sm text-[#3D4459]">
                                                    {person.number}
                                                </td>
                                                <td className="whitespace-nowrap px-2 py-2 text-sm text-[#3D4459]">
                                                    {person.email}
                                                </td>
                                                <td className="whitespace-nowrap px-2 py-2 text-sm text-[#3D4459]">
                                                    <div className="flex gap-2">
                                                        <div className="whitespace-pre-wrap">
                                                            LeadBusiness,
                                                            <br /> Onboarding
                                                        </div>
                                                        <div className="p-1 bg-[#9BFFF2] rounded self-center text-[#008989] font-semibold">
                                                            +2
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                    <a
                                                        href="#"
                                                        className="text-indigo-600 hover:text-indigo-900"
                                                    >
                                                        Edit
                                                        <span className="sr-only">
                                                            , {person.name}
                                                        </span>
                                                    </a>
                                                </td>
                                            </tr>
                                        ))}
                                        {Object.entries(contacts).length == 0 &&
                                            <tr><td className = "" colspan="3">
                                                <div className="relative px-6 py-5 flex items-center space-x-3 hover:bg-gray-50 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary">
                                                    Contact not created yet.
                                                </div>
                                            </td></tr>
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Authenticated>
    );
}
