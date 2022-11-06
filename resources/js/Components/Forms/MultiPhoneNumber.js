import React, {useEffect, useState} from "react";
import {PlusIcon, TrashIcon } from '@heroicons/react/solid';

const types = [
    {name : 'Home' , label:'Home'},
    {name : 'Work' , label:'Work'},
    {name : 'Others' , label:'Others'},
];

export default function MultiPhoneNumber(props) {

    const [fields, setFields] = useState([]);

    useEffect( () => {
        addNumber();
    },[]);

    function addNumber() {
        let addField = Object.assign([], fields);
        var addNew = {'name' : props.name, 'source' : ''};
        var rowLength = Object.entries(addField).length;
        addField[rowLength] = addNew;
        console.log(addField)
        //setFields(addField);
    }

    function deleteRow(index) {
        let newState = Object.assign([], fields);
        let field_length = newState.length;
        if(field_length != 1) {
            newState.splice(index, 1);
        }
        setFields(newState); 
    }

    function handleChange(event, index) {
        let newField = Object.assign([], fields);
        const field_name = event.target.name;
        const value = event.target.value;
        newField[index][field_name] = value;
        setFields(newField);
    }

    return (
        <div className="">
            {fields.map( (field,index) => (
                <div className="flex w-full">
                 <div className="flex flex-1">
                     <div className="flex-1 flex items-center">
                         <div className="relative flex flex-grow items-stretch focus-within:z-10 rounded-md">
                             <input
                                type="text"
                                id={field.name}
                                name={field.name}
                                value={field[field.name]}
                                className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-md sm:text-sm border-gray-300"
                                onChange={(e) =>  handleChange(e, index)}
                             />
                         </div>
                     </div>
                     <div className="flex items-center">
                     <select
                         id={'source'}
                         name={'source'}
                         value={field['source']}
                         className="h-10 rounded-md border-transparent bg-transparent py-0 pl-2 pr-7 text-gray-500 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                         onChange={(e) => handleChange(e, index)}
                         >
                            <option value=''>Select</option>
                             {types.map( (type) => (
                                <option key={type.name} value={type.name}>{type.label}</option>
                             ))}
                         </select>
                     </div>
                 </div>
                 <div className="flex items-center justify-between p-4 space-x-6">
                     <button
                        type="button"
                        className="inline-flex  items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-sm text-black bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
                        onClick={() => deleteRow(index)}
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
  