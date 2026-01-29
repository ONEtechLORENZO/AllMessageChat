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

import StoryContent from './StoryContent';
import { BsFacebook } from "react-icons/bs";
import { PopoverHeader, PopoverBody, UncontrolledPopover } from "reactstrap";

export default function MessageList(props) {

    return (
        <>
            <div
                id="messages"
                className="flex-col flex-1 justify-end space-y-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch"
            >
                {Object.entries(props.messages).map(([key, message], j) => {
                    var content = message.content;
                    var mediaClass = "object-contain h-48 w-96";
                    switch (message.type) {
                        case 'image':
                            content = <div className=" ">
                                <img
                                    src={message.path}
                                    className={mediaClass}
                                />
                                {content}
                            </div>;
                            break;

                        case 'video':
                            content = <div className=" ">
                                <video
                                    src={message.path}
                                    autoPlay
                                    loop
                                    muted
                                    className={mediaClass}
                                />
                                {content}
                            </div>;
                            break;

                        case 'audio':
                            content = <div className=" ">
                                <ReactAudioPlayer
                                    src={message.path}
                                    className={''}
                                    controls
                                />
                                {content}
                            </div>;
                            break;

                        case 'application':
                            content = <div className=" ">
                                <a href={message.path} >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </a>
                                {message.content}
                            </div>;
                            break;
                        case 'story':
                            content = <StoryContent
                                data={message}
                                className={mediaClass}
                                loadedStory={props.loadedStory}
                                setLoadedStory={props.setLoadedStory}
                            />
                            break;
                    }
                    return (
                        <>
                            {message.mode == 'incoming' ?
                                <div className="chat-message">
                                    <div className="flex items-end">
                                        <div className="flex flex-col space-y-2 text-sm max-w-xs mx-2 order-2 items-start">
                                            <div className="text-[#3D4459] px-4 py-2 rounded-lg rounded-bl-none bg-white">
                                                <span className="inline-block text-sm">
                                                    {content}
                                                </span>
                                                <div className='flex w-full !mt-4 items-center gap-2'>
                                                    <span className="text-xs text-left">
                                                        {props.containerCategory == 'all' &&
                                                            <>
                                                                {message.category == 'whatsapp' &&
                                                                    <WhatsAppIcon width={`20`} height={`20`} />
                                                                }

                                                                {message.category == 'instagram' &&
                                                                    <InstaIcon width={`20`} height={`20`} />
                                                                }
                                                            </>

                                                        }
                                                    </span>
                                                    <span className="text-xs text-right text-gray-500">
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
                                                <span className="inline-block text-sm">
                                                    {content}
                                                </span>
                                                <div className='flex w-full !mt-4 items-center gap-2'>
                                                    <span className="text-xs text-left">
                                                        {props.containerCategory == 'all' &&
                                                            <>
                                                                {message.category == 'whatsapp' &&
                                                                    <WhatsAppIcon width={`20`} height={`20`} />
                                                                }

                                                                {message.category == 'instagram' &&
                                                                    <InstaIcon width={`20`} height={`20`} />
                                                                }
                                                                {message.category == 'facebook' &&
                                                                    <BsFacebook className="w-5 h-4 fill-current text-indigo-500" />
                                                                }
                                                            </>
                                                        }
                                                    </span>
                                                    <span className="text-xs text-right flex text-gray-500">
                                                        {message.date}
                                                        <span className='!pl-2' id={message.type + key}>
                                                            {(message.status == 'Failed' || message.status == 'FAILED') ?
                                                                <>
                                                                    <ErrorIcon />
                                                                    <UncontrolledPopover
                                                                        placement="top"
                                                                        target={message.type + key}
                                                                        trigger="hover"
                                                                        transition={{ timeout: 150 }}
                                                                    >
                                                                        <PopoverHeader></PopoverHeader>
                                                                        <PopoverBody>
                                                                            {message.error}
                                                                        </PopoverBody>
                                                                    </UncontrolledPopover>
                                                                </>
                                                                : ''
                                                            }
                                                            {(message.status == 'Queued' && message.delivered == 0 && message.read == 0) &&
                                                                <QueueIcon />
                                                            }
                                                            {((message.status == 'Sent' || message.status == 'Send') && message.delivered == 0 && message.read == 0) &&
                                                                <SentIcon />
                                                            }
                                                            {(message.delivered == 1 && message.read == 0) &&
                                                                <DeliveredIcon />
                                                            }
                                                            {(message.read == 1 || message.status == 'Read') &&
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












