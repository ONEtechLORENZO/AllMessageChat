import React, { useEffect, useState } from "react";
import {
    Row,
    Col,
    Modal,
    ModalHeader,
    ModalBody,
} from "reactstrap";
import { WhatsAppIcon, InstagramIcon } from "../icons";
import ListView from "@/Components/Views/List/Index2";
import ListViewTable from "@/Components/Views/List/ListViewTable";
import { Head } from "@inertiajs/react";

import { BsFacebook } from "react-icons/bs";
import CalenderMenu from "@/Components/Views/List/CalenderMenu";
import CustomCalender from "@/Components/Views/List/CustomCalender";

// import Slider from "react-slick";
// import "slick-carousel/slick/slick.css";
// import "slick-carousel/slick/slick-theme.css";

// import AliceCarousel from 'react-alice-carousel';
// import 'react-alice-carousel/lib/alice-carousel.css';

import { MdOpenInNew } from "react-icons/md";

export function GlassCard({ className = "", children }) {
    return (
        <div
            className={[
                "relative rounded-3xl bg-[#140816]/70 backdrop-blur-3xl group",
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

export default function WalletUsage(props) {
    const [modal, setModal] = useState(false);
    const toggle = () => setModal(!modal);
    const [messageDeduction, setMessageDeduction] = useState(
        props.message_deduction ?? {},
    );
    const [selectedAccount, setSelectedAccount] = useState("");
    const [showAccount, setShowAccount] = useState(false);
    const [showInvoices, setShowInvoices] = useState(false);
    const transactionPreviewRecords = (
        props.msgTransactionList?.records ?? []
    ).slice(0, 5);
    const accountDetails = props.message_account_detail ?? [];

    const deductionTypes = {
        BIC: "Business-initiated conversation",
        UIC: "User-initiated conversation",
        FEP: "Free entry point",
    };

    useEffect(() => {
        setMessageDeduction(props.message_deduction ?? {});
    }, [props.message_deduction]);

    /**
     * Show account amount
     * @param {Object} account
     */
    function showAccountDetail(account) {
        setSelectedAccount(account);
        toggle();
    }

    const settings = {
        dots: false,
        infinite: false,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 1,
        centerPadding: "60px",
        variableWidth: true,
        //className:'col-sm-10 max-w-full'
    };

    const responsive = {
        0: { items: 1 },
        568: { items: 2 },
        1024: { items: 3 },
    };

    const items = [
        <div className="item" data-value="1">
            1
        </div>,
        <div className="item" data-value="2">
            2
        </div>,
        <div className="item" data-value="3">
            3
        </div>,
        <div className="item" data-value="4">
            4
        </div>,
        <div className="item" data-value="5">
            5
        </div>,
    ];

    function showAllInvoices() {
        if (showInvoices === undefined || showInvoices === false)
            setShowInvoices(true);
        if (showInvoices === true) setShowInvoices(false);
    }

    return (
        <>
            <Head title="Expenses" />

            <div className="flex items-center gap-3">
                <CustomCalender module={"Conversation"} from={"conversation"} />
                <div className="flex items-center">
                    {" "}
                    <CalenderMenu
                        module="Conversation"
                        sort_time={props.message_deduction.sort_time}
                        from={"conversation"}
                    />{" "}
                </div>
            </div>

            <hr />

            <div className="flex !gap-4">
                <GlassCard className="space-y-2">
                    <div className="text-white font-medium text-sm">
                        {props.translator["Spending"]}
                    </div>
                    <div className="text-white text-xl font-normal flex items-center gap-1">
                        <svg
                            width={24}
                            height={24}
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M6.80166 2.00391V13.1999H2.00391C2.00391 13.1999 2.00391 18.1417 2.00391 19.7384C2.00391 21.3352 3.49116 21.9959 4.59291 21.9959C5.69466 21.9959 16.7879 21.9959 19.5974 21.9959C20.8094 21.9959 21.9967 20.8169 21.9967 19.5967C21.9967 18.7154 21.9967 2.00391 21.9967 2.00391H6.80241H6.80166ZM4.59291 21.1964C4.09491 21.1964 2.80416 20.9347 2.80416 19.7384V13.9994H6.80241V19.3934C6.80241 19.9289 6.10266 21.1964 4.99941 21.1964H4.59291ZM21.1964 19.5967C21.1964 20.3737 20.3744 21.1964 19.5967 21.1964H6.76191C7.30041 20.6354 7.60116 19.8982 7.60116 19.3934V2.80341H21.1957V19.5967H21.1964Z"
                                fill="#3F87AF"
                            />
                            <path
                                d="M9.20093 4.40332H19.5967V5.20282H9.20093V4.40332Z"
                                fill="#3F87AF"
                            />
                            <path
                                d="M9.20093 15.1987H19.5967V15.9982H9.20093V15.1987Z"
                                fill="#3F87AF"
                            />
                            <path
                                d="M9.20093 17.9976H19.5967V18.7971H9.20093V17.9976Z"
                                fill="#3F87AF"
                            />
                            <path
                                d="M19.5967 7.20166H9.20093V13.1994H19.5967V7.20166ZM18.7972 12.3999H10.0004V8.00191H18.7972V12.3999Z"
                                fill="#3F87AF"
                            />
                        </svg>
                        $
                        {messageDeduction["total_amount"] ? (
                            <>{messageDeduction.total_amount.toFixed(3)}</>
                        ) : (
                            0
                        )}
                    </div>
                </GlassCard>

                <GlassCard className="space-y-2">
                    <div className="text-white font-medium text-sm">
                        {props.translator["Total conversations"]}
                    </div>
                    <div className="text-white text-xl font-normal flex items-center gap-1">
                        <svg
                            width={24}
                            height={24}
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M21.9985 10.8211C21.9985 5.3997 17.519 1 11.9992 1C6.47953 1 2 5.3997 2 10.8211V14.8282H2.03975C2.03975 14.946 2.03975 15.0639 2.03975 15.1427C2.03975 17.7355 4.15989 19.8569 6.79976 19.8569V10.4285H6.76001C5.0801 10.4285 3.64017 11.2535 2.80021 12.5499V10.8211C2.80021 5.83209 6.91975 1.78521 12 1.78521C17.0802 1.78521 21.1998 5.83135 21.1998 10.8211V12.5499C20.3598 11.2925 18.8802 10.4285 17.24 10.4285H17.2002V19.8569H17.24C17.6397 19.8569 17.9997 19.8179 18.4002 19.7C17.2002 20.8396 15.7206 21.6248 14.0406 22.0181V20.6429H10.0006V23H14.0001V22.8431C16.5598 22.3326 18.7602 20.8786 20.2001 18.836C21.28 17.972 22 16.6358 22 15.1434C22 15.0256 22 14.9077 22 14.8289V10.8218L21.9985 10.8211ZM5.9988 11.2925V18.9922C4.19889 18.6386 2.79871 17.0277 2.79871 15.142C2.79871 13.2563 4.19889 11.6453 5.9988 11.2918V11.2925ZM13.1984 22.2141H10.7986V21.4281H13.1984V22.2141ZM17.9982 18.9922V11.2925C19.8379 11.6461 21.1983 13.257 21.1983 15.1427C21.1983 17.0284 19.8386 18.6393 17.9982 18.9929V18.9922Z"
                                fill="#731CE1"
                            />
                        </svg>
                        {messageDeduction["total_messages"]
                            ? messageDeduction["total_messages"]
                            : 0}
                    </div>
                </GlassCard>
            </div>

            <hr />

            <Row className="!mt-5 justify-center">
                <Col sm="12">
                    <div className="flex gap-3 items-center">
                        <h3 className="text-base font-semibold mb-0">
                            {props.translator["Expenses per account"]}{" "}
                        </h3>
                    </div>
                </Col>

                {/* <Slider {...settings}> */}
                <div className="grid grid-cols-3 !gap-4 !mt-2">
                    {accountDetails.map((account, index) => {
                        if (!showAccount && index > 5) return false;

                        return (
                            <GlassCard className="cursor-pointer">
                                <div
                                    className="flex !gap-4"
                                    onClick={() => showAccountDetail(account)}
                                >
                                    {/* <div className="w-9 h-9 border-4 rounded-full border-[#7CE186]">
                                        <img src="./img/profile.png" />
                                    </div> */}
                                    <div className="py-2">
                                        {account.service == "whatsapp" ? (
                                            <WhatsAppIcon />
                                        ) : account.service == "instagram" ? (
                                            <InstagramIcon
                                                width={35}
                                                height={35}
                                            />
                                        ) : account.service == "facebook" ? (
                                            <BsFacebook className="w-7 h-7 text-indigo-600" />
                                        ) : (
                                            ""
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex !gap-5 text-white">
                                            <div>
                                                Account name{" "}
                                                <span>- {account.name}</span>
                                            </div>
                                            <div>
                                                $
                                                {account.amount_data[
                                                    "total_amount"
                                                ] && (
                                                    <>
                                                        {" "}
                                                        {account.amount_data[
                                                            "total_amount"
                                                        ].toFixed(3)}{" "}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-white">
                                            {account.service[0].toUpperCase() +
                                                account.service.slice(1)}
                                        </div>
                                    </div>
                                </div>
                            </GlassCard>
                        );
                    })}
                </div>
                {/* </Slider> */}

                <div className="grid grid-cols-3 !gap-4 !mt-2">
                    <div className="card shadow-card">
                        <div
                            className="flex text-[#3D4459] !p-2 !gap-4 items-center justify-center cursor-pointer"
                            onClick={() =>
                                setShowAccount(showAccount ? false : true)
                            }
                        >
                            {showAccount
                                ? props.translator["Show Less"]
                                : props.translator["See all accounts"]}
                            <MdOpenInNew />
                        </div>
                    </div>
                </div>
            </Row>

            <hr />

            <Row className="!mt-5 justify-center !mb-2">
                <Col sm="12">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex gap-3 items-center">
                            <h3 className="text-base font-semibold mb-0">
                                {props.translator["Transactions History"]}{" "}
                            </h3>
                        </div>
                    </div>
                </Col>
            </Row>

            <GlassCard className="!p-4">
                <ListViewTable
                    module="Msg"
                    headers={props.msgTransactionList.list_view_columns}
                    records={transactionPreviewRecords}
                    translator={props.translator}
                    actions={{}}
                    hideToolMenu
                    fetchFields={false}
                    disableSorting
                    noCardBorder
                />

                <div className="mt-4 flex justify-center">
                    <a
                        href={route("listMessageLogs")}
                        target="_blank"
                        rel="noreferrer"
                        className="card shadow-card no-underline hover:no-underline"
                    >
                        <div className="flex text-[#3D4459] !p-2 !gap-4 items-center justify-center cursor-pointer">
                            {props.translator["See all transactions"]}
                            <MdOpenInNew />
                        </div>
                    </a>
                </div>
            </GlassCard>

            <hr />

            <Row className="!mt-5 justify-center !mb-2">
                <Col sm="12">
                    <div className="flex gap-3 items-center">
                        <h3 className="text-base font-semibold mb-0">
                            {props.translator["VAT Invoices"]}
                        </h3>
                    </div>
                </Col>
            </Row>

            <GlassCard className="!p-4">
                <ListView
                    module="Transaction"
                    currentPage="Expenses"
                    headers={props.transactionHistory.list_view_columns}
                    current_user={props.auth}
                    records={props.transactionHistory.records}
                    paginator={props.transactionHistory.paginator}
                    actions={props.transactionHistory.actions}
                    filter={props.transactionHistory.filter}
                    translator={props.translator}
                    showAll={showInvoices}
                    {...props.transactionHistory}
                    noCardBorder
                />
            </GlassCard>

            <div className="grid grid-cols-3 !gap-4 !mt-2">
                <div
                    className="card shadow-card"
                    onClick={() => showAllInvoices()}
                >
                    <div className="flex text-[#3D4459] !p-2 !gap-4 items-center justify-center cursor-pointer">
                        {showInvoices
                            ? props.translator["Show Less"]
                            : props.translator["See all invoices"]}
                        <MdOpenInNew />
                    </div>
                </div>
            </div>

            <hr />

            {/* <Row>
                <Col sm="6">
                    <div className="card rm-border widget-chart text-start gap-4">
                        <div className="flex justify-between items-center w-full">
                            <div className="flex justify-center items-center gap-4">
                                <div className="w-[60px] h-[60px] rounded-lg bg-[#1CB2E133] flex justify-center items-center">
                                    <svg
                                        width="32"
                                        height="30"
                                        viewBox="0 0 32 30"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M31.1503 8.75047L24.0707 0.350098H7.87072L0.791099 8.75047L0.251099 9.3501L0.731474 9.94972L15.9718 29.1501L31.6915 9.3501L31.1515 8.75047H31.1503ZM29.59 8.75047H17.53L23.5296 1.6101L29.59 8.75047ZM15.91 8.75047L9.6696 1.55047H22.03L15.91 8.75047ZM8.29035 1.73047L14.3507 8.75047H2.35035L8.29035 1.73047ZM15.37 9.94972V26.4501L2.22997 9.94972H15.37ZM16.5703 26.4501V9.94972H29.6507L16.5703 26.4501Z"
                                            fill="#079BCA"
                                        />
                                    </svg>
                                </div>
                                <div className="widget-chart-content">
                                    <div className="widget-subheading">
                                        Available balance
                                    </div>
                                    <div className="widget-numbers !mt-0">
                                        ${(balance).toFixed(3)}
                                    </div>
                                </div>
                            </div>
                            <Button 
                                color="primary"
                                onClick={() => setShowChargeForm()}
                            >
                                Add
                            </Button>
                        </div>
                    </div>
                </Col>
                <Col sm="6" className="self-stretch">
                    <div className="card rm-border widget-chart text-start gap-4 h-full">
                        <div className="flex justify-between items-center w-full">
                            <div className="flex justify-center items-center gap-4">
                                <div className="w-[60px] h-[60px] rounded-lg bg-[#1CE15F33] flex justify-center items-center">
                                    <svg
                                        width="36"
                                        height="37"
                                        viewBox="0 0 36 37"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M20.007 12.3496C18.0529 12.3496 16.4666 13.9347 16.4666 15.89C16.4666 17.8452 18.0529 19.4315 20.007 19.4315C21.9634 19.4315 23.5474 17.8464 23.5474 15.89C23.5474 13.9336 21.9622 12.3496 20.007 12.3496ZM20.007 18.2502C18.7065 18.2502 17.6467 17.1916 17.6467 15.8889C17.6467 14.5861 18.7054 13.5286 20.007 13.5286C21.3097 13.5286 22.3672 14.5872 22.3672 15.8889C22.3672 17.1905 21.3086 18.2502 20.007 18.2502Z"
                                            fill="#0AB644"
                                        />
                                        <path
                                            d="M5.84552 7.03809V24.74H34.1685V7.03809H5.84552ZM32.9895 11.0307V23.5598H7.02677V8.21821H32.9895V11.0307Z"
                                            fill="#0AB644"
                                        />
                                        <path
                                            d="M27.8392 25.9212H4.66535V9.39941H3.48523V27.1013H31.8094V25.9212H30.6292H27.8392Z"
                                            fill="#0AB644"
                                        />
                                        <path
                                            d="M25.479 28.2815H2.30512V11.7598H1.125V29.4616H29.4491V28.2815H28.269H25.479Z"
                                            fill="#0AB644"
                                        />
                                        <path
                                            d="M8.79639 9.43555H12.3368V10.6157H8.79639V9.43555Z"
                                            fill="#0AB644"
                                        />
                                        <path
                                            d="M8.79639 21.2007H12.3368V22.3808H8.79639V21.2007Z"
                                            fill="#0AB644"
                                        />
                                        <path
                                            d="M27.6783 9.43555H31.2187V10.6157H27.6783V9.43555Z"
                                            fill="#0AB644"
                                        />
                                        <path
                                            d="M27.6783 21.2007H31.2187V22.3808H27.6783V21.2007Z"
                                            fill="#0AB644"
                                        />
                                    </svg>
                                </div>
                                <div className="widget-chart-content">
                                    <div className="widget-subheading">
                                        Total spent this month
                                    </div>
                                    <div className="text-2xl font-medium !mt-0 ">
                                        ${messageDeduction['total_amount'] ? <>{(messageDeduction.total_amount).toFixed(3)}</> : 0 }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Col>
            </Row>
           
            <Row className="!mt-5">
                <Col sm="12">
                    <div className="flex gap-3 items-center">
                        <h3 className="text-base font-semibold mb-0">
                            Expenses per account{" "}
                        </h3>
                        <HiChevronUp size={"2em"} className="cursor-pointer" />
                    </div>
                    <hr className="my-3 px-2" />
                </Col>
            </Row> */}

            {/* <Row>
                {(props.message_account_detail).map(account => {
                    return(
                        <Col sm="6" className="self-start ">
                            <div className="card !flex-col rm-border widget-chart text-start h-full justify-center w-full">
                                <div className="grid grid-cols-12 items-center text-sm w-full border-b py-3">
                                    <div className="col-span-7">
                                        <div className="text-sm font-bold ">
                                            Account name -{" "} 
                                            <span className="font-normal">{account.name}</span>
                                        </div>
                                    </div>
                                    <div className="font-bold col-span-4">
                                        ${(account.amount_data['total_amount'])&&  <> {(account.amount_data['total_amount']).toFixed((3))} </>}
                                    </div>
                                    <div className="ml-auto">
                                        <HiChevronRight
                                            size={"2em"}
                                            onClick={() => showAccountDetail(account)}
                                            className="cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>
                        </Col>
                    )
               })}
            </Row> */}
            {/* <Row className="!mt-5">
                <Col sm="12">
                    <div className="flex gap-3 items-center">
                        <h3 className="text-base font-semibold mb-0">
                        Transaction history
                        </h3>
                        
                    </div>
                    <hr className="my-3 px-2" />
                </Col>
                <Col sm="12" >                   
                    <ListView
                        module={'Msg'}
                        headers={props.headers}
                        translator={props.translator}
                        records={props.records}
                        paginator={props.paginator}  
                        actions={props.actions}
                        filter={props.filter}      
                        sort_time={props.sort_time}          
                    /> 
                </Col>         
            </Row> */}

            {selectedAccount && (
                <Modal isOpen={modal} toggle={toggle}>
                    <ModalHeader
                        toggle={toggle}
                        className="!bg-transparent !border-b-0 !items-start"
                    >
                        <h4 className="!text-sm !font-semibold">
                            Account name
                            <span className="!font-normal">
                                {" "}
                                - {selectedAccount.name}
                            </span>
                        </h4>
                    </ModalHeader>
                    <ModalBody>
                        <div className="text-sm flex justify-between w-full mt-2">
                            <div className="flex flex-col">
                                <span className="text-[#B4B5BF]">
                                    {selectedAccount.service}
                                </span>
                                <span>{selectedAccount.number}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[#B4B5BF] text-base">
                                    Total cost
                                </span>
                                <span className="text-[#363740]  font-bold">
                                    $
                                    {selectedAccount.amount_data[
                                        "total_amount"
                                    ] && (
                                        <>
                                            {" "}
                                            {selectedAccount.amount_data[
                                                "total_amount"
                                            ].toFixed(3)}{" "}
                                        </>
                                    )}
                                </span>
                            </div>
                        </div>
                        <div className="text-[#6C6D7D] text-sm font-semibold mt-6">
                            Details
                        </div>
                        <table className="mb-0 table table-borderless mt-4">
                            {Object.entries(deductionTypes).map(
                                ([key, label]) => {
                                    return (
                                        <tr>
                                            <td>
                                                {selectedAccount.amount_data[
                                                    key
                                                ] ? (
                                                    <>
                                                        {
                                                            selectedAccount
                                                                .amount_data[
                                                                key
                                                            ].count
                                                        }{" "}
                                                    </>
                                                ) : (
                                                    <> 0 </>
                                                )}
                                            </td>
                                            <td>{label}</td>
                                            <td className="text-right">
                                                $
                                                {selectedAccount.amount_data[
                                                    key
                                                ] ? (
                                                    <>
                                                        {" "}
                                                        {
                                                            selectedAccount
                                                                .amount_data[
                                                                key
                                                            ].amount
                                                        }{" "}
                                                    </>
                                                ) : (
                                                    <> 0 </>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                },
                            )}
                        </table>
                    </ModalBody>
                </Modal>
            )}

        </>
    );
}
