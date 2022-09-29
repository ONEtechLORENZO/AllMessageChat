import React, {useEffect, useState} from "react";
import {HomeIcon, CurrencyPoundIcon, ClockIcon, ChevronRightIcon}from "@heroicons/react/outline";
import {currencies} from '@/Pages/Constants';
import Dropdown from "@/Components/Forms/Dropdown";
import { Link } from "@inertiajs/inertia-react";
import axios from "axios";
import notie from 'notie';

const validateList = [
    'name', 'currency', 'time_zone'
];

export default function Step2 (props) {

    const [workspace, setWorkspace] = useState({});
    const [timeZone, setTimezone] = useState([]);

    useEffect( () => {
        getTimezones();
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
        let field_value = '';
        if(workspace) {
            validateList.map( (list) => {
              field_value = workspace[list];
              if(validate && !field_value ) {
                notie.alert({type: 'error', text: 'Please enter the required field value', time: 5});
                validate = false;
              }
         } );
        }
        return validate;
    } 

    function saveWorkspace () {
        let is_validate = validation(workspace);
        if(!is_validate) {
            return false;
        }

        let url = route('saveWorkspace');
        axios.post(url, workspace).then( (response) => {
            if (response) {
                props.setCompanyId(response.data.company_id);
                props.setOpenTab(3);
            }
        });
    }

    return (
        <div className="h-screen w-full bg-blue-50 flex justify-center items-center">
            <div className="max-w-7xl flex mx-auto items-center px-10">
                <div className="w-full bg-white self-stretch flex justify-center py-24 rounded-xl px-4 lg:px-10">
                    <div className="py-8">
                        <div className="flex justify-end px-4">
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
                            <div className="flex justify-start font-semibold text-lg text-primary">Step 2</div>
                            <div className="flex justify-end font-semibold text-lg">About Your Workspace</div>
                        </div>

                        <div className="bg-white shadow w-full px-10 py-2 flex gap-8 items-center mt-4 rounded">
                            <div className="text-gray-500">
                            <HomeIcon className="h-6 w-6" />
                            </div>
                            <div className="flex flex-col flex-1">
                                <label>Workspace Name <span className="text-red-500">  * </span>  </label>
                                <input
                                    type="text"
                                    name="name"
                                    className="h-4 px-0 py-4 border-0 focus:ring-0 focus:border-primary w-full focus:border-0 focus:border-b"
                                    autoComplete="off"
                                    value={workspace['name'] ? workspace['name'] : ''}
                                    onChange={(e) => workspaceHandler(e)}
                                />
                            </div>
                        </div>

                        <div className="bg-white shadow w-full px-10 py-2 flex gap-8 items-center mt-4 rounded">
                            <div className="text-gray-500">
                            <CurrencyPoundIcon className="h-6 w-6" />
                            </div>
                            <div className="flex flex-col flex-1">
                                <label>Workspace Currency <span className="text-red-500">  * </span>  </label>
                                <Dropdown
                                    name="currency"
                                    options={currencies}
                                    handleChange={workspaceHandler}
                                    emptyOption={'select Currency'}
                                    value={workspace['currency'] ? workspace['currency'] : ''}
                                />
                            </div>
                        </div>

                        <div className="bg-white shadow w-full px-10 py-2 flex gap-8 items-center mt-4 rounded">
                            <div className="text-gray-500">
                            <ClockIcon className="h-6 w-6" />
                            </div>
                            <div className="flex flex-col flex-1">
                                <label>Workspace Time Zone <span className="text-red-500">  * </span>  </label>
                                <Dropdown
                                    name="time_zone"
                                    options={timeZone}
                                    handleChange={workspaceHandler}
                                    emptyOption={'select Time zone'}
                                    value={workspace['time_zone'] ? workspace['time_zone'] : ''}
                                />
                            </div>
                        </div>

                        {/* <div className="w-full mt-4">
                            <div className="text-gray-500 font-small">
                            Do you want to connect to an existing OneMessage Workspace
                            </div>
                        </div> */}

                        <div className="grid grid-cols-2 mt-4">
                            <div className="flex justify-start">
                                {/* <button
                                    type="button"
                                    className="w-full inline-flex justify-start rounded-md border border-transparent shadow-sm px-4 py-2 bg-gray-900 hover:bg-gray-500 text-semibold font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm mt-4"
                                >
                                    Connect to an existing Workspace
                                    <span className="flex justify-end pt-1"><ChevronRightIcon className="h-4 w-4"/></span>
                                </button> */}
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