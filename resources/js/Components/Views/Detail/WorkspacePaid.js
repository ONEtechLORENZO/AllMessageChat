import React, {useEffect, useState} from "react";
import { Switch } from '@headlessui/react'
import { Inertia } from "@inertiajs/inertia";
import { confirmAlert } from 'react-confirm-alert';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function WorkspacePaid (props) {

    const [enabled, setEnabled] = useState(false)
    const [company, setCompany] = useState(props.company);

    useEffect( () => {
        if(props.company.payment_method == 'Postpaid') {
            setEnabled(true);
        }
    },[]);

    function ChangePaymentMethod(pay) {
        
        let method = '';

        method = pay == 'Prepaid' ? 'Postpaid' : 'Prepaid' ;

        let payment = {'method': method,'id' : company.id };

        confirmAlert({
            message: ('Are you sure you want to change the payment method?'),
            buttons: [
            {
                label: ('Confirm'),
                onClick: () => {   
                    Inertia.post(route('payment_method'), payment, {
                        onSuccess: (response) => {
                            setCompany(response.props.record);
                            if(response.props.record.payment_method == 'Postpaid') {
                                setEnabled(true);
                            }else {
                                setEnabled(false);
                            }
                        }
                })}
            }, {
                label: 'No',            
            }]
        });
    }

    return(
        <Switch.Group as="div" className="flex items-center">
            <Switch
                checked={enabled}
                onChange={() => ChangePaymentMethod(company.payment_method)}
                className={classNames(
                enabled ? 'bg-indigo-600' : 'bg-gray-200',
                'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
                )}
            >
                <span
                aria-hidden="true"
                className={classNames(
                    enabled ? 'translate-x-5' : 'translate-x-0',
                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
                )}
                />
                
            </Switch>
            <Switch.Label as="span" className="ml-3">
                <span className="text-sm font-bold text-gray-900">Payment method</span>
                <span className="text-sm text-gray-600 font-bold">- {company.payment_method}</span>
            </Switch.Label>
        </Switch.Group>
    );
}