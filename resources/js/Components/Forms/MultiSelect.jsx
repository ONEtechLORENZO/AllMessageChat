import React, { useEffect, useMemo, useRef } from 'react';

export default function MultiSelect({
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
    const optionEntries = useMemo(
        () => Object.entries(options || {}).filter(([key]) => !!key),
        [options]
    );

    useEffect(() => {
        if (isFocused) {
            input.current.focus();
        }
    }, [isFocused]);

    return (
        <div className="space-y-2">
            <select
                name={name}
                id={id}
                value={value || []}
                className={
                    `mt-1 block w-full rounded-2xl border border-white/10 bg-[#12041f] px-3 py-3 text-sm text-white shadow-[0_10px_30px_rgba(0,0,0,0.18)] focus:border-fuchsia-500/60 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20 ` +
                    className
                }
                style={{ colorScheme: 'dark' }}
                required={required}
                ref={input}
                onChange={handleChange}
                disabled={readOnly}
                multiple
                size={Math.min(Math.max(optionEntries.length, 4), 8)}
            >
                {optionEntries.map(([key, label]) => (
                    <option
                        key={key}
                        value={key}
                        style={{ backgroundColor: '#12041f', color: '#ffffff' }}
                    >
                        {label}
                    </option>
                ))}
            </select>

            <p className="text-xs text-white/45">
                Hold Ctrl on Windows or Cmd on Mac to select multiple languages.
            </p>
        </div>
    );
}












