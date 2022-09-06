import React, { useState, useRef, Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react'
import AsyncSelect from "react-select/async";
import Form from '@/Components/Forms/Form';
import nProgress from 'nprogress';
import Axios from "axios";
import { Inertia } from '@inertiajs/inertia';

export default function Relate(props) {
    const[contactList, setContactList] = useState();
    const[selectedContact , setSelectedContact] = useState();
    const options=[
        {value:"Anitha",label:"Anitha"},
        {value:"Simeon",label:"Simeon"}

    ]

    useEffect(() => {    
      getUserContacts('');
      },[]);

    /**
     * Get User contact list
     */
    function getUserContacts(key){
        nProgress.start(0.5);
        nProgress.inc(0.2);
        var url = route('get_relate_contacts_list');
        url += '?parent='+props.parent_module;
        if(props.parent_id){
            url += '&record='+props.parent_id;
        }
        if(key){
            url += '&key='+key;
        }
        Axios.get(url).then((response) => {
            nProgress.done(true);            
            setContactList(response.data.records);
            
        });    
    }

        /**
     * Get Contact list based on input 
     */
    function handleInputChange(value){
        if(value){
            getUserContacts(value);
        }
    }
    return (
        <AsyncSelect
         cacheOptions
         defaultOptions
        // defaultValue={selectedContact}
         value={selectedContact}
          options={options}
         // loadOptions={loadOptions}
       onInputChange={handleInputChange}
        onChange={setSelectedContact}
        />               
    );
}
