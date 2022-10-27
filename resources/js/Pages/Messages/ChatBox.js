import { Fragment, useState } from 'react'
import { MenuIcon, PlusIcon } from "@heroicons/react/outline";
import { Listbox, Transition, Menu, Popover } from '@headlessui/react';
import Creatable from 'react-select/creatable';
import { SearchIcon } from '@heroicons/react/solid';

const moods = [
    { name: 'Excited', value: 'excited', icon: MenuIcon, iconColor: 'text-white', bgColor: 'bg-red-500' },
    { name: 'Loved', value: 'loved', icon: MenuIcon, iconColor: 'text-white', bgColor: 'bg-pink-400' },
    { name: 'Happy', value: 'happy', icon: MenuIcon, iconColor: 'text-white', bgColor: 'bg-green-400' },
    { name: 'Sad', value: 'sad', icon: MenuIcon, iconColor: 'text-white', bgColor: 'bg-yellow-400' },
    { name: 'Thumbsy', value: 'thumbsy', icon: MenuIcon, iconColor: 'text-white', bgColor: 'bg-blue-500' },
    { name: 'I feel nothing', value: null, icon: MenuIcon, iconColor: 'text-gray-400', bgColor: 'bg-transparent' },
  ]
  
import {
    SmileEmoji,
    AttachIcon,
    WhatsAppIcon,
    NotifiIcon,
    InstaIcon,
    SettingIcon,
} from "../icons";

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

function ChatBox(props) 
{
    const [templates, setTemplates] = useState(props.templates);

    function searchTemplates(key){
        var templateList = [];
        (props.templates).map((template)=>{
            if((template.name).indexOf(key) !== -1){
                templateList.push(template);
            }
        });
        setTemplates(templateList);
    }

    return(
       <>
       <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
                <span className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-gray-500">
                    <span className="text-2xl font-medium leading-none text-white">
                        {props.logo}
                    </span>
                </span>
            </div>
            <div className="min-w-0 flex-1">
                <form action="#">
                <div className="border-b border-gray-200 focus-within:border-indigo-600">
                    <label htmlFor="comment" className="sr-only">
                    Add your comment
                    </label>
                    <textarea
                        rows={3}
                    
                        id="content"
                        onChange={(e) => props.handleChange(e)}
                    //    onKeyUp={(e) => props.handleKeyUp(e)}
                        name="content"
                        value={props.data.content}
                        className="block w-full resize-none border-0 border-b border-transparent p-0 pb-2 focus:border-indigo-600 focus:ring-0 sm:text-sm"
                        placeholder="Add your comment..."
                        defaultValue={''}
                    />
                </div>
                <div className="flex justify-between pt-2">
                    <div className="flex items-center space-x-5">
                        <div className="flow-root">
                            <button
                                type="button"
                                className="-m-2 inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-400 hover:text-gray-500"
                            >
                                <Popover className="relative">
                                    <Popover.Button>
                                        <AttachIcon />
                                    </Popover.Button>
                                    <Popover.Panel className="absolute z-10">
                                        <div class="flex justify-center">
                                            <input 
                                                type={'file'} 
                                                name="attachment" 
                                                onChange={(e) => props.handleChange(e)} 
                                            />
                                        </div>
                                    </Popover.Panel>
                                </Popover>
                                <span className="sr-only">Attach a file</span>
                            </button>
                        </div>
                        <div className="flow-root">
                            <Listbox >
                            {({ open }) => (
                                <>
                                <Listbox.Label className="sr-only"> Your mood </Listbox.Label>
                                    <div className="relative">
                                        <Listbox.Button className="relative -m-2 inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-400 hover:text-gray-500">
                                        <span className="flex items-center justify-center">
                                            <span>
                                                <SmileEmoji className="h-6 w-6 flex-shrink-0" aria-hidden="true" />
                                                <span className="sr-only"> Add your mood </span>
                                            </span>
                                        </span>
                                        </Listbox.Button>

                                        <Transition
                                        show={open}
                                        as={Fragment}
                                        leave="transition ease-in duration-100"
                                        leaveFrom="opacity-100"
                                        leaveTo="opacity-0"
                                        >
                                        <Listbox.Options className="absolute z-10 -ml-6 w-60 rounded-lg bg-white py-3 text-base shadow ring-1 ring-black ring-opacity-5 focus:outline-none sm:ml-auto sm:w-64 sm:text-sm">
                                            {moods.map((mood) => (
                                            <Listbox.Option
                                                key={mood.value}
                                                className={({ active }) =>
                                                classNames(
                                                    active ? 'bg-gray-100' : 'bg-white',
                                                    'relative cursor-default select-none py-2 px-3'
                                                )
                                                }
                                                value={mood}
                                            >
                                                <div className="flex items-center">
                                                <div
                                                    className={classNames(
                                                    mood.bgColor,
                                                    'w-8 h-8 rounded-full flex items-center justify-center'
                                                    )}
                                                >
                                                    <mood.icon
                                                    className={classNames(mood.iconColor, 'flex-shrink-0 h-5 w-5')}
                                                    aria-hidden="true"
                                                    />
                                                </div>
                                                <span className="ml-3 block truncate font-medium">{mood.name}</span>
                                                </div>
                                            </Listbox.Option>
                                            ))}
                                        </Listbox.Options>
                                        </Transition>
                                    </div>
                                </>
                            )}
                            </Listbox>
                        </div>
                        <div className="flow-root">
                        <Listbox  horizontal >
                            {({ open }) => (
                                <>
                                <Listbox.Label className="sr-only">Templates</Listbox.Label>
                                    <div className="relative">
                                        <Listbox.Button className="relative -m-2 inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-400 hover:text-gray-500">
                                            <span className="flex items-center justify-center">
                                                <span>
                                                    <PlusIcon className="h-6 w-6 flex-shrink-0" aria-hidden="true" />
                                                    <span className="sr-only"> Choose yoour template  </span>
                                                </span>
                                            </span>
                                        </Listbox.Button>

                                        <Transition
                                            show={open}
                                            as={Fragment}
                                            leave="transition ease-in duration-100"
                                            leaveFrom="opacity-100"
                                            leaveTo="opacity-0"
                                        >
                                        <Listbox.Options className="absolute z-10 -ml-6 w-60 rounded-lg bg-white py-3 text-base shadow ring-1 ring-black ring-opacity-5 focus:outline-none sm:ml-auto sm:w-64 sm:text-sm">
                                          
                                                <div className="flex items-center">
                                                    <span className="ml-3 block truncate font-medium">
                                                        <div className="relative rounded-md shadow-sm">
                                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                                <span className="text-gray-500 sm:text-sm">
                                                                    <SearchIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                                                </span>
                                                            </div>
                                                            <input 
                                                                name="search_template"
                                                                id="search_template"
                                                                placeholder="Search template"
                                                                onChange={(e) => searchTemplates(e.target.value)}
                                                                className={`pl-9 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-skin-primary focus:border-skin-primary sm:text-sm`} 
                                                            />
                                                        </div>
                                                    </span>
                                                </div>
                                           
                                            {(templates).map((template) => (
                                                <Listbox.Option
                                                    key={template.value}
                                                    className={({ active }) =>
                                                        classNames(
                                                            active ? 'bg-gray-100' : 'bg-white',
                                                            'relative cursor-default select-none py-2 px-3'
                                                        )
                                                    }
                                                    onClick={()=> props.setTemplateInfo(template)}
                                                >
                                                    <div className="flex items-center">
                                                        <span className="ml-3 block truncate font-medium">{template.name}</span>
                                                    </div>
                                                </Listbox.Option>
                                            ))}
                                        </Listbox.Options>
                                        </Transition>
                                    </div>
                                </>
                            )}
                            </Listbox>
                        </div>
                    </div>
                    <div className="flex-shrink-0">
                    <button
                        type="button"
                        onClick={props.sendMessage}
                        className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Post
                    </button>
                    </div>
                </div>
                </form>
            </div>
        </div>
       </>
    );
}
export default ChatBox;
 