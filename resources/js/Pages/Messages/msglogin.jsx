import React from "react";

export default function msglogin() {
    return (
        <div className="h-screen w-full bg-blue-50 flex justify-center items-center">
            <div className="max-w-7xl flex mx-auto items-center px-10">
                <div className="relative -mr-0 lg:-mr-16 xl:-mr-20 hidden lg:block">
                    <img src="./img/login-mobile.png" className="w-full " />
                </div>
                <div className="w-full bg-white self-stretch flex justify-center py-24 rounded-xl px-4 lg:px-10">
                    <div className="">
                        <img
                            src="./img/onemessage-logo.png"
                            alt="One message logo"
                            className="w-1/2"
                        />

                        <h1 className="font-semibold text-lg mt-4">
                            Login to access your account
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
                                <label>Email</label>
                                <input
                                    type="text"
                                    className="h-4 px-0 py-4 border-0 focus:ring-0 focus:border-primary w-full focus:border-0 focus:border-b"
                                    placeholder="email"
                                    autoComplete="off"
                                />
                            </div>
                            <div className="w-4"></div>
                        </div>

                        <div className="bg-white shadow w-full px-10 py-2 flex gap-8 items-center my-4 rounded">
                            <div>
                                <svg
                                    width={20}
                                    height={21}
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M13.958 8.026a1.042 1.042 0 1 0 0-2.084 1.042 1.042 0 0 0 0 2.084Z"
                                        fill="#24292E"
                                    />
                                    <path
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                        d="M13.125.942a6.875 6.875 0 0 0-6.543 8.992L.427 16.09A1.458 1.458 0 0 0 0 17.12v2.364c0 .805.653 1.458 1.458 1.458h1.25c.806 0 1.459-.653 1.459-1.458v-.834c0-.115.093-.208.208-.208h2.28a.625.625 0 0 0 .454-.183l.177-.178a.73.73 0 0 0 .214-.515v-1.207c0-.115.093-.209.208-.209h.905c.387 0 .758-.153 1.032-.427l1.363-1.363A6.875 6.875 0 1 0 13.125.942ZM7.5 7.817a5.625 5.625 0 1 1 3.573 5.24.625.625 0 0 0-.67.14L8.761 14.84a.209.209 0 0 1-.148.06h-.905c-.805 0-1.458.653-1.458 1.459v.833H4.375c-.805 0-1.458.653-1.458 1.459v.833a.208.208 0 0 1-.209.208h-1.25a.208.208 0 0 1-.208-.208v-2.363c0-.055.022-.108.061-.147l6.435-6.435a.625.625 0 0 0 .14-.67A5.61 5.61 0 0 1 7.5 7.817Z"
                                        fill="#24292E"
                                    />
                                </svg>
                            </div>
                            <div className="flex flex-col flex-1">
                                <label>Password</label>
                                <input
                                    type="Password"
                                    className="h-4 px-0 py-4 border-0 focus:ring-0 focus:border-primary w-full focus:border-0 focus:border-b"
                                    placeholder=""
                                    autoComplete="off"
                                />
                            </div>
                            <div className="cursor-pointer w-4">
                                <svg
                                    width={16}
                                    height={17}
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M8 4.442c-5 0-7 4.5-7 4.5s2 4.5 7 4.5 7-4.5 7-4.5-2-4.5-7-4.5Z"
                                        stroke="#7A7A7A"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    <path
                                        d="M8 11.442a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"
                                        stroke="#7A7A7A"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </div>
                        </div>

                        <div>
                            <a
                                href="#"
                                className="text-gray-700 hover:text-primary hover:underline"
                            >
                                Forgot Password?
                            </a>
                        </div>
                        <button
                            type="button"
                            className="w-full py-3 bg-primary hover:bg-primary/80 mt-4 text-semibold rounded text-white"
                        >
                            Login
                        </button>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-white mt-10">
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
                        </div>

                        <div className="mt-16 flex justify-end">
                            <span>Don’t have an account? <a href="#" className="text-primary">Log In</a></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}









