import React from "react";

export default function Step2() {
    return (
        <div className="flex-1">
            <div className="flex flex-col gap-2">
                <div className="sm:grid sm:grid-cols-12 sm:gap-4">
                    <label
                        htmlFor="first-name"
                        className="block col-span-4 text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
                    >
                        Birth Date
                    </label>
                    <div className="mt-1 col-span-8 !sm:mt-0 flex justify-end gap-1 items-center">
                        <input
                            type="text"
                            placeholder="d"
                            className="block w-12 h-6 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500  sm:text-sm"
                        />
                        <span className="text-lg">/</span>
                        <input
                            type="text"
                            placeholder="m"
                            className="block w-12 h-6  rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500  sm:text-sm"
                        />
                        <span className="text-lg">/</span>
                        <input
                            type="text"
                            placeholder="y"
                            className="block w-12 h-6  rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500  sm:text-sm"
                        />
                    </div>
                </div>
                <div className="sm:grid sm:grid-cols-12 sm:gap-4">
                    <label
                        htmlFor="first-name"
                        className="block col-span-4 text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
                    >
                        Gender
                    </label>
                    <div className="mt-1 col-span-8 !sm:mt-0">
                        <select className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500  sm:text-sm">
                            <option value={""}>Select</option>
                        </select>
                    </div>
                </div>
                <div className="sm:grid sm:grid-cols-12 sm:gap-4">
                    <label
                        htmlFor="first-name"
                        className="block col-span-4 text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
                    >
                        Languages spoken
                    </label>
                    <div className="mt-1 col-span-8 !sm:mt-0">
                        <select className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500  sm:text-sm">
                            <option value={""}>Select</option>
                        </select>
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
                    Add custom
                </div>

                {/* Add Custom Selection */}
                <div className="flex flex-col gap-2">
                    <div className="flex gap-2 items-center">
                        <select className="block w-[150px] rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500  sm:text-sm">
                            <option value={""}>Select field type</option>
                        </select>
                        <svg
                            width={21}
                            height={20}
                            viewBox="0 0 21 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M3.51367 9.00098L8.42377 15.001L16.9961 5"
                                stroke="#58C731"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                        <svg
                            width={21}
                            height={20}
                            viewBox="0 0 21 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <rect
                                x="15.6541"
                                y="5.5"
                                width={14}
                                height={2}
                                transform="rotate(135 15.6541 5.5)"
                                fill="#C0486C"
                            />
                            <rect
                                x="14.6541"
                                y="15.5"
                                width={14}
                                height={2}
                                transform="rotate(-135 14.6541 15.5)"
                                fill="#C0486C"
                            />
                        </svg>
                    </div>
                    <div className="flex justify-between">
                        <input
                            type="text"
                            placeholder="Write field title"
                            className="block w-32 h-6 rounded-md border-0 focus:border-indigo-500 focus:ring-indigo-500  sm:text-sm"
                        />
                        <input
                            type="text"
                            className="block w-40 h-6 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500  sm:text-sm"
                        />
                    </div>
                </div>

                {/* Add Custom Selection */}
            </div>
        </div>
    );
}












