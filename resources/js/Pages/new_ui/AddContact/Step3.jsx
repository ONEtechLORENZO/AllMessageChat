import React from "react";

export default function Step3() {
    return (
        <div className="flex-1">
            <div className="space-y-2">
                <div className="sm:grid sm:grid-cols-12 sm:gap-4">
                    <label
                        htmlFor="first-name"
                        className="block col-span-4 text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
                    >
                        Job position
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
                        Organization
                    </label>
                    <div className="mt-1 col-span-8 !sm:mt-0">
                        <input
                            type="text"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500  sm:text-sm"
                        />
                    </div>
                </div>
                <div className="flex gap-1 items-center text-[#545CD8] cursor-pointer">
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
            </div>
        </div>
    );
}









