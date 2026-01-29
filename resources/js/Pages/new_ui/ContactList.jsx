import React, { useState, useEffect } from 'react'
import { Head, Link } from '@inertiajs/react';
import { WiTime8 } from "react-icons/wi";
import { SlScreenSmartphone } from "react-icons/sl";
import { GoMail } from "react-icons/go";
import { FiX } from "react-icons/fi";
import { BsFacebook, BsWhatsapp, BsInstagram, BsTelegram, BsLinkedin, BsTools } from "react-icons/bs";
import { FaTiktok } from "react-icons/fa";
import { TfiLocationPin } from "react-icons/tfi";
import { IoMdArrowDropdown } from "react-icons/io"
import Checkbox from '@/Components/Forms/Checkbox';
import ToolMenu from '@/Components/Views/List/ToolMenu';
import ActionMenu from '@/Components/Views/List/ActionMenu';
import Axios from 'axios';

export default function ContactList(props) {

    const [fields, setFields] = useState([]);
    const [fieldOptions, setFieldOptions ] = useState({});

    useEffect(() => {
      fetchModuleFields();
    }, [props.headers]);

    function fetchModuleFields() {        
      let endpoint_url = route('fetchModuleFields', {'module': props.module});
      Axios.get(endpoint_url).then((response) => {             
        if (response.data.status !== false) {               
          setFields(response.data.fields); 
          optionFields(response.data.fields);             
        }
        else {
          notie.alert({type: 'error', text: response.data.message, time: 5});
        }         
      })      
    }

    function optionFields(fields) {
      if(fields) {
        Object.entries(fields).map( ([key,field]) => {
            let newFieldOptions = Object.assign({}, fieldOptions);
            if(field.field_type == 'dropdown') {
              newFieldOptions[field.field_name] = field.options;
              setFieldOptions(newFieldOptions);  
            }
        });
      }
    }

    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          { /* <div className="sm:flex-auto">
            <h1 className="text-xl font-semibold text-gray-900">Users</h1>
              <p className="mt-2 text-sm text-gray-700">
                A list of all the users in your account including their name, title, email and role.
              </p>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
              >
                Add user
              </button>
      </div>*/}
        </div>
        <div className="mt-8 flex flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden  md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300 ">
                  <thead >
                    <tr className='text-[#363740] text-sm'>
                      <th scope="col" className="relative w-12 px-6 sm:w-16 sm:px-8">
                      {(props.actions.mass_edit === true || props.actions.merge === true)&& 
                          <Checkbox
                            id={'checkall'}
                            name={'checkall'}
                            value={props.checkAll === true ? 1 : ''}
                            handleChange={() => props.selectCheckAll()}
                          />
                      }
                      </th>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-medium text-gray-900 sm:pl-6">
                        <span className='pb-[6px] border-b border-[#C8C8C8] block'> Name</span>
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-medium text-gray-900">
                        <span className='pb-[6px] border-b border-[#C8C8C8] block'> Contacts</span>

                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-medium text-gray-900">
                        <span className='pb-[6px] border-b border-[#C8C8C8] block'> Socials</span>

                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-medium text-gray-900">
                        <span className='pb-[6px] border-b border-[#C8C8C8] block'> Tags</span>

                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-medium text-gray-900">
                        <span className='pb-[6px] border-b border-[#C8C8C8] block'> Country</span>

                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-medium text-gray-900">
                        <span className='pb-[6px] border-b border-[#C8C8C8] block'> Organization</span>

                      </th>

                      <th className='text-right px-3 py-3.5' width="50px">
                        <ToolMenu 
                          module={props.module}
                          headers={props.headers}
                        />
                      </th>

                    </tr>
                  </thead>
                  <tbody className="divide-y-4 divide-gray-200 bg-white">
                    {(props.records).length === 0 &&
                      <tr>
                        <td className="px-6 py-4 border-t" colSpan="8"> No records found! </td>
                      </tr>
                    }
                    {Object.entries(props.records).map(([key, record]) => (
                      <tr key={key} className="bg-white">
                        {(props.actions.mass_edit === true || props.actions.merge === true)&& 
                          <td className="relative w-12 px-6 sm:w-16 sm:px-8">
                            <Checkbox
                              id={record.id}
                              name={record.id}
                              value={props.checkedId.includes(record.id) ? 1 :''}
                              handleChange={() => props.getCheckId(key, record.id)}
                            />
                          </td>
                        }

                        <td className="whitespace-nowrap py-2 pl-4 pr-3 text-sm sm:pl-6">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              {/* <img className="h-10 w-10 rounded-full" src={person.image} alt="" /> */}
                            </div>
                            <div className="ml-4">
                              <div className="font-medium text-gray-900 "><Link href={route('detailContact', { id: record.id })} className='cursor-pointer underline'>{record.first_name}  {record.last_name} </Link></div>
                              <div className="text-gray-500 flex items-center gap-1"><WiTime8 /> {record.updated_at}</div>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-500">
                          {
                            record.phone_number && record.phone_number.length > 0 ?

                              (record.phone_number).map((phone, index) => {
                                return (
                                  (index) < 1 &&
                                  <div className="text-gray-900 flex items-center gap-2"> <SlScreenSmartphone />{phone.value}
                                    {((record.phone_number.length) - 1) > 0 ?
                                      <div className='flex items-center text-[#7666B4]'> + {(record.phone_number.length - 1)} </div> : ''}
                                  </div>
                                )
                              })
                              : ""

                          }
                          {
                            record.email && record.email.length > 0 ?

                              (record.email).map((email, index) => {
                                return (
                                  (index) < 1 &&
                                  <div className="text-gray-500 flex items-center gap-2"><GoMail />{email.value}
                                    {((record.email.length) - 1) > 0 ?
                                      <div className='flex items-center text-[#7666B4]'> + {(record.email.length - 1)} </div> : ''}</div>

                                )
                              })
                              : ""

                          }



                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-500">

                          <div className='inline-grid gap-2 grid-cols-4 text-[#7666B4]'>
                            {(record.facebook_username) && <BsFacebook />}
                            {(record.whatsapp_number) && <BsWhatsapp />}
                            {(record.instagram_username) && <BsInstagram />}
                            {(record.telegram_number) && <BsTelegram />}
                            {(record.tiktok_username) && <FaTiktok />}
                            {(record.linkedin_username) && <BsLinkedin />}
                          </div>


                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-500">
                          <div className='flex items-center gap-1'>
                            <div className='flex flex-col gap-1 items-start'>
                              {
                                record.tag && record.tag.length > 0 ?

                                  (record.tag).map((tag, tagIndex) => {
                                    return (
                                      (tagIndex) < 2 &&
                                      <span className="inline-flex items-center !rounded bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                                        {tag.value}
                                      </span>
                                    )
                                  })
                                  : ""
                              }
                            </div>
                            {((record.tag.length) - 2) > 0 ?
                              <div className='flex items-center text-[#7666B4]'> + {(record.tag.length - 2)} </div> : ''}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3  py-2 text-sm text-gray-500"><div className='flex gap-2 items-center'>
                          { !!record.country ? <TfiLocationPin /> : null }
                          {record.country}
                        </div></td>
                        <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-500">

                          {record.organization_id}
                        </td>
                        {/* <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                              <PencilSquareIcon title='Edit' className='h-4 w-4 cursor-pointer' onClick={() => props.showEditForm(record.id)} />
                          </td> */}
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6" width="50px">
                          <ActionMenu 
                            record={record} 
                            fields={fields}
                            {...props}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
}









