import React, {useState} from "react";
import Input from "@/Components/Forms/Input";

const notificationMethods = [
  { id: 'yes', title: 'Yes' },
  { id: 'no', title: 'No' },
]

export default function Source3(props){
  
    return(
        <div>
            <div className="overflow-hidden  md:rounded-lg">
              <table className="min-w-full divide-gray-300">
                <tbody className="divide-gray-200 bg-white">
                    <tr>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        Which Phone number do you want to link to <br></br>this WABA Account? 
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <Input 
                            type="text" 
                            className={`mt-1 appearance-none block w-3/4 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-skin-primary focus:border-skin-primary sm:text-sm`}
                            id='phone_number'
                            name='phone_number'
                            value={props.data['phone_number']} 
                            handleChange={props.formHandler}
                            required={true}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          What is your offical Legal Entity Name<br></br>
                         (Business Registered Name, e.g. One Srl)
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <Input 
                            type="text" 
                            className={`mt-1 appearance-none block w-3/4 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-skin-primary focus:border-skin-primary sm:text-sm`}
                            id='entity_name'
                            name='entity_name'
                            value={props.data['entity_name']} 
                            handleChange={props.formHandler}
                            required={true}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        What is the URL of the offical website of your<br></br> organization?
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <Input 
                            type="text" 
                            className={`mt-1 appearance-none block w-3/4 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-skin-primary focus:border-skin-primary sm:text-sm`}
                            id='website'
                            name='website'
                            value={props.data['website']} 
                            handleChange={props.formHandler}
                            required={true}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        Do you want to use a Display Name that<br></br> matches your Legal Entity Name?
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 w-1/5">
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
                      </td>
                    </tr>
                    <tr>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                       <p>
                        <span className="text-red-500">Note: </span>
                        <span className="text-gray-500 text-sm">
                            if you want to use a Display Name that is different <br></br> 
                            from your Legal Entity Name, you will have to add a link<br></br>
                            to a web page that show that you actually own that<br></br> 
                            brand/trademark (e.g.<a className="text-blue-500" href="http://yourcompanydomain.com/trademarks" target="_blank">yourcompanydomain.com/trademarks</a>)
                        </span>
                       </p>
                      </td>
                    </tr>
                </tbody>
              </table>
            </div>
        </div>
    );
}