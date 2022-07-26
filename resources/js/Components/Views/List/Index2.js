import React, { useEffect, useState } from 'react';
import Pagination from '@/Components/Pagination';
import Alert from '@/Components/Alert';
import Button from '@/Components/Forms/Button';
import Form from '@/Components/Forms/Form';
import { ChevronDownIcon, ChevronUpIcon, PencilAltIcon, TrashIcon } from '@heroicons/react/solid';
import { Inertia } from '@inertiajs/inertia';
import notie from 'notie';
import Search from './Search';

function ListView(props)
{
    const [showForm, setShowForm] = useState(false);

    const [records, setRecords] = useState([]);

    const [recordId, setRecordId] = useState('');

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
        let confirm = window.confirm('Are you sure you want to delete the record?');
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
     * Sort field
     * 
     * @param {string} field_name 
     * @param {string} sort_order
     */
    function sortField(field_name, sort_order)
    {
        Inertia.get(route('list' + props.module) + '?page='+ props.paginator.currentPage +'&search=' + props.search + '&sort_by=' + field_name + '&sort_order=' + sort_order);
    }

    return (
        <>
            <div className="px-4 sm:px-6 lg:px-8 bg-[#FBFBFBBF]">
                <div className="flex min-w-0 justify-between">
                    <div className='flex gap-6'>
                        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">{props.heading}</h2>
                        {props.actions && props.actions.search === true ?
                            <Search 
                                module={props.module} 
                                search={props.search}
                                currentPage={props.paginator.currentPage}
                                sort_by={props.sort_by}
                                sort_order={props.sort_order}
                            />
                        : ''}
                    </div>
                    {props.actions && props.actions.create === true ?
                        <>
                            <Button 
                                type='button'
                                onClick={() => setShowForm(true)}
                            >
                                Add {props.heading}
                            </Button>
                        </>
                    : ''}
                </div>
                <div className="mt-2 flex flex-col">
                    <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg my-4">
                                <table className="min-w-full divide-y divide-[#D9D9D9]">
                                    <thead>
                                        <tr>
                                            {Object.entries(props.headers).map(([name, label]) => {
                                                let visibility = 'invisible';
                                                let sort_order = 'desc';
                                                if(props.sort_by == name) {
                                                    visibility = '';
                                                    if(props.sort_order == 'desc') {
                                                        sort_order = 'asc';
                                                    }
                                                }

                                                return (
                                                    <th
                                                        key={name}
                                                        scope="col"
                                                        className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-[#3D4459] sm:pl-6"
                                                    >
                                                        <a href="#" className="group inline-flex" onClick={() => sortField(name, sort_order)}>
                                                            {label}
                                                            <span className={`ml-2 flex-none rounded text-gray-400 group-hover:visible group-focus:visible ` + visibility}>
                                                                {visibility == '' && props.sort_order == 'asc' ?
                                                                    <ChevronUpIcon className="h-5 w-5" aria-hidden="true" />
                                                                :
                                                                    <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
                                                                }
                                                            </span>
                                                        </a>
                                                    </th>
                                                );
                                            })}

                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody className=" bg-white">
                                        {Object.entries(props.records).map(([key, record]) => (
                                            <tr key={key}>
                                                {Object.entries(props.headers).map(([name]) => (
                                                    <>
                                                        <td key={name} className="whitespace-nowrap px-2 py-2 text-sm text-[#3D4459]">
                                                            {record[name]} 
                                                        </td>
                                                    </>
                                                ))}

                                                <td>
                                                    <div className='flex gap-2'>
                                                        {props.actions && props.actions.edit === true ?
                                                            <PencilAltIcon className='h-4 w-4 cursor-pointer' onClick={() => showEditForm(record.id)} />
                                                        : ''}
                                                        {props.actions && props.actions.delete === true ?
                                                            <TrashIcon className='h-4 w-4 text-red-600 cursor-pointer' onClick={() => deleteRecord(record.id)} />
                                                        : ''}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {Object.entries(records).length == 0 ?         
                                <Alert type='info' message='No records' hideClose={true} />
                            : ''}

                            <Pagination paginator={props.paginator} />
                            
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
                />
            : ''}
        </>
    )
}

export default ListView;