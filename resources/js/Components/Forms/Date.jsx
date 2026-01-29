import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function Date({
    id,
    name,
    value,
    handleChange
}){

    return (
           <DatePicker 
           className="mt-1 max-w-lg shadow-sm block w-full focus:ring-skin-primary focus:border-skin-primary sm:text-sm border border-gray-300 rounded-md"
           id={id}
           name={name}
           value={value}
           onChange={handleChange}
           showMonthDropdown
           showYearDropdown           
           dropdownMode="select"
           dateFormat='d/M/yyyy'
           closeOnScroll={true}
           />
    );
}









