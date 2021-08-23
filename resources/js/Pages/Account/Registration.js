import React, { useState } from 'react';
import { Head } from '@inertiajs/inertia-react';
import Authenticated from '@/Layouts/Authenticated';
import Input from '@/Components/Forms/Input';
import TextArea from '@/Components/Forms/TextArea';
import FileInput from '@/Components/Forms/FileInput';
import PristineJS from 'pristinejs';
import Checkbox from '@/Components/Forms/Checkbox';

const defaultConfig = {
    // class of the parent element where the error/success class is added
    classTo: 'form-group',
    errorClass: 'has-danger',
    successClass: 'has-success',
    // class of the parent element where error text element is appended
    errorTextParent: 'form-group',
    // type of element to create for the error text
    errorTextTag: 'div',
    // class of the error text element
    errorTextClass: 'text-red-500 text-xs mt-1'
};

function Registration(props) {

    const [formData, setFormData] = useState([]);

    /**
     * Validate the form and submit
     */
    function validateAndSubmitForm() 
    {
        var pristine = new PristineJS(document.getElementById("account_registration"), defaultConfig);
        let is_validated = pristine.validate(document.querySelectorAll('input[data-pristine-required], select[data-pristine-required], textarea[data-pristine-required]'));
        if(!is_validated) {
            return false;
        }

        Inertia.post('/account/registration', formData);
    }

    /**
     * Handle input change
     */ 
    function handleChange(event) {
        const name = event.target.name;
        const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
        let newState = Object.assign({}, formData);
        if(event.target.type == 'file' && event.target.files) {
            newState[name] = event.target.files[0];
        }
        else {
            newState[name] = value;
        }

        setFormData(newState);
    }

    return (
        <Authenticated
            auth={props.auth}
            errors={props.errors}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Account Registration</h2>}
        >
            <Head title="Account Registration" />

            <div className="py-12 px-24">
                <form className="space-y-6" action="#" method="POST" id="account_registration">
                    <div className="space-y-6">
                        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                            <div className="md:grid md:grid-cols-3 md:gap-6">
                                <div className="md:col-span-1">
                                    <h3 className="text-lg font-medium leading-6 text-gray-900">Company Information</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Enter your company information. We will be using this information to create your business account
                                    </p>
                                </div>
                                <div className="mt-5 md:mt-0 md:col-span-2">
                                    <div className="grid grid-cols-6 gap-6">
                                        <div className="form-group col-span-6 sm:col-span-4">
                                            <label htmlFor="company_name" className="block text-sm font-medium text-gray-700">
                                                Company Name
                                            </label>
                                            <div className="mt-1 flex rounded-md shadow-sm">
                                                <Input name='company_name' required={true} id='company_name' placeholder='Your company name' handleChange={handleChange} />
                                            </div>
                                        </div>
                                    
                                        <div className="form-group col-span-6 sm:col-span-4">
                                            <label htmlFor="company_type" className="block text-sm font-medium text-gray-700">
                                                Company type
                                            </label>
                                            <div className="mt-1">
                                                <select
                                                    required={true}
                                                    data-pristine-required={true}
                                                    id="company_type"
                                                    name="company_type"
                                                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    handleChange={handleChange}
                                                >
                                                    <option>Select company type</option>
                                                    <option>United States</option>
                                                    <option>Canada</option>
                                                    <option>Mexico</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="form-group col-span-6 sm:col-span-4">
                                            <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                                                Company website
                                            </label>
                                            <div className="mt-1 flex rounded-md shadow-sm">
                                                <Input required={true} name='website' id='website' placeholder='Enter your company website' handleChange={handleChange} />
                                            </div>
                                        </div>

                                        <div className="form-group col-span-6 sm:col-span-4">
                                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                                Email (Technical point of contact)
                                            </label>
                                            <div className="mt-1 flex rounded-md shadow-sm">
                                                <Input required={true} type='email' name='email' id='email' placeholder='Email'  handleChange={handleChange}/>
                                            </div>
                                        </div>

                                        <div className="form-group col-span-6 sm:col-span-4">
                                            <label htmlFor="estimated_launch_date" className="block text-sm font-medium text-gray-700">
                                                Estimated launch date
                                            </label>
                                            <div className="mt-1 flex rounded-md shadow-sm">
                                                <Input required={true} type='date' name='estimated_launch_date' id='estimated_launch_date' placeholder='' handleChange={handleChange} />
                                            </div>
                                        </div>

                                        <div className="form-group col-span-6 sm:col-span-4">
                                            <label htmlFor="type_of_integration" className="block text-sm font-medium text-gray-700">
                                                Type of integration
                                            </label>
                                            <div className="mt-1">
                                                <select
                                                    required={true}
                                                    data-pristine-required={true}
                                                    id="type_of_integration"
                                                    name="type_of_integration"
                                                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    handleChange={handleChange}
                                                >
                                                    <option>Select integration type</option>
                                                    <option>United States</option>
                                                    <option>Canada</option>
                                                    <option>Mexico</option>
                                                </select>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>      

                        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                            <div className="md:grid md:grid-cols-3 md:gap-6">
                                <div className="md:col-span-1">
                                    <h3 className="text-lg font-medium leading-6 text-gray-900">Whatsapp Information</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Information will be used to create your whatsapp business account
                                    </p>
                                </div>
                                <div className="mt-5 md:mt-0 md:col-span-2">
                                    <div className="grid grid-cols-6 gap-6">
                                        <div className="form-group col-span-6 sm:col-span-4">
                                            <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">
                                                Phone number
                                            </label>
                                            <div className="mt-1 flex rounded-md shadow-sm">
                                                <Input required={true} name='phone_number' id='phone_number' placeholder='' handleChange={handleChange} />
                                            </div>
                                        </div>

                                        <div className="form-group col-span-6 sm:col-span-4">
                                            <label htmlFor="display_name" className="block text-sm font-medium text-gray-700">
                                                Display Name
                                            </label>
                                            <div className="mt-1 flex rounded-md shadow-sm">
                                                <Input required={true} name='display_name' id='display_name' placeholder='' handleChange={handleChange} />
                                            </div>
                                        </div>

                                        <div className="form-group col-span-6 sm:col-span-4">
                                            <label htmlFor="profile_picture" className="block text-sm font-medium text-gray-700">
                                                Profile picture
                                            </label>
                                            <div className="mt-1 flex rounded-md">
                                                <FileInput required={true} name='profile_picture' id='profile_picture' handleChange={handleChange} />
                                            </div>
                                            <p className="mt-2 text-sm text-gray-500">500px by 500px with 100px magin</p>
                                        </div>

                                        <div className="form-group col-span-6 sm:col-span-4">
                                            <label htmlFor="profile_description" className="block text-sm font-medium text-gray-700">
                                                Profile description
                                            </label>
                                            <div className="mt-1 flex rounded-md shadow-sm">
                                                <TextArea required={true} name='profile_description' id='profile_description' placeholder='' handleChange={handleChange} />
                                            </div>
                                            <p className="mt-2 text-sm text-gray-500">Max 139 characters</p>
                                        </div>

                                        <div className="form-group col-span-6 sm:col-span-4">
                                            <div className="flex items-start">
                                                <div className="flex items-center h-5">
                                                    <Checkbox
                                                        id="oba"
                                                        name="oba"
                                                        handleChange={handleChange}
                                                    />
                                                </div>
                                                <div className="ml-3 text-sm">
                                                    <label htmlFor="oba" className="font-medium text-gray-700">
                                                        Official business account
                                                    </label>
                                                    <p className="text-gray-500">Request for Whatsapp official business account (OBA).</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="button"
                            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={validateAndSubmitForm}
                            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </Authenticated>
    );
}

export default Registration;
