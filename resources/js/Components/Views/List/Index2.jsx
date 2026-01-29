import React, { useEffect, useState, Fragment } from 'react';
import Pagination from '@/Components/Pagination';
import Alert from '@/Components/Alert';
// import Button from '@/Components/Forms/Button';
import Axios from "axios";
import Form from '@/Components/Forms/Form';
import { ChevronDownIcon, ChevronUpIcon, UserPlusIcon, PencilSquareIcon, TrashIcon, ArrowUpTrayIcon, ArrowDownTrayIcon, RectangleStackIcon, BriefcaseIcon, Bars3Icon } from '@heroicons/react/24/solid';
import notie from 'notie';
import Search from './Search';
import { Head, Link, router as Inertia } from '@inertiajs/react';
import Filter from "./Filter2";
import axios from "axios";
import { Menu, Transition } from '@headlessui/react'
import MassEdit from './MassEdit';
import { Button } from "reactstrap";
import { CalenderIcon } from '@/Pages/icons';
import ListViewTable from './ListViewTable';
import NewForm from '@/Components/Forms/NewForm';
import CalenderMenu from './CalenderMenu';
import CustomCalender from './CustomCalender';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import nProgress from 'nprogress';

function ListView(props) {
    const [showForm, setShowForm] = useState(false);
    const [records, setRecords] = useState([]);
    const [recordId, setRecordId] = useState('');
    const [fieldOptions, setFieldOptions] = useState({});
    const [showMassEdit, setShowMassEdit] = useState(false);
    const [checkedId, setCheckedId] = useState([]);
    const [checkAll, setCheckAll] = useState(false);

    useEffect(() => {
        setRecords(props.records);
    }, [props.records]);

    /**
     * Hide form and reset the Record ID
     */
    function hideForm() {
        setShowForm(false);
        setRecordId('');
    }

    /**
     * Show Form
     * 
     * @param {string} record_id 
     */
    function showEditForm(record_id) {
        if (props.module == 'Automation') {
            Inertia.get(route('createAutomation', record_id));
            return false;
        }

        setRecordId(record_id);
        setShowForm(true);
    }

    /**
     * 
     * @param {Integer} record_id 
     * @param {Boolean} soft_delete 
     * @returns 
     */
    function deleteRecord(record_id, soft_delete = false) {

        var recordData = { id: record_id };

        if (props.module == 'User') {

            if (props.auth.user.id == record_id) {
                notie.alert({ type: 'error', text: props.translator['you can not delete your profile.'], time: 5 });
                return false;
            }

            var msg = 'Are you sure you want to delete the user?';
            if (soft_delete) {
                recordData['is_soft'] = true;
                msg = 'Are you sure you want to unlink the user?'
            }
            let confirmUserDelete = window.confirm(msg);
            if (!confirmUserDelete) {
                return;
            }

        } else {
            let confirm = window.confirm(props.translator['Are you sure you want to delete the record?']);
            if (!confirm) {
                return;
            }
        }
        Inertia.delete(route('delete' + props.module, recordData), {}, {
            onSuccess: (response) => {
                notie.alert({ type: 'success', text: 'Record deleted successfully', time: 5 });
            },
            onError: (errors) => {
                notie.alert({ type: 'error', text: errors.message, time: 5 });
            }
        });
    }

    /**
     * Get dropdown field options
     */
    function getFieldOptions(name) {
        let newFieldOptions = Object.assign({}, fieldOptions);
        axios({
            method: 'get',
            url: route('get_field_options', { 'field_name': name, 'module_name': props.module }),
        })
            .then((response) => {
                newFieldOptions[name] = response.data.options;
                setFieldOptions(newFieldOptions);
            });
    }

    // Get current check field id 
    function getCheckId(key, id) {
        let newCheck = Object.assign([], checkedId);
        const recordLength = props.records.length;
        const index = newCheck.indexOf(id);
        if (index > -1) {
            newCheck.splice(index, 1);
        } else {
            newCheck.push(id);
        }
        setCheckedId(newCheck)
        if (recordLength == newCheck.length) {
            setCheckAll(true);
        } else {
            setCheckAll(false);
        }

    }

    // Check select all field 
    function selectCheckAll() {
        let newCheck = Object.assign([], checkedId);
        if (!checkAll) {
            if (props.records) {
                (props.records).map((record) => {
                    !newCheck.includes(record.id) ? newCheck.push(record.id) : "";
                    setCheckedId(newCheck);
                });
            }
            setCheckAll(true);
        } else {
            setCheckedId([]);
            setCheckAll(false);
        }
    }

    function massEdit() {
        const length = checkedId.length;
        if (length) {
            setShowMassEdit(true);
        } else {
            notie.alert({ type: 'warning', text: 'Please select a record first.', time: 5 });
        }
    }

    function hideMassEdit() {
        setShowMassEdit(false);
        setCheckedId([]);
        setCheckAll(false);
    }

    function recordMerger() {
        const recordLength = checkedId.length;
        if (recordLength >= 2) {

            let data = {
                'id': checkedId.join(','),
                'module': props.module
            }

            Inertia.get(route('record_merge', data));
        } else {
            notie.alert({ type: 'warning', text: 'Please select more than one records', time: 5 });
        }
    }

    function unlinkRecord(recordId) {
        props.setParent(recordId);
        props.setShowCompanies(true);
    }

    function multiRecordDeleter() {
        const length = checkedId.length;
        if (length !== 0) {
            confirmAlert({
                title: (props.translator['Confirm to Delete']),
                message: (props.translator['Are you sure to do this?']),
                buttons: [{
                    label: (props.translator['Yes']),
                    onClick: () => {
                        nProgress.start(0.5);
                        nProgress.inc(0.2);
                        let data = { 'checkId': checkedId };
                        Inertia.post(route('group_delete'), data, {
                            onSuccess: () => {
                                nProgress.done()
                                notie.alert({ type: 'success', text: 'Your record has been deleted.', time: 5 });
                            }
                        })
                    }
                },
                { label: (props.translator['No']) }
                ]
            });

        } else {
            notie.alert({ type: 'warning', text: 'Please select a record first.', time: 5 });
        }
    }

    return (
        <>
            <div className="px-4 sm:px-6 lg:px-8 ">
                {(props.show_header && props.show_header === true) || (props.show_header == undefined) ?
                    <div className="flex min-w-0 justify-between">
                        <Head title={props.translator[props.module]} />
                        <div className='flex gap-3'>
                            {(props.module === 'Transaction') || (props.module === 'Msg') ?
                                <div className='flex items-center gap-3'>
                                    <CustomCalender {...props} />
                                    <div className='flex items-center'> <CalenderMenu  {...props} />  </div>
                                </div>
                                : ''}
                            {(props.module == 'User') ? <h2 className="text-2xl text-[#363740] leading-7 font-semibold sm:text-2xl sm:truncate">{props.plural}</h2> : ""}
                            {props.actions && props.actions.search === true ?
                                <Search
                                    module={props.module}
                                    search={props.search}
                                    mod={props.mod}
                                    currentPage={props.paginator.currentPage}
                                    sort_by={props.sort_by}
                                    sort_order={props.sort_order}
                                    translator={props.translator}
                                />
                                : ''}

                            {props.actions && props.actions.filter === true &&
                                <Filter
                                    module={props.module}
                                    filter={props.filter}
                                    currentPage={props.paginator.currentPage}
                                    sort_by={props.sort_by}
                                    sort_order={props.sort_order}
                                    translator={props.translator}
                                />
                            }
                        </div>
                        <div className='flex gap-3 align-self-center'>
                            {props.actions && props.actions.invite_user === true ?
                                <>
                                    <Button

                                        type='button'
                                        onClick={() => props.setInviteUser(true)}
                                    >
                                        <div className='flex'> <UserPlusIcon className='h-4 w-4 mr-1' /> {props.translator['Invite Users']} </div>
                                    </Button>
                                </>
                                : ''}
                            {props.actions && props.actions.new_catalog === true ?
                                <>
                                    <Button
                                        type='button'
                                        onClick={() => props.setShowCatalog(true)}
                                    >
                                        <div className='flex'> <BriefcaseIcon className='h-4 w-4 mr-1' /> New Catalog </div>
                                    </Button>
                                </>
                                : ''}
                            {props.actions && props.actions.field_group === true ?
                                <>
                                    <Button
                                        type='button'
                                        onClick={() => props.setFieldGroup(true)}
                                        className='d-flex gap-1 items-center px-4 py-2 font-semibold shadow-md text-sm btn-square'
                                        color="light"
                                    >
                                        {props.translator['Add Field Group']}
                                    </Button>
                                </>
                                : ''}
                            {props.actions && props.actions.order_field === true ?
                                <>
                                    <Button
                                        type='button'
                                        onClick={() => props.setOrderFields(true)}
                                        className='d-flex gap-1 items-center px-4 py-2 font-semibold shadow-md text-sm btn-square'
                                        color="light"
                                    >
                                        {props.translator['Order fields']}
                                    </Button>
                                </>
                                : ''}
                            {/*                         
                        {props.actions && props.actions.merge === true ?
                            <>
                                <Button
                                    className='d-flex gap-1 items-center px-4 py-2 font-semibold shadow-md text-sm btn-square'
                                    color="light"
                                    onClick={() => recordMerger()}
                                >
                                    <RectangleStackIcon className='h-4 w-4' /> Merge
                                </Button>
                            </>
                        : ''} 
                        {props.actions && props.actions.import === true ?
                            <>
                                <Link 
                                    href={route('listImport')}
                                    className='d-flex gap-1 items-center px-4 py-2 font-semibold shadow-md text-sm btn btn-light'
                                > 
                                    <ArrowUpTrayIcon className='h-4 w-4 cursor-pointer' /> Import 
                                </Link>
                            </>
                        : ''}
                        {props.actions && props.actions.export === true ?
                            <>
                                <a href={(route('export',{'exportmod':props.module})+'&search=' + props.search+'&filter='+props.filter_condition+(props.filter_id !='' ? '&filter_id='+props.filter_id:''))} 
                                    className='d-flex gap-1 items-center px-4 py-2 font-semibold shadow-md text-sm btn btn-light'
                                >
                                    <ArrowDownTrayIcon className='h-4 w-4' /> Export 
                                </a>
                            </>
                        : ''}
                        {props.module!=='Transaction' && props.module!=='Msg' && props.actions && props.actions.mass_edit === true ?
                            <>
                                <Button
                                    className='d-flex gap-1 items-center px-4 py-2 font-semibold shadow-md text-sm btn-square'
                                    onClick={() => massEdit()}
                                >
                                    <PencilSquareIcon className='h-4 w-4' /> Mass edit
                                </Button>
                            </>
                        : ''}
                        */}
                            {props.actions && props.actions.create === true &&
                                <>
                                    {props.add_link &&
                                        <Link
                                            href={props.add_link}
                                            className='inline-flex items-center px-4 py-2 bg-primary border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest active:bg-gray-900 transition ease-in-out duration-150'
                                        >
                                            {props.add_button_text}
                                        </Link>
                                    }

                                    {!props.add_link &&
                                        <Button
                                            type='button'
                                            color='primary'
                                            onClick={() => setShowForm(true)}
                                        >
                                            {props.add_button_text ? props.add_button_text : `${props.translator['Add']} ${props.singular}`}
                                        </Button>
                                    }
                                </>
                            }
                            <DropDown
                                massEdit={massEdit}
                                recordMerger={recordMerger}
                                multiRecordDeleter={multiRecordDeleter}
                                {...props}
                            />
                        </div>
                    </div>
                    : ''}

                <div className="mt-2 flex flex-col">
                    <div className="">
                        <div className="inline-block min-w-full py-2 align-middle">
                            <ListViewTable
                                module={props.module}
                                headers={props.headers}
                                records={props.records}
                                paginator={props.paginator}
                                fieldOptions={fieldOptions}
                                getFieldOptions={getFieldOptions}
                                deleteRecord={deleteRecord}
                                unlinkRecord={unlinkRecord}
                                showEditForm={showEditForm}
                                checkAll={checkAll}
                                checkedId={checkedId}
                                getCheckId={getCheckId}
                                selectCheckAll={selectCheckAll}
                                current_user={props.current_user}
                                translator={props.translator}
                                {...props}
                            />
                            {Object.entries(records).length != 0 &&

                                <Pagination
                                    module={props.module}
                                    paginator={props.paginator}
                                    {...props}
                                />
                            }
                        </div>
                    </div>
                </div>
            </div>

            {showForm ?
                <NewForm
                    module={props.module}
                    heading={props.heading}
                    hideForm={hideForm}
                    recordId={recordId}
                    translator={props.translator}
                    mod={props.mod}
                    productList={props.productList}
                    current_user={props.current_user}
                    {...props}
                />
                : ''}

            {showMassEdit ?
                <MassEdit
                    module={props.module}
                    checkId={checkedId}
                    hideMassEdit={hideMassEdit}
                    {...props}
                />
                : ''}
        </>
    )
}

function DropDown(props) {

    return (
        <Menu as="div" className="relative inline-block text-left">
            <div>
                <Menu.Button className="inline-flex w-full justify-center rounded-md bg-white px-2 py-2 text-sm font-medium text-[#363740] hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
                    <Bars3Icon className='h-5 w-5' />
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
                    <div className="px-1 py-1 ">

                        {props.actions && props.actions.export === true &&
                            <Menu.Item>
                                {({ active }) => (
                                    <button className=' items-center'>
                                        <a href={(route('export', { 'exportmod': props.module }) + '&search=' + props.search + '&filter=' + props.filter_condition + (props.filter_id != '' ? '&filter_id=' + props.filter_id : ''))}
                                            className='d-flex gap-1 items-center px-4 py-2 font-semibold text-sm text-gray-700 hover:text-indigo-700'
                                        >
                                            <ArrowUpTrayIcon className='h-4 w-4 text-indigo-700' /> {props.translator['Export']}
                                        </a>

                                    </button>
                                )}
                            </Menu.Item>
                        }
                        {props.actions && props.actions.import === true &&
                            <Menu.Item>
                                {({ active }) => (
                                    <Link
                                        href={route('listImport')}
                                        className='d-flex gap-1 items-center px-4 py-2 font-semibold text-sm text-gray-700 hover:text-indigo-700'
                                    >
                                        <ArrowDownTrayIcon className='h-4 w-4 cursor-pointer text-indigo-700' /> {props.translator['Import']}
                                    </Link>
                                )}
                            </Menu.Item>
                        }
                        {(props.module !== 'Transaction' && props.module !== 'Msg' && props.actions && props.actions.mass_edit === true) &&
                            <Menu.Item>
                                {({ active }) => (
                                    <button
                                        className='d-flex gap-1 items-center px-4 py-2 font-semibold text-sm text-gray-700 hover:text-indigo-700'
                                        onClick={() => props.massEdit()}
                                    >
                                        <PencilSquareIcon className='h-4 w-4 text-indigo-700' />  {props.translator['Mass edit']}
                                    </button>
                                )}
                            </Menu.Item>
                        }
                        {(props.actions && props.actions.merge === true) &&
                            <Menu.Item>
                                {({ active }) => (
                                    <button className='d-flex gap-1 items-center px-4 py-2 font-semibold text-sm text-gray-700 hover:text-indigo-700' onClick={() => props.recordMerger()}>
                                        <svg width={20} height={20} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M13.51 4.39453C12.182 4.39453 10.962 4.86103 10 5.63553C9.00703 4.83214 7.76831 4.39405 6.49102 4.39453C3.39952 4.39453 0.884521 6.90853 0.884521 9.99953C0.884521 13.091 3.39952 15.6055 6.49102 15.6055C7.81902 15.6055 9.03852 15.139 10 14.364C10.9932 15.1679 12.2323 15.6061 13.51 15.6055C16.6015 15.6055 19.116 13.091 19.116 9.99953C19.1155 6.90853 16.601 4.39453 13.51 4.39453ZM6.49102 15.1385C3.65702 15.1385 1.35152 12.833 1.35152 9.99953C1.35152 7.16653 3.65702 4.86153 6.49102 4.86153C7.67952 4.86153 8.77202 5.27103 9.64352 5.95103C8.57452 6.97203 7.90402 8.40753 7.90402 9.99953C7.90402 11.5915 8.57402 13.027 9.64352 14.0485C8.74438 14.7546 7.63426 15.1384 6.49102 15.1385ZM13.51 15.1385C12.321 15.1385 11.2285 14.729 10.3565 14.0485C10.9057 13.5268 11.3431 12.8988 11.6419 12.2027C11.9408 11.5066 12.095 10.7571 12.095 9.99953C12.095 8.40803 11.425 6.97253 10.3565 5.95103C11.2559 5.24495 12.3661 4.86113 13.5095 4.86103C16.343 4.86103 18.6485 7.16603 18.6485 9.99903C18.649 12.833 16.3435 15.1385 13.51 15.1385Z" fill="#878787" />
                                        </svg>
                                        {props.translator['Merge']}
                                    </button>
                                )}
                            </Menu.Item>
                        }
                        {(props.module !== 'Transaction' && props.module !== 'Msg' && props.actions && props.actions.mass_edit === true) &&
                            <Menu.Item>
                                {({ active }) => (
                                    <button
                                        className='d-flex gap-1 items-center px-4 py-2 font-semibold text-sm text-gray-700 hover:text-indigo-700'
                                        onClick={() => props.multiRecordDeleter()}
                                    >
                                        <TrashIcon className='h-4 w-4 text-red-500' />  {props.translator['Delete']}
                                    </button>
                                )}
                            </Menu.Item>
                        }
                    </div>
                </Menu.Items>
            </Transition>
        </Menu>
    )
}


export default ListView;









