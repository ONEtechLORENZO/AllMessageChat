import { useState } from 'react'
import { Link } from "@inertiajs/react";

import { Button } from "reactstrap";



export default function Step6(props) {
    const events = [
        { id: 'yes', title: (props.translator['Yes, I have']) },
        { id: 'no', title: (props.translator['No, I have not']) },
    ];
    const [useAPI, setAPI] = useState();

    function checkAlreadyUseWhatsapp() {
        if (useAPI) {
            if (useAPI == 'no') {
                props.setCurrentPage(2);
            } else {
                props.setCurrentPage(7);
            }
        }
    }

    return (
        <div className='p-8'>
            <div className="flex">
                <div className='p-2 w-1/2'>
                </div>
                <div className="w-1/2">
                    <div className="float-right">
                        <Link
                            href={route('dashboard')}
                            className="mt-3 hidden w-full justify-center rounded-md border border-gray-300 shadow-sm px-3 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                            Xasas
                        </Link>
                    </div>
                </div>
            </div>
            <form id="form" className="p-2">
                <div>
                    <h3> {props.translator['Link Whatsapp via WABA']}</h3>
                    <p>{props.translator['Whatsapp Business API to unlock Whatsapp superpowers.']}</p>
                    <div className='text-center '>
                        <div className='text-xl'>
                            {props.translator['Is this your first time?']}
                        </div>
                        <div className='bg-gray-100 m-1 p-4 text-start shadow-sm'>
                            <p>{props.translator['Meta, the company that manages whatsapp, allows the management of its APIs only through a few accredited business service providers (BSPs).']}</p>
                            <p>{props.translator['A telephone number can only be managed by one BSP at a time.']}</p>
                        </div>
                    </div>
                    <label className="text-base font-medium text-gray-900 text-center w-full mt-4">
                        {props.translator['Have you ever registered your number to any BSP?']}
                    </label>

                    <fieldset className="mt-4 flex flex-col items-center">
                        <div className="flex flex-col gap-3">
                            {events.map((event) => (
                                <label
                                    key={event.id}
                                    className="flex items-center gap-2 cursor-pointer"
                                >
                                    <input
                                        type="radio"
                                        name="useAPI"
                                        value={event.id}
                                        checked={useAPI === event.id}
                                        onChange={(e) => setAPI(e.target.value)}
                                        className="h-4 w-4"
                                    />
                                    <span>{event.title}</span>
                                </label>
                            ))}
                        </div>
                    </fieldset>
                </div>
                <div className='text-center mt-6'>
                    {props.translator['I am not sure']}  <span className='text-indigo-300'>  {props.translator['Contact-us']} </span>
                </div>
                <div className='text-center mt-6'>
                    {props.translator['What is a BSP?']}
                </div>
            </form>

            <div className="flex mt-6 items-center">
                <div className='flex justify-start w-2/3 items-stretch'>
                    {props.translator['Not sure? Go to']} <a className='px-2 text-blue-500' href='#'> FAQ</a>{props.translator['or Get in Contact with']} <a className='px-2 text-blue-500' href='#'> {props.translator['Customer Service']}</a>
                </div>
                <div className='w-1/3 flex justify-end items-stretch'>
                    <Button color="primary" className="mt-3 ml-3" onClick={() => checkAlreadyUseWhatsapp()}>
                        {props.translator['Next']}
                    </Button>
                </div>
            </div>
        </div>
    );
}








