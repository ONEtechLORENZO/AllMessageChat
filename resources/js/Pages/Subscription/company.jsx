import React, { useState, useEffect } from "react";
import { CheckIcon, PencilIcon, XMarkIcon, CameraIcon } from "@heroicons/react/24/outline";
import Dropdown from "@/Components/Forms/Dropdown";
import Axios from "axios";
import Input from "@/Components/Forms/Input";
import { router as Inertia } from "@inertiajs/react";
import { countries } from '@/Pages/Constants';
import TextArea from "@/Components/Forms/TextArea";
import ProfilePicture from "./profilePicture";

export function GlassCard({ className = "", children }) {
  return (
    <div
      className={[
        "relative rounded-3xl bg-[#140816]/70 backdrop-blur-3xl group",
        "transition-all duration-500 hover:border-[#38bdf8]/50 hover:-translate-y-3 hover:scale-[1.02]",
        "hover:shadow-[0_20px_40px_-15px_rgba(56,189,248,0.3)]",
        className,
      ].join(" ")}
    >
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#38bdf8]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="p-6 relative z-10 flex flex-col h-full">
        {children}
      </div>
    </div>
  );
}

export default function CompanyDetail(props) {
  const [fields, setFields] = useState();
  const [temp, setTemp] = useState({});
  const [currentCompany, setCurrentCompany] = useState(props.currentCompany);
  const [changeProfile, setChangeProfile] = useState(false);

  useEffect(() => {
    fetchModuleFields();
  }, []);

  function fetchModuleFields() {
    let endpoint_url = route('fetchModuleFields', { 'module': 'Company' });
    Axios.get(endpoint_url).then((response) => {
      if (response.data.status !== false) {
        setFields(response.data.fields);
      }
      else {
        notie.alert({ type: 'error', text: response.data.message, time: 5 });
      }
    });
  }

  function editCompany(field_name) {
    let newTemp = Object.assign({}, temp);

    //reset the value
    newTemp = {};
    setTemp(newTemp);

    //new value
    newTemp[field_name] = currentCompany[field_name];
    setTemp(newTemp);
  }

  function editCancel() {
    setTemp({});
  }

  function saveTemp(event) {
    let newTemp = Object.assign({}, temp);
    const name = event.target.name;
    let value = event.target.value;
    newTemp[name] = value;
    setTemp(newTemp);
  }

  function saveCompany() {
    if (temp) {
      Inertia.post(route('saveCompany'), temp, {
        onSuccess: (response) => {
          setCurrentCompany(response.props.company.currentCompany)

          setTemp({});
        }
      });
    }
  }

  return (
    <div className="space-y-4">
      <GlassCard>
        <div className="sm:grid grid grid-cols-2 gap-4 p-2 w-full">
          <div className="flex p-4 gap-4">
            <div className="w-28">
              <div className="w-28 h-28 relative">
                <img src={props.currentCompany.file_path} className="object-cover w-full h-full rounded-full" />
                <div className="absolute right-0 bottom-0 w-6 h-6 bg-white/10 border border-white/20 cursor-pointer flex justify-center items-center" onClick={() => setChangeProfile(true)}>
                  <CameraIcon className="text-white w-5 h-5" />
                </div>
              </div>
            </div>
            <div className="flex justify-center items-center">
              <div className="p-2 flex">
                <div className="text-2xl font-bold text-white flex gap-3 items-center">{currentCompany && currentCompany.name} </div>
                <div className="px-4 text-md text-[#878787] font-bold">{currentCompany && currentCompany.payment_method == 'Postpaid' ? '( Postpaid )' : ''}</div>
              </div>
            </div>
          </div>

        </div>
      </GlassCard>


      <GlassCard>
        <div className="text-white text-lg font-semibold">{props.translator['General']}</div>

        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-white/10">

            <tbody>
              {fields
                ? fields.map((field, index) => {
                  let field_value = '';
                  let field_name = field.field_name;

                  if (currentCompany) {
                    field_value = currentCompany[field_name];
                  }
                  if (!field_value) field_value = '-';
                  if (temp.hasOwnProperty(field_name)) field_value = temp[field_name];

                  return (
                    <tr key={field.id ?? field.field_name ?? index}>
                      <td className="whitespace-nowrap px-3 py-4 w-1/4 text-sm font-bold text-white">
                        {props.translator[field.field_label]}
                      </td>

                      <td className="whitespace-nowrap px-3 py-4 text-sm text-white flex w-2/5">
                        {temp && temp.hasOwnProperty(field_name) ? (
                          <>
                            {field.field_type == 'text' ? (
                              <Input
                                type="text"
                                className="mt-1 appearance-none block w-2/5 px-3 py-2 border border-white/10 bg-[#0F0B1A] text-white placeholder-[#878787] rounded-md shadow-sm focus:outline-none focus:ring-[#1C9AE1] focus:border-[#1C9AE1] sm:text-sm"
                                id={field_name}
                                name={field_name}
                                value={field_value}
                                handleChange={saveTemp}
                              />
                            ) : field.field_type == 'textarea' ? (
                              <TextArea
                                id={field_name}
                                name={field_name}
                                rows="2"
                                className="mt-1 max-w-lg shadow-sm block w-full bg-[#0F0B1A] text-white placeholder-[#878787] focus:ring-[#1C9AE1] focus:border-[#1C9AE1] sm:text-sm border border-white/10 rounded-md"
                                value={field_value}
                                handleChange={saveTemp}
                              />
                            ) : field.field_type == 'email' ? (
                              <Input
                                type="email"
                                className="mt-1 appearance-none block w-2/5 px-3 py-2 border border-white/10 bg-[#0F0B1A] text-white placeholder-[#878787] rounded-md shadow-sm focus:outline-none focus:ring-[#1C9AE1] focus:border-[#1C9AE1] sm:text-sm"
                                id={field_name}
                                name={field_name}
                                value={field_value}
                                handleChange={saveTemp}
                              />
                            ) : (
                              <Dropdown
                                id={field_name}
                                name={field_name}
                                options={countries}
                                handleChange={saveTemp}
                                emptyOption="Select"
                                value={field_value}
                              />
                            )}

                            <div className="p-2 text-white" onClick={saveCompany}>
                              <CheckIcon className="h-6 w-6 text-green-400" />
                            </div>
                            <div className="p-2 text-white" onClick={editCancel}>
                              <XMarkIcon className="h-6 w-6 text-red-400" />
                            </div>
                          </>
                        ) : (
                          <>
                            {field_value}
                            {field_name !== 'currency' &&
                              field_name !== 'time_zone' &&
                              field_name !== 'name' ? (
                              <span
                                className="ml-4 bg-white/10 border border-white/10 w-6 h-6 flex justify-center items-center"
                                onClick={() => editCompany(field_name)}
                              >
                                <PencilIcon className="h-4 w-4 text-white" />
                              </span>
                            ) : null}
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
                : null}
            </tbody>
          </table>
        </div>


      </GlassCard>

      {changeProfile ?
        <ProfilePicture
          company={props.currentCompany}
          setChangeProfile={setChangeProfile}
        />
        : ''}

    </div>
  );
}












