import {useState} from 'react'
import { Link } from "@inertiajs/inertia-react";

const events = [
    { id: 'yes', title: 'Yes' },
    { id: 'no', title: 'No' },
];

export default function Step6(props){

    const [useAPI, setAPI]  = useState();

    function checkAlreadyUseWhatsapp() {
        if(useAPI) {
            if(useAPI == 'no'){
                props.setCurrentPage(2);
            }else{
                props.setCurrentPage(7);
            }
        }
    }

    return(
        <div className='p-8'>
            <div className="flex">
                <div className='p-2 w-1/2'>
                </div>
                <div className="w-1/2"> 
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
            <form id='form p-2'>
                <div>
                    <label className="text-base font-medium text-gray-900">
                        Do you already use WhatsApp Business API via a BSP or via Cloud API on this number? 
                    </label>

                    <fieldset className="mt-4">
                        <div className="space-y-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-10">
                        {events.map((event) => (
                            <div key={event.id} className="flex items-center">
                            <input
                                id={event.id}
                                name="notification-method"
                                type="radio"
                                className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                defaultChecked={useAPI == event.id ? true : false}
                                onClick={() => setAPI(event.id)}
                            />
                            <label htmlFor={event.id} className="ml-3 block text-sm font-medium text-gray-700">
                                {event.title}
                            </label>
                            </div>
                        ))}
                        </div>
                    </fieldset>
                </div>
            </form>

            <div className="bg-gray-50 py-3 flex">
            <div className='flex justify-start w-2/3'>
                Not sure? Go to <a className='px-2 text-blue-500' href='#'> FAQ</a>or Get in Contact with <a className='px-2 text-blue-500' href='#'> Customer Service</a>
            </div>
            <div className='w-1/3 flex justify-end'>
                <button
                    type="button"
                    className="w-full flex justify-end rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => checkAlreadyUseWhatsapp()}
                >
                    Next
                </button>
            </div>
            </div>
        </div>
    );
}