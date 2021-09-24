import React from 'react';

export default function Checkbox({ id, name, value, handleChange }) {
    return (
        <input
            type="checkbox"
            name={name}
            checked={value}
            id={id}
            className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            onChange={(e) => handleChange(e)}
        />
    );
}
