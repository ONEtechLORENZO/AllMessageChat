import React, { useState, Fragment, useEffect, useMemo } from "react";
import ApplicationLogo from "@/Components/ApplicationLogo";
import Dropdown from "@/Components/Dropdown";
import ResponsiveNavLink from "@/Components/ResponsiveNavLink";
import { Link, router as Inertia, usePage } from "@inertiajs/react";
import { Dialog, Transition } from "@headlessui/react";
import UserRegistration from "@/Components/UserRegistration";
import nProgress from "nprogress";
import { Container, Row, Col, List } from "reactstrap";
import Form from "@/Components/Forms/Form";

import {
    Button,
    FormGroup,
    Label,
    Input,
    FormText,
    Card,
    CardBody,
    CardTitle,
} from "reactstrap";

import {
    HomeIcon,
    UserIcon,
    BriefcaseIcon,
    UsersIcon,
    UserGroupIcon,
    XMarkIcon,
    Bars3Icon as IconMenu,
    AdjustmentsHorizontalIcon,
    Cog6ToothIcon,
    PlusCircleIcon,
    ChartBarIcon,
    Squares2X2Icon,
    QuestionMarkCircleIcon,
    LightBulbIcon,
    PlusIcon,
    ShoppingCartIcon,
    CodeBracketIcon,
} from "@heroicons/react/24/outline";
import { createTranslator, getLocale, setLocale } from "@/i18n/translator";

import { CurrencyDollarIcon } from "@heroicons/react/24/solid";
import axios from "axios";
import Notification from "./Notification";
import CommandAssistant from "@/Components/Assistant/CommandAssistant";
import notie from "notie";
import { BsCaretDownFill, BsCaretUpFill } from "react-icons/bs";

import {
    DashboardIcon,
    ChatNewIcon,
    CampaignsIcon,
    BillingIcon,
    Setting2Icon,
    NetworkIcon,
    GraphIcon,
} from "@/Pages/icons";

const navigation = [
    {
        name: "Dashboard",
        href: route("dashboard"),
        icon: DashboardIcon,
        show: ["all"],
    },
    {
        name: "Conversation",
        href: "#",
        icon: ChatNewIcon,
        show: ["all"],
        subMenu: [
            {
                name: "Chats",
                href: route("chat_list"),
            },
            {
                name: "Templates",
                href: route("account_templates"),
            },
            {
                name: "Interactive Messages",
                href: route("listInteractiveMessage"),
            },
            {
                name: "Campaigns",
                href: route("listCampaign"),
            },
            {
                name: "Contacts",
                href: route("listContact"),
            },
        ],
    },
    {
        name: "Reports",
        href: route("listMessage"),
        icon: GraphIcon,
        show: ["all"],
    },
];

// const navigation = [
//     {
//         name: "Home",
//         href: route("home"),
//         icon: HomeIcon,
//         show: ['all'],
//     },
//     {
//         name: "Social Channels",
//         href: route("dashboard"),
//         icon: BuildingOfficeIcon,
//         show: ['all'],
//     },
//     {
//         name: "API keys",
//         href: route("listApi"),
//         icon: ChipIcon,
//         show: ['all'],
//     },
//     {
//         name: "Reports",
//         href: route("listMessage"),
//         icon: ChatBubbleLeftRightIcon,
//         show: ['all'],
//     },
// ];

const bottomNavigation = [
    {
        name: "Billing",
        href: route("wallet"),
        icon: BillingIcon,
        show: ["all"],
    },
    {
        name: "API Documentation",
        href: route("api_documentation"),
        icon: CodeBracketIcon,
        show: ["all"],
    },
    {
        name: "Roles",
        href: route("listRole"),
        icon: AdjustmentsHorizontalIcon,
        show: ["admin", "global_admin"],
    },
    {
        name: "Settings",
        href: route("wallet_subscription"),
        icon: Setting2Icon,
        show: ["admin", "global_admin"],
    },
];
const adminNavigation = [
    {
        name: "Dashboard",
        href: route("dashboard"),
        icon: DashboardIcon,
        show: ["global_admin"],
    },
    {
        name: "Customers",
        href: "#",
        icon: UsersIcon,
        show: ["global_admin"],
        subMenu: [
            {
                name: "Workspaces",
                href: route("listCompany"),
            },
            {
                name: "Social profiles",
                href: route("listAccount"),
            },
            {
                name: "Users",
                href: route("list_global_user"),
            },
        ],
    },
    {
        name: "Notifications",
        href: "#",
        icon: LightBulbIcon,
        show: ["global_admin"],
        subMenu: [
            {
                name: "Emails",
                href: "#",
            },
            {
                name: "Push",
                href: "#",
            },
            {
                name: "Notifications Log",
                href: "#",
            },
        ],
    },
    {
        name: "Billing",
        href: "#",
        icon: CurrencyDollarIcon,
        show: ["global_admin"],
        subMenu: [
            {
                name: "Plans",
                href: route("listPlan"),
            },
            {
                name: "Pricing",
                href: route("listPrice"),
            },
            {
                name: "Addons",
                href: route("listPrice"),
            },
        ],
    },
    {
        name: "Roles",
        href: "#",
        icon: UserGroupIcon,
        show: ["global_admin"],
        subMenu: [
            {
                name: "Workspace Roles & Permissions",
                href: "#",
            },
            {
                name: "Superadmin Roles & Permissions",
                href: "#",
            },
        ],
    },
    // {
    //     name: "Activities",
    //     href: route("worksapce_activities"),
    //     icon: ChartSquareBarIcon,
    //     show: ['global_admin'],
    // },
    {
        name: "Support Requests",
        href: route("list_global_SupportRequest"),
        icon: QuestionMarkCircleIcon,
        show: ["global_admin"],
    },
];

const menuBar = [
    {
        name: "Dashboard",
        href: route("dashboard"),
        icon: Squares2X2Icon,
    },
    {
        name: "Conversations",
        href: "#",
        icon: ChatNewIcon,
        subMenu: [
            {
                name: "Social Profiles",
                href: route("social_profile"),
            },
            {
                name: "Chats",
                href: route("chat_list"),
            },
            {
                name: "Templates",
                href: route("account_templates"),
            },
            {
                name: "Interactive Messages",
                href: route("listInteractiveMessage"),
            },
            {
                name: "Campaigns",
                href: route("listCampaign"),
            },
        ],
    },
    {
        name: "Reports",
        href: route("listMessage"),
        icon: ChartBarIcon,
    },
];

function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
}

function isMenuItemActive(itemName, currentPage) {
    if (itemName === "Reports" && currentPage === "Message Logs") {
        return true;
    }

    return itemName === currentPage;
}

function NavItem({
    icon: Icon,
    label,
    href,
    active,
    compact,
    rightSlot,
    preserveState,
    onClick,
}) {
    return (
        <Link
            href={href}
            preserveState={preserveState}
            onClick={onClick}
            className={[
                "group flex items-center gap-3 rounded-2xl px-3.5 py-2.5 no-underline hover:no-underline focus:outline-none focus-visible:outline-none",
                "transition-colors duration-200",
                active
                    ? compact
                        ? "bg-transparent"
                        : "bg-[linear-gradient(90deg,rgba(191,0,255,0.18),rgba(88,28,135,0.14))] border-0 ring-0"
                    : "bg-transparent hover:bg-white/[0.03]",
            ].join(" ")}
        >
            <div
                className={[
                    "h-10 w-10 shrink-0 rounded-2xl flex items-center justify-center",
                    "transition-transform duration-200",
                    active
                        ? "bg-[linear-gradient(135deg,rgba(191,0,255,0.42),rgba(88,28,135,0.55))]"
                        : "bg-[linear-gradient(135deg,rgba(191,0,255,0.18),rgba(88,28,135,0.24))] group-hover:bg-[linear-gradient(135deg,rgba(191,0,255,0.28),rgba(88,28,135,0.34))]",
                    "group-hover:scale-110",
                ].join(" ")}
            >
                <Icon
                    className={[
                        "h-5 w-5 transition-colors duration-200",
                        active
                            ? "text-white"
                            : "text-white/70 group-hover:text-white",
                    ].join(" ")}
                />
            </div>

            {!compact && (
                <div className="min-w-0 flex-1">
                    <div
                        className={[
                            "text-sm font-semibold truncate",
                            active
                                ? "text-white"
                                : "text-white/70 group-hover:text-white",
                        ].join(" ")}
                    >
                        {label}
                    </div>
                </div>
            )}

            {!compact && rightSlot ? (
                <div className="ml-auto shrink-0 flex items-center">
                    {rightSlot}
                </div>
            ) : null}
        </Link>
    );
}

export default function Authenticated({
    auth,
    header,
    children,
    hideHeader,
    current_page,
    hidePageTitle,
    pageTitle,
    message,
    navigationMenu,
    fullHeight = false,
}) {
    const { props: pageProps } = usePage();
    const [locale, setLocaleState] = useState(pageProps?.locale ?? getLocale());
    const translator = useMemo(
        () => createTranslator(pageProps?.translator ?? {}, locale),
        [pageProps?.translator, locale],
    );
    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showSidebarText, setShowSidebarText] = useState(true);
    const [showAdminNav, setshowAdminNav] = useState(false);
    const [returnMainUser, setReturnMainUser] = useState(false);
    const [companyName, setcompanyName] = useState();
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    const [menuDropdownActive, setMenuDropdownActive] = useState({});
    const [notifications, setNotifications] = useState();
    const [timezone, setTimezone] = useState([]);
    const [showModal, setshowModal] = useState(false);
    const [count, setCount] = useState();
    const [id, setId] = useState();
    const [companyList, setCompany] = useState({});
    const [adminMenuText, setadminMenuText] = useState("Global Admin page");
    const [navigateField, setNavigateField] = useState();
    const pathname = window.location.pathname;
    const resolvedPageTitle =
        pageTitle ??
        current_page ??
        pageProps?.current_page ??
        pageProps?.plural ??
        null;
    const translatedPageTitle = resolvedPageTitle
        ? (translator[resolvedPageTitle] ?? resolvedPageTitle)
        : null;
    const showPageTitle = hidePageTitle !== true && !!translatedPageTitle;

    const [showWorkspaceForm, setShowWorkspaceForm] = useState(false);
    const [navigationMenuBar, setNavigationMenuBar] = useState(navigationMenu);

    function hideForm() {
        setShowWorkspaceForm(false);
    }

    useEffect(() => {
        //getTimezones();
        //getNotifications();
        //getNavigationfield();
        // axios.get(route('get_session_value')).then((response) => {
        //     if(response.data.session_value){
        //         setReturnMainUser(response.data.session_value);
        //     }
        // });
        checkInformation();
        defaultOpenNavigationBar();
        getCompanyDetail();
        if (message) alertMessage(message);
        if (!navigationMenu) fetchMenuBar();
    }, []);

    useEffect(() => {
        const handleMouseMove = (event) => {
            setMousePosition({ x: event.clientX, y: event.clientY });
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    useEffect(() => {
        if (pathname.includes("admin/")) {
            setshowAdminNav(true);
            setadminMenuText("Go to Dashboard");
        }
    }, [pathname]);

    function getCompanyDetail() {
        axios.get(route("CurrentCompany")).then((response) => {
            if (response.data) {
                setcompanyName(response.data.currentCompany.name);
            }
        });
    }

    function defaultOpenNavigationBar() {
        menuBar.map((menu) => {
            if (menu.hasOwnProperty("subMenu")) {
                menu.subMenu.map((sub) => {
                    if (sub.name == current_page) {
                        let defaultOpen = {};
                        defaultOpen[menu.name] = true;
                        setMenuDropdownActive(defaultOpen);
                    }
                });
            }
        });
    }

    function checkInformation() {
        let url = route("check_information");

        axios.get(url).then((response) => {
            if (!response.data.information) {
                Inertia.post(
                    route("onBoarding"),
                    {},
                    {
                        onSuccess: (response) => {},
                    },
                );
            }
        });
    }

    function fetchMenuBar() {
        let url = route("sub_menu");

        axios.get(url).then((response) => {
            if (response.data.status === true) {
                setNavigationMenuBar(response.data.menu);
            }
        });
    }

    function alertMessage(message) {
        notie.alert({ type: "warning", text: message, time: 5 });
    }

    function getNavigationfield() {
        axios.get(route("navigation_field")).then((response) => {
            setNavigateField(response.data.navigate);
        });
    }

    function drownDownToggleAction(e, item) {
        e.preventDefault();
        e.stopPropagation();
        e.nativeEvent?.stopImmediatePropagation?.();

        if (!item?.subMenu?.length) return;

        setMenuDropdownActive((prev) => ({
            ...prev,
            [item.name]: !prev?.[item.name],
        }));
    }

    function setImpersonate() {
        var data = {
            user_id: returnMainUser,
        };
        Inertia.post(route("set_global_user"), data, {
            onSuccess: (response) => {},
            onError: (errors) => {
                setErrors(errors);
            },
        });
    }

    function getNotifications() {
        var url = route("notification");
        axios.get(url).then((response) => {
            setCount(response.data.count);
            setNotifications(response.data.notifications);
            setId(response.data.id);
        });
    }

    function getTimezones() {
        var url = route("get_time_zone");
        axios.get(url).then((response) => {
            setTimezone(response.data.time_zone);
        });
    }

    function notificationClick() {
        var url = route("clickNotification") + "?id=" + id;
        axios.get(url).then((response) => {});
    }

    function showadminpage(e) {
        if (adminMenuText == "Global Admin page") {
            Inertia.visit(route("list_global_user"));
        } else {
            Inertia.visit(route("dashboard"));
        }
        e.preventDefault();
    }

    function showMore() {
        var url = route("showMore");
        axios.get(url).then((response) => {
            setCount(response.data.count);
            setId(response.data.id);

            let newState = Object.assign({}, notifications);
            newState = { ...newState, ...response.data.notifications };
            setNotifications(newState);
        });
    }

    const language = (locale ?? "en").toUpperCase();

    function handleLocaleChange(eventOrValue) {
        const nextLocale =
            typeof eventOrValue === "string"
                ? eventOrValue
                : eventOrValue?.target?.value;

        if (!nextLocale) return;
        setLocale(nextLocale);
        setLocaleState(nextLocale);
        window.location.reload();
    }

    function setLanguage(nextLanguage) {
        handleLocaleChange(nextLanguage.toLowerCase());
    }

    const resolvedNavigationMenuBar = navigationMenuBar
        ? { ...navigationMenuBar }
        : null;

    if (resolvedNavigationMenuBar) {
        menuBar.forEach((item) => {
            const legacyMenuState =
                item.name === "Reports" && resolvedNavigationMenuBar.Messages
                    ? resolvedNavigationMenuBar.Messages
                    : null;

            if (!resolvedNavigationMenuBar[item.name]) {
                const submenu = item.subMenu
                    ? Object.fromEntries(
                          item.subMenu.map((sub) => [sub.name, true]),
                      )
                    : {};
                resolvedNavigationMenuBar[item.name] = legacyMenuState ?? {
                    show: true,
                    submenu,
                };
            } else if (item.subMenu && resolvedNavigationMenuBar[item.name]) {
                const existingSubmenu =
                    resolvedNavigationMenuBar[item.name].submenu ?? {};
                item.subMenu.forEach((sub) => {
                    if (
                        !Object.prototype.hasOwnProperty.call(
                            existingSubmenu,
                            sub.name,
                        )
                    ) {
                        existingSubmenu[sub.name] = true;
                    }
                });
                resolvedNavigationMenuBar[item.name] = {
                    ...resolvedNavigationMenuBar[item.name],
                    submenu: existingSubmenu,
                };
            }
        });
    }

    const menuOrder = resolvedNavigationMenuBar
        ? [
              ...menuBar.map((item) => item.name),
              ...Object.keys(resolvedNavigationMenuBar).filter(
                  (name) => !menuBar.some((item) => item.name === name),
              ),
          ]
        : [];

    return (
        <>
            <div className="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-gray-100 hidden">
                <div className="sm:max-w-md w-full p-2 flex justify-center items-center flex-col">
                    <img src="/img/OneMessage.ChatLOGO.png" />
                    <h1 className="text-xl font-bold !mt-6">
                        Sign up to the power
                    </h1>

                    <div className="w-full !mt-6 space-y-2 ">
                        <FormGroup>
                            <Label for="exampleEmail">E-mail</Label>
                            <Input
                                type="email"
                                name="email"
                                id="exampleEmail"
                                placeholder="example@email.com"
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label for="exampleEmail">Password</Label>
                            <Input
                                type="password"
                                name="password"
                                id="password"
                                placeholder="Password"
                            />
                        </FormGroup>

                        <div className="flex flex-col items-center">
                            <Button className="!bg-[#363740] !px-8 !py-2">
                                Sign up
                            </Button>
                        </div>

                        <div className="!mt-8 relative">
                            <hr />
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-4 bg-gray-100 text-[#7E7F8C] font-semibold text-base">
                                or
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-white !mt-10">
                            <button
                                type="button"
                                className="inline-flex bg-white rounded text-center text-[#7E7F8C] justify-center items-center drop-shadow !py-3 !gap-3 !text-semibold "
                            >
                                <img
                                    src="/img/google-logo.png"
                                    alt="google logo"
                                />
                                Sign up with Google
                            </button>
                            <button
                                type="button"
                                className="inline-flex bg-[#3B5998] rounded text-center  text-white justify-center !py-3 !gap-3  text-semibold"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width={18}
                                    height={19}
                                    fill="none"
                                >
                                    <path
                                        fill="#fff"
                                        d="M18 9.94C18 4.939 13.97.885 9 .885S0 4.939 0 9.94c0 4.52 3.291 8.266 7.594 8.945v-6.328H5.309V9.94h2.285V7.945c0-2.27 1.343-3.523 3.4-3.523.984 0 2.014.177 2.014.177v2.228h-1.135c-1.118 0-1.467.698-1.467 1.414V9.94h2.496l-.399 2.617h-2.097v6.328C14.71 18.205 18 14.459 18 9.94Z"
                                    />
                                </svg>
                                Sign up with Facebook
                            </button>
                        </div>

                        <p className="font-semibold !mt-8 pt-1 mb-0 w-full text-center text-base">
                            Already have an account?
                            <a
                                href="#!"
                                className="text-[#363740] transition duration-200 ease-in-out"
                            >
                                log in
                            </a>
                        </p>
                    </div>
                </div>
            </div>

            <div className="authenticated-shell min-h-screen bg-black text-white relative overflow-x-hidden flex font-sans selection:bg-[#38bdf8]/30">
                {/* Tech grid background with spotlight effect */}
                <div
                    className="fixed inset-0 opacity-40 transition-opacity duration-1000 pointer-events-none"
                    style={{
                        backgroundSize: "50px 50px",
                        backgroundImage:
                            "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
                        maskImage: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, black 0%, transparent 70%)`,
                        WebkitMaskImage: `radial-gradient(1000px circle at ${mousePosition.x}px ${mousePosition.y}px, black 0%, transparent 80%)`,
                    }}
                    aria-hidden="true"
                />

                {/* Animated orbs / glows */}
                <div
                    className="fixed inset-0 pointer-events-none overflow-hidden"
                    aria-hidden="true"
                >
                    <div
                        className="absolute h-[650px] w-[650px] rounded-full bg-[#BF00FF] opacity-[0.08] mix-blend-screen blur-[130px] transition-transform duration-700 ease-out"
                        style={{
                            top: "5%",
                            left: "10%",
                            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
                        }}
                    />
                    <div
                        className="absolute h-[650px] w-[650px] rounded-full bg-[#BF00FF] opacity-[0.08] mix-blend-screen blur-[140px] transition-transform duration-700 ease-out"
                        style={{
                            bottom: "5%",
                            right: "10%",
                            transform: `translate(${mousePosition.x * -0.02}px, ${mousePosition.y * -0.02}px)`,
                        }}
                    />
                    <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[420px] w-[900px] rounded-full bg-white/5 blur-[120px] opacity-40" />
                </div>
                <div
                    className="purple-giant-arc platform-purple-arc"
                    aria-hidden="true"
                />
                <Transition.Root show={sidebarOpen} as={Fragment}>
                    <Dialog
                        as="div"
                        className="relative z-40 md:hidden"
                        onClose={setSidebarOpen}
                    >
                        <Transition.Child
                            as={Fragment}
                            enter="transition-opacity ease-linear duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="transition-opacity ease-linear duration-300"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="fixed inset-0 bg-black/80" />
                        </Transition.Child>

                        <div className="fixed inset-0 flex z-40">
                            <Transition.Child
                                as={Fragment}
                                enter="transition ease-in-out duration-300 transform"
                                enterFrom="-translate-x-full"
                                enterTo="translate-x-0"
                                leave="transition ease-in-out duration-300 transform"
                                leaveFrom="translate-x-0"
                                leaveTo="-translate-x-full"
                            >
                                <Dialog.Panel className="relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-white/[0.02] border-r border-white/10 backdrop-blur-3xl text-white">
                                    <Transition.Child
                                        as={Fragment}
                                        enter="ease-in-out duration-300"
                                        enterFrom="opacity-0"
                                        enterTo="opacity-100"
                                        leave="ease-in-out duration-300"
                                        leaveFrom="opacity-100"
                                        leaveTo="opacity-0"
                                    >
                                        <div className="absolute top-0 right-0 -mr-12 pt-2">
                                            <button
                                                type="button"
                                                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                                                onClick={() =>
                                                    setSidebarOpen(false)
                                                }
                                            >
                                                <span className="sr-only">
                                                    Close sidebar
                                                </span>
                                                <XMarkIcon
                                                    className="h-6 w-6 text-white"
                                                    aria-hidden="true"
                                                />
                                            </button>
                                        </div>
                                    </Transition.Child>
                                    <div className="flex-shrink-0 flex items-center px-6">
                                        {/* <ApplicationLogo className="block h-9 w-auto text-gray-500" /> */}
                                        <Link
                                            href="/"
                                            className="flex items-center gap-3 select-none"
                                        >
                                            <img
                                                src="/img/logo-boost.svg"
                                                className="h-10 w-auto select-none opacity-90"
                                                alt="Logo"
                                                draggable="false"
                                            />
                                        </Link>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>

                            <div
                                className="flex-shrink-0 w-14"
                                aria-hidden="true"
                            >
                                {/* Dummy element to force sidebar to shrink to fit close icon */}
                            </div>
                        </div>
                    </Dialog>
                </Transition.Root>

                {/* Main Layout Container */}
                <div className="relative z-10 flex h-screen w-full overflow-hidden">
                    {/* Sidebar */}
                    <aside
                        className={[
                            "hidden md:flex flex-col",
                            showSidebarText ? "w-72" : "w-[86px]",
                            "transition-all duration-300",
                            "border-r border-white/10 bg-white/[0.02] backdrop-blur-3xl sticky top-0 h-screen overflow-y-auto",
                        ].join(" ")}
                    >
                        <div className="px-6 py-6 flex items-center justify-between">
                            <Link
                                href="/"
                                className="flex items-center gap-3 select-none"
                            >
                                <img
                                    src="/img/logo-boost.svg"
                                    alt="Allmessage Chat"
                                    className="h-10 w-auto select-none opacity-90 hover:opacity-100 transition-opacity"
                                    draggable="false"
                                />
                            </Link>

                            <button
                                onClick={() => setShowSidebarText((v) => !v)}
                                className="rounded-xl bg-white/[0.02] hover:bg-white/[0.05] px-3 py-2 transition-all duration-300 hover:scale-110 active:scale-90"
                                aria-label={
                                    translator["Toggle sidebar"] ??
                                    "Toggle sidebar"
                                }
                            >
                                <IconMenu className="h-5 w-5 text-white/70" />
                            </button>
                        </div>

                        <nav className="px-6 pb-6 space-y-2 gio-navbar">
                            <ul className="list-none !pl-0 space-y-2">
                                {/* {showAdminNav ?                                                     
                                        adminNavigation.map((item,index) => {
                                            if(!item.show.includes('all') && !item.show.includes(auth.user.role)) {
                                                
                                                return;
                                            }
                                            return (
                                                    
                                                <li data-index={index}  onClick={(e)=>{drownDownToggleAction(e,item)}}>
                                                    <Link
                                                        preserveState
                                                        key={item.name}
                                                        href={item.href}
                                                        className={classNames(
                                                            (item.name == current_page)
                                                                ? "text-white  bg-primary"                                                    
                                                                :"text-[#3D4459] group-hover:text-white  group-hover:bg-primary",
                                                                "group flex items-center px-2 py-2 text-sm font-medium rounded-md gio-menu-item justify-center"
                                                        )}                                                
                                                    >
                                                        <item.icon
                                                            className={classNames(
                                                                (item.name == current_page)
                                                                    ? "text-white  bg-primary"
                                                                    : "text-[#3D4459] group-hover:text-white  group-hover:bg-primary",
                                                                " flex-shrink-0 h-6 w-6"
                                                                
                                                            )}
                                                            
                                                            aria-hidden="true"
                                                        
                                                        />
                                                        {showSidebarText ? <div data-index={index} className="flex ml-3 justify-between items-center flex-1">{item.name} {item.subMenu ? <ChevronDownIcon data-index={index} className={` ${(menuDropdownActive[item.name] ? 'rotate-180' : '')} h-6 w-6 gio-dropdown-icon  transition-all`} /> : '' }  </div>: ""}
                                                    </Link>
                                                    { showSidebarText && menuDropdownActive[item.name] == true && item.subMenu ?
                                                        <ul>
                                                            {item.subMenu.map( (subItem, index) => {
                                                                if(!navigateField.hasOwnProperty(subItem.name)) {
                                                                    return (
                                                                        <li>
                                                                            <Link className={classNames("text-[#3D4459] hover:text-white  hover:bg-primary","group flex items-center px-2 py-1 text-sm font-medium rounded-md gio-menu-item")} href={subItem.href}>{subItem.name}</Link>
                                                                        </li> 
                                                                    );
                                                                }
                                                            }
                                                        </ul> 
                                                    : '' }
                                                </li>
                                            );
                                        })
                                        :
                                        navigation.map((item,index) => {
                                            // if(!item.show.includes('all') && !item.show.includes(auth.user.role)) {
                                            //     return;
                                            // }
                                            // if(navigateField && navigateField.hasOwnProperty(item.name)){
                                            //     return;
                                            // }
                                        
                                            // return (
                                            //     <li data-index={index}  onClick={(e)=>{drownDownToggleAction(e,item)}}>
                                            //         <Link
                                            //             preserveState
                                            //             key={item.name}
                                            //             href={item.href}
                                            //             className={classNames(
                                            //                 (item.name == current_page)
                                            //                     ? "text-white  bg-primary"                                                    
                                            //                     :"text-[#3D4459] hover:text-white  hover:bg-primary",
                                            //                     "group flex items-center px-2 py-2 text-sm font-medium rounded-md gio-menu-item justify-center"
                                            //             )}                                                
                                            //         >
                                            //             <item.icon
                                            //                 className={classNames(
                                            //                     (item.name == current_page)
                                            //                         ? "text-white  bg-primary"
                                            //                         : "text-[#3D4459] group-hover:text-white  group-hover:bg-primary",
                                            //                     "flex-shrink-0 h-6 w-6"
                                                                
                                            //                 )}
                                                            
                                            //                 aria-hidden="true"
                                                        
                                            //             />

                                            //             {showSidebarText ? <div data-index={index} className="flex ml-3 justify-between items-center flex-1">{item.name} {item.subMenu ? <ChevronDownIcon data-index={index} className={` ${(menuDropdownActive[item.name] ? 'rotate-180' : '')} h-6 w-6 gio-dropdown-icon  transition-all`} /> : '' }  </div>: ""}
                                            //         </Link>
                                            //         {
                                            //             showSidebarText && menuDropdownActive[item.name] == true && item.subMenu ?

                                            //             <ul>
                                            //                 {item.subMenu.map( (subItem, index) => {
                                            //                     if(!navigateField.hasOwnProperty(subItem.name)) {
                                            //                         return (
                                            //                             <li>
                                            //                                 <Link className={classNames("text-[#3D4459] hover:text-white  hover:bg-primary","group flex items-center px-2 py-1 text-sm font-medium rounded-md gio-menu-item justify-center")} href={subItem.href}>{subItem.name}</Link>
                                            //                             </li> 
                                            //                         );
                                            //                     }
                                            //                 })}
                                            //             </ul> : ''
                                            //         }
                                            //     </li>
                                            // );
                                        })  
                                    } */}
                                {resolvedNavigationMenuBar &&
                                    menuOrder.map((header) => {
                                        const navigator =
                                            resolvedNavigationMenuBar[header];
                                        // find matching menu item
                                        const item = menuBar.find(
                                            (m) => m.name === header,
                                        );

                                        // if no item or not allowed -> render nothing
                                        if (!item || !navigator?.show)
                                            return null;

                                        const isOpen =
                                            !!menuDropdownActive[item.name];
                                        const hasSubMenu =
                                            Array.isArray(item.subMenu) &&
                                            item.subMenu.length > 0;
                                        const canRenderSubMenu =
                                            showSidebarText &&
                                            isOpen &&
                                            navigator?.submenu &&
                                            hasSubMenu;
                                        const isActive =
                                            isMenuItemActive(
                                                item.name,
                                                current_page,
                                            ) ||
                                            (hasSubMenu &&
                                                item.subMenu.some(
                                                    (subItem) =>
                                                        subItem.name ===
                                                        current_page,
                                                ));

                                        return (
                                            <li key={header}>
                                                <NavItem
                                                    icon={item.icon}
                                                    label={
                                                        translator[item.name] ??
                                                        item.name
                                                    }
                                                    href={item.href}
                                                    active={isActive}
                                                    compact={!showSidebarText}
                                                    preserveState
                                                    onClick={
                                                        hasSubMenu
                                                            ? (e) =>
                                                                  drownDownToggleAction(
                                                                      e,
                                                                      item,
                                                                  )
                                                            : undefined
                                                    }
                                                    rightSlot={
                                                        hasSubMenu ? (
                                                            <BsCaretDownFill
                                                                className={classNames(
                                                                    isOpen
                                                                        ? "rotate-180"
                                                                        : "",
                                                                    "h-3 w-3 text-white/40 group-hover:text-white/70 transition-transform",
                                                                )}
                                                            />
                                                        ) : null
                                                    }
                                                />

                                                {canRenderSubMenu && (
                                                    <ul className="list-none mt-2 space-y-1 !pl-14">
                                                        {item.subMenu.map(
                                                            (subItem) => {
                                                                if (
                                                                    !navigator.submenu.hasOwnProperty(
                                                                        subItem.name,
                                                                    )
                                                                )
                                                                    return null;

                                                                return (
                                                                    <li
                                                                        key={`${header}-${subItem.name}`}
                                                                    >
                                                                        <Link
                                                                            href={
                                                                                subItem.href
                                                                            }
                                                                            className={classNames(
                                                                                subItem.name ===
                                                                                    current_page
                                                                                    ? "text-white bg-white/[0.05]"
                                                                                    : "text-white/50 hover:text-white hover:bg-white/[0.04]",
                                                                                "block rounded-xl px-3 py-2 text-sm transition no-underline hover:no-underline",
                                                                            )}
                                                                        >
                                                                            {translator[
                                                                                subItem
                                                                                    .name
                                                                            ] ??
                                                                                subItem.name}
                                                                        </Link>
                                                                    </li>
                                                                );
                                                            },
                                                        )}
                                                    </ul>
                                                )}
                                            </li>
                                        );
                                    })}

                                <li>
                                    <div className="h-px bg-white/10 my-3" />
                                </li>

                                {bottomNavigation.map((item) => {
                                    if (
                                        !item.show.includes("all") &&
                                        !item.show.includes(auth.user.role)
                                    ) {
                                        return null;
                                    }

                                    const isActive = isMenuItemActive(
                                        item.name,
                                        current_page,
                                    );

                                    return (
                                        <li key={item.name}>
                                            <NavItem
                                                icon={item.icon}
                                                label={
                                                    translator[item.name] ??
                                                    item.name
                                                }
                                                href={item.href}
                                                active={isActive}
                                                compact={!showSidebarText}
                                                preserveState
                                            />
                                        </li>
                                    );
                                })}
                            </ul>
                        </nav>
                    </aside>

                    {/* Content Area */}
                    <main className="flex-1 min-w-0 flex h-screen flex-col overflow-y-auto">
                        {hideHeader !== true ? (
                            <header className="sticky top-0 z-20 border-b border-white/10 bg-black/40 backdrop-blur-2xl">
                                <nav>
                                    <div className="px-4 md:px-8 py-3 flex items-center justify-between">
                                        <div className="flex items-center gap-4 min-w-0">
                                            <button
                                                onClick={() =>
                                                    setSidebarOpen((v) => !v)
                                                }
                                                className="rounded-xl bg-white/[0.03] hover:bg-white/[0.06] px-3 py-2 transition-all duration-300 hover:scale-110 active:scale-90 md:hidden"
                                                aria-label={
                                                    translator[
                                                        "Toggle sidebar"
                                                    ] ?? "Toggle sidebar"
                                                }
                                            >
                                                <IconMenu className="h-5 w-5 text-white/70" />
                                            </button>
                                            <div className="md:hidden">
                                                <Link
                                                    href="/"
                                                    className="flex items-center gap-2"
                                                >
                                                    <img
                                                        src="/img/logo-boost.svg"
                                                        className="h-9 w-auto select-none"
                                                        alt="Logo"
                                                        draggable="false"
                                                    />
                                                </Link>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="hidden sm:flex items-center gap-3">
                                                <div className="relative">
                                                    {/* 
                                                <Notification 
                                                    notificationClick={notificationClick}
                                                    showMore={showMore}
                                                    count={count}
                                                    notifications={notifications}
                                                />
                                                 */}
                                                </div>
                                                {auth &&
                                                auth.user &&
                                                (auth.user.role ==
                                                    "global_admin" ||
                                                    auth.user.role ==
                                                        "admin") ? (
                                                    <div className="relative">
                                                        {/* <Link
                                                preserveState
                                                key="supportrequest"
                                                href={route("listSupportRequest")}  
                                                className="inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500  hover:text-gray-700 focus:outline-none transition ease-in-out duration-150"                                                                                    
                                            >
                                                <QuestionMarkCircleIcon
                                                    className="h-6 w-6"                                                 
                                                    aria-hidden="true"                                               
                                                />                                            
                                            </Link> */}
                                                    </div>
                                                ) : (
                                                    ""
                                                )}

                                                <div
                                                    className="inline-grid grid-cols-2 items-stretch rounded-full bg-black/70 ring-1 ring-white/15 overflow-hidden"
                                                    data-selected={language.toLowerCase()}
                                                    aria-label={
                                                        translator[
                                                            "Language"
                                                        ] ?? "Language"
                                                    }
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setLanguage("IT")
                                                        }
                                                        aria-pressed={
                                                            language === "IT"
                                                        }
                                                        className={`px-2 py-0.5 text-[8px] font-semibold uppercase leading-none transition-colors duration-200 ${
                                                            language === "IT"
                                                                ? "bg-[#BF00FF] text-white rounded-l-full"
                                                                : "text-white/60 hover:text-white/90"
                                                        }`}
                                                    >
                                                        IT
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setLanguage("EN")
                                                        }
                                                        aria-pressed={
                                                            language === "EN"
                                                        }
                                                        className={`px-2 py-0.5 text-[8px] font-semibold uppercase leading-none transition-colors duration-200 ${
                                                            language === "EN"
                                                                ? "bg-[#BF00FF] text-white rounded-r-full"
                                                                : "text-white/60 hover:text-white/90"
                                                        }`}
                                                    >
                                                        EN
                                                    </button>
                                                </div>

                                                <div className="relative z-10">
                                                    <Dropdown>
                                                        <Dropdown.Trigger>
                                                            <span className="inline-flex rounded-md">
                                                                <button
                                                                    type="button"
                                                                    className="inline-flex items-center gap-2 rounded-xl bg-white/[0.03] px-3 py-2 text-sm font-medium text-white/80 hover:text-white hover:bg-white/[0.06] transition"
                                                                >
                                                                    {auth &&
                                                                    auth.user &&
                                                                    auth.user
                                                                        .imageUrl ? (
                                                                        <img
                                                                            className="h-8 w-8 rounded-full"
                                                                            src={
                                                                                auth
                                                                                    .user
                                                                                    .imageUrl
                                                                            }
                                                                            alt=""
                                                                        />
                                                                    ) : (
                                                                        ""
                                                                    )}

                                                                    {auth &&
                                                                    auth.user
                                                                        ? auth
                                                                              .user
                                                                              .name
                                                                        : ""}
                                                                    <svg
                                                                        className="h-4 w-4"
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        viewBox="0 0 20 20"
                                                                        fill="currentColor"
                                                                    >
                                                                        <path
                                                                            fillRule="evenodd"
                                                                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                                            clipRule="evenodd"
                                                                        />
                                                                    </svg>
                                                                </button>
                                                            </span>
                                                        </Dropdown.Trigger>

                                                        <Dropdown.Content
                                                            width={96}
                                                            ring={false}
                                                            contentClasses="p-0 bg-transparent"
                                                        >
                                                            {/*                                                      
                                                    <Dropdown.Link href={route('profile')} method="get" as="button">
                                                        Profile
                                                    </Dropdown.Link>

                                                    <button className="block w-full px-4 py-2 text-left text-sm leading-5 text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 transition duration-150 ease-in-out" onClick={() => setSelectedCompany(true)} as="button">
                                                        Switch Workspace
                                                    </button>

                                                    {auth && auth.user && auth.user.role == 'global_admin' ? 
                                                        <>  
                                                            <Dropdown.Link href={route('settings')} method="get" as="button">
                                                                Settings
                                                            </Dropdown.Link> 
                                                            <button className="block w-full px-4 py-2 text-left text-sm leading-5 text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 transition duration-150 ease-in-out" onClick={(e)=>{showadminpage(e)}} as="button">
                                                                {adminMenuText}                                                                                                                                                                                                          
                                                            </button>
                                                        </>
                                                    : ''}

                                                    {returnMainUser &&
                                                        <button className="block w-full px-4 py-2 text-left text-sm leading-5 text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 transition duration-150 ease-in-out" 
                                                        onClick={() => setImpersonate()} 
                                                        as="button">
                                                            Return to global admin
                                                        </button>
                                                    }

                                                    <Dropdown.Link href={route('logout')} method="post" as="button">
                                                        Log Out
                                                    </Dropdown.Link> */}
                                                            <Container className="rounded-xl border-0 bg-[#170024]/95 text-white shadow-2xl backdrop-blur-sm">
                                                                <div className="w-full flex justify-center">
                                                                    <div className="flex gap-2 mx-auto py-4 items-center">
                                                                        <div className="w-10 h-10 flex justify-center items-center bg-[rgba(56,189,248,0.2)] ring-1 ring-white/10 rounded-full">
                                                                            <UserIcon className="w-6 h-6 text-[#38BDF8]" />
                                                                        </div>
                                                                        <div className="flex flex-col">
                                                                            <span className="text-white">
                                                                                <b>
                                                                                    {" "}
                                                                                    {
                                                                                        auth
                                                                                            .user
                                                                                            .name
                                                                                    }{" "}
                                                                                </b>
                                                                            </span>
                                                                            <span className="text-white/60">
                                                                                {
                                                                                    companyName
                                                                                }
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <Row>
                                                                    <Col className="border-r border-white/10 col-3">
                                                                        <List
                                                                            type="unstyled"
                                                                            className="space-y-1"
                                                                        >
                                                                            {Object.entries(
                                                                                companyList,
                                                                            ).map(
                                                                                ([
                                                                                    key,
                                                                                    company,
                                                                                ]) => {
                                                                                    return (
                                                                                        <li
                                                                                            key={
                                                                                                companyKey
                                                                                            }
                                                                                            className="p-1 text-center"
                                                                                        >
                                                                                            <span className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-[#38BDF8] text-white shadow-sm">
                                                                                                <span className="text-lg font-medium leading-none">
                                                                                                    {company && (
                                                                                                        <>
                                                                                                            {" "}
                                                                                                            {company.substring(
                                                                                                                0,
                                                                                                                2,
                                                                                                            )}{" "}
                                                                                                        </>
                                                                                                    )}
                                                                                                </span>
                                                                                            </span>
                                                                                        </li>
                                                                                    );
                                                                                },
                                                                            )}

                                                                            <li className="p-1 text-center">
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() =>
                                                                                        setShowWorkspaceForm(
                                                                                            true,
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    <span className="w-9 h-9 bg-[rgba(255,255,255,0.08)] ring-1 ring-white/10 flex justify-center items-center rounded-full cursor-pointer mx-auto text-white/70 hover:text-white">
                                                                                        <PlusIcon className="w-6 h-6" />
                                                                                    </span>
                                                                                </button>
                                                                            </li>
                                                                        </List>
                                                                    </Col>
                                                                    <Col className="border-r border-white/10">
                                                                        <List
                                                                            type="unstyled"
                                                                            className="text-white/70"
                                                                        >
                                                                            <li className="p-1">
                                                                                {" "}
                                                                                <Link
                                                                                    className="hover:text-white"
                                                                                    href={route(
                                                                                        "wallet_subscription",
                                                                                    )}
                                                                                    method="get"
                                                                                >
                                                                                    {" "}
                                                                                    {translator[
                                                                                        "Workspace settings"
                                                                                    ] ??
                                                                                        "Workspace settings"}{" "}
                                                                                </Link>{" "}
                                                                            </li>
                                                                        </List>
                                                                    </Col>
                                                                    <Col>
                                                                        <List
                                                                            type="unstyled"
                                                                            className="text-white/70"
                                                                        >
                                                                            <li className="p-1 text-white">
                                                                                {" "}
                                                                                <b>
                                                                                    {" "}
                                                                                    {
                                                                                        auth
                                                                                            .user
                                                                                            .name
                                                                                    }{" "}
                                                                                </b>{" "}
                                                                            </li>
                                                                            <li className="p-1">
                                                                                {" "}
                                                                                <Link
                                                                                    className="hover:text-white"
                                                                                    href={route(
                                                                                        "profile",
                                                                                    )}
                                                                                    method="get"
                                                                                >
                                                                                    {" "}
                                                                                    {translator[
                                                                                        "Profile"
                                                                                    ] ??
                                                                                        "Profile"}{" "}
                                                                                </Link>{" "}
                                                                            </li>
                                                                            {auth &&
                                                                                auth.user &&
                                                                                auth
                                                                                    .user
                                                                                    .role ==
                                                                                    "global_admin" && (
                                                                                    <li className="p-1">
                                                                                        {" "}
                                                                                        <Link
                                                                                            className="hover:text-white"
                                                                                            href={route(
                                                                                                "list_global_user",
                                                                                            )}
                                                                                            method="get"
                                                                                            as="button"
                                                                                        >
                                                                                            {" "}
                                                                                            {translator[
                                                                                                "Global Admin"
                                                                                            ] ??
                                                                                                "Global Admin"}{" "}
                                                                                        </Link>{" "}
                                                                                    </li>
                                                                                )}
                                                                            {returnMainUser && (
                                                                                <li className="p-1">
                                                                                    {" "}
                                                                                    <button
                                                                                        className="hover:text-white"
                                                                                        onClick={() =>
                                                                                            setImpersonate()
                                                                                        }
                                                                                        type="button"
                                                                                    >
                                                                                        {" "}
                                                                                        {translator[
                                                                                            "Return to global admin"
                                                                                        ] ??
                                                                                            "Return to global admin"}{" "}
                                                                                    </button>{" "}
                                                                                </li>
                                                                            )}
                                                                            <li className="p-1">
                                                                                <Link
                                                                                    className="hover:text-white"
                                                                                    href={route(
                                                                                        "listApi",
                                                                                    )}
                                                                                    method="get"
                                                                                >
                                                                                    {" "}
                                                                                    {translator[
                                                                                        "API keys"
                                                                                    ] ??
                                                                                        "API keys"}
                                                                                </Link>
                                                                            </li>
                                                                            <li className="p-1">
                                                                                {" "}
                                                                                <Link
                                                                                    className="hover:text-white"
                                                                                    href={route(
                                                                                        "logout",
                                                                                    )}
                                                                                    method="post"
                                                                                    as="button"
                                                                                >
                                                                                    {" "}
                                                                                    {translator[
                                                                                        "Log Out"
                                                                                    ] ??
                                                                                        "Log Out"}{" "}
                                                                                </Link>{" "}
                                                                            </li>
                                                                        </List>
                                                                    </Col>
                                                                </Row>
                                                            </Container>
                                                        </Dropdown.Content>
                                                    </Dropdown>
                                                </div>
                                            </div>

                                            <div className="flex items-center sm:hidden">
                                                <button
                                                    onClick={() =>
                                                        setShowingNavigationDropdown(
                                                            (previousState) =>
                                                                !previousState,
                                                        )
                                                    }
                                                    className="inline-flex items-center justify-center p-2 rounded-md text-white/60 hover:text-white hover:bg-white/10 focus:outline-none focus:bg-white/10 focus:text-white transition duration-150 ease-in-out"
                                                >
                                                    <svg
                                                        className="h-6 w-6"
                                                        stroke="currentColor"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            className={
                                                                !showingNavigationDropdown
                                                                    ? "inline-flex"
                                                                    : "hidden"
                                                            }
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M4 6h16M4 12h16M4 18h16"
                                                        />
                                                        <path
                                                            className={
                                                                showingNavigationDropdown
                                                                    ? "inline-flex"
                                                                    : "hidden"
                                                            }
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M6 18L18 6M6 6l12 12"
                                                        />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div
                                        className={
                                            (showingNavigationDropdown
                                                ? "block"
                                                : "hidden") + " sm:hidden"
                                        }
                                    >
                                        <div className="pt-2 pb-3 space-y-1">
                                            <ResponsiveNavLink
                                                href={route("dashboard")}
                                                active={route().current(
                                                    "dashboard",
                                                )}
                                            >
                                                {translator["Dashboard"] ??
                                                    "Dashboard"}
                                            </ResponsiveNavLink>
                                        </div>

                                        <div className="pt-4 pb-1 border-t border-white/10">
                                            <div className="px-4">
                                                <div className="font-medium text-base text-white">
                                                    {auth &&
                                                    auth.user &&
                                                    auth.user.name
                                                        ? auth.user.name
                                                        : ""}
                                                </div>
                                                <div className="font-medium text-sm text-white/60">
                                                    {auth &&
                                                    auth.user &&
                                                    auth.user.email
                                                        ? auth.user.email
                                                        : ""}
                                                </div>
                                            </div>

                                            <div className="mt-3 space-y-1">
                                                <ResponsiveNavLink
                                                    method="post"
                                                    href={route("logout")}
                                                    as="button"
                                                >
                                                    {translator["Log Out"] ??
                                                        "Log Out"}
                                                </ResponsiveNavLink>
                                            </div>
                                        </div>
                                    </div>
                                </nav>
                            </header>
                        ) : null}

                        {fullHeight ? (
                            /* Full-height mode (e.g. /chat): no padding, no inner wrapper.
                               overflow-hidden + min-h-0 give flex children a definite
                               height so their own overflow-y-auto regions scroll
                               independently instead of growing the page. */
                            <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                                {children}
                            </div>
                        ) : (
                            <div
                                className={[
                                    "flex-1",
                                    showPageTitle
                                        ? "px-3 pb-3 pt-0 md:px-8 md:pb-8 md:pt-0"
                                        : "p-3 md:p-8",
                                ].join(" ")}
                            >
                                {showPageTitle ? (
                                    <div className="px-1 pt-4 md:px-0 md:pt-6">
                                        <h1 className="platform-page-title one-tech-special">
                                            {translatedPageTitle}
                                        </h1>
                                    </div>
                                ) : null}

                                <div
                                    className={
                                        showPageTitle
                                            ? "pt-4 md:pt-5"
                                            : undefined
                                    }
                                >
                                    {children}
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>

            <CommandAssistant />

            {showModal && companyList?.[0]?.name ? (
                <UserRegistration
                    user={auth.user}
                    time_zone={timezone}
                    setshowModal={setshowModal}
                    company={companyList[0]}
                />
            ) : null}

            {showWorkspaceForm ? (
                <Form
                    module={"Company"}
                    heading={"Create Company"}
                    hideForm={hideForm}
                    recordId={""}
                    // translator={translator}
                    // mod={''}
                    // productList={props.productList}
                    // current_user={props.current_user}
                />
            ) : (
                ""
            )}
        </>
    );
}
