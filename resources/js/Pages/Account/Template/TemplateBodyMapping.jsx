import { Fragment, useEffect, useRef, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import Axios from 'axios'
import notie from 'notie';
import nProgress from 'nprogress';

export default function TemplateBodyMapping (props) {

    const [open, setOpen] = useState(true)
    const cancelButtonRef = useRef(null)

    useEffect(() => {
        if(props.data && props.data.body) {
           props.addSampleValueBox(props.data.body);
        }
    },[]);

    useEffect(() => {},[props]);

    function tmpBodyFieldMapping() {

        if(props.data.body && (props.data.body).trim() && Object.keys(props.sampleValues).length) {
            nProgress.start(0.5);
            nProgress.inc(0.2);

            let url = route('tmp_body_mapping', {'template_id' : props.template_id});

            Axios.post(url, {'sample_value' : props.sampleValues, 'language' : props.language}).then((response) => {
                if(response.data.status !== false) {
                    notie.alert({type: 'success', text: response.data.message, time: 5});
                } else {
                    notie.alert({type: 'error', text: response.data.message, time: 5});
                }
                props.setTemplateMapping(false);
                nProgress.done(true);
            });
        } else  {
            notie.alert({type: 'warning', text: 'Please fill your body content first.', time: 5});
        }
    }

    return(
        <Transition.Root show={open} as={Fragment}>
            <Dialog as="div" className="relative z-10" initialFocus={cancelButtonRef} onClose={() => {}} >
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                </Transition.Child>

                <div className="fixed z-10 inset-0 overflow-y-auto">
                    <div className="flex items-end sm:items-center justify-center min-h-full p-5 text-center sm:p-0">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-xl sm:w-full p-1">
                                <div className="bg-gray-50 px-4 pb-2 sm:p-3 sm:pb-2">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mt-3 text-center sm:mt-0 sm:text-left">
                                            <Dialog.Title as="h3" className="text-lg leading-6 font-semibold text-gray-900 flex">
                                                Sample value
                                            </Dialog.Title>
                                        </div>
                                    </div>
                                </div>

                                <form id='form'>
                                    <div className='px-4 py-2 space-y-4'>
                                        <div className='form-group' >
                                        {props.sampleValues && Object.entries(props.sampleValues).length ?
                                            <div className="form-group col-span-6 sm:col-span-4">
                                                <div className="mt-1">
                                                    {Object.entries(props.sampleValues).map(([key, value]) => {
                                                        var label = "{{"+ key +"}}";
                                                        return(
                                                            <div className='flex'>
                                                                <label className="block w-1/4 mt-2 mr-2 text-sm font-medium text-gray-700"> {label} </label>
                                                                
                                                                <select
                                                                    name="module_field"
                                                                    fieldIndex={key}
                                                                    id="module_field"
                                                                    value={value}
                                                                    onChange={ (e) => props.sampleValueHandler(e)}
                                                                    className='mt-1 block w-3/4 py-2 px-3 bg-[#9BFFF2] border-0 rounded-sm shadow-sm focus:outline-none focus:ring-[#9BFFF2] focus:border-[#9BFFF2] sm:text-sm'
                                                                >
                                                                    <option value=""> Select field</option>
                                                                    {Object.entries(props.fields).map(([index, field]) => 
                                                                        <option map_index={key} value={"{{"+ index +"}}"} > {field} </option>
                                                                    )}
                                                                </select>
                                                                <div className="flex items-center justify-between ml-5 w-3/4">
                                                                <input
                                                                    className="focus:ring-[#9BFFF2] focus:border-[#9BFFF2] bg-[#F6FFFD] flex-1 block w-full rounded-sm sm:text-sm border border-[#67e8f9]"
                                                                    type="text"
                                                                    name={'field_value'}
                                                                    fieldIndex={key}
                                                                    onChange={ (e) => props.sampleValueHandler(e)}
                                                                    value={value}
                                                                />
                                                                </div> 
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        :
                                        <div className="rounded-md bg-blue-50 p-4">
                                            <div className="ml-3 flex-1 md:flex md:justify-between">
                                                <p className="text-sm text-blue-700"> Body has no sample value container </p>
                                            </div>
                                        </div>
                                        }
                                        </div>
                                    </div>
                                </form>

                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    {props.sampleValues && Object.entries(props.sampleValues).length ?
                                        <button
                                            type="button"
                                            className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                                            onClick={() => tmpBodyFieldMapping()}
                                        >
                                            Save
                                        </button>
                                    :
                                        <></>
                                    }
                                    <button
                                        type="button"
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                        onClick={() => props.setTemplateMapping(false)}
                                        ref={cancelButtonRef}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
}












