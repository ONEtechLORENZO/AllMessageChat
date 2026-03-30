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
       <div className="rounded-[1.9rem] bg-[linear-gradient(135deg,rgba(23,10,34,0.98),rgba(10,8,17,0.98))] p-3 shadow-[0_24px_70px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.05)] ring-1 ring-[#8f38d9]/16">
            <form action="#">
                <div className="flex items-center gap-3 rounded-[1.45rem] bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.04))] px-4 py-3 shadow-[0_20px_46px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.06)] ring-1 ring-white/8">
                    <div className="flex shrink-0 items-center gap-2 text-white/78">
                        <label className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-white/78 transition hover:bg-white/[0.06] hover:text-white">
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
                            <div className="flex h-10 w-10 items-center justify-center rounded-full text-white/78 transition hover:bg-white/[0.06] hover:text-white">
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
                    <div className="min-w-0 flex-1 rounded-[1rem] bg-[#1F1F1F] px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                        <label htmlFor="content" className="sr-only">
                            Add your comment
                        </label>
                        <textarea
                            rows={1}
                            id="content"
                            onChange={(e) => props.handleChange(e)}
                            onKeyUp={(e) => props.handleKeyUp(e)}
                            name="content"
                            disabled={(props.data.template_id || props.data.catalog_id)? true : false }
                            value={props.data.content}
                            className="block min-h-[40px] w-full resize-none border-0 bg-transparent p-0 pt-2 text-sm text-white placeholder-white/38 focus:ring-0"
                            placeholder="Type a message"
                            defaultValue={''}
                        />
                    </div>
                    <div className="flex shrink-0 items-center gap-2 text-white/78">
                        {(props.data.template_id || props.data.catalog_id) ?
                            <button
                                type="button"
                                title="Clear template"
                                className='flex h-10 w-10 items-center justify-center rounded-full text-white/78 transition hover:bg-white/[0.06] hover:text-white'
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
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,#ff5bdf,#b22cff)] text-white shadow-[0_10px_26px_rgba(163,30,255,0.28)] transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-[#A31EFF]/30 focus:ring-offset-0"
                        >
                            <PaperAirplaneIcon className="h-7 w-7 -rotate-12" />
                        </button>
                    </div>
                </div>
            </form>
        </div>
       </>
    );
}
export default ChatBox;
 











