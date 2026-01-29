import React from "react";
import { Link } from "@inertiajs/react";
import notie from 'notie';

export default function UserRegistration (props) {

    // Get user mail id
    function registerMail (event) {
        let newUser = Object.assign({}, props.userMail);
        const name = event.target.name;
        let value = event.target.value;
        newUser[name] = value;
        props.setUserMail(newUser);
    }

    // check the mail is validate
    function userRegister() {
        let email = props.userMail['email'];
        if(email) {
            let regEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if(!regEmail.test(email)){
                notie.alert({type: 'error', text: 'Please enter the valid email', time: 5});
                return false;
            }
            props.setOpenTab(1);
        } else {
            notie.alert({type: 'warning', text: 'Email field required.', time: 5});
        }
        return false;
    }

    return (
        <div className="h-screen w-full bg-blue-50 flex justify-center items-center">
            <div className="max-w-7xl flex mx-auto items-center px-10">
                <div className="w-full bg-white self-stretch flex justify-center py-24 rounded-xl px-4 lg:px-10">
                    <div className="">
                        <div className="flex justify-center">
                            <img
                                src="./img/onemessage-logo.png"
                                alt="One message logo"
                                className="w-1/2"
                            />
                        </div>
                        <div className="pl-10 flex justify-center">
                            <span>Already have an account
                                <Link
                                        href={route('login')}
                                        className="text-primary px-2"
                                        >
                                        Log in
                                </Link>
                            </span>
                        </div>
                        
                        <h1 className="font-semibold text-lg mt-4">
                            User Registration
                        </h1>

                        <div className="bg-white shadow w-full px-10 py-2 flex gap-8 items-center mt-8 rounded">
                            <div>
                                <svg
                                    width={20}
                                    height={16}
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                        d="M1.458.65A1.46 1.46 0 0 0 0 2.11v11.667c0 .805.653 1.458 1.458 1.458h17.084c.805 0 1.458-.653 1.458-1.458V2.109c0-.805-.653-1.458-1.458-1.458H1.458ZM1.25 2.11c0-.115.093-.208.208-.208h17.084c.115 0 .208.093.208.208v.71l-8.633 5.833a.208.208 0 0 1-.234 0L1.25 2.819v-.71Zm0 2.218v9.449c0 .115.093.208.208.208h17.084a.208.208 0 0 0 .208-.208v-9.45l-7.934 5.36a1.458 1.458 0 0 1-1.632 0L1.25 4.328Z"
                                        fill="#3D4459"
                                    />
                                </svg>
                            </div>
                            <div className="flex flex-col flex-1">
                                <label>Register with Email<span className="text-red-500">  * </span> </label>
                                <input
                                    type="text"
                                    name="email"
                                    className="h-4 px-0 py-4 border-0 focus:ring-0 focus:border-primary w-full focus:border-0 focus:border-b"
                                    placeholder="example@email.com"
                                    autoComplete="off"
                                    value={props.userMail['email'] ? props.userMail['email'] : ''}
                                    onChange={(e) => registerMail(e)}
                                />
                            </div>
                            <div className="w-4"></div>
                        </div>

                        <button
                            type="button"
                            className="w-full py-3 bg-primary hover:bg-primary/80 mt-4 text-semibold rounded text-white"
                            onClick={() => userRegister()}
                        >
                            Register
                        </button>

                        {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-white mt-10">
                            <button type="button" className="inline-flex bg-[#3D4459] rounded text-center justify-center py-3 gap-3 text-semibold ">
                                <img
                                    src="./img/google-logo.png"
                                    alt="google logo"
                                />
                                Sign up with Google
                            </button>
                            <button type="button" className="inline-flex bg-[#3D4459] rounded text-center justify-center py-3 gap-3 text-semibold ">
                                <img
                                    src="./img/facebook-logo.png"
                                    alt="facebook logo"
                                />
                                Sign up with Facebook
                            </button>
                        </div> */}

                        <div className="mt-16 flex justify-center">
                            <span>Already have an account 
                                <Link
                                    href={route('login')}
                                    className="text-primary px-2"
                                    >
                                    Log in
                                </Link>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}









