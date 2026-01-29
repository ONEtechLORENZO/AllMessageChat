import React from "react";
import Dropdown from '@/Components/Forms/Dropdown';
import { Link } from "@inertiajs/react";

import { Button } from "reactstrap";

const serivceOption = {
    'whatsapp' : 'Whatsapp',
    'instagram' : 'Instagram',
    'facebook' : 'Facebook',
}

export default function Step1(props){

    //select the service 
    function serviceHandler(event){
        const value = event.target.value;
        if(value){
            props.setService(value);
        }
    }

    return(
        <div className='p-4'>
        <form id='form p-2'>
            <div className="flex">
                <div className='p-2'>
                    <div className='font-bold text-lg'>
                    {props.translator["Link Account"]}
                    </div>
                    <div className='pt-2 text-gray-500 text-sm'>
                    {props.translator["Connect your account to your OneMessage Workspace"]}
                    </div>
                </div>
                <div className="w-1/2 d-none"> 
                    <div className="float-right">  
                        <Link
                            href={route('dashboard')}
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-3 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                          X
                        </Link>
                    </div> 
                </div>
            </div>
            
            <div className='p-2 mt-4'>
                <div className='mx-auto w-1/2 flex flex-col justify-center'>
                    <div className='text-lg font-medium flex items-center'>{props.translator["Select platform"]}</div>
                    <div className='flex justify-start'>
                        <Dropdown 
                          id='service'
                          name='service'
                          options={serivceOption}
                          handleChange={props.formHandler}
                          emptyOption='select'
                          value={ props.service ? props.service : props.data['service']}
                          required={true}
                        />
                    </div>
                </div>
                
                {props.error &&
                    <div className='text-gray-500 pt-4 text-sm mt-1 text-center'>
                        <span className="text-red-500"> {props.error} </span>
                    </div>
                }

                {(((props.data['service'] == 'instagram' || props.data['service'] == 'facebook') || (props.data['service'] == 'whatsapp' && props.company.service_engine == 'Facebook' )) && props.socialProfiles) ?
                    <>
                        <div className='mx-auto w-1/2 flex flex-col justify-center mt-3'>
                            <div className='text-lg font-medium flex items-center'> {props.translator["Choose Linked Profile"]} </div>
                            <div className='flex justify-start'>
                                <select
                                    required={true}
                                    name="profile_list"
                                    className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                                    value={ props.data['profile_list'] ? props.data['profile_list'] : ''}
                                    id="profile_list"
                                    onChange={ props.formHandler }
                                >
                                    <option value="new"> New </option>

                                    {Object.entries(props.socialProfiles).map( ([id, account]) => {
                                        return(
                                            <option value={id}> {account.name} </option>
                                        );
                                    })}
                                </select>
                            </div>
                        </div>
                        
                        {(props.data['profile_list'] && props.data['profile_list'] != 'new') ?
                            <></>
                        :
                            <div className='text-gray-500 pt-4 text-sm mt-1 text-center'>
                                <a
                                    href={route('connect_face_book' , props.data['service'])}
                                    className='ml-3 inline-flex align-middle justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                                >
                                    <div className="ml-3 text-sm flex md:flex md:justify-between ">
                                    
                                        <img className="img" src="https://static.xx.fbcdn.net/rsrc.php/v3/yq/r/_9VQFvOk7ZC.png" alt="" width="34" height="24" />
                                        <span className=" pl-3 p-2">  {props.translator["Continue with"]} Facebook  </span>
                                    
                                    </div>
                                </a>
                            </div> 
                        }
                    </>
                :
                    <div className='text-gray-500 pt-4 text-sm mt-5'>
                        WABA {props.translator["means"]} Whatsapp Business API.<br></br>
                        {props.translator["Best for Big Business who want to connect via offical whatsapp (improve the short description)."]}
                    </div>
                }
            </div>  
        </form>

        <div className="mt-4 flex justify-between">
            <Link
             href={route('social_profile')}
             className="mt-3 btn btn-light"
            >
             {props.translator["Cancel"]}
            </Link>
            <Button color="primary" className="mt-3 ml-3" onClick={() => props.serviceHandler()}>
            {props.translator["Next"]}
            </Button>
        </div>
       </div> 
    );
}









