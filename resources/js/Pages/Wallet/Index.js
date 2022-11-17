import React, { useEffect, useState } from "react";
import StripeForm from "./StripeForm";
import PaymentMethodForm from "./PaymentMethodForm";
import Axios from "axios";
import notie from 'notie';
import nProgress from 'nprogress';
import { Link, Head } from "@inertiajs/inertia-react";
import axios from "axios";
import { CheckIcon, ChatAltIcon } from "@heroicons/react/outline";
import PlanUsage from "./PlanUsage";
import {
    Accordion,
    AccordionBody,
    AccordionHeader,
    AccordionItem,
    Table,
    ListGroupItem,
  } from 'reactstrap';
import {
    WhatsAppIcon,
    InstaIcon,
} from "../icons";

import { Row, Col, Card, CardBody, CardTitle } from "reactstrap";

function Wallet(props)
{
    const [balance, setBalance] = useState(0);

    const [paymentMethods, setPaymentMethods] = useState([]);

    const [showStripeForm, setShowStripeForm] = useState(false);

    const [paymentMethodForm, setPaymentMethodForm] = useState(false);

    const [messageDeduction , setMessageDeduction] = useState({});

    const [isPaymentForm , setPaymentForm] = useState(false);

    const [showDeductionDetail, setShowDeductionDetail] = useState();

    const deductionTypes = {
        'BIC': 'Business-initiated conversation',
        'UIC': 'User-initiated conversation',
        'FEP': 'Free entry point'
    } 

    const toggle = (id) => {
        if (showDeductionDetail === id) {
            setShowDeductionDetail();
        } else {
            setShowDeductionDetail(id);
        }
      };

    useEffect(() => {
        setBalance(props.balance);
        setPaymentMethods(props.paymentMethods);
        setMessageDeduction(props.message_deduction);
        
    }, [props.balance]);

    useEffect(()=>{},[paymentMethods]);

    /**
     * Fetch balance
     */
    function fetchWalletBalance() {
        nProgress.start(0.5);
        nProgress.inc(0.2);

        let endpoint_url = route('userBalance');
        Axios.get(endpoint_url).then((response) => {
            nProgress.done(true);
            if(response.data.status !== false) {
                setBalance(response.data.balance);
            }
            else {
                notie.alert({type: 'error', text: response.data.message, time: 5});
            }
        }).catch((error) => {
            nProgress.done(true);
            let error_message = 'Something went wrong';
            if(error.response) {
                error_message = error.response.data.message;
                if(error_message == undefined) {
                    error_message = error.response.statusText;
                }
            }
            else {
                error_message = error.message;
            }

            notie.alert({type: 'error', text: error_message, time: 5});
        });
    }

    /**
     * Show charge form
     */
    function setShowChargeForm(){
        setPaymentForm(false);
        setShowStripeForm(true);
    }

    /**
     * Fetch payment methods
     */
    function fetchPaymentMethods(){
        Axios.get(route('getPaymentMethods')).then((response) => {
            setPaymentMethods(response.data.paymentMethods);
        });
    }

    /**
     * Refresh Payment Methods
     */
    function refreshPaymentMethods()
    {
        nProgress.start(0.5);
        nProgress.inc(0.2);

        axios({
            method: 'get',
            url: route('getPaymentMethods'),
        })
        .then((response) => {
            nProgress.done(true);
            if(response.status == 200) {
                setPaymentMethods(response.data.paymentMethods);
            }
        });
    }

    return (
        <>
            <div className=" text-[#3D4459]">
                <div className="sm:grid grid grid-cols-2 gap-4 ">
                    <Card className="main-card">
                        <CardBody className="flex gap-4 items-center">
                            <div className="pl-4 w-40">
                                <svg
                                    width={80}
                                    height={83}
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M57.333 25.076V9.888c0-3.61 0-5.415-.759-6.524a4.333 4.333 0 0 0-2.847-1.825c-1.324-.225-2.96.531-6.232 2.044l-38.44 17.77c-2.918 1.348-4.377 2.023-5.446 3.07a8.682 8.682 0 0 0-2.108 3.3C1 29.133 1 30.743 1 33.963v21.495m58.5-2.17h.043M1 38.965v28.646c0 4.862 0 7.292.945 9.15a8.674 8.674 0 0 0 3.787 3.793c1.854.946 4.28.946 9.135.946h50.266c4.854 0 7.281 0 9.135-.946a8.674 8.674 0 0 0 3.787-3.794C79 74.903 79 72.473 79 67.611V38.965c0-4.861 0-7.292-.945-9.15a8.673 8.673 0 0 0-3.787-3.793c-1.854-.946-4.28-.946-9.135-.946H14.867c-4.854 0-7.281 0-9.135.946a8.674 8.674 0 0 0-3.787 3.794C1 31.673 1 34.104 1 38.966Zm60.667 14.323c0 1.199-.97 2.17-2.167 2.17a2.168 2.168 0 0 1-2.167-2.17c0-1.198.97-2.17 2.167-2.17 1.197 0 2.167.972 2.167 2.17Z"
                                        stroke="#3D4459"
                                        strokeWidth={2}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </div>
                            <div className="text-[#3D4459] space-y-2">
                                <h2 className="text-lg font-semibold">{props.translator['Hi']} {props.name}!</h2>
                                <p className="text-sm">{props.translator['Welcome to your Wallet']}</p>
                                <p className="text-sm">
                                    {props.translator['Here you can see your payments, change your payment method and get your invoices.']}
                                
                                </p>
                            </div>
                        </CardBody>
                    </Card>
                    <Card className="!bg-[#9BFFF2]">
                        <CardBody>
                            <CardTitle>{props.currentPlan.plan} - Plan</CardTitle>
                            <div className="grid grid-cols-2 p-2">
                                <div className="">
                                    <p className="flex text-gray-500 gap-2"><span className="w-5 h-5"><CheckIcon/></span>Monthly Fee</p>
                                    <p className="flex text-gray-500 gap-2"><span className="w-5 h-5"><CheckIcon/></span>1 Number for channel</p>
                                    <p className="flex text-gray-500 gap-2"><span className="w-5 h-5"><CheckIcon/></span>1 User for Workspace</p>
                                </div>
                                <div className="p-4 sm:flex sm:flex-row-reverse self-center">
                                    <Link
                                            href={route('updateSubscription')}
                                            className="w-full inline-flex justify-center rounded-md px-4 py-2 text-base font-medium btn btn-secondary sm:ml-3 sm:w-auto sm:text-sm"
                                            >
                                            Update
                                    </Link>
                                </div>
                            </div>
                        </CardBody>
                    </Card>                    
                </div>

                <div class="sm:grid grid-cols-2 gap-4 mt-4">
                    <div>
                    <Card className="main-card">
                        <CardBody className="flex !p-8 items-center justify-between flex-col sm:flex-row">
                            <div className="space-y-3">
                                <h4 className="font-semibold text-base">
                                    {props.translator['Available Balance']}
                                </h4>
                                <p className="text-primary font-semibold text-4xl">
                                    $ {balance}
                                </p>
                            </div>
                            <div>
                                <button
                                    type="button"
                                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bg-primary/80"
                                    onClick={() => setShowChargeForm()}
                                >
                                    {props.translator['Add Balance']}
                                </button>
                            </div>

                        </CardBody>
                    </Card>
                        

                        <h4 class="mt-3">
                            <span className="font-semibold text-base">
                                {props.translator['This Month']}
                            </span>
                        </h4>

                        <div class="grid gap-4 mt-4">
                            <PlanUsage
                                currentPlan = {props.currentPlan.plan}
                                balance = {balance}
                            />
                        </div>
                        <div class="grid grid-cols-1 gap-4 mt-4">
                            <Card className="main-card">
                                <CardBody class=" rounded-md  w-full  p-4 justify-center md:justify-start">
                                    <div className="flex justify-between flex-col w-full md:flex-row gap-3 md:gap-0">
                                        <div className="flex gap-1 font-semibold text-base">
                                        Total Spent
                                        </div>
                                        <div className="text-base font-semibold text-primary">
                                            $ {messageDeduction['total_amount'] ? <>{messageDeduction.total_amount}</> : 0 }
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        </div>
                        
                        {(props.message_accoount_detail).map(account => {
                            return(
                                <div class="grid grid-cols-1 gap-4 mt-4">
                                    <div class="bg-white rounded-md shadow w-full space-y-6 p-4 md:p-8 flex flex-col justify-center md:justify-start">
                                        <Accordion open={showDeductionDetail} toggle={toggle}>
                                            <AccordionItem>
                                                <AccordionHeader targetId={account.number}>
                                                    <div className="flex justify-between flex-col w-full md:flex-row gap-3 md:gap-0 items-center">
                                                        <div className="flex gap-2 font-semibold text-base items-center">
                                                            <div >
                                                                {account.service == 'whatsapp' ? 
                                                                    <WhatsAppIcon
                                                                        className="fill-current text-gray-500"
                                                                        width={36}
                                                                        height={36}
                                                                    />
                                                                :
                                                                    <InstaIcon
                                                                        className="fill-current text-gray-500"
                                                                        width={36}
                                                                        height={36}
                                                                    />
                                                                }
                                                            </div>
                                                            <div className="">
                                                                <div> {account.service} </div>
                                                                <div> {account.number} </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-base font-semibold text-primary">
                                                            ${account.amount_data['total_amount']}
                                                        </div>
                                                    </div>
                                                </AccordionHeader>
                                            
                                                <AccordionBody accordionId={account.number}>
                                                    <Table >
                                                        {Object.entries(deductionTypes).map(([key, label]) => {
                                                            return (
                                                            <tr>
                                                                <td> {label} </td>
                                                                <td> 
                                                                    <div className="flex">
                                                                        <ChatAltIcon
                                                                            className="h-6 w-6" 
                                                                        /> 
                                                                        {(account.amount_data[key]) ? 
                                                                            <>{account.amount_data[key].count} </>
                                                                        : 
                                                                            <> 0 </> }
                                                                    </div>
                                                                </td>
                                                                <td> 
                                                                    $
                                                                    {(account.amount_data[key]) ? 
                                                                        <> {account.amount_data[key].amount} </> 
                                                                    : <> 0 </> }
                                                                </td>
                                                            </tr>
                                                            )
                                                        })}
                                                    </Table>
                                                </AccordionBody>
                                            </AccordionItem>
                                        </Accordion>
                                    </div>
                                </div>
                            )
                        })}
                        
{/*                         
                        <div class="grid grid-cols-2 gap-4 mt-4">
                            <div class="bg-white rounded-md shadow w-full space-y-6 p-4 md:p-8 flex flex-col justify-center md:justify-start">
                                <span className="font-semibold text-base">
                                    {props.translator['Total Spent']}
                                </span>
                                <div className="flex justify-between flex-col md:flex-row gap-3 md:gap-0">
                                    <div className="flex gap-1">
                                        <svg
                                            width={21}
                                            height={21}
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M6 8.5h.01m4.49 0h.01m4.49 0h.01M5.5 16v2.335c0 .533 0 .8.11.937a.5.5 0 0 0 .39.188c.176 0 .384-.167.8-.5l2.385-1.908c.488-.39.731-.585 1.002-.724.241-.122.497-.212.762-.267.299-.061.61-.061 1.235-.061H14.7c1.68 0 2.52 0 3.162-.327a3 3 0 0 0 1.311-1.311c.327-.642.327-1.482.327-3.162V5.8c0-1.68 0-2.52-.327-3.162a3 3 0 0 0-1.311-1.311C17.22 1 16.38 1 14.7 1H6.3c-1.68 0-2.52 0-3.162.327a3 3 0 0 0-1.311 1.311C1.5 3.28 1.5 4.12 1.5 5.8V12c0 .93 0 1.395.102 1.777a3 3 0 0 0 2.122 2.12C4.105 16 4.57 16 5.5 16Zm1-7.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Zm4.5 0a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Zm4.5 0a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Z"
                                                stroke="#3D4459"
                                                strokeWidth={2}
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                        {messageDeduction['total_messages'] ? <>{messageDeduction.total_messages}</> : <>0</>}
                                    </div>
                                    <div className="text-base font-semibold text-primary">
                                        $ {messageDeduction['total_amount'] ? <>{messageDeduction.total_amount}</> : 0 }
                                    </div>
                                </div>
                            </div>

                            <div class="bg-white rounded-md shadow w-full space-y-6 p-4 md:p-8 flex flex-col justify-center md:justify-start">
                                <span className="font-semibold text-base">
                                    {props.translator['Business Initiated Chat']}
                                </span>
                                <div className="flex justify-between flex-col md:flex-row gap-3 md:gap-0">
                                    <div className="flex gap-1">
                                        <svg
                                            width={21}
                                            height={21}
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M6 8.5h.01m4.49 0h.01m4.49 0h.01M5.5 16v2.335c0 .533 0 .8.11.937a.5.5 0 0 0 .39.188c.176 0 .384-.167.8-.5l2.385-1.908c.488-.39.731-.585 1.002-.724.241-.122.497-.212.762-.267.299-.061.61-.061 1.235-.061H14.7c1.68 0 2.52 0 3.162-.327a3 3 0 0 0 1.311-1.311c.327-.642.327-1.482.327-3.162V5.8c0-1.68 0-2.52-.327-3.162a3 3 0 0 0-1.311-1.311C17.22 1 16.38 1 14.7 1H6.3c-1.68 0-2.52 0-3.162.327a3 3 0 0 0-1.311 1.311C1.5 3.28 1.5 4.12 1.5 5.8V12c0 .93 0 1.395.102 1.777a3 3 0 0 0 2.122 2.12C4.105 16 4.57 16 5.5 16Zm1-7.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Zm4.5 0a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Zm4.5 0a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Z"
                                                stroke="#3D4459"
                                                strokeWidth={2}
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                        {messageDeduction['BIC'] ?
                                            <>{messageDeduction.BIC.count}</>
                                            :
                                            <>0</>
                                        }
                                    </div>
                                    <div className="text-base font-semibold text-primary">
                                        $ {messageDeduction['BIC'] ?
                                            <>{messageDeduction.BIC.amount}</>
                                            :
                                            <>0</>
                                        }
                                    </div>
                                </div>
                            </div>

                            <div class="bg-white rounded-md shadow w-full space-y-6 p-4 md:p-8 flex flex-col justify-center md:justify-start">
                                <span className="font-semibold text-base">
                                    {props.translator['User Initiated Chat']}
                                </span>
                                <div className="flex justify-between flex-col md:flex-row gap-3 md:gap-0">
                                    <div className="flex gap-1">
                                        <svg
                                            width={21}
                                            height={21}
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M6 8.5h.01m4.49 0h.01m4.49 0h.01M5.5 16v2.335c0 .533 0 .8.11.937a.5.5 0 0 0 .39.188c.176 0 .384-.167.8-.5l2.385-1.908c.488-.39.731-.585 1.002-.724.241-.122.497-.212.762-.267.299-.061.61-.061 1.235-.061H14.7c1.68 0 2.52 0 3.162-.327a3 3 0 0 0 1.311-1.311c.327-.642.327-1.482.327-3.162V5.8c0-1.68 0-2.52-.327-3.162a3 3 0 0 0-1.311-1.311C17.22 1 16.38 1 14.7 1H6.3c-1.68 0-2.52 0-3.162.327a3 3 0 0 0-1.311 1.311C1.5 3.28 1.5 4.12 1.5 5.8V12c0 .93 0 1.395.102 1.777a3 3 0 0 0 2.122 2.12C4.105 16 4.57 16 5.5 16Zm1-7.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Zm4.5 0a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Zm4.5 0a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Z"
                                                stroke="#3D4459"
                                                strokeWidth={2}
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                        {messageDeduction['UIC'] ?
                                            <>{messageDeduction.UIC.count}</>
                                            :
                                            <>0</>
                                        }
                                    </div>
                                    <div className="text-base font-semibold text-primary">
                                        $ {messageDeduction['UIC'] ?
                                            <>{messageDeduction.UIC.amount}</>
                                            :
                                            <>0</>
                                        }
                                    </div>
                                </div>
                            </div>

                            <div class="bg-white rounded-md shadow w-full space-y-6 p-4 md:p-8 flex flex-col justify-center md:justify-start">
                                <span className="font-semibold text-base">
                                    {props.translator['Free Entry Point Chats']}
                                </span>
                                <div className="flex justify-between flex-col md:flex-row gap-3 md:gap-0">
                                    <div className="flex gap-1">
                                        <svg
                                            width={21}
                                            height={21}
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M6 8.5h.01m4.49 0h.01m4.49 0h.01M5.5 16v2.335c0 .533 0 .8.11.937a.5.5 0 0 0 .39.188c.176 0 .384-.167.8-.5l2.385-1.908c.488-.39.731-.585 1.002-.724.241-.122.497-.212.762-.267.299-.061.61-.061 1.235-.061H14.7c1.68 0 2.52 0 3.162-.327a3 3 0 0 0 1.311-1.311c.327-.642.327-1.482.327-3.162V5.8c0-1.68 0-2.52-.327-3.162a3 3 0 0 0-1.311-1.311C17.22 1 16.38 1 14.7 1H6.3c-1.68 0-2.52 0-3.162.327a3 3 0 0 0-1.311 1.311C1.5 3.28 1.5 4.12 1.5 5.8V12c0 .93 0 1.395.102 1.777a3 3 0 0 0 2.122 2.12C4.105 16 4.57 16 5.5 16Zm1-7.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Zm4.5 0a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Zm4.5 0a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Z"
                                                stroke="#3D4459"
                                                strokeWidth={2}
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                        0
                                    </div>
                                    <div className="text-base font-semibold text-primary">
                                        $ 0
                                    </div>
                                </div>
                            </div>

                            <div class="bg-white rounded-md shadow w-full space-y-6 p-4 md:p-8 flex flex-col justify-center md:justify-start">
                                <span className="font-semibold text-base">
                                    {props.translator['Messages']}
                                </span>
                                <div className="flex justify-between flex-col md:flex-row gap-3 md:gap-0">
                                    <div className="flex gap-1">
                                        <svg
                                            width={21}
                                            height={21}
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M6 8.5h.01m4.49 0h.01m4.49 0h.01M5.5 16v2.335c0 .533 0 .8.11.937a.5.5 0 0 0 .39.188c.176 0 .384-.167.8-.5l2.385-1.908c.488-.39.731-.585 1.002-.724.241-.122.497-.212.762-.267.299-.061.61-.061 1.235-.061H14.7c1.68 0 2.52 0 3.162-.327a3 3 0 0 0 1.311-1.311c.327-.642.327-1.482.327-3.162V5.8c0-1.68 0-2.52-.327-3.162a3 3 0 0 0-1.311-1.311C17.22 1 16.38 1 14.7 1H6.3c-1.68 0-2.52 0-3.162.327a3 3 0 0 0-1.311 1.311C1.5 3.28 1.5 4.12 1.5 5.8V12c0 .93 0 1.395.102 1.777a3 3 0 0 0 2.122 2.12C4.105 16 4.57 16 5.5 16Zm1-7.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Zm4.5 0a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Zm4.5 0a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Z"
                                                stroke="#3D4459"
                                                strokeWidth={2}
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                        {messageDeduction['messages'] ?
                                            <>{messageDeduction.messages.count}</>
                                            :
                                            <>0</>
                                        }
                                    </div>
                                    <div className="text-base font-semibold text-primary">
                                        $ {messageDeduction['messages'] ?
                                            <>{messageDeduction.messages.amount}</>
                                            :
                                            <>0</>
                                        }
                                    </div>
                                </div>
                            </div>

                            <div class="bg-white rounded-md shadow w-full space-y-6 p-4 md:p-8 flex flex-col justify-center md:justify-start">
                                <span className="font-semibold text-base">
                                    Media
                                </span>
                                <div className="flex justify-between flex-col md:flex-row gap-3 md:gap-0">
                                    <div className="flex gap-1">
                                        <svg
                                            width={21}
                                            height={21}
                                            viewBox="0 0 21 21"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M19.5 9.44839L10.4733 18.4626C8.42055 20.5125 5.09235 20.5125 3.03958 18.4626C0.986807 16.4126 0.986808 13.0891 3.03958 11.0391L12.0663 2.02496C13.4348 0.658346 15.6536 0.658346 17.0221 2.02496C18.3906 3.39158 18.3906 5.6073 17.0221 6.97392L8.34939 15.6346C7.66513 16.3179 6.55573 16.3179 5.87148 15.6346C5.18722 14.9513 5.18722 13.8434 5.87148 13.1601L13.4822 5.55993"
                                                stroke="#3D4459"
                                                strokeWidth={2}
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                        0
                                    </div>
                                    <div className="text-base font-semibold text-primary">
                                        $ 0
                                    </div>
                                </div>
                            </div>
                        </div>
                         */}
                    </div>

                    <div class="space-y-4 ">
                        <div class="bg-white rounded-md shadow w-full p-4 md:p-8">
                            <span className="font-semibold text-base">
                                {props.translator['Your Payment Method']}
                            </span>

                            <div className="payment-list mt-4 space-y-6">
                                {paymentMethods.length > 0 && paymentMethods.map((paymentMethod) => {
                                    return (
                                        <div className="payment-item sm:flex gap-4 space-y-2 sm:space-y-0">
                                            <div className="w-40 h-20 bg-red-200 rounded-lg "></div>
                                            <div>
                                                <h5 className="text-sm font-semibold capitalize">
                                                    {paymentMethod.card.brand}
                                                </h5>
                                                <div className="mt-3">
                                                    <p className="capitalize">{paymentMethod.card.funding}</p>
                                                    <p>************{paymentMethod.card.last4}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}

                                {paymentMethods.length == 0 ?
                                    <p className="p-5">No Payment Methods Added Yet</p>
                                : ''}

                            </div>

                            <div className="w-full flex justify-end mt-4">
                                <button
                                    type="button"
                                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bg-primary/80"
                                    onClick={() => setPaymentMethodForm(true)}
                                >
                                    {props.translator['Add a Payment Method']}
                                </button>
                            </div>
                        </div>

                        <Card>
                            <CardBody className="w-full flex justify-between items-center p-4">
                                <h5 className="text-base font-semibold mb-0">
                                {props.translator['See Transactions History']}
                                </h5>
                                <Link 
                                    href={route('listTransaction')}
                                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium btn btn-secondary"
                                >
                                    {props.translator['See Details']}
                                </Link>
                            </CardBody>
                        </Card>
{/* 
                        <div class="bg-white rounded-md shadow w-full flex justify-between items-center p-4 md:p-8">
                            <h5 className="text-base font-semibold">
                            {props.translator['Download your VAT Invoices']}
                            </h5>
                            <button
                                type="button"
                                //onClick={route('invoices' , {'id' : product_id})}
                                onClick={route('listTransaction')}
                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-700 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bg-gray-800"
                            >
                                {props.translator['Go to Invoices']}
                            </button>
                        </div> */}
                    </div>
                </div>
            </div>

            {showStripeForm ?
                <StripeForm 
                    setShowStripeForm={setShowStripeForm}
                    stripe_public_key={props.stripe_public_key}
                    fetchWalletBalance={fetchWalletBalance}
                    translator={props.translator}
                    isPaymentForm={isPaymentForm}
                    fetchPaymentMethods={fetchPaymentMethods}
                />
            : ''}

            {paymentMethodForm ?
                <PaymentMethodForm 
                    refreshPaymentMethods={refreshPaymentMethods}
                    setPaymentMethodForm={setPaymentMethodForm}
                    stripe_public_key={props.stripe_public_key}
                    translator={props.translator}
                />
            : ''}

        </>
    );
}

export default Wallet;
