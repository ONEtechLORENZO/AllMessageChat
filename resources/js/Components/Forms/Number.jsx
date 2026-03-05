import React from 'react';

export default function Number({
    type = 'text',
    className,
    id,
    name,
    value,
    handleChange,
}){

    return(       
        <input
            type={type}
            name={name}
            id={id}
            className={
                `focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-md sm:text-sm border-gray-300 ` +
                className
            }
            value={value}
            onChange={handleChange}
        />
    );
}












