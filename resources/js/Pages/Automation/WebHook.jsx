import React, { useState, useCallback, useRef, Fragment, useEffect } from "react";
import { Dialog, Transition } from '@headlessui/react';
import TextArea from "@/Components/Forms/TextArea";
import notie from 'notie';
import ListViewTable from "@/Components/Views/List/ListViewTable";

function WebHook(props){

    const [hookUrl, setHookUrl] = useState('');
    const [sampleData, setSampleData] = useState('');

    const [open, setOpen] = useState(true);
    const cancelButtonRef = useRef(null);
    

    function classNames(...classes) {
        return classes.filter(Boolean).join(' ')
    }

    useEffect(()=>{
        if(!props.webHookUrl){
            setWebHookUrl();
        }
        if(props.node.data && props.node.data.sample_data){
            setSampleData(props.node.data.sample_data);
        }
    }, []);

    /**
     * Set WebHook URL
     */
    function setWebHookUrl(){
        var url = route('web_hook_event');
        url = url + '?automation_id='+props.record.id+'&unique_id='+props.record.uuid;
        setHookUrl(url);
    }

    function getWebHookSampleData(){
        axios({
            method: 'get',
            url: route('get_webhook_data' , [props.record.id, props.record.uuid]),
        })
        .then((response) => {
            if (response.data && response.data.status ) {
                if(response.data.result){
                    setSampleData(response.data.result);
                } else {
                    notie.alert({type: 'info', text: 'No data updated.', time: 5});
                }
            }
        });
    }

    const sampleHeaders = {
        key: { label: "Key", type: "text" },
        value: { label: "Value", type: "text" },
    };

    const sampleRecords = Object.entries(sampleData || {}).map(
        ([name, value], index) => ({
            id: index,
            key: name,
            value,
        }),
    );

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
                          <div className="flex items-end sm:items-center justify-center min-h-full p-4 text-center sm:p-0">
                              <Transition.Child
                                  as={Fragment}
                                  enter="ease-out duration-300"
                                  enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                                  enterTo="opacity-100 translate-y-0 sm:scale-100"
                                  leave="ease-in duration-200"
                                  leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                                  leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                              >
                                  <Dialog.Panel className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-xl sm:w-full">
                                      <div className="bg-gray-50 px-4 pt-5 pb-4 sm:p-4 sm:pb-4">
                                          <div className="sm:flex sm:items-start">
                                                <div className="flex justify-between w-full">
                                                    <div className="mt-3 text-center sm:mt-0 sm:text-left">
                                                        <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                                                        {props.heading}
                                                        </Dialog.Title>
                                                    </div>
                                                    <div>
                                                        <button
                                                            className="border-1 border-indigo-300"
                                                            onClick={() => props.setShowWebhook(false)}
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                                 <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                          </div>
                                      </div>
      
                                      <form id='form'>
                                          <div className='p-4 space-y-4'>

                                                <div className="flex flex-wrap -mx-3 mb-6">
                                                    <div className="w-full px-3">
                                                        <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="url">
                                                            Custom Webhook URL
                                                        </label>
                                                        <TextArea 
                                                            className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 h-16"
                                                            id="url"
                                                            name="url"
                                                            type="text" 
                                                            value={hookUrl}
                                                        />
                                                    </div>
                                                </div>
                                                {!sampleData  ?
                                                    <div className="inline-flex justify-center w-full">
                                                        <button
                                                            onClick={getWebHookSampleData}
                                                            type="button"
                                                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                                        >
                                                            Receive webhook
                                                        </button>
                                                    </div>
                                                :
                                                    <div className="">
                                                        <div className="w-full px-3">
                                                            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="url">
                                                                Data found
                                                            </label>
                                                            <div className="w-2/3">
                                                                <ListViewTable
                                                                    records={sampleRecords}
                                                                    customHeader={sampleHeaders}
                                                                    fetchFields={false}
                                                                    hideToolMenu={true}
                                                                    disableSorting={true}
                                                                    theme="light"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="">
                                                            <button
                                                                onClick={getWebHookSampleData}
                                                                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                                                type="button"
                                                            >
                                                                Refresh
                                                            </button>
                                                        </div>
                                                    </div>
                                                }
                                          </div>
                                      </form>

                                      <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                        <button
                                            type="button"
                                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                                            onClick={() => props.saveWebHookData(sampleData, props.node.id)}
                                        >
                                            Save
                                        </button>
                                        <button
                                            type="button"
                                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                            onClick={() => props.setShowWebhook(false)}
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
    )
}
export default WebHook;












