import React from 'react';
import ReactAudioPlayer from 'react-audio-player';
import {
    WhatsAppIcon,
    InstaIcon,
    ErrorIcon,
    QueueIcon,
    SentIcon,
    DeliveredIcon,
    ReadIcon,
} from "../icons";

export default function MessageList(props) {
    return(
        <>
            <div
                id="messages"
                className="flex-col flex-1 justify-end space-y-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch"
            >
                {Object.entries(props.messages).map(([key, message], j) => {
                    var content = message.content;
                    var mediaClass = "object-contain h-48 w-96";
                    switch(message.type) {
                        case 'image':
                            content = <div class=" ">
                                        <img 
                                            src={route('preview_document',message.path)} 
                                            class={mediaClass}
                                        />
                                        {content}
                                    </div>;
                            break;
                        
                        case 'video':
                            content = <div class=" ">
                                    <video 
                                        src={route('preview_document',message.path)} 
                                        autoPlay  
                                        loop
                                        muted
                                        class={mediaClass}
                                    />
                                    {content}
                                </div>;
                            break;
                        
                        case 'audio':
                            content = <div class=" ">
                                    <ReactAudioPlayer
                                        src={route('preview_document',message.path)} 
                                        className={''}
                                        controls
                                    />
                                    {content}
                                </div>;
                            break;

                        case 'application':
                            content = <div class=" ">
                                    <a href={route('preview_document',message.path)} >
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </a>
                                    {message.content}
                                </div>;
                            break;
                    }
                    return(
                        <>
                            {message.mode == 'incoming' ?
                                <div className="chat-message">
                                    <div className="flex items-end">
                                        <div className="flex flex-col space-y-2 text-sm max-w-xs mx-2 order-2 items-start">
                                            <div className="text-[#3D4459] px-4 py-2 rounded-lg rounded-bl-none bg-white">
                                                <span className="inline-block  ">
                                                    {content}
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
                                                    {content}
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
                                                        {message.date} 
                                                        <span className='pl-3' title={message.error}>
                                                            {message.status == 'Failed' &&
                                                                <ErrorIcon /> 
                                                            }
                                                            {(message.status == 'Queued' && message.delivered == 0 && message.read == 0) &&
                                                                <QueueIcon /> 
                                                            }
                                                            {(message.status == 'Sent' && message.delivered == 0 && message.read == 0) &&
                                                                <SentIcon /> 
                                                            }
                                                            {(message.delivered == 1 && message.read == 0) &&
                                                                <DeliveredIcon /> 
                                                            }
                                                            {message.read == 1 &&
                                                                <ReadIcon /> 
                                                            }
                                                        </span> 
                                                        
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            }
                        </>
                    )
                })}
            </div>
        </>
    );
}