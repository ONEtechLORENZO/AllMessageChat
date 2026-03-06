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
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity" />
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
                            <Dialog.Panel className="relative bg-[#120b1f]/95 border border-white/10 rounded-lg text-left overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.45)] transform transition-all sm:my-8 sm:max-w-xl sm:w-full p-1">
                                <div className="border-b border-white/10 px-4 pb-2 sm:p-3 sm:pb-2">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mt-3 text-center sm:mt-0 sm:text-left">
                                            <Dialog.Title as="h3" className="text-lg leading-6 font-semibold text-white flex">
                                            {props.translator['New Catalog']} 
                                            </Dialog.Title>
                                        </div>
                                    </div>
                                </div>

                                <form id='form'>

                                    <div className='px-4 py-2 space-y-4'>
                                        <div className='form-group' >
                                            <label className="block text-sm font-medium text-white/70 py-2">
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
                                                 className="bg-[#0F0B1A] text-white border-white/10 placeholder:text-[#878787] focus:ring-[#BF00FF]/60 focus:border-[#BF00FF]/60"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className='px-4 py-2 space-y-4'>
                                        <div className='form-group' >
                                            <label className="block text-sm font-medium text-white/70 py-2">
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

                                <div className="border-t border-white/10 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="button"
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#BF00FF] text-base font-medium text-white hover:bg-[#9c00d9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0b0815] focus:ring-[#BF00FF]/60 sm:ml-3 sm:w-auto sm:text-sm"
                                        onClick={() => saveCatalog()}
                                    >
                                        {catalogs && catalogs.id ? props.translator['Update Catalog'] : props.translator['Create Catalog']}
                                    </button>
                                    <button
                                        type="button"
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-white/15 shadow-sm px-4 py-2 bg-white/10 text-base font-medium text-white/80 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0b0815] focus:ring-[#BF00FF]/60 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
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












