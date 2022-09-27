import { Fragment, useEffect, useRef, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useElements, useStripe, PaymentElement } from '@stripe/react-stripe-js';
import notie from 'notie';
import Axios from 'axios';
import nProgress from 'nprogress';
import axios from 'axios';

function PaymentMethodForm(props)
{
    const [open, setOpen] = useState(true)

    const cancelButtonRef = useRef(null)

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

    return (
        <Transition.Root show={open} as={Fragment}>
            <Dialog as="div" className="relative z-10" initialFocus={cancelButtonRef} onClose={() => {}} >
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                </Transition.Child>

                <div className="fixed z-10 inset-0 overflow-y-auto">
                    <div className="flex items-end sm:items-center justify-center min-h-full p-4 text-center sm:p-0">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-xl sm:w-full">
                                <div className="bg-gray-50 px-4 pt-5 pb-4 sm:p-4 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mt-3 text-center sm:mt-0 sm:text-left">
                                            <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                                                {props.translator['Add Payment Method']}
                                            </Dialog.Title>
                                        </div>
                                    </div>
                                </div>

                                {Object.keys(formErrors) > 0 ?
                                    <div className='p-4'>
                                        <ValidationErrors errors={formErrors} />
                                    </div>
                                : ''}

                                <div className='p-4 space-y-4'>
                                    {stripePromise && intent.client_secret ?
                                        <Elements stripe={stripePromise} options={{clientSecret: intent.client_secret}}>
                                            <Form {...props} />
                                        </Elements>
                                    : ''}
                                </div>

                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="button"
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                        onClick={() => props.setPaymentMethodForm(false)}
                                        ref={cancelButtonRef}
                                    >
                                        {props.translator['Cancel']}
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    )
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
                    props.setPaymentMethodForm(false);
                    props.refreshPaymentMethods();
                    props.setPlanPage();
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
                    {loading ? 'Loading...' : 'Add'}
                </button>
            </div>
        </form>
    );
};

export default PaymentMethodForm;