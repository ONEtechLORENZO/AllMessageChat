import React, { useEffect, useState } from 'react';
import Pagination from '@/Components/Pagination';
import Alert from '@/Components/Alert';
import Button from '@/Components/Forms/Button';
import Form from '@/Components/Forms/Form';
import { ChevronDownIcon, ChevronUpIcon, UserAddIcon, PencilAltIcon, TrashIcon, UploadIcon, DownloadIcon } from '@heroicons/react/solid';
import { Inertia } from '@inertiajs/inertia';
import notie from 'notie';
import Search from './Search';
import { Head,Link } from '@inertiajs/inertia-react';
import Filter from "./Filter2";
import axios from "axios";
import ListTable from './ListTable';

function ListView(props)
{
    const [showForm, setShowForm] = useState(false);

    const [records, setRecords] = useState([]);

    const [recordId, setRecordId] = useState('');

    const [fieldOptions, setFieldOptions ] = useState({});

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
    function showEditForm(record_id)
    {
        setRecordId(record_id);
        setShowForm(true);
    }

    /**
     * Delete record
     * 
     * @param {string} record_id 
     */
    function deleteRecord(record_id)
    {
        let confirm = window.confirm(props.translator['Are you sure you want to delete the record?']);
        if(!confirm) {
            return;
        }

        Inertia.delete(route('delete' + props.module, {id: record_id}), {}, {
            onSuccess: (response) => { 
                notie.alert({type: 'success', text: 'Record deleted successfully', time: 5});
            },
            onError: (errors) => {
                notie.alert({type: 'error', text: errors.message, time: 5});
            }
        });
    }

    /**
     * Get dropdown field options
     */
    function getFieldOptions(name){
        let newFieldOptions = Object.assign({}, fieldOptions);
        axios({
            method: 'get',
            url: route('get_field_options', {'field_name': name, 'module_name': props.module}),
        })
        .then( (response) =>{
          newFieldOptions[name] = response.data.options;
          setFieldOptions(newFieldOptions);
        });
    }

    /**
     * Sort list view column
     * 
     * @param {string} field_name 
     * @param {string} sort_order
     */
    function sortColumn(field_name, sort_order)
    {
        Inertia.get(route('list' + props.module) + '?page='+ props.paginator.currentPage +'&search=' + props.search + '&sort_by=' + field_name + '&sort_order=' + sort_order);
    }

    if(props.errors.message){
        notie.alert({type: 'error', text: props.errors.message, time: 5});
    }
   
    return (
        <>
            <div className="px-4 sm:px-6 lg:px-8 bg-[#FBFBFBBF]">
                <div className="flex min-w-0 justify-between">
                    <Head title={props.module} />
                    <div className='flex gap-6'>
                        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">{props.plural}</h2>
                        {props.actions && props.actions.search === true ?
                            <Search 
                                module={props.module} 
                                search={props.search}
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
                    <div className='flex gap-4'>
                        {props.actions && props.actions.invite_user === true ?
                            <>
                                <button 
                                    type = 'button'
                                    onClick={() => props.setInviteUser(true) }
                                    className='inline-flex items-center px-4 py-2 border border-transparent rounded-md font-semibold shadow-md text-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3D4459]'
                                > 
                                    <UserAddIcon className='h-4 w-4 mr-1' /> Invite Users 
                                </button>
                            </>
                        : ''}
                        {props.actions && props.actions.field_group === true ?
                            <>
                                <button 
                                    type = 'button'
                                    onClick={() => props.setFieldGroup(true) }
                                    className='inline-flex items-center px-4 py-2 border border-transparent rounded-md font-semibold shadow-md text-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3D4459]'
                                > 
                                    Add Field Group 
                                </button>
                            </>
                        : ''}
                        {props.actions && props.actions.order_field === true ?
                            <>
                                <button 
                                    type = 'button'
                                    onClick={() => props.setOrderFields(true) }
                                    className='inline-flex items-center px-4 py-2 border border-transparent rounded-md font-semibold shadow-md text-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3D4459]'
                                > 
                                    Order fields 
                                </button>
                            </>
                        : ''}
                        {props.actions && props.actions.import === true ?
                            <>
                                <Link 
                                    href={route('listImport')}
                                    className='inline-flex items-center px-4 py-2 border border-transparent rounded-md font-semibold shadow-md text-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3D4459]'
                                > 
                                    <DownloadIcon className='h-4 w-4' /> Import 
                                </Link>
                            </>
                        : ''}
                         {props.actions && props.actions.export === true ?
                            <>
                                <a href={route('export')} 
                                   className='inline-flex items-center px-4 py-2 border border-transparent rounded-md font-semibold shadow-md text-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3D4459]'
                                >
                                    <UploadIcon className='h-4 w-4 cursor-pointer' />Export 
                                </a>
                            </>
                        : ''}
                        {props.actions && props.actions.create === true ?
                            <>
                                {props.add_link ?
                                    <Link 
                                        href={props.add_link}
                                        className='inline-flex items-center px-4 py-2 bg-primary border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest active:bg-gray-900 transition ease-in-out duration-150'
                                    > 
                                        {props.add_button_text}
                                    </Link>
                                : ''}

                                {!props.add_link ?
                                    <Button 
                                        type='button'
                                        onClick={() => setShowForm(true)}
                                    >
                                        {props.add_button_text ? props.add_button_text : `Add ${props.singular}`}
                                    </Button>
                                : ''}
                            </>
                        : ''}
                    </div>
                </div>
                <div className="mt-2 flex flex-col">
                    <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">

                            <ListTable 
                                headers={props.headers}
                                records={props.records}
                                paginator={props.paginator}
                                {...props}
                            />

                            {Object.entries(records).length == 0 ?         
                                <Alert type='info' message= {props.translator['No records']} hideClose={true} />
                            :
                                <Pagination paginator={props.paginator} />
                            }
                            
                        </div>
                    </div>
                </div>
            </div>

            {showForm ?
                <Form 
                    module={props.module}
                    heading={props.heading}
                    hideForm={hideForm}
                    recordId={recordId}
                    translator={props.translator}
                />
            : ''}
        </>
    )
}

export default ListView;