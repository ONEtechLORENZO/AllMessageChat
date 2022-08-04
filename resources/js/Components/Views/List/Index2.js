import React, { useEffect, useState } from 'react';
import Pagination from '@/Components/Pagination';
import Alert from '@/Components/Alert';
import Button from '@/Components/Forms/Button';
import Form from '@/Components/Forms/Form';
import { ChevronDownIcon, ChevronUpIcon, PencilAltIcon, TrashIcon, UploadIcon } from '@heroicons/react/solid';
import { Inertia } from '@inertiajs/inertia';
import notie from 'notie';
import Search from './Search';
import { Link } from '@inertiajs/inertia-react';
import Filter from "./Filter2";
import axios from "axios";

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
                    <div className='flex gap-6'>
                        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">{props.plural}</h2>
                        {props.actions && props.actions.search === true ?
                            <Search 
                                module={props.module} 
                                search={props.search}
                                currentPage={props.paginator.currentPage}
                                sort_by={props.sort_by}
                                sort_order={props.sort_order}
                            />
                        : ''}

                        {props.actions && props.actions.filter === true &&
                            <Filter 
                                module={props.module} 
                                filter={props.filter}
                                currentPage={props.paginator.currentPage}
                                sort_by={props.sort_by}
                                sort_order={props.sort_order}
                            />
                        }

                    </div>
                    <div className='flex gap-4'>
                        {props.actions && props.actions.import === true ?
                            <>
                                <Link 
                                    href={route('import')}
                                    className='inline-flex items-center px-4 py-2 border border-transparent rounded-md font-semibold shadow-md text-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3D4459]'
                                > 
                                    <UploadIcon className='h-4 w-4' /> Import 
                                </Link>
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
                            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg my-4">
                                <table className="min-w-full divide-y divide-[#D9D9D9]">
                                    <thead>
                                        <tr>
                                            {Object.entries(props.headers).map(([name, field]) => {
                                                let visibility = 'invisible';
                                                let sort_order = 'desc';
                                                let sortable = true;
                                                if(props.sort_by == name) {
                                                    visibility = '';
                                                    if(props.sort_order == 'desc') {
                                                        sort_order = 'asc';
                                                    }
                                                }
                                                if(name == 'tag' || name == 'list'){
                                                    sortable = false;                                       
                                                }
                                                if(field.type == 'dropdown'){
                                                    if(!fieldOptions[name]){
                                                        getFieldOptions(name);
                                                    }
                                                }

                                                return (
                                                    <th
                                                        key={name}
                                                        scope="col"
                                                        className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-[#3D4459] sm:pl-6"
                                                    >
                                                        <a href="#" className="group inline-flex" onClick={() => { sortable ? sortColumn(name, sort_order): ''}}>
                                                            {field.label}
                                                            <span className={`ml-2 flex-none rounded text-gray-400 group-hover:visible group-focus:visible ` + visibility}>
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
                                                {Object.entries(props.headers).map(([name, field],index) => { 
                                                    let column_value = record[name]; 
                                                    if(props.actions.detail === true && index === 0) {
                                                        column_value = <Link href={route('detail' + props.module, {id: record.id})} className='cursor-pointer underline'>
                                                            {column_value} 
                                                        </Link>;
                                                    } 
                                                    if(record.tags && name == 'tag'){
                                                        var tagName = '';
                                                        (record.tags).map((tag,tagIndex) => {
                                                            if(tagIndex === 0 || tagIndex === 1){ 
                                                                tagName += tag.name;
                                                                if(tagIndex === 0 && (record.tags).length > 1){
                                                                    tagName += ', ';
                                                                }
                                                            }
                                                        })
                                                       column_value = tagName;
                                                    }
                                                    if(record.categorys && name == 'list'){
                                                        var listName = '';
                                                        (record.categorys).map((list,listIndex) => {
                                                            if(listIndex === 0 || listIndex === 1){ 
                                                                listName += list.name;
                                                                if(listIndex === 0 && (record.categorys).length > 1){
                                                                    listName += ', ';
                                                                }
                                                            }
                                                        })
                                                       column_value = listName;
                                                    }

                                                    if(field.type == 'dropdown'){
                                                        column_value = (fieldOptions[name]) ? fieldOptions[name][column_value] : column_value;
                                                    }

                                                    return (
                                                        <td key={name} className="whitespace-nowrap px-2 py-2 text-sm text-[#3D4459]">
                                                            {column_value}
                                                        </td>
                                                    );
                                                })}

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