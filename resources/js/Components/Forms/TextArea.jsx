import React, { useEffect, useRef } from 'react';

export default function TextArea({
    id,
    name,
    value,
    className,
    required,
    isFocused,
    handleChange,
    row="4",
    placeholder,
    defaultValue,
    maxLength
}) {
    const input = useRef();

    useEffect(() => {
        if (isFocused) {
            input.current.focus();
        }
    }, []);

    // let requiredFlag = ''; 
    // if(required == true || required == 'true') {
    //     requiredFlag = 'required';
    // }
    // required = requiredFlag;

    return (
        <textarea
            name={name}
            id={id}
            rows={row}
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md"
            placeholder={placeholder}
            defaultValue={defaultValue}
            required={required}
            data-pristine-required={required}
            onChange={(e) => handleChange(e)}
            value={value}
            maxLength={maxLength}
        />
    );
}









