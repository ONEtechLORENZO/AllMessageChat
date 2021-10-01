
import React ,{ Fragment, useState } from 'react';
import Authenticated from '@/Layouts/Authenticated';
import { Head, Link } from '@inertiajs/inertia-react';
import { Dialog, Transition } from '@headlessui/react'
import { ExclamationIcon, XIcon } from '@heroicons/react/outline'
import Input from '@/Components/Forms/Input';
import Dropdown from '@/Components/Forms/Dropdown';

export default function Destination(props) {
	const [open, setOpen] = useState(true);
	
	const contentOptions = [
        {value: 'json', label: 'Json'},
        {value: 'array', label: 'Array'},
    ];
	
	return(
	<Authenticated
        auth={props.auth}
        errors={props.errors}
        header={<div className="flex justify-between"> 
        	<div> 
	            <h2 className="font-semibold text-xl text-gray-800 leading-tight">Destination</h2>
            </div> 
        </div>}
        >
        <Head title="Destination" />

		<Transition.Root show={open} as={Fragment}>
		      <Dialog as="div" className="fixed z-10 inset-0 overflow-y-auto" onClose={setOpen}>
		        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-15 text-center sm:block sm:p-0">
		          <Transition.Child
		            as={Fragment}
		            enter="ease-out duration-300"
		            enterFrom="opacity-0"
		            enterTo="opacity-100"
		            leave="ease-in duration-200"
		            leaveFrom="opacity-100"
		            leaveTo="opacity-0"
		          >
		            <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
		          </Transition.Child>

		          {/* This element is to trick the browser into centering the modal contents. */}
		          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
		            &#8203;
		          </span>
		          <Transition.Child
		            as={Fragment}
		            enter="ease-out duration-300"
		            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
		            enterTo="opacity-100 translate-y-0 sm:scale-100"
		            leave="ease-in duration-200"
		            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
		            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
		          >
		            <div className="inline-block align-bottom bg-white rounded-2xl px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
		              <div className="hidden sm:block absolute top-0 right-0 pt-4 pr-4">
		                <button
		                  type="button"
		                  className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
		                  onClick={() => setOpen(false)}
		                >
		                  <span className="sr-only">Close</span>
		                  <XIcon className="h-6 w-6" aria-hidden="true" />
		                </button>
		              </div>
		              <div className="sm:flex sm:items-start">
		                <div className="mt-3 text-center sm:mt-0 sm:text-left">
		                  <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
		                    Edit Destination
		                  </Dialog.Title>
		                  <div className="mt-2 p-4">
		                  	<div>
		                  		<label htmlFor="name" className="ml-px pl-4 block text-sm font-medium text-gray-500">
						        	Destination
								</label>
						      	<div className="mt-1">
						      		<Input name='destination' value='' required={true} type='text' id='destination' placeholder='Your Destination' />
		                  		</div>
		                  	</div>
		                  	<p className="text-gray-500 pt-3">Specify the content type and webhook url in the settings below. Find here more information about <span className="text-blue-500">MO webhooks</span>	</p>
		                  
		                  	
		                  	<div class="mt-2">
		                  		<label htmlFor="content_type" className="ml-px pl-4 block text-sm font-medium text-gray-500">
						        	Content Type
								</label>
						      	<div className="mt-1">
						      		<Dropdown 
				                        required={false} 
				                        id="content_type"
				                        name="content_type"
				                        options={contentOptions}
				                        />
                        		</div>
		                  	</div>
		                  	<div class="mt-2">
		                  		<label htmlFor="webhook" className="ml-px pl-4 block text-sm font-medium text-blue-600">
						        	<b>Enter a webhook URL</b>
								</label>
						      	<div className="mt-1">
						      		<Input name='webhook' value='' required={true} type='text' id='webhook' placeholder='Your webhook' />
		                  		</div>
		                  	</div>
		                  </div>
		                </div>
		              </div>
		              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
		                <button
		                  type="button"
		                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-200 text-base font-medium text-blue-900 hover:bg-blue-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
		                  onClick={() => setOpen(false)}
		                >
		                  Update
		                </button>
		                <button
		                  type="button"
		                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
		                  onClick={() => setOpen(false)}
		                >
		                  Cancel
		                </button>
		              </div>
		            </div>
		          </Transition.Child>
		        </div>
		      </Dialog>
		    </Transition.Root>


        </Authenticated>
        )
}