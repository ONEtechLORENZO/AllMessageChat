import React from 'react';

export default function InputError(props) {        
    return (
        props.message ? <div className="pristine-error text-red-500 text-xs mt-1">{props.message}</div> : ''
    );
}