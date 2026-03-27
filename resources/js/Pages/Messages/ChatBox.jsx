import { useState } from 'react'
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { AttachIcon } from "../icons";

import SearchTemplate from './SearchTemplate';
import Axios from 'axios';

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
       <div className="rounded-[1.75rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-3 shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
            <form action="#">
                <div className="flex items-end gap-3">
                    <div className="flex shrink-0 items-center gap-2 pb-1">
                        <label className="relative flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white/5 text-white/70 transition hover:text-white">
                            <AttachIcon />
                            <input
                                className="absolute inset-0 cursor-pointer opacity-0"
                                type={'file'}
                                name="attachment"
                                onChange={(e) => props.handleChange(e)}
                            />
                            <span className="sr-only">Attach a file</span>
                        </label>
                        {props.containerCategory == 'whatsapp' &&
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/5 text-white/70 transition hover:text-white">
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
                    </div>
                    <div className="min-w-0 flex-1 rounded-[1.5rem] bg-[#ffffff08] px-4 py-3">
                        <label htmlFor="content" className="sr-only">
                            Add your comment
                        </label>
                        <textarea
                            rows={2}
                            id="content"
                            onChange={(e) => props.handleChange(e)}
                            onKeyUp={(e) => props.handleKeyUp(e)}
                            name="content"
                            disabled={(props.data.template_id || props.data.catalog_id)? true : false }
                            value={props.data.content}
                            className="block min-h-[52px] w-full resize-none border-0 bg-transparent p-0 text-sm text-white placeholder-white/35 focus:ring-0"
                            placeholder="Type a message"
                            defaultValue={''}
                        />
                    </div>
                    <div className="flex shrink-0 items-center gap-2 pb-1">
                        {(props.data.template_id || props.data.catalog_id) ?
                            <button
                                type="button"
                                title="Clear template"
                                className='flex h-11 w-11 items-center justify-center rounded-full bg-white/5 text-white/70 transition hover:text-white'
                                onClick={() => props.clearContent()}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-5 w-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </button>
                        :''}
                        <button
                            type="button"
                            onClick={props.sendMessage}
                            className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[linear-gradient(135deg,#FF4FD8,#A31EFF)] text-white shadow-[0_16px_40px_rgba(163,30,255,0.35)] transition hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#A31EFF]/60 focus:ring-offset-0"
                        >
                            <PaperAirplaneIcon className="h-6 w-6 -rotate-12" />
                        </button>
                    </div>
                </div>
            </form>
        </div>
       </>
    );
}
export default ChatBox;
 











