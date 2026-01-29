import React, { useState } from 'react';
import AsyncSelect from "react-select";
import nProgress from 'nprogress';
import Axios from "axios";

function Relate(props) 
{
    const [records, setRecords] = useState([]);

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
        />               
    );
}

export default Relate;












