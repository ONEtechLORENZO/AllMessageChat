import React, { useEffect, useState, useRef, Fragment } from "react";
import { Head, Link } from "@inertiajs/react";
import MessageList from "./MessageList";
import Authenticated from "../../Layouts/Authenticated";
import ApplicationLogo from "@/Components/ApplicationLogo";
import Dropdown from "@/Components/Dropdown";
import ContactSelection from "@/Components/ContactSelection";
import notie from "notie";
import Filter from "@/Components/Views/List/Filter2";
import { router as Inertia } from "@inertiajs/react";
import nProgress from "nprogress";
import ChatBox from "./ChatBox";
import Axios from "axios";

import {
    EllipsisVerticalIcon,
    ChevronDownIcon,
    MagnifyingGlassIcon,
    Bars3Icon,
    UserIcon,
} from "@heroicons/react/24/outline";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";

import { Menu, Popover, Transition } from "@headlessui/react";

import {
    SmileEmoji,
    AttachIcon,
    WhatsAppIcon,
    NotifiIcon,
    InstaIcon,
    fbIcon,
    SettingIcon,
} from "../icons";

function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
}

const NEW_MESSAGE_LABEL = "New Message";

function ChatList(props) {
    const [selectedContact, setSelectedContact] = useState(
        props.selected_contact,
    );
    const [messages, setMessages] = useState({});
    const [containerCategory, setContainerCategory] = useState(props.category);
    const [showForm, setShowForm] = useState(false);
    const [chatList, setChatList] = useState(props.contact_list);
    const [data, setData] = useState({
        destination: "",
        channel: containerCategory,
        content: "",
    });
    const [selectedAccount, setSelectedAccount] = useState("");
    const [searchKey, setSearchKey] = useState(props.search);
    const channels = {
        all: { label: props.translator["All Channel"], icon: ApplicationLogo },
        whatsapp: { label: "WhatsApp", icon: WhatsAppIcon },
        instagram: { label: "Instagram", icon: InstaIcon },
        facebook: { label: "Facebook", icon: fbIcon },
    };
    const [current_tab, setCurrentTabId] = useState("unread");
    const tabs = [
        {
            name: props.translator["Unread"],
            id: "unread",
            href: "#",
            current: false,
        },
        {
            name: props.translator["All Chats"],
            id: "all",
            href: "#",
            current: false,
        },
        {
            name: props.translator["Archive"],
            id: "archived",
            href: "#",
            current: false,
        },
    ];

    const [time, setTime] = useState(Date.now());
    const accountList = props.account_list;
    const [loadedStory, setLoadedStory] = useState({});
    const selectedConversation = selectedContact
        ? chatList["contact_id_" + selectedContact]
        : null;

    const listRef = useRef(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [pageLoading, setPageLoad] = useState(false);

    useEffect(() => {
        setChatList(props.contact_list);
        const interval = setInterval(() => getMessageList(), 5000);
        return () => {
            clearInterval(interval);
        };
    }, [props]);

    useEffect(() => {
        if (containerCategory !== "instagram" || !selectedContact) {
            return undefined;
        }

        const interval = setInterval(() => {
            Axios.get(
                route("instagram_conversation_messages", {
                    conversation: selectedContact,
                }),
            )
                .then((response) => {
                    setMessages(response.data);
                })
                .catch(() => {});
        }, 20000);

        return () => {
            clearInterval(interval);
        };
    }, [containerCategory, selectedContact, selectedConversation?.id]);

    useEffect(() => {
        if (
            containerCategory !== "instagram" &&
            containerCategory !== "facebook"
        ) {
            return undefined;
        }

        const interval = setInterval(() => {
            fetchContactList(current_tab, 1).then(() => {
                if (selectedContact && containerCategory === "facebook") {
                    getMessageList();
                }
            });
        }, 15000);

        return () => {
            clearInterval(interval);
        };
    }, [containerCategory, current_tab, selectedContact]);

    useEffect(() => {
        if (containerCategory !== "email") {
            return undefined;
        }

        const interval = setInterval(() => {
            fetchContactList(current_tab, 1).then(() => {
                if (selectedContact) {
                    getMessageList();
                }
            });
        }, 15000);

        return () => {
            clearInterval(interval);
        };
    }, [containerCategory, current_tab, selectedContact]);

    useEffect(() => {
        const accountIds = Object.keys(accountList || {});

        if (accountIds.length === 1) {
            setSelectedAccount(accountIds[0]);
            return;
        }

        if (!accountIds.includes(String(selectedAccount))) {
            setSelectedAccount("");
        }
    }, [accountList, selectedAccount]);

    useEffect(() => {
        const conversationAccountId = selectedConversation?.account_id
            ? String(selectedConversation.account_id)
            : "";

        if (
            conversationAccountId &&
            Object.prototype.hasOwnProperty.call(
                accountList || {},
                conversationAccountId,
            )
        ) {
            setSelectedAccount(conversationAccountId);
        }
    }, [accountList, selectedConversation?.account_id]);

    useEffect(() => {
        setData((prevState) => ({
            ...prevState,
            channel: containerCategory,
        }));
    }, [containerCategory]);

    useEffect(() => {
        if (containerCategory !== "email") {
            setData((prevState) => ({
                ...prevState,
                email_subject: "",
            }));
            return;
        }

        setData((prevState) => ({
            ...prevState,
            email_subject:
                selectedConversation?.subject || prevState.email_subject || "",
        }));
    }, [
        containerCategory,
        selectedConversation?.id,
        selectedConversation?.subject,
    ]);

    // Update select contact
    function updateContactData(contact) {
        /*
       // setSelectedContact(contact);
        //getMessageList(contact);
        let newState = Object.assign({}, data);
        newState['destination'] = chatList[contact].number;
        setData(newState);
        */
    }

    // Send Message when press enter
    function handleKeyUp(e) {
        if (e.key == "Enter" && !e.shiftKey && containerCategory) {
            sendMessage();
        }
    }

    // Update content
    function handleChange(e) {
        let newState = Object.assign({}, data);

        if (e.target.type == "file" && e.target.files) {
            newState[e.target.name] = e.target.files[0];
            newState["content"] = e.target.files[0].name;
        } else {
            newState[e.target.name] = e.target.value;
        }

        setData(newState);
    }

    function getContactMessage(contact, channel) {
        setSelectedContact(contact);
        setContainerCategory(channel);
        if (!contact) {
            return false;
        }
        nProgress.start(0.5);
        nProgress.inc(0.2);
        setMessages({});
        var url = route("chat_list", {
            contact_id: contact,
            category: channel,
        });
        if (props.filter_id) {
            url = url + "&filter_id=" + props.filter_id;
        }
        if (current_tab) {
            url += "&mode=" + current_tab;
        }

        var url = route("get_message_list", {
            contact_id: contact,
            category: channel,
            mode: "ajax",
        });
        Axios({
            method: "get",
            url: url,
        }).then((response) => {
            setMessages(response.data);
            nProgress.done();
        });
    }

    function setCurrentTab(tab) {
        setCurrentTabId(tab);
        setSelectedContact("");
        setChatList({});
        fetchContactList();
        setPage(1);
    }

    function selectContactCategory(name) {
        var url = route("chat_list", {
            contact_id: selectedContact,
            category: name,
        });
        if (props.filter_id) {
            url = url + "&filter_id=" + props.filter_id;
        }
        if (current_tab) {
            url += "&mode=" + current_tab;
        }
        Inertia.get(url, {
            onSuccess: (response) => {},
        });
    }

    /**
     * Update Contact list based on the scroll
     */
    useEffect(() => {
        if (page > 1) {
            fetchContactList();
        }
    }, [page]);

    function fetchContactList() {
        setPageLoad(true);
        var url = route("chat_list", { category: containerCategory });
        if (props.filter_id) {
            url = url + "&filter_id=" + props.filter_id;
        }
        if (current_tab) {
            url += "&mode=" + current_tab;
        }
        url += "&fetchContact=true&page=" + page;

        return Axios.get(url).then((response) => {
            if (response.data.status) {
                var mergedList = { ...chatList, ...response.data.contact_list };
                setChatList(mergedList);
                setPageLoad(false);
            }

            return response.data;
        });
    }

    // Auto-select the first contact if none is selected
    useEffect(() => {
        if (!selectedContact && Object.keys(chatList).length > 0) {
            const firstContact = Object.values(chatList)[0];
            setSelectedContact(firstContact.id);
            getContactMessage(firstContact.id, "whatsapp");
        }
    }, [chatList, selectedContact, current_tab]);

    // Return conversation history
    function getMessageList() {
        if (!selectedContact) {
            return false;
        }
        var url = route("get_message_list", {
            contact_id: selectedContact,
            category: containerCategory,
            mode: "ajax",
        });
        Axios({
            method: "get",
            url: url,
        }).then((response) => {
            setMessages(response.data);
        });
    }

    function setArchived(contact) {
        var url = route("set_archive");
        var data = { contact_id: contact };
        Inertia.post(url, data, {
            onSuccess: (response) => {
                //  setChatList(response.props.contact_list);
            },
        });
    }

    /**
     * search contacts based on key
     */
    function handleSearchContact(e) {
        if (e.key === "Enter") {
            var url = route("chat_list", { search: searchKey });
            if (props.filter_id) {
                url = url + "&filter_id=" + props.filter_id;
            }
            if (current_tab) {
                url += "&mode=" + current_tab;
            }
            Inertia.get(url, {
                onSuccess: (response) => {},
            });
        }
    }

    // Send content to selected contact
    function sendMessage() {
        var formData = new FormData();

        if (containerCategory == "all" || !selectedAccount) {
            notie.alert({
                type: "warning",
                text: "Please select the correct account & channel ",
                time: 5,
            });
        }
        var destination = "";
        if (containerCategory == "whatsapp") {
            destination = chatList["contact_id_" + selectedContact].number;
        } else if (containerCategory == "instagram") {
            destination = chatList["contact_id_" + selectedContact].insta_id;
        } else if (containerCategory == "facebook") {
            destination = chatList["contact_id_" + selectedContact].fb_id;
        }

        // Append form data
        formData.append("account_id", selectedAccount);
        formData.append("destination", destination);
        formData.append("channel", data.channel);
        formData.append("content", data.content);
        formData.append("attachment", data.attachment);
        formData.append("template_id", data.template_id);
        formData.append("catalog_id", data.catalog_id);
        formData.append("product_retailer_id", data.product_retailer_id);
        formData.append("template_options", data.template_options);
        formData.append("template_type", data.template_type);

        if (!destination) {
            notie.alert({
                type: "warning",
                text: "There is no destination",
                time: 5,
            });
        }
        if (data.content && destination && selectedAccount) {
            nProgress.start(0.5);
            nProgress.inc(0.2);

            Axios({
                method: "post",
                headers: { "Content-Type": "multipart/form-data" },
                url: route("send_message_to_contact"),
                data: formData,
            }).then((response) => {
                var result = response.data;
                nProgress.done(true);

                if (result.status == "Failed") {
                    notie.alert({ type: "error", text: result.error, time: 5 });
                } else if (
                    result.status == "Queued" ||
                    response.data.status == "Send"
                ) {
                    let newState = Object.assign({}, data);
                    newState["content"] = "";
                    newState["template_id"] = "";
                    newState["attachment"] = "";
                    newState["template_type"] = "";
                    newState["template_options"] = "";
                    setData(newState);
                }

                getMessageList();
            });
        }
    }

    /**
     * Set template data
     *
     * @param {Object} template
     */
    function setTemplateInfo(template) {
        let newState = Object.assign({}, data);
        const isInternalSocialTemplate = ["facebook", "instagram"].includes(
            String(template?.service || "").toLowerCase(),
        );
        newState["content"] = isInternalSocialTemplate
            ? String(template?.body || template?.name || "Template selected")
            : template.name + " template selected ";
        newState["template_id"] = template.template_uid || template.id;
        setData(newState);
    }

    function clearContent() {
        let newState = Object.assign({}, data);
        newState["content"] = "";
        newState["template_id"] = "";
        newState["catalog_id"] = "";
        newState["product_retailer_id"] = "";
        setData(newState);
    }

    function setProductInfo(product) {
        let newState = Object.assign({}, data);
        newState["content"] = product.name + " product selected";
        newState["catalog_id"] = product.catalog_id ? product.catalog_id : "";
        newState["product_retailer_id"] = product.retailer_id
            ? product.retailer_id
            : "";
        setData(newState);
    }

    /**
     * Set interactive message content
     */
    function setInteractiveMessage(interactiveMessage) {
        let newState = Object.assign({}, data);
        newState["content"] = interactiveMessage.content;
        newState["template_options"] = interactiveMessage.options;
        newState["template_type"] = interactiveMessage.option_type;

        setData(newState);
    }

    // Update Page count based on scroll
    const handleScroll = () => {
        const container = listRef.current;
        if (!container || !hasMore) return;

        // Check if scrolled to the bottom
        if (
            container.scrollTop + container.clientHeight >=
            container.scrollHeight
        ) {
            setPage((prevPage) => prevPage + 1);
        }
    };

    var category = containerCategory ? containerCategory : "all";
    const selectedChannel = channels[category];
    const activeContact = selectedContact
        ? chatList["contact_id_" + selectedContact]
        : null;

    return (
        <Authenticated
            auth={props.auth}
            errors={props.errors}
            current_page={"Chats"}
            hidePageTitle
            navigationMenu={props.menuBar}
        >
            <Head title="Chat" />
            <div className="flex h-[calc(100vh-7rem)] min-h-0 flex-col gap-5 overflow-hidden px-4 pb-4 pt-3 xl:flex-row xl:gap-4">
                <div className="h-[34rem] w-full min-h-0 xl:h-full xl:w-[28rem] xl:shrink-0">
                    <div className="flex h-full min-h-0 flex-col rounded-[2rem] bg-[linear-gradient(180deg,rgba(25,7,35,0.98),rgba(13,6,20,0.98))] p-4 text-white shadow-[0_24px_80px_rgba(0,0,0,0.3)]">
                        <div className="flex justify-between items-center p-3 md:hidden">
                            <div>
                                <svg
                                    width={43}
                                    height={46}
                                    viewBox="0 0 43 46"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    xmlnsXlink="http://www.w3.org/1999/xlink"
                                >
                                    <rect
                                        width="42.7131"
                                        height="45.877"
                                        fill="url(#pattern0)"
                                    />
                                    <defs>
                                        <pattern
                                            id="pattern0"
                                            patternContentUnits="objectBoundingBox"
                                            width={1}
                                            height={1}
                                        >
                                            <use
                                                xlinkHref="#image0_269_882"
                                                transform="translate(0 0.0266793) scale(0.00283158 0.0026363)"
                                            />
                                        </pattern>
                                        <image
                                            id="image0_269_882"
                                            width={327}
                                            height={346}
                                            xlinkHref="data:image/png;base64,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"
                                        />
                                    </defs>
                                </svg>
                            </div>
                            <div className="flex gap-2 justify-center items-center">
                                <NotifiIcon />
                                <div className="w-9 h-9 bg-[#9BFFF2] rounded-md">
                                    <Bars3Icon />
                                </div>
                            </div>
                        </div>
                        <div className="mt-2 flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center">
                                <Filter
                                    module="Contact"
                                    filter={props.filter}
                                    translator={props.translator}
                                    is_chat={true}
                                />
                            </div>
                            <div className="relative flex-1">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                    <MagnifyingGlassIcon
                                        className="h-5 w-5 text-white/45"
                                        aria-hidden="true"
                                    />
                                </div>
                                <input
                                    type="text"
                                    value={searchKey}
                                    onChange={(e) =>
                                        setSearchKey(e.target.value)
                                    }
                                    onKeyPress={(e) => handleSearchContact(e)}
                                    className="h-12 w-full rounded-2xl border border-white/7 bg-white/[0.05] pl-12 pr-4 text-sm text-white placeholder-white/45 focus:border-[#BF00FF]/40 focus:ring-[#BF00FF]/40"
                                    placeholder="Search"
                                />
                            </div>
                            <button
                                type="button"
                                className="chat-new-message-button shrink-0 focus:outline-none focus:ring-2 focus:ring-[#BF00FF]/40"
                                onClick={() => setShowForm(true)}
                            >
                                <span className="chat-new-message-button__outline" />
                                <span className="chat-new-message-button__inner" />
                                <span className="chat-new-message-button__state">
                                    <span className="chat-new-message-button__icon">
                                        <PaperAirplaneIcon className="h-4 w-4" />
                                    </span>
                                    <span className="chat-new-message-button__label">
                                        {NEW_MESSAGE_LABEL.split("").map(
                                            (char, index) => (
                                                <span
                                                    key={`${char}-${index}`}
                                                    style={{ "--i": index }}
                                                    className="chat-new-message-button__letter"
                                                >
                                                    {char === " "
                                                        ? "\u00A0"
                                                        : char}
                                                </span>
                                            ),
                                        )}
                                    </span>
                                </span>
                            </button>
                        </div>
                        <div className="mt-4 overflow-hidden rounded-[1.55rem] bg-[linear-gradient(180deg,rgba(29,9,41,0.98),rgba(22,8,31,0.94))] shadow-[0_18px_40px_rgba(0,0,0,0.28)] ring-1 ring-white/5">
                            <div>
                                <nav
                                    className="grid grid-cols-3 gap-0"
                                    aria-label="Tabs"
                                >
                                    {tabs.map((tab) => (
                                        <button
                                            key={tab.name}
                                            type="button"
                                            onClick={() =>
                                                setCurrentTab(tab.id)
                                            }
                                            className={classNames(
                                                tab.id == current_tab
                                                    ? "bg-[linear-gradient(135deg,rgba(255,79,216,0.34),rgba(163,30,255,0.32))] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_12px_30px_rgba(127,0,190,0.22)]"
                                                    : "text-white/72 hover:bg-white/[0.04] hover:text-white",
                                                "flex min-h-[4.35rem] flex-col justify-center px-5 py-2.5 text-left transition first:rounded-l-[1.55rem] last:rounded-r-[1.55rem]",
                                            )}
                                        >
                                            <span className="text-[0.9rem] font-semibold leading-tight">
                                                {tab.name}
                                            </span>
                                            <span className="mt-1.5 text-[0.8rem] font-medium text-white/50">
                                                {props.counts[tab.id]}
                                            </span>
                                        </button>
                                    ))}
                                </nav>
                            </div>
                        </div>
                        <nav
                            className="mt-4 flex-1 min-h-0"
                            aria-label="Directory"
                        >
                            <div className="relative h-full min-h-0 overflow-hidden rounded-[1.75rem] bg-white/[0.03] shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
                                <ul
                                    role="list"
                                    className="contact-list-scrollbar relative z-0 h-full overflow-y-auto divide-y divide-white/8 px-0 pr-2"
                                    ref={listRef}
                                    onScroll={handleScroll}
                                >
                                    {Object.entries(chatList).map(
                                        ([id, person], j) => (
                                            <li key={id}>
                                                <div
                                                    className={classNames(
                                                        "group relative flex w-full items-center gap-3 px-6 py-4 transition hover:bg-white/[0.04] focus-within:ring-2 focus-within:ring-inset focus-within:ring-[#BF00FF]/40",
                                                        selectedContact ==
                                                            person.id
                                                            ? "bg-[linear-gradient(135deg,rgba(163,30,255,0.16),rgba(255,79,216,0.08))] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
                                                            : "",
                                                    )}
                                                >
                                                    <div className="flex-shrink-0">
                                                        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[linear-gradient(180deg,rgba(255,255,255,0.10),rgba(255,255,255,0.04))] text-white/80 shadow-[0_8px_20px_rgba(0,0,0,0.18)]">
                                                            <UserIcon className="h-6 w-6" />
                                                        </span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                getContactMessage(
                                                                    person.id,
                                                                    person.channel,
                                                                )
                                                            }
                                                            className="focus:outline-none"
                                                        >
                                                            {/* Extend touch target to entire panel */}
                                                            <span
                                                                className="absolute inset-0"
                                                                aria-hidden="true"
                                                            />
                                                            <span className="flex items-start text-sm font-semibold text-white transition-colors group-hover:text-[#ff7de5]">
                                                                {person &&
                                                                person.name ? (
                                                                    <>
                                                                        {
                                                                            person.name
                                                                        }
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        {
                                                                            person.number
                                                                        }
                                                                    </>
                                                                )}
                                                            </span>
                                                            <span className="flex items-start truncate text-sm text-white/45">
                                                                {person.number}
                                                            </span>
                                                        </button>
                                                    </div>
                                                    <div
                                                        className="cursor-pointer"
                                                        ype="button"
                                                        //  onClick={() => getcategoryContacts()}
                                                    >
                                                        <Dropdown>
                                                            <Dropdown.Trigger>
                                                                <span className="inline-flex rounded-md">
                                                                    <button type="button">
                                                                        <EllipsisVerticalIcon className="h-4 w-4 text-white/45" />
                                                                    </button>
                                                                </span>
                                                            </Dropdown.Trigger>

                                                            <Dropdown.Content
                                                                align="right"
                                                                contentClasses="py-1 bg-white w-64 shadow-md"
                                                            >
                                                                <ul
                                                                    role="list"
                                                                    className="divide-y divide-gray-200 overflow-y-auto m-h-64 !pl-0"
                                                                >
                                                                    <li
                                                                        onClick={() =>
                                                                            setArchived(
                                                                                person.id,
                                                                            )
                                                                        }
                                                                        className={
                                                                            "px-4 py-2 text-gray-900 text-sm hover:bg-sky-700 cursor-pointer "
                                                                        }
                                                                    >
                                                                        {current_tab ==
                                                                        "archived" ? (
                                                                            <>
                                                                                {" "}
                                                                                Unarchive{" "}
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                Archive
                                                                            </>
                                                                        )}
                                                                    </li>
                                                                </ul>
                                                            </Dropdown.Content>
                                                        </Dropdown>
                                                    </div>
                                                </div>
                                            </li>
                                        ),
                                    )}
                                    {Object.entries(chatList).length == 0 && (
                                        <li>
                                            <div className="flex items-center justify-center px-6 py-8 text-center text-sm text-white/45">
                                                {
                                                    props.translator[
                                                        "Conversation not start yet."
                                                    ]
                                                }
                                            </div>
                                        </li>
                                    )}
                                </ul>
                                {pageLoading && (
                                    <div className="flex justify-center py-4">
                                        <div className="flex space-x-2 animate-pulse">
                                            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                                            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                                            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </nav>
                    </div>
                </div>
                <div className="min-h-0 flex-1 overflow-hidden">
                    <div className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)_auto] gap-4 overflow-hidden">
                        {selectedContact &&
                            chatList["contact_id_" + selectedContact] && (
                                <>
                                    <div className="relative z-30 grid grid-cols-1 gap-3 overflow-visible lg:grid-cols-[minmax(0,1fr)_auto_auto]">
                                        <div className="flex min-h-[5.25rem] items-center gap-4 rounded-[1.85rem] bg-[linear-gradient(135deg,rgba(26,10,38,0.98),rgba(11,8,18,0.98))] px-5 text-white shadow-[0_24px_80px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.06)] ring-1 ring-[#8f38d9]/18">
                                            <div className="relative flex items-center space-x-2">
                                                <div className="flex gap-1">
                                                    <div className="relative">
                                                        <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,115,226,0.35),rgba(147,51,234,0.22)_55%,rgba(255,255,255,0.02)_100%)] text-white shadow-[0_12px_30px_rgba(127,0,190,0.28),inset_0_1px_0_rgba(255,255,255,0.14)] ring-1 ring-white/8">
                                                            <UserIcon className="h-7 w-7" />
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col leading-tight">
                                                    <div className="mt-1 flex items-center text-sm font-semibold">
                                                        <span className="mr-3 text-white">
                                                            <Link
                                                                href={route(
                                                                    "detailContact",
                                                                    {
                                                                        id: selectedContact,
                                                                    },
                                                                )}
                                                                className="cursor-pointer text-lg font-semibold text-white no-underline drop-shadow-[0_1px_10px_rgba(0,0,0,0.32)] hover:text-[#ff92eb]"
                                                            >
                                                                {activeContact.number ||
                                                                    activeContact.name}
                                                            </Link>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 rounded-[1rem] bg-[#09070d] px-2.5 text-white shadow-[0_18px_48px_rgba(0,0,0,0.26)]">
                                            <Menu as="div" className="relative">
                                                <div>
                                                    <Menu.Button className="flex min-h-[3.35rem] min-w-[6.35rem] items-center justify-between gap-2 text-[0.88rem] text-white/90 focus:outline-none">
                                                        <div className="flex items-center gap-2">
                                                            <selectedChannel.icon className="h-4.5 w-4.5 fill-current text-white" />
                                                            <span className="font-medium">
                                                                {
                                                                    selectedChannel.label
                                                                }
                                                            </span>
                                                        </div>
                                                        <ChevronDownIcon className="h-3 w-3 text-white/60" />
                                                    </Menu.Button>
                                                </div>
                                                <Transition
                                                    as={Fragment}
                                                    enter="transition ease-out duration-100"
                                                    enterFrom="transform opacity-0 scale-95"
                                                    enterTo="transform opacity-100 scale-100"
                                                    leave="transition ease-in duration-75"
                                                    leaveFrom="transform opacity-100 scale-100"
                                                    leaveTo="transform opacity-0 scale-95"
                                                >
                                                    <Menu.Items className="origin-top-right absolute right-0 z-40 mt-2 min-w-[180px] rounded-[1.2rem] bg-[linear-gradient(180deg,rgba(26,10,38,0.98),rgba(11,8,18,0.98))] p-1.5 shadow-[0_22px_60px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.06)] ring-1 ring-[#8f38d9]/20 focus:outline-none">
                                                        {Object.entries(
                                                            channels,
                                                        ).map(
                                                            ([
                                                                name,
                                                                channel,
                                                            ]) => (
                                                                <Menu.Item
                                                                    key={name}
                                                                >
                                                                    <div
                                                                        className={classNames(
                                                                            containerCategory ==
                                                                                name
                                                                                ? "bg-[linear-gradient(135deg,rgba(255,79,216,0.24),rgba(163,30,255,0.2))] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                                                                                : "",
                                                                            "rounded-[0.95rem] px-3 py-2.5 flex items-center gap-2 transition hover:bg-white/[0.06]",
                                                                        )}
                                                                    >
                                                                        <channel.icon className="w-5 h-5 fill-current text-white/75" />
                                                                        <button
                                                                            onClick={() =>
                                                                                selectContactCategory(
                                                                                    name,
                                                                                )
                                                                            }
                                                                            type={
                                                                                "button"
                                                                            }
                                                                            className="block py-1 text-sm text-white/85 hover:text-white w-full text-left"
                                                                        >
                                                                            {
                                                                                channel.label
                                                                            }
                                                                        </button>
                                                                    </div>
                                                                </Menu.Item>
                                                            ),
                                                        )}
                                                    </Menu.Items>
                                                </Transition>
                                            </Menu>
                                        </div>

                                        <div className="flex items-center gap-2 rounded-[1rem] bg-[#09070d] px-2.5 text-white shadow-[0_18px_48px_rgba(0,0,0,0.26)]">
                                            <Menu as="div" className="relative">
                                                <div>
                                                    <Menu.Button className="flex min-h-[3.35rem] min-w-[6.55rem] items-center justify-between text-[0.88rem] text-white/90 focus:outline-none">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium uppercase tracking-[0.04em]">
                                                                {selectedAccount ? (
                                                                    <>
                                                                        {
                                                                            accountList[
                                                                                selectedAccount
                                                                            ]
                                                                        }
                                                                    </>
                                                                ) : (
                                                                    "AESSEFIN"
                                                                )}
                                                            </span>
                                                            {containerCategory ==
                                                                "whatsapp" &&
                                                                selectedAccount &&
                                                                selectedContact && (
                                                                    <>
                                                                        {props
                                                                            .sessions[
                                                                            selectedContact
                                                                        ] &&
                                                                        props
                                                                            .sessions[
                                                                            selectedContact
                                                                        ][
                                                                            selectedAccount
                                                                        ] ? (
                                                                            <span
                                                                                title="Session active"
                                                                                className="rounded-full p-1 bg-green-500"
                                                                            ></span>
                                                                        ) : (
                                                                            <span
                                                                                title="Session inactive"
                                                                                className="rounded-full p-1 bg-red-500"
                                                                            ></span>
                                                                        )}
                                                                    </>
                                                                )}
                                                            <span className="ml-1">
                                                                <ChevronDownIcon className="h-3 w-3 text-white/60" />
                                                            </span>
                                                        </div>
                                                    </Menu.Button>
                                                </div>
                                                <Transition
                                                    as={Fragment}
                                                    enter="transition ease-out duration-100"
                                                    enterFrom="transform opacity-0 scale-95"
                                                    enterTo="transform opacity-100 scale-100"
                                                    leave="transition ease-in duration-75"
                                                    leaveFrom="transform opacity-100 scale-100"
                                                    leaveTo="transform opacity-0 scale-95"
                                                >
                                                    <Menu.Items className="origin-top-right absolute right-0 z-40 mt-2 min-w-[220px] rounded-[1.2rem] bg-[linear-gradient(180deg,rgba(26,10,38,0.98),rgba(11,8,18,0.98))] p-1.5 shadow-[0_22px_60px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.06)] ring-1 ring-[#8f38d9]/20 focus:outline-none">
                                                        {Object.entries(
                                                            accountList,
                                                        ).map(([id, name]) => (
                                                            <Menu.Item key={id}>
                                                                <div
                                                                    className={classNames(
                                                                        selectedAccount ==
                                                                            id
                                                                            ? "bg-[linear-gradient(135deg,rgba(255,79,216,0.24),rgba(163,30,255,0.2))] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                                                                            : "",
                                                                        "rounded-[0.95rem] px-3 py-2.5 flex items-center gap-2 transition hover:bg-white/[0.06]",
                                                                    )}
                                                                >
                                                                    <span
                                                                        onClick={() =>
                                                                            setSelectedAccount(
                                                                                id,
                                                                            )
                                                                        }
                                                                        className="block text-sm text-white/85 hover:text-white w-full cursor-pointer"
                                                                    >
                                                                        {name}
                                                                    </span>

                                                                    {containerCategory ==
                                                                        "whatsapp" &&
                                                                        selectedContact &&
                                                                        selectedContact && (
                                                                            <>
                                                                                {props
                                                                                    .sessions[
                                                                                    selectedContact
                                                                                ] &&
                                                                                props
                                                                                    .sessions[
                                                                                    selectedContact
                                                                                ][
                                                                                    id
                                                                                ] ? (
                                                                                    <span
                                                                                        title="Session active"
                                                                                        className="rounded-full p-1 bg-green-500"
                                                                                    ></span>
                                                                                ) : (
                                                                                    <span
                                                                                        title="Session inactive"
                                                                                        className="rounded-full p-1 bg-red-500"
                                                                                    ></span>
                                                                                )}
                                                                            </>
                                                                        )}
                                                                </div>
                                                            </Menu.Item>
                                                        ))}
                                                    </Menu.Items>
                                                </Transition>
                                            </Menu>
                                        </div>
                                    </div>
                                    <div className="min-h-0 overflow-hidden rounded-[2rem] bg-[linear-gradient(180deg,rgba(8,7,11,0.98),rgba(6,5,10,0.98))] p-4 shadow-[0_28px_90px_rgba(0,0,0,0.34)]">
                                        <MessageList
                                            messages={messages}
                                            containerCategory={
                                                containerCategory
                                            }
                                            loadedStory={loadedStory}
                                            setLoadedStory={setLoadedStory}
                                        />
                                    </div>

                                    <div className="shrink-0">
                                        <ChatBox
                                            handleChange={handleChange}
                                            handleKeyUp={handleKeyUp}
                                            templates={props.templates}
                                            products={props.products}
                                            interactiveMessages={
                                                props.interactiveMessages
                                            }
                                            setTemplateInfo={setTemplateInfo}
                                            selectedAccount={selectedAccount}
                                            clearContent={clearContent}
                                            setProductInfo={setProductInfo}
                                            setInteractiveMessage={
                                                setInteractiveMessage
                                            }
                                            containerCategory={
                                                containerCategory
                                            }
                                            data={data}
                                            sendMessage={sendMessage}
                                            logo={
                                                activeContact
                                                    ? activeContact.name.substring(
                                                          0,
                                                          2,
                                                      )
                                                    : ""
                                            }
                                        />
                                        {/* 
                                <div className="flex gap-4 items-end">
                                    <div className="flex flex-col gap-1 ">
                                        <div className="flex rounded-md bg-white h-7 w-7 justify-center items-center cursor-pointer">
                                            <SmileEmoji />
                                        </div>
                                        <div className="flex rounded-md bg-white h-7 w-7 justify-center items-center cursor-pointer">
                                           
                                            <Popover className="relative">
                                                <Popover.Button>
                                                    <AttachIcon />
                                                </Popover.Button>
                                                <Popover.Panel className="absolute z-10">
                                                    <div className="flex justify-center">
                                                        <input 
                                                            type={'file'} 
                                                            name="attachment" 
                                                            onChange={(e) => handleChange(e)} 
                                                        />
                                                    </div>
                                                </Popover.Panel>
                                            </Popover>
                                        </div>
                                    </div>

                                    <div className="relative flex flex-1">
                                        <input
                                            type="text"
                                            onChange={(e) => handleChange(e)}
                                            onKeyUp={(e) => handleKeyUp(e)}
                                            name="content"
                                            value={data.content}
                                            placeholder={props.translator['Write your message!']}
                                            className="w-full focus:outline-none border-0 focus:placeholder-gray-400 text-gray-600 placeholder-gray-600 pl-3 bg-white rounded-2xl rounded-br-none py-3"
                                        />
                                        <div className="absolute right-0 items-center inset-y-0 hidden sm:flex">
                                            <button
                                                type="button"
                                                onClick={sendMessage}
                                                className={classNames(
                                                    (containerCategory ==  'all' || !selectedAccount )
                                                        ? 'text-[#d5aff0]'
                                                        : 'text-[#A31EFF]',
                                                        "inline-flex items-center justify-center rounded-lg px-4 py-3 transition duration-500 ease-in-out focus:outline-none"
                                                )}
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                    className="h-6 w-6 ml-2 transform rotate-90"
                                                >
                                                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-1 ">
                                       
                                        <div className="flex rounded-md bg-white h-7 w-7 justify-center items-center cursor-pointer">
                                         
                                            <Popover className="relative">
                                                <Popover.Button>
                                                    <ChevronDownIcon className={open ? 'rotate-180 transform w-5 h-5' : 'w-5 h-5'} />
                                                </Popover.Button>
                                                <Popover.Panel className="absolute z-10">
                                                    <div className="flex justify-center">
                                                        <ul className="bg-[#0f0a14] rounded-lg border-0 w-96 text-white/90">
                                                            {props.templates && Object.entries(props.templates).map(([key, template]) => {
                                                                if(template.account_id != selectedAccount) {
                                                                    return false;
                                                                }
                                                                return(
                                                                    <li className="px-6 py-2 rounded-b-lg" onClick={()=> setTemplateInfo(template)}> {template.name} </li>
                                                                )
                                                            })}
                                                        </ul>
                                                    </div>
                                                </Popover.Panel>
                                            </Popover>
                                        </div>
                                    </div>
                                </div>
                                 */}
                                    </div>
                                </>
                            )}
                    </div>
                </div>
            </div>
            {showForm ? (
                <ContactSelection
                    setShowForm={setShowForm}
                    parent_module="Chat"
                    {...props}
                />
            ) : (
                ""
            )}
        </Authenticated>
    );
}

export default ChatList;
