import { React, useState } from 'react'
import Dropdown from '@/Components/Forms/Dropdown';
import { router as Inertia } from "@inertiajs/react";

export default function CalenderMenu(props) {

    const [calender, setCalender] = useState(props.sort_time);

    const options = {
        'today' : 'Today', 'yesterday' : 'Yesterday', 'week' : 'This Week', 'month' : 'This Month'
    };

    function calenderHandler(event) {
        let value = event.target.value;
        setCalender(value);

        if(props.module == 'Conversation' && props.from == 'conversation') {
            Inertia.get(route('wallet', {'module' : props.module, 'current_page' : 'Expenses', 'sort_time' : value, 'is_conversation' : true}));
        } 
        if (props.module == 'Msg' || props.module == 'Transaction') {
            Inertia.get(route('wallet', {'module' : props.module, 'current_page' : 'Expenses', 'sort_time' : value}));
        }
    }

    return (
        <Dropdown
            id={'calender'}
            name={'calender'}
            options={options}
            handleChange={calenderHandler}
            emptyOption={'All'}
            value={calender}
        />
    )
}









