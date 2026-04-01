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
    maxLength,
    variant = "default",
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

    const baseDefault =
        "shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md ";

    const baseSoft =
        "mt-2 block w-full rounded-xl bg-white/[0.10] px-4 py-3 text-sm text-white " +
        "shadow-[0_10px_30px_rgba(0,0,0,0.18)] placeholder:text-white/35 " +
        "focus:outline-none focus:ring-2 focus:ring-fuchsia-500/30 ";

    const base = variant === "soft" ? baseSoft : baseDefault;

    return (
        <textarea
            name={name}
            id={id}
            rows={row}
            className={
                base + (className || "")
            }
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












