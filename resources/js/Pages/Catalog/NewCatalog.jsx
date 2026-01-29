import { Fragment, useEffect, useRef, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import notie from 'notie';
import Input from '@/Components/Forms/Input';
import Dropdown from '@/Components/Forms/Dropdown';
import { router as Inertia } from "@inertiajs/react";

const catalogMenu = {
    'commerce' : 'E-commerce', 
};

const mandatoryField = ['name', 'catalog_type'];

export default function NewCatalog(props) {

    const cancelButtonRef = useRef(null)
    const [open, setOpen] = useState(true)
    const [catalogs, setCatalogs] = useState({});

    useEffect( () => {
        if(props.record) {
            setCatalogs(props.record);
        }
    },[]);

    function catalogHandler(event) {
        let newState = Object.assign({}, catalogs);
        const catalog_name = event.target.name;
        let catalog_type = event.target.value;
        newState[catalog_name] = catalog_type;
        newState['catalog_type'] = 'commerce';
        setCatalogs(newState);
    }

    function checkValidation() {
        let check = true;
        if(catalogs){
            (mandatoryField).map( (field) => {
               if(!catalogs[field] && check){
                 check = false;
               }
            });
        }
        return check;
    }

    function saveCatalog() {
        let validate = checkValidation();
        
        if(validate) {
            Inertia.post(route('storeCatalog'), catalogs, {
                onSuccess : (response) => {
                   props.setShowCatalog(false);
                }
            });
        } else {
            notie.alert({type: 'error', text: 'All the fields are mandatory', time: 5});
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
                            <Dialog.Panel className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-xl sm:w-full p-1">
                                <div className="bg-gray-50 px-4 pb-2 sm:p-3 sm:pb-2">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mt-3 text-center sm:mt-0 sm:text-left">
                                            <Dialog.Title as="h3" className="text-lg leading-6 font-semibold text-gray-900 flex">
                                            {props.translator['New Catalog']} 
                                            </Dialog.Title>
                                        </div>
                                    </div>
                                </div>

                                <form id='form'>

                                    <div className='px-4 py-2 space-y-4'>
                                        <div className='form-group' >
                                            <label className="block text-sm font-medium text-gray-700 py-2">
                                            {props.translator['Name']} <span className='text-red-600'> *</span>
                                            </label>
                                            <div className="mt-1">
                                                <Input 
                                                 name='name' 
                                                 id='name' 
                                                 placeholder={'Catalog Name'} 
                                                 handleChange={catalogHandler} 
                                                 value={catalogs['name'] ? catalogs['name'] : ''}
                                                 required={true} 
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className='px-4 py-2 space-y-4'>
                                        <div className='form-group' >
                                            <label className="block text-sm font-medium text-gray-700 py-2">
                                            {props.translator['Catalog Menu']} <span className='text-red-600'> *</span>
                                            </label>
                                            <div className="mt-1">
                                                <Dropdown 
                                                    required={true} 
                                                    id="catalog_type"
                                                    name="catalog_type"
                                                    handleChange={catalogHandler}
                                                    options={catalogMenu}
                                                    value={catalogs['catalog_type'] ? catalogs['catalog_type'] : ''}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </form>

                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="button"
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                                        onClick={() => saveCatalog()}
                                    >
                                        {catalogs && catalogs.id ? props.translator['Update Catalog'] : props.translator['Create Catalog']}
                                    </button>
                                    <button
                                        type="button"
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                        onClick={() => props.setShowCatalog(false)}
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
    );
}









