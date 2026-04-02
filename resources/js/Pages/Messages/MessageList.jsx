import React, { useEffect, useRef, useState } from 'react';
import ReactAudioPlayer from 'react-audio-player';
import {
    WhatsAppIcon,
    InstaIcon,
    ErrorIcon,
    QueueIcon,
    SentIcon,
    DeliveredIcon,
    ReadIcon,
    EmailIcon,
} from "../icons";

import StoryContent from './StoryContent';
import { BsFacebook, BsInstagram } from "react-icons/bs";
import { PopoverHeader, PopoverBody, UncontrolledPopover } from "reactstrap";

export default function MessageList(props) {
    const messagesContainerRef = useRef(null);

    function isImageFile(value) {
        if (!value || typeof value !== "string") return false;
        const lower = value.toLowerCase();
        return (
            lower.startsWith("data:image/") ||
            /\.(png|jpe?g|gif|webp|bmp|svg)$/.test(lower)
        );
    }

    function resolveEmailImageUrl(message) {
        if (!message || message.category !== "email") return "";
        const path = typeof message.path === "string" ? message.path.trim() : "";
        if (path && isImageFile(path)) {
            return path;
        }
        const content = typeof message.content === "string" ? message.content.trim() : "";
        if (!content || !isImageFile(content)) {
            return "";
        }
        if (/^https?:\/\//i.test(content) || content.startsWith("data:image/")) {
            return content;
        }
        return `/uploads/sent_files/${encodeURIComponent(content)}`;
    }

    function isLikelyFileName(value) {
        if (!value || typeof value !== "string") return false;
        const lower = value.toLowerCase();
        return /\.(pdf|docx?|xlsx?|pptx?|csv|txt|zip|rar|7z|mp3|mp4|mov|avi|mkv|html?)$/.test(lower);
    }

    function resolveEmailFileUrl(message) {
        if (!message || message.category !== "email") return "";
        const path = typeof message.path === "string" ? message.path.trim() : "";
        if (path) return path;
        const content = typeof message.content === "string" ? message.content.trim() : "";
        if (!content || !isLikelyFileName(content)) return "";
        if (/^https?:\/\//i.test(content)) return content;
        return `/uploads/sent_files/${encodeURIComponent(content)}`;
    }

    function CardPreview({ card }) {
        if (!card) return null;
        const buttons = Array.isArray(card.buttons) ? card.buttons : [];
        return (
            <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white text-black shadow-[0_18px_48px_rgba(0,0,0,0.22)]">
                {card.image_url ? (
                    <img
                        src={card.image_url}
                        alt={card.title || "Card image"}
                        className="h-40 w-full object-cover"
                    />
                ) : null}
                <div className="px-4 py-3">
                    <div className="text-sm font-semibold">{card.title}</div>
                    {card.subtitle ? (
                        <div className="text-xs text-black/60">{card.subtitle}</div>
                    ) : null}
                </div>
                {buttons.length > 0 ? (
                    <div className="border-t border-black/10">
                        {buttons.map((button, index) => (
                            <div
                                key={`${button.title || "btn"}-${index}`}
                                className="px-4 py-2 text-center text-sm font-medium text-black/80"
                                style={{
                                    borderTop:
                                        index === 0 ? "none" : "1px solid rgba(0,0,0,0.08)",
                                }}
                            >
                                {button.title || button.payload || "Action"}
                            </div>
                        ))}
                    </div>
                ) : null}
            </div>
        );
    }

    function CarouselPreview({ cards }) {
        const safeCards = Array.isArray(cards) ? cards.filter(Boolean) : [];
        const [index, setIndex] = useState(0);

        if (safeCards.length === 0) {
            return null;
        }

        const current = safeCards[index] || safeCards[0];
        const canPrev = index > 0;
        const canNext = index < safeCards.length - 1;

        return (
            <div className="relative w-full max-w-sm">
                <CardPreview card={current} />
                <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2">
                    <button
                        type="button"
                        onClick={() => setIndex((prev) => Math.max(0, prev - 1))}
                        disabled={!canPrev}
                        className={`pointer-events-auto inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white transition ${
                            canPrev ? "hover:bg-black/60" : "opacity-40"
                        }`}
                        aria-label="Previous card"
                    >
                        {"<"}
                    </button>
                    <button
                        type="button"
                        onClick={() => setIndex((prev) => Math.min(safeCards.length - 1, prev + 1))}
                        disabled={!canNext}
                        className={`pointer-events-auto inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white transition ${
                            canNext ? "hover:bg-black/60" : "opacity-40"
                        }`}
                        aria-label="Next card"
                    >
                        {">"}
                    </button>
                </div>
                <div className="mt-2 text-center text-xs text-white/60">
                    {index + 1} / {safeCards.length}
                </div>
            </div>
        );
    }

    function renderFacebookTemplate(payload) {
        if (!payload || typeof payload !== "object") {
            return null;
        }

        const type = payload.type;
        if (type === "carousel") {
            return <CarouselPreview cards={payload.cards} />;
        }

        if (type === "card") {
            return <CardPreview card={payload} />;
        }

        if (type === "media") {
            return payload.media_url ? (
                <img
                    src={payload.media_url}
                    alt="Media"
                    className="h-40 w-full max-w-sm rounded-2xl object-cover"
                />
            ) : null;
        }

        if (type === "text") {
            return payload.body || null;
        }

        return null;
    }

    useEffect(() => {
        if (!messagesContainerRef.current) {
            return;
        }

        messagesContainerRef.current.scrollTop =
            messagesContainerRef.current.scrollHeight;
    }, [props.messages, props.containerCategory]);

    return (
        <>
            <div className="chat-pattern-bg relative flex h-full min-h-0 flex-col overflow-hidden rounded-[2rem] bg-[#0a0810]">
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    {props.containerCategory === "facebook" ? (
                        <BsFacebook
                            className="h-[21rem] w-[21rem] opacity-[0.09] blur-[0.2px] md:h-[29rem] md:w-[29rem]"
                            style={{ color: "#1877F2" }}
                        />
                    ) : props.containerCategory === "instagram" ? (
                        <BsInstagram
                            className="h-[21rem] w-[21rem] opacity-[0.09] blur-[0.2px] md:h-[29rem] md:w-[29rem]"
                            style={{ color: "#E1306C" }}
                        />
                    ) : props.containerCategory === "email" ? (
                        <EmailIcon
                            width="420"
                            height="420"
                            className="opacity-[0.04] blur-[1px]"
                            style={{ color: "#FA3C16" }}
                        />
                    ) : (
                        <svg
                            viewBox="0 0 24 24"
                            className="h-[21rem] w-[21rem] opacity-[0.11] blur-[0.2px] md:h-[29rem] md:w-[29rem]"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M20.3 7.5875C18.6125 5.9 16.3625 5 14 5C9.05 5 5 9.05 5 14C5 15.575 5.45001 17.15 6.23751 18.5L5 23L9.72501 21.7625C11.075 22.4375 12.5375 22.8875 14 22.8875C18.95 22.8875 23 18.8375 23 13.8875C23 11.525 21.9875 9.275 20.3 7.5875ZM14 21.425C12.65 21.425 11.3 21.0875 10.175 20.4125L9.94999 20.3L7.13749 21.0875L7.92501 18.3875L7.69999 18.05C6.91249 16.8125 6.57499 15.4625 6.57499 14.1125C6.57499 10.0625 9.95 6.6875 14 6.6875C16.025 6.6875 17.825 7.475 19.2875 8.825C20.75 10.2875 21.425 12.0875 21.425 14.1125C21.425 18.05 18.1625 21.425 14 21.425ZM18.05 15.8C17.825 15.6875 16.7 15.125 16.475 15.125C16.25 15.0125 16.1375 15.0125 16.025 15.2375C15.9125 15.4625 15.4625 15.9125 15.35 16.1375C15.2375 16.25 15.125 16.25 14.9 16.25C14.675 16.1375 14 15.9125 13.1 15.125C12.425 14.5625 11.975 13.775 11.8625 13.55C11.75 13.325 11.8625 13.2125 11.975 13.1C12.0875 12.9875 12.2 12.875 12.3125 12.7625C12.425 12.65 12.425 12.5375 12.5375 12.425C12.65 12.3125 12.5375 12.2 12.5375 12.0875C12.5375 11.975 12.0875 10.85 11.8625 10.4C11.75 10.0625 11.525 10.0625 11.4125 10.0625C11.3 10.0625 11.1875 10.0625 10.9625 10.0625C10.85 10.0625 10.625 10.0625 10.4 10.2875C10.175 10.5125 9.61251 11.075 9.61251 12.2C9.61251 13.325 10.4 14.3375 10.5125 14.5625C10.625 14.675 12.0875 17.0375 14.3375 17.9375C16.25 18.725 16.5875 18.5 17.0375 18.5C17.4875 18.5 18.3875 17.9375 18.5 17.4875C18.725 16.925 18.725 16.475 18.6125 16.475C18.5 15.9125 18.275 15.9125 18.05 15.8Z"
                                fill="url(#chatWhatsappTheme)"
                            />
                            <defs>
                                <linearGradient id="chatWhatsappTheme" x1="5" y1="5" x2="23" y2="23" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#25D366" />
                                    <stop offset="1" stopColor="#128C7E" />
                                </linearGradient>
                            </defs>
                        </svg>
                    )}
                </div>
                <div
                    id="messages"
                    ref={messagesContainerRef}
                    className="chat-message-scrollbar relative z-10 flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 py-6 pr-3"
                    style={{ scrollbarGutter: "stable both-edges" }}
                >
                    <div className="flex min-h-full flex-col justify-end gap-4">
                    {Object.entries(props.messages).map(([key, message], j) => {
                    var content = message.content;
                    var mediaClass = "object-contain h-48 w-96";
                    var templateContent = null;
                    var emailImageUrl = resolveEmailImageUrl(message);
                    var messageType = String(message.type || "").toLowerCase();
                    var emailFileUrl = resolveEmailFileUrl(message);

                    if (
                        (message.category === "facebook" || message.category === "instagram")
                        && message.template_payload
                    ) {
                        templateContent = renderFacebookTemplate(message.template_payload);
                        if (templateContent) {
                            content = templateContent;
                        }
                    }
                    if (
                        message.category === "email"
                        && emailImageUrl
                        && !templateContent
                        && !message.path
                    ) {
                        content = (
                            <div className=" ">
                                <img
                                    src={emailImageUrl}
                                    alt={message.content || "Email image"}
                                    className={mediaClass}
                                />
                                {message.content}
                            </div>
                        );
                    }
                    if (
                        message.category === "email"
                        && !emailImageUrl
                        && emailFileUrl
                        && !templateContent
                        && !message.path
                    ) {
                        content = (
                            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        className="h-5 w-5 text-white/80"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 3v5h5" />
                                    </svg>
                                </div>
                                <div className="min-w-0">
                                    <a href={emailFileUrl} className="block truncate text-sm font-semibold text-white/90">
                                        {message.content || "Attachment"}
                                    </a>
                                    <div className="text-xs text-white/50">File attachment</div>
                                </div>
                            </div>
                        );
                    }
                    switch (messageType) {
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
                            if (message.category === "email" && emailImageUrl) {
                                content = (
                                    <div className=" ">
                                        <img
                                            src={emailImageUrl}
                                            alt={message.content || "Email image"}
                                            className={mediaClass}
                                        />
                                        {message.content}
                                    </div>
                                );
                            } else if (message.category === "email" && emailFileUrl) {
                                content = (
                                    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                className="h-5 w-5 text-white/80"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M14 3v5h5" />
                                            </svg>
                                        </div>
                                        <div className="min-w-0">
                                            <a href={emailFileUrl} className="block truncate text-sm font-semibold text-white/90">
                                                {message.content || "Attachment"}
                                            </a>
                                            <div className="text-xs text-white/50">File attachment</div>
                                        </div>
                                    </div>
                                );
                            } else {
                                content = <div className=" ">
                                    <a href={message.path} >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </a>
                                    {message.content}
                                </div>;
                            }
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
                                            <div className="order-2 mx-2 flex max-w-[min(30rem,78%)] flex-col space-y-2 text-sm items-start">
                                            <div className="rounded-[1.5rem] rounded-bl-md bg-white/[0.04] px-4 py-3 text-white/90 shadow-[0_18px_50px_rgba(0,0,0,0.24)]">
                                                    {templateContent ? (
                                                        <div className="w-full">
                                                            {content}
                                                        </div>
                                                    ) : (
                                                        <span className="inline-block text-sm">
                                                            {content}
                                                        </span>
                                                    )}
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
                                                        <span className="text-xs text-right text-white/50">
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
                                            <div className="order-1 mx-2 flex max-w-[min(32rem,78%)] flex-col space-y-2 text-sm items-end">
                                                <div className="rounded-[1.5rem] rounded-br-md bg-[linear-gradient(135deg,rgba(163,30,255,0.28),rgba(255,59,194,0.16))] px-4 py-3 text-white/90 shadow-[0_20px_60px_rgba(127,0,190,0.18)]">
                                                    {templateContent ? (
                                                        <div className="w-full">
                                                            {content}
                                                        </div>
                                                    ) : (
                                                        <span className="inline-block text-sm">
                                                            {content}
                                                        </span>
                                                    )}
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
                                                        <span className="text-xs text-right flex text-white/50">
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
                </div>
            </div>
        </>
    );
}











