import React, {useState} from 'react';
import Authenticated from '@/Layouts/Authenticated';
import { Head, Link } from '@inertiajs/inertia-react';

export default function UserDetail(props) {

    const fieldList = {
        'Personal Information': [
            {'value': props.user.name, 'label': 'Name'},
            {'value': props.user.company_name, 'label': 'Company name'},
            {'value': props.user.email, 'label': 'Email'},
            {'value': props.user.phone_number, 'label': 'Phone number'},
            {'value': props.user.language, 'label': 'Language'},
            {'value': props.user.currency, 'label': 'Currency'},
            {'value': props.user.time_zone, 'label': 'Time zone'},
            {'value': props.token, 'label': 'Token' , action:'regenarate'},
            {'value': (props.user.status == 1) ? 'Active': 'Inactive', 'label': 'Active Status'},
            {'value': formatDate(props.user.created_at), 'label': 'Created At'},
        ],
        'Billing Information': [
            {'value': props.user.company_address, 'label': 'Company Address'},
            {'value': props.user.company_country, 'label': 'Company Country'},
            {'value': props.user.company_vat_id, 'label': 'Company VAT ID'},
            {'value': props.user.codice_destinatario, 'label': 'Company Codice Destinatario'},
            {'value': props.user.admin_email, 'label': 'Admin email for invoices'},
        ]
    };

    const [spinClass , setSpinClass] = useState([]);
    const [token , setToken ]= useState(props.token);
    
    function formatDate(date) {
        var monthArray=['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		var date = new Date(date);               
		var d = date.getDate();
		var day = (d <= 9 ? '0' + d : d)
		var month = monthArray[date.getMonth()];
		var year = date.getFullYear();
        var dateFormat = month + ' ' + day + ', ' + year;
        return dateFormat;
    }

    // Update Token
    function updateToken(){
        axios({
            method: 'post',
            url: route('regenerate_token'),
            data: {
                user_id: props.user.id,
            }
        })
        .then((response) => {
            setToken(response.data.token);
            setSpinClass(' ');
        });
    }

    return (
        <Authenticated
            auth={props.auth}
            errors={props.errors}
            header={<div className="flex justify-between"> 
                <div> 
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">Users</h2>
                </div> 
                <div>
                <Link
                    href={props.user.role == 'Admin' ?  route('edit_user' , [props.user.id]) : route('edit_profile' , [props.user.id])}
                    className='ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                >
                    Edit User
                </Link>
                </div> 
            </div>}
        >
        <Head title="User Detail" />

            <div className="py-12">
                {Object.entries(fieldList).map(([title, fields]) => {
                    return(
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 mt-4">
                        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                            <div className="px-4 py-5 sm:px-6">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
                            </div>
                            <div className="border-t border-gray-200">
                                <dl>
                                    {Object.entries(fields).map(([key, field], index) => {
                                        let bg_color = 'bg-gray-50';
                                        if(index % 2 == 0) {
                                            bg_color = 'bg-white';
                                        }

                                        return (
                                            <div key={key} className={`${bg_color} px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6`}>
                                                <dt className="text-sm font-medium text-gray-500">{field.label}</dt>
                                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                                {field.hasOwnProperty('action') ?
                                                    <>
                                                        {token}
                                                        <span class="cursor-pointer" title="Regenarate Token">
                                                            <svg xmlns="http://www.w3.org/2000/svg" onClick={() => {if(window.confirm('Do you want change the user token?')){updateToken()};}} class={"h-5 w-5 " + spinClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                            </svg>
                                                        </span>
                                                    </>
                                                : <> {field.value} </>
                                                }
                                                </dd>
                                            </div>
                                        );
                                    })}
                                </dl>
                            </div>
                        </div>
                    </div>
                )})}
            </div>

        </Authenticated>
    );
}
