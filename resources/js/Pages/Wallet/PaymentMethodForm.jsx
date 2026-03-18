import { Fragment, useEffect, useRef, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import ValidationErrors from '@/Components/ValidationErrors';
import notie from 'notie';
import nProgress from 'nprogress';
import axios from 'axios';

const cardElementOptions = {
    hidePostalCode: true,
    style: {
        base: {
            color: '#FFFFFF',
            fontSize: '16px',
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            fontSmoothing: 'antialiased',
            iconColor: 'rgba(255,255,255,0.8)',
            '::placeholder': {
                color: 'rgba(255,255,255,0.62)',
            },
        },
        invalid: {
            color: '#FCA5A5',
            iconColor: '#FCA5A5',
        },
    },
};

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
                            <Dialog.Panel className="relative overflow-hidden rounded-3xl border border-white/12 bg-[#170C1E] text-left text-white shadow-[0_30px_80px_rgba(0,0,0,0.45)] sm:my-8 sm:max-w-xl sm:w-full">
                                <div className="px-6 pt-6 pb-2">
                                    <div className="sm:flex sm:items-start">
                                        <div className="text-center sm:mt-0 sm:text-left">
                                            <Dialog.Title
                                                as="h3"
                                                className="mb-0 text-2xl font-semibold leading-6 text-white"
                                            >
                                                {props.translator["Add your Card"]}
                                            </Dialog.Title>
                                            <p className="mt-2 text-sm text-white/72">
                                                Save a payment card for future charges.
                                            </p>
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
                                        <div className="rounded-2xl border border-white/12 bg-white/[0.03] px-4 py-4 text-sm text-white">
                                            Preparing the secure card form...
                                        </div>
                                    ) : null}

                                    {!loadingIntent && intentError ? (
                                        <div className="rounded-2xl border border-amber-300/30 bg-amber-400/10 px-4 py-4 text-sm text-amber-50">
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
            <div className="space-y-2">
                <label htmlFor="card-element" className="block text-sm font-medium text-white">
                    Card details
                </label>
                <div
                    id="card-element"
                    className="rounded-2xl border border-white/20 bg-[#24112C] px-4 py-4 text-white shadow-sm"
                >
                    <CardElement options={cardElementOptions} />
                </div>
                <p className="text-sm text-white/68">
                    Enter card number, expiry date, and CVC.
                </p>
            </div>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                    className="inline-flex w-full items-center justify-center rounded-xl bg-white px-6 py-3 text-base font-semibold text-[#170C1E] transition hover:bg-white/90 disabled:cursor-not-allowed disabled:bg-white/70 sm:w-44"
                    disabled={!stripe || loading}
                >
                    {loading ? 'Saving card...' : 'Add card'}
                </button>
                <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-xl border border-white/25 bg-transparent px-4 py-3 text-base font-medium text-white hover:bg-white/6 focus:outline-none focus:ring-2 focus:ring-white/20 sm:w-44"
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












