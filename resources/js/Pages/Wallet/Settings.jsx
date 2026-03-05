import React, { useState, useEffect } from "react";
import { Link } from '@inertiajs/react';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import Alert from '@/Components/Alert';
import { Badge } from "reactstrap";
import notie from 'notie';
import Axios from "axios";
import { useForm, router as Inertia } from "@inertiajs/react";
import { ArrowPathIcon } from '@heroicons/react/24/solid';
import Dropdown from "@/Components/Forms/Dropdown";
import FacebookSync from "./FacebookSync";
import nProgress from 'nprogress';

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export function GlassCard({ className = "", children }) {
    return (
        <div
            className={[
                "relative rounded-3xl bg-[#140816]/70 backdrop-blur-3xl group",
                "transition-all duration-500 hover:border-[#38bdf8]/50 hover:-translate-y-3 hover:scale-[1.02]",
                "hover:shadow-[0_20px_40px_-15px_rgba(56,189,248,0.3)]",
                className,
            ].join(" ")}
        >
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#38bdf8]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="p-6 relative z-10 flex flex-col h-full">
                {children}
            </div>
        </div>
    );
}

export default function Settings(props) {

    const tabs = [
        { name: 'Autotopup', href: '#', current: true, page: 'autotopup' },
        { name: 'Template Sync', href: '#', current: false, page: 'template' },
        { name: 'Facebook Catalogs and Products Sync', href: '#', current: false, page: 'mapping' },
    ];

    const [page, setPage] = useState('autotopup');
    const [status, setStatus] = useState((props.meta_data.auto_topup_status == 'ON') ? true : false);
    const [metaStatus, setMetaStatus] = useState((props.meta_data.auto_topup_status == 'ON') ? 'ON' : 'OFF');
    const [metaValue, setMetaValue] = useState((props.meta_data.auto_topup_value) ? props.meta_data.auto_topup_value : '');
    //const [fbBusinessId, setFbBusinessId] = useState((props.meta_data.fb_business_id) ? props.meta_data.fb_business_id :'');
    // const [fbfields, setFbfields] = useState();
    // const [crmfields, setCrmfields] = useState();
    //const { data, setData, errors } = useForm({});
    //const [fbModule, setfbModule] = useState();
    //    const [mappingFBfields, setMappingFBfields] = useState();

    useEffect(() => {
        setMetaStatus(status ? 'ON' : 'OFF')
    }, [status]);

    useEffect(() => {
        setStatus((props.meta_data.auto_topup_status == 'ON') ? true : false)
        setMetaStatus((props.meta_data.auto_topup_status == 'ON') ? 'ON' : 'OFF')
        setMetaValue((props.meta_data.auto_topup_value) ? props.meta_data.auto_topup_value : '')
    }, []);

    /**
     * Handle input change
     */
    function handleChange(event) {
        let value = event.target.checked;
        let change_status = (value == true) ? 'ON' : 'OFF';

        var data = {
            'name': event.target.name,
            'value': change_status
        };

        confirmAlert({
            title: (props.translator["Auto Topup"]),
            message: ('Are you sure to change the status?'),
            buttons: [
                {
                    label: ('Yes'),
                    onClick: () => {
                        updataSettingsData(data)
                        setStatus(!status)
                    }
                },
                {
                    label: 'No',
                    onClick: () => { }
                }
            ]
        });
    }

    function selecthandleChange(event) {
        var data = {
            'name': event.target.name,
            'value': event.target.value
        };

        if (event.target.name == 'auto_topup_value') {
            setMetaValue(event.target.value);
        }
        updataSettingsData(data);
    }

    function updataSettingsData(data) {
        Axios({
            method: 'post',
            url: route('setAutoTopupStatus'),
            data: data
        })
            .then((response) => {
                notie.alert({ type: 'success', text: (props.translator['Update configuration successfully']), time: 5 });
            });
    }

    // function handlemapping(event)
    // {          
    //     setfbModule(event.target.value)
    //     let endpoint_url = route('fetchFBfields',{'module': event.target.value});   
    //     Axios.get(endpoint_url).then((response) => {            
    //         setFbfields(response.data.fb_fields);
    //         setCrmfields(response.data.crm_fields);
    //         setMappingFBfields(response.data.mapping_fields);
    //     })      
    // }

    /**
     * Sync templates
     */
    function syncTemplates() {
        nProgress.start(0.5);
        nProgress.inc(0.2);
        Axios.get(route('sync_templates')).then((response) => {
            nProgress.done();

            if (response.data.status) {
                notie.alert({ type: 'success', text: response.data.message, time: 5 });
            } else {
                notie.alert({ type: 'error', text: response.data.message, time: 5 });
            }
        });
    }

    // FB mapping 
    // function handleFBMapping(event) {
    //     const name = event.target.name;
    //     let newData = Object.assign({}, data);
    //     if (event.target.type == "file" && event.target.files) {
    //         newData[name] = event.target.files[0];
    //     } else {
    //         newData[name] = event.target.value;
    //     }
    //     setData(newData);
    // }

    // save FB-mapping Fields
    // function FBfieldsMap() {   
    //     axios({
    //         method: 'post',
    //         url: route('FBfields_map',{'module':fbModule}),
    //         data: data
    //     })
    //     .then( (response) => {
    //         notie.alert({type: 'success', text: 'Mapping save successfully', time: 5}); 
    //     });    

    // }

    return (
        <>
            <div className="grid gap-4 grid-cols-2 border-[#B9B9B9] border-b">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {tabs.map((tab) => (
                        <a
                            key={tab.name}
                            href={tab.href}
                            className={classNames(
                                tab.page == page
                                    ? 'border-indigo-500 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                                'whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm'
                            )}
                            aria-current={tab.current ? 'page' : undefined}
                            onClick={() => setPage(tab.page)}
                        >
                            {props.translator[tab.name]}
                        </a>
                    ))}
                </nav>
            </div>

            <div className="grid gap-4 grid-cols-1">
                {page == 'autotopup' &&
                    <div className=" overflow-hidden ">
                        <div className="space-y-4 my-4">
                            <GlassCard>
                                <div className="grid grid-cols-12 items-center text-white">
                                    <div className="col-span-10">
                                        {props.translator['Status']} : <span className="ml-1">{metaStatus}</span>
                                    </div>
                                    <div className="col-span-2 flex justify-end">
                                        <input
                                            type="checkbox"
                                            id="auto_topup"
                                            name="auto_topup_status"
                                            checked={status}
                                            value={status}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </GlassCard>
                            {(status) &&
                                <GlassCard>
                                    <div className='flex items-center text-white'>
                                        {props.translator['Value']}:
                                        <span>
                                            <select
                                                name="auto_topup_value"
                                                className="block border mx-4 border-white/10 bg-[#0F0B1A] text-white rounded-md shadow-sm focus:outline-none focus:ring-[#1C9AE1] focus:border-[#1C9AE1] sm:text-sm"
                                                value={metaValue}
                                                onChange={selecthandleChange}
                                            >
                                                <option value=''>Select</option>
                                                {[...Array(50, 100, 150, 200, 250)].map(i =>
                                                    <option key={i} value={i}>{i}</option>
                                                )}
                                            </select>
                                        </span>
                                    </div>
                                </GlassCard>
                            }
                        </div>
                    </div>
                }
                {page == 'template' &&
                    <div className=" overflow-hidden ">
                        <div className="space-y-4 my-4">
                            <GlassCard>
                                <div className="grid grid-cols-12 items-center text-white">
                                    <span className="col-span-10">
                                        {props.translator['Sync template']}
                                    </span>
                                    <span className="col-span-2 flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => syncTemplates()}
                                            className="bg-transparent hover:bg-blue-500 text-blue-200 font-semibold py-2 px-4 border border-blue-400 hover:border-transparent rounded"
                                        >
                                            <ArrowPathIcon
                                                className="h-5 w-5"
                                            />
                                        </button>
                                    </span>
                                </div>
                            </GlassCard>
                        </div>
                    </div>
                }
                {page == 'mapping' &&
                    <>
                        <FacebookSync
                            selecthandleChange={selecthandleChange}
                            {...props}
                        />
                    </>
                }
            </div>
        </>
    );
}












