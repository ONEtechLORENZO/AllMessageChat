import { Fragment, useEffect, useRef, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import Dropdown from '@/Components/Forms/Dropdown';
import nProgress from 'nprogress';
import Axios from "axios";
import FieldSort from './FieldSort';

function OrderFieldsGroup(props){
    const [open, setOpen] = useState(props.open);
    const cancelButtonRef = useRef(null);
    const [selectedModule, setSelectedModule] = useState('');
    const [module_list, setModuleList] = useState(props.module_list)
    const [fields, setFields] = useState();
    const [groups, setGroups] = useState();

    const [fieldOrder, setFieldOrder] = useState({});
    const [groupList, setGroupList] = useState();

    useEffect(()=> {
       // getFieldsGroup();
    })

    /**
     * Get Fields & Groups
     */
    function getFieldsGroup(moduleName){
         nProgress.start(0.5);
         nProgress.inc(0.2);

        var url = route('get_fields_group')
        Axios({
            method: 'get',
            url: url + '?module='+moduleName ,
        })
        .then( (response) =>{
            nProgress.done(true);
            setFields(response.data.fields); 
            setGroups(response.data.groups)
          
        });
    }
    
    function handleChange(e){
        var value = e.target.value;
        setSelectedModule(value)
        if(value){
            getFieldsGroup(value)
        }
    }

    /**
     * Save Field Order
     */
    function saveFieldOrder(){
        nProgress.start(0.5);
        nProgress.inc(0.2);
        
        var url = route('store_field_order');
        Axios({
            method: 'post',
            url: url ,
            data: {
                'module_name': selectedModule,
                'field_order': fieldOrder,
                'group_list': groupList
            }
        })
        .then( (response) =>{
            
            nProgress.done(true);
            props.setOrderFields(false);

        });
    }
    return(
        <Transition.Root show={open} as={Fragment}>
            <Dialog as="div" className="relative max-w-5xl lg:min-w-[900px] z-10" initialFocus={cancelButtonRef} onClose={() => {}} >
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
                            <Dialog.Panel className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-xl sm:w-full max-w-5xl lg:min-w-[900px]">
                                <div className="bg-gray-50 px-4 pt-5 pb-4 sm:p-4 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mt-3 text-center sm:mt-0 sm:text-left">
                                            <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                                                Order field group
                                            </Dialog.Title>
                                        </div>
                                    </div>
                                </div>

                                <form id=''>
                                    <div className='p-4 space-y-4'>
                                        <div class="">
                                            <div>
                                                <div class="sm:gap-4">
                                                    <label for="selected_module" class="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                                                        Select Module
                                                    </label>
                                                    <div class="mt-1 sm:mt-0 w-1/4">
                                                        <Dropdown
                                                            id={'selected_module'}
                                                            name={'selected_module'}
                                                            options={module_list}
                                                            handleChange={handleChange}
                                                            value={selectedModule}
                                                        />
                                                    </div>
                                                </div>
                                                {selectedModule &&
                                                    <div className='flex mt-3'>
                                                        <div class="flex-1 m-1 overflow-auto w-full max-h-80">
                                                            <FieldSort
                                                                groups={groups}
                                                                fields={fields}
                                                                setGroups={setGroupList}
                                                                setFieldOrder={setFieldOrder}
                                                            /> 
                                                        </div>
                                                    </div>
                                                }
                                            </div>
                                            
                                        </div>
                                    </div>
                                </form>
                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="button"
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                                        onClick={saveFieldOrder}
                                    >
                                        Save
                                    </button>
                                    <button
                                        type="button"
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                        onClick={() => props.setOrderFields(false)}
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
export default OrderFieldsGroup;