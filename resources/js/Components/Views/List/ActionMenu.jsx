import React, { Fragment } from "react";
import {
    PencilSquareIcon,
    TrashIcon,
    EllipsisVerticalIcon,
    EyeIcon,
    LinkIcon,
    ArrowDownTrayIcon,
} from "@heroicons/react/24/solid";
import { Link } from "@inertiajs/react";
import { Menu, Transition } from "@headlessui/react";

export default function ActionMenu(props) {
    const itemClass = (active) =>
        `flex w-full gap-2 p-2 items-center text-gray-700 ${active ? "bg-gray-100" : ""
        }`;

    return (
        <Menu as="div" className="inline-block text-left">
            <div>
                <Menu.Button className="inline-flex w-full justify-center rounded-md px-4 py-2 text-sm font-medium text-[#363740] hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
                    <EllipsisVerticalIcon className="w-4 h-4 cursor-pointer" />
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
                <Menu.Items className="absolute z-20 right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="px-1 py-1">
                        {/* VIEW */}
                        {props.actions?.detail === true && (
                            <Menu.Item as={Link} href={route("detail" + props.module, { id: props.record.id })}>
                                {({ active }) => (
                                    <span className={itemClass(active)}>
                                        <EyeIcon className="w-4 h-4 text-gray-600" />
                                        {props.translator["View"]}
                                    </span>
                                )}
                            </Menu.Item>
                        )}

                        {/* EDIT */}
                        {props.actions?.edit === true && (
                            props.edit_link ? (
                                <Menu.Item as={Link} href={route(props.edit_link, props.record.id)}>
                                    {({ active }) => (
                                        <span className={itemClass(active)}>
                                            <PencilSquareIcon className="h-4 w-4 text-indigo-700" />
                                            {props.translator["Edit"]}
                                        </span>
                                    )}
                                </Menu.Item>
                            ) : (
                                <Menu.Item as="button" type="button" onClick={() => props.showEditForm(props.record.id)}>
                                    {({ active }) => (
                                        <span className={itemClass(active)}>
                                            <PencilSquareIcon className="h-4 w-4 text-indigo-700" />
                                            {props.translator["Edit"]}
                                        </span>
                                    )}
                                </Menu.Item>
                            )
                        )}

                        {/* DELETE */}
                        {(((props.actions?.delete === true && props.module !== "User") || props.record.is_custom === "1")) && (
                            <Menu.Item as="button" type="button" onClick={() => props.deleteRecord(props.record.id)}>
                                {({ active }) => (
                                    <span className={itemClass(active)}>
                                        <TrashIcon className="h-4 w-4 text-red-500" />
                                        {props.translator["Delete"]}
                                    </span>
                                )}
                            </Menu.Item>
                        )}

                        {/* DOWNLOAD DOCUMENT */}
                        {props.actions?.download === true && props.module === "Document" && (
                            <Menu.Item as="a" href={route("download_document", props.record.id)}>
                                {({ active }) => (
                                    <span className={itemClass(active)}>
                                        <ArrowDownTrayIcon className="h-4 w-4 text-indigo-700" />
                                        Download
                                    </span>
                                )}
                            </Menu.Item>
                        )}

                        {/* DOWNLOAD INVOICE */}
                        {props.actions?.download === true && props.record.status === "success" && (
                            <Menu.Item as="a" href={route("invoices", props.record.id)}>
                                {({ active }) => (
                                    <span className={itemClass(active)}>
                                        <ArrowDownTrayIcon className="h-4 w-4 text-indigo-700" />
                                        Download
                                    </span>
                                )}
                            </Menu.Item>
                        )}

                        {/* UNLINK */}
                        {props.actions?.unlink === true && props.module === "User" && (
                            <Menu.Item as="button" type="button" onClick={() => props.unlinkRecord(props.record.id)}>
                                {({ active }) => (
                                    <span className={itemClass(active)}>
                                        <LinkIcon className="h-4 w-4 text-red-500" />
                                        Unlink
                                    </span>
                                )}
                            </Menu.Item>
                        )}
                    </div>
                </Menu.Items>
            </Transition>
        </Menu>
    );
}
