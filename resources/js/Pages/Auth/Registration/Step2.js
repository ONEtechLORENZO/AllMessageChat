import React, {useEffect, useState} from "react";
import {HomeIcon, CurrencyPoundIcon, ClockIcon, ChevronRightIcon}from "@heroicons/react/outline";
import {currencies} from '@/Pages/Constants';
import { Link } from "@inertiajs/inertia-react";
import axios from "axios";
import notie from 'notie';
import nProgress from 'nprogress';
import CreatableSelect from 'react-select';
import Input from "@/Components/Forms/Input";

const defaultValue = {
    'currency' : { value: "EUR", label: "Euro" },'time_zone': { value: "Europe/Rome", label: "(GMT+01:00) Rome" }
};

export default function Step2 (props) {

    const [workspace, setWorkspace] = useState({});
    const [timeZone, setTimezone] = useState([]);
    const [currencyType, setCurrency] = useState([]);
    const [condition, setCondition] = useState(false);
   
    useEffect( () => {
        getTimezones();
        setWorkspace(defaultValue);
        getCurrencies();
    },[]);

    // Workspace handling 
    function workspaceHandler (event) {
        let newWorkspace = Object.assign({}, workspace);
        const name = event.target.name;
        let value = event.target.value;
        newWorkspace[name] = value;
        setWorkspace(newWorkspace);
    }

    // Get Time Zone
    function getTimezones(){
        var url = route('get_timezone');
        axios.get(url).then((response) => {
          setTimezone(response.data.time_zone);          
        });
    }

    // Validation
    function validation (workspace) {
        let validate = true;
        let name =  workspace['name'];

        if(!name || name == '') {
            notie.alert({type: 'warning', text: 'Please enter the required field value', time: 5});
            validate = false;
        }
        return validate;
    } 

    function saveWorkspace () {

        let is_validate = validation(workspace);
        if(!is_validate) {
            return false;
        }
        if(!condition){
            notie.alert({type: 'warning', text: 'Please accept the terms and conditions', time: 5});
            return false;
        }

        nProgress.start(0.5);
        nProgress.inc(0.2);

        let url = route('saveWorkspace');
        axios.post(url, workspace).then( (response) => {
            if (response) {
                nProgress.done(true);
                props.setCompanyId(response.data.company_id);
                props.setOpenTab(3);
            }
        });
    }

    function getCurrencies() {
        let newCurrency = Object.assign([], currencyType);
        Object.entries(currencies).map( ([key,currency]) => {
            let type = {'value' : key, 'label' : currency };
            newCurrency.push(type);
        });
        setCurrency(newCurrency);
    }

    function searchHandler(event, name){
        let newWorkspace = Object.assign({}, workspace);
        newWorkspace[name] = event;
        setWorkspace(newWorkspace);
    }

    function checkCondition(check) {
        let terms = check ? false : true;
        setCondition(terms);
    }

    return (
        <div className="h-screen w-full bg-blue-50 flex justify-center items-center">
            <div className="max-w-7xl flex mx-auto items-center px-10 h-screen">
                <div className="w-full bg-white flex justify-center py-8 rounded-xl px-4 lg:px-10 shadow-2xl">
                    <div className="py-8">
                        <div className="flex justify-end pl-4">
                            <img
                                src="./img/onemessage-logo.png"
                                alt="One message logo"
                                className="w-1/2"
                            />
                        </div>
                        <div className="flex justify-end">
                            <span>Already have an account 
                                <Link
                                    href={route('login')}
                                    className="text-primary px-2"
                                    >
                                    Log in
                                </Link>
                            </span>
                        </div> 

                        <div className="grid grid-cols-2 mt-5">
                            <div className="flex justify-start font-semibold text-lg text-primary">Step 2 of 3</div>
                            <div className="flex justify-end font-semibold text-lg">About Your Workspace</div>
                        </div>

                        <div className="w-full px-10 py-2 flex gap-8 items-center mt-2">
                            <div className="text-gray-500">
                            <HomeIcon className="h-6 w-6" />
                            </div>
                            <div className="flex flex-col flex-1">
                                <label>Company Workspace Name <span className="text-red-500">  * </span>  </label>
                                <Input type="text"
                                    name="name"  autoComplete="off"
                                    className="mt-2"
                                    value={workspace['name'] ? workspace['name'] : ''}
                                    handleChange={workspaceHandler} />
                            </div>
                        </div>

                        <div className="w-full px-10 py-2 flex gap-8 items-center mt-2">
                            <div className="text-gray-500">
                            <CurrencyPoundIcon className="h-6 w-6" />
                            </div>
                            <div className="flex flex-col flex-1">
                                <label>Workspace Currency <span className="text-red-500">  * </span>  </label>
                                 <CreatableSelect
                                    value={workspace['currency'] ? workspace['currency'] : ''}
                                    options={currencyType}
                                    onChange={(e) => searchHandler(e, 'currency')}
                                />
                            </div>
                        </div>

                        <div className="w-full px-10 py-2 flex gap-8 items-center mt-2">
                            <div className="text-gray-500">
                            <ClockIcon className="h-6 w-6" />
                            </div>
                            <div className="flex flex-col flex-1">
                                <label>Workspace Time Zone <span className="text-red-500">  * </span>  </label>
                                <CreatableSelect
                                    value={workspace['time_zone'] ? workspace['time_zone'] : ''}
                                    options={timeZone}
                                    onChange={(e) => searchHandler(e, 'time_zone')}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 mt-4">
                            <div className="flex justify-start items-center">
                                <div className="">
                                    <input
                                        type="checkbox"
                                        checked={condition == true ? 'checked' : ''}
                                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                        onChange={() => checkCondition(condition)}
                                    />
                                </div>
                                <div className="px-3">Accept Privacy Policy and Terms and Condition</div>
                            </div>
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    className="w-full inline-flex justify-end rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary hover:bg-primary/80 text-semibold font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm mt-4"
                                    onClick={() => saveWorkspace()}
                            >
                                    Next
                                    <span className="flex justify-end pt-1"><ChevronRightIcon className="h-4 w-4"/></span>
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}