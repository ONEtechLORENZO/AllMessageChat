import React, { useEffect, useState, Fragment } from 'react';
import { Head, Link } from '@inertiajs/react';
import { ChevronDownIcon, LinkIcon, ChevronUpIcon, UserPlusIcon, PencilSquareIcon, TrashIcon, ArrowUpTrayIcon, ArrowDownTrayIcon } from '@heroicons/react/24/solid';
import Axios from "axios";
import Checkbox from '@/Components/Forms/Checkbox';
import { BiImport } from "react-icons/bi";
import { Menu, Transition } from '@headlessui/react'

import {
    Row,
    Col,
    Button,
    Nav,
    Container,
    NavItem,
    ListGroup,
    ListGroupItem,
    Card,
    CardBody,
    CardHeader,
    NavLink,
    TabContent,
    TabPane,
    Progress,
    ButtonGroup,
    CardFooter,
    Table,
    Popover,
    PopoverBody,
} from "reactstrap";

function ListTable(props) {

    const [fields, setFields] = useState([]);
    const [fieldOptions, setFieldOptions] = useState({});
    const pathname = window.location.pathname;
    const isDark = props.theme === 'dark' || props.dark;
    const emptyColSpan = Object.keys(props.headers || {}).length + ((props.actions?.mass_edit === true || props.actions?.merge === true) ? 1 : 0) + 1;
    useEffect(() => {
        fetchModuleFields();
    }, [props.headers]);

    function fetchModuleFields() {
        let endpoint_url = route('fetchModuleFields', { 'module': props.module });
        Axios.get(endpoint_url).then((response) => {
            if (response.data.status !== false) {
                setFields(response.data.fields);
                optionFields(response.data.fields);
            }
            else {
                notie.alert({ type: 'error', text: response.data.message, time: 5 });
            }
        })
    }

    function optionFields(fields) {

        if (fields) {
            Object.entries(fields).map(([key, field]) => {
                let newFieldOptions = Object.assign({}, fieldOptions);
                if (field.field_type == 'dropdown') {
                    newFieldOptions[field.field_name] = field.options;
                    setFieldOptions(newFieldOptions);
                }
            });
        }
    }

    return (
        <>
            <div className="">

                <div className={isDark ? "rounded-2xl border-0 bg-[#120815]/70 p-4" : "card p-4 mt-[20px]"}>

                    <Table className={`gio-table ${isDark ? 'gio-table-dark mb-0 text-white' : ''}`}>
                        <thead className={isDark ? "bg-[#202020]" : ""}>
                            <tr>
                                {(props.actions.mass_edit === true || props.actions.merge === true) &&
                                    <th>
                                        <Checkbox
                                            id={'checkall'}
                                            name={'checkall'}
                                            value={props.checkAll === true ? 1 : ''}
                                            handleChange={() => props.selectCheckAll()}
                                        />
                                    </th>
                                }
                                {Object.entries(props.headers).map(([name, field]) => {
                                    let visibility = 'invisible';
                                    let sort_order = 'desc';
                                    let sortable = true;
                                    if (props.sort_by && props.sort_by == name) {
                                        visibility = '';
                                        if (props.sort_order == 'desc') {
                                            sort_order = 'asc';
                                        }
                                    }
                                    if (name == 'tag' || name == 'list') {
                                        sortable = false;
                                    }

                                    return (
                                        <th
                                            key={name}
                                            scope="col"
                                            className={`py-3.5 pl-4 pr-3 text-left text-sm ${isDark ? 'bg-[#202020] text-white/80 border-0' : 'text-[#3D4459]'} sm:pl-4`}
                                        >
                                            <Link href="#" className={`group inline-flex ${isDark ? 'text-white/70' : 'text-gray-700'}`} onClick={() => { sortable ? sortColumn(name, sort_order) : '' }}>
                                                {props.translator[field.label]}
                                                <span className={`ml-2 flex-none rounded ${isDark ? 'text-white/40' : 'text-gray-400'} group-hover:visible group-focus:visible ` + visibility}>
                                                    {sortable &&
                                                        <>
                                                            {visibility == '' && props.sort_order == 'asc' ?
                                                                <ChevronUpIcon className="h-5 w-5" aria-hidden="true" />
                                                                :
                                                                <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
                                                            }
                                                        </>
                                                    }

                                                </span>
                                            </Link>
                                        </th>
                                    );
                                })}
                                <th className={isDark ? "bg-[#202020] border-0" : ""}></th>
                            </tr>
                        </thead>
                        <tbody className={isDark ? "bg-transparent" : "bg-white"}>
                            {(props.records).length === 0 &&
                                <tr>
                                    <td
                                        className={`px-6 py-4 border-t ${isDark ? 'border-white/10 bg-[#120815] text-white/60' : ''}`}
                                        colSpan={emptyColSpan}
                                    >
                                        {props.translator['No records found!']}
                                    </td>
                                </tr>}

                            {Object.entries(props.records).map(([key, record]) => (
                                <tr className={isDark ? "border-t border-white/10" : ""}>
                                    {(props.actions.mass_edit === true || props.actions.merge === true) &&
                                        <td className='px-2 py-2'>
                                            <Checkbox
                                                id={record.id}
                                                name={record.id}
                                                value={props.checkedId.includes(record.id) ? 1 : ''}
                                                handleChange={() => props.getCheckId(key, record.id)}
                                            />
                                        </td>
                                    }

                                    {Object.entries(props.headers).map(([name, field], index) => {

                                        let column_value = record[name];

                                        if (fields) {
                                            Object.entries(fields).map(([key, field]) => {
                                                if ((field.field_name == name) && field.is_custom && record.custom) {
                                                    column_value = record.custom[name];
                                                }
                                            });
                                        }

                                        if (props.actions.detail === true && index === 0) {
                                            var url = (props.module === 'User' || props.module === 'Company' || props.module === 'SupportRequest') && (props.current_user.role === 'global_admin' && (pathname.includes('admin/'))) ? 'detail_global_' + props.module : 'detail' + props.module
                                            column_value = <Link href={route(url, { id: record.id })} className='cursor-pointer underline'>
                                                {column_value}
                                            </Link>;

                                        }

                                        if (record.tags && name == 'tag') {
                                            var tagName = '';
                                            (record.tags).map((tag, tagIndex) => {
                                                if (tagIndex === 0 || tagIndex === 1) {
                                                    tagName += tag.name;
                                                    if (tagIndex === 0 && (record.tags).length > 1) {
                                                        tagName += ', ';
                                                    }
                                                }
                                            })
                                            column_value = tagName;
                                        }

                                        if (record.categorys && name == 'list') {
                                            var listName = '';
                                            (record.categorys).map((list, listIndex) => {
                                                if (listIndex === 0 || listIndex === 1) {
                                                    listName += list.name;
                                                    if (listIndex === 0 && (record.categorys).length > 1) {
                                                        listName += ', ';
                                                    }
                                                }
                                            })
                                            column_value = listName;
                                        }

                                        if (field.type == 'dropdown') {
                                            if (fieldOptions[name]) {
                                                column_value = (fieldOptions[name]) ? fieldOptions[name][column_value] : column_value;
                                            }
                                        } else if (field.type == 'multiselect') {
                                            column_value = (column_value) ? column_value.join(', ') : '';
                                        }

                                        if (field.type == 'checkbox') {
                                            if (name == 'status') {
                                                column_value = (column_value == 1) ? 'Active' : 'Inactive'
                                            } else {
                                                column_value = (column_value == 1) ? 'Yes' : 'No';
                                            }
                                        }
                                        var title = '';
                                        if ((field.type == 'textarea') && column_value) {
                                            title = column_value;
                                            column_value = column_value.substring(0, 20);
                                        }
                                        if (field.label == 'Website Url' && column_value) {
                                            column_value = column_value.substring(0, 40);
                                        }
                                        if (field.type == 'selectable') {
                                            if (column_value) {
                                                var ip_value = '';
                                                {
                                                    column_value.map((ip, index) => {
                                                        ip_value += ip.label;
                                                        var nextIndex = index + 1;
                                                        if (column_value[nextIndex]) {
                                                            ip_value += ', ';
                                                        }
                                                    })
                                                }
                                            }
                                            column_value = ip_value;
                                        }

                                        return (
                                            <td key={name} title={title} className={`whitespace-nowrap px-2 py-2 text-sm ${isDark ? 'bg-[#120815] text-white/70' : 'text-[#3D4459]'}`}>
                                                {column_value}
                                            </td>

                                        );
                                    })}
                                    {props.module == 'Transaction' &&
                                        <td>  <BiImport size={'1rem'} /></td>}
                                    {/* <td>
                                    <div className='flex gap-2'>
                                        {props.actions && props.actions.edit === true ?
                                            <>
                                            {props.edit_link ?
                                                <Link 
                                                    href={route(props.edit_link, record.id)}
                                                > 
                                                    <PencilSquareIcon className='h-4 w-4 cursor-pointer' />
                                                </Link>
                                            : 
                                                <PencilSquareIcon className='h-4 w-4 cursor-pointer' onClick={() => props.showEditForm(record.id)} />
                                            }
                                            </>
                                            
                                        : ""}
                                        {((props.actions && props.actions.delete === true && props.module != 'User') || ( props.module == 'User' && props.auth.user.role == 'global_admin') ) || (record.is_custom == '1') ?
                                            <TrashIcon className='h-4 w-4 text-red-600 cursor-pointer' onClick={() => props.deleteRecord(record.id)} />
                                        : ''}
                                        {(props.actions && props.actions.unlink === true && props.module == 'User')  ?
                                            <LinkIcon className='h-4 w-4 text-red-600 cursor-pointer' onClick={() => props.unlinkRecord(record.id)} />
                                        : ''}
                                        {props.actions.download === true && record.status === 'success' ? 
                                                <a href={route('invoices',record.id)} ><ArrowDownTrayIcon className='h-4 w-4 cursor-pointer' /></a>
                                        : ''}
                                        {props.actions.download === true && props.module === 'Document' && 
                                                <a href={route('download_document',record.id)} ><ArrowDownTrayIcon className='h-4 w-4 cursor-pointer' /></a>
                                        }
                                    </div>
                                </td> */}
                                    <td className={isDark ? "bg-[#120815]" : ""}>
                                        {props.actions &&
                                            <Menu as="div" className="relative inline-block text-left">
                                                <div>
                                                    <Menu.Button className={`inline-flex w-full justify-center rounded-md px-4 py-2 text-sm font-medium ${isDark ? 'text-white/70' : 'text-[#363740]'} hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75`}>
                                                        <svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M12 7.5C12.8284 7.5 13.5 6.82843 13.5 6C13.5 5.17157 12.8284 4.5 12 4.5C11.1716 4.5 10.5 5.17157 10.5 6C10.5 6.82843 11.1716 7.5 12 7.5Z" fill="currentColor" />
                                                            <path d="M12 13.5C12.8284 13.5 13.5 12.8284 13.5 12C13.5 11.1716 12.8284 10.5 12 10.5C11.1716 10.5 10.5 11.1716 10.5 12C10.5 12.8284 11.1716 13.5 12 13.5Z" fill="currentColor" />
                                                            <path d="M12 19.5C12.8284 19.5 13.5 18.8284 13.5 18C13.5 17.1716 12.8284 16.5 12 16.5C11.1716 16.5 10.5 17.1716 10.5 18C10.5 18.8284 11.1716 19.5 12 19.5Z" fill="currentColor" />
                                                        </svg>
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
                                                    <Menu.Items className={`absolute z-20 right-0 mt-2 w-56 origin-top-right divide-y ${isDark ? 'divide-white/10 bg-[#120815]' : 'divide-gray-100 bg-white'} rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none`}>
                                                        <div className="px-1 py-1 ">
                                                            {props.actions && props.actions.detail === true ?
                                                                <Menu.Item>
                                                                    {({ active }) => (
                                                                        <Link href={route('detail' + props.module, { id: record.id })} className='flex gap-2 p-2 items-center'>
                                                                            <svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                                <path d="M12 4.80273C7.61477 4.80273 4.19702 7.54773 0.0045166 11.9975C3.61652 15.8022 6.64727 19.1975 12 19.1975C17.3528 19.1975 21.2865 14.9 23.9955 12.0785C21.2228 8.77323 17.2883 4.80348 12 4.80348V4.80273ZM12 18.3972C7.24802 18.3972 4.38002 15.4505 1.10702 11.9982C5.00102 7.93773 8.09702 5.60298 12 5.60298C16.6208 5.60298 20.2313 8.93524 22.9185 12.0462C20.2763 14.8017 16.6988 18.398 12 18.398V18.3972Z" fill="#363740" />
                                                                                <path d="M12 7.20215C9.35404 7.20215 7.20154 9.35465 7.20154 11.9999C7.20154 14.6451 9.35404 16.7976 12 16.7976C14.646 16.7976 16.7985 14.6451 16.7985 11.9999C16.7985 9.35465 14.646 7.20215 12 7.20215ZM12 15.9981C9.79579 15.9981 8.00179 14.2049 8.00179 11.9999C8.00179 9.7949 9.79579 8.00165 12 8.00165C14.2043 8.00165 15.9983 9.7949 15.9983 11.9999C15.9983 14.2041 14.2043 15.9981 12 15.9981Z" fill="#363740" />
                                                                                <path d="M12 9.20117C10.4565 9.20117 9.20105 10.4567 9.20105 12.0002C9.20105 13.5437 10.4565 14.7992 12 14.7992C13.5435 14.7992 14.799 13.5437 14.799 12.0002C14.799 10.4567 13.5435 9.20117 12 9.20117ZM12 13.9997C10.8975 13.9997 10.0005 13.1027 10.0005 12.0002C10.0005 10.8977 10.8975 10.0007 12 10.0007C13.1025 10.0007 13.9995 10.8977 13.9995 12.0002C13.9995 13.1027 13.1025 13.9997 12 13.9997Z" fill="#363740" />
                                                                            </svg>
                                                                            View
                                                                        </Link>
                                                                    )}
                                                                </Menu.Item>
                                                                : ''}
                                                            {props.actions && props.actions.edit === true ?
                                                                <Menu.Item>
                                                                    {({ active }) => (
                                                                        <button className='flex gap-2 p-2 items-center' onClick={() => props.showEditForm(record.id)}>
                                                                            <svg width={20} height={20} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                                <path d="M15.3122 7.07081L5.6759 16.7071C5.48836 16.8946 5.23401 17 4.96879 17H4C3.44772 17 3 16.5523 3 16V15.0312C3 14.766 3.10536 14.5116 3.29289 14.3241L12.9292 4.6878M15.3122 7.07081L12.9292 4.6878M15.3122 7.07081C16.1065 6.27647 17.8541 4.84667 16.5037 3.4963C15.1533 2.14593 13.7235 3.89347 12.9292 4.6878" stroke="#363740" />
                                                                            </svg>
                                                                            Edit
                                                                        </button>
                                                                    )}
                                                                </Menu.Item>
                                                                : ''}
                                                            {props.actions && props.actions.delete === true ?
                                                                <Menu.Item>
                                                                    {({ active }) => (
                                                                        <button className='flex gap-2 p-2 items-center' onClick={() => props.deleteRecord(record.id)}>
                                                                            <svg width={20} height={20} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                                <path d="M16.3306 3.66965H12.9987V3.0034C12.9987 2.26715 12.4018 1.6709 11.6656 1.6709H8.3337C7.59745 1.6709 7.00058 2.26777 7.00058 3.0034V3.66965H3.6687V4.3359H4.35558L5.02245 16.9978C5.02245 17.734 5.61933 18.3309 6.35558 18.3309H13.6862C14.4225 18.3309 15.0193 17.734 15.0193 16.9978L15.675 4.3359H16.3318V3.66965H16.3306ZM7.66745 3.00277C7.66745 2.63527 7.96683 2.33652 8.3337 2.33652H11.6656C12.0331 2.33652 12.3318 2.63527 12.3318 3.00277V3.66902H7.66683V3.00277H7.66745ZM14.3537 16.9628L14.3525 16.9796V16.9971C14.3525 17.364 14.0537 17.6634 13.6862 17.6634H6.35558C5.9887 17.6634 5.68933 17.364 5.68933 16.9971V16.9796L5.6887 16.9621L5.02308 4.33527H15.0075L14.3537 16.9628Z" fill="#878787" />
                                                                                <path d="M9.66687 5.66797H10.3331V16.3305H9.66687V5.66797Z" fill="#878787" />
                                                                                <path d="M8.34871 16.3098L7.66683 5.66797L7.00183 5.71047L7.68371 16.3523L8.34871 16.3098Z" fill="#878787" />
                                                                                <path d="M13.0031 5.68934L12.3381 5.64746L11.6656 16.31L12.3306 16.3518L13.0031 5.68934Z" fill="#878787" />
                                                                            </svg>
                                                                            Delete
                                                                        </button>
                                                                    )}
                                                                </Menu.Item>
                                                                : ''}
                                                            {props.actions.download === true ?
                                                                <Menu.Item>
                                                                    {({ active }) => (
                                                                        <a href={route('download_document', record.id)} className="flex px-2"><ArrowDownTrayIcon className='h-4 w-4 cursor-pointer m-1' /> Download</a>
                                                                    )}
                                                                </Menu.Item>
                                                                : ''}
                                                        </div>
                                                    </Menu.Items>
                                                </Transition>
                                            </Menu>
                                        }

                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>

            </div>
        </>
    );
}

export default ListTable;












