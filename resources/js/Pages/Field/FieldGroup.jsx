import { Fragment, useEffect, useRef, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import nProgress, { settings } from 'nprogress';
import Input from '@/Components/Forms/Input';
import Dropdown from '@/Components/Forms/Dropdown';
import notie from 'notie';
import Axios from "axios";

function FieldGroup(props)
{
    const [open, setOpen] = useState(props.open);
    const cancelButtonRef = useRef(null);
    const [group_name, setGroupName] = useState('');
    const [selectedModule, setSelectedModule] = useState('');
    
    const [module_list, setModuleList] = useState(props.module_list);


    function saveFieldGroup(){
        if(!group_name || !selectedModule){
            notie.alert({type: 'error', text: 'Please fill the inputs', time: 5});
            return false;
        }
        var endpoint_url = route('storeFieldGroup');
        var data = {'field_group': group_name , 'module_name': selectedModule };
        nProgress.start(0.5);
        nProgress.inc(0.2);
        Axios.post(endpoint_url, data).then((response) => {
            nProgress.done(true);
            notie.alert({type: 'success', text: 'Field group stored successfully', time: 5});
            props.setFieldGroup(false);
        })
    }   

    return (
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
                                        <div className="mt-3 text-center sm:mt-0 sm:text-left">
                                            <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                                                {props.translator['Add new Field Group']}
                                            </Dialog.Title>
                                        </div>
                                    </div>
                                </div>

                                <form id=''>
                                    <div className='p-4 space-y-4'>
                                        
                                        <div className=" justify-center">
                                            <div className='sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start  sm:pt-5'>
                                                <label for="selected_module" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                                                {props.translator['Select Module']}
                                                </label>
                                                <div className="mt-1 sm:mt-0 sm:col-span-2">
                                                    <Dropdown
                                                        id={'selected_module'}
                                                        name={'selected_module'}
                                                        options={module_list}
                                                        handleChange={ (e) => setSelectedModule(e.target.value)}
                                                        value={selectedModule}
                                                    />
                                                </div>
                                            </div>
                                        
                                            <div className='sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start  sm:pt-5'>
                                                <label for="field_group_name" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                                                {props.translator['Group Name']}  
                                                </label>
                                                <Input
                                                    name="field_group_name"
                                                    value={group_name}
                                                    handleChange={(e) => setGroupName(e.target.value)}
                                                />
                                            </div>
                                                    
                                        </div>
                                    </div>
                                </form>
                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="button"
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                                        onClick={saveFieldGroup}
                                    >
                                        {props.translator['Create']}
                                    </button>
                                    <button
                                        type="button"
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                        onClick={() => props.setFieldGroup(false)}
                                        ref={cancelButtonRef}
                                    >
                                         {props.translator['Cancel']}
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

export default FieldGroup;












