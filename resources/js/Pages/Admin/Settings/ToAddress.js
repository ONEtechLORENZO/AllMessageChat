import { Fragment, useState , useEffect } from 'react'
import { Disclosure, Menu, RadioGroup, Switch, Transition } from '@headlessui/react'
import SideBar from '@/Components/Admin/SideBar'
//import OutgoingServer from '@/Components/Admin/OutgoingServer'
import { QuestionMarkCircleIcon, SearchIcon } from '@heroicons/react/solid'
import { Head, useForm, Link } from '@inertiajs/inertia-react';
import Authenticated from '@/Layouts/Authenticated';
import Input from '@/Components/Forms/Input';
import PristineJS from 'pristinejs';
import InputError from '@/Components/Forms/InputError';
import {defaultPristineConfig} from '@/Pages/Constants';

import {
  CogIcon,
  MailIcon,
} from '@heroicons/react/outline'

const subNavigation = [
  { name: 'Outgoing Server', href: route('settings') , icon: CogIcon, current: false },
  { name: 'To Address', href: route('to_mail') , icon: MailIcon, current: true },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function index(props) {
      const { data, setData, post, processing, errors, reset } = useForm({
            id: '',    
            to_name: '',
            to_email: '',
           
        });

      useEffect(() => {  
        if(props.toMailData != null && props.toMailData.id ) {
            let newData = Object.assign({}, props.toMailData);
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
        var pristine = new PristineJS(document.getElementById("create_smtp_form"), defaultPristineConfig);
        let is_validated = pristine.validate();
        console.log(is_validated);
        if(!is_validated) {
            return false;
        }

        post(route('store_toAddress_data'));
    }
  return (
          <Authenticated
            auth={props.auth}
            errors={props.errors}
          >
          <Head title="Settings" />    
    <div className="relative min-h-screen">

      <main className="max-w-7xl mx-auto pb-10 lg:py-12 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-5">
          <SideBar subNavigation={subNavigation} />
          
          <div className="space-y-6 sm:px-6 lg:px-0 lg:col-span-9">
            <section aria-labelledby="payment-details-heading">
              <form action="#" method="POST" id="create_smtp_form" className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="shadow sm:rounded-md sm:overflow-hidden">
                  <div className="bg-white py-6 px-4 sm:p-6">
                    <div>
                      <h2 id="payment-details-heading" className="text-lg leading-6 font-medium text-gray-900">
                        To mail address
                      </h2>
                     
                    </div>

                    <div className="mt-6 grid grid-cols-4 gap-6">
                      <div className="col-span-4 sm:col-span-2 form-group">
                        <label htmlFor="to_name" className="block text-sm font-medium text-gray-700">
                          To name
                        </label>
                        <div className="mt-1 flex rounded-md shadow-sm">
                        <Input name='to_name' value={data.to_name} required={true} type='text' id='to_name' placeholder='Your name' handleChange={handleChange} />
                      </div>
                        <InputError message={errors.to_name} />
                      </div>

                      <div className="col-span-4 sm:col-span-2 form-group">
                        <label htmlFor="to_email" className="block text-sm font-medium text-gray-700">
                           To Email
                        </label>
                        <div className="mt-1 flex rounded-md shadow-sm">
                        <Input name='to_email' value={data.to_email} required={true} type='email' id='to_email' placeholder='To Email' handleChange={handleChange} />
                      </div>
                        <InputError message={errors.to_email} />
                      </div>

                    </div>  
                  </div>
                  <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                    <button
                      type="button"
                      onClick={validateAndSubmitForm}
                      className="bg-gray-800 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </form>
            </section>
          </div>
        </div>
      </main>
    </div>
    </Authenticated>
  )
}
