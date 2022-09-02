import React, {useState} from 'react';
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";

export default function DateTime({
    id,
    name,
    value,
    handleChange
}){
         
    return (
        <div className="mt-1 max-w-lg shadow-sm block w-full focus:ring-skin-primary focus:border-skin-primary sm:text-sm border border-gray-300 rounded-md">
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Stack spacing={3}>
                <DateTimePicker
                id={id}
                name={name}
                value={value}
                onChange={handleChange}
                renderInput={(params) => <TextField {...params} />}
                />
            </Stack>
        </LocalizationProvider> 
    </div> 
    );
}