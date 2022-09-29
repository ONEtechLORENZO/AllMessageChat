import React, {useState} from "react";
import {UserCircleIcon, MailIcon, GlobeIcon, FlagIcon, LocationMarkerIcon, ChevronRightIcon}from "@heroicons/react/outline";
import {countries} from '@/Pages/Constants';
import Dropdown from "@/Components/Forms/Dropdown";
import axios from "axios";
import { Link } from "@inertiajs/inertia-react";
import notie from 'notie';

const billingFields = ['company_country', 'company_vat_id', 'admin_email', 'company_address'];

export default function BillingInformation (props) {

    const [billingInformation, setBillingInformation] = useState({});

    // BillingInformation detail handling
    function handleChange (event) {
        let newState = Object.assign({}, billingInformation);
        const name = event.target.name;
        let value = event.target.value;
        newState[name] = value;
        setBillingInformation(newState);
    }

    function mailHandler () {
        let check_mail = true;
        let mail = billingInformation['admin_email'];
        if(mail) {
            let AdminEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if(!AdminEmail.test(mail)){
                notie.alert({type: 'error', text: 'Please enter the valid email', time: 5});
                check_mail =  false;
            }
        }
        return check_mail;
    }

    function validateInformation() {
        let check = true;

        if(billingInformation) {
            billingFields.map( (field) => {
                if(!billingInformation[field]) {
                    check = false;
                }
            });
        }

        if(!billingInformation || billingInformation && !check) {
            notie.alert({type: 'error', text: 'Please fill the required field', time: 5});
        }

        return check;
    }

    function saveBillingInformation () {
        let validate = validateInformation();
        let mailValidate = mailHandler();

        if(validate && mailValidate) {
            let user = props.userMail;
            billingInformation['user_id'] = user['user_id'];
            billingInformation['company_id'] = props.companyId;

            let url = route('billing_information');
            axios.post(url, billingInformation).then( (response) => {
                props.setOpenTab(4);
            });
        }
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
                        <div className="flex justify-start font-semibold text-lg text-primary">Step 3 </div>
                        <div className="flex justify-end font-semibold text-lg">Billing Information</div>
                    </div>

                    <div className="bg-white shadow w-full px-10 py-2 flex gap-8 items-center mt-4 rounded">
                        <div className="text-gray-500">
                           <GlobeIcon className="h-6 w-6" />
                        </div>
                        <div className="flex flex-col flex-1">
                            <label> Company Country<span className="text-red-500"> * </span></label>
                            <Dropdown
                                name="company_country"
                                options={countries}
                                handleChange={handleChange}
                                emptyOption={'select country'}
                                value={billingInformation['company_country'] ? billingInformation['company_country'] : ''}
                            />
                        </div>
                    </div>

                    <div className="bg-white shadow w-full px-10 py-2 flex gap-8 items-center mt-4 rounded">
                        <div className="text-gray-500">
                           <UserCircleIcon className="h-6 w-6" />
                        </div>
                        <div className="flex flex-col flex-1">
                            <label>Company VAT ID<span className="text-red-500"> * </span></label>
                            <input
                                type="text"
                                name="company_vat_id"
                                className="h-4 px-0 py-4 border-0 focus:ring-0 focus:border-primary w-full focus:border-0 focus:border-b"
                                autoComplete="off"
                                value={billingInformation['company_vat_id'] ? billingInformation['company_vat_id'] : ''}
                                onChange={(e) => handleChange(e)}
                            />
                        </div>
                    </div>

                    <div className="bg-white shadow w-full px-10 py-2 flex gap-8 items-center mt-4 rounded">
                        <div className="text-gray-500">
                           <MailIcon className="h-6 w-6" />
                        </div>
                        <div className="flex flex-col flex-1">
                            <label>Admin email for invoices<span className="text-red-500"> * </span></label>
                            <input
                                type="text"
                                name="admin_email"
                                className="h-4 px-0 py-4 border-0 focus:ring-0 focus:border-primary w-full focus:border-0 focus:border-b"
                                autoComplete="off"
                                value={billingInformation['admin_email'] ? billingInformation['admin_email'] : ''}
                                onChange={(e) => handleChange(e)}
                            />
                        </div>
                    </div>

                    <div className="bg-white shadow w-full px-10 py-2 flex gap-8 items-center mt-4 rounded">
                        <div className="text-gray-500">
                           <LocationMarkerIcon className="h-6 w-6" />
                        </div>
                        <div className="flex flex-col flex-1">
                            <label>Company Address<span className="text-red-500"> * </span></label>
                            <input
                                type="text"
                                name="company_address"
                                className="h-4 px-0 py-4 border-0 focus:ring-0 focus:border-primary w-full focus:border-0 focus:border-b"
                                autoComplete="off"
                                value={billingInformation['company_address'] ? billingInformation['company_address'] : ''}
                                onChange={(e) => handleChange(e)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 mt-4">
                        <div className="flex justify-start">
                           
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="button"
                                className="w-full inline-flex justify-end rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary hover:bg-primary/80 text-semibold font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm mt-4"
                                onClick={() => saveBillingInformation()}
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