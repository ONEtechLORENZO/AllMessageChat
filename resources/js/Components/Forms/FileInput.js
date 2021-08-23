import React, { useEffect, useRef } from 'react';

export default function FileInput({
    id,
    name,
    value,
    className,
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
            type='file'
            name={name}
            id={id}
            value={value}
            className={
                `flex-1 block w-full sm:text-sm ` +
                className
            }
            ref={input}
            required={required}
            data-pristine-required={required}
            onChange={(e) => handleChange(e)}
        />
    );
}
