import {useState} from 'react'
import Source2 from './Source2';
import Source1 from './Source1';
import Source3 from './Source3';

const events = [
    { id: 'yes', title: 'Yes' },
    { id: 'no', title: 'No' },
    { id: 'not_sure', title: 'I am not sure' },
];

export default function Step2(props){
    
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
            props.setCurrentPage(3);
        }
        return false;
    }

    return(
        <div className='p-8'>
            <form id='form p-2'>
            <div 
                className={
                step == 1 ? "block" : "hidden"
                }
            >
                <div>
                    <label className="text-base font-medium text-gray-900">
                        Do you already use WhatsApp Business API via a BSP or via Cloud API on this number? 
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
              />
            </div>
                
            </form>

            <div className="bg-gray-50 py-3 flex">
            <div className='flex justify-start w-2/3'>
                Not sure? Go to FAQ or Get in Contact with Customer Service
            </div>
            <div className='w-1/3 flex justify-end'>
                <button
                    type="button"
                    className="w-full flex justify-end rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => EventHandler()}
                >
                    Next
                </button>
            </div>
            </div>
        </div>
    );
}