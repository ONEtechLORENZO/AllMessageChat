import React from 'react';
import Select from 'react-select';
import Authenticated from '@/Layouts/Authenticated';
import { Head, Link } from '@inertiajs/inertia-react';
import languages from '@/Pages/languages';

export default function Detail(props) {

    const fieldInfo = {
        'display_name': {'label': 'Display name'},
        'company_name': {'label': 'Company name'},
        'company_type': {'label': 'Company type'},
        'website': {'label': 'Website'},
        'email': {'label': 'Email'},
        'estimated_launch_date': {'label': 'Estimated launch date'},
        'type_of_integration': {'label': 'Type of integration'},
        'phone_number': {'label': 'Phone number'},
        'business_manager_id': {'label': 'Business manager ID'},
        'profile_picture': {'label': 'Profile picture', 'type': 'image'},
        'profile_description': {'label': 'Profile description'},
        'status': {'label': 'Status'},
    };

    return (
        <Authenticated
            auth={props.auth}
            errors={props.errors}
            header={<div className="flex justify-between"> 
                <div> 
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">Profile Info</h2>
                </div> 
            </div>}
        >
            <Head title="Profile Info" />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        <div className="px-4 py-5 sm:px-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">Profile Information</h3>
                            <p className="mt-1 max-w-2xl text-sm text-gray-500">This is what your customers can see on their phone when they contact you via WhatsApp</p>
                        </div>
                        <div className="border-t border-gray-200">
                            <dl>
                                {Object.keys(fieldInfo).map((key, index) => {
                                    let bg_color = 'bg-gray-50';
                                    if(index % 2 == 0) {
                                        bg_color = 'bg-white';
                                    }

                                    return (
                                        <div key={key} className={`${bg_color} px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6`}>
                                            <dt className="text-sm font-medium text-gray-500">{fieldInfo[key]['label']}</dt>
                                            {fieldInfo[key]['type'] == 'image' ? 
                                                <img src={`/image/profile/${props['account']['id']}`} alt="Profile picture" className='h-64 w-64' />
                                            : 
                                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{props['account'][key]}</dd>
                                            }
                                        </div>
                                    );
                                })}
                            </dl>
                        </div>
                    </div>

                    <div className="pb-5 pt-5">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Languages</h3>
                    </div>
                    <div className="bg-white shadow rounded-md">
                        <p className="p-5">
                            In this section you can select the languages that you would like to use for WhatsApp. You can apply these languages for your WhatsApp messages and templates. Click on the box to select and add a new language.
                        </p>
                        <div className='pb-5 pl-5 pr-5'>
                            <Select 
                                options={languages} 
                                isMulti
                                getOptionLabel ={(option) => option.name}
                                getOptionValue ={(option )=> option.code} 
                            />
                        </div>
                    </div>
                    <div className="pb-5 pt-5">
                        <div className="flex justify-between">
                            <div>
                                <h3 className="text-lg leading-6 font-medium text-gray-900 mt-3">Templates</h3>
                            </div>
                            <div>
                                <Link href={route('new_template')} className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                    Add template
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white shadow overflow-hidden rounded-md">
                        <ul role="list" className="divide-y divide-gray-200">

                        </ul>
                        {!props.templates || props.templates.length == 0 ? 
                            <div className="text-center py-12">
                                <svg
                                    className="mx-auto h-12 w-12 text-gray-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    aria-hidden="true"
                                >
                                    <path
                                        vectorEffect="non-scaling-stroke"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                                    />
                                </svg>
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No templates found</h3>
                                    <p className="mt-1 text-sm text-gray-500">Get started by creating a new template.</p>
                                    <div className="mt-6">
                                        <Link href={route('new_template')} className="underline text-sm text-indigo-600 hover:text-indigo-900">
                                            Click here to create new template
                                        </Link>
                                    </div>
                              </div>
                            : ''}
                    </div>
                </div>
            </div>
        </Authenticated>
    );
}