import React from 'react';
import Select from 'react-select';
import Authenticated from '@/Layouts/Authenticated';
import Input from '@/Components/Forms/Input';
import TextArea from '@/Components/Forms/TextArea';
import FileInput from '@/Components/Forms/FileInput';
import PristineJS from 'pristinejs';
import Checkbox from '@/Components/Forms/Checkbox';
import { Head, useForm, Link } from '@inertiajs/inertia-react';
import Dropdown from '@/Components/Forms/Dropdown';
import InputError from '@/Components/Forms/InputError';
import languages from '@/Pages/languages';
import categories, {defaultPristineConfig, header_templates, button_types} from '@/Pages/Constants'; 

function NewTemplate(props) {

    const { data, setData, post, processing, errors, reset } = useForm({
        template_name: '',
        category: '',
        languages: '',
        header_template: '',
    });

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
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">New Template</h2>}
        >
            <Head title="Account Registration" />

            <div className="py-12 px-24">
                <form className="space-y-6" action="#" method="POST" id="account_registration">
                    <div className="space-y-6">
                        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                            <div className="md:grid md:grid-cols-3 md:gap-6">
                                <div className="md:col-span-1">
                                    <h3 className="text-lg font-medium leading-6 text-gray-900">Template Information</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        
                                    </p>
                                </div>
                                <div className="mt-5 md:mt-0 md:col-span-2">
                                    <div className="grid grid-cols-6 gap-6">
                                        <div className="form-group col-span-6 sm:col-span-4">
                                            <label htmlFor="template_name" className="block text-sm font-medium text-gray-700">
                                                Name
                                            </label>
                                            <div className="mt-1 flex rounded-md shadow-sm">
                                                <Input name='template_name' required={true} id='template_name' placeholder='Template name' handleChange={handleChange} />
                                            </div>
                                            <InputError message={errors.template_name} />
                                        </div>

                                        <div className="form-group col-span-6 sm:col-span-4">
                                            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                                                Category
                                            </label>
                                            <div className="mt-1">
                                                <Dropdown 
                                                    required={true} 
                                                    id="category"
                                                    name="category"
                                                    handleChange={handleChange}
                                                    options={categories}
                                                    value={data.category}
                                                />
                                            </div>
                                            <InputError message={errors.category} />
                                        </div>

                                        <div className="form-group col-span-6 sm:col-span-4">
                                            <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                                                Language
                                            </label>
                                            <div className="mt-1">
                                                <Select 
                                                    options={languages} 
                                                    getOptionLabel ={(option) => option.name}
                                                    getOptionValue ={(option )=> option.code} 
                                                />
                                            </div>
                                            <InputError message={errors.language} />
                                        </div>

                                        <div className="form-group col-span-6 sm:col-span-4">
                                            <label htmlFor="template" className="block text-sm font-medium text-gray-700">
                                                Header Template
                                            </label>
                                            <div className="mt-1">
                                                <Dropdown 
                                                    required={true} 
                                                    id="template"
                                                    name="template"
                                                    handleChange={handleChange}
                                                    options={header_templates}
                                                    value={data.header_template}
                                                />
                                            </div>
                                            <InputError message={errors.header_template} />
                                        </div>

                                        {data.header_template == 'text' ?
                                        <div className="form-group col-span-6 sm:col-span-4">
                                            <label htmlFor="template" className="block text-sm font-medium text-gray-700">
                                                Text
                                            </label>
                                            <div className="mt-1">
                                                <Input name='header_text' required={data.header_template == 'text' ? true : false} id='header_text' placeholder='' handleChange={handleChange} />
                                            </div>
                                            <InputError message={errors.header_text} />
                                        </div> : ''}

                                        <div className="form-group col-span-6 sm:col-span-4">
                                            <label htmlFor="body" className="block text-sm font-medium text-gray-700">
                                                Body
                                            </label>
                                            <div className="mt-1">
                                                <TextArea id="body" name="body" required={true} handleChange={handleChange} />
                                            </div>
                                            <InputError message={errors.body} />
                                        </div>

                                        <div className="form-group col-span-6 sm:col-span-4">
                                            <label htmlFor="body_footer" className="block text-sm font-medium text-gray-700">
                                                Footer
                                            </label>
                                            <div className="mt-1">
                                                <TextArea id="body_footer" name="body_footer" handleChange={handleChange} />
                                            </div>
                                            <InputError message={errors.body_footer} />
                                        </div>

                                        <div className="form-group col-span-6 sm:col-span-4">
                                            <label htmlFor="button_type" className="block text-sm font-medium text-gray-700">
                                                Button type
                                            </label>
                                            <div className="mt-1 flex rounded-md shadow-sm">
                                                <Dropdown 
                                                    required={true} 
                                                    id="button_type"
                                                    name="button_type"
                                                    handleChange={handleChange}
                                                    options={button_types}
                                                    value={data.button_type}
                                                />
                                            </div>
                                            <InputError message={errors.button_type} />
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
                                            <InputError message={errors.phone_number} />
                                        </div>

                                        <div className="form-group col-span-6 sm:col-span-4">
                                            <label htmlFor="display_name" className="block text-sm font-medium text-gray-700">
                                                Display Name
                                            </label>
                                            <div className="mt-1 flex rounded-md shadow-sm">
                                                <Input required={true} name='display_name' id='display_name' placeholder='' handleChange={handleChange} />
                                            </div>
                                            <InputError message={errors.display_name} />
                                        </div>

                                        <div className="form-group col-span-6 sm:col-span-4">
                                            <label htmlFor="business_manager_id" className="block text-sm font-medium text-gray-700">
                                                Business manager Id
                                            </label>
                                            <div className="mt-1 flex rounded-md shadow-sm">
                                                <Input required={true} name='business_manager_id' id='business_manager_id' placeholder='' handleChange={handleChange} />
                                            </div>
                                            <InputError message={errors.business_manager_id} />
                                        </div>

                                        <div className="form-group col-span-6 sm:col-span-4">
                                            <label htmlFor="profile_picture" className="block text-sm font-medium text-gray-700">
                                                Profile picture
                                            </label>
                                            <div className="mt-1 flex rounded-md">
                                                <FileInput accept="image/png, image/jpeg, image/jpg" required={true} name='profile_picture' id='profile_picture' handleChange={handleChange} />
                                            </div>
                                            <p className="mt-2 text-sm text-gray-500">500px by 500px with 100px magin</p>
                                            <InputError message={errors.profile_picture} />
                                        </div>

                                        <div className="form-group col-span-6 sm:col-span-4">
                                            <label htmlFor="profile_description" className="block text-sm font-medium text-gray-700">
                                                Profile description
                                            </label>
                                            <div className="mt-1 flex rounded-md shadow-sm">
                                                <TextArea required={true} name='profile_description' id='profile_description' placeholder='' handleChange={handleChange} />
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

export default NewTemplate;
