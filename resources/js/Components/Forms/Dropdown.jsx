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
    disabled = false,
    readOnly,
    variant = "default",
}) {
    const input = useRef(null);

    useEffect(() => {
        if (isFocused) input.current?.focus();
    }, [isFocused]);

    const baseDefault =
        "mt-1 block w-full py-2 px-3 rounded-md shadow-sm " +
        "border border-white/20 bg-[#0F0B1A] text-white " +
        "focus:outline-none focus:ring-2 focus:ring-[#1C9AE1] focus:border-[#1C9AE1] " +
        "sm:text-sm";

    const baseSoft =
        "mt-2 block w-full rounded-xl bg-white/[0.10] px-4 py-3 text-sm text-white " +
        "shadow-[0_10px_30px_rgba(0,0,0,0.18)] " +
        "focus:outline-none focus:ring-2 focus:ring-fuchsia-500/30 " +
        "sm:text-sm";

    const base = variant === "soft" ? baseSoft : baseDefault;

    return (
        <select
            name={name}
            id={id}
            value={value}
            className={`${base} ${className}`}
            required={required}
            data-pristine-required={required}
            ref={input}
            onChange={handleChange}
            disabled={disabled || readOnly}
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
