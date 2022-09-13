import { Fragment, useEffect, useRef, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import Authenticated from '@/Layouts/Authenticated';
import Step1 from './Step1';
import Step2 from './Step2';
import Step3 from './Step3';

export default function AccountRegistration(props){

    const cancelButtonRef = useRef(null);
    const [open, setOpen] = useState(true);
    const [curretpage, setCurrentPage] = useState(1);
    const [service, setService] = useState('');
    const [data, setData] = useState({});
    const [addfield, setAddField] = useState(false);
    
    function accountHandler(){
        if(service){
            setCurrentPage(2);
        }
        return false;
    }

    function formHandler(event){
      let newData = Object.assign({}, data);
      const field_name = event.target.name;
      const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
      newData[field_name] = value;
      setData(newData);
    }
    
    return(
        <Authenticated
          auth={props.auth}
          errors={props.errors}
        >
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
                                <Dialog.Panel 
                                 className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-1/2 sm:w-1/2"
                                >
                                <div>
                                  <div className='w-full'>
                                    <div 
                                      className={
                                        curretpage == 1 ? "block" : "hidden"
                                      }
                                    >
                                       <Step1 
                                        service={service}
                                        setService={setService}
                                        accountHandler={accountHandler}
                                        setOpen={setOpen}
                                       />
                                    </div>

                                    <div 
                                      className={
                                        curretpage == 2 ? "block" : "hidden"
                                      }
                                    >
                                        <Step2 
                                        setCurrentPage={setCurrentPage}
                                        setAddField={setAddField}
                                        />
                                    </div>

                                    <div 
                                      className={
                                        curretpage == 3 ? "block" : "hidden"
                                      }
                                    >
                                       <Step3 
                                        data={data}
                                        formHandler={formHandler}
                                        addfield={addfield}
                                       />
                                    </div>

                                  </div>
                                    
                                </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>
        </Authenticated>
    );
}