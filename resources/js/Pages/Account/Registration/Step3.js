import React, { useEffect, useState } from "react";
import Dropdown from '@/Components/Forms/Dropdown';
import Input from "@/Components/Forms/Input";
import Checkbox from "@/Components/Forms/Checkbox";
import { Link } from "@inertiajs/inertia-react";
import PhoneInput2 from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import TextArea from "@/Components/Forms/TextArea";

import { Button } from "reactstrap";



const checklist = [
  {'name': 'accept','description':'Accept WA Business Policy & Commerce Policy','value':''},
  {'name': 'condition','description':'OneMessage Terms & Conditions and Privacy Policy','value':' '},
  {'name': 'confirm','description':'I confirm that I own this number and I have the authority to bind it to this account','value':''}
];
 

export default function Step3(props){

  const categoryOption = {
    'Automotive' : props.translator['Automotive'],
    'Beauty, Spa and Salon' : props.translator['Beauty, Spa and Salon'],
    'Clothing and Apparel':props.translator['Clothing and Apparel'],
    'Education':props.translator['Education'],
    'Entertainment':props.translator['Entertainment'],
    'Event Planning and Service' : props.translator['Event Planning and Service'],
    'Finance and Banking':props.translator['Finance and Banking'],
    'Food and Grocery':props.translator['Food and Grocery'],
    'Public Service' :props.translator['Public Service'],
    'Hotel and Lodging':props.translator['Hotel and Lodging'],
    'Medical and Health':props.translator['Medical and Health'],
    'Non-profit':props.translator['Non-profit'],
    'Professional Services':props.translator['Professional Services'],
    'Shopping and Retail':props.translator['Shopping and Retail'],
    'Travel and Transportation':props.translator['Travel and Transportation'],
    'Restaurant':props.translator['Restaurant'],
    'Other':props.translator['Other'],
}
  const formField = [
    {'label':props.translator['Business Category'], 'name':'category', 'type':'dropdown'},
    {'label':props.translator['Business Description'], 'name':'description', 'type':'textarea'},
  ];
  
  const addformField = [
    {'label':props.translator['Business Phone Number'], 'name':'phone_number', 'type':'phone_number', 'mandatory':1},
    {'label':props.translator['Legal Entity Name'], 'name':'company_name', 'type':'text', 'mandatory':1},
    {'label':props.translator['Legal Business Name'], 'name':'display_name', 'type':'text', 'mandatory':1},
  ];

  const [fieldList, setFieldList] = useState(formField);
  
  useEffect(() =>{
    if(props.addfield && fieldList.length < 5){
       let fields = [...addformField,...formField];
       setFieldList(fields)
    }
  },[props]);

    return(
        <div className='p-4'>
          <div>
            <h2 className="text-2xl font-medium">{props.translator['Register Phone Number']}</h2>
            <p className="text-[#878787] text-sm">{props.translator['Fill out the form accurately, we will send this data to whats app to verify your credentials.']}</p>
          </div>
          <div className="hidden">
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
          <div className="overflow-hidden  md:rounded-lg mt-6">
            
            <div className="space-y-6">
              {fieldList.map((field) => {
                  let field_value = '';
                  let field_name = field.name;
                  field_value = props.data[field_name];
                return(
                  <div className="flex flex-col gap-1">
                  <div className="whitespace-nowrap text-base font-medium text-gray-500">
                    {field.label}
                    {field.mandatory == 1 && <span className="text-red-600 px-2">*</span>}
                  </div>
                  <div className="whitespace-nowrap text-sm text-gray-500">
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
                        emptyOption={props.translator['Choose Category']}
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
                        placeholder={props.translator["Enter phone number"]}
                        value={field_value} 
                        onChange={(value) => props.changePhoneNumber(value, field_name)}
                      />
                     </div>
                    : field.type == 'textarea' ?
                      <TextArea
                          id={field_name}
                          name={field_name}
                          required={true}
                          rows="2"
                          className={`mt-1 max-w-lg shadow-sm block w-full focus:ring-skin-primary focus:border-skin-primary sm:text-sm border border-gray-300 rounded-md`}
                          value={field_value}
                          handleChange={props.formHandler}
                      />
                    :''}
                  
                    {field.name == 'display_name' ? 
                    <span>{props.translator['if different from legal entity name, add a link that shows that you own that brand']}</span>
                    :''}
                  </div>
                  </div>
                )
                })}
                {fieldList.length > 3 ? 
                  <div className="">
                    
                    <div className="whitespace-nowrap text-sm text-gray-500 col-span-2 space-y-2">
                      <p>
                        <span className="text-red-500">Note: </span>
                        <span className="text-gray-500 text-sm">
                        {props.translator['Make sure to enter a Business Description that is consistent with the']}<br></br>{props.translator['information show on your website and that is adherent to Whatsapp Policies.']}
                        </span>
                      </p>
                      <p>{props.translator['Go to']} FAQ</p>
                    </div>
                  </div>
                : ''}
            </div>
            
          </div>
      
          <div className="mt-4 space-y-2">
            <div className="form-check !pl-0">
                 <Checkbox
                    id="accept"
                    name="accept"
                    value={props.checkPermission['accept']}
                    handleChange={props.checkAllPermissioin}
                  />
              <label class="form-check-label inline-block text-gray-500 px-4">
              {props.translator['Accept']} <a className="text-blue-500 px-2" href="https://www.whatsapp.com/legal/business-policy/" target="_blank">{props.translator['WA Business Policy']}</a> & <a className="text-blue-500 px-2" href="https://www.whatsapp.com/legal/commerce-policy/" target="_blank">{props.translator['Commerce Policy']}</a>
              </label>
            </div>
            <div className="form-check !pl-0">
                 <Checkbox
                    id="condition"
                    name="condition"
                    value={props.checkPermission['condition']}
                    handleChange={props.checkAllPermissioin}
                  />
              <label class="form-check-label inline-block text-gray-500 px-4">
                  OneMessage <a className="text-blue-500 px-2" href="https://www.gupshup.io/terms-and-conditions" target="_blank">{props.translator['Terms & Conditions']}</a>{props.translator['and']}<a className="text-blue-500 px-2" href="https://www.gupshup.io/privacy-policy" target="_blank">{props.translator['Privary Policy']}</a>
              </label>
            </div>
            <div className="form-check !pl-0">
                 <Checkbox
                    id="confirm"
                    name="confirm"
                    value={props.checkPermission['confirm']}
                    handleChange={props.checkAllPermissioin}
                  />
              <label class="form-check-label inline-block text-gray-500 px-4">
              {props.translator['I confirm that i own this number and i have the authority to bind it to this account']}
              </label>
            </div>
          </div>

          <div className="flex justify-between mt-14">
            <Link
             href={route('dashboard')}
             className="btn btn-light"
            >
             {props.translator['Cancel']}
            </Link>
            <Button
                color="primary"
                onClick={() => props.saveAccount()} >
                {props.translator['Send Request']}
            </Button>
          </div>
       </div> 
    );
}