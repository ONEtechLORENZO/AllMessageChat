import React from "react";



export default function Source1(props){
    const procedureMethods = [
        { id: 'yes',
          title: props.translator['i want to use a number that is currently associated to an existing Whatsapp or Whatsapp Bussiness Account'],
          explain : props.translator['This procedure will delete and recreate your account. We recommend that you backup your chats before this procedure']
        },
        { id: 'no',
          title: props.translator['i want to use a number that is NOT associated to an existing Whatsapp or Whatsapp Bussiness Account'],
          explain : props.translator['You can check numbers providers here:']
        },
    ];

    return(
        <div className='py-4'>
            <div>
                <p className="text-red-500 py-5">
                {props.translator['You cannot use the same number both on the standard Whatsapp (or on the WhatsApp Business App) and as a number for WhatsApp Official Business API (WABA)']}
                </p>
                <p className="text-gray-500">
                {props.translator['if you want to use a number that is currently associated to a WhatsApp Account or to a WhatsApp Business Account (IOS or Android App), you must DELETE your current Whatsapp or Whatsapp  Business Account and then you can associate this number to an offical WhatsApp Business API Account (WABA).']}                     
                </p>
                <p className="text-blue-500 py-2">
                {props.translator['Read More | Go to FAQ']}
                </p>
            </div>
            <div>
                <div>
                    <label className="text-base font-medium text-gray-900">{props.translator['How do you want to proceed ?']}</label>
                    <fieldset className="mt-4">
                        <legend className="sr-only">{props.translator['Notification method']}</legend>
                        <div className="space-y-4">
                        {procedureMethods.map((procedure) => (
                            <div key={procedure.id} className="flex items-center">
                            <input
                                id={procedure.id}
                                name="procedure-method"
                                type="radio"
                                className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                onClick={() => props.setProcess(procedure.id)}
                            />
                            <label htmlFor={procedure.id} className="ml-3 block text-sm font-medium text-gray-700">
                                {procedure.title}
                                <br></br>
                                <span className="text-gray-500">
                                    {procedure.explain}
                                    {procedure.id == 'no' ? 
                                    <a className="text-blue-500" href="https://www.onemessage.chat/new-phone-number" target="_blank">onemessage.chat/new-phone-number</a>
                                     : ''} 
                                </span>
                            </label>
                            </div>
                        ))}
                        </div>
                    </fieldset>
                </div>
            </div>
        </div>
    );
}