import React, { useEffect, useState } from "react";
import { Link, router as Inertia } from "@inertiajs/react";
import { WiTime8 } from "react-icons/wi";
import Checkbox from "@/Components/Forms/Checkbox";
import Axios from "axios";
import notie from "notie";
import ToolMenu from "./ToolMenu";
import ActionMenu from "./ActionMenu";
import { SlScreenSmartphone } from "react-icons/sl";
import {
    BsFacebook,
    BsWhatsapp,
    BsInstagram,
    BsTelegram,
    BsLinkedin,
    BsTools,
} from "react-icons/bs";
import { GoMail } from "react-icons/go";
import { FaTiktok } from "react-icons/fa";
import { BiImport } from "react-icons/bi";
import { ListViewTimeFormate } from "./ListViewTimeFormate";

export default function ListViewTable(props) {
    const [fields, setFields] = useState([]);
    const [fieldOptions, setFieldOptions] = useState({});
    const [headers, setHeaders] = useState({});
    const [showAll, setShowAll] = useState(true);
    const pathname = window.location.pathname;
    const tableColSpan =
        Object.keys(headers).length +
        (props.actions.mass_edit === true || props.actions.merge === true
            ? 1
            : 0) +
        1;

    useEffect(() => {
        fetchModuleFields();

        // SET the Header Section
        if (props.customHeader && props.customHeader.length != 0) {
            setHeaders(props.customHeader);
        } else {
            setHeaders(props.headers);
        }
    }, [props.headers]);

    useEffect(() => {
        setShowAll(props.showAll);
    }, [props.showAll]);

    function fetchModuleFields() {
        let endpoint_url = route("fetchModuleFields", { module: props.module });
        Axios.get(endpoint_url).then((response) => {
            if (response.data.status !== false) {
                setFields(response.data.fields);
                optionFields(response.data.fields);
            } else {
                notie.alert({
                    type: "error",
                    text: response.data.message,
                    time: 5,
                });
            }
        });
    }

    function optionFields(fields) {
        if (fields) {
            Object.entries(fields).map(([key, field]) => {
                let newFieldOptions = Object.assign({}, fieldOptions);
                if (field.field_type == "dropdown") {
                    newFieldOptions[field.field_name] = field.options;
                    setFieldOptions(newFieldOptions);
                }
            });
        }
    }

    function sortColumn(field_name, sort_order) {
        if (field_name === "widget_name") field_name = "last_name";

        const url = props.sortRoute
            ? route(props.sortRoute)
            : props.module === "Transaction" || props.module === "Msg"
              ? route("wallet")
              : props.module === "Dashboard"
                ? route("dashboard")
                : route("list" + props.module);

        const page =
            props.module === "Transaction" || props.module === "Msg"
                ? props.currentPage
                : (props.paginator?.currentPage ?? 1);

        Inertia.get(
            url +
                `?page=${page}&search=${props.search}&sort_by=${field_name}&sort_order=${sort_order}` +
                (props.module === "Transaction" || props.module === "Msg"
                    ? `&current_page=Expenses`
                    : ""),
        );
    }

    return (
        <div className="">
            <div className="overflow-hidden md:rounded-lg bg-[#140816]/70 backdrop-blur-3xl border border-white/10 ring-1 ring-white/5">
                <table className="min-w-full divide-y divide-white/10">
                    <thead>
                        <tr className="text-white text-sm">
                            {(props.actions.mass_edit === true ||
                                props.actions.merge === true) && (
                                <th>
                                    <Checkbox
                                        id={"checkall"}
                                        name={"checkall"}
                                        value={props.checkAll === true ? 1 : ""}
                                        handleChange={() =>
                                            props.selectCheckAll()
                                        }
                                    />
                                </th>
                            )}
                            {Object.entries(headers).map(([name, field]) => {
                                let sort_order = "desc";
                                let sortable = true;
                                if (
                                    (props.sort_by && props.sort_by == name) ||
                                    (props.sort_by == "last_name" &&
                                        name == "widget_name")
                                ) {
                                    if (props.sort_order == "desc") {
                                        sort_order = "asc";
                                    }
                                }
                                if (
                                    name == "widget_tag" ||
                                    name == "widget_contacts" ||
                                    name == "widget_socials" ||
                                    name == "widget_list"
                                ) {
                                    sortable = false;
                                }

                                return (
                                    <th
                                        scope="col"
                                        key={name}
                                        className="py-3.5 pl-4 pr-3 text-left text-sm font-medium text-white sm:pl-4"
                                    >
                                        <span
                                            className="pb-[6px] border-b border-white/20 block text-white"
                                            onClick={() => {
                                                sortable
                                                    ? sortColumn(
                                                          name,
                                                          sort_order,
                                                      )
                                                    : "";
                                            }}
                                        >
                                            {field.label}
                                        </span>
                                    </th>
                                );
                            })}
                            <th className="text-right px-3 py-3.5" width="50px">
                                <ToolMenu
                                    module={props.module}
                                    headers={props.headers}
                                    customHeaders={props.customHeader}
                                    translator={props.translator}
                                    {...props}
                                />
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {props.records.length === 0 && (
                            <tr>
                                <td className="px-6 py-4 border-t border-white/10 text-[#878787]" colSpan="8">
                                    {" "}
                                    {props.translator["No records found!"]}{" "}
                                </td>
                            </tr>
                        )}
                        {Object.entries(props.records).map(([key, record]) => {
                            if (showAll === false && key > 4) return false;

                            return (
                                <tr key={record.id ?? key} className="bg-transparent">
                                    {(props.actions.mass_edit === true ||
                                        props.actions.merge === true) && (
                                        <td className="px-2 py-2">
                                            <Checkbox
                                                id={record.id}
                                                name={record.id}
                                                value={
                                                    props.checkedId.includes(
                                                        record.id,
                                                    )
                                                        ? 1
                                                        : ""
                                                }
                                                handleChange={() =>
                                                    props.getCheckId(
                                                        key,
                                                        record.id,
                                                    )
                                                }
                                            />
                                        </td>
                                    )}

                                    {Object.entries(headers).map(
                                        ([name, field], index) => {
                                            let title = "";
                                            let widget = false;
                                            let tmpWidgets = [];
                                            let column_value = record[name]
                                                ? record[name]
                                                : "";

                                            if (fields) {
                                                Object.entries(fields).map(
                                                    ([key, field]) => {
                                                        if (
                                                            field.field_name ==
                                                                name &&
                                                            field.is_custom &&
                                                            record.custom
                                                        ) {
                                                            column_value =
                                                                record.custom[
                                                                    name
                                                                ];
                                                        }
                                                    },
                                                );
                                            }

                                            if (name == "widget_name") {
                                                let first_name = record[
                                                    "first_name"
                                                ]
                                                    ? record["first_name"]
                                                    : " ";
                                                let last_name = record[
                                                    "last_name"
                                                ]
                                                    ? record["last_name"]
                                                    : " ";
                                                column_value =
                                                    first_name +
                                                    " " +
                                                    last_name;
                                            }

                                            if (name == "widget_contacts") {
                                                if (record.phones) {
                                                    let phoneNumbers =
                                                        record["phones"];
                                                    {
                                                        phoneNumbers &&
                                                            phoneNumbers.map(
                                                                (
                                                                    phone,
                                                                    index,
                                                                ) => {
                                                                    widget = true;
                                                                    if (
                                                                        index ===
                                                                        0
                                                                    ) {
                                                                        tmpWidgets.push(
                                                                            <div
                                                                                key={`phone-0`}
                                                                                className="text-[#878787] flex items-center gap-2"
                                                                            >
                                                                                <SlScreenSmartphone />{" "}
                                                                                {
                                                                                    phone[
                                                                                        "phones"
                                                                                    ]
                                                                                }
                                                                                {phoneNumbers.length >
                                                                                1 ? (
                                                                                    <div className="flex items-center text-[#878787]">
                                                                                        {" "}
                                                                                        +{" "}
                                                                                        {phoneNumbers.length -
                                                                                            1}{" "}
                                                                                    </div>
                                                                                ) : (
                                                                                    ""
                                                                                )}
                                                                            </div>,
                                                                        );
                                                                    }
                                                                },
                                                            );
                                                    }
                                                }

                                                if (record.emails) {
                                                    let EmailAddress =
                                                        record["emails"];
                                                    {
                                                        EmailAddress &&
                                                            EmailAddress.map(
                                                                (
                                                                    email,
                                                                    index,
                                                                ) => {
                                                                    widget = true;
                                                                    if (
                                                                        index ===
                                                                        0
                                                                    ) {
                                                                        tmpWidgets.push(
                                                                            <div
                                                                                key={`email-0`}
                                                                                className="text-[#878787] flex items-center gap-2"
                                                                            >
                                                                                <GoMail />
                                                                                {
                                                                                    email[
                                                                                        "emails"
                                                                                    ]
                                                                                }
                                                                                {EmailAddress.length >
                                                                                1 ? (
                                                                                    <div className="flex items-center text-[#878787]">
                                                                                        {" "}
                                                                                        +{" "}
                                                                                        {EmailAddress.length -
                                                                                            1}{" "}
                                                                                    </div>
                                                                                ) : (
                                                                                    ""
                                                                                )}
                                                                            </div>,
                                                                        );
                                                                    }
                                                                },
                                                            );
                                                    }
                                                }
                                            }

                                                if (name == "widget_socials") {
                                                    widget = true;
                                                    tmpWidgets.push(
                                                    <div className="inline-grid gap-2 grid-cols-4 text-[#878787]">
                                                        {record[
                                                            "facebook_username"
                                                        ] && (
                                                            <BsFacebook className="text-indigo-600" />
                                                        )}
                                                        {record[
                                                            "whatsapp_number"
                                                        ] && (
                                                            <BsWhatsapp className="text-green-500" />
                                                        )}
                                                        {record[
                                                            "instagram_username"
                                                        ] && (
                                                            <BsInstagram className="text-pink-500" />
                                                        )}
                                                        {record[
                                                            "telegram_number"
                                                        ] && (
                                                            <BsTelegram className="text-blue-400" />
                                                        )}
                                                        {record[
                                                            "tiktok_username"
                                                        ] && (
                                                            <FaTiktok className="text-gray-600" />
                                                        )}
                                                        {record[
                                                            "linkedin_username"
                                                        ] && (
                                                            <BsLinkedin className="text-blue-600" />
                                                        )}
                                                    </div>,
                                                );
                                            }

                                            if (name == "widget_tag") {
                                                if (record.tags) {
                                                    widget = true;
                                                    record.tags.map(
                                                        (tag, tagIndex) => {
                                                                if (
                                                                    tagIndex ===
                                                                        0 ||
                                                                    tagIndex === 1
                                                                ) {
                                                                    tmpWidgets.push(
                                                                        <span
                                                                            key={`tag-${tag.id ?? tagIndex}`}
                                                                            className="inline-flex items-center !rounded bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800"
                                                                        >
                                                                            {
                                                                                tag.name
                                                                            }
                                                                        </span>,
                                                                    );
                                                                }
                                                            },
                                                        );
                                                    {
                                                        record.tags.length > 2
                                                            ? tmpWidgets.push(
                                                                  <div className="flex items-center text-[#878787]">
                                                                      {" "}
                                                                      +{" "}
                                                                      {record[
                                                                          "tags"
                                                                      ].length -
                                                                          2}{" "}
                                                                  </div>,
                                                              )
                                                            : "";
                                                    }
                                                }
                                            }

                                            if (name == "widget_list") {
                                                if (record.categorys) {
                                                    widget = true;
                                                    record.categorys.map(
                                                        (
                                                            category,
                                                            categoryIndex,
                                                        ) => {
                                                            if (
                                                                categoryIndex ===
                                                                    0 ||
                                                                categoryIndex ===
                                                                    1
                                                            ) {
                                                                tmpWidgets.push(
                                                                    <span className="inline-flex items-center !rounded bg-[#f6d41b61] px-2 text-xs font-semibold leading-5 text-[#bd810e]">
                                                                        {
                                                                            category.name
                                                                        }
                                                                    </span>,
                                                                );
                                                            }
                                                        },
                                                    );
                                                    {
                                                        record.categorys
                                                            .length > 2
                                                            ? tmpWidgets.push(
                                                                  <div className="flex items-center text-[#878787]">
                                                                      {" "}
                                                                      +{" "}
                                                                      {record[
                                                                          "categorys"
                                                                      ].length -
                                                                          2}{" "}
                                                                  </div>,
                                                              )
                                                            : "";
                                                    }
                                                }
                                            }

                                            if (
                                                props.actions.detail === true &&
                                                index === 0
                                            ) {
                                                var url =
                                                    (props.module === "User" ||
                                                        props.module ===
                                                            "Company" ||
                                                        props.module ===
                                                            "SupportRequest") &&
                                                    props.current_user.role ===
                                                        "global_admin" &&
                                                    pathname.includes("admin/")
                                                        ? "detail_global_" +
                                                          props.module
                                                        : "detail" +
                                                          props.module;
                                                column_value = (
                                                    <div className="ml-4">
                                                        <div className="font-medium text-[#878787]">
                                                            <Link
                                                                href={route(
                                                                    url,
                                                                    {
                                                                        id: record.id,
                                                                    },
                                                                )}
                                                                className="cursor-pointer underline text-[#878787]"
                                                            >
                                                                {column_value}
                                                            </Link>
                                                        </div>
                                                        {record.updated_at && (
                                                            <div className="text-[#878787] flex items-center gap-1">
                                                                <WiTime8 />{" "}
                                                                <ListViewTimeFormate
                                                                    time={
                                                                        record.updated_at
                                                                    }
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            }

                                            if (field.type == "dropdown") {
                                                if (fieldOptions[name]) {
                                                    column_value = fieldOptions[
                                                        name
                                                    ]
                                                        ? fieldOptions[name][
                                                              column_value
                                                          ]
                                                        : column_value;
                                                }
                                            } else if (
                                                field.type == "multiselect"
                                            ) {
                                                column_value = column_value
                                                    ? column_value.join(", ")
                                                    : "";
                                            }

                                            if (field.type == "checkbox") {
                                                if (name == "status") {
                                                    column_value =
                                                        column_value == 1
                                                            ? "Active"
                                                            : "Inactive";
                                                } else {
                                                    column_value =
                                                        column_value == 1
                                                            ? "Yes"
                                                            : "No";
                                                }
                                            }

                                            if (
                                                field.type == "textarea" &&
                                                column_value
                                            ) {
                                                title = column_value;
                                                column_value =
                                                    column_value.substring(
                                                        0,
                                                        20,
                                                    );
                                            }

                                            if (
                                                field.name == "url" &&
                                                column_value
                                            ) {
                                                column_value = (
                                                    <a
                                                        href={column_value}
                                                        target="_blank"
                                                    >
                                                        {column_value.substring(
                                                            0,
                                                            40,
                                                        )}
                                                    </a>
                                                );
                                            }

                                            if (field.type == "selectable") {
                                                if (column_value) {
                                                    var ip_value = "";
                                                    {
                                                        column_value.map(
                                                            (ip, index) => {
                                                                ip_value +=
                                                                    ip.label;
                                                                var nextIndex =
                                                                    index + 1;
                                                                if (
                                                                    column_value[
                                                                        nextIndex
                                                                    ]
                                                                ) {
                                                                    ip_value +=
                                                                        ", ";
                                                                }
                                                            },
                                                        );
                                                    }
                                                }
                                                column_value = ip_value;
                                            }

                                            return (
                                                <td
                                                    key={name}
                                                    title={title}
                                                    className="whitespace-nowrap px-2 py-2 text-sm text-[#878787]"
                                                >
                                                    {widget === true
                                                        ? tmpWidgets.map(
                                                              (tmp, i) =>
                                                                  React.cloneElement(
                                                                      tmp,
                                                                      {
                                                                          key: i,
                                                                      },
                                                                  ),
                                                          )
                                                        : column_value}
                                                </td>
                                            );
                                        },
                                    )}

                                    {props.module == "Transaction" && (
                                        <td>
                                            {" "}
                                            <BiImport size={"1rem"} />{" "}
                                        </td>
                                    )}
                                    <td>
                                        {props.actions &&
                                        props.module != "Message" ? (
                                            <ActionMenu
                                                record={record}
                                                fields={fields}
                                                {...props}
                                            />
                                        ) : (
                                            ""
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                        {props.records.length > 0 && (
                            <tr>
                                <td colSpan={tableColSpan} className="pt-3"></td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
