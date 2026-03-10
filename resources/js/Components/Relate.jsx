import React, { useState } from 'react';
import AsyncSelect from "react-select";
import nProgress from 'nprogress';
import Axios from "axios";

function Relate(props) 
{
    const [records, setRecords] = useState([]);
    const selectStyles = {
        control: (base, state) => ({
            ...base,
            minHeight: 42,
            backgroundColor: '#12041f',
            borderColor: state.isFocused ? 'rgba(217, 70, 239, 0.6)' : 'rgba(255,255,255,0.10)',
            boxShadow: state.isFocused ? '0 0 0 1px rgba(217,70,239,0.45)' : 'none',
            borderRadius: 16,
            color: '#fff',
            '&:hover': {
                borderColor: 'rgba(217,70,239,0.45)',
            },
        }),
        menu: (base) => ({
            ...base,
            backgroundColor: '#12041f',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 18px 50px rgba(0,0,0,0.35)',
        }),
        menuList: (base) => ({
            ...base,
            padding: 8,
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isFocused
                ? 'rgba(217,70,239,0.14)'
                : state.isSelected
                    ? 'rgba(217,70,239,0.22)'
                    : 'transparent',
            color: '#fff',
            borderRadius: 12,
            cursor: 'pointer',
        }),
        input: (base) => ({
            ...base,
            color: '#fff',
        }),
        placeholder: (base) => ({
            ...base,
            color: 'rgba(255,255,255,0.35)',
        }),
        singleValue: (base) => ({
            ...base,
            color: '#fff',
        }),
        indicatorSeparator: (base) => ({
            ...base,
            backgroundColor: 'rgba(255,255,255,0.10)',
        }),
        dropdownIndicator: (base) => ({
            ...base,
            color: 'rgba(255,255,255,0.60)',
            ':hover': {
                color: '#fff',
            },
        }),
        clearIndicator: (base) => ({
            ...base,
            color: 'rgba(255,255,255,0.60)',
            ':hover': {
                color: '#fff',
            },
        }),
        noOptionsMessage: (base) => ({
            ...base,
            color: 'rgba(255,255,255,0.55)',
        }),
        loadingMessage: (base) => ({
            ...base,
            color: 'rgba(255,255,255,0.55)',
        }),
    };

    /**
     * Get Records
     */
    function getRecords(key)
    {
        nProgress.start(0.5);
        nProgress.inc(0.2);

        var url = route('lookup');
        url += '?module=' + props.module;
        if(key) {
            url += '&key=' + key;
        }

        Axios.get(url).then((response) => {
            nProgress.done(true);
            setRecords(response.data.records);    
        });
    }

    /**
     * Return records based on the input
     * 
     * @param {string} value 
     */
    function handleInputChange(value){
        if(value) {
            getRecords(value);
        }
    }

    return (
        <AsyncSelect
            value={props.value}
            onChange={(value) => props.handleChange(value, props.name)}
            options={records}
            onInputChange={handleInputChange}
            placeholder="Select..."
            styles={selectStyles}
            theme={(theme) => ({
                ...theme,
                borderRadius: 16,
                colors: {
                    ...theme.colors,
                    primary: '#d946ef',
                    primary25: 'rgba(217,70,239,0.14)',
                    neutral0: 'transparent',
                    neutral80: '#ffffff',
                },
            })}
        />               
    );
}

export default Relate;












