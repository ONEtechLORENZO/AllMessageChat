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

import SearchTemplate from './SearchTemplate';
import Axios from 'axios';

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

function ChatBox(props) 
{
    const [templates, setTemplates] = useState(props.templates);
    const [products, setProducts] = useState(props.products);
    const [interactiveMessages, setInteractiveMessage] = useState(props.interactiveMessages);

    function searchTemplates(key){
        var templateList = [];
        (props.templates).map((template)=>{
            if((template.name).indexOf(key) !== -1){
                templateList.push(template);
            }
        });
        setTemplates(templateList);
    }

    function searchInteractiveMessages(key) {
        var templateList = [];
        (props.interactiveMessages).map((interactiveMessage)=>{
            if((interactiveMessage.name).indexOf(key) !== -1){
                templateList.push(interactiveMessage);
            }
        });
        setInteractiveMessage(templateList);
    }

    function searchProduct(key) {
        let url = route('search_product', {'search': key});
        Axios.get(url).then((response) => {
            if(response.data.status === true) {
                setProducts(response.data.products);
            }
        });
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
                        onKeyUp={(e) => props.handleKeyUp(e)}
                        name="content"
                        disabled={(props.data.template_id || props.data.catalog_id)? true : false }
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
                                    <div class="flex justify-center">
                                        <AttachIcon />
                                        <input 
                                            className='opacity-0 absolute w-10 cursor-pointer'
                                            type={'file'} 
                                            name="attachment" 
                                            onChange={(e) => props.handleChange(e)} 
                                        />
                                    </div>
                                {/* <Popover className="relative">
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
                                </Popover> */}
                                <span className="sr-only">Attach a file</span>
                            </button>
                        </div>
                        {/*                         
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
                                        <Listbox.Options className="absolute z-10 -ml-6 w-60 !pl-3 rounded-lg bg-white py-3 text-base shadow ring-1 ring-black ring-opacity-5 focus:outline-none sm:ml-auto sm:w-64 sm:text-sm bottom-full">
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
                         */}

                        {props.containerCategory == 'whatsapp' &&
                            <div className="flow-root">
                                <SearchTemplate 
                                   templates={templates}
                                   products={products}
                                   interactiveMessages={interactiveMessages}

                                   searchProduct={searchProduct}
                                   searchTemplates={searchTemplates}
                                   searchInteractiveMessages={searchInteractiveMessages}
                                   
                                   setInteractiveMessage={props.setInteractiveMessage}
                                   setProductInfo={props.setProductInfo}
                                   setTemplateInfo={props.setTemplateInfo}
                                   selectedAccount={props.selectedAccount}
                                />
                            </div>
                        }
                        

                        <div className="flow-root">
                            {(props.data.template_id || props.data.catalog_id) ?
                                <span
                                    title="Clear template"
                                    className='cursor-pointer'
                                    onClick={() => props.clearContent()}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </span>
                            :''}
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
 