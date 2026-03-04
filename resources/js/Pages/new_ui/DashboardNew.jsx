import React, { Fragment, useState, useEffect } from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
// import { Card } from 'reactstrap'
import { BsHeadset } from "react-icons/bs";
import { FaPlusCircle, FaAngleDown } from "react-icons/fa";
import Authenticated from "@/Layouts/Authenticated";
import { Head, Link } from "@inertiajs/react";
import { Dialog, Transition } from "@headlessui/react";
import DateRangePicker from "react-bootstrap-daterangepicker";
import "bootstrap-daterangepicker/daterangepicker.css";
import ListView from "@/Components/Views/List/Index2";
import { router as Inertia } from "@inertiajs/react";
import ReactEcharts from "echarts-for-react";

export default function DashboardNew(props) {
    const options = {
        grid: { top: 20, right: 20, bottom: 20, left: 20 },
        xAxis: {
            type: "category",
            axisLine: { show: false },
            data: [],
        },
        yAxis: [
            {
                type: "value",
                splitLine: { show: false },
                axisLabel: { show: false },
            },
        ],
        series: [
            {
                data: props.per_day_count ? props.per_day_count : "",
                type: "line",
                color: "orange",
                smooth: true,
                areaStyle: { color: "orange", opacity: 0.5 },
            },
        ],
        tooltip: { trigger: "axis" },
    };

    let [isOpen, setIsOpen] = useState(false);
    var date = new Date().toLocaleString();
    const [startDate, setStartDate] = useState({ date });
    const [messageDetails, setMessageDetails] = useState(props.message_details);
    const [balance, setBalance] = useState(0);

    useEffect(() => {
        setBalance(props.balance);
    }, [props.balance]);

    function closeModal() {
        setIsOpen(false);
    }

    function openModal() {
        setIsOpen(true);
    }

    function handleEvent(event, picker) {
        var url = route("dashboard", {
            module: "Msg",
            is_conversation: true,
            start_date: picker.startDate.format("YYYY/MM/DD"),
            end_date: picker.endDate.format("YYYY/MM/DD"),
        });
        Inertia.get(url);
    }

    return (
        <>
            <Authenticated
                auth={props.auth}
                errors={props.errors}
                current_page="Dashboard"
                message={props.message}
                navigationMenu={props.menuBar}
            >
                <Head title={props.translator["Dashboard"]} />

                <div className="pt-4 pb-8">
                    <div className="px-4 sm:px-6 lg:px-8">
                        <div className="pb-4">
                            <h3 className="text-2xl leading-6 font-semibold !text-white">
                                {props.translator["Dashboard"]}
                            </h3>
                        </div>

                        {/* ✅ TOP SECTION LAYOUT (3 columns like you asked) */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
                            {/* COL 1: FIRST CARD */}
                            <GlassCard>
                                <div className="!text-white text-base font-medium">
                                    {
                                        props.translator[
                                            "Conversations of this month"
                                        ]
                                    }
                                </div>

                                <div className="mt-4 flex justify-between gap-6">
                                    <div>
                                        <div className="!text-white text-base font-normal">
                                            {props.translator["Total"]}
                                        </div>
                                        <div className="!text-white/50 font-semibold text-4xl">
                                            {messageDetails.total_messages
                                                ? messageDetails.total_messages
                                                : "-"}
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <div className="!text-white text-base font-normal">
                                            {props.translator["Daily average"]}
                                        </div>
                                        <div className="!text-white/50 font-medium">
                                            {messageDetails.total_messages
                                                ? (
                                                      messageDetails.total_messages /
                                                      30
                                                  ).toFixed(3)
                                                : "-"}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <div className="!text-white mb-2">
                                        {props.translator["Trend"]}
                                    </div>
                                    <ReactEcharts
                                        option={options}
                                        style={{
                                            width: "100%",
                                            height: "180px",
                                        }}
                                    />
                                </div>
                            </GlassCard>

                            {/* COL 2: SECOND + THIRD + NETWORKS */}
                            <div className="flex flex-col gap-4">
                                {/* this block height MUST match Your Sessions height */}
                                <div className="h-[228px] flex flex-col gap-4">
                                    {/* SECOND */}
                                    <GlassCard className="flex-1">
                                        <div className="flex gap-3 items-center h-full">
                                            <div className="w-12 h-12 rounded bg-[#E3D2F9] flex justify-center items-center">
                                                <BsHeadset
                                                    className="text-[#731CE1]"
                                                    size={"2rem"}
                                                />
                                            </div>
                                            <div>
                                                <div className="!text-white text-base font-medium">
                                                    {
                                                        props.translator[
                                                            "Business initiated chats"
                                                        ]
                                                    }
                                                </div>
                                                <div className="!text-white/50 font-semibold text-xl">
                                                    {messageDetails.BIC
                                                        ? messageDetails.BIC
                                                              .count
                                                        : "-"}
                                                </div>
                                            </div>
                                        </div>
                                    </GlassCard>

                                    {/* THIRD */}
                                    <GlassCard className="flex-1">
                                        <div className="flex gap-3 items-center h-full">
                                            <div className="w-12 h-12 rounded bg-[#DD894C33] flex justify-center items-center">
                                                <svg
                                                    width={32}
                                                    height={25}
                                                    viewBox="0 0 32 25"
                                                    fill="none"
                                                >
                                                    <path
                                                        d="M0.886292 18.7834C0.886292 19.2643 0.886292 20.6903 0.886292 21.0046C0.886292 21.3189 1.07621 21.8563 1.76335 21.8563C2.29044 21.8563 6.49861 21.8563 8.42664 21.8563C9.01028 21.8563 9.38692 21.8563 9.38692 21.8563H9.55231C9.55231 21.8563 9.66327 21.8563 9.84146 21.8563C9.84146 22.3634 9.84146 22.8244 9.84146 23.0015C9.84146 23.3902 10.0762 24.0554 10.9266 24.0554C11.5796 24.0554 16.8046 24.0554 19.1914 24.0554C19.9138 24.0554 20.3822 24.0554 20.3822 24.0554H20.587C20.587 24.0554 21.0458 24.0554 21.7575 24.0554C24.1358 24.0554 29.3693 24.0554 30.0234 24.0554C30.8727 24.0554 31.1085 23.3912 31.1085 23.0015C31.1085 22.6117 31.1085 20.8485 31.1085 20.2534C31.1085 19.6583 30.8941 18.9982 30.0234 18.6315C28.9223 18.158 25.9699 17.1103 24.1155 16.5728C23.9725 16.5278 23.948 16.5204 23.948 15.896C23.948 15.2234 24.027 14.7467 24.1934 14.3967C24.4228 13.919 24.6938 13.1144 24.7899 12.3935C25.063 12.0834 25.4332 11.4716 25.6712 10.3055C25.8814 9.2777 25.7832 8.90368 25.6445 8.5527C25.6296 8.51603 25.6136 8.47936 25.6029 8.43745C25.5517 8.20172 25.6221 6.94973 25.8035 5.97746C25.9273 5.31113 25.7715 3.89465 24.8368 2.72123C24.2468 1.98051 23.1168 1.07006 21.0885 0.945384L19.9575 0.944336C17.895 1.07111 16.7662 1.98051 16.1761 2.72123C15.2414 3.8936 15.0867 5.31113 15.2105 5.97746C15.3898 6.94868 15.4623 8.20067 15.409 8.44164C15.3983 8.47831 15.3823 8.51498 15.3684 8.55165C15.2297 8.90263 15.1326 9.27666 15.3407 10.3044C15.5786 11.4705 15.9499 12.0824 16.222 12.3925C16.3191 13.1133 16.5901 13.9179 16.8184 14.3957C17.0297 14.8357 17.2452 15.3554 17.2452 15.8719C17.2452 16.4974 17.2207 16.5047 17.0681 16.5519C16.6861 16.6619 16.254 16.7949 15.7995 16.9374C14.7282 16.5466 13.3806 16.0898 12.4033 15.8059C12.287 15.7703 12.2678 15.764 12.2678 15.259C12.2678 14.7152 12.3318 14.3297 12.4662 14.0468C12.6519 13.6602 12.8706 13.0106 12.9496 12.4271C13.1694 12.1767 13.4692 11.6822 13.6612 10.7392C13.8309 9.90842 13.7509 9.60668 13.6388 9.32275C13.6271 9.29237 13.6143 9.26304 13.6058 9.22951C13.5642 9.03883 13.6207 8.02676 13.7658 7.24098C13.865 6.70247 13.7413 5.55734 12.9859 4.60813C12.5089 4.00989 11.5956 3.27441 9.95776 3.17174H9.04442C7.3778 3.27336 6.46553 4.00989 5.98859 4.60813C5.23317 5.55734 5.10727 6.70247 5.20863 7.24098C5.35267 8.02676 5.41242 9.03883 5.36974 9.2337C5.36121 9.26304 5.34734 9.29237 5.33667 9.32275C5.22357 9.60668 5.14568 9.90842 5.31426 10.7392C5.50632 11.6822 5.80614 12.1767 6.02594 12.4271C6.10489 13.0106 6.32362 13.6592 6.50821 14.0468C6.67893 14.403 6.85391 14.8232 6.85391 15.2401C6.85391 15.7462 6.83471 15.7514 6.71094 15.7902C5.26198 16.2103 2.91996 17.0086 1.92873 17.4162C1.22452 17.7127 0.887358 18.3015 0.887358 18.7824L0.886292 18.7834ZM10.9597 20.2544C10.9597 20.091 11.1261 19.762 11.5721 19.5745C12.749 19.0915 15.633 18.115 17.385 17.6079C18.3645 17.3062 18.3645 16.4785 18.3645 15.874C18.3645 15.1417 18.0946 14.4806 17.8299 13.9295C17.6475 13.546 17.4128 12.8556 17.3306 12.25L17.2868 11.9252L17.0681 11.6769C16.9475 11.5397 16.6445 11.1101 16.4375 10.0897C16.2754 9.29237 16.3468 9.11112 16.4098 8.95082L16.4109 8.94873L16.4205 8.92149C16.4439 8.86491 16.4642 8.80834 16.4802 8.75281L16.4919 8.713L16.5005 8.67214C16.6147 8.14724 16.4653 6.63437 16.3084 5.78259C16.2369 5.39914 16.3266 4.31372 17.0553 3.39909C17.703 2.58607 18.691 2.13033 19.9916 2.04337L21.0512 2.04442C22.6442 2.15128 23.5084 2.83857 23.9544 3.39909C24.6832 4.31372 24.7717 5.39914 24.7013 5.7805C24.5476 6.61132 24.3951 8.14829 24.5082 8.6669L24.5135 8.68995L24.5199 8.713C24.5434 8.80205 24.5722 8.88168 24.6053 8.9613C24.6629 9.10903 24.7354 9.29342 24.5733 10.0886C24.3652 11.1101 24.0632 11.5376 23.9427 11.6738L23.7229 11.9231L23.6802 12.25C23.598 12.8566 23.3644 13.5439 23.1798 13.9274C22.9397 14.4313 22.8277 15.0557 22.8277 15.8949C22.8277 16.4984 22.8277 17.324 23.7752 17.6195C25.5805 18.1433 28.5126 19.1816 29.5731 19.6373C29.889 19.7704 29.9882 19.9191 29.9882 20.2523V22.9543H10.9661L10.9607 20.2523L10.9597 20.2544ZM2.00555 18.7834C2.00769 18.7405 2.07704 18.5509 2.36939 18.4272C3.32861 18.0322 5.64076 17.2475 7.02676 16.8452C7.97211 16.5498 7.97211 15.7305 7.97211 15.2412C7.97211 14.6094 7.74377 14.0468 7.51971 13.5795C7.3746 13.2747 7.19535 12.7299 7.13453 12.2835L7.09078 11.9588L6.87312 11.7105C6.80483 11.634 6.5733 11.3207 6.41112 10.5234C6.29161 9.93985 6.33963 9.81832 6.37804 9.72088L6.38444 9.70621L6.38871 9.69154C6.41218 9.63497 6.42712 9.58992 6.43992 9.54487L6.45273 9.50401L6.46126 9.46315C6.57116 8.95606 6.41325 7.61606 6.30762 7.04402C6.25854 6.77476 6.33109 5.9607 6.86992 5.28389C7.35326 4.67832 8.09588 4.33677 9.07963 4.26972H9.92041C11.1229 4.35354 11.7706 4.86586 12.1035 5.28389C12.6412 5.95965 12.7148 6.77581 12.6658 7.04402C12.5527 7.64854 12.4054 8.97282 12.51 9.45791L12.5153 9.48096L12.5206 9.50401C12.542 9.58154 12.5665 9.65068 12.5943 9.72088C12.6327 9.81727 12.6807 9.9409 12.5623 10.5234C12.399 11.3218 12.1675 11.6329 12.1003 11.7094L11.8826 11.9577L11.8388 12.2825C11.778 12.7309 11.5988 13.2747 11.4515 13.5795C11.2435 14.0164 11.1464 14.5497 11.1464 15.259C11.1464 15.7493 11.1464 16.5697 12.0629 16.8546C12.6423 17.0233 13.3636 17.2559 14.0763 17.5C12.8994 17.896 11.777 18.2973 11.1282 18.5634C10.2554 18.9312 9.83826 19.6583 9.83826 20.2534C9.83826 20.377 9.83826 20.5541 9.83826 20.7573H2.00342V18.7834H2.00555Z"
                                                        fill="#DD894C"
                                                    />
                                                </svg>
                                            </div>
                                            <div>
                                                <div className="!text-white text-base font-medium">
                                                    {
                                                        props.translator[
                                                            "User initiated chats"
                                                        ]
                                                    }
                                                </div>
                                                <div className="!text-white/50 font-semibold text-xl">
                                                    {messageDetails.UIC
                                                        ? messageDetails.UIC
                                                              .count
                                                        : "-"}
                                                </div>
                                            </div>
                                        </div>
                                    </GlassCard>
                                </div>

                                {/* Networks (NO card) */}
                                <div className="flex justify-center gap-15 px-2 pt-8">
                                    <div className="flex items-center flex-col justify-center gap-2">
                                        <img
                                            src="./img/instagram-icon.png"
                                            alt="Instagram"
                                            className="w-8"
                                        />
                                        <div className="text-base">
                                            {props.services.instagram
                                                ? props.services.instagram.count
                                                : "-"}
                                        </div>
                                    </div>

                                    <div className="flex items-center flex-col justify-center gap-2">
                                        <img
                                            src="./img/WhatsApp-icon.png"
                                            alt="WhatsApp"
                                            className="w-9"
                                        />
                                        <div className="text-base">
                                            {props.services.whatsapp
                                                ? props.services.whatsapp.count
                                                : "-"}
                                        </div>
                                    </div>

                                    <div className="flex items-center flex-col justify-center gap-2">
                                        <img
                                            src="./img/Telegram-icon.png"
                                            alt="Telegram"
                                            className="w-8"
                                        />
                                        <div className="text-base">
                                            {props.services.telegram
                                                ? props.services.telegram.count
                                                : "-"}
                                        </div>
                                    </div>

                                    <div className="flex items-center flex-col justify-center gap-2">
                                        <img
                                            src="./img/facebook-icon.png"
                                            alt="Facebook"
                                            className="w-8"
                                        />
                                        <div className="text-base">
                                            {props.services.facebook
                                                ? props.services.facebook.count
                                                : "-"}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* COL 3: Your Sessions + Spent this month */}
                            <div className="flex flex-col gap-4 h-full">
                                <GlassCard className="h-[228px]">
                                    <div className="!text-white text-base font-normal">
                                        {props.translator["Your Sessions"]}
                                    </div>
                                    <div className="flex justify-between items-center w-full mt-10">
                                        <div className="flex justify-center items-center gap-4">
                                            <div className="w-[60px] h-[60px] rounded-lg flex justify-center items-center">
                                                <svg
                                                    width={49}
                                                    height={48}
                                                    viewBox="0 0 49 48"
                                                    fill="none"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <rect
                                                        x="0.666687"
                                                        width={48}
                                                        height={48}
                                                        rx={8}
                                                        fill="#1C9AE1"
                                                        fillOpacity="0.2"
                                                    />
                                                    <path
                                                        d="M18.0716 11.1721V26.1001H11.6746C11.6746 26.1001 11.6746 32.6891 11.6746 34.8181C11.6746 36.9471 13.6576 37.8281 15.1266 37.8281C16.5956 37.8281 31.3866 37.8281 35.1326 37.8281C36.7486 37.8281 38.3316 36.2561 38.3316 34.6291C38.3316 33.4541 38.3316 11.1721 38.3316 11.1721H18.0726H18.0716ZM15.1266 36.7621C14.4626 36.7621 12.7416 36.4131 12.7416 34.8181V27.1661H18.0726V34.3581C18.0726 35.0721 17.1396 36.7621 15.6686 36.7621H15.1266ZM37.2646 34.6291C37.2646 35.6651 36.1686 36.7621 35.1316 36.7621H18.0186C18.7366 36.0141 19.1376 35.0311 19.1376 34.3581V12.2381H37.2636V34.6291H37.2646Z"
                                                        fill="#3F87AF"
                                                    />
                                                    <path
                                                        d="M21.2706 14.3711H35.1316V15.4371H21.2706V14.3711Z"
                                                        fill="#3F87AF"
                                                    />
                                                    <path
                                                        d="M21.2706 28.7649H35.1316V29.8309H21.2706V28.7649Z"
                                                        fill="#3F87AF"
                                                    />
                                                    <path
                                                        d="M21.2706 32.4971H35.1316V33.5631H21.2706V32.4971Z"
                                                        fill="#3F87AF"
                                                    />
                                                    <path
                                                        d="M35.1316 18.1021H21.2706V26.0991H35.1316V18.1021ZM34.0656 25.0331H22.3366V19.1691H34.0656V25.0331Z"
                                                        fill="#3F87AF"
                                                    />
                                                </svg>
                                            </div>

                                            <div className="widget-chart-content">
                                                <div className="text-2xl font-medium !mt-0 !text-white ">
                                                    <span className="">
                                                        {props.total_session_limit -
                                                            props.current_session_count}{" "}
                                                        {props.translator[
                                                            "sessions"
                                                        ]}
                                                    </span>
                                                </div>
                                                <div className="!text-white/50 text-base font-normal">
                                                    {props.translator[
                                                        "You spent"
                                                    ]}{" "}
                                                    {
                                                        props.current_session_count
                                                    }{" "}
                                                    {props.translator["of"]}{" "}
                                                    {props.total_session_limit}{" "}
                                                    {props.translator[
                                                        "sessions"
                                                    ]}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </GlassCard>

                                <GlassCard className="flex-1">
                                    <div className="!text-white text-base font-normal">
                                        {props.translator["Spent this month"]}
                                    </div>
                                    <div className="flex justify-between items-center w-full mt-2">
                                        <div className="flex justify-center items-center gap-4">
                                            <div className="w-[60px] h-[60px] rounded-lg flex justify-center items-center">
                                                <svg
                                                    width={49}
                                                    height={48}
                                                    viewBox="0 0 49 48"
                                                    fill="none"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <rect
                                                        x="0.666687"
                                                        width={48}
                                                        height={48}
                                                        rx={8}
                                                        fill="#1C9AE1"
                                                        fillOpacity="0.2"
                                                    />
                                                    <path
                                                        d="M18.0716 11.1721V26.1001H11.6746C11.6746 26.1001 11.6746 32.6891 11.6746 34.8181C11.6746 36.9471 13.6576 37.8281 15.1266 37.8281C16.5956 37.8281 31.3866 37.8281 35.1326 37.8281C36.7486 37.8281 38.3316 36.2561 38.3316 34.6291C38.3316 33.4541 38.3316 11.1721 38.3316 11.1721H18.0726H18.0716ZM15.1266 36.7621C14.4626 36.7621 12.7416 36.4131 12.7416 34.8181V27.1661H18.0726V34.3581C18.0726 35.0721 17.1396 36.7621 15.6686 36.7621H15.1266ZM37.2646 34.6291C37.2646 35.6651 36.1686 36.7621 35.1316 36.7621H18.0186C18.7366 36.0141 19.1376 35.0311 19.1376 34.3581V12.2381H37.2636V34.6291H37.2646Z"
                                                        fill="#3F87AF"
                                                    />
                                                    <path
                                                        d="M21.2706 14.3711H35.1316V15.4371H21.2706V14.3711Z"
                                                        fill="#3F87AF"
                                                    />
                                                    <path
                                                        d="M21.2706 28.7649H35.1316V29.8309H21.2706V28.7649Z"
                                                        fill="#3F87AF"
                                                    />
                                                    <path
                                                        d="M21.2706 32.4971H35.1316V33.5631H21.2706V32.4971Z"
                                                        fill="#3F87AF"
                                                    />
                                                    <path
                                                        d="M35.1316 18.1021H21.2706V26.0991H35.1316V18.1021ZM34.0656 25.0331H22.3366V19.1691H34.0656V25.0331Z"
                                                        fill="#3F87AF"
                                                    />
                                                </svg>
                                            </div>

                                            <div className="widget-chart-content">
                                                <div className="text-2xl font-medium !mt-0 !text-white">
                                                    $
                                                    {messageDetails.total_amount
                                                        ? messageDetails.total_amount.toFixed(
                                                              3,
                                                          )
                                                        : 0}
                                                </div>
                                                <div className="!text-white/50 text-base font-normal">
                                                    {
                                                        props.translator[
                                                            "look closely"
                                                        ]
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </GlassCard>
                            </div>
                        </div>

                        {/* ✅ Message log: full width under everything */}
                        <GlassCard className="mt-8">
                            <div className="text-base font-semibold !text-white">
                                {props.translator["Message log"]}
                            </div>
                            <div className="flex gap-2 items-center mt-2 !text-white/50">
                                <svg
                                    width={24}
                                    height={24}
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M4.40375 2.40381C3.29918 2.40381 2.40375 3.29924 2.40375 4.40381V19.5963C2.40375 20.7009 3.29918 21.5963 4.40375 21.5963H19.5962C20.7008 21.5963 21.5962 20.7009 21.5962 19.5963V4.40381C21.5962 3.29924 20.7008 2.40381 19.5962 2.40381H4.40375ZM19.7968 3.20331C20.349 3.20331 20.7967 3.65102 20.7967 4.20331V6.80181H3.204V4.20331C3.204 3.65102 3.65171 3.20331 4.204 3.20331H19.7968ZM4.20325 20.7968C3.65096 20.7968 3.20325 20.3491 3.20325 19.7968V7.60206H20.796V19.7968C20.796 20.3491 20.3483 20.7968 19.796 20.7968H4.20325Z"
                                        fill="#363740"
                                    />
                                    <path
                                        d="M8.40076 4.40332H9.60076V5.60257H8.40076V4.40332Z"
                                        fill="#363740"
                                    />
                                    <path
                                        d="M14.3992 4.40332H15.5985V5.60257H14.3992V4.40332Z"
                                        fill="#363740"
                                    />
                                    <path
                                        d="M9.261 10.4469C9.11775 11.4196 8.655 11.4369 7.7235 11.4706L7.57875 11.4759V12.1539H9.15675V16.5894H9.99375V10.3186H9.279L9.26025 10.4469H9.261Z"
                                        fill="#363740"
                                    />
                                    <path
                                        d="M13.9815 12.3315C13.6095 12.3315 13.2277 12.453 12.9255 12.6563L13.2105 11.19H15.8467V10.395H12.5865L11.9505 13.791H12.6742L12.7185 13.722C12.9712 13.3283 13.4325 13.083 13.923 13.083C14.721 13.083 15.3 13.6733 15.3 14.4855C15.3 15.2205 14.8387 15.9645 13.9575 15.9645C13.2045 15.9645 12.663 15.456 12.6405 14.7278L12.636 14.5823H11.7997L11.8035 14.736C11.8305 15.921 12.6787 16.7168 13.9155 16.7168C15.162 16.7168 16.1377 15.7628 16.1377 14.5455C16.1377 13.221 15.2722 12.3308 13.9837 12.3308L13.9815 12.3315Z"
                                        fill="#363740"
                                    />
                                </svg>

                                {props.translator["This month"]}
                                <DateRangePicker
                                    onApply={handleEvent}
                                    initialSettings={{
                                        startDate: startDate,
                                        endDate: "19/11/23",
                                    }}
                                >
                                    <button>
                                        <FaAngleDown />
                                    </button>
                                </DateRangePicker>
                            </div>

                            <ListView
                                module="dashboard"
                                headers={
                                    props.msgTransactionList.list_view_columns
                                }
                                records={props.msgTransactionList.records}
                                paginator={props.msgTransactionList.paginator}
                                actions={props.msgTransactionList.actions}
                                filter={props.msgTransactionList.filter}
                                translator={props.translator}
                                {...props.msgTransactionList}
                                {...props}
                            />
                        </GlassCard>

                        {/* MODAL (unchanged placement/logic) */}
                        <Transition appear show={isOpen} as={Fragment}>
                            <Dialog
                                as="div"
                                className="relative z-10"
                                onClose={closeModal}
                            >
                                <Transition.Child
                                    as={Fragment}
                                    enter="ease-out duration-300"
                                    enterFrom="opacity-0"
                                    enterTo="opacity-100"
                                    leave="ease-in duration-200"
                                    leaveFrom="opacity-100"
                                    leaveTo="opacity-0"
                                >
                                    <div className="fixed inset-0 bg-black bg-opacity-25" />
                                </Transition.Child>

                                <div className="fixed inset-0 overflow-y-auto">
                                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                                        <Transition.Child
                                            as={Fragment}
                                            enter="ease-out duration-300"
                                            enterFrom="opacity-0 scale-95"
                                            enterTo="opacity-100 scale-100"
                                            leave="ease-in duration-200"
                                            leaveFrom="opacity-100 scale-100"
                                            leaveTo="opacity-0 scale-95"
                                        >
                                            <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                                <div className="flex justify-center items-center gap-2 flex-col">
                                                    <svg
                                                        width={48}
                                                        height={48}
                                                        viewBox="0 0 48 48"
                                                        fill="none"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                        <path
                                                            d="M26.6761 16.1326C24.0706 16.1326 21.9556 18.2461 21.9556 20.8531C21.9556 23.4601 24.0706 25.5751 26.6761 25.5751C29.2846 25.5751 31.3966 23.4616 31.3966 20.8531C31.3966 18.2446 29.2831 16.1326 26.6761 16.1326ZM26.6761 24.0001C24.9421 24.0001 23.5291 22.5886 23.5291 20.8516C23.5291 19.1146 24.9406 17.7046 26.6761 17.7046C28.4131 17.7046 29.8231 19.1161 29.8231 20.8516C29.8231 22.5871 28.4116 24.0001 26.6761 24.0001Z"
                                                            fill="#178C3F"
                                                        />
                                                        <path
                                                            d="M7.79395 9.05103V32.6535H45.5579V9.05103H7.79395V9.05103ZM43.9859 14.3745V31.08H9.36894V10.6245H43.9859V14.3745V14.3745Z"
                                                            fill="#178C3F"
                                                        />
                                                        <path
                                                            d="M37.119 34.2285H6.22047V12.1995H4.64697V35.802H42.4125V34.2285H40.839H37.119Z"
                                                            fill="#178C3F"
                                                        />
                                                        <path
                                                            d="M33.972 37.3754H3.0735V15.3464H1.5V38.9489H39.2655V37.3754H37.692H33.972Z"
                                                            fill="#178C3F"
                                                        />
                                                        <path
                                                            d="M11.7285 12.2476H16.449V13.8211H11.7285V12.2476V12.2476Z"
                                                            fill="#178C3F"
                                                        />
                                                        <path
                                                            d="M11.7285 27.9346H16.449V29.5081H11.7285V27.9346V27.9346Z"
                                                            fill="#178C3F"
                                                        />
                                                        <path
                                                            d="M36.9045 12.2476H41.625V13.8211H36.9045V12.2476Z"
                                                            fill="#178C3F"
                                                        />
                                                        <path
                                                            d="M36.9045 27.9346H41.625V29.5081H36.9045V27.9346Z"
                                                            fill="#178C3F"
                                                        />
                                                    </svg>
                                                    <div className="text-[#363740] font-medium text-2xl">
                                                        €374,72
                                                    </div>
                                                    <div className="text=[#424242] text-2xl font-bold">
                                                        {
                                                            props.translator[
                                                                "Recharge your balance"
                                                            ]
                                                        }
                                                    </div>
                                                </div>

                                                <div className="!mt-8">
                                                    <div>
                                                        {
                                                            props.translator[
                                                                "Recharge manually"
                                                            ]
                                                        }
                                                    </div>

                                                    <div className="flex justify-center items-center gap-2 flex-col w-[200px] mx-auto">
                                                        <label>
                                                            {
                                                                props
                                                                    .translator[
                                                                    "Enter the amount:"
                                                                ]
                                                            }
                                                        </label>

                                                        <div className="w-[200px] relative">
                                                            <span className="absolute inset-y-0 flex items-center left-2">
                                                                €
                                                            </span>
                                                            <input
                                                                type={"text"}
                                                                className="rounded-md w-full !pl-4 pr-12"
                                                            />
                                                            <span className="absolute inset-y-0 flex items-center right-2 tracking-tighter">
                                                                {
                                                                    props
                                                                        .translator[
                                                                        "min"
                                                                    ]
                                                                }{" "}
                                                                50
                                                            </span>
                                                        </div>
                                                        <div className="w-full">
                                                            <button
                                                                type="button"
                                                                className="w-full btn btn-primary text-center"
                                                            >
                                                                {
                                                                    props
                                                                        .translator[
                                                                        "Charge"
                                                                    ]
                                                                }
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="!mt-8">
                                                        <div className="form-check form-check-inline">
                                                            <input
                                                                type="checkbox"
                                                                className="form-check-input !mt-[6px]"
                                                            />
                                                            <label className="form-check-label text-[#424242] font-medium text-base">
                                                                {
                                                                    props
                                                                        .translator[
                                                                        "Set monthly auto-recharge"
                                                                    ]
                                                                }
                                                            </label>
                                                        </div>

                                                        <div className="flex justify-center items-center gap-2 flex-col w-[200px] mx-auto !mt-4">
                                                            <label>
                                                                {
                                                                    props
                                                                        .translator[
                                                                        "Enter the amount:"
                                                                    ]
                                                                }
                                                            </label>

                                                            <div className="w-[200px] relative">
                                                                <span className="absolute inset-y-0 flex items-center left-2">
                                                                    €
                                                                </span>
                                                                <input
                                                                    type={
                                                                        "text"
                                                                    }
                                                                    className="rounded-md w-full !pl-4 pr-12"
                                                                />
                                                                <span className="absolute inset-y-0 flex items-center right-2 tracking-tighter">
                                                                    {
                                                                        props
                                                                            .translator[
                                                                            "min"
                                                                        ]
                                                                    }{" "}
                                                                    50
                                                                </span>
                                                            </div>
                                                            <div className="w-full">
                                                                <button
                                                                    type="button"
                                                                    className="w-full btn btn-primary text-center"
                                                                >
                                                                    {
                                                                        props
                                                                            .translator[
                                                                            "Set auto-recharge"
                                                                        ]
                                                                    }
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="!mt-8">
                                                        <div className="form-check form-check-inline">
                                                            <input
                                                                type="checkbox"
                                                                className="form-check-input !mt-[6px]"
                                                            />
                                                            <label className="form-check-label ">
                                                                <div>
                                                                    <div className="text-[#424242] font-medium text-base">
                                                                        {
                                                                            props
                                                                                .translator[
                                                                                "Set threshold auto-recharge"
                                                                            ]
                                                                        }
                                                                    </div>
                                                                    <div className="text-[#7E7F8C] font-medium text-sm">
                                                                        {
                                                                            props
                                                                                .translator[
                                                                                "Set the minimum threshold from which to automatically reload"
                                                                            ]
                                                                        }
                                                                    </div>
                                                                </div>
                                                            </label>
                                                        </div>

                                                        <div className="flex justify-center items-center gap-2 flex-col w-[200px] mx-auto !mt-4">
                                                            <label className="font-medium">
                                                                {
                                                                    props
                                                                        .translator[
                                                                        "Set threshold"
                                                                    ]
                                                                }
                                                            </label>

                                                            <div className="w-[200px] relative">
                                                                <span className="absolute inset-y-0 flex items-center left-2">
                                                                    €
                                                                </span>
                                                                <input
                                                                    type={
                                                                        "text"
                                                                    }
                                                                    className="rounded-md w-full !pl-4 pr-12"
                                                                />
                                                                <span className="absolute inset-y-0 flex items-center right-2 tracking-tighter">
                                                                    {
                                                                        props
                                                                            .translator[
                                                                            "min"
                                                                        ]
                                                                    }{" "}
                                                                    50
                                                                </span>
                                                            </div>
                                                            <label className="font-medium">
                                                                {
                                                                    props
                                                                        .translator[
                                                                        "Set monthly limit to charge"
                                                                    ]
                                                                }{" "}
                                                            </label>

                                                            <div>
                                                                <div className="form-check form-check-inline">
                                                                    <input
                                                                        className="form-check-input"
                                                                        type="radio"
                                                                        name="inlineRadioOptions"
                                                                        id="inlineRadio1"
                                                                        defaultValue="option1"
                                                                    />
                                                                    <label
                                                                        className="form-check-label"
                                                                        htmlFor="inlineRadio1"
                                                                    >
                                                                        {
                                                                            props
                                                                                .translator[
                                                                                "Disable"
                                                                            ]
                                                                        }
                                                                    </label>
                                                                </div>
                                                                <div className="form-check form-check-inline">
                                                                    <input
                                                                        className="form-check-input"
                                                                        type="radio"
                                                                        name="inlineRadioOptions"
                                                                        id="inlineRadio2"
                                                                        defaultValue="option2"
                                                                    />
                                                                    <label
                                                                        className="form-check-label"
                                                                        htmlFor="inlineRadio2"
                                                                    >
                                                                        {
                                                                            props
                                                                                .translator[
                                                                                "Active"
                                                                            ]
                                                                        }
                                                                    </label>
                                                                </div>
                                                            </div>

                                                            <div className="w-[200px] relative">
                                                                <span className="absolute inset-y-0 flex items-center left-2">
                                                                    €
                                                                </span>
                                                                <input
                                                                    type={
                                                                        "text"
                                                                    }
                                                                    className="rounded-md w-full !pl-4 pr-12"
                                                                />
                                                                <span className="absolute inset-y-0 flex items-center right-2 tracking-tighter">
                                                                    {
                                                                        props
                                                                            .translator[
                                                                            "min"
                                                                        ]
                                                                    }{" "}
                                                                    50
                                                                </span>
                                                            </div>
                                                            <div className="w-full">
                                                                <button
                                                                    type="button"
                                                                    className="w-full btn btn-primary text-center"
                                                                >
                                                                    {
                                                                        props
                                                                            .translator[
                                                                            "Set auto-recharge"
                                                                        ]
                                                                    }
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Dialog.Panel>
                                        </Transition.Child>
                                    </div>
                                </div>
                            </Dialog>
                        </Transition>
                    </div>
                </div>
            </Authenticated>
        </>
    );
}

export function GlassCard({ className = "", children }) {
    return (
        <div
            className={[
                "relative rounded-3xl bg-white/5 backdrop-blur-3xl group",
                "transition-all duration-500 hover:border-[#38bdf8]/50 hover:-translate-y-3 hover:scale-[1.02]",
                "hover:shadow-[0_20px_40px_-15px_rgba(56,189,248,0.3)]",
                className,
            ].join(" ")}
        >
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#38bdf8]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="p-6 relative z-10 flex flex-col h-full">
                {children}
            </div>
        </div>
    );
}
