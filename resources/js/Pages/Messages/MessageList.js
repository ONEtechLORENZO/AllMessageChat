import React ,{ useEffect , useState } from 'react';
import {
    WhatsAppIcon,
    InstaIcon,
    ErrorIcon,
} from "../icons";

export default function MessageList(props) {
    return(
        <>
                        <div
                            id="messages"
                            className="flex-col flex-1 justify-end space-y-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch"
                        >
                            {Object.entries(props.messages).map(([key, message], j) => (
                                <>
                                 {message.mode == 'incoming' ?
                                    <div className="chat-message">
                                        <div className="flex items-end">
                                            <div className="flex flex-col space-y-2 text-sm max-w-xs mx-2 order-2 items-start">
                                                <div className="text-[#3D4459] px-4 py-2 rounded-lg rounded-bl-none bg-white">
                                                    <span className="inline-block  ">
                                                        {message.content}
                                                    </span>
                                                    <div className='flex w-full'>
                                                    <span className="text-xs text-left mt-2 mx-2">
                                                            {props.containerCategory == 'all' &&
                                                                <>
                                                                {message.category == 'whatsapp' &&
                                                                    <WhatsAppIcon />
                                                                }
                                                               
                                                                {message.category == 'instagram' &&
                                                                    <InstaIcon />
                                                                } 
                                                                </>
                                                                  
                                                            }  
                                                    </span>
                                                    <span className="text-xs text-right  mt-2">
                                                        {message.date} 
                                                    </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    :
                                    <div className="chat-message">
                                        <div className="flex items-end justify-end">
                                            <div className="flex flex-col space-y-2 text-sm max-w-xs mx-2 order-1 items-end">
                                                <div className="text-[#3D4459] px-4 py-2 rounded-lg rounded-bl-none bg-white">
                                                    <span className="inline-block  ">
                                                        {message.content}
                                                    </span>
                                                    <div className='flex w-full'>
                                                        <span className="text-xs text-left mx-2  mt-2">
                                                            {props.containerCategory == 'all' &&
                                                                <>
                                                                {message.category == 'whatsapp' &&
                                                                    <WhatsAppIcon />
                                                                }
                                                               
                                                                {message.category == 'instagram' &&
                                                                    <InstaIcon />
                                                                } 
                                                                </>
                                                                  
                                                            }
                                                        </span>
                                                        <span className="text-xs text-right mt-2 flex" >
                                                            {message.status == 'Failed' &&
                                                                <ErrorIcon />
                                                            }
                                                            {message.date} 
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                }
                                </>
                            ))}
                        </div>
        </>
    );
}