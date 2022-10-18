import React, { useEffect, useState, Fragment } from 'react';
import Pagination from '@/Components/Pagination';
import Alert from '@/Components/Alert';
import Button from '@/Components/Forms/Button';
import Axios from "axios";
import Form from '@/Components/Forms/Form';
import { ChevronDownIcon, ChevronUpIcon, UserAddIcon, PencilAltIcon, TrashIcon, UploadIcon, DownloadIcon } from '@heroicons/react/solid';
import { Inertia } from '@inertiajs/inertia';
import notie from 'notie';
import Search from './Search';
import { Head,Link } from '@inertiajs/inertia-react';
import Filter from "./Filter2";
import axios from "axios";
import { Menu, Transition } from '@headlessui/react'
import ListTable from './ListTable';
import MassEdit from './MassEdit';


function ListView(props)
{
    const [showForm, setShowForm] = useState(false);

    const [records, setRecords] = useState([]);
    const [columnOptions, setColumnOptions] = useState(props.headers);
    const [recordId, setRecordId] = useState(''); 
    const [fields, setFields] = useState([]);
    const [fieldOptions, setFieldOptions ] = useState({});
    const [showMassEdit, setShowMassEdit] = useState(false);
    const [checkedId, setCheckedId] = useState([]);
    const [checkAll, setCheckAll] = useState(false);

    useEffect(() => {
        fetchModuleFields();
        setRecords(props.records);   
    }, [props.records]);

    /**
     * Hide form and reset the Record ID
     */
    function hideForm() {
        setShowForm(false);
        setRecordId('');
    }
    
    function saveSelectedColumn(){
       if(columnOptions!=''){
            Inertia.post(route('showColumns', [props.module]), {'columns':columnOptions});
        } else {
            notie.alert({type: 'error', text: 'Please select atleast one field', time: 5});
        }
    }

    function fetchModuleFields() {        
        let endpoint_url = route('fetchModuleFields', {'module': props.module});
        Axios.get(endpoint_url).then((response) => {             
            if (response.data.status !== false) { 
                setFields(response.data.fields);               
            }
            else {
                notie.alert({type: 'error', text: response.data.message, time: 5});
            }         
        })      
    }

    const columnHandler = (field) => () => {
       setColumnOptions((state) => ({
          ...state,
          [field.field_name]: state[field.field_name]
            ?  
               console.log('')
            : {
                name:field.field_name,
                label: field.field_label,
                type:field.field_type                
              }
        }));
        
      };

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

        if(props.module == 'User'){
            let confirmUserDelete = window.confirm('Are you sure you want to delete the user?');
            if(!confirmUserDelete) {
                return;
            }
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

    
    // Get current check field id 
    function getCheckId(key, id) {
        let newCheck = Object.assign([], checkedId);
        const recordLength = props.records.length;
        const index = newCheck.indexOf(id);
        if(index > -1) {
            newCheck.splice(index, 1);
        }else {
            newCheck.push(id);
        }
        setCheckedId(newCheck)
        if(recordLength == newCheck.length) {
            setCheckAll(true);
        } else {
            setCheckAll(false);
        }
        
    }

    // Check select all field 
    function selectCheckAll() {
        let newCheck = Object.assign([], checkedId);
        if(!checkAll) {
            if(props.records) {
                (props.records).map( (record) => {
                    !newCheck.includes(record.id) ? newCheck.push(record.id) :"";
                    setCheckedId(newCheck);
                });
            }
            setCheckAll(true);
        } else {
            setCheckedId([]);
            setCheckAll(false);
        }
    }

    function massEdit(){
        const length = checkedId.length;
        if(length){
            setShowMassEdit(true);
        }
    }

    function hideMassEdit() {
        setShowMassEdit(false);
        setCheckedId([]);
        setCheckAll(false);
    }
 
    return (
        <>
            <div className="px-4 sm:px-6 lg:px-8 bg-[#FBFBFBBF]">
                {(props.show_header && props.show_header === true) || (props.show_header == undefined)? 
                 <div className="flex min-w-0 justify-between">
                    <Head title={props.module} />
                    <div className='flex gap-6'>
                        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">{props.plural}</h2>
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
                                    <UploadIcon className='h-4 w-4 cursor-pointer' /> Import 
                                </Link>
                            </>
                        : ''}
                        {props.actions && props.actions.export === true ?
                            <>
                                <a href={route('export',{'exportmod':props.module})} 
                                    className='inline-flex items-center px-4 py-2 border border-transparent rounded-md font-semibold shadow-md text-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3D4459]'
                                >
                                    <DownloadIcon className='h-4 w-4' /> Export 
                                </a>
                            </>
                        : ''}
                        {props.actions && props.actions.mass_edit === true ?
                            <>
                                <button
                                    className='inline-flex items-center px-4 py-2 border border-transparent rounded-md font-semibold shadow-md text-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3D4459]'
                                    onClick={() => massEdit()}
                                >
                                    <PencilAltIcon className='h-4 w-4' /> Mass edit
                                </button>
                            </>
                        : ''}
                        
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
                                        onClick={() => setShowForm(true)}
                                    >
                                        {props.add_button_text ? props.add_button_text : `Add ${props.singular}`}
                                    </Button>
                                }
                            </>
                        }
                        {props.actions && props.actions.select_field &&
                            <>
                                <div>
                                    <Menu as="div" className="relative inline-block text-left">
                                        <div>
                                            <Menu.Button                                               
                                                className="ba-field-dropdown inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-5">
                                                    <path fillRule="evenodd" d="M14 18h2.75A2.25 2.25 0 0019 15.75V4.25A2.25 2.25 0 0016.75 2H14v16zM12.5 2h-5v16h5V2zM3.25 2H6v16H3.25A2.25 2.25 0 011 15.75V4.25A2.25 2.25 0 013.25 2z" clipRule="evenodd" />
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
                                            <Menu.Items 
                                                className={"absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none "}
                                            >

                                                <ul role="list" className="divide-y divide-gray-200 overflow-y-auto m-h-64">
                                                    { Object.entries(fields).map(([key, field])=> {
                                                        return(
                                                            <li className='p-1 mx-2'>
                                                                <div className="form-group col-span-6 sm:col-span-4">
                                                                    <div className="flex items-start">
                                                                        <div className="flex items-center h-5">                                
                                                                            <input 
                                                                                type="checkbox"
                                                                                id={field.field_name}
                                                                                name={field.field_name}                                  
                                                                                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                                                                value={field.field_name}
                                                                                onChange={columnHandler(field)}
                                                                                checked={columnOptions[field.field_name]}
                                                                            />
                                                                        </div>
                                                                        <div className="ml-3 text-sm">
                                                                            <label htmlFor="terms_condition" title="Click here to read it" className="font-medium text-gray-700" >
                                                                                <span> 
                                                                                {field.field_label}
                                                                                </span>
                                                                            </label>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                </li>
                                                            );
                                                    })}
                                                </ul>
                                                <Menu.Item>
                                                    <div className='content-center justify-center'>
                                                        <Button  
                                                            onClick={() => saveSelectedColumn()}
                                                            className='m-2 w-50 inline-flex justify-center items-center pr-5 py-2 bg-primary border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest active:bg-gray-900 transition ease-in-out duration-150'
                                                        > 
                                                            Save
                                                        </Button>
                                                    </div>
                                                </Menu.Item>
                                            </Menu.Items>
                                        </Transition>
                                    </Menu>
                                </div>
                            </>
                        }
                    </div>
                </div>
                : ''}
                
                <div className="mt-2 flex flex-col">
                    <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">

                            <ListTable 
                                module={props.module}
                                headers={props.headers}
                                records={props.records}
                                paginator={props.paginator}
                                fieldOptions={fieldOptions}
                                getFieldOptions={getFieldOptions}
                                deleteRecord={deleteRecord}
                                showEditForm={showEditForm}
                                checkAll={checkAll}
                                checkedId={checkedId}
                                getCheckId={getCheckId}
                                selectCheckAll={selectCheckAll}
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
                    mod={props.mod}
                    productList={props.productList}
                />
            : ''}

            {showMassEdit ? 
             <MassEdit 
               module={props.module}
               checkId={checkedId}
               hideMassEdit={hideMassEdit}
             />
            : '' }
        </>
    )
}

export default ListView;