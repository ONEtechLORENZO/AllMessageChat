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
    const selectedValues = useMemo(() => {
        if (Array.isArray(value)) {
            return value.map((item) => String(item));
        }

        if (typeof value === 'string' && value.trim() !== '') {
            try {
                const parsed = JSON.parse(value);

                if (Array.isArray(parsed)) {
                    return parsed.map((item) => String(item));
                }
            } catch {
                return value
                    .split(',')
                    .map((item) => item.trim())
                    .filter(Boolean);
            }
        }

        return [];
    }, [value]);
    const selectedLabels = useMemo(() => {
        if (!selectedValues.length) {
            return [];
        }

        const optionMap = new Map(optionEntries);

        return selectedValues.map((selectedValue) => ({
            value: selectedValue,
            label: optionMap.get(selectedValue) ?? selectedValue,
        }));
    }, [optionEntries, selectedValues]);

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
                value={selectedValues}
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

            {selectedLabels.length ? (
                <div className="flex flex-wrap gap-2">
                    {selectedLabels.map((item) => (
                        <span
                            key={item.value}
                            className="inline-flex items-center rounded-full bg-fuchsia-500/15 px-2.5 py-1 text-xs font-medium text-fuchsia-100 ring-1 ring-fuchsia-400/25"
                        >
                            {item.label}
                        </span>
                    ))}
                </div>
            ) : null}

            <p className="text-xs text-white/45">
                Hold Ctrl on Windows or Cmd on Mac to select multiple languages.
            </p>
        </div>
    );
}












