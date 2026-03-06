import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";
import Step4 from "./Step4";
import Step5 from "./Step5";
import Step6 from "./Step6";

const categories = {
    meta_profile : 'Select Meta Profile', business : 'Select Business' , catalog : 'Select Catalog' , map_fields :'Map fields', schedule : 'Set Schedule'
};

function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
}

export default function ImportCatalog(props) {

    const [open, setOpen] = useState(true);
    const [tab, setTab] = useState('meta_profile');
    const [fbToken, setfbToken] = useState(props.fbToken);
    const [catalogId, setCatalogId] = useState();
    
    useEffect( () => {
        if(props.fbToken) {
            setTab('business');
        }
    },[props]);

    return (
        <Transition appear show={open} as={Fragment}>
            <Dialog as="div" className="relative z-10" onClose={() => {}}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-4xl max-h-[640px] transform overflow-hidden rounded-2xl border border-white/10 bg-[#120b1f]/95 text-left align-middle shadow-[0_20px_40px_rgba(0,0,0,0.45)] transition-all">
                                <div className="flex min-h-[300px]">
                                    <div className="w-2/6 bg-[#0F0B1A] text-white flex flex-col gap-4 items-center p-6 overflow-y-auto max-h-[640px] border-r border-white/10">
                                        {tab != 'loading' ? 
                                          <>
                                            <div className="text-xl font-semibold text-white">
                                                Import Catalog
                                            </div>
                                            
                                            <ul className="divide-y w-full pl-0">
                                                {Object.entries(categories).map( ([name, label]) => (
                                                    <li className={classNames(tab == name ? 'text-[#BF00FF]' : 'text-white/70', "flex gap-2 items-center w-full !p-3")}>
                                                        <div className={classNames(tab == name ? 'bg-[#BF00FF]' : 'bg-white/40', "w-3 h-3 rounded-full")}></div>
                                                        {label}
                                                    </li>
                                                ))}
                                            </ul>
                                          </>
                                        :
                                          <div className="align-middle">
                                            <div className="text-xl font-semibold py-10 text-white">
                                                Import Catalog...
                                            </div>
                                          </div>
                                        }
                                      
                                    </div>
                                    <div className="w-4/6 !p-6 flex flex-col text-white/90">
                                        {tab == 'meta_profile' ? 
                                          <Step1 
                                            translator={props.translator}
                                            setShowImport={props.setShowImport}
                                            setTab={setTab}
                                            fbToken={fbToken}
                                            setfbToken={setfbToken}
                                          />
                                        :''}

                                        {tab == 'business' ?
                                           <Step2 
                                             setShowImport={props.setShowImport}
                                             fbToken={fbToken}
                                             setTab={setTab}
                                           />
                                        : ''}

                                        {tab == 'catalog' ?
                                           <Step3 
                                             setShowImport={props.setShowImport}
                                             fbToken={fbToken} 
                                             setTab={setTab}
                                             catalogId={catalogId}
                                             setCatalogId={setCatalogId}
                                           />
                                        : ''}

                                        {tab == 'map_fields' ? 
                                            <Step4 
                                              setShowImport={props.setShowImport}
                                              setTab={setTab}
                                              catalogId={catalogId}
                                            />
                                        : ''}

                                        {tab == 'schedule' ?
                                           <Step5 
                                              setShowImport={props.setShowImport}
                                              setTab={setTab}
                                              catalogId={catalogId}
                                           />
                                        : ''}

                                        {tab == 'loading' ? 
                                           <Step6 
                                             setShowImport={props.setShowImport}
                                           />
                                        :''}
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}












