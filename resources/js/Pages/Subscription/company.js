import React, {useState, useEffect}from "react";
import { CheckIcon, PencilIcon, XIcon } from "@heroicons/react/outline";
import Dropdown from "@/Components/Forms/Dropdown";
import { Link } from "@inertiajs/inertia-react";
import Axios from "axios";
import Input from "@/Components/Forms/Input";
import { Inertia } from "@inertiajs/inertia";

export default function CompanyDetail(props){

  const [fields, setFields] = useState();
  const [open, setOpen] = useState({});
  const [temp, setTemp] = useState({});

  useEffect(() => {
    fetchModuleFields();
  },[]);

  function fetchModuleFields() {
    let endpoint_url = route('fetchModuleFields', {'module': 'Company'});
    Axios.get(endpoint_url).then((response) => {
        if (response.data.status !== false) {
            setFields(response.data.fields);
        }
        else {
            notie.alert({type: 'error', text: response.data.message, time: 5});
        }
    });
  }

  function editCompany(field_name){
    let newOpen = Object.assign({}, open);
    let newTemp = Object.assign({}, temp);
    
    //reset the value
    newTemp = {};
    setTemp(newTemp);

    //new value
    newOpen['name'] = field_name;
    newTemp[field_name] = props.currentCompany[field_name];
    setOpen(newOpen);
    setTemp(newTemp);
  }

  function editCancel(){
    let newOpen = Object.assign({}, open);
    newOpen['name'] = '';
    setOpen(newOpen);
    setTemp({});
  }

  function saveTemp(event){
    let newTemp = Object.assign({}, temp);
    const name = event.target.name;
    let value = event.target.value;
    newTemp[name] = value;
    setTemp(newTemp);
  }

  function saveCompany(){
    if(temp){
      Inertia.post(route('saveCompany'), temp, {
        onSuccess: (response) => {
          setTemp({});
          setOpen({'name':''})
        }
      });
    } 
  }
console.log(temp, open)
    return(
        <div>
            <div className="sm:grid grid grid-cols-2 gap-4 p-4">
              <div className="flex border border-solid rounded-lg h-40 p-4 gap-4">
                <div className="pl-4 w-40">
                 <svg
                    width={80}
                    height={83}
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                 >
                    <path
                        d="M57.333 25.076V9.888c0-3.61 0-5.415-.759-6.524a4.333 4.333 0 0 0-2.847-1.825c-1.324-.225-2.96.531-6.232 2.044l-38.44 17.77c-2.918 1.348-4.377 2.023-5.446 3.07a8.682 8.682 0 0 0-2.108 3.3C1 29.133 1 30.743 1 33.963v21.495m58.5-2.17h.043M1 38.965v28.646c0 4.862 0 7.292.945 9.15a8.674 8.674 0 0 0 3.787 3.793c1.854.946 4.28.946 9.135.946h50.266c4.854 0 7.281 0 9.135-.946a8.674 8.674 0 0 0 3.787-3.794C79 74.903 79 72.473 79 67.611V38.965c0-4.861 0-7.292-.945-9.15a8.673 8.673 0 0 0-3.787-3.793c-1.854-.946-4.28-.946-9.135-.946H14.867c-4.854 0-7.281 0-9.135.946a8.674 8.674 0 0 0-3.787 3.794C1 31.673 1 34.104 1 38.966Zm60.667 14.323c0 1.199-.97 2.17-2.167 2.17a2.168 2.168 0 0 1-2.167-2.17c0-1.198.97-2.17 2.167-2.17 1.197 0 2.167.972 2.167 2.17Z"
                        stroke="#3D4459"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
                </div>
                <div className="w-full">
                    <p className="font-bold">This is your Workspace</p>
                    <p className="text-gray-500 text-sm whitespace-initial pt-2">
                        Here you can change your company settings, add, edit or remove informations, as you number, your address, link your channel, etc.
                    </p>
                </div>
              </div>
              <div className="border border-solid rounded-lg p-4">
                <div className="font-bold">{props.currentCompany.plan} Plan</div>
                <div className="grid grid-cols-2 p-2">
                    <div className="">
                        <p className="flex text-gray-500 gap-2"><span className="w-5 h-5"><CheckIcon/></span>Monthly Fee</p>
                        <p className="flex text-gray-500 gap-2"><span className="w-5 h-5"><CheckIcon/></span>1 Number for channel</p>
                        <p className="flex text-gray-500 gap-2"><span className="w-5 h-5"><CheckIcon/></span>1 User for Workspace</p>
                    </div>
                    <div className="p-4 sm:flex sm:flex-row-reverse">
                      <Link
                            href={route('updateSubscription')}
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                            >
                            Update
                      </Link>
                    </div>
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="border border-solid rounded-lg h-48">
                <div className="sm:grid grid grid-cols-2 gap-4 p-4">
                 <div className="flex h-40 p-4 gap-4">
                    <div className="pl-4 w-40">
                     Profile
                    </div>
                    <div className="w-full">
                        <div className="p-2">
                          {props.currentCompany.name}
                        </div>
                        <div className="p-2">
                            <Dropdown 
                            id='swithc_company'
                            name='switch_company'
                            options={props.relatedCompany}
                            handleChange={props.changeCompany}
                            emptyOption='Switch Company'
                            />
                        </div>
                    </div>
                 </div>
                 <div></div>
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="border border-solid rounded-lg h-auto">
                <div className="p-4">
                  <div>
                    <div className="overflow-hidden">
                     <table className="min-w-full divide-y divide-gray-300">
                       <thead className="bg-gray-50">
                        <tr>
                         <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-primary sm:pl-6">
                          General
                         </th>
                        </tr>
                       </thead>
                       <tbody>
                        {fields ? 
                          (fields).map((field, index) => {
                            let field_value = '';
                            let field_name = field.field_name;
                            let company = props.currentCompany;
                            field_value = company[field_name];
                            if(!field_value){
                              field_value = '-';
                            }
                            if(temp.hasOwnProperty(field_name)){
                              field_value = temp[field_name];
                            }

                            return(
                              <tr>
                                <td className="whitespace-nowrap px-3 py-4 w-1/3 text-sm font-medium text-gray-500">{field_name}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 flex w-2/5">
                                  {open  && open.name == field_name? 
                                  <>
                                    <Input 
                                        type="text" 
                                        className={`mt-1 appearance-none block w-2/5 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-skin-primary focus:border-skin-primary sm:text-sm`}
                                        id={field_name}
                                        name={field_name}
                                        value={field_value} 
                                        handleChange={saveTemp}
                                    />
                                    <div className="p-2 text-gray-900" onClick={() => saveCompany()}><CheckIcon className="h-6 w-6 text-green-900"/></div>
                                    <div className="p-2 text-gray-900" onClick={() => editCancel()}><XIcon className="h-6 w-6 text-red-900"/></div>
                                  </>
                                  : 
                                  <>
                                    {field_value}
                                    <span className="pl-4" onClick={() => editCompany(field_name)}><PencilIcon className="h-4 w-4"/></span>
                                  </>
                                  }
                                </td>
                              </tr>
                           )
                          })                         
                        :''}
                       </tbody>
                      </table>  
                    </div>  
                  </div> 
                </div>
              </div>
            </div>
        </div>
    );
}