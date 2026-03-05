import React, {useState, useRef} from "react";
import {countries} from '@/Pages/Constants';
import Dropdown from "@/Components/Forms/Dropdown";
import axios from "axios";
import notie from 'notie';
import PhoneInput2 from 'react-phone-input-2';
import { parsePhoneNumber } from 'react-phone-number-input';
import 'react-phone-input-2/lib/style.css';
import nProgress from 'nprogress';

export default function SignUp(props) {

    const [user, setUser] = useState(props.user);
    const [company, setCompany] = useState(props.company);
    const autocompleteInput = useRef();

    // Google autocomplete fields
    // const google = window.google;
    // const autocomplete = new google.maps.places.Autocomplete(autocompleteInput.current );
    // autocomplete.addListener('place_changed', handlePlaceChanged);

    // Companny detail handling
    function handleCompany (event) {
        let newState = Object.assign({}, company);
        const name = event.target.name;
        let value = event.target.value;
        newState[name] = value;
        setCompany(newState);
    }

    // User detail handling
    function handleUser (event) {
        let newState = Object.assign({}, user);
        const name = event.target.name;
        let value = event.target.value;
        newState[name] = value;
        setUser(newState);
    }

    // Mail validation
    function mailHandler () {
        let check_mail = true;
        let mail = company['email'];
        if(mail) {
            let AdminEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if(!AdminEmail.test(mail)){
                notie.alert({type: 'warning', text: 'Please enter the valid email', time: 5});
                check_mail =  false;
            }
        }
        return check_mail;
    }

    function changePhoneNumber(event, name) {
        let newState = Object.assign({}, company);
        event = '+'+event;
        newState[name] = event;
        if(event && parsePhoneNumber(event) ){
            newState['country_code'] = parsePhoneNumber(event).countryCallingCode;
        }
        setCompany(newState);
    }

    function handlePlaceChanged(e) {
        handleCompany(e);
        // if(autocomplete){
        //    const place = autocomplete.getPlace();
        //    if(place){
        //     autoCompleteHandler(place.address_components);
        //    } else {
        //     handleCompany(e);
        //    }
        // }
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
        let newState = Object.assign({}, company);

        newState['company_address'] = street_number +' '+ route;
        newState['city'] = city;
        newState['country'] = country;
        newState['state'] = state;
        newState['codice_destinatario'] = postal_code;

        setCompany(newState);
    }
    
    function updateCompanyDetail () {
        let mailValidate = mailHandler();

        if(mailValidate) {
            nProgress.start(0.5);
            nProgress.inc(0.2);

            let data = {
                'user' : user,
                'company' : company
            };

            let url = route('billing_information');
            axios.post(url, data).then( (response) => {
                nProgress.done(true);
                if(response) {
                    props.setOpenTab(6);
                }
            });
        }
    }

    return (
    <>
        <div className="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-gray-100">
            <div className="sm:max-w-md w-full p-2 flex justify-center items-center flex-col">
                <img src="/img/OneMessage.ChatLOGO.png" alt="One Message"/>
                <h1 className="text-xl font-bold !mt-6">Welcome aboard sailor!</h1>
                <p>Let's fill out your profile</p>

                <div className='!mt-12 w-full'>
                    <h2 className='text-xl font-bold text-primary text-center'>About you</h2>

                    <div className='card !rounded-2xl !p-8 w-full space-y-4 !mt-6 text-base'>

                        <input type='text' className='w-full p-2  border-b !border-t-0 !border-r-0 !ring-offset-0 !ring-0 !border-l-0 border-[#D3D3D3] !outline-none placeholder:text-[#B4B5BF] focus:border-primary' placeholder='First Name' name='first_name' value={user['first_name'] ? user['first_name'] : ''}  onChange={(e) => handleUser(e)}/>
                        <input type='text' className='w-full p-2  border-b !border-t-0 !border-r-0 !ring-offset-0 !ring-0 !border-l-0 border-[#D3D3D3] !outline-none placeholder:text-[#B4B5BF] focus:border-primary' placeholder='Last Name' name='last_name' value={user['last_name'] ? user['last_name'] : ''}  onChange={(e) => handleUser(e)}/>
                        <div className="w-full !pt-2 !pb-0 border-b !border-t-0 !border-r-0 !ring-offset-0 !ring-0 !border-l-0 border-[#D3D3D3] !outline-none placeholder:text-[#B4B5BF] focus:border-primary">
                            <PhoneInput2
                                inputProps={{name: 'phone_number',autoFocus: true}}
                                containerStyle={{ marginTop: "15px" }}
                                searchclassName="search-class"
                                searchStyle={{ margin: "0", width: "97%", height: "30px" }}
                                buttonStyle={{ border : "none"}}
                                inputStyle={{ border : "none"}}
                                enableSearchField
                                disableSearchIcon
                                placeholder="Enter phone number"
                                value={company['phone_number'] ? company['phone_number'] : ''} 
                                onChange={(e) => changePhoneNumber(e, 'phone_number')}
                            />
                        </div>

                    </div>
                </div>
                <div className='!mt-12 w-full'>
                    <h2 className='text-xl font-bold text-primary text-center'>About your organization</h2>

                    <div className='card !rounded-2xl !p-8 w-full space-y-4 !mt-6 text-base'>

                        <input type='text' className='w-full p-2  border-b !border-t-0 !border-r-0 !ring-offset-0 !ring-0 !border-l-0 border-[#D3D3D3] !outline-none placeholder:text-[#B4B5BF] focus:border-primary' placeholder='Your Organization Name'  name='organization' value={company['organization'] ? company['organization'] : ''} onChange={(e) => handleCompany(e)}/>
                        <div className="w-full pt-2  border-b !border-t-0 !border-r-0 !ring-offset-0 !ring-0 !border-l-0 border-[#D3D3D3] !outline-none placeholder:text-[#B4B5BF] focus:border-primary">
                           {/* <Dropdown
                                name="company_country"
                                options={countries}
                                className="appearance-none"
                                handleChange={handleCompany}
                                emptyOption={'Company Country'}
                                value={company['company_country'] ? company['company_country'] : ''}
                            /> */}
                            <select 
                                value={company['company_country'] ? company['company_country'] : ''}
                                name="company_country"
                                onChange={(e) => handleCompany(e)}
                                className="block border-0 focus:outline-none !bg-transparent !pr-[2rem] sm:text-sm appearance-none w-full ">
                                <option value="" >Select</option>
                                {countries && Object.keys(countries).map((key) => {
                                    return <option key={key} value={key}>{countries[key]}</option>;
                                })}
                            </select>
                        </div>
                        <input type='text' className='w-full p-2  border-b !border-t-0 !border-r-0 !ring-offset-0 !ring-0 !border-l-0 border-[#D3D3D3] !outline-none placeholder:text-[#B4B5BF] focus:border-primary' placeholder='VAT ID' name='company_vat_id' value={company['company_vat_id'] ? company['company_vat_id'] : ''} onChange={(e) => handleCompany(e)}/>
                        <input type='text' className='w-full p-2  border-b !border-t-0 !border-r-0 !ring-offset-0 !ring-0 !border-l-0 border-[#D3D3D3] !outline-none placeholder:text-[#B4B5BF] focus:border-primary' placeholder='Email for invoices' name='email' value={company['email'] ? company['email'] : ''} onChange={(e) => handleCompany(e)}/>
                        <input type='text' className='w-full p-2  border-b !border-t-0 !border-r-0 !ring-offset-0 !ring-0 !border-l-0 border-[#D3D3D3] !outline-none placeholder:text-[#B4B5BF] focus:border-primary' placeholder='Address' name='company_address' value={company['company_address'] ? company['company_address'] : ''} onChange={(e) => handlePlaceChanged(e)} ref={autocompleteInput}/>

                        <input type='text' className='w-full p-2  border-b !border-t-0 !border-r-0 !ring-offset-0 !ring-0 !border-l-0 border-[#D3D3D3] !outline-none placeholder:text-[#B4B5BF] focus:border-primary' placeholder='City' name='city' value={company['city'] ? company['city'] : ''} onChange={(e) => handleCompany(e)}/>
                        <input type='text' className='w-full p-2  border-b !border-t-0 !border-r-0 !ring-offset-0 !ring-0 !border-l-0 border-[#D3D3D3] !outline-none placeholder:text-[#B4B5BF] focus:border-primary' placeholder='State' name='state' value={company['state'] ? company['state'] : ''} onChange={(e) => handleCompany(e)}/>
                        <input type='text' className='w-full p-2  border-b !border-t-0 !border-r-0 !ring-offset-0 !ring-0 !border-l-0 border-[#D3D3D3] !outline-none placeholder:text-[#B4B5BF] focus:border-primary' placeholder='Zin Code' name='codice_destinatario' value={company['codice_destinatario'] ? company['codice_destinatario'] : ''} onChange={(e) => handleCompany(e)}/>
                        <input type='text' className='w-full p-2  border-b !border-t-0 !border-r-0 !ring-offset-0 !ring-0 !border-l-0 border-[#D3D3D3] !outline-none placeholder:text-[#B4B5BF] focus:border-primary' placeholder='Country' name='country' value={company['country'] ? company['country'] : ''} onChange={(e) => handleCompany(e)}/>
                    </div>
                </div>

                <div className='!mt-6 w-full'>
                    <div className="flex justify-center">
                        <button
                            type="button"
                            className="w-full inline-flex justify-end rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary hover:bg-primary/80 text-semibold font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm mt-4"
                            onClick={() => updateCompanyDetail()}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </>
  )
}












