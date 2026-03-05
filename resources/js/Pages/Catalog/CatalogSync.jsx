import React, {Fragment, useEffect, useState, useRef} from "react";
import { Dialog, Transition, Menu } from '@headlessui/react';
import Axios from "axios";
import nProgress from 'nprogress';
import notie from 'notie';
import { EllipsisVerticalIcon, AdjustmentsHorizontalIcon, StopIcon, XMarkIcon, ForwardIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/solid';

const catalogfields = ['name', 'business_id', 'status', 'total_product', 'sync_count'];

export function GlassCard({ className = "", children }) {
    return (
        <div
            className={[
                "relative rounded-3xl bg-[#140816]/70 backdrop-blur-3xl group",
                "border border-white/10 ring-1 ring-white/5",
                "transition-all duration-500 hover:border-[#38bdf8]/50 hover:-translate-y-3 hover:scale-[1.02]",
                "hover:shadow-[0_20px_40px_-15px_rgba(56,189,248,0.3)]",
                className,
            ].join(" ")}
        >
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#38bdf8]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-30" />
            <div className="p-6 relative z-10 flex flex-col h-full">
                {children}
            </div>
        </div>
    );
}

export default function CatalogSync(props) {

    const [catalogs, setCatalog] = useState();
    const [showMapping, setShowMapping] = useState(false);
    const [catalogMap, setCatalogMap] = useState();
    const [fbfields, setFbfields] = useState();
    const [crmfields, setCrmfields] = useState();

    useEffect(() => {
        getCatalogScheduleList();
        fetchFacebookFields()
    },[]);

    
    function fetchFacebookFields()
    {          
        let endpoint_url = route('fetchFBfields',{'module': 'Product'});   
        Axios.get(endpoint_url).then((response) => {            
            setFbfields(response.data.fb_fields);
            setCrmfields(response.data.crm_fields);
        })      
    }

    function getCatalogScheduleList() {
        let url = route('catalog_schedule');
        Axios(url).then((response) => {
            if(response.data.status){
                setCatalog(response.data.catalogs);
            }
        });
    }

    function reScheduleCatalog(catalog) {

        let url = route('catalog_reschedule', {'id' : catalog.id});
        nProgress.start(0.5);
        nProgress.inc(0.2);

        Axios.post(url).then( (response) => {
            nProgress.done();
            if(response.data.status){
                notie.alert({type: 'success', text: response.data.message, time: 5}); 
            } else {
                notie.alert({type: 'error', text: response.data.message, time: 5}); 
            }
            if(response.data.schedularList) {
                setCatalog(response.data.schedularList)
            }
        });
    }

    function fbFieldMapping(catalog) {
        setCatalogMap(catalog);
        setShowMapping(true);
    }

    
    function HandleCatalogScheduling(id, action) {
        Axios.post(route('handle_scheduler', {'id' : id , 'action' : action})).then( (response) => {
            setCatalog(response.data.catalogSchedular);
        });
    }

    return (
        <div className="px-4 sm:px-6 lg:px-8">
            <div className="mt-8 flex flex-col">
                <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                    <GlassCard className="overflow-hidden">
                        <table className="min-w-full divide-y divide-white/10">
                            <thead className="bg-transparent">
                            <tr>
                                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-6">
                                {props.translator['Catalog Name']}

                                </th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                                {props.translator['Business Owner']}
                                </th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                                {props.translator['Status']}
                                </th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                                {props.translator['Total products']}
                                </th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                                {props.translator['Imported products']}
                                </th>
                                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 font-semibold text-white">
                                   <span className="">{props.translator['Actions']}</span>
                                </th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {catalogs &&
                                    (catalogs).map( (catalog) => (
                                        <tr>
                                            {(catalogfields).map( (field) => {
                                                let catalog_value = '';
                                                let status = 'text-[#878787]';
                                                catalog_value = catalog[field];

                                                if(field == 'business_id') {
                                                    catalog_value = catalog_value['name'];
                                                } 

                                                if(field == 'status') {
                                                    status = 'text-[#878787]';
                                                }

                                                return(
                                                    <td className={`whitespace-nowrap px-3 py-4 text-sm font-semibold ${status}`}>{catalog_value}</td>   
                                                )
                                            })}
                                            <td className="whitespace-nowrap px-3 py-4 text-[#878787]">
                                                <div>
                                                   <ActionMenu 
                                                     fbFieldMapping={fbFieldMapping}
                                                     catalog={catalog}
                                                     setCatalog={setCatalog}
                                                     HandleCatalogScheduling={HandleCatalogScheduling}
                                                     reScheduleCatalog={reScheduleCatalog}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                }
                                { (!catalogs || catalogs.length == 0 )&&
                                    <tr>
                                        <td colSpan={7} className="text-[#878787] p-3">
                                            {props.translator['No records synced.']}
                                        </td>
                                    </tr>
                                }
                            </tbody>
                        </table>
                    </GlassCard>
                    {showMapping &&
                      <FBMapping 
                        catalog={catalogMap}
                        setShowMapping={setShowMapping}
                        fbfields={fbfields}
                        crmfields={crmfields}
                        setCatalog={setCatalog}
                      /> 
                    }
                </div>
                </div>
            </div>
        </div>
    );
}

const FBMapping = (props) => {

    const [open, setOpen] = useState(true);
    const cancelButtonRef = useRef(null);
    const [mappingFBfields, setMappingFBfields] = useState();

    useEffect(() => {
        setMappingFBfields(props.catalog.fb_mapping_fields);
    },[]);

    function FBfieldsMap() {
        
        if(mappingFBfields) {
            let check = validateFieldMaping(mappingFBfields);

            if(check) {
                Axios({
                    method: 'post',
                    url: route('schedule_mappingfield',{'id':props.catalog.id}),
                    data: mappingFBfields
                })
                .then( (response) => {
                    props.setCatalog(response.data.catalogSchedular);
                    notie.alert({type: 'success', text: 'Mapping saved successfully', time: 5}); 
                    props.setShowMapping(false);
                }); 
            } else {
                notie.alert({type: 'warning', text: 'Please fill the mandatory fields', time: 5}); 
            }
            
        } else {
            notie.alert({type: 'warning', text: 'Please fill the mandatory fields', time: 5}); 
        }
    }

    function validateFieldMaping(data) {
        let check = false;

        if(data['name'] && data['price']) {
            check = true;
        }
        return check;
    }

    function handleFBMapping(event) {
        const name = event.target.name;
        let newData = Object.assign({}, mappingFBfields);
        newData[name] = event.target.value;
        setMappingFBfields(newData);
    }

    return(
        <Transition.Root show={open} as={Fragment}>
            <Dialog as="div" className="relative z-10" initialFocus={cancelButtonRef} onClose={() => {}} >
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                </Transition.Child>

                <div className="fixed z-10 inset-0 overflow-y-auto">
                    <div className="flex items-end sm:items-center justify-center min-h-full p-4 text-center sm:p-0">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-xl sm:w-full">
                                <div className="bg-gray-50 px-4 sm:p-3">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mt-3 text-center sm:mt-0 sm:text-left">
                                            <Dialog.Title as="h3" className="text-lg leading-6 font-semibold text-gray-900">
                                              Facebook Field Mapping
                                            </Dialog.Title>
                                        </div>
                                    </div>
                                </div>

                                <div className='px-4 py-2 space-y-4 w-full'>
                                    {props.fbfields ? 
                                        <table className="min-w-full divide-y divide-gray-300">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6" >
                                                        Facebook Fields
                                                    </th>
                                                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6" >
                                                        CRM Fields
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody className="divide-y divide-gray-200 bg-white">
                                                {Object.entries(props.fbfields).map(([fb_key,record]) => (
                                                    <tr key={record.field_name} >
                                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                                        
                                                            <div className="flex justify-between">
                                                                <div className="font-medium text-slate-900">{record.field_label} {record.is_mandatory ?  <span className='text-red-600'>*</span> : ''}</div>
                                                            </div>
                                                            <div className="mt-1 text-gray-500">{record.helpline}</div>
                                                            
                                                        </td>
                                                        <td className="hidden whitespace-nowrap px-3 py-4 text-sm text-gray-500 sm:table-cell">
                                                            {(props.crmfields) &&
                                                                <div>
                                                                    <select
                                                                        id={record.field_name}
                                                                        name={record.field_name}
                                                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                                                        onChange={(e) => handleFBMapping(e) }
                                                                    >
                                                                        <option value=""> select </option>
                                                                        {Object.entries(props.crmfields).map(([crm_key,option]) => {
                                                                            return(
                                                                                <>
                                                                                    {mappingFBfields && (mappingFBfields[fb_key] == crm_key) ? 
                                                                                            <option value={option.field_name} selected>        
                                                                                            {option.field_label} 
                                                                                            </option>  
                                                                                        :
                                                                                        <option value={option.field_name}>        
                                                                                            {option.field_label} 
                                                                                        </option>
                                                                                    }
                                                                                </>
                                                                            )
                                                                        })}
                                                                    </select>
                                                                </div>
                                                            }
                                                        </td>                                        
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    : ''}
                                    {props.fbfields && props.crmfields ? 
                                        <div className="flex justify-center py-2">
                                            <div className="px-2">
                                                <button
                                                    type="button"
                                                    className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
                                                    onClick={() => FBfieldsMap()}
                                                >
                                                    Save
                                                </button>
                                            </div>
                                            <div className="px-2">
                                                <button
                                                    type="button"
                                                    className="inline-flex items-center justify-center rounded-md border border-transparent bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
                                                    onClick={() => props.setShowMapping(false)}
                                                >
                                                    Cancel
                                                </button> 
                                            </div>
                                        </div>
                                    : ''}
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
}

const ActionMenu = (props) => {

    function startSchedular(catalog) {
        if(catalog.fb_mapping_fields){
            Axios.post(route('handle_scheduler', {'id' : catalog.id , 'action' : 'start'} )).then( (response) => {
                props.setCatalog(response.data.catalogSchedular);
                notie.alert({type: 'success', text: 'Catalog scheduled successfully', time: 5}); 
            });
        } else {
            notie.alert({type: 'warning', text:'Please map the fields and proceed.', time: 5}); 
        }
    }
    
    return (
        <Menu as="div" className="relative inline-block text-left">
            <div>
                <Menu.Button className="inline-flex w-full justify-center rounded-md px-4 py-2 text-sm font-medium text-[#878787] hover:text-white hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
                    <EllipsisVerticalIcon className="h-5 w-5" aria-hidden="true" />
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
            <Menu.Items className="absolute z-20 right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none w-32">
                <div className="px-1 py-1 ">
                    {props.catalog.status == '-' || props.catalog.status == 'Canceled'? 
                       <Menu.Item>
                        {({ active }) => (
                            <button className='flex gap-2 p-2 items-center' onClick={() => startSchedular(props.catalog)}>
                                <ClipboardDocumentListIcon className="h-5 w-5" aria-hidden="true" /> Schedule
                            </button>  
                        )}
                       </Menu.Item> 
                    : ''}
                    {props.catalog.status == 'Completed' ? 
                       <Menu.Item>
                        {({ active }) => (
                            <button className='flex gap-2 p-2 items-center' onClick={() => props.reScheduleCatalog(props.catalog)}>
                                <ClipboardDocumentListIcon className="h-5 w-5" aria-hidden="true" /> Re-schedule
                            </button>  
                        )}
                       </Menu.Item> 
                    : ''}
                    <Menu.Item>
                        {({ active }) => (
                          <button className='flex gap-2 p-2 items-center' onClick={() => props.fbFieldMapping(props.catalog)}>
                             <AdjustmentsHorizontalIcon className="h-5 w-5" aria-hidden="true" /> Mapping
                          </button>  
                        )}
                    </Menu.Item>
                    {props.catalog.status == 'Stopped' ?
                        <Menu.Item>
                            {({ active }) => (
                                <button className='flex gap-2 p-2 items-center' onClick={() => props.HandleCatalogScheduling(props.catalog.id, 'inprogress')}>
                                    <ForwardIcon className="h-5 w-5" aria-hidden="true" /> Start
                                </button>
                            )}
                        </Menu.Item>
                    : ''}
                    {(props.catalog.status == 'Inprogress' || props.catalog.status == 'New') ? 
                     <> 
                        <Menu.Item>
                            {({ active }) => (
                                <button className='flex gap-2 p-2 items-center' onClick={() => props.HandleCatalogScheduling(props.catalog.id, 'stop')}>
                                    <StopIcon className="h-5 w-5" aria-hidden="true" /> Stop
                                </button>
                            )}
                        </Menu.Item>
                        <Menu.Item>
                            {({ active }) => (
                                <button className='flex gap-2 p-2 items-center' onClick={() => props.HandleCatalogScheduling(props.catalog.id, 'cancel')}>
                                    <XMarkIcon className="h-5 w-5" aria-hidden="true" /> Cancel
                                </button>
                            )}
                        </Menu.Item>
                     </>
                     :''}
                </div>
            </Menu.Items>
            </Transition>
        </Menu>
    );
}












