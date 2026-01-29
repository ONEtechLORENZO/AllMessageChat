

import React, { useState } from "react";
import WalletTable from "./WalletTable";
import ListView from "@/Components/Views/List/Index2";
import { Row, Col, Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import { CiCircleInfo } from "react-icons/ci";
import { PopoverHeader, PopoverBody, UncontrolledPopover } from "reactstrap";

export default function PricesInvoices(props) {

    const [modal, setModal] = useState(false);
    const toggle = () => setModal(!modal);

    return (
        <>
            <Row className="!mt-10">
                <Col sm="12">
                    <div className="">
                        <h3 className="text-base font-semibold mb-0">{props.translator['Prices']}</h3>
                        <p className="mt-1 text-[#878787]">
                            {props.translator['Here you can find the invoices of all the transactions made through OneMessage.']}
                        </p>
                    </div>
                    <hr className="my-3 px-2" />
                </Col>
            </Row>
            <Row className="!mt-4">
                <Col
                    sm="12"
                    md="3"
                    className="text-center font-semibold text-base"
                >
                    <span className="!mt-6 block"></span>{props.translator['Included in your plan']}
                </Col>
                <Col sm="12" md="9" className="grid grid-cols-3 gap-3">
                    <div className="card flex gap-[20px] flex-row p-[20px]">
                        <img
                            src="./img/instagram-icon.png"
                            alt="One message logo"
                            className="w-8"
                        />
                        <span className="font-semibold text-base">
                            Instagram
                        </span>
                    </div>
                    <div className="card flex gap-[20px] flex-row p-[20px]">
                        <img
                            src="./img/facebook-icon.png"
                            alt="One message logo"
                            className="w-8"
                        />
                        <span className="font-semibold text-base">
                            Facebook
                        </span>
                    </div>
                    <div className="card flex gap-[20px] flex-row p-[20px] ">
                        <img
                            src="./img/Telegram-icon.png"
                            alt="One message logo"
                            className="w-8"
                        />
                        <span className="font-semibold text-base">
                            Telegram
                        </span>
                    </div>
                </Col>
            </Row>
            <Row className="!mt-4">
                <Col
                    sm="12"
                    md="3"
                    className="text-center font-semibold text-base"
                >
                    <span className="!mt-6 block"></span>{props.translator['With extra costs']}
                </Col>
                <Col sm="12" md="9" className="grid grid-cols-3 gap-3">
                    <div className="card flex gap-[20px] flex-row p-[20px]">
                        <img
                            src="./img/WhatsApp-icon.png"
                            alt="One message logo"
                            className="w-8 self-center"
                        />
                        <div>
                            <span className="font-semibold text-base block">
                                Whatsapp
                            </span>
                            <a className="btn btn-link !p-0 !text-base" onClick={toggle}>
                                {props.translator['See prices']}
                            </a>
                        </div>
                    </div>
                </Col>
            </Row>
            {/* <Row className="!mt-6">
                <Col sm="12">
                    <div className="">
                        <h3 className="text-base font-semibold mb-0">{props.translator['VAT Invoices']}</h3>
                        <p className="mt-1 text-[#878787]">
                        {props.translator['Here you can find the invoices of all the transactions made through OneMessage.']}
                        </p>
                    </div>
                    <hr className="my-3 px-2" />
                </Col>      
                <Col sm="12" >                    
                        
                <ListView
                    module='Transaction'
                    headers={props.headers}
                    {...props}
                    translator={props.translator}
                    records={props.records}
                   paginator={props.paginator}
                   currentPage='Invoice'
                /> 
                 
                </Col>         
            </Row> */}

            <Modal isOpen={modal} toggle={toggle}>

                <ModalBody>

                    <div className="flex justify-center flex-col items-center mt-14">
                        <img
                            src="./img/WhatsApp-icon.png"
                            alt="One message logo"
                            className="w-8 self-center"
                        />
                        <div className="!mt-3 text-lg font-semibold">Whatsapp</div>
                        <div className="!mt-1 text-sm text-[#6C6D7D]">{props.translator['Price list']}</div>
                    </div>

                    <div className="!mt-8 space-y-3">
                        <div className="text-base font-semibold">{props.translator['Free']}</div>
                        <div className="text-sm flex gap-2 items-center">{props.translator['First 1.000 conversations']}
                            <CiCircleInfo className="cursor-pointer" id="first_conversation" />
                            <HoverPopUp target={'first_conversation'} message={"Every month the first 1000 conversations are free.These conversations can be initiated by the user or by the company.Even if there are multiple numbers associated with the same account,the conversations remain 1000 in total."} />
                        </div>

                        <div className="text-sm flex gap-2 items-center">{props.translator['Free entry point chats']}
                            <CiCircleInfo className="cursor-pointer" id="free_entry" />
                            <HoverPopUp target={'free_entry'} message={"Conversations are not charged if users message the business using call-to-action buttons on Ads linking to WhatsApp or a call-to-action button on the Facebook page.Free access point conversations can only be initiated by the user.The first conversation starting from the access point is free,subsequent conversations with the user are paid."} />
                        </div>
                    </div>
                    <div className="!mt-8 space-y-3">
                        <div className="text-base font-semibold">{props.translator['Initial Costs']}</div>
                        <div className="text-sm flex gap-2 items-center">{props.translator['Business Initiated Chat Meta Cost']}
                            <CiCircleInfo className="cursor-pointer" id="business_initiated" />
                            <HoverPopUp target={'business_initiated'} message={"If a conversation initiated by a company in which a message is sent to a user outside the 24h customer support window.Messages that start a company-initiated conversation require a message template."} />
                        </div>
                        <div className="text-sm flex gap-2 items-center">{props.translator['User Initiated Chat Meta Cost']}
                            <CiCircleInfo id="user_initiated" className="cursor-pointer" />
                            <HoverPopUp target={'user_initiated'} message={"It is the cost to receive a request for assistance from a user.You can send free messages within a 24-hour window of the user's first message"} />
                        </div>
                    </div>
                    <div className="!mt-4 space-y-3">
                        {props.translator['The cost varies according to the geographic region.For official meta information on pricing']}
                        <a href="https://developers.facebook.com/docs/whatsapp/pricing/" target="_blank"> {props.translator['Click here']}</a>
                    </div>
                </ModalBody>

            </Modal>

        </>

    );
}

const HoverPopUp = (props) => {
    return (
        <UncontrolledPopover
            placement="top"
            target={props.target}
            trigger="hover"
            transition={{ timeout: 150 }}
        >
            <PopoverHeader></PopoverHeader>
            <PopoverBody>
                {props.message}
            </PopoverBody>
        </UncontrolledPopover>
    )
}









