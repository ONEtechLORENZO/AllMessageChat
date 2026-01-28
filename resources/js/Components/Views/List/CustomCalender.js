import React, {useState} from "react";
import { CalenderIcon } from '@/Pages/icons';
import { Inertia } from "@inertiajs/inertia";
import DateRangePicker from 'react-bootstrap-daterangepicker';
import 'bootstrap-daterangepicker/daterangepicker.css';

export default function CustomCalender(props) {

    var date = new Date().toLocaleString();
    const [startDate , setStartDate] = useState({ date });

    function handleEvent(event, picker){   

        if(props.module == 'Conversation' && props.from == 'conversation') {
            Inertia.get(route('wallet', {'module' : props.module, 'current_page' : 'Expenses', 'is_conversation' : true, 'start_date': picker.startDate.format('YYYY/MM/DD'), 'end_date': picker.endDate.format('YYYY/MM/DD')}));
        }

        if(props.module == 'Msg' || props.module == 'Transaction') {
            Inertia.get(route('wallet', {'module' : props.module, 'current_page' : 'Expenses', 'start_date': picker.startDate.format('YYYY/MM/DD'), 'end_date': picker.endDate.format('YYYY/MM/DD')}));
        }    
    }

    return (
        <div>
            <DateRangePicker
              onApply={handleEvent}                    
              initialSettings={{ startDate: startDate, endDate: '19/11/23' }}
            >
                <button><CalenderIcon/></button>
            </DateRangePicker>
        </div>
    );
}