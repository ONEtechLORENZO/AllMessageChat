import React, { useEffect, useState } from "react";

export function ListViewTimeFormate (props) {

    const [recordTime, setRecordTime] = useState();
    const [recordDate, setRecordDate] = useState();

    useEffect(() => {
        changeDateFormate(props.time);
        changeTimeFormate(props.time);
    },[props]);

    function changeTimeFormate(time) {
        var date = new Date(time);
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var timeform = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        var strTime = hours + ':' + minutes + ' ' + timeform;
        setRecordTime(strTime);
    }

    function changeDateFormate(date) {
        let newDate = new Date();
        let today = newDate.toLocaleDateString();
        let yesterday = new Date(newDate.setDate(newDate.getDate() - 1)).toLocaleDateString();
        let changeDate = new Date(date);
        let createDate = changeDate.toLocaleDateString();
        let fullTime = changeDate.toDateString();


        if(today === createDate) {
            setRecordDate('Today');
        } else if (yesterday === createDate) {
            setRecordDate('Yesterday');
        } else {
            setRecordDate(fullTime);
        }
    }

    return(
        <>
          {recordDate} at {recordTime}
        </>
    );
}