import React, {useState} from "react";
import {UserCircleIcon, UsersIcon, GlobeAltIcon, FlagIcon, MapPinIcon, ChevronRightIcon}from "@heroicons/react/24/outline";
import {countries} from '@/Pages/Constants';
import Dropdown from "@/Components/Forms/Dropdown";
import axios from "axios";
import { Link } from "@inertiajs/react";
import notie from 'notie';

import {  Input } from "reactstrap";

export default function Step3 (props) {

    const [organization, setOrganization] = useState({});

    // Organization detail handling
    function handleChange (event) {
        let newState = Object.assign({}, organization);
        const name = event.target.name;
        let value = event.target.value;
        newState[name] = value;
        setOrganization(newState);
    }

    // Employee count
    function totalEmployee (event) {
        let newState = Object.assign({}, organization);
        const name = event.target.name;
        let result = event.target.value;

        if(result) {
            result = result.replace(/[^0-9]/g,'');
        }
        newState[name] = result;
        setOrganization(newState)
    }

    function saveOrganization () {
      
        if(organization && !organization['name']) {
            notie.alert({type: 'error', text: 'Please enter the required field value', time: 5});
            return false;
        }

        let url = route('newOrganization');
        axios.post(url, organization).then( (response) => {
            props.setOpenTab(5);
        });

    }

    return (
        <div className="h-full w-full bg-blue-50 flex justify-center items-center">
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
                        <div className="flex justify-start font-semibold text-lg text-primary">Step 4 of 5 </div>
                        <div className="flex justify-end font-semibold text-lg">About Your Organization</div>
                    </div>

                    <div className="bg-white shadow w-full px-10 py-2 flex gap-8 items-center mt-4 rounded">
                        <div className="text-gray-500">
                           <UserCircleIcon className="h-6 w-6" />
                        </div>
                        <div className="flex flex-col flex-1">
                            <label>Your Organization Name <span className="text-red-500"> * </span> </label>
                            <input
                                type="text"
                                name="name"
                                autoComplete="off"
                                value={organization['name'] ? organization['name'] : ''}
                                onChange={(e) => handleChange(e)}
                            />
                        </div>
                    </div>

                    {/* <div className="bg-white shadow w-full px-10 py-2 flex gap-8 items-center mt-4 rounded">
                        <div className="text-gray-500">
                           <UserCircleIcon className="h-6 w-6" />
                        </div>
                        <div className="flex flex-col flex-1">
                            <label>VAT ID</label>
                            <input
                                type="text"
                                className="h-4 px-0 py-4 border-0 focus:ring-0 focus:border-primary w-full focus:border-0 focus:border-b"
                                autoComplete="off"
                            />
                        </div>
                    </div> */}

                    <div className="bg-white shadow w-full px-10 py-2 flex gap-8 items-center mt-4 rounded">
                        <div className="text-gray-500">
                           <UsersIcon className="h-6 w-6" />
                        </div>
                        <div className="flex flex-col flex-1">
                            <label>Number of Employees</label>
                            <Input
                                type="text"
                                name="number_of_employees"
                                autoComplete="off"
                                value={organization['number_of_employees'] ? organization['number_of_employees'] : ''}
                                onChange={(e) => totalEmployee(e)}
                            />
                        </div>
                    </div>

                    <div className="bg-white shadow w-full px-10 py-2 flex gap-8 items-center mt-4 rounded">
                        <div className="text-gray-500">
                           <GlobeAltIcon className="h-6 w-6" />
                        </div>
                        <div className="flex flex-col flex-1">
                            <label>Country</label>
                            <Dropdown
                                name="country"
                                options={countries}
                                handleChange={handleChange}
                                emptyOption={'select country'}
                                value={organization['country'] ? organization['country'] : ''}
                            />
                        </div>
                    </div>

                    <div className="bg-white shadow w-full px-10 py-2 flex gap-8 items-center mt-4 rounded">
                        <div className="text-gray-500">
                           <FlagIcon className="h-6 w-6" />
                        </div>
                        <div className="flex flex-col flex-1">
                            <label>City</label>
                            <Input
                                type="text"
                                name="city"
                                
                                autoComplete="off"
                                value={organization['city'] ? organization['city'] : ''}
                                onChange={(e) => handleChange(e)}
                            />
                        </div>
                    </div>

                    <div className="bg-white shadow w-full px-10 py-2 flex gap-8 items-center mt-4 rounded">
                        <div className="text-gray-500">
                           <MapPinIcon className="h-6 w-6" />
                        </div>
                        <div className="flex flex-col flex-1">
                            <label>Address</label>
                            <Input
                                type="text"
                                name="street"
                                autoComplete="off"
                                value={organization['street'] ? organization['street'] : ''}
                                onChange={(e) => handleChange(e)}
                            />
                        </div>
                    </div>

                    {/* <div className="w-3/5 mt-4">
                        <div className="text-gray-500 font-small">
                            Your organization is already registered into OneMessage App?
                            Select "connect to an existing organization"
                        </div>
                    </div> */}

                    <div className="grid grid-cols-2 mt-4">
                        <div className="flex justify-start">
                            <button
                                type="button"
                                className="w-full inline-flex justify-start rounded-md border border-transparent shadow-sm px-4 py-2 bg-gray-500 hover:bg-gray-900 text-semibold font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm mt-4"
                                onClick={() => props.setOpenTab(5)}
                           >
                                Skip
                                <span className="flex justify-end pt-1"><ChevronRightIcon className="h-4 w-4"/></span>
                            </button>
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="button"
                                className="w-full inline-flex justify-end rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary hover:bg-primary/80 text-semibold font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm mt-4"
                                onClick={() => saveOrganization()}
                           >
                                Next
                                <span className="flex justify-end pt-1"><ChevronRightIcon className="h-4 w-4"/></span>
                            </button>
                        </div>
                    </div>

                    {/* <div className="flex justify-end mt-4">
                        <button
                            type="button"
                            className="w-full inline-flex justify-end rounded-md border border-transparent shadow-sm px-4 py-2 bg-gray-300 hover:bg-primary/80 text-semibold font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm "
                            onClick={() =>props.setOpenTab(4)}
                        >
                            Skip
                            <span className="flex justify-end pt-1"><ChevronRightIcon className="h-4 w-4"/></span>
                        </button>
                    </div> */}
        
                </div>
            </div>
          </div>
        </div>
    );
}









