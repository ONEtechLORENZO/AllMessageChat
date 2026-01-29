import { Fragment, useEffect, useRef, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { router as Inertia } from "@inertiajs/react";
            
function SelectCompany(props) 
{
    const [open, setOpen] = useState(false);
    const [companytList, setCompanyList] = useState({});
    const [selectedCompany, setSelectedCompany] = useState('');
    const cancelButtonRef = useRef(null);

    /**
     * Save selected company to parent account
     */
    function saveSelectedCompany(id){
        var data = { 'company_id': id};
        Inertia.post(route('setBaseCompany'), data, {
            onSuccess: (response) => {
                props.setSelectedCompany(false);
            },
        });
    }
    useEffect(() => {
        setOpen(false);
        getSelectedCompany();
    },[props.openModal]);

    function getSelectedCompany(){
        axios.get(route('get_selected_company'))
        .then(res => {
            setSelectedCompany(res.data.selected_company);
            setCompanyList(res.data.companies);
            if(!res.data.selected_company || props.openModal){
                setOpen(true);
            }
        })
    }

    return (
        <>

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
                                        <div className="sm:flex sm:items-start ">
                                            <div className="mt-3 text-center sm:mt-0 sm:text-left w-1/2">
                                                <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                                                    Choose Workspace
                                                </Dialog.Title>
                                            </div>
                                            <div className='w-1/2'>
                                              <button className="float-right" onClick={() =>  props.setSelectedCompany(false)}>x</button>
                                            </div>
                                        </div>
                                    </div>

                                    <form id=''>
                                        <div className='p-4 space-y-4'>
                                            <div className="flex justify-center">
                                                <ul className="bg-white rounded-lg border border-gray-200 w-full text-gray-900">
                                                    {companytList && Object.entries(companytList).map(([key ,company]) =>
                                                        <li 
                                                            onClick={() => saveSelectedCompany(company.id) } 
                                                            className="cursor-pointer px-6 py-2 border-b border-gray-200 w-full rounded-t-lg"
                                                            >
                                                                {company.name}
                                                                {company.id == selectedCompany &&
                                                                    <span className="bg-green-100 ml-2 p-1 rounded">Active</span>
                                                                }
                                                        </li>
                                                    )}
                                                </ul>
                                            </div>
                                        </div>
                                    </form>

                                    
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>
        </>
    )
}

export default SelectCompany;












