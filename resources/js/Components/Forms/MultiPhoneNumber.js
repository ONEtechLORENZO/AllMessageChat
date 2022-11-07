import React, {useEffect, useState} from "react";
import {PlusIcon, TrashIcon } from '@heroicons/react/solid';

const types = [
    {name : 'Home' , label:'Home'},
    {name : 'Work' , label:'Work'},
    {name : 'Others' , label:'Others'},
];

export default function MultiPhoneNumber(props) {

    const [numbers, setNumber] = useState([]);

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

    function phoneNumberHandler(event, index) {
        
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
                 <div className="flex flex-1">
                     <div className="flex-1 flex items-center">
                         <div className="relative flex flex-grow items-stretch focus-within:z-10 rounded-md">
                             <input
                                type="text"
                                id={props.name}
                                name={props.name}
                                value={number[props.name]}
                                className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-md sm:text-sm border-gray-300"
                                onChange={(e) =>  phoneNumberHandler(e, index)}
                             />
                         </div>
                     </div>
                     <div className="flex items-center">
                     <select
                         id={'type'}
                         name={'type'}
                         value={number['type']}
                         className="h-10 rounded-md border-transparent bg-transparent py-0 pl-2 pr-7 text-gray-500 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                         onChange={(e) => phoneNumberHandler(e, index)}
                         >
                            <option value=''>Select</option>
                             {types.map( (type) => (
                                <option key={type.name} value={type.name} selected={type.name == number['type'] ? true : false}>{type.label}</option>
                             ))}
                         </select>
                     </div>
                 </div>
                 <div className="flex items-center justify-between p-4 space-x-6">
                     <button
                        type="button"
                        className="inline-flex  items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-sm text-black bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
                        onClick={() => deleteNumber(index)}
                     >
                         <TrashIcon 
                             className='h-4 w-4 text-red-600 cursor-pointer' 
                         />
                     </button>
                 </div>       
                </div>
            ))}
            <div className="flex justify-end px-4">
                <div className="flex items-center justify-between">
                    <button
                        type="button"
                        className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-sm text-black bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
                        onClick={() => addNumber()}
                    >
                        Add 
                        <PlusIcon 
                            className='h-4 w-4 text-red-600 cursor-pointer' 
                        />
                    </button>
                </div>
            </div>
        </div>    
    )
}
  