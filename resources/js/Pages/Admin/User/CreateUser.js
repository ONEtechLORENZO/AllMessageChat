import React,{ useEffect } from 'react';
import Authenticated from '@/Layouts/Authenticated';
import Input from '@/Components/Forms/Input';
import TextArea from '@/Components/Forms/TextArea';
import FileInput from '@/Components/Forms/FileInput';
import PristineJS from 'pristinejs';
import Checkbox from '@/Components/Forms/Checkbox';
import { Head, useForm, Link } from '@inertiajs/inertia-react';
import Dropdown from '@/Components/Forms/Dropdown';
import InputError from '@/Components/Forms/InputError';
import {defaultPristineConfig} from '@/Pages/Constants';

export default function Dashboard(props) {

	    const { data, setData, post, processing, errors, reset } = useForm({
            id: '',    
            name: '',
            email: '',
            password: '',
            role: '',
            status: false,
        });

    useEffect(() => {  
        if(props.user.id) {
            let newData = Object.assign({}, props.user);
            newData['password'] = props.password;
            setData(newData);
        }   
    },[]);

	/**
     * Handle input change
     */ 
    function handleChange(event) {
    	const name = event.target.name;
        const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
        let newState = Object.assign({}, data);
        newState[name] = value;
        
        setData(newState);
    }

    /**
     * Validate the form and submit
     */
    function validateAndSubmitForm() 
    {
        var pristine = new PristineJS(document.getElementById("create_user_form"), defaultPristineConfig);
        let is_validated = pristine.validate();
        if(!is_validated) {
            return false;
        }

        post(route('store_user_data'));
    }
    const roleOptions = [
        {value: 'Admin', label: 'Admin'},
        {value: 'Customer', label: 'Customer'},
    ];

    // Cheack Admin user
    var isAdmin = false;
    if(  data.role == 'Admin' || props.currentUser.role == 'Admin' ){
        isAdmin  = true;
    }

	return(
	
		<Authenticated
            auth={props.auth}
            errors={props.errors}
            header={<div className="flex justify-between"> 
                <div> 
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight"> {data.id ? "Edit User" : "Create User"} </h2>
                </div> 
                <div>

                {data.id != '' &&
                    <button 
                        className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                        Change Password
                    </button>
                }
                
                <Link 
                    href={route('user')}
                        className="ml-3 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
					>
                    Cancel
                </Link>
                <button
                    type="button"
                    onClick={validateAndSubmitForm}
                    className='ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                	>
                    Save
                </button>

                </div> 
            </div>}
        >
	<Head title={data.id ? "Edit User" : "Create User"} User />
	<div className="bg-white overflow-hidden shadow rounded-lg">
    	<div className="px-4 py-5 sm:p-6">
    		<form action="#" method="POST" className="container mx-auto px-4 sm:px-6 lg:px-8" id="create_user_form" >
            <input type='hidden' name='id' value={data.id} />
    		<div className="form-group col-span-6 sm:col-span-4">
    			<label htmlFor="name" className="block text-sm font-medium text-gray-700">
                	 Name
                </label>
				<div className="mt-1 flex rounded-md shadow-sm">
                	<Input value={data.name} name='name' required={true} id='name' placeholder='Your name' handleChange={handleChange} />
                </div>
                <InputError message={errors.name} />
    		</div>
    		<div className="form-group col-span-6 sm:col-span-4 mt-5">
    			<label htmlFor="email" className="block text-sm font-medium text-gray-700">
                	Email
                </label>
				<div className="mt-1 flex rounded-md shadow-sm">
                	<Input name='email' value={data.email} required={true} type='email' id='email' placeholder='Your email' handleChange={handleChange} />
                </div>
                <InputError message={errors.email} />
    		</div>
            {data.id == '' &&
                    <div className="form-group col-span-6 sm:col-span-4 mt-5">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <div className="mt-1 flex rounded-md shadow-sm">
                            <Input name='password' value={(data.password)} required={true} type='password' id='password' placeholder='Your password' handleChange={handleChange} />
                        </div>
                        <InputError message={errors.password} />
                    </div>
            }

    		<div className="form-group col-span-6 sm:col-span-4 mt-5">
                <div className="flex items-start">
                    <div className="flex items-center h-5">
                        <Checkbox
                            id="status"
                            name="status"
                            value={data.status != 0 ? true : false } 
                            handleChange={handleChange}
                        />
                    </div>
                    <div className="ml-3 text-sm">
                    	<label htmlFor="status" className="font-medium text-gray-700">
                        	Active User status?
                        </label>
                    </div>
                    <InputError message={errors.oba} />
                </div>
            </div>
            { isAdmin &&
    		<div className="form-group col-span-6 sm:col-span-4 mt-5">
    			<label htmlFor="role" className="block text-sm font-medium text-gray-700">
                	Role
                </label>
				<div className="mt-1 flex rounded-md shadow-sm">
                	<Dropdown 
                        required={false} 
                        id="rold"
                        name="role"
                        handleChange={handleChange}
                        options={roleOptions}
                        value={data.role}
                        />
                </div>
    		</div>
            }
    		</form>
    	</div>


    </div>
    </Authenticated>
	);
}
