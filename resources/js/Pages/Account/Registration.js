import React, { useEffect,useState } from 'react';
import Authenticated from '@/Layouts/Authenticated';
import Input from '@/Components/Forms/Input';
import PristineJS from 'pristinejs';
import { Head, useForm, Link } from '@inertiajs/inertia-react';
import Dropdown from '@/Components/Forms/Dropdown';
import InputError from '@/Components/Forms/InputError';
import {defaultPristineConfig} from '@/Pages/Constants';

function Registration(props) {

    const { data, setData, post, processing, errors,register, reset } = useForm({
        id: '',
        company_name: '',
        company_type: '',
        website: '',
        email: '',
        service: '',
        estimated_launch_date: '',
        type_of_integration: '',
        phone_number: '',
      //  src_name: '',
        display_name: '',
        business_manager_id: '',
        profile_picture: '',
        profile_description: '',
        api_partner_name:'',
        api_partner: false,
        terms_condition: false,
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

    const company_types = {
        'Sole Proprietorship': (props.translator['Sole Proprietorship']),
        'Partnership': (props.translator['Partnership']),
        'Limited Liability Company (LLC)': (props.translator['Limited Liability Company (LLC)']),
        'Corporation': (props.translator['Corporation'])
     }

    const integrations = {
         'Website': (props.translator['Website']),
        'Support':(props.translator['Support']),
    };

    const services = {
         'whatsapp': 'WhatsApp',
         'instagram': 'Instagram',
         'facebook': 'Facebook',
        };
    
    const service_engine = {
        'gupshup': 'GupShup',
        'facebook': 'Facebook'
    }
    
    const statusOptions = {
        New: 'New', Draft: 'Draft', Active: 'Active', Inactive: 'Inactive'
    }

    const [checked, setChecked] = useState(false);  
      
  
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
        
        // if(!data.id){
        //     if((document.getElementById("terms_condition").checked)==false)
        //     {                          
        //     notie.alert({type: 'warning', text: 'Please read and agree to our terms and conditions',position:'top'});
        //     }
        // }

        var pristine = new PristineJS(document.getElementById("account_registration"), defaultPristineConfig);
        let is_validated = pristine.validate(document.querySelectorAll('input[data-pristine-required="true"], select[data-pristine-required="true"], textarea[data-pristine-required="true"]'));

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
        } else {
            newState[name] = value;
        }
        if(name == 'fb_phone_number_id') {           
            newState['fb_page_name'] = props.pages[value];
        }
        if(name == 'fb_insta_app_id') {
            newState['insta_user_name'] = props.insta_accounts[data.fb_phone_number_id][value];
        }
        if(name == 'business_manager_id' && value && props.whatsapp_account_id[value]) {
            newState['fb_business_name'] =  (value)? props.whatsapp_account_id[value]['name'] : '';
        } 
        if(name == 'fb_phone_number_id' && data.business_manager_id && props.whatsapp_account_id[data.business_manager_id]) {
            newState['fb_waba_name'] = props.whatsapp_account_id[data.business_manager_id]['whatsapp_account'][value]['name'];
            newState['fb_whatsapp_account_id'] = props.whatsapp_account_id[data.business_manager_id]['whatsapp_account'][value]['waba_id'];
        }
        
        setData(newState);
    }

    return (
        <Authenticated
            auth={props.auth}
            errors={props.errors}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    {props.translator["Account Registration"]}
                </h2>
            }
        >
            <Head title={props.translator["Account Registration"]} />
            <div className="py-12 px-24">
                <form className="space-y-6" action="#" method="POST" id="account_registration" >
                    <input type="hidden" value={data.id} name="id" />
                    <div className="space-y-6">
                        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                            <div className="md:grid md:grid-cols-3 md:gap-6">
                                <div className="md:col-span-1">
                                    <h3 className="text-lg font-medium leading-6 text-gray-900">
                                        { props.translator["Account Information"]}
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        {props.translator["Enter your company information. We will be using this information to create your business account"]}
                                    </p>
                                </div>
                                <div className="mt-5 md:mt-0 md:col-span-2">
                                    <div className="grid grid-cols-6 gap-6">
                                        <div className="form-group col-span-6 sm:col-span-4">
                                            <label htmlFor="company_name" className="block text-sm font-medium text-gray-700" >
                                                {props.translator["Name"]} 
                                                <span className="text-sm text-red-700 mx-1"> * </span>
                                            </label>
                                            <div className="mt-1 flex rounded-md shadow-sm">
                                                <Input
                                                    name="company_name"
                                                    value={data.company_name}
                                                    required={true}
                                                    id="company_name"
                                                    placeholder={ props.translator["Enter your Account name"]}
                                                    handleChange={handleChange}
                                                />
                                            </div>
                                            <InputError message={errors.company_name} />
                                        </div>

                                        {props.auth.user.role == 'admin' &&
                                            <>
                                                {/* <div className="form-group col-span-6 sm:col-span-4">
                                                    <label htmlFor="service_engine" className="block text-sm font-medium text-gray-700" >
                                                        Service Engine
                                                        <span className="text-sm text-red-700 mx-1"> * </span>
                                                    </label>
                                                    <div className="mt-1">
                                                        <Dropdown
                                                            required={true}
                                                            id="service_engine"
                                                            name="service_engine"
                                                            handleChange={handleChange}
                                                            options={service_engine}
                                                            value={(data.service_engine) ? data.service_engine : 'gupshup'}
                                                        />
                                                    </div>
                                                    <InputError message={errors.service_engine} />
                                                </div> 
                                                <div className="form-group col-span-6 sm:col-span-4">
                                                    <label htmlFor="status" className="block text-sm font-medium text-gray-700" >
                                                        Status
                                                    </label>
                                                    <div className="mt-1">
                                                        <Dropdown
                                                            required={true}
                                                            id="status"
                                                            name="status"
                                                            handleChange={handleChange}
                                                            options={statusOptions}
                                                            value={(data.status) ? data.status : 'New'}

                                                        />
                                                    </div>
                                                    <InputError message={errors.status} />
                                                </div> */}
                                            </>
                                        }
                                        <div className="form-group col-span-6 sm:col-span-4">
                                            <label htmlFor="services" className="block text-sm font-medium text-gray-700" >
                                                {props.translator["Service"]}
                                                <span className="text-sm text-red-700 mx-1"> * </span>
                                            </label>
                                            <div className="mt-1">
                                                <Dropdown
                                                    required={true}
                                                    id="service"
                                                    name="service"
                                                    handleChange={handleChange}
                                                    options={services}
                                                    value={data.service}
                                                    readOnly={'disabled'}
                                                />
                                            </div>
                                            <InputError message={errors.service} />
                                        </div>
                                        
                                    </div>
                                </div>
                            </div>
                        </div>

                        {data.service == "whatsapp" ? (
                            <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                                <div className="md:grid md:grid-cols-3 md:gap-6">
                                    <div className="md:col-span-1">
                                        <h3 className="text-lg font-medium leading-6 text-gray-900">
                                            { props.translator["Whatsapp Information"]}
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            { props.translator[ "Information will be used to create your whatsapp business account"]}
                                        </p>
                                    </div>
                                    <div className="mt-5 md:mt-0 md:col-span-2">
                                        <div className="grid grid-cols-6 gap-6">
                                          
                                            {(props.company.service_engine == 'Facebook' && data.service_engine == 'facebook')?
                                                <>
                                                    <div className="form-group col-span-6 sm:col-span-4">
                                                        <label htmlFor="business_manager_id" className="block text-sm font-medium text-gray-700" >
                                                            Business Manager 
                                                        </label>
                                                        <div className="mt-1 flex rounded-md shadow-sm">
                                                            <select
                                                                required={true}
                                                                name="business_manager_id"
                                                                className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                                                                value={data.business_manager_id}
                                                                id="business_manager_id"
                                                                onChange={ handleChange }
                                                            >
                                                                <option value=""> Select </option>
                                                              
                                                                {Object.entries(props.whatsapp_account_id).map( ([id, account]) => {
                                                                    return(
                                                                        <option value={id}> {account.name} </option>
                                                                    );
                                                                })}
                                                            </select>
                                                        </div>
                                                        <InputError message={errors.business_manager_id} />
                                                    </div>
                                                    {data.business_manager_id &&
                                                       
                                                        <div className="form-group col-span-6 sm:col-span-4">
                                                            <label htmlFor="fb_phone_number_id" className="block text-sm font-medium text-gray-700" >
                                                                Whatsapp Account
                                                            </label>

                                                            <div className="mt-1 flex rounded-md shadow-sm">
                                                                
                                                                <select
                                                                    required={true}
                                                                    name="fb_phone_number_id"
                                                                    className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                                                                    value={data.fb_phone_number_id}
                                                                    id="fb_phone_number_id"
                                                                    onChange={ handleChange }
                                                                >
                                                                    <option value=""> Select </option>
                                                                
                                                                    {Object.entries(props.whatsapp_account_id[data.business_manager_id]['whatsapp_account']).map( ([id, account]) => {
                                                                        return(
                                                                            <option value={id}> {account.name} </option>
                                                                        );
                                                                    })}
                                                                </select>
                                                            </div>
                                                            <InputError message={errors.fb_phone_number_id} />
                                                        </div>
                                                    }
                                                </>
                                            :
                                                <>
                                                    <div className="form-group col-span-6 sm:col-span-4">
                                                        <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700" >
                                                        { props.translator["Display Name"]}
                                                        </label>
                                                        <div className="mt-1 flex rounded-md shadow-sm">
                                                            <Input
                                                                required={true}
                                                                name="display_name"
                                                                value={data.display_name}
                                                                id="display_name"
                                                                placeholder=""
                                                                handleChange={ handleChange }
                                                            />
                                                        </div>
                                                        <InputError message={errors.display_name} />
                                                    </div>
                                                    <div className="form-group col-span-6 sm:col-span-4">
                                                        <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700" >
                                                            { props.translator["Phone number"]}
                                                        </label>
                                                        <div className="mt-1 flex rounded-md shadow-sm">
                                                            <Input
                                                                required={true}
                                                                name="phone_number"
                                                                value={data.phone_number}
                                                                id="phone_number"
                                                                placeholder=""
                                                                handleChange={handleChange}
                                                            />
                                                        </div>
                                                        <InputError message={errors.phone_number} />
                                                    </div>

                                                    <div className="form-group col-span-6 sm:col-span-4">
                                                        <div className="flex items-start">
                                                            <div className="flex items-center h-5">
                                                                <input
                                                                    type="checkbox"
                                                                    id="api_partner"
                                                                    name="api_partner"
                                                                    checked={ data.api_partner }
                                                                    onChange={handleChange}
                                                                />
                                                                <div className="ml-3 text-sm">
                                                                    <label htmlFor="api_partner" className="font-medium text-gray-700" >
                                                                    { props.translator["Api partner?"]}
                                                                    </label>
                                                                </div>
                                                            </div>
                                                            <InputError message={errors.api_partner} />
                                                        </div>
                                                    </div>
                                                    {data.api_partner &&
                                                        <div className="form-group col-span-6 sm:col-span-4">
                                                            <label htmlFor="api_partner_name" className="block text-sm font-medium text-gray-700" >
                                                            { props.translator["API partner Name"]}
                                                            </label>
                                                            <div className="mt-1 flex rounded-md shadow-sm">
                                                                <Input
                                                                    required={true}
                                                                    name="api_partner_name"
                                                                    value={ data.api_partner_name }
                                                                    id="api_partner_name"
                                                                    placeholder=""
                                                                    handleChange={ handleChange }
                                                                />
                                                            </div>
                                                            <InputError
                                                                message={errors.api_partner_name}
                                                            />
                                                        </div>
                                                    }
                                                    <div className="form-group col-span-6 sm:col-span-4">
                                                        <label htmlFor="business_manager_id" className="block text-sm font-medium text-gray-700" >
                                                            Facebook BM ID
                                                        </label>
                                                        <div className="mt-1 flex rounded-md shadow-sm">
                                                            <Input
                                                                name="business_manager_id"
                                                                value={ data.business_manager_id }
                                                                id="business_manager_id"
                                                                placeholder=""
                                                                handleChange={ handleChange }
                                                            />
                                                        </div>
                                                        <InputError
                                                            message={errors.business_manager_id}
                                                        />
                                                    </div>
                                                </>
                                            }
                                            
                                            {/* <div className="form-group col-span-6 sm:col-span-4">
                                                <label htmlFor="src_name" className="block text-sm font-medium text-gray-700" >
                                                    {props.translator["Source Name"]}
                                                </label>
                                                <div className="mt-1 flex rounded-md shadow-sm">
                                                    <Input
                                                        required={true}
                                                        name="src_name"
                                                        value={data.src_name}
                                                        id="src_name"
                                                        placeholder=""
                                                        handleChange={handleChange}
                                                    />
                                                </div>
                                                <InputError message={errors.src_name} />
                                            </div> */}

                                            {/* 
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
                                            */}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                            {(data.service == 'instagram' || data.service == 'facebook')?
                                <>
                                  <div className='className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6"'>
                                    <div className="md:grid md:grid-cols-3 md:gap-6">
                                      <div className="md:col-span-1">
                                          <h3 className="text-lg font-medium leading-6 text-gray-900">
                                              { props.translator["Instagram Information"]}
                                          </h3>
                                          <p className="mt-1 text-sm text-gray-500">
                                              { props.translator[ "Information will be used to create your instagram business account"]}
                                          </p>
                                      </div>
                                      <div className="mt-5 md:mt-0 md:col-span-2">
                                          <div className="grid grid-cols-6 gap-6"></div>
                                          <div className="form-group col-span-6 sm:col-span-4">
                                              <label htmlFor="fb_phone_number_id" className="block text-sm font-medium text-gray-700" >
                                                Page Name
                                              </label>

                                              <div className="mt-1 flex rounded-md shadow-sm">
                                                  <Dropdown
                                                      required={true}
                                                      id="fb_phone_number_id"
                                                      name="fb_phone_number_id"
                                                      handleChange={handleChange}
                                                      options={props.pages}
                                                      value={data.fb_phone_number_id}
                                                  />
                                              </div>
                                              <InputError message={errors.fb_phone_number_id} />
                                          </div>

                                            {(data.fb_phone_number_id && data.service == 'instagram' ) &&
                                            <div className='mt-5'>
                                                    <div className="grid grid-cols-6 gap-6"></div>
                                                    <div className="form-group col-span-6 sm:col-span-4">
                                                        <label htmlFor="fb_insta_app_id" className="block text-sm font-medium text-gray-700" >
                                                            Instagram account
                                                        </label>

                                                        <div className="mt-1 flex rounded-md shadow-sm">
                                                            <Dropdown
                                                                required={true}
                                                                id="fb_insta_app_id"
                                                                name="fb_insta_app_id"
                                                                handleChange={handleChange}
                                                                options={props.insta_accounts[data.fb_phone_number_id]}
                                                                value={data.fb_insta_app_id}
                                                            />
                                                        </div>
                                                        <InputError message={errors.fb_insta_app_id} />
                                                    </div>
                                                </div>
                                            }
                                       </div>
                                    </div>
                                  </div>
                                </>
                            : "" }
                            </>
                        )}
                        {/* {(data.service_engine == 'facebook' && props.auth.user.role == 'admin' && data.service != 'instagram' ) &&
                            <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                                <div className="md:grid md:grid-cols-3 md:gap-6">
                                    <div className="md:col-span-1">
                                        <h3 className="text-lg font-medium leading-6 text-gray-900">
                                            Facebook Information
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Information will be used to create your facebook business account
                                        </p>
                                    </div>
                                    <div className="mt-5 md:mt-0 md:col-span-2">
                                        <div className="grid grid-cols-6 gap-6">

                                                <div className="form-group col-span-6 sm:col-span-4">
                                                    <label htmlFor="service_token" className="block text-sm font-medium text-gray-700" >
                                                        Service token
                                                        <span className="text-sm text-red-700 mx-1"> * </span>
                                                    </label>
                                                    <div className="mt-1">
                                                        <Input
                                                            required={true}
                                                            id="service_token"
                                                            name="service_token"
                                                            handleChange={handleChange}
                                                            value={data.service_token}
                                                        />
                                                    </div>
                                                    <InputError message={errors.service_token} />
                                                </div>
                                                <div className="form-group col-span-6 sm:col-span-4">
                                                    <label htmlFor="fb_phone_number_id" className="block text-sm font-medium text-gray-700" >
                                                        Facebook phone number ID
                                                        <span className="text-sm text-red-700 mx-1"> * </span>
                                                    </label>
                                                    <div className="mt-1">
                                                        <Input
                                                            required={true}
                                                            id="fb_phone_number_id"
                                                            name="fb_phone_number_id"
                                                            handleChange={handleChange}
                                                            value={data.fb_phone_number_id}
                                                        />
                                                    </div>
                                                    <InputError message={errors.fb_phone_number_id} />
                                                </div>
                                                <div className="form-group col-span-6 sm:col-span-4">
                                                    <label htmlFor="fb_whatsapp_account_id" className="block text-sm font-medium text-gray-700" >
                                                        Facebook whatsapp account ID
                                                        <span className="text-sm text-red-700 mx-1"> * </span>
                                                    </label>
                                                    <div className="mt-1">
                                                        <Input
                                                            required={true}
                                                            id="fb_whatsapp_account_id"
                                                            name="fb_whatsapp_account_id"
                                                            handleChange={handleChange}
                                                            value={data.fb_whatsapp_account_id}
                                                        />
                                                    </div>
                                                    <InputError message={errors.fb_whatsapp_account_id} />
                                                </div>
                                                
                                        </div>
                                    </div>
                                </div>
                            </div>
                        } */}

                        {/*                        
                        {( ( !data.service_engine || data.service_engine == 'gupshup') && props.auth.user.role == 'admin' ) &&
                            <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                                <div className="md:grid md:grid-cols-3 md:gap-6">
                                    <div className="md:col-span-1">
                                        <h3 className="text-lg font-medium leading-6 text-gray-900">
                                            API Information
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Information will be used to create your whatsapp account
                                        </p>
                                    </div>
                                    <div className="mt-5 md:mt-0 md:col-span-2">
                                        <div className="grid grid-cols-6 gap-6">

                                                <div className="form-group col-span-6 sm:col-span-4">
                                                    <label htmlFor="service_token" className="block text-sm font-medium text-gray-700" >
                                                        Source Name
                                                        <span className="text-sm text-red-700 mx-1"> * </span>
                                                    </label>
                                                    <div className="mt-1">
                                                        <Input
                                                            required={true}
                                                            id="src_name"
                                                            name="src_name"
                                                            handleChange={handleChange}
                                                            value={data.src_name}
                                                        />
                                                    </div>
                                                    <InputError message={errors.src_name} />
                                                </div>
                                                
                                                <div className="form-group col-span-6 sm:col-span-4">
                                                    <label htmlFor="fb_whatsapp_account_id" className="block text-sm font-medium text-gray-700" >
                                                        Whatsapp account ID (WABA)
                                                        <span className="text-sm text-red-700 mx-1"> * </span>
                                                    </label>
                                                    <div className="mt-1">
                                                        <Input
                                                            required={true}
                                                            id="fb_whatsapp_account_id"
                                                            name="fb_whatsapp_account_id"
                                                            handleChange={handleChange}
                                                            value={data.fb_whatsapp_account_id}
                                                        />
                                                    </div>
                                                    <InputError message={errors.fb_whatsapp_account_id} />
                                                </div>
                                                
                                        </div>
                                    </div>
                                </div>
                            </div>
                        }
                        */}

                        
                    </div>
                    { !data.id && 
                        <div className="form-group col-span-6 sm:col-span-4">
                            <div className="flex items-start">
                                <div className="flex items-center h-5">
                                    
                                    <input
                                        type="checkbox"
                                        id="terms_condition"
                                        name="terms_condition"
                                        data-pristine-required={true}
                                        checked={ data.terms_condition }
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor="terms_condition" title="Click here to read it" className="font-medium text-gray-700" >
                                        <span> 
                                        { props.translator["Do you agree with our"]} 
                                            <a href="http://www.google.com" target="_blank" className='text-indigo-600 mx-1'>
                                            { props.translator["terms and conditions?"]}
                                            </a>
                                        </span>
                                    </label>
                                </div>

                                <InputError
                                    message={errors.terms_condition}
                                />
                            </div>
                        </div>
                    }
                    
                    <div className="flex justify-end">
                        <Link href={route("social_profile")} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" >
                            {props.translator["Cancel"]}
                        </Link>

                        <button
                            type="button"
                            id="save"
                            title=""
                            onClick={validateAndSubmitForm}
                            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            {props.translator["Save"]}
                        </button>
                    </div>
                </form>
            </div>
        </Authenticated>
    );
}

export default Registration;
