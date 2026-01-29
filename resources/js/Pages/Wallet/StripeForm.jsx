import { Fragment, useEffect, useRef, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import notie from 'notie';
import Axios from 'axios';
import nProgress from 'nprogress';
import Input from '@/Components/Input';

function StripeForm(props)
{
    const [open, setOpen] = useState(true)

    const cancelButtonRef = useRef(null)

    const [formErrors, setErrors] = useState({});

    const [stripePromise, setStripePromise] = useState('');

    useEffect(() => {
        setStripePromise(loadStripe(props.stripe_public_key));
    }, []);

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
                                <div className="bg-gray-50 px-4 sm:p-3">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mt-3 text-center sm:mt-0 sm:text-left">
                                            <Dialog.Title as="h3" className="text-lg leading-6 font-semibold text-gray-900">
                                            {props.isPaymentForm ?
                                                <> Add payment details </>
                                                :
                                                <> {props.translator['Recharge your account']} </>
                                            }
                                           
                                            </Dialog.Title>
                                        </div>
                                    </div>
                                </div>

                                {Object.keys(formErrors) > 0 ?
                                    <div className='p-4'>
                                        <ValidationErrors errors={formErrors} />
                                    </div>
                                : ''}

                                <div className='px-4 py-2 space-y-4'>
                                    {stripePromise ?
                                        <Elements stripe={stripePromise}>
                                            <CheckoutForm {...props} />
                                        </Elements>
                                    : ''}
                                </div>

                                <div className="bg-gray-50 px-4 py-1 sm:px-6 sm:flex sm:flex-row-reverse mb-3">
                                    <button
                                        type="button"
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                        onClick={() => props.setShowStripeForm(false)}
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

const CheckoutForm = (props) => {
    const stripe = useStripe();

    const elements = useElements();

    const [loading, setLoading] = useState(false);

    const [amount, setAmount] = useState(0);

    function handleChange(event) {
        let result = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
        if(result){
            result = result.replace(/[^0-9\.]/g,'');
            if(result.split('.').length>2){
                result = result.replace(/\.+$/,"")
            } 
        }
        setAmount(result);
    }

    const handleSubmit = async (event) => {

        event.preventDefault();
    
        if (!stripe || !elements) {
            // Stripe.js has not yet loaded.
            return;
        }

        if(amount < 50 && !(props.isPaymentForm)) {
            notie.alert({type: 'warning', text: 'Add Balance above 50$.', time: 5});
            return;
        }

        setLoading(true);
        const result = await stripe.createPaymentMethod({
            type: 'card',
            card: elements.getElement(CardElement),
        });

        if (result.error) {
            notie.alert({type: 'error', text: result.error.message, time: 5});
            setLoading(false);
        } else {
            // Subscribe the user
            nProgress.start(0.5);
            nProgress.inc(0.2);
            
            var url = route('charge'); 
            if(props.isPaymentForm){
                url = route('store_payment_method');
            }

            const config = {
                url: url,
                method: 'POST',
                data: {
                    id: result.paymentMethod.id,
                    amount: amount,
                },
            };

            Axios(config).then((response) => {
                setLoading(false);
                nProgress.done(true);
                if(response.data.status == true || response.data.status == 'true') {
                    notie.alert({type: 'success', text: response.data.message, time: 5});
                    props.setShowStripeForm(false);
                    props.fetchWalletBalance();
                    props.fetchPaymentMethods();
                }
                else {
                    notie.alert({type: 'error', text: response.data.message, time: 5});
                }
            }).catch((error) => {
                setLoading(false);
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
    };

    return (
        <form onSubmit={handleSubmit}>
            {! props.isPaymentForm &&
                <div className='form-group py-4 pb-6'>
                    <label htmlFor='amount' className="block text-sm font-medium text-gray-700">
                        {props.translator['Enter the amount']} <span className='text-red-600'>*</span>
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none px-2">
                            <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <Input 
                            id="amount" 
                            name="amount" 
                            value={amount} 
                            handleChange={handleChange} 
                            className={`pl-6 mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-skin-primary focus:border-skin-primary sm:text-sm`} 
                        />    
                    </div>
                </div>
            }
            <CardElement />
            <div className='pt-10'>
                <button
                    className="border border-transparent rounded-md w-full px-8 py-4 flex items-center justify-center text-lg leading-6 font-medium bg-primary text-white md:px-10"
                    disabled={!stripe || loading}
                >
                    {loading ? 'Loading...' : <> {props.isPaymentForm ? 'Add' : 'Charge'} </>}
                </button>
            </div>
        </form>
    );
  };

export default StripeForm;









