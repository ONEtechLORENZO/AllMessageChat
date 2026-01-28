import {useState} from 'react'
import Source2 from './Source2';
import Source1 from './Source1';
import Source3 from './Source3';
import { Link } from "@inertiajs/inertia-react";
import notie from 'notie';



const validateForm = ['legal_entity', 'phone_number', 'company_name'];

export default function Step2(props){
    const events = [
        { id: 'yes', title: (props.translator['Yes']) },
        { id: 'no', title: props.translator['No'] },
        { id: 'not_sure', title: props.translator['I am not sure'] },
    ];
    const [step, setStep] = useState(1);
    const [tab, setTab] = useState('');
    const [source, setSource] = useState('');
    const [process, setProcess] =useState('');
    
    //handle the user account 
    function EventHandler(){
        if(source == 'yes'){
            setTab(1);
        }
        if(source == 'yes' && process =='yes'){
            setStep(2);
        }
        if(source == 'yes' && process == 'no'){
            setStep(3);
        }
        if((source == 'no') || (source == 'not_sure') || (step == 2 && process == 'yes')){
            props.setCurrentPage(3);
            props.setAddField(true);
        }
        if(step == 3){
            let ifcheckDisplayName = validateCheck();
            
            if(!ifcheckDisplayName) {
                notie.alert({type: 'warning', text: 'Please fill the mandatory field', time: 5});
            }

            if(ifcheckDisplayName){
                props.setCurrentPage(3);
            }
        }
        return false;
    }

    // Validate the form 
    function validateCheck(){
        let validate = true;
        let record = props.data;

        if(record) {
            validateForm.map( (field) => {
                if(validate && !record[field]) {
                    validate = false;
                }
            });
            if(record['legal_entity'] == 'no') {
                if(!record['display_name']) {
                    validate = false;
                }
            }
        }else {
            validate = false;
        }

        return validate;
    }

    return(
        <div className='p-8'>
            <div className="hidden">
                <div className='p-2 w-1/2'>
                </div>
                <div className="w-1/2"> 
                    <div className="float-right">  
                        <Link
                            href={route('dashboard')}
                            className="mt-3 w-full  justify-center rounded-md border border-gray-300 shadow-sm px-3 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                        X
                        </Link>
                    </div> 
                </div>
            </div>
            <form id='form p-2'>
            <div 
                className={
                step == 1 ? "block" : "hidden"
                }
            >
                
                <div>
                    <label className="text-base font-medium text-gray-900">
                    {props.translator[' The phone number that you want to use on OneMessage is already associated to a whatsapp account or a whatsapp Business account?']}
                    </label>

                    <fieldset className="mt-4">
                        <div className="space-y-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-10">
                        {events.map((event) => (
                            <div key={event.id} className="flex items-center">
                            <input
                                id={event.id}
                                name="notification-method"
                                type="radio"
                                className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                defaultChecked={source}
                                onChange={() => setSource(event.id)}
                            />
                            <label htmlFor={event.id} className="ml-3 block text-sm font-medium text-gray-700">
                                {event.title}
                            </label>
                            </div>
                        ))}
                        </div>
                    </fieldset>

                    <div 
                    className={
                     tab == '1' ? "block" : "hidden"
                    }
                    >
                        <Source1 
                        setProcess={setProcess}
                        {...props}
                        />
                    </div>

                </div>
            </div>

            <div 
                className={
                step == 2 ? "block" : "hidden"
                }
            >
                <Source2 
                />
            </div>

            <div 
                className={
                step == 3 ? "block" : "hidden"
                }
            >
              <Source3 
               data={props.data}
               formHandler={props.formHandler}
               legalEntityName={props.legalEntityName}
               changePhoneNumber={props.changePhoneNumber}            
               {...props}
              />
            </div>
                
            </form>

            <div className="flex mt-6">
                <div className='flex items-center w-2/3'>
                {props.translator['Not sure? Go to']} <a className='px-2 text-blue-500' href='#'> FAQ</a>{props.translator['or Get in Contact with']} <a className='px-2 text-blue-500' href='#'> {props.translator['Customer Service']}</a>
                </div>
                <div className='w-1/3 flex justify-end'>
                    <button
                        type="button"
                        className="w-full flex justify-end rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                        onClick={() => EventHandler()}
                    >
                        {props.translator['Next']}
                    </button>
                </div>
            </div>
        </div>
    );
}