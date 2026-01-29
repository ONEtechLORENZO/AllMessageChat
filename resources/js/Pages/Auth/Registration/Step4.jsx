import React, {useState, useEffect, useRef} from "react";
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import ApplicationLogo from "@/Components/ApplicationLogo";
import nProgress from 'nprogress';
import axios from 'axios';
import notie from 'notie';

import { Input } from "reactstrap";

const Subscriptions = [
    {'msg' : '1,000', 'amount' : '€ 89'},
    {'msg' : '2,500', 'amount' : '€ 159'},
    {'msg' : '5,000', 'amount' : '€ 249'},
    {'msg' : '10,000', 'amount' : '€ 349'},
    {'msg' : '25,000', 'amount' : '€ 649'},
];

export default function Step4 (props) {

    const [formErrors, setErrors] = useState({});

    const [stripePromise, setStripePromise] = useState('');

    const [intent, setIntent] = useState({});

    useEffect(() => {
        setStripePromise(loadStripe(props.stripe_public_key));
        createStripeSetupIntent();
    }, []);

    function createStripeSetupIntent() {
        axios({
            method: 'get',
            url: route('createStripeSetupIntent'),
        })
        .then((response) => {
            if(response.status == 200) {
                setIntent(response.data.intent);
            }
        });
    }

    function Subscribe(){
       
        axios.post(route('subscribe_plan',{'plan': 'CONVERSATION_API'}), {user_id: props.user.id, is_register_step: true })
        .then((response) => {
            props.redirectDashBoard();
        });
    }

    return (
        <div className="h-screen w-full bg-blue-50 flex justify-center items-center">
            <div className="max-w-7xl flex mx-auto items-center px-10 h-screen">
                <div className="w-full bg-white flex justify-center py-8 rounded-xl px-4 lg:px-10 shadow-2xl">
                    <div className="py-8">
                        <div className="flex justify-end px-4 text-indigo-600 text-4xl font-semibold italic">
                           One message
                           <ApplicationLogo className="block h-90 w-auto text-gray-500 px-2" />
                        </div>

                        <div className=" mt-4">
                            <div className="flex justify-center font-semibold text-lg text-primary">Payment Method </div>
                        </div>

                        <div>
                            <table className="min-w-full mt-3">
                                <div className="flex justify-center font-semibold text-lg text-primary text-xl italic">
                                    Monthly Subscription for Conversation Bundles					 
                                </div>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {Subscriptions.map( (subscription) => (
                                     <tr key={''}>
                                       <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 flex justify-center">{subscription.msg}</td>
                                       <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{subscription.amount}</td>
                                     </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div>
                            {Object.keys(formErrors) > 0 ?
                                <div className='p-4'>
                                    <ValidationErrors errors={formErrors} />
                                </div>
                            : ''}

                            <div className='p-4 space-y-4'>
                                {stripePromise && intent.client_secret ?
                                    <Elements stripe={stripePromise} options={{clientSecret: intent.client_secret}}>
                                        <Form 
                                            Subscribe={Subscribe}
                                            {...props} 
                                        />
                                    </Elements>
                                : ''}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const Form = (props) => {
    const stripe = useStripe();

    const elements = useElements();

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {

        event.preventDefault();
    
        if (!stripe || !elements) {
            // Stripe.js has not yet loaded.
            return;
        }

        const element = elements.getElement(CardElement);

        setLoading(true);
        const result = await stripe.createPaymentMethod({
            type: 'card',
            card: element,
        });

        if (result.error) {
            notie.alert({type: 'error', text: result.error.message, time: 5});
            setLoading(false);
        } else {
            nProgress.start(0.5);
            nProgress.inc(0.2);

            axios({
                method: 'post',
                url: route('relatePaymentMethod'),
                data: {
                    id: result.paymentMethod.id,
                }
            })
            .then((response) => {
                nProgress.done(true);
                notie.alert({type: 'success', text: response.data.message, time: 5});
                setLoading(false);

                if(response.data.status == true) {
                   // props.setPaymentMethodForm(false);
                   // props.refreshPaymentMethods();
                   props.Subscribe();
                }
            });
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <CardElement />
            <div className='pt-10'>
                <button
                    className="border border-transparent rounded-md w-full px-8 py-4 flex items-center justify-center text-lg leading-6 font-medium bg-primary text-white md:px-10"
                    disabled={!stripe || loading}
                >
                    {loading ? 'Loading...' : 'Subscribe'}
                </button>
            </div>
        </form>
    );
};









