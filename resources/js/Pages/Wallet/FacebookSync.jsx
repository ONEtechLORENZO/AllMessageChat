import React, { useState, useEffect } from "react";
import Dropdown from "@/Components/Forms/Dropdown";
import { useForm } from "@inertiajs/react";
import notie from 'notie';
import CatalogSync from "../Catalog/CatalogSync";
import nProgress from 'nprogress';
import axios from "axios";

export default function FacebookSync(props) {

    const tabs = [
        { name: 'Configuration', href: '#', current: true, page: 'config' },
        { name: 'Scheduler', href: '#', current: false, page: 'schedular' },
    ];
    const fbMappingModule = { 'Product': 'Product' };

    const { data, setData, errors } = useForm(props.meta_data.fb_field_mapping);
    const [fbfields, setFbfields] = useState();
    const [crmfields, setCrmfields] = useState();
    const [fbModule, setfbModule] = useState('Product');
    const [page, setPage] = useState('config');
    const [mappingFBfields, setMappingFBfields] = useState();
    const [fbBusinessId, setFbBusinessId] = useState((props.meta_data.fb_business_id) ? props.meta_data.fb_business_id : '');
    const [fbToken, setFbToken] = useState((props.meta_data.is_fb_connect) ? props.meta_data.is_fb_connect : '');

    function classNames(...classes) {
        return classes.filter(Boolean).join(' ')
    }

    useEffect(() => {
        setFbBusinessId((props.meta_data.fb_business_id) ? props.meta_data.fb_business_id : '');
        fetchFacebookFields();
    }, []);

    function fetchFacebookFields() {

        let endpoint_url = route('fetchFBfields', { 'module': fbModule });
        axios.get(endpoint_url).then((response) => {
            setFbfields(response.data.fb_fields);
            setCrmfields(response.data.crm_fields);
            setMappingFBfields(data);
        })
    }

    function handleFBMapping(event) {
        const name = event.target.name;
        let newData = Object.assign({}, data);
        if (event.target.type == "file" && event.target.files) {
            newData[name] = event.target.files[0];
        } else {
            newData[name] = event.target.value;
        }
        setData(newData);
    }

    function handleChange(e) {
        setFbBusinessId(e.target.value);
        // props.selecthandleChange(e);
    }

    function FBfieldsMap() {
        axios({
            method: 'post',
            url: route('FBfields_map', { 'module': fbModule }),
            data: data
        })
            .then((response) => {
                notie.alert({ type: 'success', text: 'Mapping save successfully', time: 5 });
            });

    }

    /**
     * Schedule catalog data
     */
    function ScheduleCatalog() {

        if (fbBusinessId) {
            nProgress.start(0.5);
            nProgress.inc(0.2);
            axios({
                method: 'post',
                url: route('schedule_business_catalog', fbBusinessId),
            })
                .then((response) => {
                    nProgress.done();
                    if (response.data.status) {
                        setPage('schedular');
                        notie.alert({ type: 'success', text: response.data.message, time: 5 });
                    } else {
                        notie.alert({ type: 'error', text: response.data.message, time: 5 });
                    }
                });
        } else {
            notie.alert({ type: 'warning', text: 'Select you Business Account', time: 5 });
        }
    }

    function revokeFbData() {
        nProgress.start(0.5);
        nProgress.inc(0.2);
        axios({
            method: 'post',
            url: route('revokeFbSync'),
        })
            .then((response) => {
                setFbBusinessId('');
                setData('');
                setFbToken('');
                nProgress.done();
                notie.alert({ type: 'success', text: response.data.message, time: 5 });
            });
    }

    return (
        <>
            <div className="grid gap-4 grid-cols-2 border-[#B9B9B9] border-b pt-3 bg-white drop-shadow rounded-md px-6 py-4">
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
                {page == 'config' &&
                    <div className=" overflow-hidden ">
                        {fbToken ?
                            <div className="space-y-4 my-4">
                                <div className="">
                                    <h2 className="text-xl font-semibold text-gray-900 flex md:flex md:justify-between">
                                        {props.translator['Facebook Catalogs and Products Sync']}
                                        <div className="flex">
                                            <span className="mx-2">
                                                <button
                                                    type="button"
                                                    onClick={() => revokeFbData()}
                                                    className="bg-transparent hover:bg-red-500 text-red-700 text-base hover:text-red-900 py-2 px-4 border-1 border-red-500  rounded"
                                                >
                                                    Revoke
                                                </button>
                                            </span>
                                            <span className="ml-3 text-sm flex text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none py-1 px-2 ">
                                                <img className="img" src="https://static.xx.fbcdn.net/rsrc.php/v3/yq/r/_9VQFvOk7ZC.png" alt="" width="34" height="24" />
                                                <span className=" pl-3 p-2"> Connected with Facebook  </span>
                                            </span>
                                        </div>
                                    </h2>
                                </div>
                                <div className="pt-3 bg-white drop-shadow rounded-md grid grid-cols-2 px-6 py-4 flex md:flex md:justify-between">
                                    <div className="form-group flex px-4 w-full">
                                        <div className="w-1/4 mt-2">
                                            <label htmlFor="name" className="block text-sm font-medium text-gray-700" >
                                                Select Business <span className="text-sm text-red-700"> *</span>
                                            </label>
                                        </div>
                                        <div className="w-1/4">
                                            <Dropdown
                                                id="fb_business_id"
                                                name="fb_business_id"
                                                options={(props.meta_data.fb_busness_list) ? props.meta_data.fb_busness_list : []}
                                                handleChange={handleChange}
                                                emptyOption="Select Business"
                                                value={fbBusinessId}
                                                required={true}
                                            />
                                        </div>
                                    </div>
                                    <div className="">
                                        <button
                                            type="button"
                                            onClick={() => ScheduleCatalog()}
                                            className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-blue-900 py-2 px-4 border border-blue-500 hover:border-transparent rounded"
                                        >
                                            Schedule
                                        </button>
                                    </div>
                                </div>
                            </div>
                            :
                            <div className="space-y-4 my-4">
                                <div className='text-gray-500 pt-4 text-sm mt-1 text-center'>
                                    <a
                                        href={route('connect_face_book', 'product')}
                                        className='ml-3 inline-flex align-middle justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                                    >
                                        <div className="ml-3 text-sm flex md:flex md:justify-between ">

                                            <img className="img" src="https://static.xx.fbcdn.net/rsrc.php/v3/yq/r/_9VQFvOk7ZC.png" alt="" width="34" height="24" />
                                            <span className=" pl-3 p-2">  {props.translator['Continue with']} Facebook  </span>

                                        </div>
                                    </a>
                                </div>
                            </div>
                        }
                    </div>
                }
                {page == 'schedular' &&
                    <CatalogSync
                        translator={props.translator}
                    />
                }
            </div>
        </>
    );
}












