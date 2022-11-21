import React, {useEffect, useRef, useState} from "react";
import {countries} from '@/Pages/Constants';
import Dropdown from "@/Components/Forms/Dropdown";
import axios from "axios";
import { Link } from "@inertiajs/inertia-react";
import notie from 'notie';
import {UserCircleIcon, MailIcon, GlobeIcon, FlagIcon, LocationMarkerIcon, ChevronRightIcon, HomeIcon, MailOpenIcon, OfficeBuildingIcon, PhoneIcon, LibraryIcon}from "@heroicons/react/outline";
import PhoneInput2 from 'react-phone-input-2';
import { parsePhoneNumber } from 'react-phone-number-input';
import 'react-phone-input-2/lib/style.css';
import {  Input } from "reactstrap";

export default function BillingInformation (props) {

    const [billingInformation, setBillingInformation] = useState({});
    const autocompleteInput = useRef();

    // Google autocomplete fields
    const google = window.google;
    const autocomplete = new google.maps.places.Autocomplete(autocompleteInput.current );
    autocomplete.addListener('place_changed', handlePlaceChanged);

    useEffect(() => {
        if(props.userMail.email) {
            let newBilling = Object.assign( {}, billingInformation);
            newBilling['email'] = props.userMail.email;
            setBillingInformation(newBilling);
        }
    },[]);

    // BillingInformation detail handling
    function handleChange (event) {
        let newState = Object.assign({}, billingInformation);
        const name = event.target.name;
        let value = event.target.value;
        newState[name] = value;
        setBillingInformation(newState);
    }

    function handlePlaceChanged(e) {
        if(autocomplete){
           const place = autocomplete.getPlace();
           if(place){
            autoCompleteHandler(place.address_components);
           } else {
            handleChange(e);
           }
        }
    }

    // Company address auto-fill using Google autocomplete form
    function autoCompleteHandler(address_components) {
        let city = '';
        let state = '';
        let route = '';
        let country = '';
        let postal_code = '';
        let street_number = '';

        address_components.map( (component) => {
            for( let i = 0;  i < component.types.length; i++) {
                if(component.types[i] == 'postal_code'){
                    postal_code = component.long_name
                } 
                else if(component.types[i] == 'locality'){
                    city = component.long_name
                } 
                else if(component.types[i] == 'administrative_area_level_1'){
                    state = component.long_name
                }
                else if(component.types[i] == 'country'){
                    country = component.long_name
                }
                else if(component.types[i] == 'street_number'){
                    street_number = component.long_name
                }
                else if(component.types[i] == 'route'){
                    route = component.long_name
                }
            }
        });
        let newState = Object.assign({}, billingInformation);

        newState['company_address'] = street_number +' '+ route;
        newState['city'] = city;
        newState['country'] = country;
        newState['state'] = state;
        newState['codice_destinatario'] = postal_code;

        setBillingInformation(newState);
    }

    function mailHandler () {
        let check_mail = true;
        let mail = billingInformation['email'];
        if(mail) {
            let AdminEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if(!AdminEmail.test(mail)){
                notie.alert({type: 'warning', text: 'Please enter the valid email', time: 5});
                check_mail =  false;
            }
        }
        return check_mail;
    }

    function saveBillingInformation () {
        let mailValidate = mailHandler();

        if(mailValidate) {
            let user = props.userMail;
            billingInformation['user_id'] = user['user_id'];
            billingInformation['company_id'] = props.companyId;

            let url = route('billing_information');
            axios.post(url, billingInformation).then( (response) => {
                props.setOpenTab(6);
            });
        }
    }

    function changePhoneNumber(event, name) {
        let newState = Object.assign({}, billingInformation);
        event = '+'+event;
        newState[name] = event;
        if(event && parsePhoneNumber(event) ){
            newState['country_code'] = parsePhoneNumber(event).countryCallingCode;
        }
        setBillingInformation(newState);
    }

    return (
        <div className="w-full bg-blue-50 flex justify-center items-center">
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
                        <div className="flex justify-start font-semibold text-lg text-primary">Step 3 of 3 </div>
                        <div className="flex justify-end font-semibold text-lg">Billing Information</div>
                    </div>

                    
                    <div className="w-full px-10 py-2 flex gap-8 items-center mt-2">
                        <div className="text-gray-500">
                           <LibraryIcon className="h-6 w-6" />
                        </div>
                        <div className="flex flex-col flex-1">
                            <label>Organization Name</label>
                            <Input
                                type="text"
                                name="organization"
                                
                                autoComplete="off"
                                value={billingInformation['organization'] ? billingInformation['organization'] : ''}
                                onChange={(e) => handleChange(e)}
                            />                          
                        </div>
                    </div>

                    
                    <div className="w-full px-10 py-2 flex gap-8 items-center mt-2">
                        <div className="text-gray-500">
                           <PhoneIcon className="h-6 w-6" />
                        </div>
                        <div className="flex flex-col flex-1">
                            <label>Telephone Number</label>
                            <PhoneInput2
                                inputProps={{name: 'phone_number',autoFocus: true}}
                                containerStyle={{ marginTop: "15px" }}
                                searchClass="search-class"
                                searchStyle={{ margin: "0", width: "97%", height: "30px" }}
                                enableSearchField
                                disableSearchIcon
                                placeholder="Enter phone number"
                                value={billingInformation['phone_number'] ? billingInformation['phone_number'] : ''} 
                                onChange={(e) => changePhoneNumber(e, 'phone_number')}
                            />
                        </div>
                    </div>

                    <div className="w-full px-10 py-2 flex gap-8 items-center mt-2">
                        <div className="text-gray-500">
                           <GlobeIcon className="h-6 w-6" />
                        </div>
                        <div className="flex flex-col flex-1">
                            <label> Company Country</label>
                            <Dropdown
                                name="company_country"
                                options={countries}
                                handleChange={handleChange}
                                emptyOption={'select country'}
                                value={billingInformation['company_country'] ? billingInformation['company_country'] : ''}
                            />
                        </div>
                    </div>

                    <div className="w-full px-10 py-2 flex gap-8 items-center mt-2">
                        <div className="text-gray-500">
                           <UserCircleIcon className="h-6 w-6" />
                        </div>
                        <div className="flex flex-col flex-1">
                            <label>Company VAT ID </label>
                            <Input
                                type="text"
                                name="company_vat_id"
                                autoComplete="off"
                                value={billingInformation['company_vat_id'] ? billingInformation['company_vat_id'] : ''}
                                onChange={(e) => handleChange(e)}
                            />
                        </div>
                    </div>

                    <div className="w-full px-10 py-2 flex gap-8 items-center mt-2">
                        <div className="text-gray-500">
                           <MailIcon className="h-6 w-6" />
                        </div>
                        <div className="flex flex-col flex-1">
                            <label>Email for invoices</label>
                            <Input
                                type="text"
                                name="email"
                                autoComplete="off"
                                value={billingInformation['email'] ? billingInformation['email'] : ''}
                                onChange={(e) => handleChange(e)}
                            />
                        </div>
                    </div>

                    <div className="w-full px-10 py-2 flex gap-8 items-center mt-2">
                        <div className="text-gray-500">
                           <OfficeBuildingIcon className="h-6 w-6" />
                        </div>
                        <div className="flex flex-col flex-1">
                            <label>Company Address</label>
                            <input
                                type="text"
                                name="company_address"
                                className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-md sm:text-sm border-gray-300 "
                                autoComplete="off"
                                value={billingInformation['company_address'] ? billingInformation['company_address'] : ''}
                                onChange={(e) => handlePlaceChanged(e)}
                                ref={autocompleteInput}
                            />
                        </div>
                    </div>

                    <div className="w-full px-10 py-2 flex gap-8 items-center mt-2">
                        <div className="text-gray-500">
                           <HomeIcon className="h-6 w-6" />
                        </div>
                        <div className="flex flex-col flex-1">
                            <label>City</label>
                            <Input
                                type="text"
                                name="city"
                                autoComplete="off"
                                value={billingInformation['city'] ? billingInformation['city'] : ''}
                                onChange={(e) => handleChange(e)}
                            />
                        </div>
                    </div>

                    <div className="w-full px-10 py-2 flex gap-8 items-center mt-2">
                        <div className="text-gray-500">
                           <LocationMarkerIcon className="h-6 w-6" />
                        </div>
                        <div className="flex flex-col flex-1">
                            <label>State</label>
                            <Input
                                type="text"
                                name="state"
                                autoComplete="off"
                                value={billingInformation['state'] ? billingInformation['state'] : ''}
                                onChange={(e) => handleChange(e)}
                            />
                        </div>
                    </div>

                    <div className="w-full px-10 py-2 flex gap-8 items-center mt-2">
                        <div className="text-gray-500">
                           <MailOpenIcon className="h-6 w-6" />
                        </div>
                        <div className="flex flex-col flex-1">
                            <label>Zin Code</label>
                            <Input
                                type="text"
                                name="codice_destinatario"
                                autoComplete="off"
                                value={billingInformation['codice_destinatario'] ? billingInformation['codice_destinatario'] : ''}
                                onChange={(e) => handleChange(e)}
                            />
                        </div>
                    </div>

                    <div className="w-full px-10 py-2 flex gap-8 items-center mt-2">
                        <div className="text-gray-500">
                           <FlagIcon className="h-6 w-6" />
                        </div>
                        <div className="flex flex-col flex-1">
                            <label>Country</label>
                            <Input
                                type="text"
                                name="country"
                                autoComplete="off"
                                value={billingInformation['country'] ? billingInformation['country'] : ''}
                                onChange={(e) => handleChange(e)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 mt-4">
                        <div className="flex justify-start">
                            <button
                                type="button"
                                className="w-full inline-flex justify-start rounded-md border border-transparent shadow-sm px-4 py-2 bg-gray-500 hover:bg-gray-900 text-semibold font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm mt-4"
                                onClick={() => props.setOpenTab(6)}
                           >
                                Skip
                                <span className="flex justify-end pt-1"><ChevronRightIcon className="h-4 w-4"/></span>
                            </button>
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