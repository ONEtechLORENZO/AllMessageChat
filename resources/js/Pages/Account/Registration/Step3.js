import React, { useEffect, useState } from "react";
import Dropdown from '@/Components/Forms/Dropdown';
import Input from "@/Components/Forms/Input";
import Checkbox from "@/Components/Forms/Checkbox";

const categoryOption = {
    'cat1' : 'Category1',
    'cat2' : 'Category2'
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
  {'label':'Business Phone Number', 'name':'phone_number', 'type':'text'},
  {'label':'Legal Entity Name', 'name':'entity_name', 'type':'text'},
  {'label':'Legal Business Name', 'name':'display_name', 'type':'text'},
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
                    : ''}
                  
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
            {(checklist.map((check) => {
               let field_value = '';
               let field_name = check.name;
               field_value = props.checkPermission[field_name];
               return(
                <div class="form-check">
                  <Checkbox
                    id={field_name}
                    name={field_name}
                    value={field_value}
                    handleChange={props.checkAllPermissioin}
                  />
              <label class="form-check-label inline-block text-gray-500 px-4">
                  {check.description}
              </label>
             </div>
               )
            } ))}
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