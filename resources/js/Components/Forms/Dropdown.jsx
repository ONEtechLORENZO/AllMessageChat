import React, { useEffect, useRef } from "react";

export default function Dropdown({
    id,
    name,
    options,
    className = "",
    required,
    isFocused,
    handleChange,
    emptyOption = "Select",
    value = "",
    readOnly,
}) {
    const input = useRef(null);

    useEffect(() => {
        if (isFocused) input.current?.focus();
    }, [isFocused]);

    const base =
        "mt-1 block w-full py-2 px-3 rounded-md shadow-sm " +
        "border border-white/20 bg-[#0F0B1A] text-white " +
        "focus:outline-none focus:ring-2 focus:ring-[#1C9AE1] focus:border-[#1C9AE1] " +
        "sm:text-sm";

    return (
        <select
            name={name}
            id={id}
            value={value}
            className={`${base} ${className}`}
            required={required}
            ref={input}
            onChange={handleChange}
            disabled={readOnly}
        >
            <option className="bg-[#0F0B1A] text-white" value="">
                {emptyOption}
            </option>

            {options &&
                Object.keys(options).map((key) => (
                    <option
                        key={key}
                        value={key}
                        className="bg-[#0F0B1A] text-white"
                    >
                        {options[key]}
                    </option>
                ))}
        </select>
    );
}
