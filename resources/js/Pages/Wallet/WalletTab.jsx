import React, { useEffect, useState } from "react";
import PaymentMethodForm from "./PaymentMethodForm";
import notie from 'notie';
import nProgress from 'nprogress';
import axios from "axios";
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { Row, Col, Button } from "reactstrap";
import { HiOutlineTrash } from "react-icons/hi";
import { BsPlusCircle } from "react-icons/bs";
import { CirclePlusIcons } from "../icons";
import { Link } from '@inertiajs/react';
import { router as Inertia } from "@inertiajs/react";

export default function WalletTab(props) {
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [paymentMethodForm, setPaymentMethodForm] = useState(false);
    const [defaultPaymentMethod, setDefaultPaymentMethod] = useState(props.defaultPaymentMethod);
    const [balance, setBalance] = useState(props.balance);
    const [addOn, setAddOn] = useState(props.add_on);
    const [plans, setPlans] = useState(props.plans); 

    useEffect(() => {       
        setPaymentMethods(props.paymentMethods);
    }, [props.balance]);

    useEffect(()=>{},[paymentMethods]);

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

    /**
     * Update default payment method
     * 
     * @param {String} paymentMethod 
     */
    function updateDefaultPaymentMethod(paymentMethodId){
        nProgress.start(0.5);
        nProgress.inc(0.2);

        axios({
            method: 'post',
            data: { 'payment_method_id': paymentMethodId},
            url: route('setDefaultPaymentMethod'),
        })
        .then((response) => {
            nProgress.done(true);
            if(response.data.status){
                setDefaultPaymentMethod(paymentMethodId)
                notie.alert({type: 'success', text: response.data.message, time: 5});
            } else {
                notie.alert({type: 'success', text: response.data.message, time: 5});
            }
        });
    }

    /**
     * Delete payment method
     * 
     * @param {string} paymentMethodId 
     */
    function confirmDeletePaymentMethod(id) {
        confirmAlert({
            title: (props.translator['Confirm to Delete']),
            message: (props.translator['Are you sure to do this?']),
            buttons: [
            {
              label: (props.translator['Yes']),
              onClick: () => {
                deletePaymentMethod(id);
              }
            },
            {
              label: 'No',
              onClick: () => {}
            }
          ]
        });
    }

    function deletePaymentMethod(paymentMethodId){
       
        nProgress.start(0.5);
        nProgress.inc(0.2);

        axios({
            method: 'post',
            data: { 'payment_method_id': paymentMethodId},
            url: route('deletePaymentMethod'),
        })
        .then((response) => {
            nProgress.done(true);
            if(response.data.status){
                notie.alert({type: 'success', text: response.data.message, time: 5});
                refreshPaymentMethods();
            } else {
                notie.alert({type: 'error', text: response.data.message, time: 5});
            }
        });
    }

    function addUser() {
        let role = props.auth.user.role;
        if(role == 'admin') {
            Inertia.get(route('wallet_subscription', { tab: 'users'}));
        } else {
            notie.alert({type: 'warning', text: 'Admin only create new user.', time: 5});
        }
    }

    return (
        <>
            <div>

                {/* <Row>
                    <Col sm="2">
                      <div className="pr-4">
                        <div className="text-gray-700 font-semibold ml-3">{props.translator['Your Balance']}</div>
                        <div className="flex justify-center items-center gap-4 mt-2">
                            <div className="w-[60px] h-[60px] rounded-lg bg-[#1CE15F33] flex justify-center items-center">
                                <svg width="36" height="37" viewBox="0 0 36 37" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M20.007 12.3496C18.0529 12.3496 16.4666 13.9347 16.4666 15.89C16.4666 17.8452 18.0529 19.4315 20.007 19.4315C21.9634 19.4315 23.5474 17.8464 23.5474 15.89C23.5474 13.9336 21.9622 12.3496 20.007 12.3496ZM20.007 18.2502C18.7065 18.2502 17.6467 17.1916 17.6467 15.8889C17.6467 14.5861 18.7054 13.5286 20.007 13.5286C21.3097 13.5286 22.3672 14.5872 22.3672 15.8889C22.3672 17.1905 21.3086 18.2502 20.007 18.2502Z" fill="#0AB644"/>
                                    <path d="M5.84552 7.03809V24.74H34.1685V7.03809H5.84552ZM32.9895 11.0307V23.5598H7.02677V8.21821H32.9895V11.0307Z" fill="#0AB644"/>
                                    <path d="M27.8392 25.9212H4.66535V9.39941H3.48523V27.1013H31.8094V25.9212H30.6292H27.8392Z" fill="#0AB644" />
                                    <path d="M25.479 28.2815H2.30512V11.7598H1.125V29.4616H29.4491V28.2815H28.269H25.479Z" fill="#0AB644" />
                                    <path d="M8.79639 9.43555H12.3368V10.6157H8.79639V9.43555Z" fill="#0AB644"/>
                                    <path d="M8.79639 21.2007H12.3368V22.3808H8.79639V21.2007Z" fill="#0AB644" />
                                    <path d="M27.6783 9.43555H31.2187V10.6157H27.6783V9.43555Z" fill="#0AB644"/>
                                    <path d="M27.6783 21.2007H31.2187V22.3808H27.6783V21.2007Z" fill="#0AB644" />
                                </svg>
                            </div>
                            <div className="widget-chart-content">
                                <div className='flex gap-2 items-center '>
                                    <div className="text-2xl font-medium !mt-0 ">
                                    ${props.balance ? <>{(balance).toFixed(3)}</> : 0 }
                                    </div>
                                </div>
                            </div>
                        </div>
                       </div>
                    </Col>

                    <Col sm="4">
                        <div className="space-y-1 flex flex-col">
                            <div className="flex gap-1 items-center">
                                <Button color="primary" className="w-[140px]">
                                    {props.translator['Top up']}
                                </Button>{" "}
                                <span>Min ${props.currentCompany.amount_limit}</span>
                            </div>

                            <div className="flex gap-1 items-center">
                                <Button className="w-[140px]">
                                {props.translator['Set auto top up']}
                                </Button>
                                <span>
                                {props.translator['Currently']}:{" "}
                                    <span className="font-bold">{props.translator['OFF']}</span>
                                </span>
                            </div>
                        </div>
                    </Col>
                </Row> */}
                
            </div>

            {/* <hr className="my-3 px-2" /> */}

            <div>
                <Row className="!mt-10">
                    <Col sm="12">
                        <div className="flex gap-3 items-center">
                            <h3 className="text-base font-semibold mb-0">
                            {props.translator['Your payment methods']}
                            </h3>
                        </div>
                    </Col>
                </Row>

                <Row className="!mt-4">
                {paymentMethods.length > 0 && paymentMethods.map((paymentMethod) => {
                return(            
                        <Col sm="6" className="my-3 px-2">
                            <div className="card p-4">
                                <div className="flex justify-between">
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <img src="./img/visa-card.png" />

                                            <div className="text-[#3D4459] text-sm flex flex-col">
                                                <span className="font-bold">{paymentMethod.card.brand}</span>
                                                <span>{paymentMethod.card.holder}</span>
                                                <span>************{paymentMethod.card.last4}</span>
                                            </div>
                                        </div>
                                        <label className="!mt-5">
                                            <input 
                                                type="radio"  
                                                name="payment" 
                                                checked={(defaultPaymentMethod == paymentMethod.id)}
                                                onClick={() => updateDefaultPaymentMethod(paymentMethod.id)}
                                            />
                                            <span className="pl-2">{props.translator['Primary method']}</span>
                                        </label>
                                    </div>
                                    <div className="flex gap-2"  >
                                        {/* <MdOutlineEdit
                                            size="1.5rem"
                                            className="text-[#6C6D7D] cursor-pointer"
                                        /> */}

                                        <button type="button" onClick={() => confirmDeletePaymentMethod(paymentMethod.id)}>
                                            <HiOutlineTrash
                                                size="1.5rem"
                                                className="text-[#6C6D7D] "
                                            />
                                        </button>
                                        
                                    </div>
                                </div>
                                <span/>
                            </div>
                        </Col>
                    )
                })}
                </Row>
                <div className="flex text-primary gap-2 items-center mt-6 cursor-pointer">
                    <div className="flex " onClick={() => setPaymentMethodForm(true)}>
                        <BsPlusCircle size="1.5em" className="mr-2" /> {props.translator['Add method']}
                    </div>
                </div>
            </div>

            <hr className="my-3 px-2" />

            <div>
                <Row className="!mt-8 mb-3">
                    <Col sm="12">
                        <div className="flex gap-3 items-center">
                            <h3 className="text-base font-semibold mb-0 text-gray-800">
                            {props.translator['Add Ons']}
                            </h3>
                        </div>
                    </Col>
                </Row>

                <Row>
                    <Col sm="2">
                        <div className="card !shadow-card  p-4 h-full">
                            <div className="flex flex-col items-center gap-2">
                                <svg width={32} height={32} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M27.0117 14.7139C27.0117 8.79968 22.1565 4 16.1738 4C10.1912 4 5.33594 8.79968 5.33594 14.7139V19.0853H5.37902C5.37902 19.2138 5.37902 19.3424 5.37902 19.4284C5.37902 22.2569 7.67698 24.5712 10.5383 24.5712V14.2856H10.4952C8.67436 14.2856 7.11367 15.1856 6.20326 16.5999V14.7139C6.20326 9.27137 10.6683 4.8566 16.1746 4.8566C21.681 4.8566 26.146 9.27057 26.146 14.7139V16.5999C25.2356 15.2282 23.6318 14.2856 21.8541 14.2856H21.811V24.5712H21.8541C22.2874 24.5712 22.6775 24.5286 23.1116 24.4C21.811 25.6432 20.2073 26.4998 18.3864 26.9289V25.4286H14.0076V28H18.3426V27.8288C21.1169 27.272 23.5018 25.6857 25.0625 23.4575C26.233 22.5149 27.0134 21.0572 27.0134 19.4292C27.0134 19.3006 27.0134 19.1721 27.0134 19.0861V14.7147L27.0117 14.7139ZM9.67012 15.2282V23.6278C7.71925 23.2421 6.20164 21.4847 6.20164 19.4276C6.20164 17.3705 7.71925 15.6131 9.67012 15.2274V15.2282ZM17.4736 27.1426H14.8724V26.2852H17.4736V27.1426ZM22.6759 23.6278V15.2282C24.6699 15.6139 26.1444 17.3713 26.1444 19.4284C26.1444 21.4855 24.6707 23.2429 22.6759 23.6286V23.6278Z" fill="#545CD8"/>
                                </svg>

                                <div className="text-sm text-[#363740] font-normal">
                                    {props.translator['Social accounts']}
                                </div>

                                <div className="text-[#363740] text-xl font-normal">
                                    {addOn.total_account}/{(addOn.max_account == '-' || addOn.max_account == 'Custom') ? '∞': addOn.max_account}
                                </div>

                                <div className="flex gap-1 items-center text-sm text-[#545CD8]">
                                    <Link 
                                        href={route('social_profile')}
                                        className='d-flex gap-1 items-center px-4 py-2 font-semibold text-sm text-gray-700 hover:text-indigo-700'
                                        > 
                                        <CirclePlusIcons/><span className="text-[#545CD8]"> {props.translator['Add account']}</span> 
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </Col>

                    <Col sm="2">
                        <div className="card !shadow-card  p-4 h-full">
                            <div className="flex flex-col items-center gap-2">
                                <svg width={32} height={32} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M16 3.20508C8.93302 3.20508 3.20502 8.93308 3.20502 16.0001C3.20502 23.0671 8.93302 28.7951 16 28.7951C23.067 28.7951 28.795 23.0671 28.795 16.0001C28.795 8.93308 23.067 3.20508 16 3.20508ZM16 4.27108C22.467 4.27108 27.729 9.53208 27.729 16.0001C27.729 18.8451 26.71 21.4571 25.018 23.4901C23.849 23.0021 21.088 22.0441 19.38 21.5391C19.234 21.4931 19.211 21.4861 19.211 20.8791C19.211 20.3781 19.417 19.8741 19.618 19.4471C19.836 18.9831 20.094 18.2031 20.187 17.5031C20.446 17.2021 20.799 16.6081 21.026 15.4771C21.225 14.4801 21.132 14.1171 21 13.7771C20.986 13.7411 20.972 13.7061 20.961 13.6701C20.911 13.4361 20.98 12.2221 21.15 11.2791C21.268 10.6321 21.12 9.25708 20.229 8.12008C19.667 7.40108 18.591 6.51908 16.626 6.39608L15.548 6.39708C13.616 6.51908 12.54 7.40108 11.978 8.12008C11.088 9.25708 10.94 10.6331 11.058 11.2791C11.23 12.2221 11.297 13.4361 11.249 13.6661C11.239 13.7061 11.224 13.7411 11.209 13.7771C11.078 14.1181 10.984 14.4801 11.184 15.4771C11.41 16.6081 11.763 17.2021 12.023 17.5031C12.115 18.2031 12.373 18.9831 12.592 19.4471C12.751 19.7861 12.826 20.2481 12.826 20.9011C12.826 21.5081 12.803 21.5151 12.667 21.5581C10.9 22.0801 8.08802 23.0961 7.03902 23.5551C5.31402 21.5131 4.27102 18.8761 4.27102 16.0001C4.27102 9.53308 9.53202 4.27108 16 4.27108ZM7.81102 24.3861C9.01202 23.8961 11.405 23.0421 12.978 22.5781C13.892 22.2901 13.892 21.5201 13.892 20.9011C13.892 20.3881 13.857 19.6321 13.557 18.9931C13.351 18.5551 13.115 17.8041 13.063 17.2171C13.052 17.0801 12.987 16.9521 12.883 16.8621C12.732 16.7301 12.425 16.2461 12.229 15.2691C12.074 14.4961 12.14 14.3271 12.203 14.1631C12.23 14.0931 12.256 14.0241 12.277 13.9471C12.405 13.4791 12.262 11.9421 12.107 11.0891C12.039 10.7181 12.125 9.66508 12.818 8.77808C13.44 7.98308 14.381 7.54008 15.582 7.46308L16.593 7.46208C17.826 7.54008 18.767 7.98308 19.39 8.77808C20.084 9.66508 20.168 10.7181 20.1 11.0901C19.946 11.9421 19.802 13.4801 19.93 13.9471C19.952 14.0251 19.977 14.0941 20.004 14.1641C20.068 14.3271 20.133 14.4971 19.979 15.2701C19.783 16.2471 19.475 16.7311 19.324 16.8631C19.221 16.9541 19.156 17.0811 19.144 17.2181C19.093 17.8061 18.858 18.5561 18.652 18.9941C18.416 19.4961 18.144 20.1651 18.144 20.8801C18.144 21.4991 18.144 22.2691 19.068 22.5601C20.573 23.0051 22.978 23.8311 24.248 24.3301C22.127 26.4301 19.213 27.7301 16 27.7301C12.817 27.7301 9.92702 26.4531 7.81202 24.3881L7.81102 24.3861Z" fill="#545CD8" />
                                </svg>

                                <div className="text-sm text-[#363740] font-normal">
                                {props.translator['Users']}
                                </div>

                                <div className="text-[#363740] text-xl font-normal">
                                    {addOn.total_users}/{addOn.max_users == '-' ? '∞': addOn.max_users}
                                </div>

                                <div className="flex gap-1 items-center text-sm text-[#545CD8]">
                                    <button 
                                        onClick={() => addUser()}
                                        className='d-flex gap-1 items-center px-4 py-2 font-semibold text-sm text-gray-700 hover:text-indigo-700'
                                    > 
                                        <CirclePlusIcons/><span className="text-[#545CD8]"> {props.translator['Add user']}</span> 
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Col>
                    
                    {addOn.max_workflow === 'true' ? 
                       <Col sm="2">
                        <div className="card !shadow-card  p-4 h-full">
                            <div className="flex flex-col items-center gap-2">
                                <svg width={32} height={32} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" >
                                    <path d="M23.456 18.0981V15.4751H16.113V13.9021H20.834V3.41309H10.344V13.9021H15.065V15.4751H7.72198V18.0981H3.00098V28.5881H13.491V18.0981H8.76998V16.5241H22.407V18.0981H17.686V28.5881H28.176V18.0981H23.455H23.456ZM11.392 4.46209H19.784V12.8531H11.392V4.46209ZM12.441 27.5391H4.04898V19.1471H12.441V27.5391ZM27.128 27.5391H18.736V19.1471H27.128V27.5391Z" fill="#545CD8" />
                                </svg>

                                <div className="text-sm text-[#363740] font-normal text-center">
                                {props.translator['Automations']}
                                    <span className="text-gray-500 px-2 text-[12px]">({props.translator['Monthly']})</span>
                                </div>

                                <div className="text-[#363740] text-xl font-normal">
                                    {addOn.total_workflow}/∞
                                </div>

                                <div className="flex gap-1 items-center text-sm text-[#545CD8]">
                                    <Link 
                                        href={route('listAutomation')}
                                        className='d-flex gap-1 items-center px-4 py-2 font-semibold text-sm text-gray-700 hover:text-indigo-700'
                                        > 
                                        <CirclePlusIcons/><span className="text-[#545CD8]"> {props.translator['Add tasks']}</span> 
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </Col>
                    : ''}
                </Row>
            </div>


            {/* <hr className="my-3 px-2" />
            <div>
                <Row className="!mt-10 mb-3">
                    <Col sm="12">
                        <div className="flex gap-3 items-center">
                            <h3 className="text-base font-semibold mb-0">
                            {props.translator['Manage your plan']}
                            </h3>
                        </div>
                    </Col>
                </Row>

                <Row>
                    {(plans).map( (plan, index) => {

                        let button_text = '';
                        if(plan.plan == 'Api' || plan.plan == 'Enterprise') {
                            return false;
                        }

                        if(addOn.current_plan_index == index) {
                            button_text = (props.translator['Current Plan'])
                        } else if (addOn.current_plan_index > index) {
                            button_text = 'Downgrade :('
                        } else {
                            button_text = props.translator['Upgrade :)']
                        }
                        return(
                            <Col sm="3">
                                <div className="card !shadow-card !p-4 h-full !bg-[#ECE8FA]">
                                    <div className="flex flex-col justify-center items-center !gap-4">
                                        <div className="text-[#7653FF] font-semibold text-xl"> {plan.name} </div>
        
                                        <div className="flex items-center gap-1">
                                            <span className="text-right">
                                                <span className="text-3xl font-semibold leading-8 -tracking-[2%] text-gray-900">${plan.price}</span>
                                                <br />
                                                <span className="text-base font-normal tracking-tight text-[#363740]">{props.translator['per month']}</span>
                                            </span>
                                            <span className="text-[64px] font-extralight leading-5"> / </span>
                                            <span className="text-base font-bold"> {props.translator['user']} </span>
                                        </div>
        
                                        <div> {props.translator['Start your conversational marketing journey with a basic plan, includes integration with popular messaging platforms.']} </div>
        
                                        <Link href={route('update_plan')} className="space-y-1">
                                            <button 
                                               className={`block w-full rounded-md !shadow-card py-2 px-2 text-center text-sm font-bold bg-[#7653FF] text-white`}>
                                                {button_text}
                                            </button>
                                            <button 
                                                className={`block w-full rounded-md !shadow-card py-2 px-2 text-center text-sm font-bold bg-white text-[#363740]`}
                                            >
                                                {props.translator['See features']}
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            </Col>
                        );
                    })}
                </Row>

                <Row className="!mt-2">
                    <div className="w-auto">
                        <div className="bg-[#363740] !px-6 !py-4 flex gap-6 items-center text-white">
                            <div className="text-xl font-semibold">{props.translator['Enterprise']}</div>
                            <div className="leading-6">
                            {props.translator['Short sentence to indicate what type of business is this plan aimed at.']}
                            </div>
                            <Link href={route('update_plan')} className="space-y-1">
                                <button className={`block w-full rounded-md !shadow-card py-2 px-2 text-center text-sm font-bold bg-white text-[#363740]`}>
                                {props.translator['Contact sales']}
                                </button>
                                <button className={`block w-full rounded-md py-2 px-2 text-center text-sm font-normal text-white`}>
                                {props.translator['See features']}
                                </button>
                            </Link>
                        </div>
                    </div>
                </Row>
            </div> */}

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












