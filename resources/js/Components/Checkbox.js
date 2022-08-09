import React from 'react';

export default function Checkbox({ name, value, handleChange }) {

    return (
        <input
            type="checkbox"
            onChange={(e) => handleChange(e)}
            name={name}
            value={value}
            checked={value == 1 ? 'checked' : ''}
            defaultChecked={value}
            className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
    );
}
