import { Fragment, useEffect, useRef, useState } from 'react';
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { AiFillCaretDown, AiFillCaretUp, AiOutlineInfoCircle } from "react-icons/ai";
import { Disclosure } from '@headlessui/react'
import { Dialog, Transition } from '@headlessui/react';
import { Elements, CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { router as Inertia } from "@inertiajs/react";
import nProgress from 'nprogress';
import axios from 'axios';
import notie from 'notie';



const subscriptionPlan = [
  'CONVERSATION_API', 'STARTER', 'PRO', 'BUSINESS', 'CUSTOM'
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function PlanSubscription(props) {

  const [showFeatures, setShowFeatures] = useState(false);
  const [plans, setPlan] = useState(props.plans);
  const [showForm, setShowForm] = useState(false);
  const [subscriptionId, setSubscriptionId] = useState();
  const [status, setStatus] = useState('new');
  const hasPlans = Array.isArray(plans) && plans.length > 0;

  const tiers = [
    {
      name: 'Api only',
      isFree: true,
      href: '#',

      description: 'Short sentence to indicate what type of business is this plan aimed at.',
      includedFeatures: ['Particularity of the plan', 'Particularity of the plan'],
      btnText: 'Start for free',
      plan: 'Api'
    },
    {
      name: 'Starter',
      href: '#',
      priceMonthly: '€15',
      description: 'Short sentence to indicate what type of business is this plan aimed at.',
      includedFeatures: ['Particularity of the plan', 'Particularity of the plan',],
      btnText: 'Choose Plan',
      plan: 'Starter'
    },
    {
      name: 'Pro',
      href: '#',
      priceMonthly: '€30',
      description: 'Short sentence to indicate what type of business is this plan aimed at.',
      includedFeatures: [
        'Particularity of the plan',
        'Particularity of the plan',
        'Particularity of the plan',
      ],
      btnText: 'Choose Plan',
      plan: 'Pro'
    },
    {
      name: 'Business',
      href: '#',
      priceMonthly: '€50',
      description: 'Short sentence to indicate what type of business is this plan aimed at.',
      includedFeatures: [
        'Particularity of the plan',
        'Particularity of the plan',
        'Particularity of the plan',
        'Particularity of the plan',
      ],
      btnText: 'Choose Plan',
      plan: 'Business'
    },
    {
      name: 'Enterprise',
      href: '#',
      isEnterprice: true,
      description: 'Short sentence to indicate what type of business is this plan aimed at.',
      includedFeatures: [
        'Particularity of the plan',
        'Particularity of the plan',
        'Particularity of the plan',
        'Particularity of the plan',
        'Particularity of the plan',
        'Particularity of the plan',
      ],
      btnText: 'Contact sales',
      plan: 'Enterprise'
    },
  ]

  const sections = [
    {
      header: 'Active users',
      rows: [
        { label: 'Monthly Max Active Users', name: 'active_users' }
      ]
    },
    {
      header: 'CRM',
      rows: [
        { label: 'CRM Leads', name: 'crm_leads' },
        { label: 'CRM Contacts', name: 'crm_contacts' },
        { label: 'Organization', name: 'crm_organizations' },
        { label: 'Deals', name: 'crm_deals' },
        { label: 'Custom Fields', name: 'crm_custom_fields' },
      ]
    },
    {
      header: 'Conversations',
      rows: [
        { label: 'Broadcasting (Campaigns)', name: 'campaigns' },
        { label: '121 Chats', name: 'chat_conversation' },
      ]
    },
    {
      header: 'Automations',
      rows: [
        { label: 'Visual Workflow Designer Builder', name: 'workflows' },
        { label: 'Number of Operations per month', name: 'workflow_operations' },
      ]
    },
    {
      header: 'Sales Features',
      rows: [
        { label: 'Product Catalogs', name: 'product_category' },
        { label: 'Sales Orders', name: 'sale_orders' },
      ]
    },
    {
      header: 'Analytics',
      rows: [
        { label: 'Analytics Reports', name: 'reports' },
      ]
    },
    {
      header: 'API Endpoints',
      rows: [
        { label: 'Conversations', name: 'api_conversation' },
        { label: 'Leads, Deals, Contacts & Organizations', name: 'api_module_access' },
        { label: 'Products & Orders', name: 'api_product_order' },
      ]
    },
  ];

  useEffect(() => {
    if (props.status) {
      setStatus('update');
    }
  }, []);

  if (props.errors && props.errors.message) {
    notie.alert({ type: 'warning', text: props.errors.message, time: 5 });
  }

  function buySubscription(planStatus, view, subscribe_id) {
    axios.post(route('subcription_complete')).then((response) => {
      props.redirectDashBoard();
    })
    //waxios.post(route('subcription_complete')).then( (response) => {})
    /*
    if('CUSTOM' == subscribe_id) {
      return false;
    }
    let checkUpdate = checkToChangePlan(subscribe_id);
    if(checkUpdate){
      if(planStatus == 'update') {
        confirmToSubscribe(subscribe_id);
      } else {
          let show = view ? false : true;
          setShowForm(show);
      }
      setSubscriptionId(subscribe_id);
    }
    */
  }

  function checkToChangePlan(plan_id) {
    let checkUpdate = false;
    const current_plan = props.company.plan;
    let current_plan_index = '';
    let update_plan_index = '';
    subscriptionPlan.map((plan, index) => {
      if (plan == current_plan) {
        current_plan_index = index;
      }
      if (plan == plan_id) {
        update_plan_index = index
      }
    });

    if (current_plan_index < update_plan_index) {
      checkUpdate = true;
    } else if (current_plan_index == update_plan_index) {
      if (status != 'new') {
        notie.alert({ type: 'error', text: 'You are already in this plan.', time: 5 });
      } else {
        checkUpdate = true;
      }
    } else {
      notie.alert({ type: 'warning', text: 'You are not able downgrade your plan.', time: 5 });
    }

    return checkUpdate;
  }

  function confirmToSubscribe(id) {

    if (id == 'CUSTOM') {
      return false;
    }

    let confirm = window.confirm('Are you sure to update your plan?');

    if (confirm) {
      let url = route('subscribe_plan', { 'plan': id });
      let data = { status: 'update', user_id: props.user.id }

      Inertia.post(url, data, {
        onSuccess: (response) => {
          if (response) {
            notie.alert({ type: 'success', text: 'Your plan has been updated.', time: 5 });
          }
        }
      });
    }
  }

  function Subscribe() {
    axios.post(route('subscribe_plan', { 'plan': subscriptionId }), { user_id: props.user.id, is_register_step: true, status: 'new' })
      .then((response) => {
        props.redirectDashBoard();
      });
  }

  function redirectToHome() {
    if (status == 'update') {
      Inertia.get(route('home'), {}, {});
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0b0611] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(191,0,255,0.28),transparent_65%)]" />
        <div className="absolute -bottom-52 right-0 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.18),transparent_70%)]" />
      </div>
        <div className="relative mx-auto max-w-7xl py-24 px-4 sm:px-6 lg:px-8">
        <div className="sm:align-center sm:flex sm:flex-col">
          <div className="w-full p-2 flex justify-center items-center flex-col text-center">
            <div className="w-full flex justify-center items-center" onClick={() => redirectToHome()}>
              <span className="text-5xl sm:text-6xl font-semibold tracking-tight">
                <span className="one-tech-special">One</span>
                <span className="text-white"> message</span>
              </span>
            </div>
            <h1 className="text-[32px] sm:text-[38px] font-bold !mt-6 text-white">
              {props.translator['We have finally arrived']}
            </h1>
            <p className="text-white/60 text-base sm:text-lg max-w-2xl">
              {props.translator['let us drop anchor.']}
            </p>

            <p className="text-base font-semibold text-white/70 !mt-8">
              {props.translator['Choose the right plan for you.']}
            </p>
          </div>
        </div>

        <div className="mt-12 space-y-4 sm:mt-16 sm:grid sm:grid-cols-2 sm:gap-6 sm:space-y-0 lg:grid-cols-3 lg:gap-8 xl:mx-0 xl:max-w-none xl:grid-cols-5">
          {tiers.map((tier) => {
            const isFeatured = tier.plan === 'Pro';

            const headingColor = tier.isEnterprice ? 'text-white' : 'text-white';
            const textColor = tier.isEnterprice ? 'text-white/70' : 'text-white/60';
            const cardClass = tier.isEnterprice
              ? 'bg-[#1b0f24]/90 border border-[#BF00FF]/40'
              : tier.isFree
                ? 'bg-[#0F0B1A]/80 border border-white/15'
                : 'bg-[#140816]/80 border border-white/10';
            const btnColor = tier.isFree
              ? 'border border-white/30 text-white/80 hover:border-[#BF00FF]/70 hover:text-white'
              : tier.isEnterprice
                ? 'bg-white text-[#0b0611] hover:bg-white/90'
                : 'bg-[#BF00FF] text-white hover:bg-[#a100df]';

            if (hasPlans) {
              let isShowable = false;
              plans.forEach(plan => {
                if (plan.plan == tier.plan) {
                  isShowable = true;
                }
              })
              if (!isShowable) {
                return null;
              }
            }
            const matchedPlan = hasPlans
              ? plans.find((p) => p.plan === tier.plan)
              : { plan_id: tier.plan };

            return (
              <div
                key={tier.name}
                className={[
                  "relative rounded-2xl shadow-[0_18px_40px_rgba(0,0,0,0.35)] backdrop-blur-2xl",
                  "flex flex-col justify-between items-start transition-all duration-300",
                  "hover:-translate-y-1 hover:shadow-[0_30px_60px_rgba(0,0,0,0.5)]",
                  "group",
                  cardClass,
                  isFeatured ? "ring-1 ring-[#BF00FF]/40" : "",
                ].join(" ")}
              >
                {isFeatured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-widest bg-[#BF00FF] text-white shadow-[0_10px_25px_rgba(191,0,255,0.35)]">
                    Most popular
                  </div>
                )}
                <div className="p-6 w-full">
                  <div className="flex items-center justify-center gap-2">
                    <h2 className={`text-xl font-bold text-center ${headingColor}`}>{props.translator[tier.name]}</h2>
                    {tier.isFree && (
                      <span className="rounded-full border border-[#BF00FF]/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-[#BF00FF]">
                        Free
                      </span>
                    )}
                  </div>
                  <p className={`mt-4 text-sm text-center ${textColor}`}>{props.translator[tier.description]}</p>
                  <div className={`mt-8 ${textColor} ${(tier.isFree || tier.isEnterprice) ? 'hidden' : ''}`}>
                    <div className="flex items-center gap-1">
                      <span className="text-right">
                        <span className="text-4xl font-semibold leading-8 -tracking-[2%] text-white">{tier.priceMonthly}</span><br />
                        <span className="text-base font-normal tracking-tight text-white/60">{props.translator['per month']}</span>
                      </span>
                      <span className="text-[64px] font-extralight leading-5 text-white/30">/</span>
                      <span className="text-base font-bold text-white/70">{props.translator['user']}</span>
                    </div>
                  </div>

                  <p className={`py-4 text-2xl text-center leading-8 font-semibold ${tier.isFree ? 'text-white' : textColor} ${(tier.isFree || tier.isEnterprice) ? '' : 'hidden'}`}>
                    {(tier.isFree) ? props.translator['Free'] : props.translator['Contact us']}
                  </p>

                  <ul role="list" className="mt-6 space-y-4 !pl-0">
                    {tier.includedFeatures.map((feature, idx) => (
                      <li key={`${tier.plan}-feature-${idx}`} className="flex space-x-3">
                        <span className={`text-sm ${textColor}`}>{props.translator[feature]}</span>
                      </li>
                    ))}
                  </ul>

                </div>
                <div className="p-6 w-full !mb-6">
                  {matchedPlan && (
                    <button
                      className={`block w-full rounded-md py-2 text-center text-sm font-bold transition ${btnColor}`}
                      onClick={() => buySubscription(status, showForm, matchedPlan.plan_id)}
                    >
                      {props.translator[tier.btnText]}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div className="w-full text-center !mt-6 flex flex-col items-center">
          {/* <p className="text-sm">Write here if the prices include taxes or not</p> */}
          {/* <p className="text-[#7653FF] text-base flex gap-2 items-center" onClick={() => setShowFeatures(!showFeatures)}>{props.translator['View all plan features']} {(showFeatures) ? <AiFillCaretDown size={'1.5rem'} className='cursor-pointer'/> : <AiFillCaretUp size={'1.5rem'} className='cursor-pointer'/> }</p> */}
        </div>

        {showFeatures &&
          <div className='w-full mt-10 rounded-2xl border border-white/10 bg-[#120815]/70 p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]'>
            <div className='grid grid-cols-7 font-semibold text-xl leading-8 border-b border-white/10 !pb-4'>
              <div className='col-span-2 text-white/60'>
                {props.translator['Features']}
              </div>
              <div className='text-center text-white/80'>{props.translator['Api only']}</div>
              <div className='text-center text-white/80'>{props.translator['Starter']}</div>
              <div className='text-center text-white/80'>{props.translator['Pro']}</div>
              <div className='text-center text-white/80'>{props.translator['Business']}</div>
              <div className='text-center text-white/80'>{props.translator['Enterprise']}</div>
            </div>

            {sections.map((section) => (
              <div key={section.header} className="space-y-3 !mt-6">
                <Disclosure as="div" className="!py-3 !px-6 !pr-7 relative rounded-2xl border border-white/10 bg-[#0F0B1A]/80">
                  {({ open }) => (
                    <>
                      <Disclosure.Button className="flex w-full items-start justify-between text-left text-white/70">
                        <span className="px-2 text-xl font-semibold text-white mb-2">
                          {props.translator[section.header]}
                        </span>
                        <span className="ml-6 flex h-7 items-center">
                          <AiFillCaretDown
                            size="1.5rem"
                            className={classNames(open ? "-rotate-180" : "rotate-0", "transform cursor-pointer text-[#BF00FF]")}
                          />
                        </span>
                      </Disclosure.Button>

                      <Disclosure.Panel as="dd" className="mt-1">
                        {section.rows.map((row) => (
                          <div key={`${section.header}-${row.name}`} className="grid grid-cols-7 items-center">
                            <div className="font-normal text-base items-center py-2 px-2 text-white/70">
                              {props.translator[row.label]}
                            </div>

                            <div className="font-normal text-base flex justify-end text-white/50">
                              <AiOutlineInfoCircle className="cursor-pointer" />
                            </div>

                            {plans.map((plan) => {
                              let value = plan[row.name];

                              if (value === "-") value = "∞";
                              else if (value === "true") value = <CheckIcon className="h-5 w-5 text-green-500" />;
                              else if (value === "false") value = <XMarkIcon className="h-5 w-5 text-red-900" />;

                              const content =
                                (plan.plan === "Starter" || plan.plan === "Pro") &&
                                  (row.name === "product_category" || row.name === "sale_orders")
                                  ? `+${value}${props.translator["€/user"]}`
                                  : value;

                              return (
                                <div key={`${section.header}-${row.name}-${plan.plan}`} className="flex justify-center">
                                  {content}
                                </div>
                              );
                            })}
                          </div>
                        ))}
                      </Disclosure.Panel>
                    </>
                  )}
                </Disclosure>
              </div>
            ))}
          </div>
        }
      </div>

      {showForm &&
        <BuyPlan
          setShowForm={setShowForm}
          Subscribe={Subscribe}
          {...props}
        />
      }
    </div>
  )
}

const BuyPlan = (props) => {

  const [formErrors, setErrors] = useState({});

  const [stripePromise, setStripePromise] = useState('');

  const [intent, setIntent] = useState({});
  const [open, setOpen] = useState(true)

  const cancelButtonRef = useRef(null);

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
        if (response.status == 200) {
          setIntent(response.data.intent);
        }
      });
  }

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" initialFocus={cancelButtonRef} onClose={() => { }} >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/70 transition-opacity" />
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
              <Dialog.Panel className="relative rounded-2xl border border-white/10 bg-[#120815] text-left overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.55)] transform transition-all sm:my-8 sm:max-w-xl sm:w-full">
                <div>
                  <div className="bg-white/5 px-4 pt-2 pb-2 sm:p-4 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                      <div className="mt-3 text-center sm:mt-0 sm:text-left">
                        <Dialog.Title as="h3" className="text-lg leading-6 font-bold text-white">
                          {props.translator['Add your Card']}
                        </Dialog.Title>
                      </div>
                    </div>
                  </div>

                  {Object.keys(formErrors) > 0 ?
                    <div className='p-4'>
                      <ValidationErrors errors={formErrors} />
                    </div>
                    : ''}

                  <div className='p-8 space-y-4'>
                    {stripePromise && intent.client_secret ?
                      <Elements stripe={stripePromise} options={{ clientSecret: intent.client_secret }}>
                        <Form
                          Subscribe={props.Subscribe}
                          {...props}
                        />
                      </Elements>
                      : ''}
                  </div>

                  <div className="bg-white/5 px-4 py-3 sm:px-3 sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-white/20 shadow-sm px-4 py-2 bg-white/5 text-base font-medium text-white/70 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#BF00FF]/40 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={() => props.setShowForm(false)}
                      ref={cancelButtonRef}
                    >
                      {props.translator['Cancel']}
                    </button>
                  </div>
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
  const cardElementOptions = {
    style: {
      base: {
        color: "#ffffff",
        fontSize: "16px",
        fontFamily: "inherit",
        "::placeholder": {
          color: "rgba(255,255,255,0.5)"
        }
      },
      invalid: {
        color: "#fca5a5"
      }
    }
  };

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
      notie.alert({ type: 'error', text: result.error.message, time: 5 });
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
          notie.alert({ type: 'success', text: response.data.message, time: 5 });
          setLoading(false);

          if (response.data.status == true) {
            props.Subscribe();
            props.setShowForm(false);
          }
        });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="rounded-lg border border-white/15 bg-[#0F0B1A] p-3">
        <CardElement options={cardElementOptions} />
      </div>
      <div className='pt-10'>
        <button
          className="w-full rounded-md px-8 py-4 flex items-center justify-center text-lg leading-6 font-semibold bg-[#BF00FF] text-white shadow-[0_12px_25px_rgba(191,0,255,0.35)] transition hover:bg-[#a100df] md:px-10"
          disabled={!stripe || loading}
        >
          {loading ? 'Loading...' : 'Subscribe'}
        </button>
      </div>
    </form>
  );
};













