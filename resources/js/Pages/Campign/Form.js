import React, { useState, useEffect } from "react";
import { Link } from "@inertiajs/inertia-react";
import { CheckIcon } from '@heroicons/react/solid';
import Filter from "@/Components/Views/List/Filter2";
import Authenticated from "@/Layouts/Authenticated";

const steps = [
  { name: 'Step 1', href: '#', status: 'complete' },
  { name: 'Step 2', href: '#', status: 'current' },
  { name: 'Step 3', href: '#', status: 'upcoming' },
  { name: 'Step 4', href: '#', status: 'upcoming' },
  { name: 'Step 5', href: '#', status: 'upcoming' },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Campign(props) {
  const [openTab, setOpenTab] = useState(1);

  return (
    <Authenticated
      auth={props.auth}
      errors={props.errors}
      current_page = {props.current_page}
    >
     <div className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200">
      <div className="px-4 py-5 sm:px-6">
        <nav aria-label="Progress">
        <ol role="list" className="flex items-center">
          {steps.map((step, stepIdx) => ( 
            <li key={step.name} className={classNames(stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : '', 'relative')}>
              {step.status === 'complete' ? (
                <>
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="h-0.5 w-full bg-indigo-600" />
                  </div>
                  <a
                    href="#"
                    className="relative w-8 h-8 flex items-center justify-center bg-indigo-600 rounded-full hover:bg-indigo-900"
                  >
                    <CheckIcon className="w-5 h-5 text-white" aria-hidden="true" />
                    <span className="sr-only">{step.name}</span>
                  </a>
                </>
              ) : step.status === 'current' ? (
                <>
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="h-0.5 w-full bg-gray-200" />
                  </div>
                  <a
                    href="#"
                    className="relative w-8 h-8 flex items-center justify-center bg-white border-2 border-indigo-600 rounded-full"
                    aria-current="step"
                  >
                    <span className="h-2.5 w-2.5 bg-indigo-600 rounded-full" aria-hidden="true" />
                    <span className="sr-only">{step.name}</span>
        
                  </a>
                </>
              ) : (
                <>
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="h-0.5 w-full bg-gray-200" />
                  </div>
                  <a
                    href="#"
                    className="group relative w-8 h-8 flex items-center justify-center bg-white border-2 border-gray-300 rounded-full hover:border-gray-400"
                  >
                    <span
                      className="h-2.5 w-2.5 bg-transparent rounded-full group-hover:bg-gray-300"
                      aria-hidden="true"
                    />
                    <span className="sr-only">{step.name}</span>
                  </a>
                </>
              )}
            </li>
          ))}
          </ol>
        </nav>
      </div>
      <div className="px-4 py-5 sm:p-6">
      <div className="flex flex-wrap">
        <div className="w-full">
          <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 rounded">
            <div className="px-4 py-5 flex-auto">
            <div className="tab-content tab-space">
              <div
                  className={
                      openTab === 1 ? "block" : "hidden"
                  }
                  id="link1"
              >
        <div className="overflow-hidden shadow rounded-lg divide-y divide-gray-200 w-1/2 content-center m-20 -mt-8">
          <div className="px-4 py-5 sm:px-6 bg-green-200">
              Information
          </div>
        <div className="px-4 py-5 sm:p-6">
         <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Name
            </label>
            <div className="mt-1">
                <input
                  type="text"
                  name="campign_name"
                  id="name"
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder=""
                />
            </div>
         </div>
         <div>
          <div className="pt-5">
            <div className="flex justify-end">
                <Link
                    href={route("listImport")}
                    className="bg-indigo-600 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Add
                </Link>
             </div>
            </div>
          </div>
        </div>
      </div>
              </div>
              <div
                  className={
                      openTab === 2 ? "block" : "hidden"
                  }
                  id="link2"
              >
              step 2 
             
              <div className="bg-gray-50 overflow-hidden rounded-lg justify-center items-center ">
                <div className="px-4 py-5 sm:p-6">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                    <Filter
                      translator={props.translator}
                      filter={props.filter}
                      module={'Contact'}
                    />
                    </div>
                    <div className="bg-gray-50 px-4 py-4 sm:px-6">
                      Contact
                    </div>
                  </div>
                </div>
              </div>
          
              </div>
              <div
                  className={
                      openTab === 3 ? "block" : "hidden"
                  }
                  id="link2"
              >
              step 3 
              </div>
              <div
                  className={
                      openTab === 4 ? "block" : "hidden"
                  }
                  id="link2"
              >
              step 4 
              </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
      </div>
    </div>  
      </Authenticated>
  )
}


