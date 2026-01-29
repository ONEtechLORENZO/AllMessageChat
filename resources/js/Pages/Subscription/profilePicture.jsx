import { Fragment, useRef, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { router as Inertia } from "@inertiajs/react";
import notie from 'notie';

export default function profilePicture(props) {

    const [open, setOpen] = useState(true);
    const cancelButtonRef = useRef(null);
    const [profile, setProfile] = useState();

    function handleProfilepicture(event) {
        let newProfile = Object.assign({}, profile);
        const name = event.target.name;
        let file = event.target.files[0];
        newProfile[name] = file;
        setProfile(newProfile);
    }

    function saveProfile() {
        
        if(!profile){
            notie.alert({type: 'warning', text: 'Please upload your image file', time: 5});
            return false;
        }
        
        Inertia.post(route('change_profile_picture'), profile, {
            onSuccess: (response) => {
                props.setChangeProfile(false);
                notie.alert({type: 'success', text: 'Profile picture update successfully', time: 5});
            },
        })
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
                                                Profile Picture 
                                            </Dialog.Title>
                                        </div>
                                    </div>
                                </div>

                                <form id='form'>
                                    <div className='px-4 py-2 space-y-4'>
                                        <div className="w-28">
                                            <div className="w-28 h-28 relative">
                                              <img src={props.company.file_path} className="object-cover w-full h-full rounded-full"/>
                                            </div>
                                        </div>
                                        <div className="form-group col-span-6 sm:col-span-4">
                                        <label htmlFor="profile_picture" className="block text-sm font-medium text-gray-700">
                                            Attach file
                                        </label>
                                        <div className="mt-1">
                                            <input name='profile_picture' id='profile_picture' type={'file'} className="form-control" required={true} onChange={(e) => handleProfilepicture(e)}/>
                                        </div>
                                    </div>
                                    </div>
                                </form>

                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="button"
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                                        onClick={() => saveProfile()}
                                    >
                                        Save
                                    </button>
                                    <button
                                        type="button"
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                        onClick={() => props.setChangeProfile(false)}
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












