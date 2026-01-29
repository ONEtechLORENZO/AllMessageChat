import React, {useState} from "react";
import Input from "@/Components/Forms/Input";
import PhoneInput2 from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const notificationMethods = [
  { id: 'yes', title: 'Yes' },
  { id: 'no', title: 'No' },
]

export default function Source3(props){
  
    return(
        <div>
            <div className="overflow-hidden  md:rounded-lg">
              <div className="min-w-full divide-gray-300">
              <div>
                <h2 className="text-lg font-medium">'Link Whatsapp via WABA'</h2>
                <p className="text-[#878787]">Whatsapp Business API to unlock Whatsapp superpowers.</p>
                </div>
                <div className="space-y-4 mt-8">
                    <div>
                      <div className="whitespace-initial text-sm text-gray-500">
                        Which Phone number do you want to link to this WABA Account? 
                        <span className="text-red-600 px-2">*</span>
                      </div>
                      <div className="whitespace-nowrap text-sm text-gray-500">
                          <PhoneInput2
                          inputProps={{
                              name:'phone_number',
                              required: true,
                              autoFocus: true
                            }}
                          containerStyle={{ marginTop: "15px" }}
                          searchclassName="search-class"
                          searchStyle={{ margin: "0", width: "97%", height: "30px" }}
                          enableSearchField
                          disableSearchIcon
                          placeholder="Enter phone number"
                          value={props.data['phone_number']} 
                          onChange={(value) => props.changePhoneNumber(value, 'phone_number')}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="whitespace-initial text-sm text-gray-500">
                          What is your offical Legal Entity Name
                         (Business Registered Name, e.g. One Srl)
                         <span className="text-red-600 px-2">*</span>
                      </div>
                      <div className="whitespace-nowrap text-sm text-gray-500">
                        <Input 
                            type="text" 
                            className={`mt-1 appearance-none block w-3/4 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-skin-primary focus:border-skin-primary sm:text-sm`}
                            id='company_name'
                            name='company_name'
                            value={props.data['company_name']} 
                            handleChange={props.formHandler}
                            required={true}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="whitespace-nowrap text-sm text-gray-500">
                        What is the URL of the offical website of your<br></br> organization?
                      </div>
                      <div className="whitespace-nowrap text-sm text-gray-500">
                        <Input 
                            type="text" 
                            className={`mt-1 appearance-none block w-3/4 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-skin-primary focus:border-skin-primary sm:text-sm`}
                            id='website'
                            name='website'
                            value={props.data['website']} 
                            handleChange={props.formHandler}
                            required={true}
                        />
                      </div>
                    </div>
                    {props.data && props.data['legal_entity'] == 'no' ? 
                    <div>
                      <div className="whitespace-nowrap text-sm text-gray-500">
                        Legal Business Name
                        <span className="text-red-600 px-2">*</span>  
                      </div>
                      <div className="whitespace-nowrap text-sm text-gray-500">
                        <Input 
                            type="text" 
                            className={`mt-1 appearance-none block w-3/4 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-skin-primary focus:border-skin-primary sm:text-sm`}
                            id='display_name'
                            name='display_name'
                            value={props.data['display_name']} 
                            handleChange={props.formHandler}
                            required={true}
                        />
                      </div>
                    </div>
                    :''}
                    <div>
                      <div className="whitespace-initial text-sm text-gray-500">
                        Do you want to use a Display Name that matches your Legal Entity Name?
                        <span className="text-red-600 px-2">*</span>
                      </div>
                      <div className="whitespace-nowrap text-sm text-gray-500 w-1/5">
                        <fieldset className="mt-4">
                            <legend className="sr-only">Notification method</legend>
                            <div className="space-y-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-10">
                            {notificationMethods.map((notificationMethod) => (
                                <div key={notificationMethod.id} className="flex items-center">
                                <input
                                    id={notificationMethod.id}
                                    name="legal_entity"
                                    type="radio"
                                    defaultValue={props.data['legal_entity'] == notificationMethod.id}
                                    className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    onChange={() => props.legalEntityName(notificationMethod.id, 'legal_entity')}
                                />
                                <label htmlFor={notificationMethod.id} className="ml-3 block text-sm font-medium text-gray-700">
                                    {notificationMethod.title}
                                </label>
                                </div>
                            ))}
                            </div>
                        </fieldset>
                      </div>
                    </div>
                    <div>
                      <div className="whitespace-nowrap text-sm text-gray-500">
                        
                      </div>
                      <div className="whitespace-nowrap text-sm text-gray-500 mt-6">
                       <p>
                        <span className="text-red-500">Note: </span>
                        <span className="text-gray-500 text-sm">
                            if you want to use a Display Name that is different <br></br> 
                            from your Legal Entity Name, you will have to add a link<br></br>
                            to a web page that show that you actually own that<br></br> 
                            brand/trademark (e.g.<a className="text-blue-500" href="http://yourcompanydomain.com/trademarks" target="_blank">yourcompanydomain.com/trademarks</a>)
                        </span>
                       </p>
                      </div>
                    </div>
                </div>
              </div>
            </div>
        </div>
    );
}









