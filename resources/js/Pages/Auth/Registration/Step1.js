import React, {useEffect, useState} from "react";
import {UserIcon, UserAddIcon, PhoneIcon, KeyIcon, MailIcon, ChevronRightIcon, EyeIcon}from "@heroicons/react/outline";
import { Link } from "@inertiajs/inertia-react";
import axios from "axios";
import notie from 'notie';
import nProgress from 'nprogress';

const validateList = [
    'first_name','last_name','email','phone_number','password'
];

export default function Step1 (props) {

    const [user, setUser] = useState({});
    const [passwordType, setPasswordType] = useState("password");
    
    useEffect( () => { 
        if(props.userMail) {
            updateUserData();
        }
    },[]);
    
    /**
     * Update user data
     */
    function updateUserData(){
        let newUser = Object.assign({}, user);
        newUser['email'] = props.userMail;
        newUser['uuid'] = props.uuid ? props.uuid : '';
        setUser(newUser);
    }
    
    // User detail Handling
    function userHandler (event) {
        let newUser = Object.assign({}, user);
        const name = event.target.name;
        const value = event.target.value;
        newUser[name] = value;
        setUser(newUser);
    }

    // Phone number change event
    function changePhoneNumber (event) {
        let newUser = Object.assign({}, user);
        const name = event.target.name;
        let result = event.target.value;

        if(result) {
            result = result.replace(/[^0-9]/g,'');
        }
        newUser[name] = result;
        setUser(newUser)
    }

    // Password show Or not
    function showPassword () {
        if(passwordType == 'password') {
            setPasswordType('text')
        }
        if(passwordType == 'text') {
            setPasswordType('password');
        }
    }

    function userValidation (user) {
       let validate = true;
       let field_value = '';
       if(user) {
           validateList.map( (list) => {
             field_value = user[list];
             if(validate && !field_value ) {
                notie.alert({type: 'error', text: 'Please enter the required field value', time: 5});
                validate = false;
             }
        } );
       }
       return validate;
    }

    function errorHandler(message) {
        Object.entries(message.errors).map( ([key,error]) => {
            notie.alert({type: 'error', text: error[0], time: 5});
        } )
    }

    function saveUserDetail () {

        let is_validate = userValidation(user);
        if(!is_validate) {
            return false;
        }
        nProgress.start(0.5);
        nProgress.inc(0.2);

        let url = route('new_user');
        axios.post(url, user).then( (response) => {
            if(response.data.step) {
                props.setOpenTab(7);
                nProgress.done(true);
            } else {
                nProgress.done(true);
                let newUser = Object.assign({}, user);
                newUser['user_id'] = response.data.user_id;
                props.setUserMail(newUser);
    
                props.setOpenTab(2);
            }
        })
        .catch((error) => {
            errorHandler(error.response.data)
        });
    }

    return (
        <div className="h-screen w-full bg-blue-50 flex justify-center items-center">
            <div className="max-w-7xl flex mx-auto items-center px-10">
                <div className="w-full bg-white self-stretch flex justify-center py-24 rounded-xl px-4 lg:px-10">
                  <form id="form">
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

                        <div className="grid grid-cols-2 mt-4">
                            <div className="flex justify-start font-semibold text-lg text-primary">Step 1 </div>
                            <div className="flex justify-end font-semibold text-lg">About You</div>
                        </div>

                        <div className="bg-white shadow w-full px-10 py-2 flex gap-8 items-center mt-4 rounded">
                            <div className="text-gray-500">
                               <UserIcon className="h-6 w-6" />
                            </div>
                            <div className="flex flex-col flex-1">
                                <label>First Name <span className="text-red-500">  * </span>  </label>
                                <input
                                    type="text"
                                    name="first_name"
                                    className="h-4 px-0 py-4 border-0 focus:ring-0 focus:border-primary w-full focus:border-0 focus:border-b"
                                    autoComplete="off"
                                    value={user['first_name'] ? user['first_name'] : ''}
                                    onChange={(e) => userHandler(e)}
                                />
                            </div>
                        </div>

                        <div className="bg-white shadow w-full px-10 py-2 flex gap-8 items-center mt-4 rounded">
                            <div className="text-gray-500">
                               <UserAddIcon className="h-6 w-6" />
                            </div>
                            <div className="flex flex-col flex-1">
                                <label>Last Name <span className="text-red-500">  * </span>  </label>
                                <input
                                    type="text"
                                    name="last_name"
                                    className="h-4 px-0 py-4 border-0 focus:ring-0 focus:border-primary w-full focus:border-0 focus:border-b"
                                    autoComplete="off"
                                    value={user['last_name'] ? user['last_name'] : ''}
                                    onChange={(e) => userHandler(e)}
                                />
                            </div>
                        </div>

                        <div className="bg-white shadow w-full px-10 py-2 flex gap-8 items-center mt-4 rounded">
                            <div className="text-gray-500">
                               <MailIcon className="h-6 w-6" />
                            </div>
                            <div className="flex flex-col flex-1">
                                <label>Email <span className="text-red-500">  * </span>  </label>
                                <input
                                    type="email"
                                    name="email"
                                    className="h-4 px-0 py-4 border-0 focus:ring-0 focus:border-primary w-full focus:border-0 focus:border-b"
                                    autoComplete="off"
                                    value={user['email'] ? user['email'] : ''}
                                    onChange={(e) => userHandler(e)}
                                />
                            </div>
                            <div className="w-4"></div>
                        </div>

                        <div className="bg-white shadow w-full px-10 py-2 flex gap-8 items-center mt-4 rounded">
                            <div className="text-gray-500">
                               <PhoneIcon className="h-6 w-6" />
                            </div>
                            <div className="flex flex-col flex-1">
                                <label>Telephone Number <span className="text-red-500">  * </span>  </label>
                                <input
                                    type="text"
                                    name="phone_number"
                                    className="h-4 px-0 py-4 border-0 focus:ring-0 focus:border-primary w-full focus:border-0 focus:border-b"
                                    autoComplete="off"
                                    value={user['phone_number'] ? user['phone_number'] : ''}
                                    onChange={(e) => changePhoneNumber(e)}
                                />
                            </div>
                            <div className="w-4"></div>
                        </div>

                        <div className="bg-white shadow w-full px-10 py-2 flex gap-8 items-center mt-4 rounded">
                            <div className="text-gray-500">
                               <KeyIcon className="h-6 w-6" />
                            </div>
                            <div className="flex flex-col flex-1">
                                <label>Password <span className="text-red-500">  * </span>  </label>
                                <input
                                    type={passwordType}
                                    name="password"
                                    className="h-4 px-0 py-4 border-0 focus:ring-0 focus:border-primary w-full focus:border-0 focus:border-b"
                                    autoComplete="off"
                                    value={user['password'] ? user['password'] : ''}
                                    onChange={(e) => userHandler(e)}
                                />
                            </div>
                            <div className="cursor-pointer w-4">
                                <div className="text-gray-500">
                                   <EyeIcon className="h-4 w-4" onClick={() => showPassword()}/>
                                </div>
                            </div>
                        </div>
                        
                        <div className="py-8 flex justify-end">
                            <button
                                type="button"
                                className="w-full inline-flex justify-end rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary hover:bg-primary/80 text-semibold font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm mt-8"
                                onClick={() => saveUserDetail()}
                            >
                                Next
                                <span className="flex justify-end pt-1 pl-2"><ChevronRightIcon className="h-4 w-4"/></span>
                            </button>
                        </div>
            
                    </div>
                  </form>
                </div>
            </div>
        </div>
    );
}