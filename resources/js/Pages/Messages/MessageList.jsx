import React, { useEffect, useRef } from "react";
import ReactAudioPlayer from "react-audio-player";
import {
    WhatsAppIcon,
    InstaIcon,
    EmailIcon,
    ErrorIcon,
    QueueIcon,
    SentIcon,
    DeliveredIcon,
    ReadIcon,
} from "../icons";

import StoryContent from "./StoryContent";
import { BsFacebook } from "react-icons/bs";
import { PopoverHeader, PopoverBody, UncontrolledPopover } from "reactstrap";

function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
}

export default function MessageList(props) {
    const messageContainerRef = useRef(null);
    const shouldStickToBottomRef = useRef(true);
    const pendingInitialScrollRef = useRef(true);
    const messageEntries = Object.entries(props.messages ?? {});
    const displayEntries = messageEntries;
    const lastMessageKey = messageEntries.length
        ? messageEntries[messageEntries.length - 1][0]
        : null;

    const scrollToBottom = () => {
        if (!messageContainerRef.current) {
            return;
        }

        messageContainerRef.current.scrollTop =
            messageContainerRef.current.scrollHeight;
    };

    useEffect(() => {
        pendingInitialScrollRef.current = true;
        shouldStickToBottomRef.current = true;
    }, [props.selectedContact]);

    useEffect(() => {
        if (!displayEntries.length) {
            return undefined;
        }

        if (
            !pendingInitialScrollRef.current &&
            !shouldStickToBottomRef.current
        ) {
            return undefined;
        }

        const frame = window.requestAnimationFrame(() => {
            scrollToBottom();
            pendingInitialScrollRef.current = false;
        });

        return () => window.cancelAnimationFrame(frame);
    }, [lastMessageKey, displayEntries.length, props.selectedContact]);

    function handleScroll() {
        if (!messageContainerRef.current) {
            return;
        }

        const { scrollTop, clientHeight, scrollHeight } =
            messageContainerRef.current;

        shouldStickToBottomRef.current =
            scrollTop + clientHeight >= scrollHeight - 24;
    }

    function renderChannelIcon(category) {
        if (props.containerCategory !== "all") {
            return null;
        }

        switch (category) {
            case "whatsapp":
                return <WhatsAppIcon width="20" height="20" />;
            case "instagram":
                return <InstaIcon width="20" height="20" />;
            case "facebook":
                return (
                    <BsFacebook className="w-5 h-4 fill-current text-indigo-500" />
                );
            case "email":
                return <EmailIcon width="20" height="20" />;
            default:
                return null;
        }
    }

    function renderOutgoingStatus(message, key) {
        if (message.category === "email") {
            return null;
        }

        return (
            <span className="!pl-2" id={message.type + key}>
                {(message.status == "Failed" || message.status == "FAILED") && (
                    <>
                        <ErrorIcon />
                        <UncontrolledPopover
                            placement="top"
                            target={message.type + key}
                            trigger="hover"
                            transition={{ timeout: 150 }}
                        >
                            <PopoverHeader></PopoverHeader>
                            <PopoverBody>{message.error}</PopoverBody>
                        </UncontrolledPopover>
                    </>
                )}
                {message.status == "Queued" &&
                    message.delivered == 0 &&
                    message.read == 0 && <QueueIcon />}
                {(message.status == "Sent" || message.status == "Send") &&
                    message.delivered == 0 &&
                    message.read == 0 && <SentIcon />}
                {message.delivered == 1 && message.read == 0 && (
                    <DeliveredIcon />
                )}
                {(message.read == 1 || message.status == "Read") && (
                    <ReadIcon />
                )}
            </span>
        );
    }

    function renderEmailCard(message, key, content) {
        const isIncoming = message.mode == "incoming";
        const subject = message.email_subject || "(no subject)";

        return (
            <div
                key={key}
                className={classNames(
                    "flex w-full",
                    isIncoming ? "justify-start" : "justify-end",
                )}
            >
                <article
                    className={classNames(
                        "w-full max-w-[38rem] overflow-hidden rounded-[20px] shadow-[0_14px_28px_rgba(0,0,0,0.16)] transition",
                        isIncoming
                            ? "bg-[#15111b]"
                            : "bg-[linear-gradient(180deg,rgba(163,30,255,0.12),rgba(24,12,31,0.98))]",
                    )}
                >
                    <div className="flex flex-col gap-2 px-4 py-2.5 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/28">
                                Subject
                            </div>
                            <div className="mt-1 truncate text-sm font-semibold text-white">
                                {subject}
                            </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-2 text-xs text-white/42">
                            <span>{message.date}</span>
                            {!isIncoming && (
                                <span className="rounded-full bg-[#A31EFF]/16 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/72">
                                    {message.status || "Sent"}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="px-4 py-3 text-sm leading-6 text-white/88">
                        <div className="whitespace-pre-wrap break-words">
                            {content || (
                                <span className="text-white/35">
                                    Empty email body
                                </span>
                            )}
                        </div>
                    </div>
                </article>
            </div>
        );
    }

    return (
        <div
            id="messages"
            ref={messageContainerRef}
            onScroll={handleScroll}
            className={classNames(
                "flex-col flex-1 min-h-0 overflow-y-auto rounded-2xl p-3 scrolling-touch",
                props.containerCategory === "email"
                    ? "space-y-3 bg-[#0d0b12] px-4 py-4"
                    : "chat-pattern-bg justify-end space-y-4 bg-[#0b0b10]",
            )}
        >
            {displayEntries.map(([key, message]) => {
                let content = message.content;
                const mediaClass = "object-contain h-48 w-96";
                const bubbleMaxWidth =
                    message.category === "email" ? "max-w-2xl" : "max-w-xs";

                switch (message.type) {
                    case "image":
                        content = (
                            <div>
                                <img src={message.path} className={mediaClass} />
                                {content}
                            </div>
                        );
                        break;

                    case "video":
                        content = (
                            <div>
                                <video
                                    src={message.path}
                                    autoPlay
                                    loop
                                    muted
                                    className={mediaClass}
                                />
                                {content}
                            </div>
                        );
                        break;

                    case "audio":
                        content = (
                            <div>
                                <ReactAudioPlayer src={message.path} controls />
                                {content}
                            </div>
                        );
                        break;

                    case "application":
                        content = (
                            <div>
                                <a href={message.path}>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-14 w-14"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                        />
                                    </svg>
                                </a>
                                {message.content}
                            </div>
                        );
                        break;

                    case "story":
                        content = (
                            <StoryContent
                                data={message}
                                className={mediaClass}
                                loadedStory={props.loadedStory}
                                setLoadedStory={props.setLoadedStory}
                            />
                        );
                        break;
                }

                if (message.category === "email") {
                    return renderEmailCard(message, key, content);
                }

                if (message.mode == "incoming") {
                    return (
                        <div key={key} className="chat-message">
                            <div className="flex items-end">
                                <div
                                    className={`flex flex-col space-y-2 text-sm ${bubbleMaxWidth} mx-2 order-2 items-start`}
                                >
                                    <div className="text-white/90 px-4 py-2 rounded-2xl rounded-bl-none bg-white/5">
                                        <span className="inline-block text-sm whitespace-pre-wrap break-words">
                                            {content}
                                        </span>
                                        <div className="flex w-full !mt-4 items-center gap-2">
                                            <span className="text-xs text-left">
                                                {renderChannelIcon(
                                                    message.category,
                                                )}
                                            </span>
                                            <span className="text-xs text-right text-white/50">
                                                {message.date}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                }

                return (
                    <div key={key} className="chat-message">
                        <div className="flex items-end justify-end">
                            <div
                                className={`flex flex-col space-y-2 text-sm ${bubbleMaxWidth} mx-2 order-1 items-end`}
                            >
                                <div className="text-white/90 px-4 py-2 rounded-2xl rounded-bl-none bg-[#A31EFF]/15">
                                    <span className="inline-block text-sm whitespace-pre-wrap break-words">
                                        {content}
                                    </span>
                                    <div className="flex w-full !mt-4 items-center gap-2">
                                        <span className="text-xs text-left">
                                            {renderChannelIcon(
                                                message.category,
                                            )}
                                        </span>
                                        <span className="text-xs text-right flex text-white/50">
                                            {message.date}
                                            {renderOutgoingStatus(
                                                message,
                                                key,
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
