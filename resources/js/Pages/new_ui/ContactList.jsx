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
import ListViewTable from '@/Components/Views/List/ListViewTable';

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
                <ListViewTable theme="light" {...props} />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
}












