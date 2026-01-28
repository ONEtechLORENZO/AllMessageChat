import React from "react";

export default function Step1() {
    return (
        <div className="h-[calc(100%+2rem)] max-h-[576px] overflow-y-auto">
            <div className="space-y-2">
                <div className="sm:grid sm:grid-cols-12 sm:gap-4">
                    <label
                        htmlFor="first-name"
                        className="block col-span-4 text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
                    >
                        First name
                    </label>
                    <div className="mt-1 col-span-8 !sm:mt-0">
                        <input
                            type="text"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500  sm:text-sm"
                        />
                    </div>
                </div>
                <div className="sm:grid sm:grid-cols-12 sm:gap-4">
                    <label
                        htmlFor="first-name"
                        className="block col-span-4 text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
                    >
                        Last name <span className="text-[#6F57CA]">*</span>
                    </label>
                    <div className="mt-1 col-span-8 !sm:mt-0">
                        <input
                            type="text"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500  sm:text-sm"
                        />
                    </div>
                </div>
                <div className="sm:grid sm:grid-cols-12 sm:gap-4">
                    <label
                        htmlFor="first-name"
                        className="flex gap-2 items-center col-span-4 text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
                    >
                        Phone number
                        <svg
                            width={10}
                            height={16}
                            viewBox="0 0 10 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M8.79783 0.802734H1.71133C1.31283 0.802734 0.989334 1.12623 0.989334 1.52473V14.4752C0.989334 14.8742 1.31283 15.1972 1.71133 15.1972H8.79783C9.19633 15.1972 9.51983 14.8742 9.51983 14.4752V1.52473C9.51983 1.12623 9.19633 0.802734 8.79783 0.802734ZM8.98683 14.4752C8.98683 14.5792 8.90233 14.6637 8.79833 14.6637H1.71183C1.60783 14.6637 1.52333 14.5792 1.52333 14.4752V12.0002H8.98733V14.4752H8.98683ZM8.98683 11.4667H1.52283V2.94573H8.98683V11.4667ZM8.98683 2.41273H1.52283V1.52473C1.52283 1.42073 1.60733 1.33573 1.71133 1.33573H8.79783C8.90183 1.33573 8.98633 1.42073 8.98633 1.52473V2.41273H8.98683Z"
                                fill="#363740"
                            />
                        </svg>
                    </label>
                    <div className="mt-1 col-span-8 !sm:mt-0">
                        <div className="grid grid-cols-12 gap-2">
                            <div className="col-span-8">
                                <input
                                    type="text"
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500  sm:text-sm"
                                />
                            </div>
                            <div className="col-span-4">
                                <input
                                    type="text"
                                    placeholder="Label"
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500  sm:text-sm"
                                />
                            </div>
                        </div>

                        <div className="flex gap-1 items-center text-[#545CD8] !mt-1 cursor-pointer">
                            <svg
                                width={13}
                                height={12}
                                viewBox="0 0 13 12"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <rect
                                    x="5.25482"
                                    width={2}
                                    height={12}
                                    fill="#545CD8"
                                />
                                <rect
                                    x="12.2548"
                                    y={5}
                                    width={2}
                                    height={12}
                                    transform="rotate(90 12.2548 5)"
                                    fill="#545CD8"
                                />
                            </svg>
                            Add phone number
                        </div>
                    </div>
                </div>
                <div className="sm:grid sm:grid-cols-12 sm:gap-4">
                    <label
                        htmlFor="first-name"
                        className="flex gap-2 items-center col-span-4 text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
                    >
                        Email
                        <svg
                            width={14}
                            height={10}
                            viewBox="0 0 14 10"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M13.3768 0.735352H0.590836V9.26535H13.9188V0.735352H13.3768ZM12.8433 1.26835L7.69434 6.41735C7.45934 6.65235 7.04984 6.65235 6.81484 6.41735L1.66484 1.26835H12.8428H12.8433ZM1.12384 1.48085L4.58534 4.94185L1.12384 8.40335V1.48035V1.48085ZM1.54934 8.73235L4.96284 5.31935L6.43834 6.79435C6.65634 7.01235 6.94634 7.13285 7.25484 7.13285C7.56334 7.13285 7.85334 7.01235 8.07134 6.79435L9.54683 5.31885L12.9598 8.73185H1.54884L1.54934 8.73235ZM13.3858 8.40385L9.92434 4.94185L13.3858 1.47985V8.40385Z"
                                fill="#363740"
                            />
                        </svg>
                    </label>
                    <div className="mt-1 col-span-8 !sm:mt-0">
                        <div className="grid grid-cols-12 gap-2">
                            <div className="col-span-8">
                                <input
                                    type="text"
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500  sm:text-sm"
                                />
                            </div>
                            <div className="col-span-4">
                                <input
                                    type="text"
                                    placeholder="Label"
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500  sm:text-sm"
                                />
                            </div>
                        </div>

                        <div className="flex gap-1 items-center text-[#545CD8] !mt-1 cursor-pointer">
                            <svg
                                width={13}
                                height={12}
                                viewBox="0 0 13 12"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <rect
                                    x="5.25482"
                                    width={2}
                                    height={12}
                                    fill="#545CD8"
                                />
                                <rect
                                    x="12.2548"
                                    y={5}
                                    width={2}
                                    height={12}
                                    transform="rotate(90 12.2548 5)"
                                    fill="#545CD8"
                                />
                            </svg>
                            Add email
                        </div>
                    </div>
                </div>
            </div>

            <hr className="!my-6" />

            <div className="grid grid-cols-2 gap-4">
                <div className="sm:flex items-center sm:gap-1">
                    <label
                        htmlFor="first-name"
                        className="block text-sm font-medium text-right w-2/5 sm:mt-px sm:pt-2 text-[#7666B4]"
                    >
                        List:
                    </label>
                    <div className="mt-1 !sm:mt-0 flex-1 w-full">
                        <select className="block w-full max-w-lg rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:max-w-xs sm:text-sm">
                            <option value={""}>Select</option>
                        </select>
                    </div>
                </div>
                <div className="sm:flex items-center sm:gap-1">
                    <label
                        htmlFor="first-name"
                        className="block text-sm font-medium text-right w-2/5 sm:mt-px sm:pt-2 text-[#7666B4]"
                    >
                        Tags:
                    </label>
                    <div className="mt-1 !sm:mt-0 flex-1 w-full">
                        <select className="block w-full max-w-lg rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:max-w-xs sm:text-sm">
                            <option value={""}>Select</option>
                        </select>
                    </div>
                </div>
                <div className="sm:flex items-center sm:gap-1">
                    <label
                        htmlFor="first-name"
                        className="block text-sm font-medium text-right w-2/5 sm:mt-px sm:pt-2 text-[#7666B4]"
                    >
                        Assigned to:
                    </label>
                    <div className="mt-1 !sm:mt-0 flex-1 w-full">
                        <select className="block w-full max-w-lg rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:max-w-xs sm:text-sm">
                            <option value={""}>Select</option>
                        </select>
                    </div>
                </div>
                <div className="sm:flex items-center sm:gap-1">
                    <label
                        htmlFor="first-name"
                        className="block text-sm font-medium text-right w-2/5 sm:mt-px sm:pt-2 text-[#7666B4]"
                    >
                        Visible to:
                    </label>
                    <div className="mt-1 !sm:mt-0 flex-1 w-full">
                        <select className="block w-full max-w-lg rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:max-w-xs sm:text-sm">
                            <option value={""}>Select</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="relative flex items-start !mt-6">
                <div className="flex h-5 items-center">
                    <input
                        id="comments"
                        name="comments"
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                </div>
                <div className="ml-3 text-sm">
                    <label
                        htmlFor="comments"
                        className="font-normal text-[#878787]"
                    >
                        I confirm that we have obtained appropriate consent to
                        send SMS, email, or other types of messages from
                        contact(s) being created or imported in compliance with
                        applicable laws and regulations and OneMessage.chat’s
                        Terms of Service.
                    </label>
                </div>
            </div>
        </div>
    );
}
