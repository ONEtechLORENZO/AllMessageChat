import { Fragment, useEffect, useRef, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import ValidationErrors from '@/Components/ValidationErrors';
import notie from 'notie';
import nProgress from 'nprogress';
import axios from 'axios';

function PaymentMethodForm(props)
{
    const [open, setOpen] = useState(true)

    const cancelButtonRef = useRef(null)

    const [formErrors, setErrors] = useState({});

    const [stripePromise, setStripePromise] = useState(null);

    const [intent, setIntent] = useState(null);
    const [intentError, setIntentError] = useState('');
    const [loadingIntent, setLoadingIntent] = useState(true);

    useEffect(() => {
        if (props.stripe_public_key) {
            setStripePromise(loadStripe(props.stripe_public_key));
        } else {
            setIntentError('Stripe is not configured for this workspace.');
            setLoadingIntent(false);
            return;
        }
        createStripeSetupIntent();
    }, []);

    function createStripeSetupIntent() {
        setLoadingIntent(true);
        setIntentError('');
        axios({
            method: 'get',
            url: route('createStripeSetupIntent'),
        })
        .then((response) => {
            if(response.status == 200) {
                const setupIntent = response.data?.intent ?? null;
                setIntent(setupIntent);
                if (!setupIntent?.client_secret) {
                    setIntentError(
                        response.data?.message ||
                        props.translator['Payment methods are unavailable right now.']
                    );
                }
            }
        })
        .catch((error) => {
            setIntent(null);
            setIntentError(
                error.response?.data?.message ||
                props.translator['Payment methods are unavailable right now.']
            );
        })
        .finally(() => {
            setLoadingIntent(false);
        });
    }

    return (
        <Transition.Root show={open} as={Fragment}>
            <Dialog
                as="div"
                className="relative z-10"
                initialFocus={cancelButtonRef}
                onClose={() => {}}
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
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity" />
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
                            <Dialog.Panel className="relative overflow-hidden rounded-3xl bg-[#140816]/80 text-left text-white shadow-[0_25px_60px_-25px_rgba(56,189,248,0.35)] backdrop-blur-3xl sm:my-8 sm:max-w-xl sm:w-full">
                                <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#38bdf8]/50 to-transparent opacity-70" />
                                <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-40" />
                                <div className="px-6 pt-6 pb-2">
                                    <div className="sm:flex sm:items-start">
                                        <div className="text-center sm:mt-0 sm:text-left">
                                            <Dialog.Title
                                                as="h3"
                                                className="text-lg leading-6 mb-0 font-semibold text-white"
                                            >
                                                {props.translator["Add your Card"]}
                                            </Dialog.Title>
                                        </div>
                                    </div>
                                </div>

                                {Object.keys(formErrors).length > 0 ?
                                    <div className="px-6 pb-2">
                                        <ValidationErrors errors={formErrors} />
                                    </div>
                                : ''}

                                <div className="px-6 pb-6 space-y-4">
                                    {loadingIntent ? (
                                        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-5 text-sm text-white/70">
                                            {props.translator['Loading']}...
                                        </div>
                                    ) : null}

                                    {!loadingIntent && intentError ? (
                                        <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-4 text-sm text-amber-100">
                                            {intentError}
                                        </div>
                                    ) : null}

                                    {stripePromise && intent?.client_secret ?
                                        <Elements
                                            stripe={stripePromise}
                                            options={{ clientSecret: intent.client_secret }}
                                        >
                                            <Form
                                                {...props}
                                                cancelButtonRef={cancelButtonRef}
                                            />
                                        </Elements>
                                    : null}
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
                    if (typeof props.setPlanPage === 'function') {
                        props.setPlanPage();
                    }
                }
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-md border border-white/20 bg-[#0F0B1A] px-4 py-3 text-white shadow-sm">
                <CardElement />
            </div>
            <div className="pt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <button
                    className="border border-transparent rounded-md w-full sm:w-44 px-8 py-3 flex items-center justify-center text-lg leading-6 font-medium bg-primary text-white hover:brightness-110 md:px-10"
                    disabled={!stripe || loading}
                >
                    {loading ? 'Loading...' : 'Add'}
                </button>
                <button
                    type="button"
                    className="w-full sm:w-44 inline-flex justify-center rounded-md border border-white/20 shadow-sm px-4 py-3 bg-white/10 text-base font-medium text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-[#38bdf8]/50"
                    onClick={() => props.setPaymentMethodForm(false)}
                    ref={props.cancelButtonRef}
                >
                    {props.translator['Cancel']}
                </button>
            </div>
        </form>
    );
};

export default PaymentMethodForm;












