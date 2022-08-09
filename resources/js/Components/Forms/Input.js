import React, { useEffect, useRef } from 'react';

export default function Input({
    type = 'text',
    id,
    name,
    value,
    className = '',
    autoComplete,
    required,
    isFocused,
    handleChange,
    placeholder,
}) {
    const input = useRef();

    useEffect(() => {
        if (isFocused) {
            input.current.focus();
        }
    }, []);

    return (
        <input
            type={type}
            name={name}
            id={id}
            value={value}
            className={
                `focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-md sm:text-sm border-gray-300 ` +
                className
            }
            ref={input}
            autoComplete={autoComplete}
            required={required}
            placeholder={placeholder}
            onChange={(e) => handleChange(e)}
        />
    );
}
