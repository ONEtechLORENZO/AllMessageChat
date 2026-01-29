import React, { useState, useEffect } from "react";
import { CheckIcon, PencilIcon, XMarkIcon, CameraIcon } from "@heroicons/react/24/outline";
import Dropdown from "@/Components/Forms/Dropdown";
import { Link } from "@inertiajs/react";
import Axios from "axios";
import Input from "@/Components/Forms/Input";
import { router as Inertia } from "@inertiajs/react";
import { countries } from '@/Pages/Constants';
import TextArea from "@/Components/Forms/TextArea";
import ProfilePicture from "./profilePicture";

import {

  Card,
  CardBody,
  CardTitle, Button

} from "reactstrap";

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
      <div className="sm:grid grid grid-cols-2 gap-4">
        <Card>
          <CardBody className="flex rounded-lg p-4 gap-4 items-center">
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
              <p className="font-bold">{props.translator['This is your Workspace']}</p>
              <p className="text-gray-500 text-sm whitespace-initial pt-2">
                {props.translator['Here you can change your company settings, add, edit or remove informations, as you number, your address, link your channel, etc.']}
              </p>
            </div>
          </CardBody>
        </Card>
        <Card className="!bg-[#F6FFFD]"  >
          <CardBody>
            <CardTitle>{currentCompany && currentCompany.plan} - {props.translator['Plan']}</CardTitle>
            <div className="grid grid-cols-2 p-2">
              <div className="">
                <p className="flex text-gray-500 gap-2"><span className="w-5 h-5"><CheckIcon /></span>{props.translator['Monthly Fee']}</p>
                <p className="flex text-gray-500 gap-2"><span className="w-5 h-5"><CheckIcon /></span>1 {props.translator['Number for channel']}</p>
                <p className="flex text-gray-500 gap-2"><span className="w-5 h-5"><CheckIcon /></span>1 {props.translator['User for Workspace']}</p>
              </div>
              <div className="p-4 sm:flex sm:flex-row-reverse self-center">
                <Link
                  href={route('update_plan')}
                  className="w-full inline-flex justify-center rounded-md px-4 py-2 text-base font-medium btn btn-secondary sm:ml-3 sm:w-auto sm:text-sm"
                >
                  {props.translator['Update']}
                </Link>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardBody className="flex rounded-lg p-4 gap-4">
          <div className="sm:grid grid grid-cols-2 gap-4 p-2 w-full">
            <div className="flex p-4 gap-4">
              <div className="w-28">
                <div className="w-28 h-28 relative">
                  <img src={props.currentCompany.file_path} className="object-cover w-full h-full rounded-full" />
                  <div className="absolute right-0 bottom-0 w-6 h-6 bg-gray-100 cursor-pointer flex justify-center items-center" onClick={() => setChangeProfile(true)}>
                    <CameraIcon className="text-gray-800 w-5 h-5" />
                  </div>
                </div>
              </div>
              <div className="flex justify-center items-center">
                <div className="p-2 flex">
                  <div className="text-2xl font-bold flex gap-3 items-center">{currentCompany && currentCompany.name} </div>
                  <div className="px-4 text-md text-gray-600 font-bold">{currentCompany && currentCompany.payment_method == 'Postpaid' ? '( Postpaid )' : ''}</div>
                </div>
              </div>
            </div>

          </div>
        </CardBody>
      </Card>


      <Card>
        <CardBody className="rounded-lg p-4 gap-4">
          <CardTitle>{props.translator['General']}</CardTitle>

          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-300">

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
                        <td className="whitespace-nowrap px-3 py-4 w-1/4 text-sm font-bold text-gray-500">
                          {props.translator[field.field_label]}
                        </td>

                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 flex w-2/5">
                          {temp && temp.hasOwnProperty(field_name) ? (
                            <>
                              {field.field_type == 'text' ? (
                                <Input
                                  type="text"
                                  className="mt-1 appearance-none block w-2/5 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-skin-primary focus:border-skin-primary sm:text-sm"
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
                                  className="mt-1 max-w-lg shadow-sm block w-full focus:ring-skin-primary focus:border-skin-primary sm:text-sm border border-gray-300 rounded-md"
                                  value={field_value}
                                  handleChange={saveTemp}
                                />
                              ) : field.field_type == 'email' ? (
                                <Input
                                  type="email"
                                  className="mt-1 appearance-none block w-2/5 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-skin-primary focus:border-skin-primary sm:text-sm"
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

                              <div className="p-2 text-gray-900" onClick={saveCompany}>
                                <CheckIcon className="h-6 w-6 text-green-900" />
                              </div>
                              <div className="p-2 text-gray-900" onClick={editCancel}>
                                <XMarkIcon className="h-6 w-6 text-red-900" />
                              </div>
                            </>
                          ) : (
                            <>
                              {field_value}
                              {field_name !== 'currency' &&
                                field_name !== 'time_zone' &&
                                field_name !== 'name' ? (
                                <span
                                  className="ml-4 bg-gray-100 w-6 h-6 flex justify-center items-center"
                                  onClick={() => editCompany(field_name)}
                                >
                                  <PencilIcon className="h-4 w-4" />
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


        </CardBody>
      </Card>

      {changeProfile ?
        <ProfilePicture
          company={props.currentCompany}
          setChangeProfile={setChangeProfile}
        />
        : ''}

    </div>
  );
}












