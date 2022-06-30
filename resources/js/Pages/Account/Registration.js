import React, { useEffect } from 'react';
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

function Registration(props) {

    const { data, setData, post, processing, errors, reset } = useForm({
        id: '',
        company_name: '',
        company_type: '',
        website: '',
        email: '',
        service: '',
        estimated_launch_date: '',
        type_of_integration: '',
        phone_number: '',
        display_name: '',
        business_manager_id: '',
        profile_picture: '',
        profile_description: '',
        oba: false,
	    api_token: '',
        callback_url: '',
        enqueued: false,
        failed: false,
        read: false,
        sent: false,
        delivered: false,
        delete: false,
        template_events: false,
        account_related_events: false,
    });

    const company_types = [
        {value: 'Sole Proprietorship', label: 'Sole Proprietorship'},
        {value: 'Partnership', label: 'Partnership'},
        {value: 'Limited Liability Company (LLC)', label: 'Limited Liability Company (LLC)'},
        {value: 'Corporation', label: 'Corporation'},
    ];

    const integrations = [
        {value: 'Website', label: 'Website'},
        {value: 'Support', label: 'Support'},
    ];

    const services = [
        {value: 'whatsapp', label: 'WhatsApp'},
        {value: 'instagram', label: 'Instagram'},
        {value: 'facebook', label: 'Facebook'},
    ];

    useEffect(() => {
        let newData = Object.assign({}, data);
        if (typeof props.account !== 'undefined') {
            newData = Object.assign({}, props.account);
        }

        if(props.events) {
            Object.entries(props.events).map(function([index, value]) {
                if(index == 'callback_url') {
                    newData[index] = value;
                }
                else if(index != 'id' && index != 'created_at' && index != 'updated_at' && index != 'account_id') {
                    newData[index] = (value == 1) ? true : false;
                }
            });
        }
        setData(newData);
    },[]);


    /**
     * Validate the form and submit
     */
    function validateAndSubmitForm() 
    {
        var pristine = new PristineJS(document.getElementById("account_registration"), defaultPristineConfig);
        let is_validated = pristine.validate(document.querySelectorAll('input[data-pristine-required], select[data-pristine-required], textarea[data-pristine-required]'));

        if(!is_validated) {
            return false;
        }
        post(route('store_account_registration'));
    }

    /**
     * Handle input change
     */ 
    function handleChange(event) {
        const name = event.target.name;
        const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
        let newState = Object.assign({}, data);
        if(event.target.type == 'file' && event.target.files) {
            newState[name] = event.target.files[0];
        }
        else {
            newState[name] = value;
        }

        setData(newState);
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
                    <input type="hidden" value={data.id} name="id" />
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
                                                <Input name='company_name' value={data.company_name} required={true} id='company_name' placeholder='Your company name' handleChange={handleChange} />
                                            </div>
                                            <InputError message={errors.company_name} />
                                        </div>

                                        <div className="form-group col-span-6 sm:col-span-4">
                                            <label htmlFor="type_of_integration" className="block text-sm font-medium text-gray-700">
                                                Service
                                            </label>
                                            <div className="mt-1">
                                                <Dropdown 
                                                    required={true} 
                                                    id="service"
                                                    name="service"
                                                    handleChange={handleChange}
                                                    options={services}
                                                    value={data.service}
                                                />
                                            </div>
                                            <InputError message={errors.service} />
                                        </div>
                                    
                                        <div className="form-group col-span-6 sm:col-span-4">
                                            <label htmlFor="company_type" className="block text-sm font-medium text-gray-700">
                                                Company type
                                            </label>
                                            <div className="mt-1">
                                                <Dropdown 
                                                    required={true} 
                                                    id="company_type"
                                                    name="company_type"
                                                    handleChange={handleChange}
                                                    options={company_types}
                                                    value={data.company_type}
                                               />
                                            </div>
                                            <InputError message={errors.company_type} />
                                        </div>

                                        <div className="form-group col-span-6 sm:col-span-4">
                                            <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                                                Company website
                                            </label>
                                            <div className="mt-1 flex rounded-md shadow-sm">
                                                <Input required={true} name='website' value={data.website} id='website' placeholder='Enter your company website' handleChange={handleChange} />
                                            </div>
                                            <InputError message={errors.website} />
                                        </div>

                                        <div className="form-group col-span-6 sm:col-span-4">
                                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                                Email (Technical point of contact)
                                            </label>
                                            <div className="mt-1 flex rounded-md shadow-sm">
                                                <Input required={true} type='email' name='email' value={data.email}  id='email' placeholder='Email'  handleChange={handleChange}/>
                                            </div>
                                            <InputError message={errors.email} />
                                        </div>

                                        <div className="form-group col-span-6 sm:col-span-4">
                                            <label htmlFor="estimated_launch_date" className="block text-sm font-medium text-gray-700">
                                                Estimated launch date
                                            </label>
                                            <div className="mt-1 flex rounded-md shadow-sm">
                                                <Input required={true} type='date' name='estimated_launch_date' value={data.estimated_launch_date} id='estimated_launch_date' placeholder='' handleChange={handleChange} />
                                            </div>
                                            <InputError message={errors.estimated_launch_date} />
                                        </div>

                                        <div className="form-group col-span-6 sm:col-span-4">
                                            <label htmlFor="type_of_integration" className="block text-sm font-medium text-gray-700">
                                                Type of integration
                                            </label>
                                            <div className="mt-1">
                                                <Dropdown 
                                                    required={true} 
                                                    id="type_of_integration"
                                                    name="type_of_integration"
                                                    handleChange={handleChange}
                                                    options={integrations}
                                                    value={data.type_of_integration}
                                                />
                                            </div>
                                            <InputError message={errors.type_of_integration} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>      

                        {data.service == 'whatsapp' ?
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
                                                <Input required={true} name='phone_number' value={data.phone_number} id='phone_number' placeholder='' handleChange={handleChange} />
                                            </div>
                                            <InputError message={errors.phone_number} />
                                        </div>

                                        <div className="form-group col-span-6 sm:col-span-4">
                                            <label htmlFor="display_name" className="block text-sm font-medium text-gray-700">
                                                Display Name
                                            </label>
                                            <div className="mt-1 flex rounded-md shadow-sm">
                                                <Input required={true} name='display_name' value={data.display_name} id='display_name' placeholder='' handleChange={handleChange} />
                                            </div>
                                            <InputError message={errors.display_name} />
                                        </div>

                                        <div className="form-group col-span-6 sm:col-span-4">
                                            <label htmlFor="business_manager_id" className="block text-sm font-medium text-gray-700">
                                                Business manager Id
                                            </label>
                                            <div className="mt-1 flex rounded-md shadow-sm">
                                                <Input required={true} name='business_manager_id' value={data.business_manager_id} id='business_manager_id' placeholder='' handleChange={handleChange} />
                                            </div>
                                            <InputError message={errors.business_manager_id} />
                                        </div>

                                        <div className="form-group col-span-6 sm:col-span-4">
                                            <label htmlFor="profile_picture" className="block text-sm font-medium text-gray-700">
                                                Profile picture
                                            </label>
                                            <div className="mt-1 flex rounded-md">
                                                {data.profile_picture ?
                                                 <FileInput accept="image/png, image/jpeg, image/jpg" name='profile_picture' id='profile_picture' handleChange={handleChange} />
                                                :<FileInput accept="image/png, image/jpeg, image/jpg"  required={true} name='profile_picture' id='profile_picture' handleChange={handleChange} />
                                                }
                                            </div>
                                            <p className="mt-2 text-sm text-gray-500">500px by 500px with 100px magin</p>
                                            <InputError message={errors.profile_picture} />
                                        </div>

                                        <div className="form-group col-span-6 sm:col-span-4">
                                            <label htmlFor="profile_description" className="block text-sm font-medium text-gray-700">
                                                Profile description
                                            </label>
                                            <div className="mt-1 flex rounded-md shadow-sm">
                                                <TextArea required={true} name='profile_description' value={data.profile_description} id='profile_description' placeholder='' handleChange={handleChange} />
                                            </div>
                                            <p className="mt-2 text-sm text-gray-500">Max 139 characters</p>
                                            <InputError message={errors.profile_description} />
                                        </div>

                                        <div className="form-group col-span-6 sm:col-span-4">
                                            <div className="flex items-start">
                                                <div className="flex items-center h-5">
                                                    <Checkbox
                                                        id="oba"
                                                        name="oba"
                                                        handleChange={handleChange}
                                                        value={data.oba}
                                                    />
                                                </div>
                                                <div className="ml-3 text-sm">
                                                    <label htmlFor="oba" className="font-medium text-gray-700">
                                                        Official business account
                                                    </label>
                                                    <p className="text-gray-500">Request for Whatsapp official business account (OBA).</p>
                                                </div>
                                                <InputError message={errors.oba} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        : ''}
                    </div>
                    <div className="flex justify-end">
                        <Link 
                            href={route('dashboard')}
                            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Cancel
                        </Link>
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
