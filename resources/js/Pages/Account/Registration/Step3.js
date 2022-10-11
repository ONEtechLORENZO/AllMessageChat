import React, { useEffect, useState } from "react";
import Dropdown from '@/Components/Forms/Dropdown';
import Input from "@/Components/Forms/Input";
import Checkbox from "@/Components/Forms/Checkbox";
import { Link } from "@inertiajs/inertia-react";
import PhoneInput2 from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const categoryOption = {
    'Automotive' : 'Automotive',
    'Beauty, Spa and Salon' : 'Beauty, Spa and Salon',
    'Clothing and Apparel':'Clothing and Apparel',
    'Education':'Education',
    'Entertainment':'Entertainment',
    'Event Planning and Service' : 'Event Planning and Service',
    'Finance and Banking':'Finance and Banking',
    'Food and Grocery':'Food and Grocery',
    'Public Service' :'Public Service',
    'Hotel and Lodging':'Hotel and Lodging',
    'Medical and Health':'Medical and Health',
    'Non-profit':'Non-profit',
    'Professional Services':'Professional Services',
    'Shopping and Retail':'Shopping and Retail',
    'Travel and Transportation':'Travel and Transportation',
    'Restaurant':'Restaurant',
    'Other':'Other',
}

const checklist = [
  {'name': 'accept','description':'Accept WA Business Policy & Commerce Policy','value':''},
  {'name': 'condition','description':'OneMessage Terms & Conditions and Privacy Policy','value':' '},
  {'name': 'confirm','description':'I confirm that I own this number and I have the authority to bind it to this account','value':''}
];
 
const formField = [
  {'label':'Business Category', 'name':'category', 'type':'dropdown'},
  {'label':'Business Description', 'name':'description', 'type':'text'},
];

const addformField = [
  {'label':'Business Phone Number', 'name':'phone_number', 'type':'phone_number', 'mandatory':1},
  {'label':'Legal Entity Name', 'name':'company_name', 'type':'text', 'mandatory':1},
  {'label':'Legal Business Name', 'name':'display_name', 'type':'text', 'mandatory':1},
];

export default function Step3(props){

  const [fieldList, setFieldList] = useState(formField);

  useEffect(() =>{
    if(props.addfield && fieldList.length < 5){
       let fields = [...addformField,...formField];
       setFieldList(fields)
    }
  },[props]);

    return(
        <div className='p-4'>
          <div className="flex">
                <div className='p-2 w-1/2'>
                </div>
                <div className="w-1/2"> 
                    <div className="float-right">  
                        <Link
                            href={route('dashboard')}
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-3 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                        X
                        </Link>
                    </div> 
                </div>
            </div>
          <div className="overflow-hidden  md:rounded-lg">
            <table className="min-w-full divide-gray-300">
            <tbody className="divide-gray-200 bg-white">
              {fieldList.map((field) => {
                  let field_value = '';
                  let field_name = field.name;
                  field_value = props.data[field_name];
                return(
                  <tr>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {field.label}
                    {field.mandatory == 1 && <span className="text-red-600 px-2">*</span>}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {field.type == 'text' ? 
                      <Input 
                      type="text" 
                      className={`mt-1 appearance-none block w-3/4 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-skin-primary focus:border-skin-primary sm:text-sm`}
                      id={field_name}
                      name={field_name}
                      value={field_value} 
                      handleChange={props.formHandler}
                      required={true}
                    />
                    : field.type == 'dropdown' ? 
                      <div className="w-1/2">
                      <Dropdown 
                        id={field_name}
                        name={field_name}
                        options={categoryOption}
                        handleChange={props.formHandler}
                        emptyOption='choose Category'
                        value={field_value}
                        required={true}
                      />
                      </div>
                    : field.type == 'phone_number'?
                     <div className="w-3/4">
                      <PhoneInput2
                        inputProps={{
                            name:field_name,
                            required: true,
                            autoFocus: true
                          }}
                        containerStyle={{ marginTop: "15px" }}
                        searchClass="search-class"
                        searchStyle={{ margin: "0", width: "97%", height: "30px" }}
                        enableSearchField
                        disableSearchIcon
                        placeholder="Enter phone number"
                        value={field_value} 
                        onChange={(value) => props.changePhoneNumber(value, field_name)}
                      />
                     </div>
                    :''}
                  
                    {field.name == 'display_name' ? 
                    <span>if different from legal entity name, add a link that shows that you own that brand</span>
                    :''}
                  </td>
                  </tr>
                )
                })}
                {fieldList.length > 3 ? 
                  <tr>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <p>
                    <span className="text-red-500">Note: </span>
                    <span className="text-gray-500 text-sm">
                        Make sure to enter a Business Description that is
                        consistent with the<br></br> information show on your website
                        and that is adherent to Whatsapp Policies.
                    </span>
                    </p>
                    <br></br>
                    <p>Go to FAQ</p>
                  </td>
                  </tr>
                : ''}
            </tbody>
            </table>
          </div>
      
          <div className="p-4">
            <div className="form-check">
                 <Checkbox
                    id="accept"
                    name="accept"
                    value={props.checkPermission['accept']}
                    handleChange={props.checkAllPermissioin}
                  />
              <label class="form-check-label inline-block text-gray-500 px-4">
                  Accept <a className="text-blue-500 px-2" href="https://www.whatsapp.com/legal/business-policy/" target="_blank">WA Business Policy</a> & <a className="text-blue-500 px-2" href="https://www.whatsapp.com/legal/commerce-policy/" target="_blank">Commerce Policy</a>
              </label>
            </div>
            <div className="form-check">
                 <Checkbox
                    id="condition"
                    name="condition"
                    value={props.checkPermission['condition']}
                    handleChange={props.checkAllPermissioin}
                  />
              <label class="form-check-label inline-block text-gray-500 px-4">
                  OneMessage <a className="text-blue-500 px-2" href="https://www.gupshup.io/terms-and-conditions" target="_blank">Terms & Conditions</a>and<a className="text-blue-500 px-2" href="https://www.gupshup.io/privacy-policy" target="_blank">Privary Policy</a>
              </label>
            </div>
            <div className="form-check">
                 <Checkbox
                    id="confirm"
                    name="confirm"
                    value={props.checkPermission['confirm']}
                    handleChange={props.checkAllPermissioin}
                  />
              <label class="form-check-label inline-block text-gray-500 px-4">
                    I confirm that i own this number and i have the authority to bind it to this account
              </label>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={() => props.saveAccount()}
            >
                Send Request
            </button>
          </div>
       </div> 
    );
}