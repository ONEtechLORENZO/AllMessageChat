import React, {useEffect, useState} from "react";
import {PlusIcon, TrashIcon } from '@heroicons/react/24/solid';
import PhoneInput2 from 'react-phone-input-2';
import { parsePhoneNumber } from 'react-phone-number-input';


export default function MultiPhoneNumber(props) {

    const [numbers, setNumber] = useState([]);

const types = [
    {name : 'Home' , label:props.translator['Home']},
    {name : 'Work' , label:props.translator['Work']},
    {name : 'Others' , label:props.translator['Others']},
];

    useEffect( () => {
        let record = props.value;
        if(record && (record).length != 0){
            setNumber(props.value);
        } else {
            if(numbers && numbers.length == 0) {
                addNumber();
            }
        }
    }, [props]);

    function addNumber() {
        let newNumber = Object.assign([], numbers);
        var addNew = {'name' : props.name, 'type' : ''};
        var rowLength = Object.entries(newNumber).length;
        newNumber[rowLength] = addNew;
        setNumber(newNumber);
    }

    function deleteNumber(index) {
        let newNumber = Object.assign([], numbers);
        let field_length = newNumber.length;
        if(field_length != 1) {
            newNumber.splice(index, 1);
        }

        props.DataHandler(props.name, newNumber);
        setNumber(newNumber); 
    }

    function phoneNumberHandler(value, index) {
        
        let newNumber = Object.assign([], numbers);
        value = '+'+value;
        newNumber[index]['phones'] = value;
        if(value && parsePhoneNumber(value) ){
            newNumber[index]['country_code'] = parsePhoneNumber(value).countryCallingCode;
        }
        props.DataHandler('phones', newNumber);
        setNumber(newNumber);
    }

    function categoryHandler(event, index) {
        
        let newNumber = Object.assign([], numbers);
        const field_name = event.target.name;
        const value = event.target.value;
        newNumber[index][field_name] = value;

        props.DataHandler(props.name, newNumber);
        setNumber(newNumber);
    }

    return (
        <div className="">
            {numbers.map( (number,index) => (
                <div className="flex w-full">
                 <div className="mt-1 col-span-8 !sm:mt-0">
                        <div className="grid grid-cols-12 gap-2">
                            <div className="col-span-6">
                                <PhoneInput2
                                    inputProps={{
                                        name: 'phones',
                                        autoFocus: true
                                    }}
                                    containerStyle={{ marginTop: "15px" }}
                                    searchclassName="search-class"
                                    searchStyle={{ margin: "0", width: "97%", height: "30px" }}
                                    enableSearchField
                                    disableSearchIcon
                                    placeholder="Enter phone number"
                                    value={number[props.name]} 
                                    onChange={(e) => phoneNumberHandler(e,index)}
                                />
                            </div>
                            <div className="col-span-4">
                                <select
                                    id={'type'}
                                    name={'type'}
                                    value={number['type']}
                                    className="h-10 rounded-md border-transparent bg-transparent py-0 pl-2 pr-7 text-gray-500 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    onChange={(e) => categoryHandler(e, index)}
                                >
                                    <option value=''>{props.translator['Select']}</option>
                                    {types.map( (type) => (
                                        <option key={type.name} value={type.name} selected={type.name == number['type'] ? true : false}>{type.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-span-2">
                                <button
                                    type="button"
                                    className="inline-flex items-center px-3 py-2 text-sm leading-4 font-medium rounded-sm text-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
                                    onClick={() => deleteNumber(index)}
                                >
                                    <TrashIcon className='h-4 w-4 text-red-600 cursor-pointer' />
                                </button>
                            </div>
                        </div>
                    </div>      
                </div>
            ))}
            <div className="flex gap-1 items-center text-[#545CD8] !mt-1 cursor-pointer">
                <button
                    type="button"
                    className="inline-flex items-center px-3 py-2 text-sm leading-4 font-medium rounded-sm text-[#545CD8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
                    onClick={() => addNumber()}
                >
                    <PlusIcon 
                        className='h-4 w-4 text-[#545CD8] cursor-pointer mr-2' 
                    />
                    {props.translator['Add']} {props.buttonTitle ? props.translator[props.buttonTitle] : ''}
                </button>
            </div>
        </div>    
    )

}
  









