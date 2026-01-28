import React, {useState} from "react";
import Dropdown from "@/Components/Forms/Dropdown";
import Axios from "axios";
import notie from 'notie';
import { ChevronRightIcon } from '@heroicons/react/solid';

const periods = {
    never : 'Never', year : 'Year', month : 'Month', week : 'Week', day : 'Day'
};

export default function Step5(props) {

    const [scheduleTime, setScheduleTime] = useState();

    function scheduleTimePeriod() {
        if(scheduleTime) {
            let url = route('schedule_period', {catalog_id : props.catalogId, period : scheduleTime});
            Axios.post(url).then( (response) => {
                if(response.data.status !== false) {
                    props.setTab('loading');
                }
            });
        } else {
            notie.alert({type: 'warning', text: 'Please select the scheduling time', time: 5}); 
        }
    }

    
    return (
        <>
          <div className="flex-1">
                <div className="space-y-2">
                    <div className="text-center flex justify-center flex-col items-center !gap-4">
                        <label
                            htmlFor="first-name"
                            className="block col-span-4 text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
                        >
                            Schedule Import Every
                        </label>                    
                        <div className="w-1/2"> 
                            <Dropdown
                                id={'schedule'}
                                name={'schedule'}
                                options={periods}
                                handleChange={(e) => setScheduleTime(e.target.value)}
                                emptyOption={'Select'}
                                value={scheduleTime}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="h-16 flex items-center justify-between">
              <button type="button" className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm" onClick={() => props.setShowImport(false)}>Cancel</button>
              <button 
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#7c3aed] text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => scheduleTimePeriod()}
                >
                Next <ChevronRightIcon className="w-4 h-4 text-white mt-1"/>
               </button>
            </div>            
        </>
    );
}
