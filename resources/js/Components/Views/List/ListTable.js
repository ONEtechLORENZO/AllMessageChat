import React, { useEffect, useState } from 'react';
import { Head,Link } from '@inertiajs/inertia-react';
import { ChevronDownIcon, ChevronUpIcon, UserAddIcon, PencilAltIcon, TrashIcon, UploadIcon, DownloadIcon } from '@heroicons/react/solid';
import Axios from "axios";
import Checkbox from '@/Components/Forms/Checkbox';

function ListTable(props){

    const [fields, setFields] = useState([]);
    const [fieldOptions, setFieldOptions ] = useState({});

    useEffect(() => {
        fetchModuleFields();
    }, [props.headers]);

    function fetchModuleFields() {        
        let endpoint_url = route('fetchModuleFields', {'module': props.module});
        Axios.get(endpoint_url).then((response) => {             
            if (response.data.status !== false) {               
                setFields(response.data.fields); 
                optionFields(response.data.fields);              
            }
            else {
                notie.alert({type: 'error', text: response.data.message, time: 5});
            }         
        })      
    }

    function optionFields(fields) {
        
        if(fields) {
            Object.entries(fields).map( ([key,field]) => {
                let newFieldOptions = Object.assign({}, fieldOptions);
                if(field.field_type == 'dropdown') {
                    newFieldOptions[field.field_name] = field.options;
                    setFieldOptions(newFieldOptions);  
                }
            });
        }
    }
 
    return(
        <>
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg my-4">
                <table className="min-w-full divide-y divide-[#D9D9D9]">
                    <thead>
                        <tr>
                            {(props.actions.mass_edit === true || props.actions.merge === true)&&  
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
                                if(props.sort_by && props.sort_by == name) {
                                    visibility = '';
                                    if(props.sort_order == 'desc') {
                                        sort_order = 'asc';
                                    }
                                }
                                if(name == 'tag' || name == 'list'){
                                    sortable = false;                                       
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
                                {(props.actions.mass_edit === true || props.actions.merge === true)&& 
                                    <td className='px-2 py-2'>
                                        <Checkbox
                                            id={record.id}
                                            name={record.id}
                                            value={props.checkedId.includes(record.id) ? 1 :''}
                                            handleChange={() => props.getCheckId(key, record.id)}
                                        />
                                    </td>
                                }

                                {Object.entries(props.headers).map(([name, field],index) => { 

                                    let column_value = record[name];

                                    if(fields) {
                                        Object.entries(fields).map(([key, field])=> {
                                            if((field.field_name == name) && field.is_custom && record.custom){
                                                column_value = record.custom[name];
                                            }
                                        });
                                    }
                                    
                                    if(props.actions.detail === true && index === 0) {                                        
                                        var url = props.module === 'User' && props.current_user.role === 'global_admin'?  'detail_global_user' : 'detail'+props.module                                        
                                            column_value = <Link href={route(url, {id: record.id})} className='cursor-pointer underline'>
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
                                        if(fieldOptions[name]) {
                                            column_value = (fieldOptions[name]) ? fieldOptions[name][column_value] : column_value;
                                        }
                                    }else if(field.type == 'multiselect') {
                                        column_value =  (column_value) ? column_value.join(', ') : '';
                                    }

                                    if (field.type == 'checkbox' ) {
                                        if(name == 'status'){
                                            column_value = (column_value == 1) ? 'Active' : 'Inactive'
                                        } else {
                                            column_value = (column_value == 1) ? 'Yes' : 'No';
                                        }
                                    }
                                    var title = '';
                                    if (field.type == 'textarea' && column_value) {
                                        title = column_value;
                                        column_value = column_value.substring(0, 20);
                                    }
                                    
                                    return (
                                        <td key={name} title={title} className="whitespace-nowrap px-2 py-2 text-sm text-[#3D4459]">
                                            {column_value}
                                        </td>
                                    );
                                })}

                                <td>
                                    <div className='flex gap-2'>
                                        {props.actions && props.actions.edit === true ?
                                            <>
                                            {props.edit_link ?
                                                <Link 
                                                    href={route(props.edit_link, record.id)}
                                                > 
                                                    <PencilAltIcon className='h-4 w-4 cursor-pointer' />
                                                </Link>
                                            : 
                                                <PencilAltIcon className='h-4 w-4 cursor-pointer' onClick={() => props.showEditForm(record.id)} />
                                            }
                                            </>
                                            
                                        : ''}
                                        {(props.actions && props.actions.delete === true) || (record.is_custom == '1') ?
                                            <TrashIcon className='h-4 w-4 text-red-600 cursor-pointer' onClick={() => props.deleteRecord(record.id)} />
                                        : ''}
                                        {props.actions.download === true && record.status === 'success' ? 
                                                <a href={route('invoices',record.id)} ><DownloadIcon className='h-4 w-4 cursor-pointer' /></a>
                                        : ''}
                                        {props.actions.download === true && props.module === 'Document' && 
                                                <a href={route('download_document',record.id)} ><DownloadIcon className='h-4 w-4 cursor-pointer' /></a>
                                        }
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}

export default ListTable;