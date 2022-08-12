import React, { useEffect, useRef } from 'react';

export default function Dropdown({
    id,
    name,
    options,
    className = '',
    required,
    isFocused,
    handleChange,
    emptyOption='Select',
    value='',
    readOnly
}) {
    const input = useRef();

    useEffect(() => {
        if (isFocused) {
            input.current.focus();
        }
    }, []);

    return (
        <select 
            name={name}
            id={id}
            value={value}
            className={`mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm` + className}
            required={required}
            ref={input}
            onChange={(e) => handleChange(e)}
            disabled={readOnly}
         >
            <option value=''>{emptyOption}</option>
            {options && Object.keys(options).map((key) => {
                return <option key={key} value={key}>{options[key]}</option>;
            })}
        </select>
    );
}
