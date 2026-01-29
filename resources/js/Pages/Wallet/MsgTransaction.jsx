import React, {useState} from "react";
import Axios from "axios";
import notie from 'notie';
import nProgress from 'nprogress';
import { Card, CardBody } from "reactstrap";
import StripeForm from "./StripeForm";
import ListView from "@/Components/Views/List/Index2";

function MessageTransaction(props) {

    const [paymentMethods, setPaymentMethods] = useState([]);
    const [isPaymentForm , setPaymentForm] = useState(false);
    const [showStripeForm, setShowStripeForm] = useState(false);

    function setShowChargeForm(){
        setPaymentForm(false);
        setShowStripeForm(true);
    }

    function fetchPaymentMethods(){
        Axios.get(route('getPaymentMethods')).then((response) => {
            setPaymentMethods(response.data.result);
        });
    }

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

    return(
        <> 
            <div className="p-4 w-1/2">
              <Card className="main-card">
                <CardBody className="flex !p-8 items-center justify-between flex-col sm:flex-row">
                    <div className="space-y-3">
                        <h4 className="font-semibold text-base">
                            {props.translator['Available Balance']}
                        </h4>
                        <p className="text-primary font-semibold text-4xl">
                            $ {props.balance}
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
            </div>
            
            <ListView 
                module={'Msg'}
                singular={'Transaction'}
                plural={'Transactions'}
                headers={props.transaction_columns}
                current_user={props.auth}
                records={props.msgTransactionList}
                paginator={props.transaction_paginator}
                actions={props.transaction_actions}
                {...props}
            />

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
        </>
        
    );
}

export default MessageTransaction;









