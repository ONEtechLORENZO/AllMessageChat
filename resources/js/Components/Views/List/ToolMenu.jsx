import React, { useEffect, useState, Fragment } from "react";
import { BsTools } from "react-icons/bs";
import { Menu, Transition } from "@headlessui/react";
import Axios from "axios";
import { router as Inertia } from "@inertiajs/react";
import notie from "notie";
import { Button } from "reactstrap";

export default function ToolMenu(props) {
    const [fieldGroup, setFieldGroup] = useState();
    const [columnOptions, setColumnOptions] = useState(props.headers);
    const customHeader = [
        { name: "widget_tag", label: props.translator["Tag"], type: "text" },
        { name: "widget_list", label: props.translator["List"], type: "text" },
    ];

    useEffect(() => {
        getFieldGroupMenu(props.module);
    }, []);

    useEffect(() => {
        if (props.customHeaders && props.customHeaders.length !== 0) {
            customViewHeader(props.customHeaders);
        }
    }, [props]);

    function customViewHeader(headers) {
        let newfield = Object.assign({}, columnOptions);
        Object.entries(headers).map(([key, header]) => {
            customHeader.map((custom) => {
                if (custom.name == key) {
                    newfield[key] = header;
                }
            });
        });
        setColumnOptions(newfield);
    }

    function getFieldGroupMenu(module) {
        let url = route("field_group_menu", { module: module });
        Axios.get(url).then((response) => {
            setFieldGroup(response.data.fieldGrouplist);
        });
    }

    const columnHandler = (field) => () => {
        let newfield = Object.assign({}, columnOptions);
        let fieldName = field.name;
        if (!columnOptions[fieldName]) {
            newfield[field.name] = field;
        } else {
            delete newfield[fieldName];
        }
        setColumnOptions(newfield);
    };

    function saveSelectedColumn() {
        if (columnOptions && Object.keys(columnOptions).length != 0) {
            Inertia.post(route("showColumns", [props.module]), {
                columns: columnOptions,
            });
        } else {
            notie.alert({
                type: "error",
                text: "Please select atleast one field",
                time: 5,
            });
        }
    }

    return (
        <Menu as="div" className="inline-block text-left ml-auto">
            <div>
                <Menu.Button className="w-12 h-12 bg-[#BF00FF] hover:bg-[#a000d6] rounded shadow-sm flex justify-center items-center text-white">
                    <BsTools />
                </Menu.Button>
            </div>

            <Transition
                as={Fragment}
                enter="transition ease-out duration-100 "
                enterFrom="transform opacity-0 scale-95 "
                enterTo="transform opacity-100 scale-100 "
                leave="transition ease-in duration-75 "
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <Menu.Items
                    className={
                        "absolute whitespace-nowrap right-9 mt-2 w-auto min-w-[500px] max-w-xl  z-[500] p-6  origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none overflow-y-auto"
                    }
                >
                    <div className="font-semibold text-xl">
                        {props.translator["Customize view"]}
                    </div>
                    <div className="flex mt-2">
                        {props.module == "Contact" &&
                            customHeader.map((header, key) => {
                                return (
                                    <div className="flex px-2 ml-2">
                                        <div className="flex items-center h-5">
                                            <input
                                                type="checkbox"
                                                id={header.name}
                                                name={header.name}
                                                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                                onChange={columnHandler(header)}
                                                checked={
                                                    columnOptions[header.name]
                                                }
                                            />
                                        </div>
                                        <div className="ml-3 text-sm">
                                            <label
                                                htmlFor="terms_condition"
                                                title="Click here to read it"
                                                className="font-medium text-gray-700"
                                            >
                                                {props.translator[header.label]}
                                            </label>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                    <div className="!mt-4 grid grid-cols-3 gap-7">
                        {fieldGroup &&
                            Object.entries(fieldGroup).map(
                                ([group, fields]) => (
                                    <div>
                                        <div className="text-sm font-semibold">
                                            {props.translator[group]}
                                        </div>
                                        <ul
                                            role="list"
                                            className="m-h-64 !mt-1 !pl-0 pr-2"
                                        >
                                            {fields.map((field) => {
                                                if (
                                                    field.name == "emails" ||
                                                    field.name == "phones" ||
                                                    field.name == "images"
                                                ) {
                                                    return;
                                                }
                                                return (
                                                    <li className="p-1 mx-2">
                                                        <div className="form-group col-span-6 sm:col-span-4">
                                                            <div className="flex items-start">
                                                                <div className="flex items-center h-5">
                                                                    <input
                                                                        type="checkbox"
                                                                        id={
                                                                            field.name
                                                                        }
                                                                        name={
                                                                            field.name
                                                                        }
                                                                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                                                        value={
                                                                            field.name
                                                                        }
                                                                        onChange={columnHandler(
                                                                            field,
                                                                        )}
                                                                        checked={
                                                                            columnOptions[
                                                                                field
                                                                                    .name
                                                                            ]
                                                                        }
                                                                    />
                                                                </div>
                                                                <div className="ml-3 text-sm">
                                                                    <label
                                                                        htmlFor="terms_condition"
                                                                        title="Click here to read it"
                                                                        className="font-medium text-gray-700"
                                                                    >
                                                                        <span>
                                                                            {
                                                                                props
                                                                                    .translator[
                                                                                    field
                                                                                        .label
                                                                                ]
                                                                            }
                                                                        </span>
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                ),
                            )}
                    </div>
                    <Menu.Item>
                        <div className="justify-center flex">
                            <Button
                                onClick={() => saveSelectedColumn()}
                                className="m-2 w-24 inline-flex justify-center items-center pr-5 py-2 bg-primary border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest active:bg-gray-900 transition ease-in-out duration-150"
                            >
                                {props.translator["Save"]}
                            </Button>
                        </div>
                    </Menu.Item>
                </Menu.Items>
            </Transition>
        </Menu>
    );
}
